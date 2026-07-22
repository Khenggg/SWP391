using System;
using System.Security.Claims;
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
        [Authorize(Roles = "DRIVER,STAFF,MANAGER,ADMIN")]
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
                var cleanCode = request.CardCode.Trim();
                if (cleanCode.Contains("/"))
                {
                    var parts = cleanCode.Split('/', StringSplitOptions.RemoveEmptyEntries);
                    cleanCode = parts.Last().Split('?')[0].Trim();
                }

                var lowerClean = cleanCode.ToLower();
                var normalizedCode = lowerClean.Replace("-", "").Replace(" ", "");

                var card = await _context.ParkingCards
                    .FirstOrDefaultAsync(c => c.CardNumber.ToLower() == lowerClean ||
                                              c.CardNumber.ToLower().Replace("-", "").Replace(" ", "") == normalizedCode ||
                                              c.QrToken == cleanCode ||
                                              c.QrToken.ToLower().Contains(lowerClean) ||
                                              c.Id.ToString() == cleanCode);

                if (card != null
                    && (card.Status == CardStatus.IN_USE || card.Status == CardStatus.LOST)
                    && card.CurrentSessionId.HasValue)
                {
                    session = await _context.ParkingSessions
                        .Include(s => s.ParkingCard)
                        .FirstOrDefaultAsync(s => s.Id == card.CurrentSessionId.Value && s.Status == "ACTIVE");
                }
            }

            if (session == null)
                throw new BusinessException(ErrorCodes.SessionNotFound, StatusCodes.Status404NotFound);

            var role = User.FindFirst(ClaimTypes.Role)?.Value
                ?? User.FindFirst("role")?.Value
                ?? string.Empty;

            if (string.Equals(role, "DRIVER", StringComparison.OrdinalIgnoreCase))
            {
                var driverUserId = GetCurrentUserIdOrThrow();
                var isLinkedToDriver = session.ClaimedByUserId == driverUserId
                    || (session.DriverId.HasValue && await _context.DriverProfiles
                        .AnyAsync(profile => profile.Id == session.DriverId.Value && profile.UserId == driverUserId));

                if (!isLinkedToDriver)
                {
                    throw new BusinessException(ErrorCodes.SessionNotOwnedByDriver);
                }
            }

            var hasApprovedLostCard = await _context.LostCardCases
                .AnyAsync(lostCardCase => lostCardCase.SessionId == session.Id && lostCardCase.Status == "APPROVED");

            if (session.CustomerType == "MONTHLY" && !hasApprovedLostCard)
                throw new BusinessException(ErrorCodes.InvalidRequest);

            if (session.PaymentStatus == "PAID" || session.PaymentStatus == "WAIVED")
                throw new BusinessException(ErrorCodes.PaymentAlreadyFinal);

            var feeResult = await _feeCalculationService.CalculateFeeAsync(
                session.Id,
                DateTimeOffset.UtcNow,
                hasApprovedLostCard);

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

            var expectedPurpose = hasApprovedLostCard ? "LOST_CARD_FEE" : "PARKING_FEE";
            var existingPayment = await _context.Payments
                .Where(p => p.SessionId == session.Id
                         && p.Purpose == expectedPurpose
                         && p.Status == "PENDING"
                         && p.TotalAmount >= feeResult.TotalAmount
                         && p.LostCardFee >= feeResult.LostCardFee
                         && p.ExpiredAt > DateTimeOffset.UtcNow)
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefaultAsync();

            if (existingPayment != null && !string.IsNullOrEmpty(existingPayment.PaymentUrl))
            {
                string? existingQrCode = null;
                if (!string.IsNullOrEmpty(existingPayment.GatewayPayload))
                {
                    try
                    {
                        using var doc = System.Text.Json.JsonDocument.Parse(existingPayment.GatewayPayload);
                        if (doc.RootElement.TryGetProperty("QrCode", out var qrProp) || doc.RootElement.TryGetProperty("qrCode", out qrProp))
                        {
                            existingQrCode = qrProp.GetString();
                        }
                    }
                    catch { }
                }

                return Success(new
                {
                    paymentId = existingPayment.Id,
                    sessionId = session.Id,
                    amount = existingPayment.Amount,
                    totalAmount = existingPayment.TotalAmount,
                    paymentUrl = existingPayment.PaymentUrl,
                    qrCode = existingQrCode,
                    expiredAt = existingPayment.ExpiredAt
                }, "Returned existing pending payment link.");
            }

            var payment = new Payment
            {
                SessionId = session.Id,
                Amount = feeResult.Amount,
                LostCardFee = feeResult.LostCardFee,
                TotalAmount = feeResult.TotalAmount,
                Purpose = expectedPurpose,
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
                qrCode = payOsRes.QrCode,
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
                lostCardFee = payment.LostCardFee,
                totalAmount = payment.TotalAmount,
                status = payment.Status,
                paidAt = payment.PaidAt
            }, "Cash payment recorded successfully.");
        }

        [HttpPost("waive")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        public async Task<IActionResult> CreateWaivedPayment([FromBody] WaivePaymentRequest request)
        {
            var actorId = GetCurrentUserIdOrThrow();
            var actorRole = User.FindFirst(ClaimTypes.Role)?.Value
                ?? User.FindFirst("role")?.Value
                ?? "STAFF";

            var payment = await _paymentService.CreateWaivedPaymentAsync(
                request.SessionId, request.WaiveReason, actorId, actorRole);

            return Success(new
            {
                paymentId = payment.Id,
                sessionId = payment.SessionId,
                amount = payment.Amount,
                lostCardFee = payment.LostCardFee,
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
                throw new BusinessException(ErrorCodes.AuthUserIdMissing);
            if (!long.TryParse(userIdClaim, out var userId))
                throw new BusinessException(ErrorCodes.AuthUserIdInvalid);
            return userId;
        }
    }
}
