namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Exit
{
    public class CasualExitRequest
    {
        public long ExitGateId { get; set; }
        public string? ExitPlateImageUrl { get; set; }
        public string? ExitVehicleImageUrl { get; set; }
        public DateTimeOffset? ExitTime { get; set; }
    }
}