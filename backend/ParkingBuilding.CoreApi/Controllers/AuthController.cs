using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

namespace ParkingBuilding.CoreApi.Controllers
{
    [Route("api/core/auth")]
    public class AuthController : BaseApiController
    {
        private readonly ParkingDbContext _context;
        private readonly JwtTokenGenerator _jwtTokenGenerator;
        private readonly IAuditWriterService _auditWriterService;

        public AuthController(
            ParkingDbContext context,
            JwtTokenGenerator jwtTokenGenerator,
            IAuditWriterService auditWriterService)
        {
            _context = context;
            _jwtTokenGenerator = jwtTokenGenerator;
            _auditWriterService = auditWriterService;
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

                return Fail("Login failed", "Username and password are required.");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower());

            if (user == null)
            {
                await _auditWriterService.WriteAuditLogAsync(
                    action: "LOGIN_FAILED",
                    targetType: "users",
                    targetId: "0",
                    reason: $"User '{request.Username}' not found.");

                return Fail("Login failed", "Incorrect username or password.");
            }

            if (user.Status != UserStatus.ACTIVE)
            {
                await _auditWriterService.WriteAuditLogAsync(
                    action: "LOGIN_FAILED",
                    targetType: "users",
                    targetId: user.Id.ToString(),
                    actorUserId: user.Id,
                    reason: $"Inactive user account status: {user.Status.ToString().ToLower()}");

                return Fail("Login failed", $"User account is {user.Status.ToString().ToLower()}.");
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
                await _auditWriterService.WriteAuditLogAsync(
                    action: "LOGIN_FAILED",
                    targetType: "users",
                    targetId: user.Id.ToString(),
                    actorUserId: user.Id,
                    reason: "Incorrect password.");

                return Fail("Login failed", "Incorrect username or password.");
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
            await _auditWriterService.WriteAuditLogAsync(
                action: "LOGIN_SUCCESS",
                targetType: "users",
                targetId: user.Id.ToString(),
                actorUserId: user.Id,
                reason: "Logged in successfully.");

            // Generate token
            var token = _jwtTokenGenerator.GenerateToken(user);
            var expiresInSeconds = _jwtTokenGenerator.GetExpirationSeconds();

            var response = new LoginResponse
            {
                AccessToken = token,
                TokenType = "Bearer",
                ExpiresIn = expiresInSeconds,
                User = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role.ToString().ToUpper(),
                    FullName = user.FullName
                }
            };

            return Success(response, "Login successfully");
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
            {
                return StatusCodeResponse(401, "Unauthorized", "User ID is invalid or missing in token.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return StatusCodeResponse(401, "Unauthorized", "User not found.");
            }

            if (user.Status != UserStatus.ACTIVE)
            {
                return StatusCodeResponse(401, "Unauthorized", $"User account is {user.Status.ToString().ToLower()}.");
            }

            var response = new CurrentUserResponse
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString().ToUpper(),
                Status = user.Status.ToString().ToUpper()
            };

            return Success(response, "Get current user profile successfully");
        }
    }
}
