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
                var monthlyPass = await _dbContext.MonthlyPasses.FirstOrDefaultAsync(m =>
                    m.PlateNumber == request.LicensePlate && m.Status == "ACTIVE" &&
                    m.StartDate <= DateTime.UtcNow && m.EndDate >= DateTime.UtcNow);

                // 4. Lấy thông tin Thẻ & Slot (Đã validate ở bước 1)
                var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);
                var slot = await _dbContext.Slots.Include(s => s.Area).FirstOrDefaultAsync(s => s.Id == request.SelectedSlotId);

                // 5. Tạo mới Phiên đỗ xe với thông tin Snapshot (F033 + F035)
                var newSession = new ParkingSession
                {
                    SessionCode = $"SESS-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                    CardId = card.Id,
                    PlateNumber = request.LicensePlate,
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

    public async Task<bool> ClaimSessionAsync(string userIdString, string qrToken) { /* ... */ return true; }

    private async Task ValidateEntryRequest(CreateEntryRequest request)
    {
        var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);
        if (card == null || card.Status != CardStatus.AVAILABLE)
            throw new Exception("CARD_NOT_AVAILABLE");

        var slot = await _dbContext.Slots.FirstOrDefaultAsync(s => s.Id == request.SelectedSlotId);
        if (slot == null || slot.Status != "AVAILABLE" || slot.AllowedVehicleTypeId != request.VehicleTypeId)
            throw new Exception("SLOT_NOT_AVAILABLE");

        if (!request.NoPlate)
        {
            bool hasActive = await _dbContext.ParkingSessions.AnyAsync(s => s.PlateNumber == request.LicensePlate && s.Status == "ACTIVE");
            if (hasActive) throw new Exception("VEHICLE_HAS_ACTIVE_SESSION");
        }
        else if (string.IsNullOrWhiteSpace(request.VehicleDescription))
        {
            throw new Exception("VEHICLE_DESCRIPTION_REQUIRED");
        }
    }
}