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
using ParkingBuilding.CoreApi.Domain.Enums;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System.Text.Json;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize]
    [Route("api/core/pricing-rules")]
    public class PricingRulesController : BaseApiController
    {
        private readonly ParkingDbContext _context;
        private readonly IAuditWriterService _auditWriterService;

        public PricingRulesController(ParkingDbContext context, IAuditWriterService auditWriterService)
        {
            _context = context;
            _auditWriterService = auditWriterService;
        }

        /// <summary>
        /// Retrieve pricing rules (paginated, supports filtering by vehicle type and status).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetPricingRules(
            [FromQuery] long? vehicleTypeId,
            [FromQuery] PricingRuleStatus? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var query = _context.PricingRules
                .Include(pr => pr.VehicleType)
                .AsQueryable();

            if (vehicleTypeId.HasValue)
            {
                query = query.Where(pr => pr.VehicleTypeId == vehicleTypeId.Value);
            }

            if (status.HasValue)
            {
                query = query.Where(pr => pr.Status == status.Value);
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(pr => pr.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(pr => ToPricingRuleDto(pr))
                .ToListAsync();

            var pagedResponse = new PagedResponse<PricingRuleDto>(items, totalCount, page, pageSize);
            return Success(pagedResponse, "Pricing rules retrieved successfully.");
        }

        /// <summary>
        /// Retrieve specific pricing rule details by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPricingRuleById([FromRoute] long id)
        {
            var pr = await _context.PricingRules
                .Include(x => x.VehicleType)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (pr == null)
            {
                return StatusCodeResponse(404, "Pricing rule not found", $"No pricing rule with ID {id} was found.");
            }

            return Success(ToPricingRuleDto(pr), "Pricing rule details retrieved successfully.");
        }

        /// <summary>
        /// Create a new pricing rule (Admin/Manager only).
        /// </summary>
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpPost]
        public async Task<IActionResult> CreatePricingRule([FromBody] CreatePricingRuleRequest request)
        {
            if (request == null)
            {
                return Fail("Creation failed", "Request payload cannot be empty.");
            }

            // Validate VehicleTypeId exists and is active
            var vt = await _context.VehicleTypes.FirstOrDefaultAsync(x => x.Id == request.VehicleTypeId);
            if (vt == null)
            {
                return Fail("Vehicle type not found", $"No vehicle type with ID {request.VehicleTypeId} exists.");
            }
            if (!vt.IsActive)
            {
                return Fail("Inactive vehicle type", $"Vehicle type '{vt.Name}' (ID {vt.Id}) is inactive.");
            }

            var actorUserId = GetCurrentUserId() ?? 1; // Default to 1 (System Admin) if not parsed

            // Business rule: Prevent duplicate active rules for same vehicle type
            if (request.Status == PricingRuleStatus.ACTIVE)
            {
                var activeRuleExists = await _context.PricingRules
                    .AnyAsync(r => r.VehicleTypeId == request.VehicleTypeId && r.Status == PricingRuleStatus.ACTIVE);
                if (activeRuleExists)
                {
                    return Fail("Active pricing rule conflict", $"An active pricing rule already exists for vehicle type '{vt.Name}'. Please deactivate the existing rule first.");
                }
            }

            var newPricingRule = new PricingRule
            {
                VehicleTypeId = request.VehicleTypeId.GetValueOrDefault(),
                DayPrice = request.DayPrice.GetValueOrDefault(),
                NightPrice = request.NightPrice.GetValueOrDefault(),
                MonthlyPrice = request.MonthlyPrice.GetValueOrDefault(),
                ReservationHourlyPrice = request.ReservationHourlyPrice,
                LostCardFee = request.LostCardFee,
                EffectiveFrom = request.EffectiveFrom ?? DateTimeOffset.UtcNow,
                Status = request.Status,
                CreatedBy = actorUserId,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.PricingRules.Add(newPricingRule);
            await _context.SaveChangesAsync();

            // Fetch with VehicleType included to populate Name in DTO
            newPricingRule.VehicleType = vt;

            var dto = ToPricingRuleDto(newPricingRule);
            var serializedValue = JsonSerializer.Serialize(dto);

            await _auditWriterService.WriteAuditLogAsync(
                action: "PRICING_RULE_CREATED",
                targetType: "pricing_rules",
                targetId: newPricingRule.Id.ToString(),
                actorUserId: actorUserId,
                newValue: serializedValue,
                reason: $"Pricing rule created for vehicle type '{vt.Name}' by Admin/Manager."
            );

            return Success(dto, "Pricing rule created successfully.");
        }

        /// <summary>
        /// Update details of a pricing rule (Admin/Manager only).
        /// </summary>
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePricingRule([FromRoute] long id, [FromBody] UpdatePricingRuleRequest request)
        {
            if (request == null)
            {
                return Fail("Update failed", "Request payload cannot be empty.");
            }

            var pr = await _context.PricingRules
                .Include(x => x.VehicleType)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (pr == null)
            {
                return StatusCodeResponse(404, "Pricing rule not found", $"No pricing rule with ID {id} was found.");
            }

            var actorUserId = GetCurrentUserId() ?? 1;
            var oldDto = ToPricingRuleDto(pr);
            var serializedOld = JsonSerializer.Serialize(oldDto);

            pr.DayPrice = request.DayPrice.GetValueOrDefault();
            pr.NightPrice = request.NightPrice.GetValueOrDefault();
            pr.MonthlyPrice = request.MonthlyPrice.GetValueOrDefault();
            pr.ReservationHourlyPrice = request.ReservationHourlyPrice.GetValueOrDefault();
            pr.LostCardFee = request.LostCardFee.GetValueOrDefault();
            pr.EffectiveFrom = request.EffectiveFrom.GetValueOrDefault(DateTimeOffset.UtcNow);
            pr.UpdatedBy = actorUserId;
            pr.UpdatedAt = DateTimeOffset.UtcNow;

            _context.PricingRules.Update(pr);
            await _context.SaveChangesAsync();

            var newDto = ToPricingRuleDto(pr);
            var serializedNew = JsonSerializer.Serialize(newDto);

            await _auditWriterService.WriteAuditLogAsync(
                action: "PRICING_RULE_UPDATED",
                targetType: "pricing_rules",
                targetId: pr.Id.ToString(),
                actorUserId: actorUserId,
                oldValue: serializedOld,
                newValue: serializedNew,
                reason: $"Pricing rule details updated by Admin/Manager."
            );

            return Success(newDto, "Pricing rule details updated successfully.");
        }

        /// <summary>
        /// Update status of a pricing rule (Admin/Manager only).
        /// </summary>
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdatePricingRuleStatus([FromRoute] long id, [FromBody] UpdatePricingRuleStatusRequest request)
        {
            if (request == null)
            {
                return Fail("Update status failed", "Request payload cannot be empty.");
            }

            var pr = await _context.PricingRules
                .Include(x => x.VehicleType)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (pr == null)
            {
                return StatusCodeResponse(404, "Pricing rule not found", $"No pricing rule with ID {id} was found.");
            }

            var oldStatus = pr.Status;
            var targetStatus = request.Status;

            // Business rule validation: Prevent duplicate active rules for same vehicle type
            if (targetStatus == PricingRuleStatus.ACTIVE && oldStatus != PricingRuleStatus.ACTIVE)
            {
                var activeRuleExists = await _context.PricingRules
                    .AnyAsync(r => r.VehicleTypeId == pr.VehicleTypeId && r.Status == PricingRuleStatus.ACTIVE);
                if (activeRuleExists)
                {
                    var vtName = pr.VehicleType != null ? pr.VehicleType.Name : "unknown";
                    return Fail("Active pricing rule conflict", $"An active pricing rule already exists for vehicle type '{vtName}'. Please deactivate the existing rule first.");
                }
            }

            var actorUserId = GetCurrentUserId() ?? 1;
            var oldDto = ToPricingRuleDto(pr);
            var serializedOld = JsonSerializer.Serialize(oldDto);

            pr.Status = targetStatus;
            pr.UpdatedBy = actorUserId;
            pr.UpdatedAt = DateTimeOffset.UtcNow;

            _context.PricingRules.Update(pr);
            await _context.SaveChangesAsync();

            var newDto = ToPricingRuleDto(pr);
            var serializedNew = JsonSerializer.Serialize(newDto);

            var auditReason = !string.IsNullOrWhiteSpace(request.Reason)
                ? request.Reason.Trim()
                : $"Pricing rule status updated from {oldStatus} to {targetStatus} by Admin/Manager.";

            await _auditWriterService.WriteAuditLogAsync(
                action: "PRICING_RULE_STATUS_CHANGED",
                targetType: "pricing_rules",
                targetId: pr.Id.ToString(),
                actorUserId: actorUserId,
                oldValue: serializedOld,
                newValue: serializedNew,
                reason: auditReason
            );

            return Success(newDto, $"Pricing rule status updated to {targetStatus} successfully.");
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

        private static PricingRuleDto ToPricingRuleDto(PricingRule pr)
        {
            return new PricingRuleDto
            {
                Id = pr.Id,
                VehicleTypeId = pr.VehicleTypeId,
                VehicleTypeName = pr.VehicleType != null ? pr.VehicleType.Name : string.Empty,
                DayPrice = pr.DayPrice,
                NightPrice = pr.NightPrice,
                MonthlyPrice = pr.MonthlyPrice,
                ReservationHourlyPrice = pr.ReservationHourlyPrice,
                LostCardFee = pr.LostCardFee,
                EffectiveFrom = pr.EffectiveFrom,
                Status = pr.Status.ToString(),
                CreatedBy = pr.CreatedBy,
                UpdatedBy = pr.UpdatedBy,
                CreatedAt = pr.CreatedAt,
                UpdatedAt = pr.UpdatedAt
            };
        }
    }
}
