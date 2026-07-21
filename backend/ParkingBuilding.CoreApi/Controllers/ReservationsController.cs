using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.Reservations;
using ParkingBuilding.CoreApi.Contracts.Common;
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

        [HttpGet("available-locations")]
        public async Task<IActionResult> GetAvailableLocations([FromQuery] long vehicleTypeId)
        {
            var result = await _reservationService.GetAvailableLocationsAsync(vehicleTypeId);
            return Success(result, "Get available locations successfully.");
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReservationRequest request)
        {
            var actorUserId = GetRequiredUserId();

            var actorRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value
                ?? User.FindFirst("role")?.Value
                ?? string.Empty;

            var result = await _reservationService.CreateReservationAsync(request, actorUserId, actorRole);
            return CreatedSuccess(result, "Create reservation successfully.");
        }

        [HttpPost("{id}/extend")]
        public async Task<IActionResult> Extend(long id, [FromBody] ExtendReservationRequest request)
        {
            long? userId = GetUserIdFromClaims();
            var result = await _reservationService.ExtendReservationAsync(id, request, userId);
            return Success(result, "Extend reservation successfully.");
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> Cancel(long id, [FromBody] CancelReservationRequest request)
        {
            long? userId = GetUserIdFromClaims();
            var result = await _reservationService.CancelReservationAsync(id, request, userId);
            return Success(result, "Cancel reservation successfully.");
        }

        [HttpGet("{id}/payment-status")]
        public async Task<IActionResult> GetPaymentStatus(long id)
        {
            var result = await _reservationService.GetPaymentStatusAsync(id);
            return Success(result, "Get reservation payment status successfully.");
        }

        [HttpGet("{reservationCode}/entry-check")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        public async Task<IActionResult> CheckReservationForEntry(
            string reservationCode,
            [FromQuery] long entryGateId)
        {
            var staffId = GetRequiredUserId();

            var result = await _reservationService.CheckReservationForEntryAsync(
                reservationCode,
                entryGateId,
                staffId);

            return Success(result, "Kiem tra reservation thanh cong.");
        }

        private long GetRequiredUserId()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value
                ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdMissing);
            }

            if (!long.TryParse(userIdClaim, out var userId))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdInvalid);
            }

            return userId;
        }

        private long? GetUserIdFromClaims()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value
                ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            return long.TryParse(userIdClaim, out var parsedId) ? parsedId : null;
        }
    }
}
