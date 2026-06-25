using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingStructure.Slots;
using Microsoft.AspNetCore.Authorization;

namespace ParkingBuilding.CoreApi.Controllers;

[ApiController]
[Route("api/core/slots")]
public class SlotsController : ControllerBase
{
    private readonly SlotService _service;

    public SlotsController(SlotService service)
    {
        _service = service;
    }

    // ================= GET ALL =================
    [HttpGet]
    [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    // ================= CREATE SLOT =================
    [HttpPost]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateSlotRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(Create), result);
    }

    // ================= UPDATE STATUS =================
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> UpdateStatus(long id, [FromBody] UpdateSlotStatusRequest request)
    {
        var result = await _service.UpdateStatusAsync(id, request);
        return Ok(result);
    }
}