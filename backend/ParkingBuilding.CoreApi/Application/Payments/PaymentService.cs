using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Application.Audit.Dtos;
using ParkingBuilding.CoreApi.Application.ParkingSessions.Exit;

namespace ParkingBuilding.CoreApi.Application.Payments
{
    public class PaymentService : IPaymentService
    {
        private readonly ParkingDbContext _context;
        private readonly IAuditWriterService _auditWriter;
        private readonly IFeeCalculationService _feeCalculationService;

        public PaymentService(
            ParkingDbContext context,
            IAuditWriterService auditWriter,
            IFeeCalculationService feeCalculationService)
        {
            _context = context;
            _auditWriter = auditWriter;
            _feeCalculationService = feeCalculationService;
        }

        public async Task<Payment> CreateCashPaymentAsync(CashPaymentRequest request, long staffId)
        {
            // Use pessimistic lock to prevent race conditions
            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var session = await _context.ParkingSessions
                        .FromSqlRaw("SELECT * FROM parking_sessions WHERE id = {0} FOR UPDATE", request.SessionId)
                        .FirstOrDefaultAsync();

                    if (session == null || session.Status != "ACTIVE")
                        throw new BusinessException(ErrorCodes.SessionNotFound);

                    if (!session.PaymentRequired)
                        throw new BusinessException(ErrorCodes.NoPaymentRequired);

                    bool hasFinal = await _context.Payments
                        .AnyAsync(p => p.SessionId == session.Id && (p.Status == "PAID" || p.Status == "WAIVED"));
                    if (hasFinal || session.PaymentStatus == "PAID" || session.PaymentStatus == "WAIVED")
                        throw new BusinessException(ErrorCodes.PaymentAlreadyFinal);

                    // Server-side fee calculation -- NEVER trust client amount
                    var feeResult = await _feeCalculationService.CalculateFeeAsync(
                        session.Id, DateTimeOffset.UtcNow, request.ExitGateId.HasValue);

                    if (feeResult.TotalAmount <= 0m)
                        throw new BusinessException(ErrorCodes.NoPaymentRequired);

                    var payment = new Payment
                    {
                        SessionId = session.Id,
                        Amount = feeResult.Amount,
                        LostCardFee = feeResult.LostCardFee,
                        TotalAmount = feeResult.TotalAmount,
                        Purpose = feeResult.LostCardFee > 0 ? "LOST_CARD_FEE" : "PARKING_FEE",
                        Method = "CASH",
                        Status = "PAID",
                        PaidAt = DateTimeOffset.UtcNow,
                        CollectedBy = staffId,
                        PaidByUserId = session.ClaimedByUserId,
                        ReceivedAmount = feeResult.TotalAmount,
                        CreatedAt = DateTimeOffset.UtcNow,
                        UpdatedAt = DateTimeOffset.UtcNow
                    };

                    _context.Payments.Add(payment);
                    session.PaymentStatus = "PAID";
                    session.UpdatedAt = DateTimeOffset.UtcNow;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                    {
                        Action = "PAYMENT_CREATED_CASH",
                        TargetType = "Payment",
                        TargetId = payment.Id.ToString(),
                        Reason = $"Cash payment of {payment.TotalAmount} received by Staff {staffId} for session {session.SessionCode}. Server-calculated fee.",
                        ActorUserId = staffId,
                        NewValue = JsonSerializer.Serialize(new
                        {
                            paymentId = payment.Id,
                            sessionId = session.Id,
                            totalAmount = payment.TotalAmount,
                            amount = payment.Amount,
                            lostCardFee = payment.LostCardFee,
                            method = "CASH",
                            serverCalculated = true
                        })
                    });

                    return payment;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        public async Task<Payment> CreateWaivedPaymentAsync(long sessionId, string waiveReason, long actorId, string actorRole)
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // Pessimistic lock
                    var session = await _context.ParkingSessions
                        .FromSqlRaw("SELECT * FROM parking_sessions WHERE id = {0} FOR UPDATE", sessionId)
                        .FirstOrDefaultAsync();

                    if (session == null || session.Status != "ACTIVE")
                        throw new BusinessException(ErrorCodes.SessionNotFound);

                    // 1. Check payment_required flag
                    if (!session.PaymentRequired)
                        throw new BusinessException(ErrorCodes.NoPaymentRequired);

                    // 2. Check for existing online PENDING payment (conflict)
                    bool hasOnlinePending = await _context.Payments
                        .AnyAsync(p => p.SessionId == session.Id
                                    && p.Method == "BANK_TRANSFER"
                                    && p.Status == "PENDING"
                                    && p.ExpiredAt > DateTimeOffset.UtcNow);
                    if (hasOnlinePending)
                        throw new BusinessException(ErrorCodes.PaymentAlreadyPending);

                    // 3. Check if there is already a final payment
                    bool hasFinal = await _context.Payments
                        .AnyAsync(p => p.SessionId == session.Id && (p.Status == "PAID" || p.Status == "WAIVED"));
                    if (hasFinal || session.PaymentStatus == "PAID" || session.PaymentStatus == "WAIVED")
                        throw new BusinessException(ErrorCodes.PaymentAlreadyFinal);

                    // 4. Validate waive reason
                    var trimmedReason = waiveReason?.Trim() ?? string.Empty;
                    if (string.IsNullOrWhiteSpace(trimmedReason))
                        throw new BusinessException(ErrorCodes.OverrideReasonRequired);
                    if (trimmedReason.Length < 10)
                        throw new BusinessException(ErrorCodes.WaiveReasonTooShort);
                    if (trimmedReason.Length > 500)
                        throw new BusinessException(ErrorCodes.WaiveReasonTooLong);

                    // 5. Role-based reason code restrictions
                    var staffAllowedReasons = new[] { "SYSTEM_ERROR", "FREE_EVENT", "PROMOTION" };
                    if (actorRole == "STAFF")
                    {
                        if (!staffAllowedReasons.Contains(trimmedReason, StringComparer.OrdinalIgnoreCase))
                            throw new BusinessException(ErrorCodes.WaiveReasonNotAllowed);
                    }
                    else if (actorRole != "MANAGER" && actorRole != "ADMIN")
                    {
                        throw new BusinessException(ErrorCodes.Forbidden);
                    }

                    // 6. Calculate fee server-side -- ALWAYS preserve financial integrity
                    var feeResult = await _feeCalculationService.CalculateFeeAsync(session.Id, DateTimeOffset.UtcNow, false);

                    if (feeResult.TotalAmount <= 0m)
                        throw new BusinessException(ErrorCodes.NoPaymentRequired);

                    var payment = new Payment
                    {
                        SessionId = session.Id,
                        Amount = feeResult.Amount,
                        LostCardFee = feeResult.LostCardFee,
                        TotalAmount = feeResult.TotalAmount,
                        Purpose = "PARKING_FEE",
                        Method = "NONE",
                        Status = "WAIVED",
                        PaidAt = DateTimeOffset.UtcNow,
                        CollectedBy = actorId,
                        WaiveReason = trimmedReason,
                        CreatedAt = DateTimeOffset.UtcNow,
                        UpdatedAt = DateTimeOffset.UtcNow
                    };

                    _context.Payments.Add(payment);
                    session.PaymentStatus = "WAIVED";
                    session.UpdatedAt = DateTimeOffset.UtcNow;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                    {
                        Action = "PAYMENT_WAIVED",
                        TargetType = "Payment",
                        TargetId = payment.Id.ToString(),
                        Reason = $"Payment waived by {actorRole} {actorId} for session {session.SessionCode}. Fee={payment.TotalAmount} Reason={trimmedReason}.",
                        ActorUserId = actorId,
                        NewValue = JsonSerializer.Serialize(new
                        {
                            paymentId = payment.Id,
                            sessionId = session.Id,
                            waivedAmount = payment.TotalAmount,
                            amount = payment.Amount,
                            lostCardFee = payment.LostCardFee,
                            waiveReason = trimmedReason,
                            actorRole,
                            serverCalculated = true
                        })
                    });

                    return payment;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        public async Task<Payment?> GetPaymentBySessionAsync(long sessionId)
        {
            return await _context.Payments
                .Where(p => p.SessionId == sessionId && (p.Status == "PAID" || p.Status == "WAIVED" || p.Status == "NOT_REQUIRED"))
                .OrderByDescending(p => p.PaidAt)
                .FirstOrDefaultAsync();
        }
    }
}
