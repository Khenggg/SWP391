using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Application.Audit.Dtos;
using ParkingBuilding.CoreApi.Application.FeeCalculation;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;


namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Exit;

public class ExitService : IExitService
{
    private readonly ParkingDbContext _dbContext;
    private readonly IAuditWriterService _auditWriter;
    private readonly IFeeCalculationService _feeService;

    public ExitService(
        ParkingDbContext dbContext,
        IAuditWriterService auditWriter,
        IFeeCalculationService feeService)
    {
        _dbContext = dbContext;
        _auditWriter = auditWriter;
        _feeService = feeService;
    }

    public async Task<CreateExitResponse> CreateExitAsync(CreateExitRequest request, long staffId, string role)

    {
        // THÊM DÒNG NÀY ĐỂ DEBUG:
        Console.WriteLine($"\n=========================================");
        Console.WriteLine($"[DEBUG EXIT] staffId nhận được từ Controller là: {staffId}");
        Console.WriteLine($"=========================================\n");
        var strategy = _dbContext.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                // 1. Kiểm tra Cổng ra (Gate)
                var gate = await _dbContext.Gates.FirstOrDefaultAsync(g => g.Id == request.ExitGateId);
                if (gate == null) throw new BusinessException(ErrorCodes.GateNotFound);
                if (gate.GateType != "EXIT" || gate.Status != "ACTIVE") throw new BusinessException(ErrorCodes.GateNotActive);

                // 2. Kiểm tra Thẻ và Phiên đỗ xe hiện tại
                // Lưu ý: Tên CardStatus có thể khác ở project của bạn (vd: "IN_USE" hoặc enum CardStatus.IN_USE), hãy điều chỉnh nếu báo lỗi đỏ.
                var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);
                if (card == null) throw new BusinessException(ErrorCodes.CardNotFound);
                if (card.CurrentSessionId == null) throw new BusinessException(ErrorCodes.CardNotAvailable);

                var session = await _dbContext.ParkingSessions
                    .Include(s => s.Slot)
                    .Include(s => s.Area)
                    .FirstOrDefaultAsync(s => s.Id == card.CurrentSessionId && s.Status == "ACTIVE");

                if (session == null) throw new BusinessException(ErrorCodes.SessionNotFound);

                // 3. Đối chiếu biển số lúc vào và lúc ra
                string? exitNormalizedPlate = NormalizePlate(request.DetectedPlateNumber);
                bool isMismatch = false;

                if (!session.NoPlate)
                {
                    if (string.IsNullOrWhiteSpace(exitNormalizedPlate) || session.NormalizedPlateNumber != exitNormalizedPlate)
                    {
                        isMismatch = true;
                    }
                }

                // 4. Tính toán số tiền (Chỉ tính cho xe khách vãng lai)
                var exitTime = DateTimeOffset.UtcNow;
                decimal amountDue = 0m;

                if (session.CustomerType == "CASUAL")
                {
                    amountDue = _feeService.CalculateFee(
                        session.BillableStartTime,
                        exitTime,
                        session.SnapshotDayPrice,
                        session.SnapshotNightPrice
                    );
                }

                // 5. Cập nhật thông tin Phiên đỗ xe (Session)
                session.ExitTime = exitTime;
                session.ExitGateId = request.ExitGateId;
                session.ExitStaffId = staffId;

                if (amountDue > 0)
                {
                    session.PaymentRequired = true;
                    session.PaymentStatus = "PENDING";
                }
                else
                {
                    session.PaymentRequired = false;
                    session.PaymentStatus = session.CustomerType == "MONTHLY" ? "NOT_REQUIRED" : "PAID";
                }

                // 6. Xử lý logic Mismatch HOẶC Hoàn thành phiên
                if (isMismatch)
                {
                    session.Status = "MISMATCH_PENDING";

                    // Ghi nhận vào bảng plate_mismatch_cases chờ quản lý xử lý
                    _dbContext.PlateMismatchCases.Add(new PlateMismatchCase
                    {
                        SessionId = session.Id,
                        EntryPlateNumber = session.PlateNumber,
                        ExitPlateNumber = request.DetectedPlateNumber ?? "UNKNOWN",
                        Status = "PENDING",
                        CreatedBy = staffId,
                        CreatedAt = DateTimeOffset.UtcNow,
                        UpdatedAt = DateTimeOffset.UtcNow
                    });
                }
                else
                {
                    session.Status = "COMPLETED";

                    // Giải phóng chỗ đỗ
                    if (session.SlotId.HasValue && session.Slot != null)
                    {
                        session.Slot.Status = "AVAILABLE"; // Trạng thái này lấy theo bảng slots
                        session.Slot.CurrentSessionId = null;
                    }
                    if (session.Area != null && session.Area.CurrentRealOccupancy > 0)
                    {
                        session.Area.CurrentRealOccupancy -= 1;
                    }

                    // Trả lại thẻ cho hệ thống tái sử dụng
                    card.Status = CardStatus.AVAILABLE;
                    card.CurrentSessionId = null;

                    // Tạo Ticket/Payment chờ thu tiền mặt
                    if (amountDue > 0)
                    {
                        _dbContext.Payments.Add(new Payment
                        {
                            SessionId = session.Id,
                            Amount = amountDue,
                            TotalAmount = amountDue,
                            Purpose = "PARKING_FEE",
                            Method = "CASH",
                            Status = "PENDING",
                            CreatedAt = DateTimeOffset.UtcNow,
                            UpdatedAt = DateTimeOffset.UtcNow
                        });
                    }
                }

                await _dbContext.SaveChangesAsync();

                // 7. Lưu hình ảnh lúc ra
                await SaveImagesAsync(request, session.Id);

                // 8. Ghi Audit Log
                await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                {
                    Action = isMismatch ? "SESSION_EXIT_MISMATCH" : "SESSION_COMPLETED",
                    TargetType = "ParkingSession",
                    TargetId = session.SessionCode,
                    Reason = isMismatch
                        ? $"Cảnh báo sai biển số. Vào: {session.PlateNumber}, Ra: {request.DetectedPlateNumber}"
                        : $"Xe {session.PlateNumber ?? "không biển"} ra bãi thành công. Phí: {amountDue}",
                    ActorUserId = staffId
                });

                await transaction.CommitAsync();

                // 9. Trả về kết quả cho Frontend/Màn hình bảo vệ
                return new CreateExitResponse
                {
                    SessionId = session.Id,
                    SessionCode = session.SessionCode,
                    Status = session.Status,
                    CardCode = request.CardCode,
                    EntryPlateNumber = session.PlateNumber,
                    ExitPlateNumber = request.DetectedPlateNumber,
                    EntryTime = session.EntryTime,
                    ExitTime = exitTime,
                    CustomerType = session.CustomerType,
                    AmountDue = amountDue,
                    PaymentStatus = session.PaymentStatus,
                    IsPlateMismatch = isMismatch
                };
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    private async Task SaveImagesAsync(CreateExitRequest request, long sessionId)
    {
        if (!string.IsNullOrWhiteSpace(request.ExitPlateImageUrl))
        {
            _dbContext.ParkingSessionImages.Add(new ParkingSessionImage
            {
                SessionId = sessionId,
                ImageType = "EXIT_PLATE",
                ImageUrl = request.ExitPlateImageUrl,
                DetectedPlateNumber = request.DetectedPlateNumber,
                DetectedNormalizedPlateNumber = NormalizePlate(request.DetectedPlateNumber),
                Confidence = (decimal?)request.OcrConfidence,
                IsPrimary = true,
                CapturedAt = DateTimeOffset.UtcNow
            });
        }

        if (!string.IsNullOrWhiteSpace(request.ExitVehicleImageUrl))
        {
            _dbContext.ParkingSessionImages.Add(new ParkingSessionImage
            {
                SessionId = sessionId,
                ImageType = "EXIT_VEHICLE",
                ImageUrl = request.ExitVehicleImageUrl,
                IsPrimary = false,
                CapturedAt = DateTimeOffset.UtcNow
            });
        }

        await _dbContext.SaveChangesAsync();
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