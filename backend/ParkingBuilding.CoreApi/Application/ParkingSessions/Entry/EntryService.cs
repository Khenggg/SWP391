using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;

public class EntryService : IEntryService
{
    // TODO: Thay ParkingDbContext bằng DbContext thực tế của bạn nếu tên khác
    private readonly ParkingDbContext _dbContext;

    public EntryService(ParkingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task CreateEntryAsync(CreateEntryRequest request)
    {
        // Khởi tạo ExecutionStrategy để hỗ trợ retry nếu có lỗi kết nối DB tạm thời
        var strategy = _dbContext.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                // 1. Lấy thông tin Thẻ và kiểm tra
                var card = await _dbContext.ParkingCards
                    .FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);

                if (card == null || card.Status != CardStatus.AVAILABLE)
                {
                    throw new InvalidOperationException("Thẻ không hợp lệ hoặc đang được sử dụng.");
                }

                // 2. Lấy thông tin Vị trí đỗ (Bao gồm Area để lấy FloorId)
                // Phải có request.SelectedSlotId thì mới xử lý phần này
                if (!request.SelectedSlotId.HasValue)
                {
                    throw new ArgumentException("Bắt buộc phải chọn vị trí đỗ (SelectedSlotId).");
                }

                var slot = await _dbContext.Slots
                    .Include(s => s.Area)
                    .FirstOrDefaultAsync(s => s.Id == request.SelectedSlotId.Value);

                // TODO: Kiểm tra lại slot.Status xem bạn đang dùng String hay Enum để so sánh cho đúng
                if (slot == null || slot.Status != "AVAILABLE")
                {
                    throw new InvalidOperationException("Vị trí đỗ không tồn tại hoặc đã có xe.");
                }

                // 3. Tạo mới dữ liệu Phiên đỗ xe (ParkingSession)
                var newSession = new ParkingSession
                {
                    // Tạo một mã Session ngẫu nhiên làm ví dụ
                    SessionCode = Guid.NewGuid().ToString("N").Substring(0, 10).ToUpper(),
                    CardId = card.Id,
                    PlateNumber = request.LicensePlate,
                    NoPlate = request.NoPlate,
                    VehicleDescription = request.VehicleDescription,
                    VehicleTypeId = request.VehicleTypeId,
                    EntryGateId = request.EntryGateId,
                    SlotId = request.SelectedSlotId,
                    AreaId = slot.AreaId,
                    FloorId = slot.Area.FloorId, // Yêu cầu Entity Area phải có quan hệ với Floor

                    // TODO: Ở môi trường thực tế, lấy ID của nhân viên từ JWT Token (HttpContext). 
                    // Tạm thời gán hardcode = 1 để test
                    EntryStaffId = 1,

                    EntryTime = DateTimeOffset.UtcNow,
                    BillableStartTime = DateTimeOffset.UtcNow,
                    Status = "ACTIVE",
                    PaymentRequired = true,
                    PaymentStatus = "PENDING"
                };

                _dbContext.ParkingSessions.Add(newSession);

                // SaveChanges lần 1 để EF Core sinh ra newSession.Id (BIGSERIAL)
                await _dbContext.SaveChangesAsync();

                // 4. Cập nhật trạng thái Thẻ
                card.Status = CardStatus.IN_USE;
                card.CurrentSessionId = newSession.Id;

                // 5. Cập nhật trạng thái Vị trí đỗ
                slot.Status = "OCCUPIED";

                // SaveChanges lần 2 để lưu trạng thái Thẻ và Slot
                await _dbContext.SaveChangesAsync();

                // 6. Hoàn tất giao dịch
                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                // Nếu có bất kỳ lỗi gì (throw Exception), toàn bộ dữ liệu sẽ được rollback lại trạng thái ban đầu
                await transaction.RollbackAsync();
                throw; // Ném lỗi ra ngoài để Controller bắt và trả về Http 400/500
            }
        });
    }
}