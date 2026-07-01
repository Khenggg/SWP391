using System;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Exit
{
    public class MonthlyPassExitRequest
    {
        public long ExitGateId { get; set; }
        public string? ExitPlateNumber { get; set; }
        public DateTimeOffset? ExitTime { get; set; }
        public string? ExitPlateImageUrl { get; set; }
        public string? ExitVehicleImageUrl { get; set; }
        public string? DetectedPlateNumber { get; set; }
        public double? OcrConfidence { get; set; }
    }
}
