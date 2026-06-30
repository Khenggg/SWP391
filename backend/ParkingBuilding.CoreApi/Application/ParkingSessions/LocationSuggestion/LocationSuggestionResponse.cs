using System;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public class LocationSuggestionResponse
    {
        public string SuggestionType { get; set; } = null!; // AREA or SLOT

        public long VehicleTypeId { get; set; }
        public long EntryGateId { get; set; }

        public long SuggestedFloorId { get; set; }
        public string SuggestedFloorCode { get; set; } = null!;

        public long SuggestedAreaId { get; set; }
        public string SuggestedAreaCode { get; set; } = null!;

        public long? SuggestedSlotId { get; set; }
        public string? SuggestedSlotCode { get; set; }

        public int? AvailableCapacity { get; set; }
        public int? TotalCapacity { get; set; }

        public string SuggestionToken { get; set; } = null!;
        public DateTimeOffset ExpiresAt { get; set; }

        public List<LocationAlternativeResponse> Alternatives { get; set; } = new();
    }
}
