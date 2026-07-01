using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class PlateMismatchCase
    {
        public long Id { get; set; }
        public long SessionId { get; set; }
        public virtual ParkingSession ParkingSession { get; set; } = null!;
        public string? EntryPlateNumber { get; set; }
        public string ExitPlateNumber { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public string Status { get; set; } = "PENDING"; // 'PENDING', 'CONFIRMED', 'REJECTED'
        public long CreatedBy { get; set; }
        public virtual User CreatedByUser { get; set; } = null!;
        public long? ConfirmedBy { get; set; }
        public virtual User? ConfirmedByUser { get; set; }
        public DateTimeOffset? ConfirmedAt { get; set; }
        public string? RejectionReason { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
