using System;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Entry
{
    public class ClaimSessionResponse
    {
        public long SessionId { get; set; }
        public string SessionCode { get; set; } = string.Empty;
        public string CardCode { get; set; } = string.Empty;
        public string QrToken { get; set; } = string.Empty;
        public string? PlateNumber { get; set; }
        public string? VehicleDescription { get; set; }
        public long VehicleTypeId { get; set; }
        public string VehicleTypeName { get; set; } = string.Empty;
        public DateTimeOffset EntryTime { get; set; }
        public long FloorId { get; set; }
        public string FloorCode { get; set; } = string.Empty;
        public string FloorName { get; set; } = string.Empty;
        public long AreaId { get; set; }
        public string AreaCode { get; set; } = string.Empty;
        public string AreaName { get; set; } = string.Empty;
        public long? SlotId { get; set; }
        public string? SlotCode { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public bool PaymentRequired { get; set; }
        public decimal FeeAmount { get; set; }
        public double DurationHours { get; set; }
        public long? ClaimedByUserId { get; set; }
        public DateTimeOffset? ClaimedAt { get; set; }
        public string? ClaimMethod { get; set; }
        public string? PrimaryImageUrl { get; set; }
    }
}
