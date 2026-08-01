using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingSessions.Snapshots;
using ParkingBuilding.CoreApi.Contracts.Common;

namespace ParkingBuilding.CoreApi.Controllers;

[Authorize(Roles = "STAFF,MANAGER,ADMIN")]
[Route("api/core/parking-image-snapshots")]
public sealed class ParkingImageSnapshotsController : BaseApiController
{
    private readonly IParkingImageSnapshotService _snapshotService;

    public ParkingImageSnapshotsController(IParkingImageSnapshotService snapshotService)
    {
        _snapshotService = snapshotService;
    }

    [HttpPost]
    [RequestSizeLimit(10_485_760)]
    public async Task<IActionResult> Create(
        [FromBody] CreateParkingImageSnapshotRequest request,
        CancellationToken ct)
    {
        var actorUserId = GetCurrentUserIdOrThrow();
        var result = await _snapshotService.CreateAsync(request, actorUserId, ct);
        return CreatedSuccess(result, "Parking image snapshot uploaded successfully.");
    }

    private long GetCurrentUserIdOrThrow()
    {
        var userIdClaim = User.FindFirst("user_id")?.Value
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

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
}
