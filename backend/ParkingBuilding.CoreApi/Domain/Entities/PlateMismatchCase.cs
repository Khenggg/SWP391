using System;
using System.ComponentModel.DataAnnotations.Schema; // Thêm dòng này để dùng Table Attribute

namespace ParkingBuilding.CoreApi.Domain.Entities;

[Table("plate_mismatch_cases")] // Thêm dòng này để khớp với tên bảng trong DB
public class PlateMismatchCase
{
    public long Id { get; set; }
    public long SessionId { get; set; }
    public string? EntryPlateNumber { get; set; }
    public string ExitPlateNumber { get; set; } = null!;
    public string? Reason { get; set; }
    public string Status { get; set; } = "PENDING";
    public long CreatedBy { get; set; }
    public long? ConfirmedBy { get; set; }
    public DateTimeOffset? ConfirmedAt { get; set; }
    public string? RejectionReason { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}