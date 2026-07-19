using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Admin;

public interface ISessionAdminService
{
    Task<bool> CancelActiveSessionAsync(long sessionId, CancelActiveSessionRequest request, long adminId);
    Task<bool> MoveSessionSlotAsync(long sessionId, MoveSessionSlotRequest request, long adminId);
}
