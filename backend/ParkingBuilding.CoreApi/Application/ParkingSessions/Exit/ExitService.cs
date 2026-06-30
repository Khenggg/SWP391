using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Application.Audit.Dtos;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Exit
{
    public class ExitService : IExitService
    {
        private readonly ParkingDbContext _context;
        private readonly IFeeCalculationService _feeCalculationService;
        private readonly IAuditWriterService _auditWriter;

        public ExitService(
            ParkingDbContext context,
            IFeeCalculationService feeCalculationService,
            IAuditWriterService auditWriter)
        {
            _context = context;
            _feeCalculationService = feeCalculationService;
            _auditWriter = auditWriter;
        }

        public async Task<ParkingSession> FindActiveSessionByCardCodeAsync(string cardCode)
        {
            if (string.IsNullOrWhiteSpace(cardCode))
            {
                throw new BusinessException(ErrorCodes.CardCodeRequired);
            }

            var card = await _context.ParkingCards
                .FirstOrDefaultAsync(c => c.CardNumber.ToLower() == cardCode.Trim().ToLower());

            if (card == null)
            {
                throw new BusinessException(ErrorCodes.CardNotFound, StatusCodes.Status404NotFound);
            }

            if (card.Status != CardStatus.IN_USE || !card.CurrentSessionId.HasValue)
            {
                throw new BusinessException(ErrorCodes.CardHasNoActiveSession);
            }

            var session = await _context.ParkingSessions
                .Include(s => s.ParkingCard)
                .Include(s => s.PricingRule)
                .Include(s => s.Reservation)
                .FirstOrDefaultAsync(s => s.Id == card.CurrentSessionId.Value && s.Status == "ACTIVE");

            if (session == null)
            {
                throw new BusinessException(ErrorCodes.SessionNotFound, StatusCodes.Status404NotFound);
            }

            return session;
        }

        public async Task<ExitResponse> CompleteCasualExitAsync(long sessionId, ExitRequest request, long staffId)
        {
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                var session = await _context.ParkingSessions
                    .Include(s => s.ParkingCard)
                    .FirstOrDefaultAsync(s => s.Id == sessionId);

                if (session == null || session.Status != "ACTIVE")
                {
                    throw new BusinessException(ErrorCodes.SessionNotFound);
                }

                if (session.CustomerType != "CASUAL")
                {
                    throw new BusinessException(ErrorCodes.InvalidRequest);
                }

                var gate = await _context.Gates.FindAsync(request.ExitGateId);
                if (gate == null || gate.GateType != "EXIT" || gate.Status != "ACTIVE")
                {
                    throw new BusinessException("INVALID_EXIT_GATE");
                }

                // Plate verification before transaction to prevent rollback of mismatch case log
                var normalizedEntry = NormalizePlate(session.PlateNumber);
                var exitPlateInput = !string.IsNullOrWhiteSpace(request.ExitPlateNumber) ? request.ExitPlateNumber : request.DetectedPlateNumber;
                var normalizedExit = NormalizePlate(exitPlateInput);
                if (!string.IsNullOrEmpty(normalizedEntry) && normalizedEntry != normalizedExit)
                {
                    var isConfirmedMismatch = await _context.PlateMismatchCases
                        .AnyAsync(m => m.SessionId == session.Id && m.Status == "CONFIRMED");

                    if (!isConfirmedMismatch)
                    {
                        throw new BusinessException("PLATE_MISMATCH_REQUIRES_APPROVAL");
                    }
                }

                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Save exit images if not already saved during plate mismatch logic
                    var imagesAlreadySaved = await _context.ParkingSessionImages
                        .AnyAsync(i => i.SessionId == session.Id && (i.ImageType == "EXIT_PLATE" || i.ImageType == "EXIT_VEHICLE"));

                    if (!imagesAlreadySaved)
                    {
                        if (!string.IsNullOrWhiteSpace(request.ExitPlateImageUrl))
                        {
                            _context.ParkingSessionImages.Add(new ParkingSessionImage
                            {
                                SessionId = session.Id,
                                ImageUrl = request.ExitPlateImageUrl,
                                ImageType = "EXIT_PLATE",
                                Confidence = request.OcrConfidence.HasValue ? (decimal)request.OcrConfidence.Value : null,
                                CapturedAt = DateTimeOffset.UtcNow
                            });
                        }
                        if (!string.IsNullOrWhiteSpace(request.ExitVehicleImageUrl))
                        {
                            _context.ParkingSessionImages.Add(new ParkingSessionImage
                            {
                                SessionId = session.Id,
                                ImageUrl = request.ExitVehicleImageUrl,
                                ImageType = "EXIT_VEHICLE",
                                CapturedAt = DateTimeOffset.UtcNow
                            });
                        }
                    }

                    var exitTime = request.ExitTime ?? DateTimeOffset.UtcNow;
                    var feeResult = await _feeCalculationService.CalculateFeeAsync(session.Id, exitTime, false);

                    // Validate payment
                    if (session.PaymentStatus != "PAID")
                    {
                        if (request.PaymentId.HasValue)
                        {
                            var cashPayment = await _context.Payments
                                .FirstOrDefaultAsync(p => p.Id == request.PaymentId.Value && p.SessionId == session.Id && p.Status == "PAID");

                            if (cashPayment == null)
                            {
                                throw new BusinessException("PAYMENT_REQUIRED_BEFORE_EXIT");
                            }

                            session.PaymentStatus = "PAID";
                        }
                        else
                        {
                            throw new BusinessException("PAYMENT_REQUIRED_BEFORE_EXIT");
                        }
                    }
                    else
                    {
                        // Verified that they paid online, check buffer time
                        var onlinePayment = await _context.Payments
                            .Where(p => p.SessionId == session.Id && p.Purpose == "PARKING_FEE" && p.Status == "PAID")
                            .OrderByDescending(p => p.PaidAt)
                            .FirstOrDefaultAsync();

                        if (onlinePayment != null)
                        {
                            if (onlinePayment.PaymentValidUntil.HasValue && exitTime > onlinePayment.PaymentValidUntil.Value)
                            {
                                // Overdue buffer time! Mark back to PENDING.
                                session.PaymentStatus = "PENDING";
                                await _context.SaveChangesAsync();
                                throw new BusinessException("PAYMENT_REQUIRED_BEFORE_EXIT");
                            }
                        }
                    }

                    // Complete session
                    session.Status = "COMPLETED";
                    session.ExitTime = exitTime;
                    session.ExitGateId = request.ExitGateId;
                    session.ExitStaffId = staffId;
                    session.UpdatedAt = DateTimeOffset.UtcNow;

                    // Release card
                    var card = session.ParkingCard;
                    card.Status = CardStatus.AVAILABLE;
                    card.CurrentSessionId = null;
                    card.UpdatedAt = DateTime.UtcNow;

                    // Release slot if any
                    if (session.SlotId.HasValue)
                    {
                        var slot = await _context.Slots.Include(s => s.Area).FirstOrDefaultAsync(s => s.Id == session.SlotId.Value);
                        if (slot != null)
                        {
                            slot.Status = "AVAILABLE";
                            slot.CurrentSessionId = null;
                            slot.UpdatedAt = DateTimeOffset.UtcNow;
                            slot.Area.CurrentRealOccupancy = Math.Max(0, slot.Area.CurrentRealOccupancy - 1);
                            slot.Area.UpdatedAt = DateTimeOffset.UtcNow;
                        }
                    }
                    else
                    {
                        // Decrement area real occupancy
                        var area = await _context.Areas.FindAsync(session.AreaId);
                        if (area != null)
                        {
                            area.CurrentRealOccupancy = Math.Max(0, area.CurrentRealOccupancy - 1);
                            area.UpdatedAt = DateTimeOffset.UtcNow;
                        }
                    }

                    // Generate Receipt
                    var receiptCode = $"REC-{exitTime:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
                    var vehicleType = await _context.VehicleTypes.FindAsync(session.VehicleTypeId);

                    var receipt = new Receipt
                    {
                        ReceiptCode = receiptCode,
                        SessionId = session.Id,
                        CardCode = card.CardNumber,
                        PlateNumber = session.PlateNumber,
                        VehicleTypeName = vehicleType?.Name ?? "Unknown",
                        EntryTime = session.EntryTime,
                        ExitTime = exitTime,
                        Amount = feeResult.Amount,
                        LostCardFee = feeResult.LostCardFee,
                        TotalAmount = feeResult.TotalAmount,
                        PaymentMethod = request.PaymentId.HasValue ? "CASH" : "BANK_TRANSFER",
                        PrintedCount = 0,
                        CreatedBy = staffId,
                        CreatedAt = DateTimeOffset.UtcNow
                    };

                    _context.Receipts.Add(receipt);
                    await _context.SaveChangesAsync();

                    // Write audit log
                    await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                    {
                        Action = "SESSION_COMPLETED",
                        TargetType = "ParkingSession",
                        TargetId = session.SessionCode,
                        Reason = $"Casual exit complete for plate {session.PlateNumber} at Gate {request.ExitGateId}.",
                        ActorUserId = staffId,
                        NewValue = JsonSerializer.Serialize(new
                        {
                            sessionId = session.Id,
                            sessionCode = session.SessionCode,
                            exitTime,
                            totalAmount = feeResult.TotalAmount,
                            receiptCode
                        })
                    });

                    await transaction.CommitAsync();

                    return new ExitResponse
                    {
                        SessionId = session.Id,
                        SessionCode = session.SessionCode,
                        Status = session.Status,
                        ExitTime = exitTime,
                        Amount = feeResult.Amount,
                        LostCardFee = feeResult.LostCardFee,
                        TotalAmount = feeResult.TotalAmount,
                        PaymentStatus = session.PaymentStatus,
                        ReceiptCode = receiptCode
                    };
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        public async Task<ExitResponse> CompleteMonthlyPassExitAsync(long sessionId, MonthlyPassExitRequest request, long staffId)
        {
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                var session = await _context.ParkingSessions
                    .Include(s => s.ParkingCard)
                    .FirstOrDefaultAsync(s => s.Id == sessionId);

                if (session == null || session.Status != "ACTIVE")
                {
                    throw new BusinessException(ErrorCodes.SessionNotFound);
                }

                if (session.CustomerType != "MONTHLY" || !session.MonthlyPassId.HasValue)
                {
                    throw new BusinessException(ErrorCodes.InvalidRequest);
                }

                var gate = await _context.Gates.FindAsync(request.ExitGateId);
                if (gate == null || gate.GateType != "EXIT" || gate.Status != "ACTIVE")
                {
                    throw new BusinessException("INVALID_EXIT_GATE");
                }

                var pass = await _context.MonthlyPasses.FindAsync(session.MonthlyPassId.Value);
                if (pass == null || pass.Status != "ACTIVE")
                {
                    throw new BusinessException("MONTHLY_PASS_EXPIRED");
                }

                // Plate verification before transaction to prevent rollback of mismatch case log
                var normalizedEntry = NormalizePlate(session.PlateNumber);
                var exitPlateInput = !string.IsNullOrWhiteSpace(request.ExitPlateNumber) ? request.ExitPlateNumber : request.DetectedPlateNumber;
                var normalizedExit = NormalizePlate(exitPlateInput);
                if (!string.IsNullOrEmpty(normalizedEntry) && normalizedEntry != normalizedExit)
                {
                    var isConfirmedMismatch = await _context.PlateMismatchCases
                        .AnyAsync(m => m.SessionId == session.Id && m.Status == "CONFIRMED");

                    if (!isConfirmedMismatch)
                    {
                        throw new BusinessException("PLATE_MISMATCH_REQUIRES_APPROVAL");
                    }
                }

                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Save exit images if not already saved during plate mismatch logic
                    var imagesAlreadySaved = await _context.ParkingSessionImages
                        .AnyAsync(i => i.SessionId == session.Id && (i.ImageType == "EXIT_PLATE" || i.ImageType == "EXIT_VEHICLE"));

                    if (!imagesAlreadySaved)
                    {
                        if (!string.IsNullOrWhiteSpace(request.ExitPlateImageUrl))
                        {
                            _context.ParkingSessionImages.Add(new ParkingSessionImage
                            {
                                SessionId = session.Id,
                                ImageUrl = request.ExitPlateImageUrl,
                                ImageType = "EXIT_PLATE",
                                Confidence = request.OcrConfidence.HasValue ? (decimal)request.OcrConfidence.Value : null,
                                CapturedAt = DateTimeOffset.UtcNow
                            });
                        }
                        if (!string.IsNullOrWhiteSpace(request.ExitVehicleImageUrl))
                        {
                            _context.ParkingSessionImages.Add(new ParkingSessionImage
                            {
                                SessionId = session.Id,
                                ImageUrl = request.ExitVehicleImageUrl,
                                ImageType = "EXIT_VEHICLE",
                                CapturedAt = DateTimeOffset.UtcNow
                            });
                        }
                    }

                    var exitTime = request.ExitTime ?? DateTimeOffset.UtcNow;

                    // Complete session
                    session.Status = "COMPLETED";
                    session.ExitTime = exitTime;
                    session.ExitGateId = request.ExitGateId;
                    session.ExitStaffId = staffId;
                    session.PaymentStatus = "NOT_REQUIRED";
                    session.UpdatedAt = DateTimeOffset.UtcNow;

                    // Release card
                    var card = session.ParkingCard;
                    card.Status = CardStatus.AVAILABLE;
                    card.CurrentSessionId = null;
                    card.UpdatedAt = DateTime.UtcNow;

                    // Release slot if any
                    if (session.SlotId.HasValue)
                    {
                        var slot = await _context.Slots.Include(s => s.Area).FirstOrDefaultAsync(s => s.Id == session.SlotId.Value);
                        if (slot != null)
                        {
                            slot.Status = "AVAILABLE";
                            slot.CurrentSessionId = null;
                            slot.UpdatedAt = DateTimeOffset.UtcNow;
                            slot.Area.CurrentRealOccupancy = Math.Max(0, slot.Area.CurrentRealOccupancy - 1);
                            slot.Area.UpdatedAt = DateTimeOffset.UtcNow;
                        }
                    }
                    else
                    {
                        // Decrement area real occupancy
                        var area = await _context.Areas.FindAsync(session.AreaId);
                        if (area != null)
                        {
                            area.CurrentRealOccupancy = Math.Max(0, area.CurrentRealOccupancy - 1);
                            area.UpdatedAt = DateTimeOffset.UtcNow;
                        }
                    }

                    // Generate Receipt 0d
                    var receiptCode = $"REC-{exitTime:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
                    var vehicleType = await _context.VehicleTypes.FindAsync(session.VehicleTypeId);

                    var receipt = new Receipt
                    {
                        ReceiptCode = receiptCode,
                        SessionId = session.Id,
                        CardCode = card.CardNumber,
                        PlateNumber = session.PlateNumber,
                        VehicleTypeName = vehicleType?.Name ?? "Unknown",
                        EntryTime = session.EntryTime,
                        ExitTime = exitTime,
                        Amount = 0m,
                        LostCardFee = 0m,
                        TotalAmount = 0m,
                        PaymentMethod = "NONE",
                        PrintedCount = 0,
                        CreatedBy = staffId,
                        CreatedAt = DateTimeOffset.UtcNow
                    };

                    _context.Receipts.Add(receipt);
                    await _context.SaveChangesAsync();

                    // Write audit log
                    await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                    {
                        Action = "SESSION_COMPLETED",
                        TargetType = "ParkingSession",
                        TargetId = session.SessionCode,
                        Reason = $"Monthly exit complete for plate {session.PlateNumber} at Gate {request.ExitGateId}.",
                        ActorUserId = staffId,
                        NewValue = JsonSerializer.Serialize(new
                        {
                            sessionId = session.Id,
                            sessionCode = session.SessionCode,
                            exitTime,
                            receiptCode,
                            monthlyPassId = pass.Id
                        })
                    });

                    await transaction.CommitAsync();

                    return new ExitResponse
                    {
                        SessionId = session.Id,
                        SessionCode = session.SessionCode,
                        Status = session.Status,
                        ExitTime = exitTime,
                        Amount = 0m,
                        LostCardFee = 0m,
                        TotalAmount = 0m,
                        PaymentStatus = session.PaymentStatus,
                        ReceiptCode = receiptCode
                    };
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        private static string NormalizePlate(string? plate)
        {
            return plate?
                .Trim()
                .Replace("-", "")
                .Replace(".", "")
                .Replace(" ", "")
                .ToUpperInvariant() ?? "";
        }
    }
}
