using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ParkingBuilding.CoreApi.Application.LostCards;
using ParkingBuilding.CoreApi.Contracts.Common;

namespace ParkingBuilding.CoreApi.Controllers;

[Authorize(Roles = "STAFF,MANAGER,ADMIN")]
[Route("api/core/lost-cards")]
public class LostCardController : BaseApiController
{
    private readonly ILostCardService _lostCardService;

    public LostCardController(ILostCardService lostCardService)
    {
        _lostCardService = lostCardService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateLostCardCase([FromBody] CreateLostCardRequest request)
    {
        var staffId = GetCurrentUserIdOrThrow();
        var result = await _lostCardService.CreateLostCardCaseAsync(request, staffId);
        return CreatedSuccess(result, "Tao ho so mat the thanh cong.");
    }

    [HttpGet]
    [HttpGet("/api/core/lost-card-cases")]
    public async Task<IActionResult> GetList(
        [FromQuery] string? status,
        [FromQuery] string? keyword,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        var (items, totalItems, totalPages) = await _lostCardService.GetListAsync(status, keyword, page, pageSize);
        return Success(items, "Get lost card cases successfully."); // Return flat items to match frontend expectation
    }

    [HttpGet("{id:long}")]
    [HttpGet("/api/core/lost-card-cases/{id:long}")]
    public async Task<IActionResult> GetDetail(long id)
    {
        var result = await _lostCardService.GetDetailAsync(id);
        return Success(result, "Get lost card case detail successfully.");
    }

    [HttpPut("{id:long}/process")]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> ProcessLostCardCase(long id, [FromBody] ProcessLostCardRequest request)
    {
        var userId = GetCurrentUserIdOrThrow();
        var result = await _lostCardService.ProcessLostCardCaseAsync(id, request, userId);
        return Success(result, "Lost card case processed successfully.");
    }

    [HttpPost("/api/core/lost-card-cases/{id:long}/approve")]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> ApproveLostCardCaseCompatibility(long id, [FromBody] ProcessLostCardRequest request)
    {
        var userId = GetCurrentUserIdOrThrow();
        request.Status = "APPROVED"; // override status for approve endpoint
        var result = await _lostCardService.ProcessLostCardCaseAsync(id, request, userId);
        return Success(result, "Lost card case approved successfully.");
    }

    [HttpPost("/api/core/lost-card-cases/{id:long}/reject")]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> RejectLostCardCaseCompatibility(long id, [FromBody] ProcessLostCardRequest request)
    {
        var userId = GetCurrentUserIdOrThrow();
        request.Status = "REJECTED"; // override status for reject endpoint
        var result = await _lostCardService.ProcessLostCardCaseAsync(id, request, userId);
        return Success(result, "Lost card case rejected successfully.");
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