using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ParkingBuilding.CoreApi.Domain.Entities;

[Table("lost_card_cases")]
public class LostCardCase
{
    [Key]
    public long Id { get; set; }

    public long SessionId { get; set; }
    [ForeignKey(nameof(SessionId))]
    public virtual ParkingSession ParkingSession { get; set; } = null!;

    public long? CardId { get; set; }
    [ForeignKey(nameof(CardId))]
    public virtual ParkingCard? ParkingCard { get; set; }

    [Required]
    [MaxLength(150)]
    public string ReporterName { get; set; } = null!;

    [MaxLength(30)]
    public string? Phone { get; set; }

    [Required]
    public string VerificationNote { get; set; } = null!;

    [Required]
    public string Reason { get; set; } = null!;

    [Column(TypeName = "decimal(12,2)")]
    public decimal LostCardFee { get; set; }

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "PENDING"; // PENDING, APPROVED, REJECTED

    public long CreatedBy { get; set; }
    [ForeignKey(nameof(CreatedBy))]
    public virtual User CreatedByUser { get; set; } = null!;

    public long? ApprovedBy { get; set; }
    [ForeignKey(nameof(ApprovedBy))]
    public virtual User? ApprovedByUser { get; set; }

    public DateTimeOffset? ApprovedAt { get; set; }
    public string? RejectionReason { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}