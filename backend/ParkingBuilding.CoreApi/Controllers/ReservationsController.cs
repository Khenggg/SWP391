using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.Reservations;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize]
    [Route("api/core/reservations")]
    public class ReservationsController : BaseApiController
    {
        private readonly ReservationService _reservationService;

        public ReservationsController(ReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        // ================= GET AVAILABLE LOCATIONS =================
        [HttpGet("available-locations")]
        public async Task<IActionResult> GetAvailableLocations([FromQuery] long vehicleTypeId)
        {
            var result = await _reservationService.GetAvailableLocationsAsync(vehicleTypeId);
            return Success(result, "Get available locations successfully.");
        }

        // ================= CREATE RESERVATION =================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReservationRequest request)
        {
            long? userId = GetUserIdFromClaims();
            var result = await _reservationService.CreateReservationAsync(request, userId);
            return StatusCode(201, result); // Returns 201 Created directly
        }

        // ================= EXTEND RESERVATION =================
        [HttpPost("{id}/extend")]
        public async Task<IActionResult> Extend(long id, [FromBody] ExtendReservationRequest request)
        {
            long? userId = GetUserIdFromClaims();
            var result = await _reservationService.ExtendReservationAsync(id, request, userId);
            return Success(result, "Extend reservation successfully.");
        }

        // ================= CANCEL RESERVATION =================
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> Cancel(long id, [FromBody] CancelReservationRequest request)
        {
            long? userId = GetUserIdFromClaims();
            var result = await _reservationService.CancelReservationAsync(id, request, userId);
            return Success(result, "Cancel reservation successfully.");
        }

        // Helper to extract User ID from JWT token claims
        private long? GetUserIdFromClaims()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (long.TryParse(userIdClaim, out var parsedId))
            {
                return parsedId;
            }
            return null;
        }
    }
}
