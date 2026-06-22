using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize(Roles = "ADMIN,MANAGER")]
    [Route("api/core/cards")]
    public class CardsController : BaseApiController
    {
        private readonly ParkingDbContext _context;

        public CardsController(ParkingDbContext context)
        {
            _context = context;
        }

        // 1. GET ALL (with basic filter)
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

            var list = await query.ToListAsync();
            return Success(list, "Get cards successfully");
        }

        // 2. GET AVAILABLE CARDS
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailable()
        {
            var list = await _context.ParkingCards
                .Where(c => c.Status == CardStatus.AVAILABLE)
                .ToListAsync();
            return Success(list, "Get available cards successfully");
        }

        // 3. GET BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var item = await _context.ParkingCards.FindAsync(id);
            if (item == null) return StatusCodeResponse(404, "Not Found", $"Card with ID {id} not found.");
            return Success(item, "Get card successfully");
        }

        // 4. CREATE CARD
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
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var existing = await _context.ParkingCards.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Card not found.");

            _context.ParkingCards.Remove(existing);
            await _context.SaveChangesAsync();

            return Success(true, "Delete card successfully");
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
    }
}
