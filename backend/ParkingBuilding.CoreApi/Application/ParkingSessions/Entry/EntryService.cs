using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Application.Audit.Dtos;
using ParkingBuilding.CoreApi.Application.ParkingSessions.SlotSuggestion;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Entry
{
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
                        .FirstOrDefaultAsync(p => p.VehicleTypeId == request.VehicleTypeId && p.Status == "ACTIVE" && p.EffectiveFrom <= DateTimeOffset.UtcNow);
                    if (pricing == null) throw new Exception("PRICING_RULE_NOT_FOUND");

                    // 3. Nhận diện khách hàng tháng (F032)
                    var monthlyPass = await _dbContext.MonthlyPasses.FirstOrDefaultAsync(m =>
                        m.PlateNumber == request.LicensePlate && m.Status == "ACTIVE" &&
                        m.StartDate <= DateTime.UtcNow && m.EndDate >= DateTime.UtcNow);

                    // 4. Lấy thông tin Thẻ & Loại xe
                    var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);
                    if (card == null) throw new Exception("CARD_NOT_FOUND");

                    var vehicleType = await _dbContext.VehicleTypes.FindAsync(request.VehicleTypeId);
                    if (vehicleType == null) throw new Exception("VEHICLE_TYPE_NOT_FOUND");

                    // 5. Kiểm tra Đặt chỗ trước (Booking/Reservation Check-in)
                    Reservation? activeReservation = null;
                    var normalizedPlate = request.LicensePlate?.Trim().Replace("-", "").Replace(".", "").Replace(" ", "").ToUpper() ?? "";
                    if (!request.NoPlate && !string.IsNullOrEmpty(normalizedPlate))
                    {
                        activeReservation = await _dbContext.Reservations
                            .Include(r => r.Area)
                            .FirstOrDefaultAsync(r => r.NormalizedPlateNumber == normalizedPlate && r.Status == "CONFIRMED" && r.ExpiresAt >= DateTimeOffset.UtcNow && r.CheckedInAt == null);
                    }

                    ParkingSession newSession;

                    if (activeReservation != null)
                    {
                        // Luồng check-in cho xe đã đặt chỗ trước
                        newSession = new ParkingSession
                        {
                            SessionCode = $"SESS-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                            CardId = card.Id,
                            PlateNumber = request.LicensePlate,
                            NoPlate = request.NoPlate,
                            VehicleDescription = request.VehicleDescription,
                            VehicleTypeId = request.VehicleTypeId,
                            EntryGateId = request.EntryGateId,
                            SlotId = activeReservation.SlotId,
                            AreaId = activeReservation.AreaId,
                            FloorId = activeReservation.FloorId,
                            ReservationId = activeReservation.Id,
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
                            CustomerType = "CASUAL", // Lượt đặt chỗ trước
                            PaymentRequired = false,  // Đã thanh toán đặt chỗ
                            PaymentStatus = "PAID"
                        };

                        _dbContext.ParkingSessions.Add(newSession);
                        await _dbContext.SaveChangesAsync();

                        // Cập nhật booking sang COMPLETED
                        activeReservation.Status = "COMPLETED";
                        activeReservation.CheckedInAt = DateTimeOffset.UtcNow;
                        activeReservation.CheckedInBy = 1; // System/Staff ID
                        activeReservation.UpdatedAt = DateTimeOffset.UtcNow;

                        // Điều chỉnh slot & công suất
                        if (vehicleType.RequiresSlot && activeReservation.SlotId.HasValue)
                        {
                            var slot = await _dbContext.Slots.FindAsync(activeReservation.SlotId.Value);
                            if (slot != null)
                            {
                                slot.Status = "OCCUPIED";
                                slot.CurrentSessionId = newSession.Id;
                            }
                        }

                        if (activeReservation.Area.CurrentBookedSlots > 0)
                        {
                            activeReservation.Area.CurrentBookedSlots -= 1;
                        }
                        activeReservation.Area.CurrentRealOccupancy += 1;

                        await _dbContext.SaveChangesAsync();

                        // Ghi Audit Log cho đặt chỗ
                        await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                        {
                            Action = "RESERVATION_CHECKED_IN",
                            TargetType = "Reservation",
                            TargetId = activeReservation.Id.ToString(),
                            Reason = $"Check-in thành công cho đặt chỗ {activeReservation.ReservationCode}."
                        });
                    }
                    else
                    {
                        // Luồng xe vãng lai hoặc vé tháng bình thường
                        long floorId;
                        long areaId;
                        long? slotId = null;

                        if (vehicleType.RequiresSlot)
                        {
                            var slot = await _dbContext.Slots.Include(s => s.Area).FirstOrDefaultAsync(s => s.Id == request.SelectedSlotId);
                            if (slot == null) throw new Exception("SLOT_NOT_FOUND");

                            slot.Status = "OCCUPIED";
                            slotId = slot.Id;
                            areaId = slot.AreaId;
                            floorId = slot.Area.FloorId;

                            // Tăng occupancy thực tế
                            slot.Area.CurrentRealOccupancy += 1;

                            newSession = new ParkingSession
                            {
                                SessionCode = $"SESS-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                                CardId = card.Id,
                                PlateNumber = request.LicensePlate,
                                NoPlate = request.NoPlate,
                                VehicleDescription = request.VehicleDescription,
                                VehicleTypeId = request.VehicleTypeId,
                                EntryGateId = request.EntryGateId,
                                SlotId = slotId,
                                AreaId = areaId,
                                FloorId = floorId,
                                EntryStaffId = 1, // TODO: Lấy từ JWT
                                EntryTime = DateTimeOffset.UtcNow,
                                BillableStartTime = DateTimeOffset.UtcNow,
                                Status = "ACTIVE",
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

                            slot.CurrentSessionId = newSession.Id;
                            await _dbContext.SaveChangesAsync();
                        }
                        else
                        {
                            // Xe máy: Tìm khu vực khả dụng trên tầng có cổng
                            var gate = await _dbContext.Gates.FindAsync(request.EntryGateId);
                            if (gate == null) throw new Exception("GATE_NOT_FOUND");

                            var area = await _dbContext.Areas.Include(a => a.AreaVehicleTypes).FirstOrDefaultAsync(a => 
                                a.FloorId == gate.FloorId && a.Status == "ACTIVE" &&
                                a.AreaVehicleTypes.Any(av => av.VehicleTypeId == request.VehicleTypeId) &&
                                a.CurrentRealOccupancy + a.CurrentBookedSlots < a.TotalCapacity);

                            // Nếu không có trên tầng hiện tại, tìm khu vực bất kỳ
                            if (area == null)
                            {
                                area = await _dbContext.Areas.Include(a => a.AreaVehicleTypes).FirstOrDefaultAsync(a => 
                                    a.Status == "ACTIVE" &&
                                    a.AreaVehicleTypes.Any(av => av.VehicleTypeId == request.VehicleTypeId) &&
                                    a.CurrentRealOccupancy + a.CurrentBookedSlots < a.TotalCapacity);
                            }

                            if (area == null) throw new Exception("NO_AVAILABLE_AREA");

                            areaId = area.Id;
                            floorId = area.FloorId;
                            area.CurrentRealOccupancy += 1;

                            newSession = new ParkingSession
                            {
                                SessionCode = $"SESS-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                                CardId = card.Id,
                                PlateNumber = request.LicensePlate,
                                NoPlate = request.NoPlate,
                                VehicleDescription = request.VehicleDescription,
                                VehicleTypeId = request.VehicleTypeId,
                                EntryGateId = request.EntryGateId,
                                SlotId = null,
                                AreaId = areaId,
                                FloorId = floorId,
                                EntryStaffId = 1, // TODO: Lấy từ JWT
                                EntryTime = DateTimeOffset.UtcNow,
                                BillableStartTime = DateTimeOffset.UtcNow,
                                Status = "ACTIVE",
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
                        }
                    }

                    // Cập nhật trạng thái Thẻ (F034)
                    card.Status = CardStatus.IN_USE;
                    card.CurrentSessionId = newSession.Id;

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

        public async Task<bool> ClaimSessionAsync(string userIdString, string qrToken)
        {
            // Dummy implementation matching interface
            return await Task.FromResult(true);
        }

        private async Task ValidateEntryRequest(CreateEntryRequest request)
        {
            var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);
            if (card == null || card.Status != CardStatus.AVAILABLE)
                throw new Exception("CARD_NOT_AVAILABLE");

            var vehicleType = await _dbContext.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null)
                throw new Exception("VEHICLE_TYPE_NOT_FOUND");

            // Kiểm tra Đặt chỗ trước
            Reservation? activeReservation = null;
            var normalizedPlate = request.LicensePlate?.Trim().Replace("-", "").Replace(".", "").Replace(" ", "").ToUpper() ?? "";
            if (!request.NoPlate && !string.IsNullOrEmpty(normalizedPlate))
            {
                activeReservation = await _dbContext.Reservations
                    .FirstOrDefaultAsync(r => r.NormalizedPlateNumber == normalizedPlate && r.Status == "CONFIRMED" && r.ExpiresAt >= DateTimeOffset.UtcNow && r.CheckedInAt == null);
            }

            if (activeReservation == null)
            {
                // Nếu không có đặt chỗ trước, validate bình thường
                if (vehicleType.RequiresSlot)
                {
                    if (!request.SelectedSlotId.HasValue)
                        throw new Exception("SLOT_REQUIRED_FOR_VEHICLE_TYPE");

                    var slot = await _dbContext.Slots.FirstOrDefaultAsync(s => s.Id == request.SelectedSlotId.Value);
                    if (slot == null || slot.Status != "AVAILABLE" || slot.AllowedVehicleTypeId != request.VehicleTypeId)
                        throw new Exception("SLOT_NOT_AVAILABLE");
                }
                else
                {
                    if (request.SelectedSlotId.HasValue)
                        throw new Exception("SLOT_MUST_BE_NULL_FOR_AREA_MANAGED_VEHICLE");
                }
            }

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
}