using System;
using System.Collections.Generic;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Domain.Enums;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Controllers;

[Authorize(Roles = "ADMIN")]
[Route("api/core/users")]
public class UsersController : BaseApiController
{
    private readonly ParkingDbContext _context;
    private readonly IAuditWriterService _auditWriter;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        ParkingDbContext context,
        IAuditWriterService auditWriter,
        ILogger<UsersController> logger)
    {
        _context = context;
        _auditWriter = auditWriter;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? keyword,
        [FromQuery] string? role,
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            return Failure(
                ErrorMessages.GetMessage(ErrorCodes.ValidationFailed),
                ErrorCodes.ValidationFailed,
                StatusCodes.Status400BadRequest,
                new[] { "page: Page must be at least 1.", "pageSize: Page size must be between 1 and 100." });
        }

        var query = _context.Users
            .Where(user => !user.DeletedAt.HasValue)
            .AsQueryable();

        var cleanKeyword = (keyword ?? search)?.Trim().ToLower();
        if (!string.IsNullOrWhiteSpace(cleanKeyword))
        {
            query = query.Where(user =>
                user.FullName.ToLower().Contains(cleanKeyword) ||
                user.Username.ToLower().Contains(cleanKeyword) ||
                (user.Email != null && user.Email.ToLower().Contains(cleanKeyword)) ||
                (user.Phone != null && user.Phone.Contains(cleanKeyword)));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            if (!Enum.TryParse<UserRole>(role.Trim(), true, out var parsedRole))
            {
                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.InvalidUserRole),
                    ErrorCodes.InvalidUserRole,
                    StatusCodes.Status400BadRequest,
                    new[] { ErrorCodes.InvalidUserRole });
            }

            query = query.Where(user => user.Role == parsedRole);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<UserStatus>(status.Trim(), true, out var parsedStatus))
            {
                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.InvalidUserStatus),
                    ErrorCodes.InvalidUserStatus,
                    StatusCodes.Status400BadRequest,
                    new[] { ErrorCodes.InvalidUserStatus });
            }

            query = query.Where(user => user.Status == parsedStatus);
        }

        var totalItems = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
        var rawItems = await query
            .OrderBy(user => user.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(user => new
            {
                Id = user.Id,
                FullName = user.FullName,
                Username = user.Username,
                Email = user.Email,
                Phone = user.Phone,
                user.Role,
                user.Status,
                CreatedAt = user.CreatedAt
            })
            .ToListAsync();

        var items = rawItems.Select(user => new UserListItemDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Username = user.Username,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role.ToString().ToUpper(),
            Status = user.Status.ToString().ToUpper(),
            CreatedAt = user.CreatedAt
        }).ToList();

        return Success(new
        {
            items,
            page,
            pageSize,
            totalItems,
            totalPages
        }, "Get users successfully");
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id && !item.DeletedAt.HasValue);

        if (user == null)
        {
            return Failure(
                ErrorMessages.GetMessage(ErrorCodes.UserNotFound),
                ErrorCodes.UserNotFound,
                StatusCodes.Status404NotFound,
                new[] { ErrorCodes.UserNotFound });
        }

        return Success(ToDetailResponse(user), "Get user successfully");
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto? model)
    {
        if (model == null)
            return ValidationFailure(new[] { "request: User data is required." });

        var errors = new List<string>();
        var fullName = model.FullName?.Trim() ?? string.Empty;
        var username = UsernamePolicy.Normalize(model.Username);
        var password = model.Password ?? string.Empty;
        var roleText = model.Role?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(fullName) || fullName.Length > 150)
            errors.Add("fullName: Full name is required and must not exceed 150 characters.");

        if (!UsernamePolicy.IsValid(username))
            errors.Add("username: " + UsernamePolicy.ValidationMessage);

        if (!TryNormalizeOptionalEmail(model.Email, out var email))
            errors.Add("email: Email format is invalid and must not exceed 150 characters.");

        if (!TryNormalizeOptionalPhone(model.Phone, out var phone))
            errors.Add("phone: Vietnamese phone format is invalid.");

        if (!Regex.IsMatch(password, "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,100}$"))
            errors.Add("password: Password must be at least 8 characters and contain uppercase, lowercase, and digit.");

        if (!Enum.TryParse<UserRole>(roleText, true, out var parsedRole)
            || parsedRole == UserRole.DRIVER)
        {
            errors.Add("role: " + ErrorMessages.GetMessage(ErrorCodes.InvalidUserRole));
        }

        if (errors.Count > 0)
            return ValidationFailure(errors);

        if (await _context.Users.AnyAsync(user => user.Username.ToLower() == username))
            return await DuplicateFailureAsync(ErrorCodes.UsernameAlreadyExists, "USER_CREATE_DUPLICATE_CONFLICT");

        if (email != null && await _context.Users.AnyAsync(user => user.Email != null && user.Email.ToLower() == email))
            return await DuplicateFailureAsync(ErrorCodes.EmailAlreadyExists, "USER_CREATE_DUPLICATE_CONFLICT");

        if (phone != null && await _context.Users.AnyAsync(user => user.Phone == phone))
            return await DuplicateFailureAsync(ErrorCodes.PhoneAlreadyExists, "USER_CREATE_DUPLICATE_CONFLICT");

        var now = DateTimeOffset.UtcNow;
        var user = new User
        {
            Username = username,
            FullName = fullName,
            Email = email,
            Phone = phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = parsedRole,
            Status = UserStatus.ACTIVE,
            CreatedAt = now,
            UpdatedAt = now
        };

        try
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException exception)
        {
            var duplicateCode = TryGetDuplicateErrorCode(exception);
            if (duplicateCode == null)
                throw;

            _context.Entry(user).State = EntityState.Detached;
            await WriteAuditAsync(
                "USER_CREATE_RACE_CONFLICT",
                user.Id.ToString(),
                reason: duplicateCode);

            return Failure(
                ErrorMessages.GetMessage(duplicateCode),
                duplicateCode,
                StatusCodes.Status409Conflict,
                new[] { duplicateCode });
        }

        await WriteAuditAsync(
            "USER_CREATED",
            user.Id.ToString(),
            newValue: JsonSerializer.Serialize(new
            {
                user.Id,
                user.Username,
                user.FullName,
                user.Email,
                user.Phone,
                role = user.Role.ToString().ToUpper(),
                status = user.Status.ToString().ToUpper()
            }));

        return CreatedSuccess(ToCreatedResponse(user), "User created successfully");
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateUserDto? model)
    {
        if (model == null)
            return ValidationFailure(new[] { "request: User data is required." });

        var user = await _context.Users.FirstOrDefaultAsync(item => item.Id == id && !item.DeletedAt.HasValue);
        if (user == null)
            return UserNotFoundFailure();

        var errors = new List<string>();
        var fullName = model.FullName?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(fullName) || fullName.Length > 150)
            errors.Add("fullName: Full name is required and must not exceed 150 characters.");

        if (!TryNormalizeOptionalEmail(model.Email, out var email))
            errors.Add("email: Email format is invalid and must not exceed 150 characters.");

        if (!TryNormalizeOptionalPhone(model.Phone, out var phone))
            errors.Add("phone: Vietnamese phone format is invalid.");

        if (errors.Count > 0)
            return ValidationFailure(errors);

        if (email != null && await _context.Users.AnyAsync(item => item.Id != id && item.Email != null && item.Email.ToLower() == email))
            return await DuplicateFailureAsync(ErrorCodes.EmailAlreadyExists, "USER_UPDATE_DUPLICATE_CONFLICT", id.ToString());

        if (phone != null && await _context.Users.AnyAsync(item => item.Id != id && item.Phone == phone))
            return await DuplicateFailureAsync(ErrorCodes.PhoneAlreadyExists, "USER_UPDATE_DUPLICATE_CONFLICT", id.ToString());

        var oldValue = JsonSerializer.Serialize(new
        {
            user.FullName,
            user.Email,
            user.Phone
        });

        user.FullName = fullName;
        user.Email = email;
        user.Phone = phone;
        user.UpdatedAt = DateTimeOffset.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException exception)
        {
            var duplicateCode = TryGetDuplicateErrorCode(exception);
            if (duplicateCode == null)
                throw;

            _context.Entry(user).State = EntityState.Detached;
            await WriteAuditAsync("USER_UPDATE_RACE_CONFLICT", id.ToString(), reason: duplicateCode);
            return Failure(
                ErrorMessages.GetMessage(duplicateCode),
                duplicateCode,
                StatusCodes.Status409Conflict,
                new[] { duplicateCode });
        }

        await WriteAuditAsync(
            "USER_UPDATED",
            user.Id.ToString(),
            oldValue,
            JsonSerializer.Serialize(new
            {
                user.FullName,
                user.Email,
                user.Phone
            }));

        return Success(ToDetailResponse(user), "User updated successfully");
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ChangeStatus(long id, [FromBody] ChangeStatusDto? model)
    {
        if (model == null || string.IsNullOrWhiteSpace(model.Status))
            return ValidationFailure(new[] { ErrorCodes.InvalidUserStatus });

        if (string.IsNullOrWhiteSpace(model.Reason))
            return Failure(
                ErrorMessages.GetMessage(ErrorCodes.ReasonRequired),
                ErrorCodes.ReasonRequired,
                StatusCodes.Status400BadRequest,
                new[] { ErrorCodes.ReasonRequired });

        if (!Enum.TryParse<UserStatus>(model.Status.Trim(), true, out var parsedStatus))
            return Failure(
                ErrorMessages.GetMessage(ErrorCodes.InvalidUserStatus),
                ErrorCodes.InvalidUserStatus,
                StatusCodes.Status400BadRequest,
                new[] { ErrorCodes.InvalidUserStatus });

        var reason = model.Reason.Trim();
        if (reason.Length > 500)
            return ValidationFailure(new[] { "reason: Reason must not exceed 500 characters." });

        await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var user = await _context.Users.FirstOrDefaultAsync(item => item.Id == id && !item.DeletedAt.HasValue);
        if (user == null)
            return UserNotFoundFailure();

        var actorUserId = GetActorUserId();
        if (actorUserId == user.Id && parsedStatus != UserStatus.ACTIVE)
        {
            await transaction.RollbackAsync();
            await WriteAuditAsync("USER_SELF_PROTECTION_BLOCKED", id.ToString(), reason: ErrorCodes.CannotChangeOwnStatus);
            return ConflictFailure(ErrorCodes.CannotChangeOwnStatus);
        }

        if (user.Role == UserRole.ADMIN
            && user.Status == UserStatus.ACTIVE
            && parsedStatus != UserStatus.ACTIVE
            && !await HasAnotherActiveAdminAsync(user.Id))
        {
            await transaction.RollbackAsync();
            await WriteAuditAsync("USER_LAST_ADMIN_PROTECTION_BLOCKED", id.ToString(), reason: ErrorCodes.CannotDisableLastAdmin);
            return ConflictFailure(ErrorCodes.CannotDisableLastAdmin);
        }

        var oldStatus = user.Status.ToString().ToUpper();
        user.Status = parsedStatus;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        await WriteAuditAsync(
            "USER_STATUS_CHANGED",
            user.Id.ToString(),
            JsonSerializer.Serialize(new { status = oldStatus }),
            JsonSerializer.Serialize(new { status = user.Status.ToString().ToUpper(), reason }));

        return Success(new
        {
            id = user.Id,
            fullName = user.FullName,
            username = user.Username,
            role = user.Role.ToString().ToUpper(),
            oldStatus,
            newStatus = user.Status.ToString().ToUpper(),
            reason,
            updatedAt = user.UpdatedAt
        }, "User status changed successfully");
    }

    [HttpPatch("{id}/role")]
    public async Task<IActionResult> ChangeRole(long id, [FromBody] ChangeRoleDto? model)
    {
        if (model == null || string.IsNullOrWhiteSpace(model.Role))
            return ValidationFailure(new[] { ErrorCodes.InvalidUserRole });

        if (string.IsNullOrWhiteSpace(model.Reason))
            return Failure(
                ErrorMessages.GetMessage(ErrorCodes.ReasonRequired),
                ErrorCodes.ReasonRequired,
                StatusCodes.Status400BadRequest,
                new[] { ErrorCodes.ReasonRequired });

        if (!Enum.TryParse<UserRole>(model.Role.Trim(), true, out var parsedRole)
            || parsedRole == UserRole.DRIVER)
        {
            return Failure(
                ErrorMessages.GetMessage(ErrorCodes.InvalidUserRole),
                ErrorCodes.InvalidUserRole,
                StatusCodes.Status400BadRequest,
                new[] { ErrorCodes.InvalidUserRole });
        }

        var reason = model.Reason.Trim();
        if (reason.Length > 500)
            return ValidationFailure(new[] { "reason: Reason must not exceed 500 characters." });

        await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var user = await _context.Users.FirstOrDefaultAsync(item => item.Id == id && !item.DeletedAt.HasValue);
        if (user == null)
            return UserNotFoundFailure();

        var actorUserId = GetActorUserId();
        if (actorUserId == user.Id && user.Role == UserRole.ADMIN && parsedRole != UserRole.ADMIN)
        {
            await transaction.RollbackAsync();
            await WriteAuditAsync("USER_SELF_PROTECTION_BLOCKED", id.ToString(), reason: ErrorCodes.CannotChangeOwnRole);
            return ConflictFailure(ErrorCodes.CannotChangeOwnRole);
        }

        if (user.Role == UserRole.ADMIN
            && user.Status == UserStatus.ACTIVE
            && parsedRole != UserRole.ADMIN
            && !await HasAnotherActiveAdminAsync(user.Id))
        {
            await transaction.RollbackAsync();
            await WriteAuditAsync("USER_LAST_ADMIN_PROTECTION_BLOCKED", id.ToString(), reason: ErrorCodes.CannotDemoteLastAdmin);
            return ConflictFailure(ErrorCodes.CannotDemoteLastAdmin);
        }

        var oldRole = user.Role.ToString().ToUpper();
        user.Role = parsedRole;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        await WriteAuditAsync(
            "USER_ROLE_CHANGED",
            user.Id.ToString(),
            JsonSerializer.Serialize(new { role = oldRole }),
            JsonSerializer.Serialize(new { role = user.Role.ToString().ToUpper(), reason }));

        return Success(new
        {
            id = user.Id,
            fullName = user.FullName,
            username = user.Username,
            oldRole,
            newRole = user.Role.ToString().ToUpper(),
            reason,
            updatedAt = user.UpdatedAt
        }, "User role changed successfully");
    }

    // This remains a soft-delete operation; no hard delete is performed.
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(item => item.Id == id && !item.DeletedAt.HasValue);
        if (user == null)
            return UserNotFoundFailure();

        user.DeletedAt = DateTimeOffset.UtcNow;
        user.Status = UserStatus.INACTIVE;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync();

        return Success(true, "Delete user successfully");
    }

    private async Task<bool> HasAnotherActiveAdminAsync(long excludedUserId)
        => await _context.Users.AnyAsync(item =>
            item.Id != excludedUserId
            && !item.DeletedAt.HasValue
            && item.Role == UserRole.ADMIN
            && item.Status == UserStatus.ACTIVE);

    private long? GetActorUserId()
    {
        var claim = User.FindFirst("user_id")?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return long.TryParse(claim, out var userId) ? userId : null;
    }

    private async Task<IActionResult> DuplicateFailureAsync(
        string errorCode,
        string auditAction,
        string targetId = "0")
    {
        await WriteAuditAsync(auditAction, targetId, reason: errorCode);
        return ConflictFailure(errorCode);
    }

    private IActionResult UserNotFoundFailure()
        => Failure(
            ErrorMessages.GetMessage(ErrorCodes.UserNotFound),
            ErrorCodes.UserNotFound,
            StatusCodes.Status404NotFound,
            new[] { ErrorCodes.UserNotFound });

    private IActionResult ConflictFailure(string errorCode)
        => Failure(
            ErrorMessages.GetMessage(errorCode),
            errorCode,
            StatusCodes.Status409Conflict,
            new[] { errorCode });

    private IActionResult ValidationFailure(IEnumerable<string> errors)
        => Failure(
            ErrorMessages.GetMessage(ErrorCodes.ValidationFailed),
            ErrorCodes.ValidationFailed,
            StatusCodes.Status400BadRequest,
            errors);

    private async Task WriteAuditAsync(
        string action,
        string targetId,
        string? oldValue = null,
        string? newValue = null,
        string? reason = null)
    {
        try
        {
            await _auditWriter.WriteAuditLogAsync(
                action: action,
                targetType: "users",
                targetId: targetId,
                oldValue: oldValue,
                newValue: newValue,
                reason: reason);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Could not write user management audit event {Action}.", action);
        }
    }

    private static bool TryNormalizeOptionalEmail(string? rawEmail, out string? normalizedEmail)
    {
        normalizedEmail = null;
        if (string.IsNullOrWhiteSpace(rawEmail))
            return true;

        var email = rawEmail.Trim();
        if (email.Length > 150 || !Regex.IsMatch(email, "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$"))
            return false;

        normalizedEmail = email.ToLowerInvariant();
        return true;
    }

    private static bool TryNormalizeOptionalPhone(string? rawPhone, out string? normalizedPhone)
    {
        normalizedPhone = null;
        if (string.IsNullOrWhiteSpace(rawPhone))
            return true;

        if (rawPhone.Length > 30)
            return false;

        var compact = Regex.Replace(rawPhone.Trim(), "[\\s().-]", string.Empty);
        if (!Regex.IsMatch(compact, "^\\+?\\d+$"))
            return false;

        var digits = compact.StartsWith("+") ? compact[1..] : compact;
        if (digits.StartsWith("84"))
            digits = "0" + digits[2..];

        if (!Regex.IsMatch(digits, "^0(3|5|7|8|9)\\d{8}$"))
            return false;

        normalizedPhone = digits;
        return true;
    }

    private static string? TryGetDuplicateErrorCode(DbUpdateException exception)
    {
        var postgresException = exception.InnerException as PostgresException
            ?? exception.InnerException?.InnerException as PostgresException;

        return postgresException?.ConstraintName switch
        {
            "ux_users_username_lower" or "ux_users_username" or "users_username_key" => ErrorCodes.UsernameAlreadyExists,
            "ux_users_email_lower" or "ux_users_email" or "users_email_key" => ErrorCodes.EmailAlreadyExists,
            "ux_users_phone" or "users_phone_key" => ErrorCodes.PhoneAlreadyExists,
            _ => null
        };
    }

    private static UserDetailResponseDto ToDetailResponse(User user)
        => new()
        {
            Id = user.Id,
            FullName = user.FullName,
            Username = user.Username,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role.ToString().ToUpper(),
            Status = user.Status.ToString().ToUpper(),
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };

    private static UserCreatedResponseDto ToCreatedResponse(User user)
        => new()
        {
            Id = user.Id,
            FullName = user.FullName,
            Username = user.Username,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role.ToString().ToUpper(),
            Status = user.Status.ToString().ToUpper(),
            CreatedAt = user.CreatedAt
        };

    public sealed class CreateUserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string Role { get; set; } = "STAFF";
    }

    public sealed class UpdateUserDto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
    }

    public sealed class ChangeStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public string? Reason { get; set; }
    }

    public sealed class ChangeRoleDto
    {
        public string Role { get; set; } = string.Empty;
        public string? Reason { get; set; }
    }

    public class UserListItemDto
    {
        public long Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
    }

    public sealed class UserCreatedResponseDto : UserListItemDto
    {
    }

    public sealed class UserDetailResponseDto : UserListItemDto
    {
        public DateTimeOffset UpdatedAt { get; set; }
    }
}
