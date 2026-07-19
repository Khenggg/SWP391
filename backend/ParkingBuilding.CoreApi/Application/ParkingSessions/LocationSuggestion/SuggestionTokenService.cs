using Microsoft.Extensions.Configuration;
using ParkingBuilding.CoreApi.Contracts.Common;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public class SuggestionTokenService : ISuggestionTokenService
    {
        private readonly IConfiguration _configuration;

        public SuggestionTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private string GetSecretKey()
        {
            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
            var secretKey = _configuration["SUGGESTION_TOKEN_SECRET"]
                ?? _configuration["SuggestionToken:Secret"];

            if (string.IsNullOrEmpty(secretKey))
            {
                if (isDevelopment)
                {
                    secretKey = _configuration["Jwt:Secret"]
                        ?? "DEVELOPMENT_SECRET_KEY_FOR_LOCAL_TESTING_ONLY_2026_SWP391";
                }
                else
                {
                    throw new BusinessException(ErrorCodes.SuggestionTokenSecretConfigRequired);
                }
            }

            return secretKey;
        }

        public string CreateToken(LocationSuggestionPayload payload)
        {
            var secretKey = GetSecretKey();

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim("suggestion_type", payload.SuggestionType),
                new Claim("vehicle_type_id", payload.VehicleTypeId.ToString()),
                new Claim("entry_gate_id", payload.EntryGateId.ToString()),
                new Claim("suggested_floor_id", payload.SuggestedFloorId.ToString()),
                new Claim("suggested_area_id", payload.SuggestedAreaId.ToString()),
                new Claim("issued_to_staff_id", payload.IssuedToStaffId.ToString())
            };

            if (payload.SuggestedSlotId.HasValue)
            {
                claims.Add(new Claim("suggested_slot_id", payload.SuggestedSlotId.Value.ToString()));
            }

            var token = new JwtSecurityToken(
                issuer: "ParkingBuilding.CoreApi.Suggestion",
                audience: "ParkingBuilding.CoreApi.Entry",
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: payload.ExpiresAt.UtcDateTime,
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public LocationSuggestionPayload VerifyToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new BusinessException(ErrorCodes.SuggestionTokenRequired);

            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKey = GetSecretKey();

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = "ParkingBuilding.CoreApi.Suggestion",
                    ValidateAudience = true,
                    ValidAudience = "ParkingBuilding.CoreApi.Entry",
                    ClockSkew = TimeSpan.FromSeconds(10)
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                var jwtToken = (JwtSecurityToken)validatedToken;

                if (jwtToken.ValidTo < DateTime.UtcNow)
                    throw new BusinessException(ErrorCodes.SuggestionTokenExpired);

                var type = jwtToken.Claims.FirstOrDefault(c => c.Type == "suggestion_type")?.Value;
                var vehicleTypeIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "vehicle_type_id")?.Value;
                var entryGateIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "entry_gate_id")?.Value;
                var floorIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "suggested_floor_id")?.Value;
                var areaIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "suggested_area_id")?.Value;
                var staffIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "issued_to_staff_id")?.Value;
                var slotIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "suggested_slot_id")?.Value;

                if (string.IsNullOrEmpty(type) ||
                    !long.TryParse(vehicleTypeIdStr, out var vehicleTypeId) ||
                    !long.TryParse(entryGateIdStr, out var entryGateId) ||
                    !long.TryParse(floorIdStr, out var floorId) ||
                    !long.TryParse(areaIdStr, out var areaId) ||
                    !long.TryParse(staffIdStr, out var staffId))
                {
                    throw new BusinessException(ErrorCodes.SuggestionTokenInvalid);
                }

                long? slotId = null;
                if (!string.IsNullOrEmpty(slotIdStr) && long.TryParse(slotIdStr, out var parsedSlotId))
                {
                    slotId = parsedSlotId;
                }

                var issuedAtUtc = jwtToken.ValidFrom == DateTime.MinValue ? DateTime.UtcNow : DateTime.SpecifyKind(jwtToken.ValidFrom, DateTimeKind.Utc);
                var expiresAtUtc = jwtToken.ValidTo == DateTime.MinValue ? DateTime.UtcNow.AddMinutes(5) : DateTime.SpecifyKind(jwtToken.ValidTo, DateTimeKind.Utc);

                return new LocationSuggestionPayload
                {
                    SuggestionType = type,
                    VehicleTypeId = vehicleTypeId,
                    EntryGateId = entryGateId,
                    SuggestedFloorId = floorId,
                    SuggestedAreaId = areaId,
                    SuggestedSlotId = slotId,
                    IssuedToStaffId = staffId,
                    IssuedAt = new DateTimeOffset(issuedAtUtc),
                    ExpiresAt = new DateTimeOffset(expiresAtUtc)
                };
            }
            catch (SecurityTokenExpiredException)
            {
                throw new BusinessException(ErrorCodes.SuggestionTokenExpired);
            }
            catch (Exception)
            {
                throw new BusinessException(ErrorCodes.SuggestionTokenInvalid);
            }
        }
    }
}
