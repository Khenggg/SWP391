namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public class LocationAlternativeResponse
    {
        public long FloorId { get; set; }
        public string FloorCode { get; set; } = null!;

        public long AreaId { get; set; }
        public string AreaCode { get; set; } = null!;

        public long? SlotId { get; set; }
        public string? SlotCode { get; set; }

        public int? AvailableCapacity { get; set; }
        public int? TotalCapacity { get; set; }
    }
}
