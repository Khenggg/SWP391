namespace ParkingBuilding.CoreApi.Application.LostCards;

public class CreateLostCardRequest
{
    public long SessionId { get; set; }
    public string ReporterName { get; set; } = null!;
    public string? Phone { get; set; }
    public string Reason { get; set; } = null!;
    public string VerificationNote { get; set; } = null!;
}