using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
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

        [HttpGet("check-postgres-columns")]
        public async Task<IActionResult> CheckPostgresColumns()
        {
            var conn = _context.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open)
            {
                await conn.OpenAsync();
            }
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pricing_rules'";
            var columns = new System.Collections.Generic.List<string>();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                columns.Add($"{reader.GetString(0)} ({reader.GetString(1)})");
            }
            return Ok(columns);
        }

        [HttpGet("check-rules-mapping")]
        public IActionResult CheckRulesMapping()
        {
            var entityType = _context.Model.FindEntityType(typeof(PricingRule));
            var properties = entityType.GetProperties().Select(p => {
                var annotations = p.GetAnnotations().Select(a => $"{a.Name}: {a.Value}");
                return new {
                    PropertyName = p.Name,
                    Annotations = annotations
                };
            }).ToList();
            return Ok(properties);
        }
    }
}