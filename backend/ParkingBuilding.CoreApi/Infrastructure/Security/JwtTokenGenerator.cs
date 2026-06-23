using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ParkingBuilding.CoreApi.Domain.Entities;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ParkingBuilding.CoreApi.Infrastructure.Security
{
    public class JwtTokenGenerator
    {
        private readonly IConfiguration _configuration;

        public JwtTokenGenerator(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            var issuer = _configuration["Jwt:Issuer"] ?? "ParkingBuilding.CoreApi";
            var audience = _configuration["Jwt:Audience"] ?? "ParkingBuilding.Frontend";
            var secretKey = _configuration["Jwt:Secret"] ?? "DEVELOPMENT_SECRET_KEY_FOR_LOCAL_TESTING_ONLY_2026_SWP391";
            var expirationMinutesStr = _configuration["Jwt:ExpirationMinutes"];
            
            if (!int.TryParse(expirationMinutesStr, out var expirationMinutes))
            {
                expirationMinutes = 60; // Default to 60 minutes (3600 seconds)
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim("user_id", user.Id.ToString()),
                new Claim("username", user.Username),
                new Claim("role", user.Role.ToString().ToUpper()), // e.g. "ADMIN", "MANAGER", "STAFF"
                new Claim("fullName", user.FullName ?? string.Empty),
                new Claim("full_name", user.FullName ?? string.Empty)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public int GetExpirationSeconds()
        {
            var expirationMinutesStr = _configuration["Jwt:ExpirationMinutes"];
            if (int.TryParse(expirationMinutesStr, out var expirationMinutes))
            {
                return expirationMinutes * 60;
            }
            return 3600; // 60 minutes * 60 seconds
        }
    }
}
