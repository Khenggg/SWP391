using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.ParkingStructure.Floors;

public class FloorService
{
    private readonly ParkingDbContext _context;

    public FloorService(ParkingDbContext context)
    {
        _context = context;
    }

    public async Task<List<FloorResponse>> GetAllAsync()
    {
        return await _context.Floors
            .Select(x => new FloorResponse
            {
                Id = x.Id,
                FloorCode = x.FloorCode,
                FloorName = x.FloorName,
                Status = x.Status
            })
            .ToListAsync();
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

        var entity = new Floor
        {
            FloorCode = code,
            FloorName = request.FloorName.Trim(),
            Status = "ACTIVE",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _context.Floors.Add(entity);
        await _context.SaveChangesAsync();

        return new FloorResponse
        {
            Id = entity.Id,
            FloorCode = entity.FloorCode,
            FloorName = entity.FloorName,
            Status = entity.Status
        };
    }

    public async Task<FloorResponse> UpdateAsync(long id, UpdateFloorRequest request)
    {
        var entity = await _context.Floors.FindAsync(id);

        if (entity == null)
            throw new BusinessException(ErrorCodes.FloorNotFound, StatusCodes.Status404NotFound);

        entity.FloorName = request.FloorName.Trim();
        entity.Status = request.Status.Trim().ToUpper();
        entity.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        return new FloorResponse
        {
            Id = entity.Id,
            FloorCode = entity.FloorCode,
            FloorName = entity.FloorName,
            Status = entity.Status
        };
    }
}
