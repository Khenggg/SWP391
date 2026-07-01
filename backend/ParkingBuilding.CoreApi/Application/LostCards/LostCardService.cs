using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Application.LostCards;
using ParkingBuilding.CoreApi.Contracts.Common;

namespace ParkingBuilding.CoreApi.Application.LostCards;

public class LostCardService : ILostCardService
{
    private readonly ParkingDbContext _context;

    public LostCardService(ParkingDbContext context)
    {
        _context = context;
    }

    public async Task<LostCardCase> CreateLostCardCaseAsync(CreateLostCardRequest request, long staffId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Kiểm tra Session tồn tại và đang ở trạng thái hợp lệ để báo mất thẻ
            var session = await _context.ParkingSessions
                .FirstOrDefaultAsync(s => s.Id == request.SessionId);

            if (session == null)
                throw new Exception("Không tìm thấy phiên đỗ xe.");

            // 2. Tạo record LostCardCase
            var lostCardCase = new LostCardCase
            {
                SessionId = request.SessionId,
                ReporterName = request.ReporterName,
                Phone = request.Phone,
                Reason = request.Reason,
                VerificationNote = request.VerificationNote,
                Status = "PENDING",
                CreatedBy = staffId,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.LostCardCases.Add(lostCardCase);

            // 3. Cập nhật trạng thái Session (Giả định bạn dùng trường Status để quản lý)
            // Bạn có thể cần tạo thêm 1 trạng thái là 'LOST_CARD_PENDING' nếu cần
            session.Status = "LOST_CARD_PENDING";

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return lostCardCase;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
    public async Task<LostCardCase> ProcessLostCardAsync(long caseId, ProcessLostCardRequest request, long staffId)
    {
        // Tìm hồ sơ
        var lostCardCase = await _context.LostCardCases.FindAsync(caseId);

        if (lostCardCase == null)
            throw new Exception("Không tìm thấy hồ sơ mất thẻ này.");

        if (lostCardCase.Status != "PENDING")
            throw new Exception("Hồ sơ này đã được xử lý trước đó (không phải trạng thái PENDING).");

        // Xử lý Logic
        if (request.Action == Domain.Enums.LostCardCaseStatus.APPROVED)
        {
            lostCardCase.Status = "APPROVED";
            lostCardCase.ApprovedBy = staffId;
            lostCardCase.ApprovedAt = DateTimeOffset.UtcNow;
        }
        else if (request.Action == Domain.Enums.LostCardCaseStatus.REJECTED)
        {
            if (string.IsNullOrWhiteSpace(request.RejectionReason))
                throw new Exception("Vui lòng cung cấp lý do từ chối.");

            lostCardCase.Status = "REJECTED";
            lostCardCase.RejectionReason = request.RejectionReason;
        }

        lostCardCase.UpdatedAt = DateTimeOffset.UtcNow;

        // Lưu vào database
        await _context.SaveChangesAsync();
        return lostCardCase;
    }
}