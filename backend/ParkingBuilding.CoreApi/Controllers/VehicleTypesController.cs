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
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize]
    [Route("api/core/vehicle-types")]
    public class VehicleTypesController : BaseApiController
    {
        private readonly ParkingDbContext _context;
        private readonly IAuditWriterService _auditWriterService;

        public VehicleTypesController(ParkingDbContext context, IAuditWriterService auditWriterService)
        {
            _context = context;
            _auditWriterService = auditWriterService;
        }

        /// <summary>
        /// Retrieve vehicle types (paginated, supports search and active status filters).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetVehicleTypes(
            [FromQuery] string? search,
            [FromQuery] bool? isActive,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var query = _context.VehicleTypes.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(vt =>
                    vt.Name.ToLower().Contains(s) ||
                    (vt.Description != null && vt.Description.ToLower().Contains(s)));
            }

            if (isActive.HasValue)
            {
                query = query.Where(vt => vt.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(vt => vt.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(vt => new VehicleTypeDto
                {
                    Id = vt.Id,
                    Name = vt.Name,
                    Description = vt.Description,
                    IsActive = vt.IsActive,
                    RequiresSlot = vt.RequiresSlot,
                    CreatedAt = vt.CreatedAt,
                    UpdatedAt = vt.UpdatedAt
                })
                .ToListAsync();

            var pagedResponse = new PagedResponse<VehicleTypeDto>(items, totalCount, page, pageSize);
            return Success(pagedResponse, "Vehicle types retrieved successfully.");
        }

        /// <summary>
        /// Retrieve all active vehicle types for frontend dropdown selections (non-paginated).
        /// </summary>
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveVehicleTypes()
        {
            var items = await _context.VehicleTypes
                .Where(vt => vt.IsActive)
                .OrderBy(vt => vt.Id)
                .Select(vt => new VehicleTypeDto
                {
                    Id = vt.Id,
                    Name = vt.Name,
                    Description = vt.Description,
                    IsActive = vt.IsActive,
                    RequiresSlot = vt.RequiresSlot,
                    CreatedAt = vt.CreatedAt,
                    UpdatedAt = vt.UpdatedAt
                })
                .ToListAsync();

            return Success(items, "Active vehicle types retrieved successfully.");
        }

        /// <summary>
        /// Retrieve specific vehicle type details by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetVehicleTypeById([FromRoute] long id)
        {
            var vt = await _context.VehicleTypes.FirstOrDefaultAsync(x => x.Id == id);
            if (vt == null)
            {
                return StatusCodeResponse(404, "Vehicle type not found", $"No vehicle type with ID {id} was found.");
            }

            return Success(ToVehicleTypeDto(vt), "Vehicle type details retrieved successfully.");
        }

        /// <summary>
        /// Create a new vehicle type (Admin/Manager only).
        /// </summary>
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpPost]
        public async Task<IActionResult> CreateVehicleType([FromBody] CreateVehicleTypeRequest request)
        {
            if (request == null)
            {
                return Fail("Creation failed", "Request payload cannot be empty.");
            }

            // Check duplicate name (case-insensitive)
            var nameExists = await _context.VehicleTypes
                .AnyAsync(vt => vt.Name.ToLower() == request.Name.Trim().ToLower());
            if (nameExists)
            {
                return Fail("Vehicle type name already exists", $"The vehicle type name '{request.Name}' is already taken.");
            }

            var actorUserId = GetCurrentUserId();

            var newVehicleType = new VehicleType
            {
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                RequiresSlot = request.RequiresSlot ?? true,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.VehicleTypes.Add(newVehicleType);
            await _context.SaveChangesAsync();

            var dto = ToVehicleTypeDto(newVehicleType);
            var serializedValue = System.Text.Json.JsonSerializer.Serialize(dto);

            await _auditWriterService.WriteAuditLogAsync(
                action: "VEHICLE_TYPE_CREATED",
                targetType: "vehicle_types",
                targetId: newVehicleType.Id.ToString(),
                actorUserId: actorUserId,
                newValue: serializedValue,
                reason: $"Vehicle type '{newVehicleType.Name}' created by Admin/Manager."
            );

            return Success(dto, "Vehicle type created successfully.");
        }

        /// <summary>
        /// Update basic details of a vehicle type (Admin/Manager only).
        /// </summary>
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVehicleType([FromRoute] long id, [FromBody] UpdateVehicleTypeRequest request)
        {
            if (request == null)
            {
                return Fail("Update failed", "Request payload cannot be empty.");
            }

            var vt = await _context.VehicleTypes.FirstOrDefaultAsync(x => x.Id == id);
            if (vt == null)
            {
                return StatusCodeResponse(404, "Vehicle type not found", $"No vehicle type with ID {id} was found.");
            }

            // Check duplicate name (case-insensitive) excluding current ID
            var nameExists = await _context.VehicleTypes
                .AnyAsync(x => x.Id != id && x.Name.ToLower() == request.Name.Trim().ToLower());
            if (nameExists)
            {
                return Fail("Vehicle type name already exists", $"The vehicle type name '{request.Name}' is already taken.");
            }

            var actorUserId = GetCurrentUserId();
            var oldDto = ToVehicleTypeDto(vt);
            var serializedOld = System.Text.Json.JsonSerializer.Serialize(oldDto);

            vt.Name = request.Name.Trim();
            vt.Description = request.Description?.Trim();
            vt.RequiresSlot = request.RequiresSlot ?? true;
            vt.UpdatedAt = DateTimeOffset.UtcNow;

            _context.VehicleTypes.Update(vt);
            await _context.SaveChangesAsync();

            var newDto = ToVehicleTypeDto(vt);
            var serializedNew = System.Text.Json.JsonSerializer.Serialize(newDto);

            await _auditWriterService.WriteAuditLogAsync(
                action: "VEHICLE_TYPE_UPDATED",
                targetType: "vehicle_types",
                targetId: vt.Id.ToString(),
                actorUserId: actorUserId,
                oldValue: serializedOld,
                newValue: serializedNew,
                reason: $"Vehicle type details updated by Admin/Manager."
            );

            return Success(newDto, "Vehicle type details updated successfully.");
        }

        /// <summary>
        /// Toggle status (active/disabled) of a vehicle type (Admin/Manager only).
        /// </summary>
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateVehicleTypeStatus([FromRoute] long id, [FromBody] UpdateVehicleTypeStatusRequest request)
        {
            if (request == null)
            {
                return Fail("Status change failed", "Request payload cannot be empty.");
            }

            var vt = await _context.VehicleTypes.FirstOrDefaultAsync(x => x.Id == id);
            if (vt == null)
            {
                return StatusCodeResponse(404, "Vehicle type not found", $"No vehicle type with ID {id} was found.");
            }

            var actorUserId = GetCurrentUserId();
            var oldStatus = vt.IsActive;
            
            vt.IsActive = request.IsActive ?? true;
            vt.UpdatedAt = DateTimeOffset.UtcNow;

            _context.VehicleTypes.Update(vt);
            await _context.SaveChangesAsync();

            await _auditWriterService.WriteAuditLogAsync(
                action: "VEHICLE_TYPE_STATUS_CHANGED",
                targetType: "vehicle_types",
                targetId: vt.Id.ToString(),
                actorUserId: actorUserId,
                oldValue: System.Text.Json.JsonSerializer.Serialize(oldStatus),
                newValue: System.Text.Json.JsonSerializer.Serialize(vt.IsActive),
                reason: $"Vehicle type active status changed from {oldStatus} to {vt.IsActive} by Admin/Manager."
            );

            var actionMsg = vt.IsActive ? "activated" : "deactivated";
            return Success(ToVehicleTypeDto(vt), $"Vehicle type successfully {actionMsg}.");
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

        private static VehicleTypeDto ToVehicleTypeDto(VehicleType vt)
        {
            return new VehicleTypeDto
            {
                Id = vt.Id,
                Name = vt.Name,
                Description = vt.Description,
                IsActive = vt.IsActive,
                RequiresSlot = vt.RequiresSlot,
                CreatedAt = vt.CreatedAt,
                UpdatedAt = vt.UpdatedAt
            };
        }
    }
}
