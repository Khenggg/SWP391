using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize(Roles = "ADMIN,MANAGER")]
    [Route("api/core/vehicle-types")]
    public class VehicleTypesController : BaseApiController
    {
        private readonly ParkingDbContext _context;

        public VehicleTypesController(ParkingDbContext context)
        {
            _context = context;
        }

        // 1. GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.VehicleTypes.ToListAsync();
            return Success(list, "Get vehicle types successfully");
        }

        // 2. GET BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var item = await _context.VehicleTypes.FindAsync(id);
            if (item == null) return Fail("Not Found", $"Vehicle type with ID {id} not found.");
            return Success(item, "Get vehicle type successfully");
        }

        // 3. CREATE
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] VehicleType model)
        {
            if (string.IsNullOrWhiteSpace(model.Name)) 
                return Fail("Bad Request", "Name is required.");

            _context.VehicleTypes.Add(model);
            await _context.SaveChangesAsync();
            return Success(model, "Create vehicle type successfully");
        }

        // 4. UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] VehicleType model)
        {
            var existing = await _context.VehicleTypes.FindAsync(id);
            if (existing == null) return Fail("Not Found", "Vehicle type not found.");

            existing.Name = model.Name;
            existing.Description = model.Description;
            existing.IsActive = model.IsActive;

            _context.VehicleTypes.Update(existing);
            await _context.SaveChangesAsync();
            return Success(existing, "Update vehicle type successfully");
        }

        // 5. PATCH ACTIVE STATUS
        [HttpPatch("{id}/active")]
        public async Task<IActionResult> ChangeActive(long id, [FromBody] bool isActive)
        {
            var existing = await _context.VehicleTypes.FindAsync(id);
            if (existing == null) return Fail("Not Found", "Vehicle type not found.");

            existing.IsActive = isActive;
            _context.VehicleTypes.Update(existing);
            await _context.SaveChangesAsync();
            return Success(existing, "Change active status successfully");
        }

        // 6. DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var existing = await _context.VehicleTypes.FindAsync(id);
            if (existing == null) return Fail("Not Found", "Vehicle type not found.");

            _context.VehicleTypes.Remove(existing);
            await _context.SaveChangesAsync();
            return Success(true, "Delete vehicle type successfully");
        }
    }
}
