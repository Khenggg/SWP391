namespace ParkingBuilding.CoreApi.Application.LostCards;

public class ProcessLostCardRequest
{
    public string Status { get; set; } = string.Empty; // "APPROVED" or "REJECTED"
    public string? RejectionReason { get; set; }
}
