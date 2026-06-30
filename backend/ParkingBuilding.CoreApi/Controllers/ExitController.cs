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
    public async Task<IActionResult> CreateExit([FromBody] CreateExitRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState); // Trả về chi tiết lỗi Model
        }

        try
        {
            // TÌM STAFF ID TỪ NHIỀU CLAIM KEY KHÁC NHAU
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? User.FindFirst("id")?.Value
                            ?? User.FindFirst("UserId")?.Value;

            // KIỂM TRA CHẶT CHẼ TRƯỚC KHI GỌI SERVICE
            if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long staffId) || staffId == 0)
            {
                return Unauthorized(new
                {
                    message = "Không thể xác thực ID nhân viên từ Token. Vui lòng kiểm tra lại hàm tạo Token lúc Login.",
                    receivedClaim = userIdString ?? "null"
                });
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "STAFF";

            // GỌI SERVICE VỚI STAFF ID ĐÃ CHUẨN
            var result = await _exitService.CreateExitAsync(request, staffId, role);
            return Ok(result);
        }
        catch (Exception ex)
        {
            // Trả về cả tên lỗi để biết chính xác nó ném ra cái gì
            return BadRequest(new
            {
                message = ex.Message,
                exceptionType = ex.GetType().Name
            });
        }
    }
}