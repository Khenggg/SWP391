using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.Payments;
using PayOS.Models.Webhooks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Route("api/core/payments")]
    public class PaymentsController : BaseApiController
    {
        private readonly IPayOsPaymentService _payOsPaymentService;

        public PaymentsController(IPayOsPaymentService payOsPaymentService)
        {
            _payOsPaymentService = payOsPaymentService;
        }

        [AllowAnonymous]
        [HttpPost("payos/webhook")]
        public async Task<IActionResult> PayOsWebhook([FromBody] Webhook webhook)
        {
            var result = await _payOsPaymentService.ProcessWebhookAsync(webhook);
            return Success(result, "payOS webhook processed successfully.");
        }
    }
}
