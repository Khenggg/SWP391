using Microsoft.Extensions.Configuration;
using ParkingBuilding.CoreApi.Contracts.Common;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public class MonthlyEntryTokenService : IMonthlyEntryTokenService
    {
        private readonly IConfiguration _configuration;

        public MonthlyEntryTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private string GetSecretKey()
        {
            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
            var secretKey = _configuration["MONTHLY_ENTRY_TOKEN_SECRET"]
                ?? _configuration["MonthlyEntryToken:Secret"];

            if (string.IsNullOrEmpty(secretKey))
            {
                if (isDevelopment)
                {
                    secretKey = _configuration["Jwt:Secret"]
                        ?? "DEVELOPMENT_SECRET_KEY_FOR_LOCAL_TESTING_ONLY_2026_SWP391_MONTHLY_ENTRY";
                }
                else
                {
                    throw new BusinessException(ErrorCodes.MonthlyEntryTokenSecretConfigRequired);
                }
            }

            return secretKey;
        }

        public string CreateToken(MonthlyEntryTokenPayload payload)
        {
            var secretKey = GetSecretKey();

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim("monthly_pass_id", payload.MonthlyPassId.ToString()),
                new Claim("card_id", payload.CardId.ToString()),
                new Claim("card_code", payload.CardCode),
                new Claim("vehicle_type_id", payload.VehicleTypeId.ToString()),
                new Claim("entry_gate_id", payload.EntryGateId.ToString()),
                new Claim("fixed_floor_id", payload.FixedFloorId.ToString()),
                new Claim("fixed_area_id", payload.FixedAreaId.ToString()),
                new Claim("issued_to_staff_id", payload.IssuedToStaffId.ToString())
            };

            if (payload.FixedSlotId.HasValue)
            {
                claims.Add(new Claim("fixed_slot_id", payload.FixedSlotId.Value.ToString()));
            }

            var token = new JwtSecurityToken(
                issuer: "ParkingBuilding.CoreApi.MonthlyEntry",
                audience: "ParkingBuilding.CoreApi.Entry",
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: payload.ExpiresAt.UtcDateTime,
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public MonthlyEntryTokenPayload VerifyToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenRequired);

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
                    ValidIssuer = "ParkingBuilding.CoreApi.MonthlyEntry",
                    ValidateAudience = true,
                    ValidAudience = "ParkingBuilding.CoreApi.Entry",
                    ClockSkew = TimeSpan.FromSeconds(10)
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                var jwtToken = (JwtSecurityToken)validatedToken;

                if (jwtToken.ValidTo < DateTime.UtcNow)
                    throw new BusinessException(ErrorCodes.MonthlyEntryTokenExpired);

                var passIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "monthly_pass_id")?.Value;
                var cardIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "card_id")?.Value;
                var cardCode = jwtToken.Claims.FirstOrDefault(c => c.Type == "card_code")?.Value;
                var vehicleTypeIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "vehicle_type_id")?.Value;
                var entryGateIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "entry_gate_id")?.Value;
                var floorIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "fixed_floor_id")?.Value;
                var areaIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "fixed_area_id")?.Value;
                var staffIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "issued_to_staff_id")?.Value;
                var slotIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "fixed_slot_id")?.Value;

                if (string.IsNullOrEmpty(cardCode) ||
                    !long.TryParse(passIdStr, out var passId) ||
                    !long.TryParse(cardIdStr, out var cardId) ||
                    !long.TryParse(vehicleTypeIdStr, out var vehicleTypeId) ||
                    !long.TryParse(entryGateIdStr, out var entryGateId) ||
                    !long.TryParse(floorIdStr, out var floorId) ||
                    !long.TryParse(areaIdStr, out var areaId) ||
                    !long.TryParse(staffIdStr, out var staffId))
                {
                    throw new BusinessException(ErrorCodes.MonthlyEntryTokenInvalid);
                }

                long? slotId = null;
                if (!string.IsNullOrEmpty(slotIdStr) && long.TryParse(slotIdStr, out var parsedSlotId))
                {
                    slotId = parsedSlotId;
                }

                var issuedAtUtc = jwtToken.ValidFrom == DateTime.MinValue ? DateTime.UtcNow : DateTime.SpecifyKind(jwtToken.ValidFrom, DateTimeKind.Utc);
                var expiresAtUtc = jwtToken.ValidTo == DateTime.MinValue ? DateTime.UtcNow.AddMinutes(5) : DateTime.SpecifyKind(jwtToken.ValidTo, DateTimeKind.Utc);

                return new MonthlyEntryTokenPayload
                {
                    MonthlyPassId = passId,
                    CardId = cardId,
                    CardCode = cardCode,
                    VehicleTypeId = vehicleTypeId,
                    EntryGateId = entryGateId,
                    FixedFloorId = floorId,
                    FixedAreaId = areaId,
                    FixedSlotId = slotId,
                    IssuedToStaffId = staffId,
                    IssuedAt = new DateTimeOffset(issuedAtUtc),
                    ExpiresAt = new DateTimeOffset(expiresAtUtc)
                };
            }
            catch (SecurityTokenExpiredException)
            {
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenExpired);
            }
            catch (Exception)
            {
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenInvalid);
            }
        }
    }
}
