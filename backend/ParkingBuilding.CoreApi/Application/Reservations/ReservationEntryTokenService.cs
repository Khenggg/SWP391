using Microsoft.Extensions.Configuration;
using ParkingBuilding.CoreApi.Contracts.Common;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;

namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public class ReservationEntryTokenService : IReservationEntryTokenService
    {
        private readonly IConfiguration _configuration;

        public ReservationEntryTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private string GetSecretKey()
        {
            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
            var secretKey = _configuration["RESERVATION_ENTRY_TOKEN_SECRET"]
                ?? _configuration["ReservationEntryToken:Secret"];

            if (string.IsNullOrEmpty(secretKey))
            {
                if (isDevelopment)
                {
                    secretKey = _configuration["Jwt:Secret"]
                        ?? "DEVELOPMENT_SECRET_KEY_FOR_LOCAL_TESTING_ONLY_2026_SWP391_RESERVATION";
                }
                else
                {
                    throw new BusinessException(ErrorCodes.ReservationEntryTokenSecretConfigRequired);
                }
            }

            return secretKey;
        }

        public string CreateToken(ReservationEntryTokenPayload payload)
        {
            var secretKey = GetSecretKey();

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim("reservation_id", payload.ReservationId.ToString()),
                new Claim("reservation_code", payload.ReservationCode),
                new Claim("vehicle_type_id", payload.VehicleTypeId.ToString()),
                new Claim("entry_gate_id", payload.EntryGateId.ToString()),
                new Claim("reserved_floor_id", payload.ReservedFloorId.ToString()),
                new Claim("reserved_area_id", payload.ReservedAreaId.ToString()),
                new Claim("issued_to_staff_id", payload.IssuedToStaffId.ToString())
            };

            if (payload.ReservedSlotId.HasValue)
            {
                claims.Add(new Claim("reserved_slot_id", payload.ReservedSlotId.Value.ToString()));
            }

            var token = new JwtSecurityToken(
                issuer: "ParkingBuilding.CoreApi.ReservationEntry",
                audience: "ParkingBuilding.CoreApi.Entry",
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: payload.ExpiresAt.UtcDateTime,
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ReservationEntryTokenPayload VerifyToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new BusinessException(ErrorCodes.ReservationEntryTokenRequired);

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
                    ValidIssuer = "ParkingBuilding.CoreApi.ReservationEntry",
                    ValidateAudience = true,
                    ValidAudience = "ParkingBuilding.CoreApi.Entry",
                    ClockSkew = TimeSpan.FromSeconds(10)
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                var jwtToken = (JwtSecurityToken)validatedToken;

                if (jwtToken.ValidTo < DateTime.UtcNow)
                    throw new BusinessException(ErrorCodes.ReservationEntryTokenExpired);

                var reservationIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "reservation_id")?.Value;
                var reservationCode = jwtToken.Claims.FirstOrDefault(c => c.Type == "reservation_code")?.Value;
                var vehicleTypeIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "vehicle_type_id")?.Value;
                var entryGateIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "entry_gate_id")?.Value;
                var floorIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "reserved_floor_id")?.Value;
                var areaIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "reserved_area_id")?.Value;
                var staffIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "issued_to_staff_id")?.Value;
                var slotIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "reserved_slot_id")?.Value;

                if (string.IsNullOrEmpty(reservationCode) ||
                    !long.TryParse(reservationIdStr, out var reservationId) ||
                    !long.TryParse(vehicleTypeIdStr, out var vehicleTypeId) ||
                    !long.TryParse(entryGateIdStr, out var entryGateId) ||
                    !long.TryParse(floorIdStr, out var floorId) ||
                    !long.TryParse(areaIdStr, out var areaId) ||
                    !long.TryParse(staffIdStr, out var staffId))
                {
                    throw new BusinessException(ErrorCodes.ReservationEntryTokenInvalid);
                }

                long? slotId = null;
                if (!string.IsNullOrEmpty(slotIdStr) && long.TryParse(slotIdStr, out var parsedSlotId))
                {
                    slotId = parsedSlotId;
                }

                var issuedAtUtc = jwtToken.ValidFrom == DateTime.MinValue ? DateTime.UtcNow : DateTime.SpecifyKind(jwtToken.ValidFrom, DateTimeKind.Utc);
                var expiresAtUtc = jwtToken.ValidTo == DateTime.MinValue ? DateTime.UtcNow.AddMinutes(5) : DateTime.SpecifyKind(jwtToken.ValidTo, DateTimeKind.Utc);

                return new ReservationEntryTokenPayload
                {
                    ReservationId = reservationId,
                    ReservationCode = reservationCode,
                    VehicleTypeId = vehicleTypeId,
                    EntryGateId = entryGateId,
                    ReservedFloorId = floorId,
                    ReservedAreaId = areaId,
                    ReservedSlotId = slotId,
                    IssuedToStaffId = staffId,
                    IssuedAt = new DateTimeOffset(issuedAtUtc),
                    ExpiresAt = new DateTimeOffset(expiresAtUtc)
                };
            }
            catch (SecurityTokenExpiredException)
            {
                throw new BusinessException(ErrorCodes.ReservationEntryTokenExpired);
            }
            catch (Exception)
            {
                throw new BusinessException(ErrorCodes.ReservationEntryTokenInvalid);
            }
        }
    }
}
