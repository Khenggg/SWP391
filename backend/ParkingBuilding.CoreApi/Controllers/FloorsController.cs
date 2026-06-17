using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Contracts.Requests;
using ParkingBuilding.CoreApi.Contracts.Responses;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Route("api/core/floors")]
    public class FloorsController : BaseApiController
    {
        private readonly ParkingDbContext _dbContext;

        public FloorsController(ParkingDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetFloors()
        {
            var floors = await _dbContext.Floors
                .Select(f => new FloorResponse
                {
                    Id = f.Id,
                    FloorCode = f.FloorCode,
                    FloorName = f.FloorName,
                    Status = f.Status,
                    CreatedAt = f.CreatedAt,
                    UpdatedAt = f.UpdatedAt
                })
                .ToListAsync();

            return Success(floors, "Floors retrieved successfully.");
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateFloor([FromBody] CreateFloorRequest request)
        {
            if (!IsManagerOrAdmin())
            {
                return StatusCodeResponse(403, "Forbidden", "Only MANAGER or ADMIN can create floors.");
            }

            if (request == null)
            {
                return Fail("Validation failed", "Request body is required.");
            }

            if (await _dbContext.Floors.AnyAsync(f => f.FloorCode.ToLower() == request.FloorCode.ToLower()))
            {
                return Fail("Validation failed", "Floor code already exists.");
            }

            var newFloor = new Floor
            {
                FloorCode = request.FloorCode.Trim(),
                FloorName = request.FloorName.Trim(),
                Status = request.Status.Trim()
            };

            await _dbContext.Floors.AddAsync(newFloor);
            await _dbContext.SaveChangesAsync();

            var response = new FloorResponse
            {
                Id = newFloor.Id,
                FloorCode = newFloor.FloorCode,
                FloorName = newFloor.FloorName,
                Status = newFloor.Status,
                CreatedAt = newFloor.CreatedAt,
                UpdatedAt = newFloor.UpdatedAt
            };

            return Success(response, "Floor created successfully.");
        }

        [HttpPut("{id:long}")]
        [Authorize]
        public async Task<IActionResult> UpdateFloor(long id, [FromBody] UpdateFloorRequest request)
        {
            if (!IsManagerOrAdmin())
            {
                return StatusCodeResponse(403, "Forbidden", "Only MANAGER or ADMIN can update floors.");
            }

            if (request == null)
            {
                return Fail("Validation failed", "Request body is required.");
            }

            var floor = await _dbContext.Floors.FirstOrDefaultAsync(f => f.Id == id);
            if (floor == null)
            {
                return Fail("Not found", "Floor not found.");
            }

            floor.FloorName = request.FloorName.Trim();
            floor.Status = request.Status.Trim();
            floor.UpdatedAt = DateTimeOffset.UtcNow;

            _dbContext.Floors.Update(floor);
            await _dbContext.SaveChangesAsync();

            var response = new FloorResponse
            {
                Id = floor.Id,
                FloorCode = floor.FloorCode,
                FloorName = floor.FloorName,
                Status = floor.Status,
                CreatedAt = floor.CreatedAt,
                UpdatedAt = floor.UpdatedAt
            };

            return Success(response, "Floor updated successfully.");
        }

        private bool IsManagerOrAdmin()
        {
            var roleClaim = User.FindFirst("role")?.Value;
            return roleClaim == "MANAGER" || roleClaim == "ADMIN";
        }
    }
}
