using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingSessions.Exit;
using System.Security.Claims;

namespace ParkingBuilding.CoreApi.Presentation.Controllers;

[ApiController]
[Route("api/v1/parking-sessions/exit")]
[Authorize] // Đảm bảo chỉ nhân viên bảo vệ đã đăng nhập mới gọi được
public class ExitController : ControllerBase
{
    private readonly IExitService _exitService;

    public ExitController(IExitService exitService)
    {
        _exitService = exitService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateExit([FromBody] ExitRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("id")?.Value
                        ?? User.FindFirst("UserId")?.Value;

        if (string.IsNullOrEmpty(userIdString) ||
            !long.TryParse(userIdString, out long staffId) ||
            staffId == 0)
        {
            return Unauthorized(new
            {
                message = "Cannot resolve staff id from token",
                receivedClaim = userIdString ?? "null"
            });
        }

        var session = await _exitService.FindActiveSessionByCardCodeAsync(request.CardCode ?? string.Empty);

        if (session.CustomerType == "CASUAL")
        {
            var result = await _exitService.CompleteCasualExitAsync(
    session.Id,
    request,
    staffId);
        }

        var monthlyResult = await _exitService.CompleteMonthlyPassExitAsync(
            session.Id,
            request.MonthlyExit!,
            staffId);

        return Ok(monthlyResult);
    }
}