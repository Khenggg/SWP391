using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.ParkingStructure.Slots;

public class SlotService
{
    private readonly ParkingDbContext _context;

    public SlotService(ParkingDbContext context)
    {
        _context = context;
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

        // ===== VALIDATE VEHICLE TYPE =====
        var allowed = area.AreaVehicleTypes
            .Any(x => x.VehicleTypeId == request.AllowedVehicleTypeId);

        if (!allowed)
            throw new BusinessException(ErrorCodes.SlotNotAllowedForVehicleType);

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

        return new SlotResponse
        {
            Id = slot.Id,
            AreaId = slot.AreaId,
            SlotCode = slot.SlotCode,
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
                Status = x.Status
            })
            .ToListAsync();
    }
}
