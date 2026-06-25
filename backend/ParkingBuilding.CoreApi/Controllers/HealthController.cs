using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Route("api/core/health")] // Định nghĩa Route rõ ràng tại cấp Controller
    public class HealthController : BaseApiController
    {
        private readonly ParkingDbContext _context;

        public HealthController(ParkingDbContext context)
        {
            _context = context;
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

        [HttpGet("dump-reservations")]
        public async Task<IActionResult> DumpReservations()
        {
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

        [HttpPost("clear-reservations")]
        public async Task<IActionResult> ClearReservations()
        {
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