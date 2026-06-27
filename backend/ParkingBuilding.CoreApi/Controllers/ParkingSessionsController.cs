using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;
using ParkingBuilding.CoreApi.Application.ParkingSessions.SlotSuggestion;
using ParkingBuilding.CoreApi.Contracts.Common; // Để sử dụng cấu trúc ApiResponse chung
using Microsoft.AspNetCore.Authorization; // Cần thiết cho [Authorize]
using System.Security.Claims;             // Cần thiết cho ClaimTypes
namespace ParkingBuilding.CoreApi.Controllers;


[ApiController]
[Route("api/core/parking-sessions")]
public class ParkingSessionsController : ControllerBase
{
    private readonly IEntryService _entryService;
    private readonly ISlotSuggestionService _slotSuggestionService;

    public ParkingSessionsController(IEntryService entryService, ISlotSuggestionService slotSuggestionService)
    {
        _entryService = entryService;
        _slotSuggestionService = slotSuggestionService;
    }

    [HttpPost("entry")]
    [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
    public async Task<IActionResult> CreateEntry([FromBody] CreateEntryRequest request)
    {
        try
        {
            await _entryService.CreateEntryAsync(request);

            // Đồng bộ định dạng trả về dùng ApiResponse.SuccessResult hoặc tương đương
            var response = ApiResponse.SuccessResult("Cho xe vào bãi thành công.");
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            var response = ApiResponse.FailureResult("Yêu cầu không hợp lệ", ex.Message);
            return BadRequest(response);
        }
        catch (InvalidOperationException ex)
        {
            var response = ApiResponse.FailureResult("Lỗi xử lý nghiệp vụ", ex.Message);
            return BadRequest(response);
        }
        catch (Exception ex)
        {
            // Kiểm tra nếu là lỗi do bạn tự throw trong Service (Ví dụ: CARD_NOT_AVAILABLE)
            // Nếu bạn muốn code sạch hơn, hãy tạo một custom Exception như ParkingException
            var response = ApiResponse.FailureResult("Lỗi hệ thống", ex.Message);
            return BadRequest(response);
        }
    }



    [HttpPost("{qrToken}/claim")]
    [Authorize]
    public async Task<IActionResult> ClaimSession(string qrToken)
    {
        var userIdClaim = User.FindFirst("user_id")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized(ApiResponse.FailureResult("Tài khoản không hợp lệ."));

        var result = await _entryService.ClaimSessionAsync(userIdClaim, qrToken);

        if (!result)
            return BadRequest(ApiResponse.FailureResult("Lượt đỗ không hợp lệ hoặc đã thuộc về tài khoản khác."));

        return Ok(ApiResponse.SuccessResult("Liên kết lượt đỗ thành công."));
    }

    [HttpPost("suggest-slot")]
    [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
    public async Task<IActionResult> SuggestSlot([FromBody] SuggestSlotRequest request)
    {
        try
        {
            var result = await _slotSuggestionService.SuggestSlotAsync(request);
            if (result == null)
            {
                return NotFound(ApiResponse.FailureResult("Không tìm thấy vị trí đỗ phù hợp còn trống."));
            }

            var response = ApiResponse.SuccessResult(result, "Gợi ý vị trí đỗ thành công.");
            return Ok(response);
        }
        catch (Exception ex)
        {
            var response = ApiResponse.FailureResult("Lỗi khi gợi ý vị trí đỗ", ex.Message);
            return BadRequest(response);
        }
    }
}