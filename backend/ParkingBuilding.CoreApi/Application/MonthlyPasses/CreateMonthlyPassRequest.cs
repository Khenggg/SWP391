using System;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public class CreateMonthlyPassRequest
    {
        public long? DriverId { get; set; }
        public long CardId { get; set; }
        public string OwnerName { get; set; } = null!;
        public string? Phone { get; set; }
        public string PlateNumber { get; set; } = null!;
        public long VehicleTypeId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public long? FloorId { get; set; }
        public long? AreaId { get; set; }
        public long? SlotId { get; set; }
    }
}
