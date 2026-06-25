using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class Vehicle
    {
        public long Id { get; set; }
        public long? DriverId { get; set; }
        public virtual DriverProfile? Driver { get; set; }
        public string PlateNumber { get; set; } = string.Empty;
        public string NormalizedPlateNumber { get; set; } = string.Empty;
        public long VehicleTypeId { get; set; }
        public virtual VehicleType VehicleType { get; set; } = null!;
        public string? Description { get; set; }
        public string Status { get; set; } = "ACTIVE"; // 'ACTIVE', 'INACTIVE'
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
