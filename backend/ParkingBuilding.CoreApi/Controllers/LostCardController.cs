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

    private long GetCurrentUserIdOrThrow()
    {
        var userIdClaim = User.FindFirst("user_id")?.Value
            ?? User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
            throw new BusinessException(ErrorCodes.AuthUserIdMissing);
        return userId;
    }
}
