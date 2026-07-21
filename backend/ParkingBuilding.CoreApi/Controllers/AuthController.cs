using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using ParkingBuilding.CoreApi.Contracts.Requests;
using ParkingBuilding.CoreApi.Contracts.Responses;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Domain.Enums;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Infrastructure.Security;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Application.Authentication;
using ParkingBuilding.CoreApi.Contracts.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.IdentityModel.Tokens.Jwt;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Route("api/core/auth")]
    public class AuthController : BaseApiController
    {
        private readonly ParkingDbContext _context;
        private readonly JwtTokenGenerator _jwtTokenGenerator;
        private readonly IAuditWriterService _auditWriterService;
        private readonly IAuthSessionService _authSessionService;
        private readonly ILoginRateLimiter _loginRateLimiter;
        private readonly IDriverRegistrationService _driverRegistrationService;
        private readonly IRegistrationRateLimiter _registrationRateLimiter;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            ParkingDbContext context,
            JwtTokenGenerator jwtTokenGenerator,
            IAuditWriterService auditWriterService,
            IAuthSessionService authSessionService,
            ILoginRateLimiter loginRateLimiter,
            IDriverRegistrationService driverRegistrationService,
            IRegistrationRateLimiter registrationRateLimiter,
            ILogger<AuthController> logger)
        {
            _context = context;
            _jwtTokenGenerator = jwtTokenGenerator;
            _auditWriterService = auditWriterService;
            _authSessionService = authSessionService;
            _loginRateLimiter = loginRateLimiter;
            _driverRegistrationService = driverRegistrationService;
            _registrationRateLimiter = registrationRateLimiter;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest? request)
        {
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            await TryWriteRegistrationAuditAsync(
                "DRIVER_REGISTER_ATTEMPT",
                "Public driver registration request received.");

            if (!_registrationRateLimiter.TryAllow(clientIp))
            {
                await TryWriteRegistrationAuditAsync(
                    "DRIVER_REGISTER_FAILED",
                    ErrorCodes.RateLimitExceeded);

                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.RateLimitExceeded),
                    ErrorCodes.RateLimitExceeded,
                    StatusCodes.Status429TooManyRequests,
                    new[] { ErrorCodes.RateLimitExceeded });
            }

            if (!TryValidateRegistration(request, out var normalizedRequest, out var validationErrors))
            {
                await TryWriteRegistrationAuditAsync(
                    "DRIVER_REGISTER_FAILED",
                    ErrorCodes.ValidationFailed);

                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.ValidationFailed),
                    ErrorCodes.ValidationFailed,
                    StatusCodes.Status400BadRequest,
                    validationErrors);
            }

            try
            {
                var result = await _driverRegistrationService.RegisterAsync(normalizedRequest, clientIp);

                await TryWriteRegistrationAuditAsync(
                    "DRIVER_REGISTERED",
                    "Driver account and profile created successfully.",
                    result.UserId.ToString());

                return CreatedSuccess(new RegisterResponse
                {
                    Id = result.UserId,
                    DriverProfileId = result.DriverProfileId,
                    FullName = result.FullName,
                    Username = result.Username,
                    Email = result.Email,
                    Phone = result.Phone,
                    Role = result.Role,
                    Status = result.Status,
                    CreatedAt = result.CreatedAt
                }, "Driver registered successfully");
            }
            catch (BusinessException exception)
            {
                await TryWriteRegistrationAuditAsync(
                    exception is DriverRegistrationConflictException
                        ? "DRIVER_REGISTER_RACE_CONFLICT"
                        : IsRegistrationDuplicateCode(exception.ErrorCode)
                            ? "DRIVER_REGISTER_DUPLICATE_CONFLICT"
                            : "DRIVER_REGISTER_FAILED",
                    exception.ErrorCode);

                return Failure(
                    ErrorMessages.GetMessage(exception.ErrorCode),
                    exception.ErrorCode,
                    exception.StatusCode,
                    new[] { exception.ErrorCode });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                await _auditWriterService.WriteAuditLogAsync(
                    action: "LOGIN_FAILED",
                    targetType: "users",
                    targetId: "0",
                    reason: "Username and password are required.");

                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.ValidationError),
                    ErrorCodes.ValidationError,
                    StatusCodes.Status400BadRequest,
                    new[] { ErrorCodes.ValidationError });
            }

            var normalizedUsername = request.Username.Trim();
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            if (!_loginRateLimiter.TryAllow(normalizedUsername, clientIp))
            {
                await _auditWriterService.WriteAuditLogAsync(
                    action: "LOGIN_RATE_LIMITED",
                    targetType: "users",
                    targetId: "0",
                    reason: "Login rate limit triggered.");

                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.AuthLoginRateLimited),
                    ErrorCodes.AuthLoginRateLimited,
                    StatusCodes.Status429TooManyRequests,
                    new[] { ErrorCodes.AuthLoginRateLimited });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == normalizedUsername.ToLower());

            if (user == null)
            {
                _loginRateLimiter.RegisterFailure(normalizedUsername, clientIp);
                await _auditWriterService.WriteAuditLogAsync(
                    action: "LOGIN_FAILED",
                    targetType: "users",
                    targetId: "0",
                    reason: "User lookup failed.");

                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.LoginInvalidCredentials),
                    ErrorCodes.LoginInvalidCredentials,
                    StatusCodes.Status401Unauthorized,
                    new[] { ErrorCodes.LoginInvalidCredentials });
            }

            if (user.Status != UserStatus.ACTIVE)
            {
                _loginRateLimiter.RegisterFailure(normalizedUsername, clientIp);
                await _auditWriterService.WriteAuditLogAsync(
                    action: "LOGIN_FAILED",
                    targetType: "users",
                    targetId: user.Id.ToString(),
                    actorUserId: user.Id,
                    reason: $"Inactive user account status: {user.Status.ToString().ToLower()}");

                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.LoginInvalidCredentials),
                    ErrorCodes.LoginInvalidCredentials,
                    StatusCodes.Status401Unauthorized,
                    new[] { ErrorCodes.LoginInvalidCredentials });
            }

            // Verify password using BCrypt
            bool isPasswordCorrect = false;
            try
            {
                isPasswordCorrect = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            }
            catch (Exception)
            {
                isPasswordCorrect = false;
            }

            if (!isPasswordCorrect)
            {
                _loginRateLimiter.RegisterFailure(normalizedUsername, clientIp);
                await _auditWriterService.WriteAuditLogAsync(
                    action: "LOGIN_FAILED",
                    targetType: "users",
                    targetId: user.Id.ToString(),
                    actorUserId: user.Id,
                    reason: "Incorrect password.");

                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.LoginInvalidCredentials),
                    ErrorCodes.LoginInvalidCredentials,
                    StatusCodes.Status401Unauthorized,
                    new[] { ErrorCodes.LoginInvalidCredentials });
            }

            // Update LastLoginAt (optional, but good practice since LastLoginAt exists)
            try
            {
                user.LastLoginAt = DateTimeOffset.UtcNow;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                // Ignore updating login timestamp errors to avoid blocking login flow
            }

            // Write successful login audit log
            _loginRateLimiter.Reset(normalizedUsername, clientIp);
            await _auditWriterService.WriteAuditLogAsync(
                action: "LOGIN_SUCCESS",
                targetType: "users",
                targetId: user.Id.ToString(),
                actorUserId: user.Id,
                reason: "Logged in successfully.");

            var tokenPair = await _authSessionService.CreateSessionAsync(
                user,
                HttpContext.Connection.RemoteIpAddress?.ToString());

            var response = new LoginResponse
            {
                AccessToken = tokenPair.AccessToken,
                TokenType = "Bearer",
                ExpiresIn = tokenPair.ExpiresIn,
                RefreshToken = tokenPair.RefreshToken,
                User = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role.ToString().ToUpper(),
                    FullName = user.FullName,
                    Email = user.Email,
                    Roles = new List<string> { user.Role.ToString().ToUpper() },
                    Status = user.Status.ToString().ToUpper()
                }
            };

            return Success(response, "Login successful.");
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
            {
                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.AuthUserIdMissing),
                    ErrorCodes.AuthUserIdMissing,
                    StatusCodes.Status401Unauthorized,
                    new[] { ErrorCodes.AuthUserIdMissing });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null || user.DeletedAt.HasValue)
            {
                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.AuthUserNotFound),
                    ErrorCodes.AuthUserNotFound,
                    StatusCodes.Status401Unauthorized,
                    new[] { ErrorCodes.AuthUserNotFound });
            }

            if (user.Status != UserStatus.ACTIVE)
            {
                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.AuthUserInactive),
                    ErrorCodes.AuthUserInactive,
                    StatusCodes.Status403Forbidden,
                    new[] { ErrorCodes.AuthUserInactive });
            }

            var response = new CurrentUserResponse
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString().ToUpper(),
                Roles = new List<string> { user.Role.ToString().ToUpper() },
                Status = user.Status.ToString().ToUpper()
            };

            await _auditWriterService.WriteAuditLogAsync(
                action: "AUTH_ME_SUCCESS",
                targetType: "users",
                targetId: user.Id.ToString(),
                actorUserId: user.Id,
                reason: "Current user profile retrieved.");

            return Success(response, "Current user profile retrieved successfully.");
        }

        [AllowAnonymous]
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                var tokenPair = await _authSessionService.RefreshAsync(
                    request?.RefreshToken ?? string.Empty,
                    HttpContext.Connection.RemoteIpAddress?.ToString());

                await _auditWriterService.WriteAuditLogAsync(
                    action: "TOKEN_REFRESH_SUCCESS",
                    targetType: "auth_sessions",
                    targetId: tokenPair.SessionId.ToString(),
                    reason: "Access token refreshed successfully.");

                return Success(new RefreshTokenResponse
                {
                    AccessToken = tokenPair.AccessToken,
                    ExpiresIn = tokenPair.ExpiresIn,
                    RefreshToken = tokenPair.RefreshToken
                }, "Token refreshed successfully.");
            }
            catch (BusinessException exception)
            {
                await _auditWriterService.WriteAuditLogAsync(
                    action: exception.ErrorCode == ErrorCodes.AuthRefreshTokenInvalid
                        ? "TOKEN_REFRESH_FAILED"
                        : "TOKEN_REFRESH_REJECTED",
                    targetType: "auth_sessions",
                    targetId: "0",
                    reason: exception.ErrorCode);

                return Failure(
                    ErrorMessages.GetMessage(exception.ErrorCode),
                    exception.ErrorCode,
                    exception.StatusCode,
                    new[] { exception.ErrorCode });
            }
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.Unauthorized),
                    ErrorCodes.Unauthorized,
                    StatusCodes.Status401Unauthorized,
                    new[] { ErrorCodes.Unauthorized });
            }

            var sessionId = Guid.TryParse(User.FindFirst(JwtRegisteredClaimNames.Sid)?.Value, out var parsedSessionId)
                ? parsedSessionId
                : (Guid?)null;
            var jwtId = User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
            var accessTokenExpiresAt = GetAccessTokenExpiry();

            await _authSessionService.RevokeCurrentSessionAsync(
                userId,
                sessionId,
                jwtId,
                accessTokenExpiresAt,
                HttpContext.Connection.RemoteIpAddress?.ToString());

            await _auditWriterService.WriteAuditLogAsync(
                action: "LOGOUT_SUCCESS",
                targetType: "auth_sessions",
                targetId: sessionId?.ToString() ?? "0",
                actorUserId: userId,
                reason: "Current authentication session revoked.");

            return Success("Session terminated successfully.");
        }

        private DateTimeOffset GetAccessTokenExpiry()
        {
            var expiryClaim = User.FindFirst(JwtRegisteredClaimNames.Exp)?.Value;
            return long.TryParse(expiryClaim, out var unixSeconds)
                ? DateTimeOffset.FromUnixTimeSeconds(unixSeconds)
                : DateTimeOffset.UtcNow.AddSeconds(_jwtTokenGenerator.GetExpirationSeconds());
        }

        private static bool TryValidateRegistration(
            RegisterRequest? request,
            out RegisterRequest normalizedRequest,
            out List<string> errors)
        {
            errors = new List<string>();
            normalizedRequest = new RegisterRequest();

            if (request == null)
            {
                errors.Add("request: Registration data is required.");
                return false;
            }

            var fullName = request.FullName?.Trim() ?? string.Empty;
            var username = request.Username?.Trim() ?? string.Empty;
            var email = request.Email?.Trim() ?? string.Empty;
            var phone = NormalizeVietnamesePhone(request.Phone);
            var password = request.Password ?? string.Empty;
            var confirmPassword = request.ConfirmPassword ?? string.Empty;

            if (string.IsNullOrWhiteSpace(fullName) || fullName.Length > 150)
                errors.Add("fullName: Full name is required and must not exceed 150 characters.");

            if (!UsernamePolicy.IsValid(username))
                errors.Add("username: " + UsernamePolicy.ValidationMessage);

            if (string.IsNullOrWhiteSpace(email) || email.Length > 150 ||
                !Regex.IsMatch(email, "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$"))
                errors.Add("email: Email format is invalid.");

            if (phone == null)
                errors.Add("phone: Vietnamese phone format is invalid.");

            if (string.IsNullOrWhiteSpace(password) || password.Length > 100 ||
                !Regex.IsMatch(password, "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,100}$"))
                errors.Add("password: Password must be at least 8 characters and contain uppercase, lowercase, and digit.");

            if (string.IsNullOrWhiteSpace(confirmPassword) || !string.Equals(password, confirmPassword, StringComparison.Ordinal))
                errors.Add("confirmPassword: " + ErrorMessages.GetMessage(ErrorCodes.PasswordConfirmationNotMatch));

            if (errors.Count > 0)
                return false;

            normalizedRequest = new RegisterRequest
            {
                FullName = fullName,
                Username = UsernamePolicy.Normalize(username),
                Email = email.ToLowerInvariant(),
                Phone = phone,
                Password = password,
                ConfirmPassword = confirmPassword
            };
            return true;
        }

        private static string? NormalizeVietnamesePhone(string? rawPhone)
        {
            if (string.IsNullOrWhiteSpace(rawPhone) || rawPhone.Length > 30)
                return null;

            var compact = Regex.Replace(rawPhone.Trim(), "[\\s().-]", string.Empty);
            if (!Regex.IsMatch(compact, "^\\+?\\d+$"))
                return null;

            var digits = compact.StartsWith("+") ? compact[1..] : compact;
            if (digits.StartsWith("84"))
                digits = "0" + digits[2..];

            return Regex.IsMatch(digits, "^0(3|5|7|8|9)\\d{8}$")
                ? digits
                : null;
        }

        private static bool IsRegistrationDuplicateCode(string errorCode)
            => errorCode is ErrorCodes.UsernameAlreadyExists
                or ErrorCodes.EmailAlreadyExists
                or ErrorCodes.PhoneAlreadyExists;

        private async Task TryWriteRegistrationAuditAsync(string action, string reason, string targetId = "0")
        {
            try
            {
                await _auditWriterService.WriteAuditLogAsync(
                    action: action,
                    targetType: "users",
                    targetId: targetId,
                    reason: reason);
            }
            catch (Exception exception)
            {
                _logger.LogWarning(exception, "Could not write driver registration audit event {Action}.", action);
            }
        }
    }
}
