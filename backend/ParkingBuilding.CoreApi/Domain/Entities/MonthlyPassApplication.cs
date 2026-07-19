using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    [Table("monthly_pass_applications")]
    public class MonthlyPassApplication
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("driver_id")]
        public long DriverId { get; set; }
        public virtual DriverProfile Driver { get; set; } = null!;

        [Column("vehicle_id")]
        public long VehicleId { get; set; }
        public virtual Vehicle Vehicle { get; set; } = null!;

        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("price")]
        public decimal Price { get; set; }

        [Column("status")]
        public string Status { get; set; } = "PENDING"; // DRAFT, PENDING, APPROVED_AWAITING_PAYMENT, PAID, ACTIVE, EXPIRED, REJECTED

        [Column("rejection_reason")]
        public string? RejectionReason { get; set; }

        [Column("payment_method")]
        public string? PaymentMethod { get; set; }

        [Column("payment_reference_no")]
        public string? PaymentReferenceNo { get; set; }

        [Column("assigned_card_id")]
        public long? AssignedCardId { get; set; }
        public virtual ParkingCard? AssignedCard { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
