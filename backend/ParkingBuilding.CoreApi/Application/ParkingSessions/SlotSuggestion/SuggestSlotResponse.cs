namespace ParkingBuilding.CoreApi.Application.ParkingSessions.SlotSuggestion;

public class SuggestSlotResponse
{
    public long FloorId { get; set; }
    public string FloorCode { get; set; } = null!;
    public long AreaId { get; set; }
    public string AreaCode { get; set; } = null!;
    public long SlotId { get; set; }
    public string SlotCode { get; set; } = null!;
}