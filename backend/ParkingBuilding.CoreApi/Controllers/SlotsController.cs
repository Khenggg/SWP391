using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingStructure.Slots;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers;

[ApiController]
[Route("api/core/slots")]
public class SlotsController : BaseApiController
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
        return Success(result, "Get slots successfully.");
    }

    // ================= CREATE SLOT =================
    [HttpPost]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateSlotRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedSuccess(result, "Create slot successfully.");
    }

    // ================= UPDATE STATUS =================
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> UpdateStatus(long id, [FromBody] UpdateSlotStatusRequest request)
    {
        var result = await _service.UpdateStatusAsync(id, request);
        return Success(result, "Update slot status successfully.");
    }
}