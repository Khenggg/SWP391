using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ParkingBuilding.CoreApi.Application.LostCards;

namespace ParkingBuilding.CoreApi.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Staff,Manager,Admin")] // Đảm bảo chỉ người dùng đã đăng nhập mới gọi được
public class LostCardController : ControllerBase
{
    private readonly ILostCardService _lostCardService;

    public LostCardController(ILostCardService lostCardService)
    {
        _lostCardService = lostCardService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateLostCardCase([FromBody] CreateLostCardRequest request)
    {
        // 1. Lấy staffId từ JWT Claims (đã được lưu khi đăng nhập)
        var staffIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(staffIdClaim) || !long.TryParse(staffIdClaim, out var staffId))
        {
            return Unauthorized("Không thể xác định thông tin nhân viên từ token.");
        }

        // 2. Gọi Service xử lý
        var result = await _lostCardService.CreateLostCardCaseAsync(request, staffId);

        // 3. Trả về kết quả
        return Ok(new { message = "Tạo hồ sơ mất thẻ thành công.", data = result });
    }
}