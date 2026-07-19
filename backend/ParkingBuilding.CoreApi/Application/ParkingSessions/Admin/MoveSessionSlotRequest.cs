namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Admin;

public class MoveSessionSlotRequest
{
    public long TargetSlotId { get; set; }
    public string? Reason { get; set; }
}
