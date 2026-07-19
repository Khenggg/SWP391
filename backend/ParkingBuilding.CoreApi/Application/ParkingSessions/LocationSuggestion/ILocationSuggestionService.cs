using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public interface ILocationSuggestionService
    {
        Task<LocationSuggestionResponse> SuggestLocationAsync(
            LocationSuggestionRequest request,
            long staffId,
            string role);
    }
}
