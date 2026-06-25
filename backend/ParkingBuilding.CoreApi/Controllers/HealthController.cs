using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using ParkingBuilding.CoreApi.Domain.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authorization;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Route("api/core/health")] // Định nghĩa Route rõ ràng tại cấp Controller
    public class HealthController : BaseApiController
    {
        private readonly ParkingDbContext _context;
        private readonly IWebHostEnvironment _env;

        public HealthController(ParkingDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet] // Kích hoạt phương thức GET cho endpoint /api/core/health
        public IActionResult GetHealth()
        {
            var data = new
            {
                service = "ParkingBuilding.CoreApi",
                status = "UP"
            };
            return Success(data, "Core API is running");
        }

        // DEV ONLY: This endpoint is only for local integration testing.
        // Do not enable it in production/demo environment.
        [HttpGet("dump-reservations")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DumpReservations()
        {
            if (!_env.IsDevelopment())
            {
                return Forbid("Endpoint only available in development environment.");
            }

            var list = await _context.Reservations
                .Select(r => new {
                    r.Id,
                    r.ReservationCode,
                    r.PlateNumber,
                    r.NormalizedPlateNumber,
                    r.SlotId,
                    r.AreaId,
                    r.Status,
                    r.PaymentStatus,
                    r.ExpiresAt
                })
                .ToListAsync();
            return Ok(list);
        }

        // DEV ONLY: This endpoint is only for local integration testing.
        // Do not enable it in production/demo environment.
        [HttpPost("clear-reservations")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> ClearReservations()
        {
            if (!_env.IsDevelopment())
            {
                return Forbid("Endpoint only available in development environment.");
            }

            var slots = await _context.Slots.ToListAsync();
            foreach (var slot in slots)
            {
                slot.Status = "AVAILABLE";
                slot.CurrentSessionId = null;
            }

            var areas = await _context.Areas.ToListAsync();
            foreach (var area in areas)
            {
                area.CurrentBookedSlots = 0;
                area.CurrentRealOccupancy = 0;
            }

            var cards = await _context.ParkingCards.ToListAsync();
            foreach (var card in cards)
            {
                card.Status = CardStatus.AVAILABLE;
                card.CurrentSessionId = null;
            }

            await _context.SaveChangesAsync();

            var extensions = await _context.ReservationExtensions.ToListAsync();
            _context.ReservationExtensions.RemoveRange(extensions);

            var payments = await _context.Payments.ToListAsync();
            _context.Payments.RemoveRange(payments);

            var sessions = await _context.ParkingSessions.ToListAsync();
            _context.ParkingSessions.RemoveRange(sessions);

            var reservations = await _context.Reservations.ToListAsync();
            _context.Reservations.RemoveRange(reservations);

            await _context.SaveChangesAsync();
            return Ok(new { message = "All reservations, sessions, and audit logs cleared. Slots, areas, and cards reset successfully." });
        }
    }
}