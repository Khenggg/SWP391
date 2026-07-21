using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;
using ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion;
using ParkingBuilding.CoreApi.Application.ParkingSessions.Exit;
using ParkingBuilding.CoreApi.Application.Mismatch;
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
        private readonly IExitService _exitService;
        private readonly IFeeCalculationService _feeCalculationService;
        private readonly IPlateMismatchService _plateMismatchService;
        private readonly ParkingBuilding.CoreApi.Application.LostCards.ILostCardService _lostCardService;

        public ParkingSessionsController(
            IEntryService entryService,
            ILocationSuggestionService suggestionService,
            IExitService exitService,
            IFeeCalculationService feeCalculationService,
            IPlateMismatchService plateMismatchService,
            ParkingBuilding.CoreApi.Application.LostCards.ILostCardService lostCardService)
        {
            _entryService = entryService;
            _suggestionService = suggestionService;
            _exitService = exitService;
            _feeCalculationService = feeCalculationService;
            _plateMismatchService = plateMismatchService;
            _lostCardService = lostCardService;
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
            return Success(result, "Claim phien gui xe thanh cong.");
        }

        [HttpGet("my-claimed-sessions")]
        [Authorize(Roles = "DRIVER")]
        public async Task<IActionResult> GetMyClaimedSessions()
        {
            var userId = User.FindFirst("user_id")?.Value;

            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdMissing);
            }

            var result = await _entryService.GetMyActiveClaimedSessionsAsync(userId);
            return Success(result, "Lay danh sach phien gui xe da lien ket thanh cong.");
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

        [HttpGet("by-card-code/{cardCode}")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        public async Task<IActionResult> GetSessionByCardCode(string cardCode)
        {
            var session = await _exitService.FindActiveSessionByCardCodeAsync(cardCode);
            return Success(new
            {
                sessionId = session.Id,
                sessionCode = session.SessionCode,
                cardCode = session.ParkingCard.CardNumber,
                plateNumber = session.PlateNumber,
                entryTime = session.EntryTime,
                customerType = session.CustomerType,
                paymentStatus = session.PaymentStatus,
                vehicleTypeId = session.VehicleTypeId,
                floorId = session.FloorId,
                areaId = session.AreaId,
                slotId = session.SlotId,
                monthlyPassId = session.MonthlyPassId,
                reservationId = session.ReservationId
            }, "Tim kiem phien gui xe theo the thanh cong.");
        }

        [HttpPost("{sessionId:long}/mismatch-case")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        public async Task<IActionResult> CreateMismatchCase(
            long sessionId,
            [FromBody] CreateSessionMismatchRequest request)
        {
            var staffId = GetCurrentUserIdOrThrow();
            var result = await _plateMismatchService.CreateMismatchAsync(new CreatePlateMismatchRequest
            {
                SessionId = sessionId,
                ExitPlateNumber = request.ExitPlateNumber,
                Reason = request.Reason,
                ExitPlateImageUrl = request.ExitPlateImageUrl,
                ExitVehicleImageUrl = request.ExitVehicleImageUrl,
                OcrConfidence = request.OcrConfidence
            }, staffId);

            return CreatedSuccess(result, "Plate mismatch case created successfully.");
        }

        [HttpPost("{sessionId:long}/mismatch/confirm")]
        [Authorize(Roles = "MANAGER,ADMIN")]
        public async Task<IActionResult> ConfirmMismatch(
            long sessionId,
            [FromBody] MismatchDecisionRequest request)
        {
            var userId = GetCurrentUserIdOrThrow();
            var result = await _plateMismatchService.ProcessPendingMismatchBySessionAsync(
                sessionId,
                new ProcessPlateMismatchRequest
                {
                    Status = "CONFIRMED",
                    Reason = request.Reason
                },
                userId);

            return Success(result, "Plate mismatch confirmed successfully.");
        }

        [HttpPost("{sessionId:long}/mismatch/reject")]
        [Authorize(Roles = "MANAGER,ADMIN")]
        public async Task<IActionResult> RejectMismatch(
            long sessionId,
            [FromBody] MismatchDecisionRequest request)
        {
            var userId = GetCurrentUserIdOrThrow();
            var result = await _plateMismatchService.ProcessPendingMismatchBySessionAsync(
                sessionId,
                new ProcessPlateMismatchRequest
                {
                    Status = "REJECTED",
                    RejectionReason = request.Reason
                },
                userId);

            return Success(result, "Plate mismatch rejected successfully.");
        }

        [HttpPost("{sessionId:long}/lost-card")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        public async Task<IActionResult> CreateLostCardCase(
            long sessionId,
            [FromBody] ParkingBuilding.CoreApi.Application.LostCards.CreateLostCardRequest request)
        {
            var staffId = GetCurrentUserIdOrThrow();
            request.SessionId = sessionId; // enforce URL match
            var result = await _lostCardService.CreateLostCardCaseAsync(request, staffId);
            return CreatedSuccess(result, "Tao ho so mat the thanh cong.");
        }

        [HttpPost("{id}/calculate-fee")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        public async Task<IActionResult> CalculateExitFee(long id, [FromBody] CalculateFeeRequest request)
        {
            var exitTime = request.ExitTime ?? DateTimeOffset.UtcNow;
            var result = await _feeCalculationService.CalculateFeeAsync(id, exitTime, request.IncludeLostCardFee);
            return Success(result, "Tinh phi gui xe thanh cong.");
        }

        [HttpPost("{id}/exit")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        public async Task<IActionResult> CompleteCasualExit(long id, [FromBody] ExitRequest request)
        {
            var staffId = GetCurrentUserIdOrThrow();
            var result = await _exitService.CompleteCasualExitAsync(id, request, staffId);
            return Success(result, "Cho xe vang lai ra bai thanh cong.");
        }

        [HttpPost("{id}/monthly-pass-exit")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        public async Task<IActionResult> CompleteMonthlyPassExit(long id, [FromBody] MonthlyPassExitRequest request)
        {
            var staffId = GetCurrentUserIdOrThrow();
            var result = await _exitService.CompleteMonthlyPassExitAsync(id, request, staffId);
            return Success(result, "Cho xe ve thang ra bai thanh cong.");
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

    public class CalculateFeeRequest
    {
        public DateTimeOffset? ExitTime { get; set; }
        public bool IncludeLostCardFee { get; set; }
    }

    public class CreateSessionMismatchRequest
    {
        public string ExitPlateNumber { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public string? ExitPlateImageUrl { get; set; }
        public string? ExitVehicleImageUrl { get; set; }
        public double? OcrConfidence { get; set; }
    }
}
