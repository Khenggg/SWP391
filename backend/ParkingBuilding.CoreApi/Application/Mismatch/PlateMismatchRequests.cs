namespace ParkingBuilding.CoreApi.Application.Mismatch;

public class CreatePlateMismatchRequest
{
    public long SessionId { get; set; }
    public string ExitPlateNumber { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string? ExitPlateImageUrl { get; set; }
    public string? ExitVehicleImageUrl { get; set; }
    public double? OcrConfidence { get; set; }
}

public class ProcessPlateMismatchRequest
{
    public string Status { get; set; } = string.Empty; // "CONFIRMED" or "REJECTED"
    public string? Reason { get; set; }
    public string? RejectionReason { get; set; }
}

public class MismatchDecisionRequest
{
    public string? Reason { get; set; }
}
