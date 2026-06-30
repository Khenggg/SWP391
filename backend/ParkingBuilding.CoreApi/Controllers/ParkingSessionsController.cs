using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;
using ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion;
using ParkingBuilding.CoreApi.Contracts.Common;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Route("api/core/parking-sessions")]
    public class ParkingSessionsController : BaseApiController
    {
        private readonly IEntryService _entryService;
        private readonly ILocationSuggestionService _suggestionService;

        public ParkingSessionsController(
            IEntryService entryService,
            ILocationSuggestionService suggestionService)
        {
            _entryService = entryService;
            _suggestionService = suggestionService;
        }

        [HttpPost("entry")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        public async Task<IActionResult> CreateEntry([FromBody] CreateEntryRequest request)
        {
            var staffId = GetCurrentUserIdOrThrow();
            var role = GetCurrentUserRoleOrDefault("STAFF");

            var result = await _entryService.CreateEntryAsync(request, staffId, role);
            return Success(result, "Cho xe vao bai thanh cong.");
        }

        [HttpPost("{qrToken}/claim")]
        [Authorize(Roles = "DRIVER")]
        public async Task<IActionResult> ClaimSession(string qrToken)
        {
            var userId = User.FindFirst("user_id")?.Value;

            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdMissing);
            }

            if (string.IsNullOrWhiteSpace(qrToken))
            {
                throw new BusinessException(ErrorCodes.QrTokenRequired);
            }

            var result = await _entryService.ClaimSessionAsync(userId, qrToken);
            if (!result)
            {
                throw new BusinessException(ErrorCodes.ClaimFailed);
            }

            return Success("Claim phien gui xe thanh cong.");
        }

        [HttpGet("location-suggestion")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        public async Task<IActionResult> SuggestLocation(
            [FromQuery] long vehicleTypeId,
            [FromQuery] long entryGateId)
        {
            var staffId = GetCurrentUserIdOrThrow();
            var role = GetCurrentUserRoleOrDefault(string.Empty);

            var result = await _suggestionService.SuggestLocationAsync(
                new LocationSuggestionRequest
                {
                    VehicleTypeId = vehicleTypeId,
                    EntryGateId = entryGateId
                },
                staffId,
                role);

            return Success(result, "Goi y vi tri thanh cong.");
        }

        [HttpPost("suggest-slot")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        [Obsolete("Use GET /api/core/parking-sessions/location-suggestion instead.")]
        public async Task<IActionResult> SuggestSlot([FromBody] SuggestSlotRequest request)
        {
            var staffId = GetCurrentUserIdOrThrow();
            var role = GetCurrentUserRoleOrDefault("STAFF");

            var suggestion = await _suggestionService.SuggestLocationAsync(new LocationSuggestionRequest
            {
                VehicleTypeId = request.VehicleTypeId,
                EntryGateId = request.EntryGateId
            }, staffId, role);

            var responseData = new
            {
                floorId = suggestion.SuggestedFloorId,
                floorCode = suggestion.SuggestedFloorCode,
                areaId = suggestion.SuggestedAreaId,
                areaCode = suggestion.SuggestedAreaCode,
                slotId = suggestion.SuggestedSlotId,
                slotCode = suggestion.SuggestedSlotCode,
                deprecated = true,
                warning = "Use GET /api/core/parking-sessions/location-suggestion instead."
            };

            return Success(responseData, "Goi y slot thanh cong (Deprecated).");
        }

        private long GetCurrentUserIdOrThrow()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdMissing);
            }

            if (!long.TryParse(userIdClaim, out var userId))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdInvalid);
            }

            return userId;
        }

        private string GetCurrentUserRoleOrDefault(string defaultRole)
        {
            return User.FindFirst(ClaimTypes.Role)?.Value
                ?? User.FindFirst("role")?.Value
                ?? defaultRole;
        }
    }

    public class SuggestSlotRequest
    {
        public long VehicleTypeId { get; set; }
        public long EntryGateId { get; set; }
    }
}
