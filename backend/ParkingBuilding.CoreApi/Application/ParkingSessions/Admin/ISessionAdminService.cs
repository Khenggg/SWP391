using System.Threading.Tasks;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Admin;

public interface ISessionAdminService
{
    Task<bool> CancelActiveSessionAsync(long sessionId, CancelActiveSessionRequest request, long adminId);
    Task<bool> MoveSessionSlotAsync(long sessionId, MoveSessionSlotRequest request, long adminId);
    Task<List<SessionSearchResponse>> SearchSessionsAsync(string? keyword, long? vehicleTypeId, string? customerType, string? status, string? sessionCode);
}
