using System.Collections.Generic;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;

public interface IEntryService
{
    Task<CreateEntryResponse> CreateEntryAsync(CreateEntryRequest request, long staffId, string role);

    Task<ClaimSessionResponse> ClaimSessionAsync(string userId, string qrToken);

    Task<List<ClaimSessionResponse>> GetMyActiveClaimedSessionsAsync(string userId);
}