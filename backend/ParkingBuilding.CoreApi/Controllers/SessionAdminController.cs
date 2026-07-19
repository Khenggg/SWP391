using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingSessions.Admin;
using ParkingBuilding.CoreApi.Contracts.Common;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers;

[Route("api/core/session-admin")]
public class SessionAdminController : BaseApiController
{
    private readonly ISessionAdminService _sessionAdminService;

    public SessionAdminController(ISessionAdminService sessionAdminService)
    {
        _sessionAdminService = sessionAdminService;
    }

    [HttpPost("{id}/cancel")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CancelActiveSession(long id, [FromBody] CancelActiveSessionRequest request)
    {
        var adminIdClaim = User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(adminIdClaim) || !long.TryParse(adminIdClaim, out var adminId))
        {
            throw new BusinessException(ErrorCodes.AuthUserIdInvalid);
        }

        var result = await _sessionAdminService.CancelActiveSessionAsync(id, request, adminId);
        
        return Success(result, "Hủy phiên gửi xe thành công và giải phóng thẻ/slot.");
    }

    [HttpPost("{id}/move-slot")]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> MoveSessionSlot(long id, [FromBody] MoveSessionSlotRequest request)
    {
        var adminIdClaim = User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(adminIdClaim) || !long.TryParse(adminIdClaim, out var adminId))
        {
            throw new BusinessException(ErrorCodes.AuthUserIdInvalid);
        }

        var result = await _sessionAdminService.MoveSessionSlotAsync(id, request, adminId);
        
        return Success(result, "Chuyển vị trí đỗ xe thành công.");
    }

    [HttpGet("search")]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> SearchSessions(
        [FromQuery] string? keyword,
        [FromQuery] long? vehicleTypeId,
        [FromQuery] string? customerType,
        [FromQuery] string? status = "ACTIVE",
        [FromQuery] string? sessionCode = null)
    {
        var result = await _sessionAdminService.SearchSessionsAsync(keyword, vehicleTypeId, customerType, status, sessionCode);
        return Success(result, "Lấy danh sách phiên đỗ xe thành công.");
    }
}
