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
using ParkingBuilding.CoreApi.Application.Storage;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Exit
{
    public class ExitService : IExitService
    {
        private readonly ParkingDbContext _context;
        private readonly IFeeCalculationService _feeCalculationService;
        private readonly IAuditWriterService _auditWriter;
        private readonly IParkingSessionImageStorageService _imageStorageService;

        public ExitService(
            ParkingDbContext context,
            IFeeCalculationService feeCalculationService,
            IAuditWriterService auditWriter,
            IParkingSessionImageStorageService imageStorageService)
        {
            _context = context;
            _feeCalculationService = feeCalculationService;
            _auditWriter = auditWriter;
            _imageStorageService = imageStorageService;
        }

        public async Task<ParkingSession> FindActiveSessionByCardCodeAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                throw new BusinessException(ErrorCodes.CardCodeRequired); // Maintain error code for compatibility
            }

            var queryLower = query.Trim().ToLower();

            // Search for an active session matching EITHER the Card Number OR the License Plate
            var session = await _context.ParkingSessions
                .Include(s => s.ParkingCard)
                .Include(s => s.PricingRule)
                .Include(s => s.Reservation)
                .FirstOrDefaultAsync(s => 
                    s.Status == "ACTIVE" && 
                    ((s.ParkingCard != null && s.ParkingCard.CardNumber != null && s.ParkingCard.CardNumber.ToLower() == queryLower) 
                     || (s.PlateNumber != null && s.PlateNumber.ToLower() == queryLower)));

            if (session == null)
            {
                throw new BusinessException(ErrorCodes.SessionNotFound, StatusCodes.Status404NotFound);
            }

            // Ensure the card is in a valid state (IN_USE or LOST)
            if (session.ParkingCard.Status != CardStatus.IN_USE && session.ParkingCard.Status != CardStatus.LOST)
            {
                throw new BusinessException(ErrorCodes.CardHasNoActiveSession);
            }

            return session;
        }

        public async Task<ParkingSession> FindActiveSessionByPlateAsync(string plateNumber, long vehicleTypeId)
        {
            if (string.IsNullOrWhiteSpace(plateNumber))
            {
                throw new BusinessException(ErrorCodes.LicensePlateRequired);
            }

            var normalizedPlate = NormalizePlate(plateNumber);

            var session = await _context.ParkingSessions
                .Include(s => s.ParkingCard)
                .Include(s => s.PricingRule)
                .Include(s => s.Reservation)
                .FirstOrDefaultAsync(s => s.Status == "ACTIVE"
                    && s.VehicleTypeId == vehicleTypeId
                    && NormalizePlate(s.PlateNumber) == normalizedPlate);

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
                    throw new BusinessException(ErrorCodes.ExitGateInvalid);
                }

                await EnsureRequiredVehicleImagesAsync(session.Id, request.ExitVehicleImageUrl);

                // Plate verification before transaction to prevent rollback of mismatch case log
                var normalizedEntry = NormalizePlate(session.PlateNumber);
                var exitPlateInput = !string.IsNullOrWhiteSpace(request.ExitPlateNumber) ? request.ExitPlateNumber : request.DetectedPlateNumber;
                var normalizedExit = NormalizePlate(exitPlateInput);
                if (!string.IsNullOrEmpty(normalizedEntry) && normalizedEntry != normalizedExit)
                {
                    await EnsureMismatchApprovedAsync(session.Id, normalizedExit);
                }

                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    await SaveMissingExitImagesAsync(
                        session.Id,
                        request.ExitPlateImageUrl,
                        request.ExitVehicleImageUrl,
                        request.OcrConfidence);

                    var exitTime = request.ExitTime ?? DateTimeOffset.UtcNow;
                                        // Check if there is an APPROVED lost card case for this session
                    var hasApprovedLostCard = await _context.LostCardCases
                        .AnyAsync(lc => lc.SessionId == session.Id && lc.Status == "APPROVED");

                    var includeLostCardFee = hasApprovedLostCard;
                    var feeResult = await _feeCalculationService.CalculateFeeAsync(session.Id, exitTime, includeLostCardFee);

                    // Payment is always decided from a fresh server-side fee calculation.
                    // A reservation can be inside its prepaid window, so a PENDING
                    // session with a 0 VND total must be allowed to leave.
                    Payment? paidPayment = null;
                    if (feeResult.TotalAmount <= 0m)
                    {
                        session.PaymentRequired = false;
                        session.PaymentStatus = "NOT_REQUIRED";
                    }
                    else
                    {
                        var paidPaymentQuery = _context.Payments
                            .Where(payment => payment.SessionId == session.Id && payment.Status == "PAID");

                        paidPayment = request.PaymentId.HasValue
                            ? await paidPaymentQuery.FirstOrDefaultAsync(payment => payment.Id == request.PaymentId.Value)
                            : await paidPaymentQuery.OrderByDescending(payment => payment.PaidAt).FirstOrDefaultAsync();

                        if (paidPayment == null
                            || paidPayment.TotalAmount < feeResult.TotalAmount
                            || paidPayment.LostCardFee < feeResult.LostCardFee)
                        {
                            throw new BusinessException(ErrorCodes.PaymentRequiredBeforeExit);
                        }

                        // Only a webhook-confirmed bank transfer has a short exit buffer.
                        // Cash is finalized at the staff desk and does not expire.
                        if (paidPayment.Method == "BANK_TRANSFER"
                            && paidPayment.PaymentValidUntil.HasValue
                            && exitTime > paidPayment.PaymentValidUntil.Value)
                        {
                            session.PaymentStatus = "PENDING";
                            await _context.SaveChangesAsync();
                            throw new BusinessException(ErrorCodes.PaymentRequiredBeforeExit);
                        }

                        session.PaymentRequired = true;
                        session.PaymentStatus = "PAID";
                    }

                    // Complete session
                    session.Status = "COMPLETED";
                    session.ExitTime = exitTime;
                    session.ExitGateId = request.ExitGateId;
                    session.ExitStaffId = staffId;
                    session.UpdatedAt = DateTimeOffset.UtcNow;

                    // Release card
                    var card = session.ParkingCard;
                    if (card.Status != CardStatus.LOST)
                    {
                        card.Status = CardStatus.AVAILABLE;
                    }
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
                        PaymentMethod = feeResult.TotalAmount <= 0m
                            ? "NONE"
                            : paidPayment?.Method ?? "NONE",
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
                    throw new BusinessException(ErrorCodes.ExitGateInvalid);
                }

                await EnsureRequiredVehicleImagesAsync(session.Id, request.ExitVehicleImageUrl);

                var pass = await _context.MonthlyPasses.FindAsync(session.MonthlyPassId.Value);
                if (pass == null || pass.Status != "ACTIVE")
                {
                    throw new BusinessException(ErrorCodes.MonthlyPassExpired);
                }

                // Plate verification before transaction to prevent rollback of mismatch case log
                var normalizedEntry = NormalizePlate(session.PlateNumber);
                var exitPlateInput = !string.IsNullOrWhiteSpace(request.ExitPlateNumber) ? request.ExitPlateNumber : request.DetectedPlateNumber;
                var normalizedExit = NormalizePlate(exitPlateInput);
                if (!string.IsNullOrEmpty(normalizedEntry) && normalizedEntry != normalizedExit)
                {
                    await EnsureMismatchApprovedAsync(session.Id, normalizedExit);
                }

                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    await SaveMissingExitImagesAsync(
                        session.Id,
                        request.ExitPlateImageUrl,
                        request.ExitVehicleImageUrl,
                        request.OcrConfidence);

                    var exitTime = request.ExitTime ?? DateTimeOffset.UtcNow;

                    var hasApprovedLostCard = await _context.LostCardCases
                        .AnyAsync(lostCardCase => lostCardCase.SessionId == session.Id && lostCardCase.Status == "APPROVED");
                    var feeResult = await _feeCalculationService.CalculateFeeAsync(
                        session.Id,
                        exitTime,
                        hasApprovedLostCard);

                    Payment? paidPayment = null;
                    if (hasApprovedLostCard)
                    {
                        paidPayment = await _context.Payments
                            .Where(payment => payment.SessionId == session.Id && payment.Status == "PAID")
                            .OrderByDescending(payment => payment.PaidAt)
                            .FirstOrDefaultAsync();

                        if (paidPayment == null
                            || paidPayment.TotalAmount < feeResult.TotalAmount
                            || paidPayment.LostCardFee < feeResult.LostCardFee)
                        {
                            throw new BusinessException(ErrorCodes.PaymentRequiredBeforeExit);
                        }
                    }

                    // Complete session
                    session.Status = "COMPLETED";
                    session.ExitTime = exitTime;
                    session.ExitGateId = request.ExitGateId;
                    session.ExitStaffId = staffId;
                    session.PaymentStatus = hasApprovedLostCard ? "PAID" : "NOT_REQUIRED";
                    session.UpdatedAt = DateTimeOffset.UtcNow;

                    // Release card
                    var card = session.ParkingCard;
                    if (card.Status != CardStatus.LOST)
                    {
                        card.Status = CardStatus.AVAILABLE;
                    }
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
                        LostCardFee = feeResult.LostCardFee,
                        TotalAmount = feeResult.TotalAmount,
                        PaymentMethod = paidPayment?.Method ?? "NONE",
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

        private async Task EnsureRequiredVehicleImagesAsync(long sessionId, string? exitVehicleImageUrl)
        {
            var hasEntryVehicleImage = await _context.ParkingSessionImages
                .AnyAsync(image => image.SessionId == sessionId
                    && image.ImageType == "ENTRY_VEHICLE"
                    && !string.IsNullOrWhiteSpace(image.ImageUrl));

            if (!hasEntryVehicleImage)
            {
                throw new BusinessException(ErrorCodes.EntryVehicleImageMissing);
            }

            var hasExitVehicleImage = !string.IsNullOrWhiteSpace(exitVehicleImageUrl)
                || await _context.ParkingSessionImages
                    .AnyAsync(image => image.SessionId == sessionId
                        && image.ImageType == "EXIT_VEHICLE"
                        && !string.IsNullOrWhiteSpace(image.ImageUrl));

            if (!hasExitVehicleImage)
            {
                throw new BusinessException(ErrorCodes.ExitVehicleImageRequired);
            }
        }

        private async Task SaveMissingExitImagesAsync(
            long sessionId,
            string? exitPlateImageUrl,
            string? exitVehicleImageUrl,
            double? ocrConfidence)
        {
            var existingImageTypes = await _context.ParkingSessionImages
                .Where(image => image.SessionId == sessionId
                    && (image.ImageType == "EXIT_PLATE" || image.ImageType == "EXIT_VEHICLE")
                    && !string.IsNullOrWhiteSpace(image.ImageUrl))
                .Select(image => image.ImageType)
                .ToListAsync();

            if (!existingImageTypes.Contains("EXIT_PLATE") && !string.IsNullOrWhiteSpace(exitPlateImageUrl))
            {
                var storedImageUrl = await _imageStorageService.StoreAsync(exitPlateImageUrl, sessionId, "exit", "plate");
                _context.ParkingSessionImages.Add(new ParkingSessionImage
                {
                    SessionId = sessionId,
                    ImageUrl = storedImageUrl,
                    ImageType = "EXIT_PLATE",
                    Confidence = ocrConfidence.HasValue ? (decimal)ocrConfidence.Value : null,
                    CapturedAt = DateTimeOffset.UtcNow
                });
            }

            if (!existingImageTypes.Contains("EXIT_VEHICLE") && !string.IsNullOrWhiteSpace(exitVehicleImageUrl))
            {
                var storedImageUrl = await _imageStorageService.StoreAsync(exitVehicleImageUrl, sessionId, "exit", "vehicle");
                _context.ParkingSessionImages.Add(new ParkingSessionImage
                {
                    SessionId = sessionId,
                    ImageUrl = storedImageUrl,
                    ImageType = "EXIT_VEHICLE",
                    CapturedAt = DateTimeOffset.UtcNow
                });
            }
        }

        private async Task EnsureMismatchApprovedAsync(long sessionId, string normalizedExitPlate)
        {
            var confirmedExitPlate = await _context.PlateMismatchCases
                .Where(mismatch => mismatch.SessionId == sessionId && mismatch.Status == "CONFIRMED")
                .OrderByDescending(mismatch => mismatch.ConfirmedAt)
                .Select(mismatch => mismatch.ExitPlateNumber)
                .FirstOrDefaultAsync();

            if (confirmedExitPlate == null || NormalizePlate(confirmedExitPlate) != normalizedExitPlate)
            {
                throw new BusinessException(
                    ErrorCodes.PlateMismatchRequiresApproval,
                    StatusCodes.Status409Conflict);
            }
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
