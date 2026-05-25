using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Contracts.Responses;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Route("api/core/health")] // Định nghĩa Route rõ ràng tại cấp Controller
    public class HealthController : BaseApiController
    {
        [HttpGet] // Kích hoạt phương thức GET cho endpoint /api/core/health
        public IActionResult GetHealth()
        {
            var response = new HealthCheckResponse();
            return Ok(response);
        }
    }
}