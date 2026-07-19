using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize]
    [Route("api/core/driver/vehicles")]
    public class VehiclesController : BaseApiController
    {
        private readonly ParkingDbContext _context;

        public VehiclesController(ParkingDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetVehicles()
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
            {
                return Failure("Unauthorized user context.", "UNAUTHORIZED", StatusCodes.Status401Unauthorized);
            }

            var driverProfile = await _context.DriverProfiles
                .FirstOrDefaultAsync(dp => dp.UserId == userId);

            if (driverProfile == null)
            {
                return Success(Enumerable.Empty<object>(), "No driver profile found, returning empty vehicle list.");
            }

            var vehicles = await _context.Vehicles
                .Where(v => v.DriverId == driverProfile.Id && v.Status == "ACTIVE")
                .Include(v => v.VehicleType)
                .ToListAsync();

            var normalizedPlates = vehicles.Select(v => v.NormalizedPlateNumber).ToList();

            var monthlyPasses = await _context.MonthlyPasses
                .Where(mp => normalizedPlates.Contains(mp.NormalizedPlateNumber))
                .ToListAsync();

            var result = vehicles.Select(v => {
                var pass = monthlyPasses
                    .Where(mp => mp.NormalizedPlateNumber == v.NormalizedPlateNumber)
                    .OrderByDescending(mp => mp.EndDate)
                    .FirstOrDefault();

                return new
                {
                    v.Id,
                    Plate = v.PlateNumber,
                    PlateNumber = v.PlateNumber,
                    v.VehicleTypeId,
                    VehicleTypeName = v.VehicleType != null ? v.VehicleType.Name : (v.VehicleTypeId == 5 ? "Ô Tô" : "Xe Máy"),
                    v.Description,
                    Status = pass != null ? pass.Status : "INACTIVE",
                    OwnerName = pass != null ? pass.OwnerName : driverProfile.FullName,
                    StartDate = pass != null ? pass.StartDate.ToString("yyyy-MM-dd") : null,
                    EndDate = pass != null ? pass.EndDate.ToString("yyyy-MM-dd") : null
                };
            }).ToList();

            return Success(result, "Get vehicles successfully.");
        }

        [HttpPost]
        public async Task<IActionResult> CreateVehicle([FromBody] CreateVehicleDto dto)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
            {
                return Failure("Unauthorized user context.", "UNAUTHORIZED", StatusCodes.Status401Unauthorized);
            }

            if (dto == null || string.IsNullOrWhiteSpace(dto.PlateNumber))
            {
                return Failure("Plate number is required.", "INVALID_INPUT", StatusCodes.Status400BadRequest);
            }

            var driverProfile = await _context.DriverProfiles
                .FirstOrDefaultAsync(dp => dp.UserId == userId);

            if (driverProfile == null)
            {
                return Failure("Driver profile not found.", "NOT_FOUND", StatusCodes.Status404NotFound);
            }

            // Normalise plate number
            var normalizedPlate = dto.PlateNumber.Replace("-", "").Replace(".", "").Replace(" ", "").ToUpper();

            // Check if vehicle already exists and is active
            var existing = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.NormalizedPlateNumber == normalizedPlate && v.Status == "ACTIVE");

            if (existing != null)
            {
                return Failure("Vehicle with this plate number is already registered.", "DUPLICATE_VEHICLE", StatusCodes.Status400BadRequest);
            }

            // Create new vehicle
            var vehicle = new Vehicle
            {
                DriverId = driverProfile.Id,
                PlateNumber = dto.PlateNumber,
                NormalizedPlateNumber = normalizedPlate,
                VehicleTypeId = dto.VehicleTypeId,
                Description = dto.Description,
                Status = "ACTIVE",
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            // Load vehicle type relation
            await _context.Entry(vehicle).Reference(v => v.VehicleType).LoadAsync();

            var result = new
            {
                vehicle.Id,
                vehicle.PlateNumber,
                vehicle.VehicleTypeId,
                VehicleTypeName = vehicle.VehicleType?.Name ?? (vehicle.VehicleTypeId == 5 ? "Ô Tô" : "Xe Máy"),
                vehicle.Description,
                vehicle.Status
            };

            return CreatedSuccess(result, "Add vehicle successfully.");
        }

        private long? GetUserIdFromClaims()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (long.TryParse(userIdClaim, out var parsedId))
            {
                return parsedId;
            }
            return null;
        }
    }

    public class CreateVehicleDto
    {
        public string PlateNumber { get; set; } = string.Empty;
        public long VehicleTypeId { get; set; }
        public string? Description { get; set; }
    }
}
