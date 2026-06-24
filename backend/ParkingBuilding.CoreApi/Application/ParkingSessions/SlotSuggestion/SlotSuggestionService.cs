using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.SlotSuggestion;

public class SlotSuggestionService : ISlotSuggestionService
{
    private readonly ParkingDbContext _dbContext;

    public SlotSuggestionService(ParkingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SuggestSlotResponse?> SuggestSlotAsync(SuggestSlotRequest request)
    {
        // Thực hiện query tối ưu để khớp tất cả các điều kiện của F031
        var suggestedSlot = await _dbContext.Slots
            .Include(s => s.Area)
                .ThenInclude(a => a.Floor)
            .Where(s =>
                s.Status == "AVAILABLE" && // Vị trí còn trống
                s.AllowedVehicleTypeId == request.VehicleTypeId && // Đúng loại xe được cấu hình trên slot
                s.Area.Status == "ACTIVE" && // Khu vực đang hoạt động
                s.Area.Floor.Status == "ACTIVE" && // Tầng đang hoạt động
                s.Area.AreaVehicleTypes.Any(avt => avt.VehicleTypeId == request.VehicleTypeId)) // Khu vực đó có mapping loại xe này
            .OrderBy(s => s.Area.PriorityOrder) // Ưu tiên Khu vực có priority_order nhỏ nhất trước
            .ThenBy(s => s.Id) // Nếu trùng độ ưu tiên, lấy slot có ID nhỏ nhất
            .Select(s => new SuggestSlotResponse
            {
                FloorId = s.Area.FloorId,
                FloorCode = s.Area.Floor.FloorCode,
                AreaId = s.AreaId,
                AreaCode = s.Area.AreaCode,
                SlotId = s.Id,
                SlotCode = s.SlotCode
            })
            .FirstOrDefaultAsync();

        return suggestedSlot;
    }
}