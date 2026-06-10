using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Contracts.Requests;
using ParkingBuilding.CoreApi.Contracts.Responses;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Domain.Enums;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize(Roles = "ADMIN")]
    [Route("api/core/users")]
    public class UsersController : BaseApiController
    {
        private readonly ParkingDbContext _context;
        private readonly IAuditWriterService _auditWriterService;

        public UsersController(ParkingDbContext context, IAuditWriterService auditWriterService)
        {
            _context = context;
            _auditWriterService = auditWriterService;
        }

        /// <summary>
        /// Admin list and search users (paginated).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetUsers(
            [FromQuery] string? search,
            [FromQuery] UserRole? role,
            [FromQuery] UserStatus? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var query = _context.Users.Where(u => u.Status != UserStatus.INACTIVE).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(u =>
                    u.Username.ToLower().Contains(s) ||
                    u.FullName.ToLower().Contains(s) ||
                    (u.Email != null && u.Email.ToLower().Contains(s)) ||
                    (u.Phone != null && u.Phone.ToLower().Contains(s)));
            }

            if (role.HasValue)
            {
                query = query.Where(u => u.Role == role.Value);
            }

            if (status.HasValue)
            {
                query = query.Where(u => u.Status == status.Value);
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    Role = u.Role.ToString().ToUpper(),
                    Status = u.Status.ToString().ToUpper(),
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                })
                .ToListAsync();

            var pagedResponse = new PagedResponse<UserDto>(items, totalCount, page, pageSize);
            return Success(pagedResponse, "Users retrieved successfully.");
        }

        /// <summary>
        /// Admin get single user details.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById([FromRoute] long id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.Status != UserStatus.INACTIVE);

            if (user == null)
            {
                return StatusCodeResponse(404, "User not found", $"No active user with ID {id} was found.");
            }

            return Success(ToUserDto(user), "User details retrieved successfully.");
        }

        /// <summary>
        /// Admin create a new internal user (ADMIN, MANAGER, STAFF).
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (request == null)
            {
                return Fail("Creation failed", "Request payload cannot be empty.");
            }

            if (request.Role == UserRole.DRIVER)
            {
                return Fail("Creation failed", "Admin cannot manually create DRIVER users using this endpoint.");
            }

            // Check duplicate username
            var usernameExists = await _context.Users
                .AnyAsync(u => u.Username.ToLower() == request.Username.ToLower());
            if (usernameExists)
            {
                return Fail("Username already exists", $"The username '{request.Username}' is already taken.");
            }

            // Check duplicate email
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var emailExists = await _context.Users
                    .AnyAsync(u => u.Email != null && u.Email.ToLower() == request.Email.ToLower());
                if (emailExists)
                {
                    return Fail("Email already exists", $"The email '{request.Email}' is already registered.");
                }
            }

            var actorUserId = GetCurrentUserId();

            var newUser = new User
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                Email = request.Email,
                Phone = request.Phone,
                Role = request.Role,
                Status = UserStatus.ACTIVE,
                // CreatedBy = actorUserId,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            var userDto = ToUserDto(newUser);
            var serializedUser = System.Text.Json.JsonSerializer.Serialize(userDto);

            await _auditWriterService.WriteAuditLogAsync(
                action: "USER_CREATED",
                targetType: "users",
                targetId: newUser.Id.ToString(),
                actorUserId: actorUserId,
                newValue: serializedUser,
                reason: $"Internal user '{newUser.Username}' with role '{newUser.Role}' created by Admin."
            );

            return Success(userDto, "User created successfully.");
        }

        /// <summary>
        /// Admin update user basic info.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser([FromRoute] long id, [FromBody] UpdateUserRequest request)
        {
            if (request == null)
            {
                return Fail("Update failed", "Request payload cannot be empty.");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return StatusCodeResponse(404, "User not found", $"No active user with ID {id} was found.");
            }

            // Check duplicate email if modified
            if (!string.IsNullOrWhiteSpace(request.Email) &&
                (user.Email == null || user.Email.ToLower() != request.Email.ToLower()))
            {
                var emailExists = await _context.Users
                    .AnyAsync(u => u.Id != id && u.Email != null && u.Email.ToLower() == request.Email.ToLower());
                if (emailExists)
                {
                    return Fail("Email already exists", $"The email '{request.Email}' is already registered.");
                }
            }

            var actorUserId = GetCurrentUserId();
            var oldUserDto = ToUserDto(user);
            var serializedOld = System.Text.Json.JsonSerializer.Serialize(oldUserDto);

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.Phone = request.Phone;
            user.UpdatedAt = DateTimeOffset.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            var newUserDto = ToUserDto(user);
            var serializedNew = System.Text.Json.JsonSerializer.Serialize(newUserDto);

            await _auditWriterService.WriteAuditLogAsync(
                action: "USER_UPDATED",
                targetType: "users",
                targetId: user.Id.ToString(),
                actorUserId: actorUserId,
                oldValue: serializedOld,
                newValue: serializedNew,
                reason: "User basic details updated by Admin."
            );

            return Success(newUserDto, "User details updated successfully.");
        }

        /// <summary>
        /// Admin update user role (ADMIN, MANAGER, STAFF).
        /// </summary>
        [HttpPut("{id}/role")]
        public async Task<IActionResult> ChangeRole([FromRoute] long id, [FromBody] ChangeRoleRequest request)
        {
            if (request == null)
            {
                return Fail("Role change failed", "Request payload cannot be empty.");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return StatusCodeResponse(404, "User not found", $"No active user with ID {id} was found.");
            }

            if (user.Role == UserRole.DRIVER || request.Role == UserRole.DRIVER)
            {
                return Fail("Role change failed", "Cannot change role to or from DRIVER via this admin endpoint.");
            }

            var actorUserId = GetCurrentUserId();
            if (user.Id == actorUserId)
            {
                return Fail("Role change failed", "You cannot change your own role to prevent lockout.");
            }

            var oldRole = user.Role.ToString().ToUpper();
            user.Role = request.Role;
            user.UpdatedAt = DateTimeOffset.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            await _auditWriterService.WriteAuditLogAsync(
                action: "USER_ROLE_CHANGED",
                targetType: "users",
                targetId: user.Id.ToString(),
                actorUserId: actorUserId,
                oldValue: System.Text.Json.JsonSerializer.Serialize(oldRole),
                newValue: System.Text.Json.JsonSerializer.Serialize(request.Role.ToString().ToUpper()),
                reason: $"Role changed from {oldRole} to {request.Role.ToString().ToUpper()} by Admin."
            );

            return Success(ToUserDto(user), "User role updated successfully.");
        }

        /// <summary>
        /// Admin update user status (ACTIVE, LOCKED, INACTIVE).
        /// </summary>
        [HttpPut("{id}/status")]
        public async Task<IActionResult> ChangeStatus([FromRoute] long id, [FromBody] ChangeStatusRequest request)
        {
            if (request == null)
            {
                return Fail("Status change failed", "Request payload cannot be empty.");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return StatusCodeResponse(404, "User not found", $"No active user with ID {id} was found.");
            }

            var actorUserId = GetCurrentUserId();
            if (user.Id == actorUserId)
            {
                return Fail("Status change failed", "You cannot change the status of your own account.");
            }

            var oldStatus = user.Status.ToString().ToUpper();
            user.Status = request.Status;
            user.UpdatedAt = DateTimeOffset.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            await _auditWriterService.WriteAuditLogAsync(
                action: "USER_STATUS_CHANGED",
                targetType: "users",
                targetId: user.Id.ToString(),
                actorUserId: actorUserId,
                oldValue: System.Text.Json.JsonSerializer.Serialize(oldStatus),
                newValue: System.Text.Json.JsonSerializer.Serialize(request.Status.ToString().ToUpper()),
                reason: $"User status changed from {oldStatus} to {request.Status.ToString().ToUpper()} by Admin."
            );

            return Success(ToUserDto(user), $"User status updated to {request.Status.ToString().ToUpper()} successfully.");
        }

        /// <summary>
        /// Admin soft delete an internal user.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser([FromRoute] long id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.Status != UserStatus.INACTIVE);

            if (user == null)
            {
                return StatusCodeResponse(404, "User not found", $"No active user with ID {id} was found.");
            }

            var actorUserId = GetCurrentUserId();
            if (user.Id == actorUserId)
            {
                return Fail("Deletion failed", "You cannot delete your own account.");
            }

            user.Status = UserStatus.INACTIVE;
            user.UpdatedAt = DateTimeOffset.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            await _auditWriterService.WriteAuditLogAsync(
                action: "USER_DELETED",
                targetType: "users",
                targetId: user.Id.ToString(),
                actorUserId: actorUserId,
                oldValue: System.Text.Json.JsonSerializer.Serialize("ACTIVE"),
                newValue: System.Text.Json.JsonSerializer.Serialize("INACTIVE"),
                reason: $"User '{user.Username}' soft-deleted (status set to INACTIVE) by Admin."
            );

            return Success("User deleted successfully.");
        }

        private long? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (long.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            return null;
        }

        private static UserDto ToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role.ToString().ToUpper(),
                Status = user.Status.ToString().ToUpper(),
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }

    }
}
