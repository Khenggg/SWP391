using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Domain.Enums;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize(Roles = "ADMIN")]
    [Route("api/core/users")]
    public class UsersController : BaseApiController
    {
        private readonly ParkingDbContext _context;

        public UsersController(ParkingDbContext context)
        {
            _context = context;
        }

        // 1. GET ALL (with query parameters)
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? role,
            [FromQuery] string? status)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var cleanSearch = search.Trim().ToLower();
                query = query.Where(u => 
                    u.FullName.ToLower().Contains(cleanSearch) ||
                    u.Username.ToLower().Contains(cleanSearch) ||
                    (u.Email != null && u.Email.ToLower().Contains(cleanSearch)) ||
                    (u.Phone != null && u.Phone.Contains(cleanSearch))
                );
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                if (Enum.TryParse<UserRole>(role, true, out var parsedRole))
                {
                    query = query.Where(u => u.Role == parsedRole);
                }
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                if (Enum.TryParse<UserStatus>(status, true, out var parsedStatus))
                {
                    query = query.Where(u => u.Status == parsedStatus);
                }
            }

            var list = await query.ToListAsync();
            
            // Map to response to hide password hash
            var result = list.Select(u => new UserResponseDto(u)).ToList();
            return Success(result, "Get users successfully");
        }

        // 2. GET BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return Fail("Not Found", $"User with ID {id} not found.");

            return Success(new UserResponseDto(user), "Get user successfully");
        }

        // 3. CREATE INTERNAL USER
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserDto model)
        {
            if (model == null) return Fail("Bad Request", "Model is required.");
            if (string.IsNullOrWhiteSpace(model.Username)) return Fail("Bad Request", "Username is required.");
            if (string.IsNullOrWhiteSpace(model.Password)) return Fail("Bad Request", "Password is required.");
            if (string.IsNullOrWhiteSpace(model.FullName)) return Fail("Bad Request", "Full name is required.");

            var cleanUsername = model.Username.Trim();

            // Validate uniqueness
            bool isUsernameDuplicate = await _context.Users
                .AnyAsync(u => u.Username.ToLower() == cleanUsername.ToLower());
            if (isUsernameDuplicate)
                return Fail("Conflict", "Username already exists.");

            if (!Enum.TryParse<UserRole>(model.Role, true, out var parsedRole))
            {
                return Fail("Bad Request", $"Invalid role '{model.Role}'. Valid roles are: ADMIN, MANAGER, STAFF, DRIVER");
            }

            // Create new user, encrypt password using BCrypt
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(model.Password);

            var user = new User
            {
                Username = cleanUsername,
                FullName = model.FullName.Trim(),
                Email = model.Email?.Trim(),
                Phone = model.Phone?.Trim(),
                PasswordHash = passwordHash,
                Role = parsedRole,
                Status = UserStatus.ACTIVE,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Success(new UserResponseDto(user), "Create user successfully");
        }

        // 4. UPDATE USER
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateUserDto model)
        {
            if (model == null) return Fail("Bad Request", "Model is required.");

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return Fail("Not Found", "User not found.");

            if (!string.IsNullOrWhiteSpace(model.FullName))
                user.FullName = model.FullName.Trim();

            user.Email = model.Email?.Trim();
            user.Phone = model.Phone?.Trim();

            // If password is provided, re-hash and update
            if (!string.IsNullOrWhiteSpace(model.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password);
            }

            user.UpdatedAt = DateTimeOffset.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Success(new UserResponseDto(user), "Update user successfully");
        }

        // 5. PATCH STATUS
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeStatus(long id, [FromBody] ChangeStatusDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Status))
                return Fail("Bad Request", "Status is required.");

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return Fail("Not Found", "User not found.");

            if (!Enum.TryParse<UserStatus>(model.Status, true, out var parsedStatus))
            {
                return Fail("Bad Request", $"Invalid status '{model.Status}'. Valid statuses are: ACTIVE, LOCKED, INACTIVE");
            }

            user.Status = parsedStatus;
            user.UpdatedAt = DateTimeOffset.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Success(new UserResponseDto(user), "Change status successfully");
        }

        // 6. PATCH ROLE
        [HttpPatch("{id}/role")]
        public async Task<IActionResult> ChangeRole(long id, [FromBody] ChangeRoleDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Role))
                return Fail("Bad Request", "Role is required.");

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return Fail("Not Found", "User not found.");

            if (!Enum.TryParse<UserRole>(model.Role, true, out var parsedRole))
            {
                return Fail("Bad Request", $"Invalid role '{model.Role}'. Valid roles are: ADMIN, MANAGER, STAFF, DRIVER");
            }

            user.Role = parsedRole;
            user.UpdatedAt = DateTimeOffset.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Success(new UserResponseDto(user), "Change role successfully");
        }

        // 7. DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return Fail("Not Found", "User not found.");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Success(true, "Delete user successfully");
        }

        // DTOs
        public class CreateUserDto
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string FullName { get; set; } = string.Empty;
            public string? Email { get; set; }
            public string? Phone { get; set; }
            public string Role { get; set; } = "STAFF";
        }

        public class UpdateUserDto
        {
            public string? FullName { get; set; }
            public string? Email { get; set; }
            public string? Phone { get; set; }
            public string? Password { get; set; }
        }

        public class ChangeStatusDto
        {
            public string Status { get; set; } = string.Empty;
        }

        public class ChangeRoleDto
        {
            public string Role { get; set; } = string.Empty;
        }

        public class UserResponseDto
        {
            public long Id { get; set; }
            public string Username { get; set; }
            public string FullName { get; set; }
            public string? Email { get; set; }
            public string? Phone { get; set; }
            public string Role { get; set; }
            public string Status { get; set; }
            public DateTimeOffset? LastLoginAt { get; set; }
            public DateTimeOffset CreatedAt { get; set; }
            public DateTimeOffset UpdatedAt { get; set; }

            public UserResponseDto(User u)
            {
                Id = u.Id;
                Username = u.Username;
                FullName = u.FullName;
                Email = u.Email;
                Phone = u.Phone;
                Role = u.Role.ToString().ToUpper();
                Status = u.Status.ToString().ToUpper();
                LastLoginAt = u.LastLoginAt;
                CreatedAt = u.CreatedAt;
                UpdatedAt = u.UpdatedAt;
            }
        }
    }
}
