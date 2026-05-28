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

namespace ParkingBuilding.CoreApi.Controllers
{
    [Route("api/core/auth")]
    public class AuthController : BaseApiController
    {
        private readonly ParkingDbContext _context;
        private readonly JwtTokenGenerator _jwtTokenGenerator;

        public AuthController(ParkingDbContext context, JwtTokenGenerator jwtTokenGenerator)
        {
            _context = context;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return Fail("Login failed", "Username and password are required.");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower());

            if (user == null)
            {
                return Fail("Login failed", "Incorrect username or password.");
            }

            if (user.Status != UserStatus.ACTIVE)
            {
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
    }
}
