namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public class LocationSuggestionRequest
    {
        public long VehicleTypeId { get; set; }
        public long EntryGateId { get; set; }
    }
}
