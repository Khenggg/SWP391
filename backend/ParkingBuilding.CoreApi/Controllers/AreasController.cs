using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingStructure.Areas;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers;

[ApiController]
[Route("api/core/areas")]
public class AreasController : BaseApiController
{
    private readonly AreaService _service;

    public AreasController(AreaService service)
    {
        _service = service;
    }

    // GET ALL
    [HttpGet]
    [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Success(result, "Get areas successfully.");
    }

    // CREATE
    [HttpPost]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateAreaRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedSuccess(result, "Create area successfully.");
    }

    // UPDATE
    [HttpPut("{id}")]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateAreaRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Success(result, "Update area successfully.");
    }
}