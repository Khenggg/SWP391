using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Application.Mismatches;

public interface IMismatchService
{
    // Tạo case khi phát hiện không khớp
    Task<PlateMismatchCase> CreateMismatchCaseAsync(long sessionId, string entryPlate, string exitPlate, long staffId, string reason);

    // Sẽ dùng cho F050 sau này:
    Task ResolveMismatchCaseAsync(long caseId, bool isConfirmed, long managerId, string? reason);
}