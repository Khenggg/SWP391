using System;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public class LocationSuggestionPayload
    {
        public string SuggestionType { get; set; } = null!;

        public long VehicleTypeId { get; set; }
        public long EntryGateId { get; set; }

        public long SuggestedFloorId { get; set; }
        public long SuggestedAreaId { get; set; }
        public long? SuggestedSlotId { get; set; }

        public long IssuedToStaffId { get; set; }
        public DateTimeOffset IssuedAt { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
    }
}
