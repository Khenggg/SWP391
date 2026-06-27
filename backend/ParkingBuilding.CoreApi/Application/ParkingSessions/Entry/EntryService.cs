using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;

using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Application.Audit.Dtos;
using ParkingBuilding.CoreApi.Application.ParkingSessions.SlotSuggestion;

public class EntryService : IEntryService
{
    private readonly ParkingDbContext _dbContext;
    private readonly IAuditWriterService _auditWriter;
    private readonly ISlotSuggestionService _suggestionService;

    public EntryService(ParkingDbContext dbContext, IAuditWriterService auditWriter, ISlotSuggestionService suggestionService)
    {
        _dbContext = dbContext;
        _auditWriter = auditWriter;
        _suggestionService = suggestionService;
    }

    public async Task CreateEntryAsync(CreateEntryRequest request)
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                // 1. Validation đầu vào (F032)
                await ValidateEntryRequest(request);

                // 2. Lấy Pricing Rule cho Snapshot (F035)
                var pricing = await _dbContext.PricingRules
                    .FirstOrDefaultAsync(p => p.VehicleTypeId == request.VehicleTypeId && p.Status == "ACTIVE" && p.EffectiveFrom <= DateTime.UtcNow);
                if (pricing == null) throw new Exception("PRICING_RULE_NOT_FOUND");

                // 3. Nhận diện khách hàng tháng (F032)
                var normalizedPlate = request.LicensePlate?.Trim().Replace("-", "").Replace(".", "").Replace(" ", "").ToUpper() ?? "";
                var monthlyPass = await _dbContext.MonthlyPasses.FirstOrDefaultAsync(m =>
                    m.NormalizedPlateNumber == normalizedPlate && m.Status == "ACTIVE" &&
                    m.StartDate <= DateTime.UtcNow && m.EndDate >= DateTime.UtcNow);

                // 4. Lấy thông tin Thẻ & Slot (Đã validate ở bước 1)
                var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);
                var slot = await _dbContext.Slots.Include(s => s.Area).FirstOrDefaultAsync(s => s.Id == request.SelectedSlotId);

                // 5. Tạo mới Phiên đỗ xe với thông tin Snapshot (F033 + F035)
                var newSession = new ParkingSession
                {
                    SessionCode = $"SESS-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                    CardId = card.Id,
                    DriverId = monthlyPass?.DriverId,
                    PlateNumber = request.LicensePlate,
                    NormalizedPlateNumber = normalizedPlate,
                    NoPlate = request.NoPlate,
                    VehicleDescription = request.VehicleDescription,
                    VehicleTypeId = request.VehicleTypeId,
                    EntryGateId = request.EntryGateId,
                    SlotId = slot.Id,
                    AreaId = slot.AreaId,
                    FloorId = slot.Area.FloorId,
                    EntryStaffId = 1, // TODO: Lấy từ JWT
                    EntryTime = DateTimeOffset.UtcNow,
                    BillableStartTime = DateTimeOffset.UtcNow,
                    Status = "ACTIVE",
                    // Snapshot data
                    PricingRuleId = pricing.Id,
                    SnapshotDayPrice = pricing.DayPrice,
                    SnapshotNightPrice = pricing.NightPrice,
                    SnapshotMonthlyPrice = pricing.MonthlyPrice,
                    SnapshotLostCardFee = pricing.LostCardFee,
                    CustomerType = monthlyPass != null ? "MONTHLY" : "CASUAL",
                    PaymentRequired = monthlyPass == null,
                    PaymentStatus = monthlyPass == null ? "PENDING" : "NOT_REQUIRED"
                };

                _dbContext.ParkingSessions.Add(newSession);
                await _dbContext.SaveChangesAsync();

                // 6. Cập nhật trạng thái Thẻ & Slot (F034)
                card.Status = CardStatus.IN_USE;
                card.CurrentSessionId = newSession.Id;
                slot.Status = "OCCUPIED";
                slot.CurrentSessionId = newSession.Id;

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                // 7. Ghi Audit Log (F036)
                await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                {
                    Action = "SESSION_CREATED",
                    TargetType = "ParkingSession",
                    TargetId = newSession.SessionCode,
                    Reason = $"Xe {request.LicensePlate} vào bãi thành công."
                });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    // ... (Giữ nguyên các phương thức ClaimSessionAsync và ValidateEntryRequest như cũ)

    public async Task<bool> ClaimSessionAsync(string userIdString, string qrToken)
    {
        if (string.IsNullOrEmpty(userIdString) || string.IsNullOrEmpty(qrToken))
            return false;

        if (!long.TryParse(userIdString, out var userId))
            return false;

        // 1. Tìm thông tin tài xế từ UserId
        var driver = await _dbContext.DriverProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
        if (driver == null)
            return false;

        // 2. Tìm thẻ từ qrToken
        var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.QrToken == qrToken);
        if (card == null)
            return false;

        // 3. Tìm phiên đỗ xe ACTIVE liên quan đến thẻ này
        var session = await _dbContext.ParkingSessions.FirstOrDefaultAsync(s => s.CardId == card.Id && s.Status == "ACTIVE");
        if (session == null)
            return false;

        // 4. Nếu phiên đỗ xe đã có tài xế khác liên kết
        if (session.DriverId.HasValue)
        {
            // Nếu đã liên kết đúng tài xế này rồi thì trả về true, ngược lại trả về false
            return session.DriverId.Value == driver.Id;
        }

        // 5. Tiến hành liên kết
        session.DriverId = driver.Id;
        session.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync();

        return true;
    }

    private async Task ValidateEntryRequest(CreateEntryRequest request)
    {
        // 1. Kiểm tra Thẻ
        var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);
        if (card == null || card.Status != CardStatus.AVAILABLE)
            throw new Exception("CARD_NOT_AVAILABLE: Thẻ không tồn tại hoặc không ở trạng thái khả dụng");

        // 2. Bóc tách kiểm tra Slot để bắt chính xác lỗi
        var slot = await _dbContext.Slots.FirstOrDefaultAsync(s => s.Id == request.SelectedSlotId);

        if (slot == null)
            throw new Exception($"SLOT_NOT_FOUND: Vị trí đỗ ID {request.SelectedSlotId} không tồn tại trong DB");

        if (slot.Status != "AVAILABLE")
            throw new Exception($"SLOT_STATUS_INVALID: Trạng thái hiện tại của slot ID {request.SelectedSlotId} đang là '{slot.Status}'");

        if (slot.AllowedVehicleTypeId != request.VehicleTypeId)
            throw new Exception($"SLOT_TYPE_MISMATCH: Slot yêu cầu loại xe '{slot.AllowedVehicleTypeId}', nhưng request truyền vào là '{request.VehicleTypeId}'");

        // 3. Kiểm tra Biển số xe
        if (!request.NoPlate)
        {
            var normalizedPlate = request.LicensePlate?.Trim().Replace("-", "").Replace(".", "").Replace(" ", "").ToUpper() ?? "";
            bool hasActive = await _dbContext.ParkingSessions.AnyAsync(s => 
                s.Status == "ACTIVE" && 
                s.PlateNumber != null && 
                s.PlateNumber.Replace("-", "").Replace(".", "").Replace(" ", "").ToUpper() == normalizedPlate);
            if (hasActive) throw new Exception("VEHICLE_HAS_ACTIVE_SESSION: Biển số xe này đang có một phiên đỗ ACTIVE trong bãi");
        }
        else if (string.IsNullOrWhiteSpace(request.VehicleDescription))
        {
            throw new Exception("VEHICLE_DESCRIPTION_REQUIRED: Xe không biển số bắt buộc phải nhập mô tả xe");
        }
    }
}