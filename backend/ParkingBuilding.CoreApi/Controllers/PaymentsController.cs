using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Application.Payments;
using ParkingBuilding.CoreApi.Application.ParkingSessions.Exit;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using PayOS.Models.Webhooks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Route("api/core/payments")]
    public class PaymentsController : BaseApiController
    {
        private readonly IPayOsPaymentService _payOsPaymentService;
        private readonly IPaymentService _paymentService;
        private readonly IFeeCalculationService _feeCalculationService;
        private readonly ParkingDbContext _context;

        public PaymentsController(
            IPayOsPaymentService payOsPaymentService,
            IPaymentService paymentService,
            IFeeCalculationService feeCalculationService,
            ParkingDbContext context)
        {
            _payOsPaymentService = payOsPaymentService;
            _paymentService = paymentService;
            _feeCalculationService = feeCalculationService;
            _context = context;
        }

        [AllowAnonymous]
        [HttpPost("payos/webhook")]
        public async Task<IActionResult> PayOsWebhook([FromBody] Webhook webhook)
        {
            var result = await _payOsPaymentService.ProcessWebhookAsync(webhook);
            return Success(result, "payOS webhook processed successfully.");
        }

        [HttpPost("online/exit-fee")]
        [AllowAnonymous] // Driver can request online exit payment link anonymously or authorized
        public async Task<IActionResult> CreateOnlineExitFeeLink([FromBody] CreateOnlineExitPaymentRequest request)
        {
            ParkingSession? session = null;

            if (request.SessionId.HasValue)
            {
                session = await _context.ParkingSessions
                    .Include(s => s.ParkingCard)
                    .FirstOrDefaultAsync(s => s.Id == request.SessionId.Value && s.Status == "ACTIVE");
            }
            else if (!string.IsNullOrWhiteSpace(request.CardCode))
            {
                var card = await _context.ParkingCards
                    .FirstOrDefaultAsync(c => c.CardNumber.ToLower() == request.CardCode.Trim().ToLower());

                if (card != null && card.Status == CardStatus.IN_USE && card.CurrentSessionId.HasValue)
                {
                    session = await _context.ParkingSessions
                        .Include(s => s.ParkingCard)
                        .FirstOrDefaultAsync(s => s.Id == card.CurrentSessionId.Value && s.Status == "ACTIVE");
                }
            }

            if (session == null)
            {
                throw new BusinessException(ErrorCodes.SessionNotFound, Microsoft.AspNetCore.Http.StatusCodes.Status404NotFound);
            }

            if (session.CustomerType == "MONTHLY")
            {
                throw new BusinessException("MONTHLY_PASS_EXIT_DOES_NOT_REQUIRE_PAYMENT");
            }

            // Calculate current exit fee
            var feeResult = await _feeCalculationService.CalculateFeeAsync(session.Id, DateTimeOffset.UtcNow, false);

            if (feeResult.TotalAmount <= 0m)
            {
                return Success(new
                {
                    paymentId = 0,
                    sessionId = session.Id,
                    amount = 0m,
                    totalAmount = 0m,
                    paymentUrl = (string?)null,
                    message = "Parking fee is 0 VND. No payment required."
                }, "No payment required.");
            }

            // Check if there is an active PENDING payment link already generated in the last 15 minutes to prevent duplicates
            var existingPayment = await _context.Payments
                .Where(p => p.SessionId == session.Id && p.Purpose == "PARKING_FEE" && p.Status == "PENDING" && p.ExpiredAt > DateTimeOffset.UtcNow)
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefaultAsync();

            if (existingPayment != null && !string.IsNullOrEmpty(existingPayment.PaymentUrl))
            {
                return Success(new
                {
                    paymentId = existingPayment.Id,
                    sessionId = session.Id,
                    amount = existingPayment.Amount,
                    totalAmount = existingPayment.TotalAmount,
                    paymentUrl = existingPayment.PaymentUrl,
                    expiredAt = existingPayment.ExpiredAt
                }, "Returned existing pending payment link.");
            }

            // Otherwise, create a new payment record
            var payment = new Payment
            {
                SessionId = session.Id,
                Amount = feeResult.Amount,
                LostCardFee = feeResult.LostCardFee,
                TotalAmount = feeResult.TotalAmount,
                Purpose = "PARKING_FEE",
                Method = "BANK_TRANSFER",
                Status = "PENDING",
                ExpiredAt = DateTimeOffset.UtcNow.AddMinutes(15),
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            var payOsRes = await _payOsPaymentService.CreateExitPaymentLinkAsync(payment, session);

            return Success(new
            {
                paymentId = payment.Id,
                sessionId = session.Id,
                amount = payment.Amount,
                totalAmount = payment.TotalAmount,
                paymentUrl = payOsRes.CheckoutUrl,
                expiredAt = payOsRes.ExpiredAt
            }, "Online payment link created successfully.");
        }

        [HttpPost("cash")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        public async Task<IActionResult> CreateCashPayment([FromBody] CashPaymentRequest request)
        {
            var staffId = GetCurrentUserIdOrThrow();
            var payment = await _paymentService.CreateCashPaymentAsync(request, staffId);
            return Success(new
            {
                paymentId = payment.Id,
                sessionId = payment.SessionId,
                amount = payment.Amount,
                totalAmount = payment.TotalAmount,
                status = payment.Status,
                paidAt = payment.PaidAt
            }, "Cash payment recorded successfully.");
        }

        [HttpPost("waive")]
        [Authorize(Roles = "MANAGER,ADMIN")]
        public async Task<IActionResult> CreateWaivedPayment([FromBody] WaivePaymentRequest request)
        {
            var managerId = GetCurrentUserIdOrThrow();
            var payment = await _paymentService.CreateWaivedPaymentAsync(request.SessionId, request.WaiveReason, managerId);
            return Success(new
            {
                paymentId = payment.Id,
                sessionId = payment.SessionId,
                amount = payment.Amount,
                totalAmount = payment.TotalAmount,
                status = payment.Status,
                waiveReason = payment.WaiveReason,
                paidAt = payment.PaidAt
            }, "Payment waived successfully.");
        }

        private long GetCurrentUserIdOrThrow()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdMissing);
            }

            if (!long.TryParse(userIdClaim, out var userId))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdInvalid);
            }

            return userId;
        }
    }
}
