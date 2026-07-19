using System;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public class UpdateMonthlyPassRequest
    {
        public string OwnerName { get; set; } = null!;
        public string? Phone { get; set; }
        public string PlateNumber { get; set; } = null!;

        public long? FloorId { get; set; }
        public long? AreaId { get; set; }
        public long? SlotId { get; set; }
    }
}
