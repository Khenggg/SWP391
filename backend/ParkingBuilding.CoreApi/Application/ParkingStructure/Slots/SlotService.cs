using Microsoft.EntityFrameworkCore;
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
            throw new ArgumentException("SlotCode is required");

        // ===== CHECK AREA =====
        var area = await _context.Areas
            .Include(x => x.AreaVehicleTypes)
            .FirstOrDefaultAsync(x => x.Id == request.AreaId);

        if (area == null)
            throw new KeyNotFoundException("Area not found");

        // ===== NORMALIZE =====
        var code = request.SlotCode.Trim().ToUpper();

        // ===== CHECK DUPLICATE =====
        var exists = await _context.Slots
            .AnyAsync(x => x.AreaId == request.AreaId && x.SlotCode == code);

        if (exists)
            throw new InvalidOperationException("Slot code already exists in this area");

        // ===== VALIDATE VEHICLE TYPE =====
        var allowed = area.AreaVehicleTypes
            .Any(x => x.VehicleTypeId == request.AllowedVehicleTypeId);

        if (!allowed)
            throw new ArgumentException("VehicleType not allowed in this area");

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
            throw new KeyNotFoundException("Slot not found");

        var newStatus = request.Status.Trim().ToUpper();
        var oldStatus = slot.Status;

        var validStatuses = new[] { "AVAILABLE", "OCCUPIED", "BOOKED" };

        if (!validStatuses.Contains(newStatus))
            throw new ArgumentException("Invalid status");

        // ===== INVALID TRANSITION =====
        if (oldStatus == "OCCUPIED" && newStatus == "BOOKED")
            throw new InvalidOperationException("Invalid transition");

        // ===== CAPACITY CHECK =====
        if (newStatus == "OCCUPIED" &&
            slot.Area.CurrentRealOccupancy >= slot.Area.TotalCapacity)
            throw new InvalidOperationException("Area is full");

        if (newStatus == "BOOKED" &&
            slot.Area.CurrentBookedSlots >= slot.Area.TotalCapacity)
            throw new InvalidOperationException("Area booking full");

        // ===== REMOVE OLD =====
        if (oldStatus == "OCCUPIED")
            slot.Area.CurrentRealOccupancy--;

        if (oldStatus == "BOOKED")
            slot.Area.CurrentBookedSlots--;

        // ===== ADD NEW =====
        if (newStatus == "OCCUPIED")
            slot.Area.CurrentRealOccupancy++;

        if (newStatus == "BOOKED")
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
}