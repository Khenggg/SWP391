using System;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class Reservation
    {
        public long Id { get; set; }
        public string ReservationCode { get; set; } = string.Empty;
        public long? DriverId { get; set; }
        public virtual DriverProfile? Driver { get; set; }
        public long? VehicleId { get; set; }
        public virtual Vehicle? Vehicle { get; set; }
        public string? PlateNumber { get; set; }
        public string? NormalizedPlateNumber { get; set; }
        public long VehicleTypeId { get; set; }
        public virtual VehicleType VehicleType { get; set; } = null!;
        public long FloorId { get; set; }
        public virtual Floor Floor { get; set; } = null!;
        public long AreaId { get; set; }
        public virtual Area Area { get; set; } = null!;
        public long? SlotId { get; set; }
        public virtual Slot? Slot { get; set; }
        public long? PricingRuleId { get; set; }
        public virtual PricingRule? PricingRule { get; set; }
        public decimal SnapshotReservationHourlyPrice { get; set; }
        public int ReservedDurationMinutes { get; set; }
        public decimal BookingAmount { get; set; }
        public string PaymentStatus { get; set; } = "PENDING"; // PENDING, PAID, FAILED, CANCELLED, WAIVED, NOT_REQUIRED
        public DateTimeOffset ReservedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset ExpiresAt { get; set; }
        public DateTimeOffset? PaymentDeadline { get; set; }
        public DateTimeOffset? ConfirmedAt { get; set; }
        public DateTimeOffset? CheckedInAt { get; set; }
        public long? CheckedInBy { get; set; }
        public virtual User? CheckedInByUser { get; set; }
        public DateTimeOffset? CancelledAt { get; set; }
        public string Status { get; set; } = "PENDING"; // PENDING, CONFIRMED, COMPLETED, CANCELLED, EXPIRED
        public long? CreatedBy { get; set; }
        public virtual User? CreatedByUser { get; set; }
        public long? CancelledBy { get; set; }
        public virtual User? CancelledByUser { get; set; }
        public string? CancellationReason { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

        // Navigation
        public virtual ICollection<ReservationExtension> Extensions { get; set; } = new List<ReservationExtension>();
    }
}
