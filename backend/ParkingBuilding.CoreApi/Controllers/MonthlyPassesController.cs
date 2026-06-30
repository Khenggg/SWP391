using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Application.MonthlyPasses;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize(Roles = "ADMIN,MANAGER")]
    [Route("api/core/monthly-passes")]
    public class MonthlyPassesController : BaseApiController
    {
        private readonly IMonthlyPassService _monthlyPassService;
        private readonly ParkingDbContext _context;

        public MonthlyPassesController(IMonthlyPassService monthlyPassService, ParkingDbContext context)
        {
            _monthlyPassService = monthlyPassService;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? search)
        {
            var query = _context.MonthlyPasses
                .Include(p => p.Floor)
                .Include(p => p.Area)
                .Include(p => p.Slot)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(p => p.Status == status.ToUpperInvariant());
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.OwnerName.Contains(search) || p.PlateNumber.Contains(search));
            }

            var list = await query.ToListAsync();
            return Success(list, "Get monthly passes successfully");
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMonthlyPassRequest request)
        {
            var userId = GetCurrentUserIdOrDefault();
            var result = await _monthlyPassService.CreateMonthlyPassAsync(request, userId);
            return CreatedSuccess(result, "Create monthly pass successfully");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateMonthlyPassRequest request)
        {
            var userId = GetCurrentUserIdOrDefault();
            var result = await _monthlyPassService.UpdateMonthlyPassAsync(id, request, userId);
            return Success(result, "Update monthly pass successfully");
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeStatus(long id, [FromBody] string status)
        {
            var userId = GetCurrentUserIdOrDefault();
            var result = await _monthlyPassService.ChangeStatusAsync(id, status, userId);
            return Success(result, "Change status successfully");
        }

        [HttpPost("{id}/renew")]
        public async Task<IActionResult> Renew(long id, [FromBody] RenewMonthlyPassRequest request)
        {
            var userId = GetCurrentUserIdOrDefault();
            var result = await _monthlyPassService.RenewAsync(id, request, userId);
            return Success(result, "Renew monthly pass successfully");
        }

        [Authorize(Roles = "ADMIN,MANAGER,STAFF")]
        [HttpGet("check")]
        public async Task<IActionResult> Check([FromQuery] string plateNumber, [FromQuery] long vehicleTypeId)
        {
            var pass = await _monthlyPassService.FindValidPassAsync(plateNumber, vehicleTypeId, DateTimeOffset.UtcNow);
            if (pass == null)
            {
                throw new BusinessException(ErrorCodes.MonthlyPassNotFound, StatusCodes.Status404NotFound);
            }

            return Success(pass, "Active monthly pass found");
        }

        private long GetCurrentUserIdOrDefault()
        {
            var userIdStr = User.FindFirst("user_id")?.Value
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? "1";

            return long.TryParse(userIdStr, out var userId) ? userId : 1;
        }
    }
}
