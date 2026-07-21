using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ParkingBuilding.CoreApi.Application.Mismatch;
using ParkingBuilding.CoreApi.Contracts.Common;

namespace ParkingBuilding.CoreApi.Controllers;

[Authorize(Roles = "STAFF,MANAGER,ADMIN")]
[Route("api/core/plate-mismatches")]
public class PlateMismatchController : BaseApiController
{
    private readonly IPlateMismatchService _mismatchService;

    public PlateMismatchController(IPlateMismatchService mismatchService)
    {
        _mismatchService = mismatchService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateMismatch([FromBody] CreatePlateMismatchRequest request)
    {
        var staffId = GetCurrentUserIdOrThrow();
        var result = await _mismatchService.CreateMismatchAsync(request, staffId);
        return CreatedSuccess(result, "Plate mismatch case created successfully.");
    }

    [HttpGet]
    public async Task<IActionResult> GetList(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mismatchService.GetListAsync(status, page, pageSize);
        return Success(new { items = result, page, pageSize }, "Get plate mismatch cases successfully.");
    }

    [HttpGet("/api/core/plate-mismatch-cases")]
    public async Task<IActionResult> GetCompatibilityList(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        var result = await _mismatchService.GetListAsync(status, page, pageSize);
        return Success(result, "Get plate mismatch cases successfully.");
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var result = await _mismatchService.GetByIdAsync(id);
        if (result == null)
            return NotFound(new { success = false, message = "Mismatch case not found." });
        return Success(result, "Get plate mismatch case successfully.");
    }

    [HttpGet("session/{sessionId:long}/status")]
    public async Task<IActionResult> GetBySession(long sessionId)
    {
        var result = await _mismatchService.GetBySessionIdAsync(sessionId);
        if (result == null)
            return Success(new
            {
                status = "NONE",
                managerReason = (string?)null,
                rejectionReason = (string?)null
            }, "No mismatch case for this session.");
        return Success(result, "Get mismatch status successfully.");
    }

    [HttpPatch("{caseId:long}/status")]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> ProcessMismatch(long caseId, [FromBody] ProcessPlateMismatchRequest request)
    {
        var userId = GetCurrentUserIdOrThrow();
        var result = await _mismatchService.ProcessMismatchAsync(caseId, request, userId);
        return Success(result, "Plate mismatch case processed successfully.");
    }

    private long GetCurrentUserIdOrThrow()
    {
        var userIdClaim = User.FindFirst("user_id")?.Value
            ?? User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
            throw new BusinessException(ErrorCodes.AuthUserIdMissing);
        return userId;
    }
}
