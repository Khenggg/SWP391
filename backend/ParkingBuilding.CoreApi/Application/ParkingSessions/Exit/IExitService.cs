using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Exit;

public interface IExitService
{
    // staffId lấy từ JWT Token của nhân viên trực cổng ra (kiểu long tương ứng BIGSERIAL của bảng users)
    Task<CreateExitResponse> CreateExitAsync(CreateExitRequest request, long staffId, string role);
}