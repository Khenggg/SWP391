using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize(Roles = "ADMIN,MANAGER")]
    [Route("api/core/pricing-rules")]
    public class PricingRulesController : BaseApiController
    {
        private readonly ParkingDbContext _context;

        public PricingRulesController(ParkingDbContext context)
        {
            _context = context;
        }

        // 1. GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.PricingRules
                .Include(r => r.VehicleType)
                .ToListAsync();
            return Success(list, "Get pricing rules successfully");
        }

        // 2. GET BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var item = await _context.PricingRules
                .Include(r => r.VehicleType)
                .FirstOrDefaultAsync(r => r.Id == id);
                
            if (item == null) return StatusCodeResponse(404, "Not Found", $"Pricing rule with ID {id} not found.");
            return Success(item, "Get pricing rule successfully");
        }

        // 3. CREATE PRICING RULE
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePricingRuleDto model)
        {
            if (model == null) return Fail("Bad Request", "Model is required.");

            // Check if vehicle type exists
            var vehicleTypeExists = await _context.VehicleTypes.AnyAsync(vt => vt.Id == model.VehicleTypeId);
            if (!vehicleTypeExists)
                return Fail("Bad Request", $"Vehicle type with ID {model.VehicleTypeId} does not exist.");

            if (model.DayPrice < 0 || model.NightPrice < 0 || model.MonthlyPrice < 0 || model.LostCardFee < 0)
                return Fail("Bad Request", "Prices and fees must be non-negative.");

            var reservationPriceValidation = ValidateReservationHourlyPrice(model.ReservationHourlyPrice);
            if (reservationPriceValidation != null) return reservationPriceValidation;

            var reservationHoursValidation = ValidateMaxReservationHours(model.MaxReservationHours);
            if (reservationHoursValidation != null) return reservationHoursValidation;

            var userIdStr = User.FindFirst("user_id")?.Value;
            long actorUserId = 1; // Default fallback to system/seeding admin
            if (!string.IsNullOrEmpty(userIdStr) && long.TryParse(userIdStr, out var parsedId))
            {
                actorUserId = parsedId;
            }

            var rule = new PricingRule
            {
                VehicleTypeId = model.VehicleTypeId,
                DayPrice = model.DayPrice,
                NightPrice = model.NightPrice,
                MonthlyPrice = model.MonthlyPrice,
                ReservationHourlyPrice = model.ReservationHourlyPrice,
                MaxReservationHours = model.MaxReservationHours,
                LostCardFee = model.LostCardFee,
                EffectiveFrom = model.EffectiveFrom?.ToUniversalTime() ?? DateTime.UtcNow,
                Status = model.Status ?? "ACTIVE",
                CreatedBy = actorUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.PricingRules.Add(rule);
            await _context.SaveChangesAsync();

            // Fetch with navigation property for output
            var result = await _context.PricingRules
                .Include(r => r.VehicleType)
                .FirstOrDefaultAsync(r => r.Id == rule.Id);

            return Success(result, "Create pricing rule successfully");
        }

        // 4. UPDATE PRICING RULE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdatePricingRuleDto model)
        {
            if (model == null) return Fail("Bad Request", "Model is required.");

            var existing = await _context.PricingRules.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Pricing rule not found.");

            // If updating vehicle type, check existence
            if (model.VehicleTypeId.HasValue)
            {
                var vehicleTypeExists = await _context.VehicleTypes.AnyAsync(vt => vt.Id == model.VehicleTypeId.Value);
                if (!vehicleTypeExists)
                    return Fail("Bad Request", $"Vehicle type with ID {model.VehicleTypeId.Value} does not exist.");
                existing.VehicleTypeId = model.VehicleTypeId.Value;
            }

            if (model.DayPrice.HasValue)
            {
                if (model.DayPrice.Value < 0) return Fail("Bad Request", "Day price must be non-negative.");
                existing.DayPrice = model.DayPrice.Value;
            }

            if (model.NightPrice.HasValue)
            {
                if (model.NightPrice.Value < 0) return Fail("Bad Request", "Night price must be non-negative.");
                existing.NightPrice = model.NightPrice.Value;
            }

            if (model.MonthlyPrice.HasValue)
            {
                if (model.MonthlyPrice.Value < 0) return Fail("Bad Request", "Monthly price must be non-negative.");
                existing.MonthlyPrice = model.MonthlyPrice.Value;
            }

            if (model.ReservationHourlyPrice.HasValue)
            {
                var reservationPriceValidation = ValidateReservationHourlyPrice(model.ReservationHourlyPrice.Value);
                if (reservationPriceValidation != null) return reservationPriceValidation;
                existing.ReservationHourlyPrice = model.ReservationHourlyPrice.Value;
            }

            if (model.MaxReservationHours.HasValue)
            {
                var reservationHoursValidation = ValidateMaxReservationHours(model.MaxReservationHours.Value);
                if (reservationHoursValidation != null) return reservationHoursValidation;
                existing.MaxReservationHours = model.MaxReservationHours.Value;
            }

            if (model.LostCardFee.HasValue)
            {
                if (model.LostCardFee.Value < 0) return Fail("Bad Request", "Lost card fee must be non-negative.");
                existing.LostCardFee = model.LostCardFee.Value;
            }

            if (model.EffectiveFrom.HasValue)
            {
                existing.EffectiveFrom = model.EffectiveFrom.Value.ToUniversalTime();
            }

            if (!string.IsNullOrEmpty(model.Status))
            {
                if (model.Status != "ACTIVE" && model.Status != "INACTIVE")
                    return Fail("Bad Request", "Status must be 'ACTIVE' or 'INACTIVE'.");
                existing.Status = model.Status;
            }

            var userIdStr = User.FindFirst("user_id")?.Value;
            if (!string.IsNullOrEmpty(userIdStr) && long.TryParse(userIdStr, out var parsedId))
            {
                existing.UpdatedBy = parsedId;
            }

            existing.UpdatedAt = DateTime.UtcNow;

            _context.PricingRules.Update(existing);
            await _context.SaveChangesAsync();

            // Fetch with navigation property for output
            var result = await _context.PricingRules
                .Include(r => r.VehicleType)
                .FirstOrDefaultAsync(r => r.Id == existing.Id);

            return Success(result, "Update pricing rule successfully");
        }

        [HttpPatch("{id}/reservation-hourly-price")]
        public async Task<IActionResult> UpdateReservationHourlyPrice(long id, [FromBody] UpdateReservationHourlyPriceDto model)
        {
            if (model == null) return Fail("Bad Request", "Model is required.");

            var validation = ValidateReservationHourlyPrice(model.ReservationHourlyPrice);
            if (validation != null) return validation;

            var existing = await _context.PricingRules.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Pricing rule not found.");

            existing.ReservationHourlyPrice = model.ReservationHourlyPrice;

            var userIdStr = User.FindFirst("user_id")?.Value;
            if (!string.IsNullOrEmpty(userIdStr) && long.TryParse(userIdStr, out var parsedId))
            {
                existing.UpdatedBy = parsedId;
            }

            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var result = await _context.PricingRules
                .Include(r => r.VehicleType)
                .FirstOrDefaultAsync(r => r.Id == existing.Id);

            return Success(result, "Update reservation hourly price successfully");
        }

        // 5. DELETE PRICING RULE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var existing = await _context.PricingRules.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Pricing rule not found.");

            _context.PricingRules.Remove(existing);
            await _context.SaveChangesAsync();

            return Success(true, "Delete pricing rule successfully");
        }

        // DTOs
        public class CreatePricingRuleDto
        {
            public long VehicleTypeId { get; set; }
            public decimal DayPrice { get; set; }
            public decimal NightPrice { get; set; }
            public decimal MonthlyPrice { get; set; }
            public decimal ReservationHourlyPrice { get; set; }
            public int MaxReservationHours { get; set; } = 24;
            public decimal LostCardFee { get; set; }
            public DateTime? EffectiveFrom { get; set; }
            public string? Status { get; set; }
        }

        public class UpdatePricingRuleDto
        {
            public long? VehicleTypeId { get; set; }
            public decimal? DayPrice { get; set; }
            public decimal? NightPrice { get; set; }
            public decimal? MonthlyPrice { get; set; }
            public decimal? ReservationHourlyPrice { get; set; }
            public int? MaxReservationHours { get; set; }
            public decimal? LostCardFee { get; set; }
            public DateTime? EffectiveFrom { get; set; }
            public string? Status { get; set; }
        }

        public class UpdateReservationHourlyPriceDto
        {
            public decimal ReservationHourlyPrice { get; set; }
        }

        private IActionResult? ValidateReservationHourlyPrice(decimal value)
        {
            var allowZeroEnv = Environment.GetEnvironmentVariable("RESERVATION_ALLOW_ZERO_BOOKING_FEE");
            var allowZero = bool.TryParse(allowZeroEnv, out var parsed) && parsed;

            if (value <= 0m && (!allowZero || value < 0m))
                return BusinessError(ErrorCodes.ReservationBookingFeeRequired);

            if (value != decimal.Truncate(value))
                return BusinessError(ErrorCodes.ReservationHourlyPriceMustBeInteger);

            return null;
        }

        private IActionResult? ValidateMaxReservationHours(int value)
        {
            if (value < 1 || value > 24)
                return Fail("Bad Request", "Max reservation hours must be between 1 and 24.");

            return null;
        }
    }
}
