using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.ParkingStructure.Areas;

public class AreaService
{
    private readonly ParkingDbContext _context;

    public AreaService(ParkingDbContext context)
    {
        _context = context;
    }

    // ================= CREATE =================
    public async Task<AreaResponse> CreateAsync(CreateAreaRequest request)
    {
        // ===== 1. VALIDATE INPUT =====
        if (string.IsNullOrWhiteSpace(request.AreaCode))
            throw new ArgumentException("AreaCode is required");

        if (string.IsNullOrWhiteSpace(request.AreaName))
            throw new ArgumentException("AreaName is required");

        if (request.TotalCapacity < 0)
            throw new ArgumentException("TotalCapacity must be >= 0");

        // ===== 2. CHECK FLOOR =====
        var floorExists = await _context.Floors
            .AnyAsync(x => x.Id == request.FloorId);

        if (!floorExists)
            throw new KeyNotFoundException("Floor not found");

        // ===== 3. NORMALIZE =====
        var code = request.AreaCode.Trim().ToUpper();

        // ===== 4. CHECK DUPLICATE =====
        var exists = await _context.Areas
            .AnyAsync(x => x.FloorId == request.FloorId && x.AreaCode == code);

        if (exists)
            throw new InvalidOperationException("Area code already exists in this floor");

        // ===== 5. VEHICLE TYPES (FIX DISTINCT) =====
        var vehicleTypeIds = request.VehicleTypeIds
            .Distinct()
            .ToList();

        if (vehicleTypeIds.Any())
        {
            var validCount = await _context.Set<VehicleType>()
                .CountAsync(x => vehicleTypeIds.Contains(x.Id));

            if (validCount != vehicleTypeIds.Count)
                throw new ArgumentException("Invalid VehicleTypeIds");
        }

        // ===== 6. CREATE ENTITY =====
        var entity = new Area
        {
            FloorId = request.FloorId,
            AreaCode = code,
            AreaName = request.AreaName.Trim(),
            PriorityOrder = request.PriorityOrder,
            Status = "ACTIVE",
            TotalCapacity = request.TotalCapacity,
            CurrentRealOccupancy = 0,
            CurrentBookedSlots = 0,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _context.Areas.Add(entity);

        // ===== 7. MANY-TO-MANY =====
        if (vehicleTypeIds.Any())
        {
            foreach (var vtId in vehicleTypeIds)
            {
                entity.AreaVehicleTypes.Add(new AreaVehicleType
                {
                    Area = entity,
                    VehicleTypeId = vtId
                });
            }
        }

        // ===== 8. SAVE 1 LẦN =====
        await _context.SaveChangesAsync();

        // ===== 9. RETURN =====
        return new AreaResponse
        {
            Id = entity.Id,
            FloorId = entity.FloorId,
            AreaCode = entity.AreaCode,
            AreaName = entity.AreaName,
            TotalCapacity = entity.TotalCapacity,
            Status = entity.Status
        };
    }

    // ================= UPDATE =================
    public async Task<AreaResponse> UpdateAsync(long id, UpdateAreaRequest request)
    {
        // ===== 1. FIND =====
        var entity = await _context.Areas
            .Include(x => x.AreaVehicleTypes)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity == null)
            throw new KeyNotFoundException("Area not found");

        // ===== 2. VALIDATE =====
        if (string.IsNullOrWhiteSpace(request.AreaName))
            throw new ArgumentException("AreaName is required");

        if (string.IsNullOrWhiteSpace(request.Status))
            throw new ArgumentException("Status is required");

        if (request.TotalCapacity < 0)
            throw new ArgumentException("TotalCapacity must be >= 0");

        // ===== 3. CAPACITY RULE =====
        if (request.TotalCapacity < entity.CurrentRealOccupancy)
            throw new InvalidOperationException("TotalCapacity < CurrentRealOccupancy");

        if (request.TotalCapacity < entity.CurrentBookedSlots)
            throw new InvalidOperationException("TotalCapacity < CurrentBookedSlots");

        // ===== 4. VEHICLE TYPES (FIX DISTINCT) =====
        var vehicleTypeIds = request.VehicleTypeIds
            .Distinct()
            .ToList();

        if (vehicleTypeIds.Any())
        {
            var validCount = await _context.Set<VehicleType>()
                .CountAsync(x => vehicleTypeIds.Contains(x.Id));

            if (validCount != vehicleTypeIds.Count)
                throw new ArgumentException("Invalid VehicleTypeIds");
        }

        // ===== 5. UPDATE BASIC =====
        entity.AreaName = request.AreaName.Trim();
        entity.PriorityOrder = request.PriorityOrder;
        entity.TotalCapacity = request.TotalCapacity;
        entity.Status = request.Status.Trim().ToUpper();
        entity.UpdatedAt = DateTimeOffset.UtcNow;

        // ===== 6. SYNC MANY-TO-MANY =====
        var currentIds = entity.AreaVehicleTypes
            .Select(x => x.VehicleTypeId)
            .ToList();

        var toAdd = vehicleTypeIds.Except(currentIds);
        var toRemove = currentIds.Except(vehicleTypeIds);

        // ADD
        var newMappings = toAdd.Select(vtId => new AreaVehicleType
        {
            AreaId = entity.Id,
            VehicleTypeId = vtId
        });

        _context.AreaVehicleTypes.AddRange(newMappings);

        // REMOVE
        var removeMappings = entity.AreaVehicleTypes
            .Where(x => toRemove.Contains(x.VehicleTypeId));

        _context.AreaVehicleTypes.RemoveRange(removeMappings);

        // ===== 7. SAVE =====
        await _context.SaveChangesAsync();

        // ===== 8. RETURN =====
        return new AreaResponse
        {
            Id = entity.Id,
            FloorId = entity.FloorId,
            AreaCode = entity.AreaCode,
            AreaName = entity.AreaName,
            TotalCapacity = entity.TotalCapacity,
            Status = entity.Status
        };
    }
}