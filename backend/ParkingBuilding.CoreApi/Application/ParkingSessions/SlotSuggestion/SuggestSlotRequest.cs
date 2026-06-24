namespace ParkingBuilding.CoreApi.Application.ParkingSessions.SlotSuggestion;

public class SuggestSlotRequest
{
    public long VehicleTypeId { get; set; }
    public long EntryGateId { get; set; }
}