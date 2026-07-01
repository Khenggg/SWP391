using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.Mismatches;
using ParkingBuilding.CoreApi.Application.Mismatches.Dtos;
using System.Security.Claims;

namespace ParkingBuilding.CoreApi.Controllers;

[ApiController]
[Route("api/mismatches")]
public class MismatchController : ControllerBase
{
    private readonly IMismatchService _mismatchService;

    public MismatchController(IMismatchService mismatchService)
    {
        _mismatchService = mismatchService;
    }

    [HttpPatch("{id}/process")]
    [Authorize(Roles = "Manager,Admin")] // Chỉ quản lý/admin mới được duyệt
    public async Task<IActionResult> ProcessMismatch(long id, [FromBody] ProcessMismatchRequest request)
    {
        var staffIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(staffIdClaim) || !long.TryParse(staffIdClaim, out var staffId))
        {
            return Unauthorized("Không xác định thông tin người dùng.");
        }

        await _mismatchService.ResolveMismatchCaseAsync(id, request.IsConfirmed, staffId, request.Reason);

        return Ok(new { message = "Xử lý hồ sơ thành công." });
    }
}