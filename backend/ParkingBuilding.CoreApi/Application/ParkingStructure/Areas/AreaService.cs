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

namespace ParkingBuilding.CoreApi.Application.ParkingStructure.Areas;

public class AreaService
{
    private readonly ParkingDbContext _context;
    private readonly INotificationWriterService _notificationWriter;

    public AreaService(ParkingDbContext context, INotificationWriterService notificationWriter)
    {
        _context = context;
        _notificationWriter = notificationWriter;
    }

    // ================= CREATE =================
    public async Task<AreaResponse> CreateAsync(CreateAreaRequest request)
    {
        // ===== 1. VALIDATE INPUT =====
        if (string.IsNullOrWhiteSpace(request.AreaCode))
            throw new BusinessException(ErrorCodes.AreaCodeRequired);

        if (string.IsNullOrWhiteSpace(request.AreaName))
            throw new BusinessException(ErrorCodes.AreaNameRequired);

        if (request.TotalCapacity < 0)
            throw new BusinessException(ErrorCodes.AreaCapacityInvalid);

        // ===== 2. CHECK FLOOR =====
        var floorExists = await _context.Floors
            .AnyAsync(x => x.Id == request.FloorId);

        if (!floorExists)
            throw new BusinessException(ErrorCodes.FloorNotFound, StatusCodes.Status404NotFound);

        // ===== 3. NORMALIZE =====
        var code = request.AreaCode.Trim().ToUpper();

        // ===== 4. CHECK DUPLICATE =====
        var exists = await _context.Areas
            .AnyAsync(x => x.FloorId == request.FloorId && x.AreaCode == code);

        if (exists)
            throw new BusinessException(ErrorCodes.AreaCodeExists, StatusCodes.Status409Conflict);

        // ===== 5. VEHICLE TYPES (FIX DISTINCT) =====
        var vehicleTypeIds = request.VehicleTypeIds
            .Distinct()
            .ToList();

        if (vehicleTypeIds.Any())
        {
            var validCount = await _context.Set<VehicleType>()
                .CountAsync(x => vehicleTypeIds.Contains(x.Id));

            if (validCount != vehicleTypeIds.Count)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            var floorVehicleTypeIds = await _context.FloorVehicleTypes
                .Where(fvt => fvt.FloorId == request.FloorId)
                .Select(fvt => fvt.VehicleTypeId)
                .ToListAsync();

            if (floorVehicleTypeIds.Any())
            {
                var invalidForFloor = vehicleTypeIds.Except(floorVehicleTypeIds).ToList();
                if (invalidForFloor.Any())
                    throw new BusinessException(ErrorCodes.AreaVehicleTypeMismatch, StatusCodes.Status400BadRequest);
            }
        }

        // ===== 6. CREATE ENTITY =====
        var entity = new Area
        {
            FloorId = request.FloorId,
            AreaCode = code,
            AreaName = request.AreaName.Trim(),
            PriorityOrder = request.PriorityOrder,
            Status = "ACTIVE",
            ManagementType = string.IsNullOrWhiteSpace(request.ManagementType) ? "CAPACITY" : request.ManagementType.Trim().ToUpper(),
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
        return await GetAreaResponseByIdAsync(entity.Id);
    }

    // ================= UPDATE =================
    public async Task<AreaResponse> UpdateAsync(long id, UpdateAreaRequest request)
    {
        // ===== 1. FIND =====
        var entity = await _context.Areas
            .Include(x => x.AreaVehicleTypes)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity == null)
            throw new BusinessException(ErrorCodes.AreaNotFound, StatusCodes.Status404NotFound);

        // ===== 2. VALIDATE =====
        if (string.IsNullOrWhiteSpace(request.AreaName))
            throw new BusinessException(ErrorCodes.AreaNameRequired);

        if (string.IsNullOrWhiteSpace(request.Status))
            throw new BusinessException(ErrorCodes.InvalidStatus);

        if (request.TotalCapacity < 0)
            throw new BusinessException(ErrorCodes.AreaCapacityInvalid);

        // ===== 3. CAPACITY RULE =====
        if (request.TotalCapacity < entity.CurrentRealOccupancy)
            throw new BusinessException(ErrorCodes.AreaCapacityBelowOccupancy);

        if (request.TotalCapacity < entity.CurrentBookedSlots)
            throw new BusinessException(ErrorCodes.AreaCapacityBelowBookings);

        // ===== 4. VEHICLE TYPES (FIX DISTINCT) =====
        var vehicleTypeIds = request.VehicleTypeIds
            .Distinct()
            .ToList();

        if (vehicleTypeIds.Any())
        {
            var validCount = await _context.Set<VehicleType>()
                .CountAsync(x => vehicleTypeIds.Contains(x.Id));

            if (validCount != vehicleTypeIds.Count)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            var floorVehicleTypeIds = await _context.FloorVehicleTypes
                .Where(fvt => fvt.FloorId == entity.FloorId)
                .Select(fvt => fvt.VehicleTypeId)
                .ToListAsync();

            if (floorVehicleTypeIds.Any())
            {
                var invalidForFloor = vehicleTypeIds.Except(floorVehicleTypeIds).ToList();
                if (invalidForFloor.Any())
                    throw new BusinessException(ErrorCodes.AreaVehicleTypeMismatch, StatusCodes.Status400BadRequest);
            }
        }

        // ===== 5. UPDATE BASIC =====
        var oldStatus = entity.Status;
        entity.AreaName = request.AreaName.Trim();
        entity.PriorityOrder = request.PriorityOrder;
        entity.TotalCapacity = request.TotalCapacity;
        entity.Status = request.Status.Trim().ToUpper();
        entity.ManagementType = string.IsNullOrWhiteSpace(request.ManagementType) ? "CAPACITY" : request.ManagementType.Trim().ToUpper();
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

        if (oldStatus != entity.Status)
        {
            var statusText = entity.Status == "ACTIVE" ? "hoạt động trở lại" : (entity.Status == "LOCKED" ? "tạm khóa" : "bảo trì");
            try
            {
                var drivers = await _context.Users
                    .Where(u => u.Role == Domain.Enums.UserRole.DRIVER && u.Status == Domain.Enums.UserStatus.ACTIVE)
                    .Select(u => u.Id)
                    .ToListAsync();

                var title = $"Thay đổi trạng thái Khu vực {entity.AreaCode}";
                var content = $"Khu vực đỗ xe {entity.AreaName} ({entity.AreaCode}) đã chuyển sang trạng thái {statusText}. Vui lòng lưu ý khi đặt chỗ hoặc đỗ xe.";

                foreach (var driverId in drivers)
                {
                    await _notificationWriter.CreateNotificationAsync(driverId, title, content, "SYSTEM", "NORMAL");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending area status notifications: {ex.Message}");
            }
        }

        // ===== 8. RETURN =====
        return await GetAreaResponseByIdAsync(entity.Id);
    }

    public async Task<List<AreaResponse>> GetAllAsync()
    {
        return await _context.Areas
            .AsNoTracking()
            .Select(x => new AreaResponse
            {
                Id = x.Id,
                FloorId = x.FloorId,
                FloorCode = x.Floor.FloorCode,
                AreaCode = x.AreaCode,
                AreaName = x.AreaName,
                PriorityOrder = x.PriorityOrder,
                TotalCapacity = x.TotalCapacity,
                Status = x.Status,
                ManagementType = x.ManagementType,
                VehicleTypeIds = x.AreaVehicleTypes.Select(vt => vt.VehicleTypeId).ToList(),
                VehicleTypeNames = x.AreaVehicleTypes.Select(vt => vt.VehicleType.Name).ToList()
            })
            .ToListAsync();
    }

    private async Task<AreaResponse> GetAreaResponseByIdAsync(long id)
    {
        var area = await _context.Areas
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new AreaResponse
            {
                Id = x.Id,
                FloorId = x.FloorId,
                FloorCode = x.Floor.FloorCode,
                AreaCode = x.AreaCode,
                AreaName = x.AreaName,
                PriorityOrder = x.PriorityOrder,
                TotalCapacity = x.TotalCapacity,
                Status = x.Status,
                ManagementType = x.ManagementType,
                VehicleTypeIds = x.AreaVehicleTypes.Select(vt => vt.VehicleTypeId).ToList(),
                VehicleTypeNames = x.AreaVehicleTypes.Select(vt => vt.VehicleType.Name).ToList()
            })
            .FirstOrDefaultAsync();

        if (area == null)
            throw new BusinessException(ErrorCodes.AreaNotFound, StatusCodes.Status404NotFound);

        return area;
    }
}
