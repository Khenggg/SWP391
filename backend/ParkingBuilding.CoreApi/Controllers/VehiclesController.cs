using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Application.Audit;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize]
    [Route("api/core/driver/vehicles")]
    public class VehiclesController : BaseApiController
    {
        private readonly ParkingDbContext _context;
        private readonly IAuditWriterService _auditWriter;

        public VehiclesController(ParkingDbContext context, IAuditWriterService auditWriter)
        {
            _context = context;
            _auditWriter = auditWriter;
        }

        [HttpGet]
        public async Task<IActionResult> GetVehicles(
            [FromQuery] string? keyword,
            [FromQuery] string? vehicleType,
            [FromQuery] string? approvalStatus,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
            {
                return Failure("Unauthorized user context.", "UNAUTHORIZED", StatusCodes.Status401Unauthorized);
            }

            var role = GetUserRoleFromClaims();
            if (string.IsNullOrWhiteSpace(role))
            {
                return Failure("User role context is missing.", "FORBIDDEN", StatusCodes.Status403Forbidden);
            }

            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100;

            IQueryable<Vehicle> query = _context.Vehicles
                .Include(v => v.VehicleType)
                .Where(v => v.Status == "ACTIVE");

            if ("DRIVER".Equals(role, StringComparison.OrdinalIgnoreCase))
            {
                var driverProfile = await _context.DriverProfiles
                    .FirstOrDefaultAsync(dp => dp.UserId == userId);

                if (driverProfile == null)
                {
                    return Success(new
                    {
                        items = Enumerable.Empty<object>(),
                        page,
                        pageSize,
                        totalItems = 0,
                        totalPages = 0
                    }, "Get registered vehicles successfully");
                }

                query = query.Where(v => v.DriverId == driverProfile.Id);
            }
            else if (!"STAFF".Equals(role, StringComparison.OrdinalIgnoreCase) &&
                     !"MANAGER".Equals(role, StringComparison.OrdinalIgnoreCase) &&
                     !"ADMIN".Equals(role, StringComparison.OrdinalIgnoreCase))
            {
                return Failure("Unauthorized role context.", "FORBIDDEN", StatusCodes.Status403Forbidden);
            }

            // Apply filters for keyword, vehicleType, and approvalStatus
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var lowerKeyword = keyword.ToLower();
                query = query.Where(v => v.PlateNumber.ToLower().Contains(lowerKeyword)
                                      || (v.Brand != null && v.Brand.ToLower().Contains(lowerKeyword))
                                      || (v.Color != null && v.Color.ToLower().Contains(lowerKeyword)));
            }

            if (!string.IsNullOrWhiteSpace(vehicleType))
            {
                var isCar = "CAR".Equals(vehicleType, StringComparison.OrdinalIgnoreCase);
                query = query.Where(v => v.VehicleType.RequiresSlot == isCar);
            }

            if (!string.IsNullOrWhiteSpace(approvalStatus))
            {
                query = query.Where(v => v.ApprovalStatus == approvalStatus);
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            var itemsList = await query
                .OrderByDescending(v => v.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(v => new
                {
                    id = v.Id,
                    driverId = v.DriverId,
                    licensePlate = v.PlateNumber,
                    plateNumber = v.PlateNumber,
                    normalizedPlateNumber = v.NormalizedPlateNumber,
                    vehicleTypeId = v.VehicleTypeId,
                    vehicleType = v.VehicleType.RequiresSlot ? "CAR" : "MOTORBIKE",
                    vehicleTypeName = v.VehicleType.Name,
                    brand = v.Brand,
                    color = v.Color,
                    approvalStatus = v.ApprovalStatus,
                    status = v.Status,
                    activeSession = _context.ParkingSessions
                        .Where(s =>
                            (s.VehicleId == v.Id ||
                             (s.VehicleId == null &&
                              s.NormalizedPlateNumber == v.NormalizedPlateNumber &&
                              s.VehicleTypeId == v.VehicleTypeId &&
                              (s.DriverId == null || s.DriverId == v.DriverId))) &&
                            (s.Status == "ACTIVE" || s.Status == "LOST_CARD_PENDING" || s.Status == "MISMATCH_PENDING"))
                        .OrderByDescending(s => s.EntryTime)
                        .Select(s => new
                        {
                            id = s.Id,
                            sessionCode = s.SessionCode,
                            status = s.Status,
                            entryTime = s.EntryTime,
                            customerType = s.CustomerType
                        })
                        .FirstOrDefault(),
                    createdAt = v.CreatedAt
                })
                .ToListAsync();

            return Success(new
            {
                items = itemsList,
                page,
                pageSize,
                totalItems,
                totalPages
            }, "Get registered vehicles successfully");
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVehicleById(long id)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
            {
                return Failure("Unauthorized user context.", "UNAUTHORIZED", StatusCodes.Status401Unauthorized);
            }

            var role = GetUserRoleFromClaims();
            if (string.IsNullOrWhiteSpace(role))
            {
                return Failure("User role context is missing.", "FORBIDDEN", StatusCodes.Status403Forbidden);
            }

            var vehicle = await _context.Vehicles
                .Include(v => v.VehicleType)
                .FirstOrDefaultAsync(v => v.Id == id && v.Status == "ACTIVE");

            if (vehicle == null)
            {
                return Failure("Vehicle not found.", "NOT_FOUND", StatusCodes.Status404NotFound);
            }

            if ("DRIVER".Equals(role, StringComparison.OrdinalIgnoreCase))
            {
                var driverProfile = await _context.DriverProfiles
                    .FirstOrDefaultAsync(dp => dp.UserId == userId);

                if (driverProfile == null || vehicle.DriverId != driverProfile.Id)
                {
                    return Failure("Access denied to this vehicle.", "FORBIDDEN", StatusCodes.Status403Forbidden);
                }
            }

            return Success(new
            {
                id = vehicle.Id,
                driverId = vehicle.DriverId,
                licensePlate = vehicle.PlateNumber,
                vehicleType = vehicle.VehicleType.RequiresSlot ? "CAR" : "MOTORBIKE",
                brand = vehicle.Brand,
                color = vehicle.Color,
                approvalStatus = vehicle.ApprovalStatus,
                createdAt = vehicle.CreatedAt,
                updatedAt = vehicle.UpdatedAt
            }, "Get vehicle successfully");
        }

        [HttpPost]
        public async Task<IActionResult> CreateVehicle([FromBody] RegisterVehicleDto dto)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
            {
                return Failure("Unauthorized user context.", "UNAUTHORIZED", StatusCodes.Status401Unauthorized);
            }

            var role = GetUserRoleFromClaims();
            if (!"DRIVER".Equals(role, StringComparison.OrdinalIgnoreCase))
            {
                return Failure("Only drivers can register new vehicles.", "FORBIDDEN", StatusCodes.Status403Forbidden);
            }

            if (dto == null)
            {
                return Failure("Invalid input data.", "VALIDATION_FAILED", StatusCodes.Status400BadRequest);
            }

            if (string.IsNullOrWhiteSpace(dto.LicensePlate))
            {
                return Failure("License plate is required.", "VALIDATION_FAILED", StatusCodes.Status400BadRequest);
            }

            if (string.IsNullOrWhiteSpace(dto.VehicleType) || 
                (!"CAR".Equals(dto.VehicleType, StringComparison.OrdinalIgnoreCase) && 
                 !"MOTORBIKE".Equals(dto.VehicleType, StringComparison.OrdinalIgnoreCase)))
            {
                return Failure("Vehicle Type is required (CAR or MOTORBIKE).", "VALIDATION_FAILED", StatusCodes.Status400BadRequest);
            }

            if (string.IsNullOrWhiteSpace(dto.Brand))
            {
                return Failure("Brand is required.", "VALIDATION_FAILED", StatusCodes.Status400BadRequest);
            }

            if (string.IsNullOrWhiteSpace(dto.Color))
            {
                return Failure("Color is required.", "VALIDATION_FAILED", StatusCodes.Status400BadRequest);
            }

            var driverProfile = await _context.DriverProfiles
                .FirstOrDefaultAsync(dp => dp.UserId == userId);

            if (driverProfile == null)
            {
                return Failure("Driver profile not found.", "NOT_FOUND", StatusCodes.Status404NotFound);
            }

            var normalizedPlate = dto.LicensePlate.Replace("-", "").Replace(".", "").Replace(" ", "").ToUpper();

            var duplicate = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.NormalizedPlateNumber == normalizedPlate && v.Status == "ACTIVE");

            if (duplicate != null)
            {
                return Failure("License plate must be unique.", "VALIDATION_FAILED", StatusCodes.Status400BadRequest);
            }

            var isCar = "CAR".Equals(dto.VehicleType, StringComparison.OrdinalIgnoreCase);
            var vehicleTypeObj = await _context.VehicleTypes
                .FirstOrDefaultAsync(vt => vt.IsActive && vt.RequiresSlot == isCar);

            if (vehicleTypeObj == null)
            {
                return Failure("Could not resolve vehicle type database reference.", "INVALID_VEHICLE_TYPE", StatusCodes.Status400BadRequest);
            }

            var vehicle = new Vehicle
            {
                DriverId = driverProfile.Id,
                PlateNumber = dto.LicensePlate,
                NormalizedPlateNumber = normalizedPlate,
                VehicleTypeId = vehicleTypeObj.Id,
                Brand = dto.Brand,
                Color = dto.Color,
                ApprovalStatus = "PENDING",
                Description = dto.Description,
                Status = "ACTIVE",
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            await _auditWriter.WriteAuditLogAsync(
                action: "VEHICLE_REGISTERED",
                targetType: "Vehicle",
                targetId: vehicle.Id.ToString(),
                actorUserId: userId.Value,
                newValue: $"Plate: {vehicle.PlateNumber}, Brand: {vehicle.Brand}, Color: {vehicle.Color}, DriverId: {driverProfile.Id}"
            );

            return CreatedSuccess(new
            {
                id = vehicle.Id,
                driverId = vehicle.DriverId,
                licensePlate = vehicle.PlateNumber,
                vehicleType = dto.VehicleType.ToUpper(),
                brand = vehicle.Brand,
                color = vehicle.Color,
                approvalStatus = vehicle.ApprovalStatus,
                createdAt = vehicle.CreatedAt,
                updatedAt = vehicle.UpdatedAt
            }, "Vehicle registered successfully");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVehicle(long id, [FromBody] UpdateVehicleDto dto)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
            {
                return Failure("Unauthorized user context.", "UNAUTHORIZED", StatusCodes.Status401Unauthorized);
            }

            var role = GetUserRoleFromClaims();
            if (string.IsNullOrWhiteSpace(role))
            {
                return Failure("User role context is missing.", "FORBIDDEN", StatusCodes.Status403Forbidden);
            }

            if (dto == null)
            {
                return Failure("Invalid input data.", "VALIDATION_FAILED", StatusCodes.Status400BadRequest);
            }

            if (string.IsNullOrWhiteSpace(dto.LicensePlate))
            {
                return Failure("License plate is required.", "VALIDATION_FAILED", StatusCodes.Status400BadRequest);
            }

            if (string.IsNullOrWhiteSpace(dto.VehicleType) || 
                (!"CAR".Equals(dto.VehicleType, StringComparison.OrdinalIgnoreCase) && 
                 !"MOTORBIKE".Equals(dto.VehicleType, StringComparison.OrdinalIgnoreCase)))
            {
                return Failure("Vehicle Type is required (CAR or MOTORBIKE).", "VALIDATION_FAILED", StatusCodes.Status400BadRequest);
            }

            if (string.IsNullOrWhiteSpace(dto.Brand))
            {
                return Failure("Brand is required.", "VALIDATION_FAILED", StatusCodes.Status400BadRequest);
            }

            if (string.IsNullOrWhiteSpace(dto.Color))
            {
                return Failure("Color is required.", "VALIDATION_FAILED", StatusCodes.Status400BadRequest);
            }

            var vehicle = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.Id == id && v.Status == "ACTIVE");

            if (vehicle == null)
            {
                return Failure("Vehicle not found.", "NOT_FOUND", StatusCodes.Status404NotFound);
            }

            if ("DRIVER".Equals(role, StringComparison.OrdinalIgnoreCase))
            {
                var driverProfile = await _context.DriverProfiles
                    .FirstOrDefaultAsync(dp => dp.UserId == userId);

                if (driverProfile == null || vehicle.DriverId != driverProfile.Id)
                {
                    return Failure("Access denied to update this vehicle.", "FORBIDDEN", StatusCodes.Status403Forbidden);
                }
            }

            var normalizedPlate = dto.LicensePlate.Replace("-", "").Replace(".", "").Replace(" ", "").ToUpper();

            var duplicate = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.Id != id && v.NormalizedPlateNumber == normalizedPlate && v.Status == "ACTIVE");

            if (duplicate != null)
            {
                return Failure("License plate must be unique.", "VALIDATION_FAILED", StatusCodes.Status400BadRequest);
            }

            var isCar = "CAR".Equals(dto.VehicleType, StringComparison.OrdinalIgnoreCase);
            var vehicleTypeObj = await _context.VehicleTypes
                .FirstOrDefaultAsync(vt => vt.IsActive && vt.RequiresSlot == isCar);

            if (vehicleTypeObj == null)
            {
                return Failure("Could not resolve vehicle type database reference.", "INVALID_VEHICLE_TYPE", StatusCodes.Status400BadRequest);
            }

            var oldValue = $"Plate: {vehicle.PlateNumber}, Brand: {vehicle.Brand}, Color: {vehicle.Color}, VehicleTypeId: {vehicle.VehicleTypeId}, Description: {vehicle.Description}";

            vehicle.PlateNumber = dto.LicensePlate;
            vehicle.NormalizedPlateNumber = normalizedPlate;
            vehicle.VehicleTypeId = vehicleTypeObj.Id;
            vehicle.Brand = dto.Brand;
            vehicle.Color = dto.Color;
            vehicle.Description = dto.Description;
            vehicle.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            await _auditWriter.WriteAuditLogAsync(
                action: "VEHICLE_UPDATED",
                targetType: "Vehicle",
                targetId: vehicle.Id.ToString(),
                actorUserId: userId.Value,
                oldValue: oldValue,
                newValue: $"Plate: {vehicle.PlateNumber}, Brand: {vehicle.Brand}, Color: {vehicle.Color}, VehicleTypeId: {vehicle.VehicleTypeId}, Description: {vehicle.Description}"
            );

            return Success(new
            {
                id = vehicle.Id,
                driverId = vehicle.DriverId,
                licensePlate = vehicle.PlateNumber,
                vehicleType = dto.VehicleType.ToUpper(),
                brand = vehicle.Brand,
                color = vehicle.Color,
                approvalStatus = vehicle.ApprovalStatus,
                createdAt = vehicle.CreatedAt,
                updatedAt = vehicle.UpdatedAt
            }, "Vehicle updated successfully");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVehicle(long id)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
            {
                return Failure("Unauthorized user context.", "UNAUTHORIZED", StatusCodes.Status401Unauthorized);
            }

            var role = GetUserRoleFromClaims();
            if (string.IsNullOrWhiteSpace(role))
            {
                return Failure("User role context is missing.", "FORBIDDEN", StatusCodes.Status403Forbidden);
            }

            var vehicle = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.Id == id && v.Status == "ACTIVE");

            if (vehicle == null)
            {
                return Failure("Vehicle not found.", "NOT_FOUND", StatusCodes.Status404NotFound);
            }

            if ("DRIVER".Equals(role, StringComparison.OrdinalIgnoreCase))
            {
                var driverProfile = await _context.DriverProfiles
                    .FirstOrDefaultAsync(dp => dp.UserId == userId);

                if (driverProfile == null || vehicle.DriverId != driverProfile.Id)
                {
                    return Failure("Access denied to delete this vehicle.", "FORBIDDEN", StatusCodes.Status403Forbidden);
                }
            }

            vehicle.Status = "INACTIVE";
            vehicle.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            await _auditWriter.WriteAuditLogAsync(
                action: "VEHICLE_DELETED",
                targetType: "Vehicle",
                targetId: vehicle.Id.ToString(),
                actorUserId: userId.Value,
                newValue: $"Soft deleted vehicle: {vehicle.PlateNumber} (ID: {vehicle.Id})"
            );

            return Success("Vehicle deleted successfully");
        }

        [HttpPatch("{id}/approval-status")]
        public async Task<IActionResult> ChangeApprovalStatus(long id, [FromBody] ChangeApprovalStatusDto dto)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
            {
                return Failure("Unauthorized user context.", "UNAUTHORIZED", StatusCodes.Status401Unauthorized);
            }

            var role = GetUserRoleFromClaims();
            if ("DRIVER".Equals(role, StringComparison.OrdinalIgnoreCase))
            {
                return Failure("Drivers cannot modify approval status.", "FORBIDDEN", StatusCodes.Status403Forbidden);
            }

            if (!"STAFF".Equals(role, StringComparison.OrdinalIgnoreCase) &&
                !"MANAGER".Equals(role, StringComparison.OrdinalIgnoreCase) &&
                !"ADMIN".Equals(role, StringComparison.OrdinalIgnoreCase))
            {
                return Failure("Unauthorized role context.", "FORBIDDEN", StatusCodes.Status403Forbidden);
            }

            if (dto == null || string.IsNullOrWhiteSpace(dto.ApprovalStatus))
            {
                return Failure("Approval status is required.", "VALIDATION_FAILED", StatusCodes.Status400BadRequest);
            }

            var upperStatus = dto.ApprovalStatus.ToUpper();
            if (upperStatus != "PENDING" && upperStatus != "APPROVED" && upperStatus != "REJECTED")
            {
                return Failure("Invalid approval status. Must be PENDING, APPROVED, or REJECTED.", "VALIDATION_FAILED", StatusCodes.Status400BadRequest);
            }

            var vehicle = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.Id == id && v.Status == "ACTIVE");

            if (vehicle == null)
            {
                return Failure("Vehicle not found.", "NOT_FOUND", StatusCodes.Status404NotFound);
            }

            var oldValue = $"ApprovalStatus: {vehicle.ApprovalStatus}";

            vehicle.ApprovalStatus = upperStatus;
            vehicle.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            await _auditWriter.WriteAuditLogAsync(
                action: "VEHICLE_APPROVAL_STATUS_CHANGED",
                targetType: "Vehicle",
                targetId: vehicle.Id.ToString(),
                actorUserId: userId.Value,
                oldValue: oldValue,
                newValue: $"ApprovalStatus: {vehicle.ApprovalStatus}"
            );

            return Success(new
            {
                id = vehicle.Id,
                driverId = vehicle.DriverId,
                licensePlate = vehicle.PlateNumber,
                brand = vehicle.Brand,
                color = vehicle.Color,
                approvalStatus = vehicle.ApprovalStatus,
                createdAt = vehicle.CreatedAt,
                updatedAt = vehicle.UpdatedAt
            }, "Vehicle approval status updated successfully");
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

        private string? GetUserRoleFromClaims()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
        }
    }

    public class RegisterVehicleDto
    {
        public string LicensePlate { get; set; } = string.Empty;
        public string VehicleType { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class UpdateVehicleDto
    {
        public string LicensePlate { get; set; } = string.Empty;
        public string VehicleType { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class ChangeApprovalStatusDto
    {
        public string ApprovalStatus { get; set; } = string.Empty;
    }
}
