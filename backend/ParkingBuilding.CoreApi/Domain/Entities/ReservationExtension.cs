using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class ReservationExtension
    {
        public long Id { get; set; }
        public long ReservationId { get; set; }
        public virtual Reservation Reservation { get; set; } = null!;
        public DateTimeOffset OldExpiresAt { get; set; }
        public DateTimeOffset NewExpiresAt { get; set; }
        public int AddedMinutes { get; set; }
        public long? PricingRuleId { get; set; }
        public virtual PricingRule? PricingRule { get; set; }
        public decimal SnapshotReservationHourlyPrice { get; set; }
        public decimal Amount { get; set; }
        public long? PaymentId { get; set; }
        public virtual Payment? Payment { get; set; }
        public long? RequestedBy { get; set; }
        public virtual User? RequestedByUser { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
