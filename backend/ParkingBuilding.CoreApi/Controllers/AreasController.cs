using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingStructure.Areas;

namespace ParkingBuilding.CoreApi.Controllers;

[ApiController]
[Route("api/core/areas")]
public class AreasController : ControllerBase
{
    private readonly AreaService _service;

    public AreasController(AreaService service)
    {
        _service = service;
    }

    // CREATE
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAreaRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(Create), result);
    }

    // UPDATE
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateAreaRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Ok(result);
    }
}