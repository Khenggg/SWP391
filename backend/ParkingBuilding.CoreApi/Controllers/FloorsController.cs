using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingStructure.Floors;
using Microsoft.AspNetCore.Authorization;

namespace ParkingBuilding.CoreApi.Controllers;

[ApiController]
[Route("api/core/floors")]
public class FloorsController : ControllerBase
{
    private readonly FloorService _service;

    public FloorsController(FloorService service)
    {
        _service = service;
    }

    // GET ALL
    [HttpGet]
    [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    // CREATE
    [HttpPost]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateFloorRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(Create), result);
    }

    // UPDATE
    [HttpPut("{id}")]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateFloorRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Ok(result);
    }
}