using System;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Exit
{
    public class MonthlyPassExitRequest
    {
        public long ExitGateId { get; set; }
        public string? ExitPlateNumber { get; set; }
        public DateTimeOffset? ExitTime { get; set; }
    }
}
