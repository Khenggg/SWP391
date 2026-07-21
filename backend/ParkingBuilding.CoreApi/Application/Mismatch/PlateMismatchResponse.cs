using System;

namespace ParkingBuilding.CoreApi.Application.Mismatch;

public class PlateMismatchResponse
{
    public long Id { get; set; }
    public long SessionId { get; set; }
    public string? EntryPlateNumber { get; set; }
    public string ExitPlateNumber { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string Status { get; set; } = string.Empty;
    public long CreatedBy { get; set; }
    public long? ConfirmedBy { get; set; }
    public DateTimeOffset? ConfirmedAt { get; set; }
    public string? RejectionReason { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
