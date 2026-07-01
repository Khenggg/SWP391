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

namespace ParkingBuilding.CoreApi.Application.Payments
{
    public class PaymentService : IPaymentService
    {
        private readonly ParkingDbContext _context;
        private readonly IAuditWriterService _auditWriter;

        public PaymentService(ParkingDbContext context, IAuditWriterService auditWriter)
        {
            _context = context;
            _auditWriter = auditWriter;
        }

        public async Task<Payment> CreateCashPaymentAsync(CashPaymentRequest request, long staffId)
        {
            var session = await _context.ParkingSessions
                .FirstOrDefaultAsync(s => s.Id == request.SessionId);

            if (session == null || session.Status != "ACTIVE")
            {
                throw new BusinessException(ErrorCodes.SessionNotFound);
            }

            // Check if there is already a final payment
            bool hasFinal = await _context.Payments
                .AnyAsync(p => p.SessionId == session.Id && (p.Status == "PAID" || p.Status == "WAIVED"));

            if (hasFinal || session.PaymentStatus == "PAID" || session.PaymentStatus == "WAIVED")
            {
                throw new BusinessException(ErrorCodes.PaymentAlreadyFinal);
            }

            if (request.TotalAmount != request.Amount + request.LostCardFee)
            {
                throw new BusinessException(ErrorCodes.PaymentAmountMismatch);
            }

            var payment = new Payment
            {
                SessionId = session.Id,
                Amount = request.Amount,
                LostCardFee = request.LostCardFee,
                TotalAmount = request.TotalAmount,
                Purpose = request.LostCardFee > 0 ? "LOST_CARD_FEE" : "PARKING_FEE",
                Method = "CASH",
                Status = "PAID",
                PaidAt = DateTimeOffset.UtcNow,
                CollectedBy = staffId,
                PaidByUserId = session.ClaimedByUserId,
                ReceivedAmount = request.TotalAmount,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.Payments.Add(payment);
            session.PaymentStatus = "PAID";
            session.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
            {
                Action = "PAYMENT_CREATED_CASH",
                TargetType = "Payment",
                TargetId = payment.Id.ToString(),
                Reason = $"Cash payment of {payment.TotalAmount} received by Staff {staffId} for session {session.SessionCode}.",
                ActorUserId = staffId,
                NewValue = JsonSerializer.Serialize(new
                {
                    paymentId = payment.Id,
                    sessionId = session.Id,
                    totalAmount = payment.TotalAmount,
                    method = "CASH"
                })
            });

            return payment;
        }

        public async Task<Payment> CreateWaivedPaymentAsync(long sessionId, string waiveReason, long managerId)
        {
            var session = await _context.ParkingSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null || session.Status != "ACTIVE")
            {
                throw new BusinessException(ErrorCodes.SessionNotFound);
            }

            // Check if there is already a final payment
            bool hasFinal = await _context.Payments
                .AnyAsync(p => p.SessionId == session.Id && (p.Status == "PAID" || p.Status == "WAIVED"));

            if (hasFinal || session.PaymentStatus == "PAID" || session.PaymentStatus == "WAIVED")
            {
                throw new BusinessException(ErrorCodes.PaymentAlreadyFinal);
            }

            if (string.IsNullOrWhiteSpace(waiveReason))
            {
                throw new BusinessException(ErrorCodes.OverrideReasonRequired);
            }

            var payment = new Payment
            {
                SessionId = session.Id,
                Amount = 0m,
                LostCardFee = 0m,
                TotalAmount = 0m,
                Purpose = "PARKING_FEE",
                Method = "NONE",
                Status = "WAIVED",
                PaidAt = DateTimeOffset.UtcNow,
                CollectedBy = managerId,
                WaiveReason = waiveReason,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.Payments.Add(payment);
            session.PaymentStatus = "WAIVED";
            session.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
            {
                Action = "PAYMENT_WAIVED",
                TargetType = "Payment",
                TargetId = payment.Id.ToString(),
                Reason = $"Payment waived by Manager {managerId} for session {session.SessionCode}. Reason: {waiveReason}.",
                ActorUserId = managerId,
                NewValue = JsonSerializer.Serialize(new
                {
                    paymentId = payment.Id,
                    sessionId = session.Id,
                    waiveReason
                })
            });

            return payment;
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
