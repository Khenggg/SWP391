using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingStructure.Slots;

namespace ParkingBuilding.CoreApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SlotsController : ControllerBase
{
    private readonly SlotService _service;

    public SlotsController(SlotService service)
    {
        _service = service;
    }

    // ================= CREATE SLOT =================
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSlotRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(Create), result);
    }

    // ================= UPDATE STATUS =================
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(long id, [FromBody] UpdateSlotStatusRequest request)
    {
        var result = await _service.UpdateStatusAsync(id, request);
        return Ok(result);
    }
}