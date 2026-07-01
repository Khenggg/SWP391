using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    [Table("lost_card_cases")]
    public class LostCardCase
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("session_id")]
        public long SessionId { get; set; }

        [Column("card_id")]
        public long? CardId { get; set; }

        [Column("reporter_name")]
        [Required]
        public string ReporterName { get; set; } = null!;

        [Column("phone")]
        public string? Phone { get; set; }

        [Column("verification_note")]
        [Required]
        public string? VerificationNote { get; set; } = null!;

        [Column("reason")]
        [Required]
        public string? Reason { get; set; } = null!;

        [Column("lost_card_fee")]
        public decimal LostCardFee { get; set; } = 0;

        [Column("status")]
        public string Status { get; set; } = "PENDING";

        // ✅ NEW FIELDS (BẮT BUỘC theo DB)

        [Column("created_by")]
        public long CreatedBy { get; set; }

        [Column("approved_by")]
        public long? ApprovedBy { get; set; }

        [Column("approved_at")]
        public DateTimeOffset? ApprovedAt { get; set; }

        [Column("rejection_reason")]
        public string? RejectionReason { get; set; }

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; }

        // Navigation

        [ForeignKey(nameof(SessionId))]
        public ParkingSession? ParkingSession { get; set; }
    }
}