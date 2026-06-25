using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;

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
            var reservations = await _context.Reservations.ToListAsync();
            _context.Reservations.RemoveRange(reservations);

            var slots = await _context.Slots.ToListAsync();
            foreach (var slot in slots)
            {
                slot.Status = "AVAILABLE";
            }

            var areas = await _context.Areas.ToListAsync();
            foreach (var area in areas)
            {
                area.CurrentBookedSlots = 0;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "All reservations cleared, slots reset to AVAILABLE, area booked slots reset to 0." });
        }
    }
}