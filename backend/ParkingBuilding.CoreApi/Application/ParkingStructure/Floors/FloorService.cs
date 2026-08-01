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

namespace ParkingBuilding.CoreApi.Application.ParkingStructure.Floors;

public class FloorService
{
    private readonly ParkingDbContext _context;
    private readonly INotificationWriterService _notificationWriter;

    public FloorService(ParkingDbContext context, INotificationWriterService notificationWriter)
    {
        _context = context;
        _notificationWriter = notificationWriter;
    }

    public async Task<List<FloorResponse>> GetAllAsync()
    {
        return await _context.Floors
            .AsNoTracking()
            .Select(x => new FloorResponse
            {
                Id = x.Id,
                FloorCode = x.FloorCode,
                FloorName = x.FloorName,
                Status = x.Status,
                VehicleTypeIds = x.FloorVehicleTypes.Select(vt => vt.VehicleTypeId).ToList(),
                VehicleTypeNames = x.FloorVehicleTypes.Select(vt => vt.VehicleType.Name).ToList()
            })
            .ToListAsync();
    }

    private async Task NotifyDriversAsync(string title, string content)
    {
        try
        {
            var drivers = await _context.Users
                .Where(u => u.Role == Domain.Enums.UserRole.DRIVER && u.Status == Domain.Enums.UserStatus.ACTIVE)
                .Select(u => u.Id)
                .ToListAsync();

            foreach (var driverId in drivers)
            {
                await _notificationWriter.CreateNotificationAsync(driverId, title, content, "SYSTEM", "NORMAL");
            }
        }
        catch (Exception ex)
        {
            // Fail-safe: Do not crash business transactions if sending notifications fails
            Console.WriteLine($"Error sending notifications to drivers: {ex.Message}");
        }
    }

    public async Task<FloorResponse> CreateAsync(CreateFloorRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FloorCode))
            throw new BusinessException(ErrorCodes.FloorCodeRequired);

        if (string.IsNullOrWhiteSpace(request.FloorName))
            throw new BusinessException(ErrorCodes.FloorNameRequired);

        var code = request.FloorCode.Trim().ToUpper();

        var exists = await _context.Floors
            .AnyAsync(x => x.FloorCode == code);

        if (exists)
            throw new BusinessException(ErrorCodes.FloorCodeExists, StatusCodes.Status409Conflict);

        var vehicleTypeIds = request.VehicleTypeIds
            .Distinct()
            .ToList();

        if (vehicleTypeIds.Any())
        {
            var validCount = await _context.Set<VehicleType>()
                .CountAsync(x => vehicleTypeIds.Contains(x.Id));

            if (validCount != vehicleTypeIds.Count)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound);
        }

        var entity = new Floor
        {
            FloorCode = code,
            FloorName = request.FloorName.Trim(),
            Status = "ACTIVE",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _context.Floors.Add(entity);

        if (vehicleTypeIds.Any())
        {
            foreach (var vtId in vehicleTypeIds)
            {
                entity.FloorVehicleTypes.Add(new FloorVehicleType
                {
                    Floor = entity,
                    VehicleTypeId = vtId
                });
            }
        }

        await _context.SaveChangesAsync();

        // Auto create default ENTRY & EXIT gates for the new floor
        _context.Gates.Add(new Gate
        {
            FloorId = entity.Id,
            GateCode = $"{entity.FloorCode}-IN",
            GateType = "ENTRY",
            Status = "ACTIVE",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });

        _context.Gates.Add(new Gate
        {
            FloorId = entity.Id,
            GateCode = $"{entity.FloorCode}-OUT",
            GateType = "EXIT",
            Status = "ACTIVE",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });

        await _context.SaveChangesAsync();

        await NotifyDriversAsync(
            $"Thêm tầng đỗ xe mới: {entity.FloorCode}",
            $"Tầng đỗ xe {entity.FloorName} ({entity.FloorCode}) đã được đưa vào hoạt động. Bạn đã có thể đặt chỗ hoặc đỗ xe tại tầng này."
        );

        return await GetFloorResponseByIdAsync(entity.Id);
    }

    public async Task<FloorResponse> UpdateAsync(long id, UpdateFloorRequest request)
    {
        var entity = await _context.Floors
            .Include(x => x.FloorVehicleTypes)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity == null)
            throw new BusinessException(ErrorCodes.FloorNotFound, StatusCodes.Status404NotFound);

        // Code update validation
        if (!string.IsNullOrWhiteSpace(request.FloorCode))
        {
            var newCode = request.FloorCode.Trim().ToUpper();
            if (newCode != entity.FloorCode)
            {
                var exists = await _context.Floors
                    .AnyAsync(x => x.Id != id && x.FloorCode == newCode);
                if (exists)
                    throw new BusinessException(ErrorCodes.FloorCodeExists, StatusCodes.Status409Conflict);

                entity.FloorCode = newCode;
            }
        }

        if (string.IsNullOrWhiteSpace(request.FloorName))
            throw new BusinessException(ErrorCodes.FloorNameRequired);

        var oldStatus = entity.Status;
        entity.FloorName = request.FloorName.Trim();
        entity.Status = request.Status.Trim().ToUpper();
        entity.UpdatedAt = DateTimeOffset.UtcNow;

        // Vehicle types sync
        var vehicleTypeIds = request.VehicleTypeIds
            .Distinct()
            .ToList();

        if (vehicleTypeIds.Any())
        {
            var validCount = await _context.Set<VehicleType>()
                .CountAsync(x => vehicleTypeIds.Contains(x.Id));

            if (validCount != vehicleTypeIds.Count)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound);
        }

        var currentIds = entity.FloorVehicleTypes
            .Select(x => x.VehicleTypeId)
            .ToList();

        var toAdd = vehicleTypeIds.Except(currentIds);
        var toRemove = currentIds.Except(vehicleTypeIds);

        var newMappings = toAdd.Select(vtId => new FloorVehicleType
        {
            FloorId = entity.Id,
            VehicleTypeId = vtId
        });

        _context.FloorVehicleTypes.AddRange(newMappings);

        var removeMappings = entity.FloorVehicleTypes
            .Where(x => toRemove.Contains(x.VehicleTypeId));

        _context.FloorVehicleTypes.RemoveRange(removeMappings);

        await _context.SaveChangesAsync();

        if (oldStatus != entity.Status)
        {
            var statusText = entity.Status == "ACTIVE" ? "hoạt động trở lại" : (entity.Status == "LOCKED" ? "tạm khóa" : "ngừng hoạt động");
            await NotifyDriversAsync(
                $"Thay đổi trạng thái Tầng {entity.FloorCode}",
                $"Tầng {entity.FloorCode} ({entity.FloorName}) đã chuyển sang trạng thái {statusText}. Vui lòng lưu ý khi đặt chỗ hoặc đỗ xe."
            );
        }

        return await GetFloorResponseByIdAsync(entity.Id);
    }

    public async Task DeleteAsync(long id, bool isHardDelete = false)
    {
        var entity = await _context.Floors.FindAsync(id);
        if (entity == null)
            throw new BusinessException(ErrorCodes.FloorNotFound, StatusCodes.Status404NotFound);

        if (isHardDelete)
        {
            var hasAreas = await _context.Areas.AnyAsync(x => x.FloorId == id);
            if (hasAreas)
                throw new BusinessException(ErrorCodes.FloorHasAreas, StatusCodes.Status400BadRequest);

            var floorCode = entity.FloorCode;
            var floorName = entity.FloorName;

            _context.Floors.Remove(entity);
            await _context.SaveChangesAsync();

            await NotifyDriversAsync(
                $"Gỡ bỏ tầng đỗ xe: {floorCode}",
                $"Tầng đỗ xe {floorName} ({floorCode}) đã được gỡ bỏ khỏi hệ thống sơ đồ."
            );
        }
        else
        {
            // Soft delete: update status to INACTIVE
            entity.Status = "INACTIVE";
            entity.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            await NotifyDriversAsync(
                $"Ngừng hoạt động tầng đỗ xe: {entity.FloorCode}",
                $"Tầng đỗ xe {entity.FloorName} ({entity.FloorCode}) đã được chuyển sang trạng thái ngừng hoạt động."
            );
        }
    }

    private async Task<FloorResponse> GetFloorResponseByIdAsync(long id)
    {
        var floor = await _context.Floors
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new FloorResponse
            {
                Id = x.Id,
                FloorCode = x.FloorCode,
                FloorName = x.FloorName,
                Status = x.Status,
                VehicleTypeIds = x.FloorVehicleTypes.Select(vt => vt.VehicleTypeId).ToList(),
                VehicleTypeNames = x.FloorVehicleTypes.Select(vt => vt.VehicleType.Name).ToList()
            })
            .FirstOrDefaultAsync();

        if (floor == null)
            throw new BusinessException(ErrorCodes.FloorNotFound, StatusCodes.Status404NotFound);

        return floor;
    }
}
