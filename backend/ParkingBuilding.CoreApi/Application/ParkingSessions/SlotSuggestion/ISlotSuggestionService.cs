using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.SlotSuggestion;

public interface ISlotSuggestionService
{
    Task<SuggestSlotResponse?> SuggestSlotAsync(SuggestSlotRequest request);
}