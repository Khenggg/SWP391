using System;

namespace ParkingBuilding.CoreApi.Application.Mismatch;

public class PlateMismatchResponse
{
    public long Id { get; set; }
    public string CaseCode { get; set; } = string.Empty;
    public long SessionId { get; set; }
    public string? SessionCode { get; set; }
    public string? CardCode { get; set; }
    public DateTimeOffset? EntryTime { get; set; }
    public string? EntryPlateNumber { get; set; }
    public string ExitPlateNumber { get; set; } = string.Empty;
    public string? EntryPlateImageUrl { get; set; }
    public string? EntryVehicleImageUrl { get; set; }
    public string? ExitPlateImageUrl { get; set; }
    public string? ExitVehicleImageUrl { get; set; }
    public decimal? OcrConfidence { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = "MEDIUM";
    public long CreatedBy { get; set; }
    public string? ReporterName { get; set; }
    public long? ConfirmedBy { get; set; }
    public DateTimeOffset? ConfirmedAt { get; set; }
    public string? DecidedBy { get; set; }
    public DateTimeOffset? DecidedAt { get; set; }
    public string? DecisionReason { get; set; }
    public string? RejectionReason { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
