using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Application.Mismatch;

public interface IPlateMismatchService
{
    Task<PlateMismatchResponse> CreateMismatchAsync(CreatePlateMismatchRequest request, long staffId);
    Task<PlateMismatchResponse> ProcessMismatchAsync(long caseId, ProcessPlateMismatchRequest request, long userId);
    Task<List<PlateMismatchResponse>> GetListAsync(string? status, int page, int pageSize);
    Task<PlateMismatchResponse?> GetByIdAsync(long id);
    Task<PlateMismatchResponse?> GetBySessionIdAsync(long sessionId);
}
