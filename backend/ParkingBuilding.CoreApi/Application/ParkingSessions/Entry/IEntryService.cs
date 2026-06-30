using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;

public interface IEntryService
{
    Task<CreateEntryResponse> CreateEntryAsync(CreateEntryRequest request, long staffId, string role);

    Task<bool> ClaimSessionAsync(string userId, string qrToken);
}