using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class Notification
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public long? MonthlyPassId { get; set; }
        public long? ReservationId { get; set; }
        public long? PaymentId { get; set; }
        public long? ParkingSessionId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Type { get; set; } = "SYSTEM";
        public string Priority { get; set; } = "NORMAL";
        public bool IsRead { get; set; } = false;
        public DateTimeOffset? ReadAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        // Navigation properties
        public User? User { get; set; }
        public MonthlyPass? MonthlyPass { get; set; }
        public Reservation? Reservation { get; set; }
        public Payment? Payment { get; set; }
        public ParkingSession? ParkingSession { get; set; }
    }
}
