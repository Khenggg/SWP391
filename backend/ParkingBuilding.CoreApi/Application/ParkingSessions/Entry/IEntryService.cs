using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;

public interface IEntryService
{
    Task CreateEntryAsync(CreateEntryRequest request);
}