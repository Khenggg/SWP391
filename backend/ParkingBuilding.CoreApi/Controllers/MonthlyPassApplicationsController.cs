using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.MonthlyPasses;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize]
    [Route("api/core/monthly-passes/applications")]
    public class MonthlyPassApplicationsController : BaseApiController
    {
        private readonly MonthlyPassApplicationService _applicationService;

        public MonthlyPassApplicationsController(MonthlyPassApplicationService applicationService)
        {
            _applicationService = applicationService;
        }

        [HttpPost]
        [Authorize(Roles = "DRIVER")]
        public async Task<IActionResult> Create([FromBody] SubmitApplicationRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _applicationService.SubmitApplicationAsync(request, userId);
            return CreatedSuccess(new
            {
                id = result.Id,
                vehicleId = result.VehicleId,
                status = result.Status,
                price = result.Price
            }, "Monthly pass application submitted successfully");
        }

        [HttpGet]
        [Authorize(Roles = "ADMIN,MANAGER,STAFF,DRIVER")]
        public async Task<IActionResult> GetList(
            [FromQuery] string? keyword,
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            var role = GetCurrentUserRole();

            var (items, totalItems, totalPages) = await _applicationService.GetListAsync(
                keyword, status, page, pageSize, userId, role
            );

            return Success(new
            {
                items,
                page,
                pageSize,
                totalItems,
                totalPages
            }, "Get monthly pass applications successfully");
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "ADMIN,MANAGER,STAFF,DRIVER")]
        public async Task<IActionResult> GetDetail(long id)
        {
            var userId = GetCurrentUserId();
            var role = GetCurrentUserRole();

            var result = await _applicationService.GetDetailAsync(id, userId, role);
            return Success(result, "Get monthly pass application successfully");
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN,MANAGER,STAFF,DRIVER")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateApplicationRequest request)
        {
            var userId = GetCurrentUserId();
            var role = GetCurrentUserRole();

            var result = await _applicationService.UpdateApplicationAsync(id, request, userId, role);
            return Success(result, "Update monthly pass application successfully");
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "ADMIN,MANAGER")]
        public async Task<IActionResult> ReviewStatus(long id, [FromBody] ReviewApplicationRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _applicationService.ReviewApplicationAsync(id, request, userId);
            return Success(result, "Monthly pass application status updated successfully");
        }

        [HttpPatch("{id}/payment")]
        [Authorize(Roles = "ADMIN,STAFF")]
        public async Task<IActionResult> ConfirmPayment(long id, [FromBody] ConfirmPaymentRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _applicationService.ConfirmPaymentAsync(id, request, userId);
            return Success(result, "Payment confirmed successfully");
        }

        [HttpPatch("{id}/assign-rfid")]
        [Authorize(Roles = "ADMIN,STAFF")]
        public async Task<IActionResult> AssignRfid(long id, [FromBody] AssignRfidRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _applicationService.AssignRfidAsync(id, request, userId);
            return Success(result, "RFID card assigned and monthly pass activated successfully");
        }

        private long GetCurrentUserId()
        {
            var userIdStr = User.FindFirst("user_id")?.Value
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(userIdStr))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            return long.Parse(userIdStr);
        }

        private string GetCurrentUserRole()
        {
            return User.FindFirst("role")?.Value
                ?? User.FindFirstValue(ClaimTypes.Role)
                ?? "DRIVER";
        }
    }
}
