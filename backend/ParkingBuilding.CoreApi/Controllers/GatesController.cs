using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System.Linq;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize(Roles = "ADMIN,MANAGER,STAFF")]
    [Route("api/core/[controller]")]
    public class GatesController : BaseApiController
    {
        private readonly ParkingDbContext _context;

        public GatesController(ParkingDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetGates([FromQuery] string? type = null)
        {
            var query = _context.Gates.Where(g => g.Status == "ACTIVE");

            if (!string.IsNullOrEmpty(type))
            {
                var upperType = type.ToUpper();
                query = query.Where(g => g.GateType == upperType);
            }

            var gates = await query.Select(g => new
            {
                g.Id,
                g.FloorId,
                g.GateCode,
                g.GateType
            }).ToListAsync();

            return Success(gates, "Lấy danh sách cổng thành công.");
        }
    }
}
