using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ParkingBuilding.CoreApi.Domain.Entities;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ParkingBuilding.CoreApi.Infrastructure.Security
{
    public class JwtTokenGenerator
    {
        private readonly IConfiguration _configuration;

        public JwtTokenGenerator(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user, Guid sessionId, out string jwtId)
        {
            var issuer = _configuration["Jwt:Issuer"] ?? "ParkingBuilding.CoreApi";
            var audience = _configuration["Jwt:Audience"] ?? "ParkingBuilding.Frontend";
            var secretKey = _configuration["JWT_SECRET"] ?? _configuration["Jwt:Secret"];
            var secretKeyBytes = JwtSecretValidator.GetValidatedKeyBytes(secretKey);
            var expirationMinutesStr = _configuration["Jwt:ExpirationMinutes"];
            
            if (!int.TryParse(expirationMinutesStr, out var expirationMinutes))
            {
                expirationMinutes = 60; // Default to 60 minutes (3600 seconds)
            }

            var key = new SymmetricSecurityKey(secretKeyBytes);
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            jwtId = Guid.NewGuid().ToString("N");

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, jwtId),
                new Claim(JwtRegisteredClaimNames.Sid, sessionId.ToString()),
                new Claim("user_id", user.Id.ToString()),
                new Claim("username", user.Username),
                new Claim("role", user.Role.ToString().ToUpper()), // e.g. "ADMIN", "MANAGER", "STAFF"
                new Claim("fullName", user.FullName ?? string.Empty),
                new Claim("full_name", user.FullName ?? string.Empty),
                new Claim("status", user.Status.ToString().ToUpper())
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
