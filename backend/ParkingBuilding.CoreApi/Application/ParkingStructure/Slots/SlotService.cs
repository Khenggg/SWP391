using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Application.Notifications;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Application.ParkingStructure.Slots;

public class SlotService
{
    private readonly ParkingDbContext _context;
    private readonly INotificationWriterService _notificationWriter;

    public SlotService(ParkingDbContext context, INotificationWriterService notificationWriter)
    {
        _context = context;
        _notificationWriter = notificationWriter;
    }

    // ================= CREATE =================
    public async Task<SlotResponse> CreateAsync(CreateSlotRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SlotCode))
            throw new BusinessException(ErrorCodes.SlotCodeRequired);

        // ===== CHECK AREA =====
        var area = await _context.Areas
            .Include(x => x.AreaVehicleTypes)
            .FirstOrDefaultAsync(x => x.Id == request.AreaId);

        if (area == null)
            throw new BusinessException(ErrorCodes.AreaNotFound, StatusCodes.Status404NotFound);

        // ===== NORMALIZE =====
        var code = request.SlotCode.Trim().ToUpper();

        // ===== CHECK DUPLICATE =====
        var exists = await _context.Slots
            .AnyAsync(x => x.AreaId == request.AreaId && x.SlotCode == code);

        if (exists)
            throw new BusinessException(ErrorCodes.SlotCodeExists, StatusCodes.Status409Conflict);

        // ===== CHECK FLOOR VEHICLE TYPES =====
        var floor = await _context.Floors
            .Include(x => x.FloorVehicleTypes)
            .FirstOrDefaultAsync(x => x.Id == area.FloorId);

        if (floor != null && floor.FloorVehicleTypes.Any())
        {
            var isFloorAllowed = floor.FloorVehicleTypes.Any(x => x.VehicleTypeId == request.AllowedVehicleTypeId);
            if (!isFloorAllowed)
            {
                var vehicleTypeName = await _context.Set<VehicleType>()
                    .Where(v => v.Id == request.AllowedVehicleTypeId)
                    .Select(v => v.Name)
                    .FirstOrDefaultAsync() ?? "này";

                throw new BusinessException($"Tầng '{floor.FloorCode}' ({floor.FloorName}) không được cấu hình cho phép loại xe '{vehicleTypeName}'. Không thể tạo Slot cho tầng này.", StatusCodes.Status400BadRequest);
            }
        }

        // ===== VALIDATE VEHICLE TYPE =====
        var allowed = area.AreaVehicleTypes
            .Any(x => x.VehicleTypeId == request.AllowedVehicleTypeId);

        if (!allowed)
        {
            var vehicleTypeName = await _context.Set<VehicleType>()
                .Where(v => v.Id == request.AllowedVehicleTypeId)
                .Select(v => v.Name)
                .FirstOrDefaultAsync() ?? "này";

            throw new BusinessException($"Khu vực '{area.AreaCode}' ({area.AreaName}) chưa được cấu hình hỗ trợ loại xe '{vehicleTypeName}'. Vui lòng bổ sung loại xe áp dụng cho Khu vực trước khi thêm Slot.", StatusCodes.Status400BadRequest);
        }

        // ===== CREATE =====
        var entity = new Slot
        {
            AreaId = request.AreaId,
            SlotCode = code,
            AllowedVehicleTypeId = request.AllowedVehicleTypeId,
            Status = "AVAILABLE",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _context.Slots.Add(entity);
        await _context.SaveChangesAsync();

        return new SlotResponse
        {
            Id = entity.Id,
            AreaId = entity.AreaId,
            SlotCode = entity.SlotCode,
            AllowedVehicleTypeId = entity.AllowedVehicleTypeId,
            Status = entity.Status
        };
    }

    // ================= UPDATE STATUS =================
    public async Task<SlotResponse> UpdateStatusAsync(long id, UpdateSlotStatusRequest request)
    {
        var slot = await _context.Slots
            .Include(x => x.Area)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (slot == null)
            throw new BusinessException(ErrorCodes.SlotNotFound, StatusCodes.Status404NotFound);

        var newStatus = request.Status.Trim().ToUpper();
        var oldStatus = slot.Status;

        var validStatuses = new[]
        {
            "AVAILABLE",
            "RESERVED",
            "OCCUPIED",
            "LOCKED",
            "MAINTENANCE"
        };

        if (!validStatuses.Contains(newStatus))
            throw new BusinessException(ErrorCodes.InvalidStatus);

        // ===== INVALID TRANSITION =====
        if (oldStatus == "OCCUPIED" && newStatus == "RESERVED")
            throw new BusinessException(ErrorCodes.SlotStatusTransitionInvalid);

        // ===== CAPACITY CHECK =====
        if (newStatus == "OCCUPIED" &&
            slot.Area.CurrentRealOccupancy >= slot.Area.TotalCapacity)
            throw new BusinessException(ErrorCodes.SelectedAreaFull);

        if (newStatus == "RESERVED" &&
            slot.Area.CurrentBookedSlots >= slot.Area.TotalCapacity)
            throw new BusinessException(ErrorCodes.AreaBookingFull);

        // ===== REMOVE OLD =====
        if (oldStatus == "OCCUPIED")
            slot.Area.CurrentRealOccupancy--;

        if (oldStatus == "RESERVED")
            slot.Area.CurrentBookedSlots--;

        // ===== ADD NEW =====
        if (newStatus == "OCCUPIED")
            slot.Area.CurrentRealOccupancy++;

        if (newStatus == "RESERVED")
            slot.Area.CurrentBookedSlots++;

        slot.Status = newStatus;
        slot.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        if (oldStatus != slot.Status)
        {
            var statusText = slot.Status == "AVAILABLE" ? "hoạt động trở lại (sẵn sàng)" : (slot.Status == "LOCKED" ? "tạm khóa" : (slot.Status == "MAINTENANCE" ? "bảo trì" : slot.Status.ToLower()));
            try
            {
                var drivers = await _context.Users
                    .Where(u => u.Role == Domain.Enums.UserRole.DRIVER && u.Status == Domain.Enums.UserStatus.ACTIVE)
                    .Select(u => u.Id)
                    .ToListAsync();

                var title = $"Thay đổi trạng thái vị trí đỗ {slot.SlotCode}";
                var content = $"Vị trí đỗ xe {slot.SlotCode} tại khu {slot.Area.AreaName} đã chuyển sang trạng thái {statusText}. Vui lòng lưu ý khi đặt chỗ hoặc đỗ xe.";

                foreach (var driverId in drivers)
                {
                    await _notificationWriter.CreateNotificationAsync(driverId, title, content, "SYSTEM", "NORMAL");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending slot status notifications: {ex.Message}");
            }
        }

        return new SlotResponse
        {
            Id = slot.Id,
            AreaId = slot.AreaId,
            SlotCode = slot.SlotCode,
            AllowedVehicleTypeId = slot.AllowedVehicleTypeId,
            Status = slot.Status
        };
    }

    public async Task<List<SlotResponse>> GetAllAsync()
    {
        return await _context.Slots
            .Select(x => new SlotResponse
            {
                Id = x.Id,
                AreaId = x.AreaId,
                SlotCode = x.SlotCode,
                AllowedVehicleTypeId = x.AllowedVehicleTypeId,
                Status = x.Status
            })
            .ToListAsync();
    }
}
