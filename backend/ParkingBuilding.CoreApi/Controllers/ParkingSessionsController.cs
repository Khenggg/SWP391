using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;
using ParkingBuilding.CoreApi.Contracts.Common; // Để sử dụng cấu trúc ApiResponse chung

namespace ParkingBuilding.CoreApi.Controllers;

[ApiController]
[Route("api/core/parking-sessions")]
public class ParkingSessionsController : ControllerBase
{
    private readonly IEntryService _entryService;

    public ParkingSessionsController(IEntryService entryService)
    {
        _entryService = entryService;
    }

    [HttpPost("entry")]
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
    }
}