using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Application.MonthlyPasses;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize]
    [Route("api/core/cards")]
    public class CardsController : BaseApiController
    {
        private readonly ParkingDbContext _context;
        private readonly IMonthlyPassService _monthlyPassService;
        private readonly IMonthlyEntryTokenService _monthlyTokenService;

        public CardsController(
            ParkingDbContext context,
            IMonthlyPassService monthlyPassService,
            IMonthlyEntryTokenService monthlyTokenService)
        {
            _context = context;
            _monthlyPassService = monthlyPassService;
            _monthlyTokenService = monthlyTokenService;
        }

        // 1. GET ALL (with basic filter)
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? search)
        {
            var query = _context.ParkingCards.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<CardStatus>(status, true, out var parsedStatus))
                {
                    query = query.Where(c => c.Status == parsedStatus);
                }
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c => c.CardNumber.Contains(search));
            }

            var list = await BuildCardResponsesAsync(query);
            return Success(list, "Get cards successfully");
        }

        // 2. GET CARDS THAT CAN BE ASSIGNED TO A MONTHLY PASS
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpGet("available")]
        [HttpGet("assignable")]
        public async Task<IActionResult> GetAvailable()
        {
            var activeOrLockedMonthlyCardIds = _context.MonthlyPasses
                .Where(monthlyPass => monthlyPass.Status == "ACTIVE" || monthlyPass.Status == "LOCKED")
                .Select(monthlyPass => monthlyPass.CardId);

            var query = _context.ParkingCards
                .Where(card => card.Status == CardStatus.AVAILABLE
                    && card.CurrentSessionId == null
                    && !activeOrLockedMonthlyCardIds.Contains(card.Id));

            var list = await BuildCardResponsesAsync(query);
            return Success(list, "Get assignable cards successfully");
        }

        // 3. GET BY ID
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var item = (await BuildCardResponsesAsync(
                _context.ParkingCards.Where(card => card.Id == id)))
                .SingleOrDefault();
            if (item == null) return StatusCodeResponse(404, "Not Found", $"Card with ID {id} not found.");
            return Success(item, "Get card successfully");
        }

        private async Task<List<CardResponseDto>> BuildCardResponsesAsync(IQueryable<ParkingCard> query)
        {
            var cards = await query
                .OrderBy(card => card.CardNumber)
                .ToListAsync();

            var cardIds = cards.Select(card => card.Id).ToList();
            var allocations = await _context.MonthlyPasses
                .Where(monthlyPass => cardIds.Contains(monthlyPass.CardId)
                    && (monthlyPass.Status == "ACTIVE" || monthlyPass.Status == "LOCKED"))
                .OrderByDescending(monthlyPass => monthlyPass.EndDate)
                .Select(monthlyPass => new MonthlyPassAllocationDto
                {
                    Id = monthlyPass.Id,
                    CardId = monthlyPass.CardId,
                    Status = monthlyPass.Status,
                    PlateNumber = monthlyPass.PlateNumber,
                    OwnerName = monthlyPass.OwnerName,
                    StartDate = monthlyPass.StartDate,
                    EndDate = monthlyPass.EndDate
                })
                .ToListAsync();

            var allocationByCardId = allocations
                .GroupBy(allocation => allocation.CardId)
                .ToDictionary(group => group.Key, group => group.First());

            return cards.Select(card =>
            {
                allocationByCardId.TryGetValue(card.Id, out var monthlyPass);
                return new CardResponseDto
                {
                    Id = card.Id,
                    CardNumber = card.CardNumber,
                    QrToken = card.QrToken,
                    Status = card.Status.ToString(),
                    CurrentSessionId = card.CurrentSessionId,
                    Note = card.Note,
                    CreatedAt = card.CreatedAt,
                    UpdatedAt = card.UpdatedAt,
                    AllocationType = monthlyPass == null ? "UNASSIGNED" : "MONTHLY_PASS",
                    IsAssignable = card.Status == CardStatus.AVAILABLE
                        && card.CurrentSessionId == null
                        && monthlyPass == null,
                    MonthlyPass = monthlyPass
                };
            }).ToList();
        }

        // 4. CREATE CARD
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCardDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.CardNumber))
                return Fail("Bad Request", "Card number is required.");

            var cleanCardNumber = model.CardNumber.Trim();
            
            // Check duplicate card number/code
            bool isDuplicate = await _context.ParkingCards
                .AnyAsync(c => c.CardNumber.ToLower() == cleanCardNumber.ToLower());
                
            if (isDuplicate)
                return StatusCodeResponse(409, "Conflict", "Card number already exists.");

            var card = new ParkingCard
            {
                CardNumber = cleanCardNumber,
                QrToken = "QR-" + cleanCardNumber.ToUpper() + "-" + Guid.NewGuid().ToString("N").Substring(0, 16).ToUpper(),
                Status = CardStatus.AVAILABLE,
                Note = model.Note,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ParkingCards.Add(card);
            await _context.SaveChangesAsync();

            return Success(card, "Create card successfully");
        }

        // 5. UPDATE CARD
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateCardDto model)
        {
            var existing = await _context.ParkingCards.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Card not found.");

            existing.Note = model.Note;
            existing.UpdatedAt = DateTime.UtcNow;

            _context.ParkingCards.Update(existing);
            await _context.SaveChangesAsync();

            return Success(existing, "Update card successfully");
        }

        // 6. PATCH STATUS
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeStatus(long id, [FromBody] string status)
        {
            var existing = await _context.ParkingCards.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Card not found.");

            if (!Enum.TryParse<CardStatus>(status, true, out var parsedStatus))
            {
                return Fail("Bad Request", $"Invalid card status '{status}'. Valid statuses are: AVAILABLE, IN_USE, LOST, DAMAGED, INACTIVE");
            }

            existing.Status = parsedStatus;
            existing.UpdatedAt = DateTime.UtcNow;

            _context.ParkingCards.Update(existing);
            await _context.SaveChangesAsync();

            return Success(existing, "Change card status successfully");
        }

        // 7. DELETE CARD
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var existing = await _context.ParkingCards.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Card not found.");

            _context.ParkingCards.Remove(existing);
            await _context.SaveChangesAsync();

            return Success(true, "Delete card successfully");
        }

        // 8. GET CARD ENTRY CHECK
        [Authorize(Roles = "ADMIN,MANAGER,STAFF")]
        [HttpGet("{cardCode}/entry-check")]
        public async Task<IActionResult> GetCardEntryCheck(string cardCode, [FromQuery] long entryGateId)
        {
            var card = await _context.ParkingCards
                .FirstOrDefaultAsync(c => c.CardNumber.ToLower() == cardCode.ToLower().Trim());

            if (card == null)
                return StatusCodeResponse(404, "Not Found", "CARD_NOT_FOUND");

            if (card.Status != CardStatus.AVAILABLE || card.CurrentSessionId.HasValue)
                return StatusCodeResponse(400, "Bad Request", "CARD_NOT_AVAILABLE");

            var gate = await _context.Gates.Include(g => g.Floor).FirstOrDefaultAsync(g => g.Id == entryGateId);
            if (gate == null)
                return StatusCodeResponse(404, "Not Found", "GATE_NOT_FOUND");
            if (gate.GateType != "ENTRY" || gate.Status != "ACTIVE")
                return StatusCodeResponse(400, "Bad Request", "GATE_NOT_ACTIVE");

            if (gate.Floor == null || gate.Floor.Status != "ACTIVE")
            {
                return StatusCodeResponse(400, "Bad Request", "FLOOR_NOT_ACTIVE");
            }

            // Look for active monthly pass
            var monthlyPass = await _context.MonthlyPasses
                .Include(p => p.Floor)
                .Include(p => p.Area)
                .Include(p => p.Slot)
                .FirstOrDefaultAsync(p => p.CardId == card.Id && p.Status == "ACTIVE");

            if (monthlyPass != null)
            {
                var today = DateTime.UtcNow.Date;
                if (monthlyPass.StartDate.Date > today || monthlyPass.EndDate.Date < today)
                {
                    return StatusCodeResponse(400, "Bad Request", "MONTHLY_PASS_EXPIRED");
                }

                var vehicleType = await _context.VehicleTypes.FindAsync(monthlyPass.VehicleTypeId);
                if (vehicleType == null)
                    return StatusCodeResponse(400, "Bad Request", "VEHICLE_TYPE_NOT_FOUND");

                if (monthlyPass.Floor == null || monthlyPass.Floor.Status != "ACTIVE")
                    return StatusCodeResponse(400, "Bad Request", "MONTHLY_FLOOR_NOT_AVAILABLE");

                if (monthlyPass.Area == null || monthlyPass.Area.Status != "ACTIVE")
                    return StatusCodeResponse(400, "Bad Request", "MONTHLY_AREA_NOT_AVAILABLE");

                if (vehicleType.RequiresSlot)
                {
                    if (monthlyPass.Slot == null || monthlyPass.Slot.Status == "INACTIVE" || monthlyPass.Slot.Status == "LOCKED")
                        return StatusCodeResponse(400, "Bad Request", "MONTHLY_SLOT_NOT_AVAILABLE");
                }

                var staffIdStr = User.FindFirst("user_id")?.Value
                    ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? "1";
                long.TryParse(staffIdStr, out var staffId);

                var payload = new MonthlyEntryTokenPayload
                {
                    MonthlyPassId = monthlyPass.Id,
                    CardId = card.Id,
                    CardCode = card.CardNumber,
                    VehicleTypeId = monthlyPass.VehicleTypeId,
                    EntryGateId = entryGateId,
                    FixedFloorId = monthlyPass.FloorId ?? 0,
                    FixedAreaId = monthlyPass.AreaId ?? 0,
                    FixedSlotId = monthlyPass.SlotId,
                    IssuedToStaffId = staffId,
                    IssuedAt = DateTimeOffset.UtcNow,
                    ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
                };

                var token = _monthlyTokenService.CreateToken(payload);

                return Success(new
                {
                    cardStatus = card.Status.ToString(),
                    entryCardType = "MONTHLY",
                    cardId = card.Id,
                    cardCode = card.CardNumber,
                    monthlyPassId = monthlyPass.Id,
                    monthlyPassStatus = monthlyPass.Status,
                    plateNumber = monthlyPass.PlateNumber,
                    normalizedPlateNumber = monthlyPass.NormalizedPlateNumber,
                    vehicleTypeId = monthlyPass.VehicleTypeId,
                    requiresSlot = vehicleType.RequiresSlot,
                    fixedFloorId = monthlyPass.FloorId,
                    fixedAreaId = monthlyPass.AreaId,
                    fixedSlotId = monthlyPass.SlotId,
                    monthlyEntryToken = token
                }, "Card is mapped to active monthly pass");
            }

            // Task 8: Expired monthly pass cannot be used as casual card
            var anyMonthlyPass = await _context.MonthlyPasses
                .AnyAsync(p => p.CardId == card.Id);
            if (anyMonthlyPass)
            {
                return StatusCodeResponse(400, "Bad Request", "CARD_IS_MONTHLY_CANNOT_USE_AS_CASUAL");
            }

            return Success(new
            {
                cardStatus = card.Status.ToString(),
                entryCardType = "NORMAL",
                cardId = card.Id,
                cardCode = card.CardNumber,
                monthlyPassId = (long?)null
            }, "Card is available for normal entry");
        }

        // DTOs
        public class CreateCardDto
        {
            public string CardNumber { get; set; } = string.Empty;
            public string? Note { get; set; }
        }

        public class UpdateCardDto
        {
            public string? Note { get; set; }
        }

        public class CardResponseDto
        {
            public long Id { get; set; }
            public string CardNumber { get; set; } = string.Empty;
            public string QrToken { get; set; } = string.Empty;
            public string Status { get; set; } = string.Empty;
            public long? CurrentSessionId { get; set; }
            public string? Note { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime UpdatedAt { get; set; }
            public string AllocationType { get; set; } = "UNASSIGNED";
            public bool IsAssignable { get; set; }
            public MonthlyPassAllocationDto? MonthlyPass { get; set; }
        }

        public class MonthlyPassAllocationDto
        {
            public long Id { get; set; }
            public long CardId { get; set; }
            public string Status { get; set; } = string.Empty;
            public string PlateNumber { get; set; } = string.Empty;
            public string OwnerName { get; set; } = string.Empty;
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
        }
    }
}
