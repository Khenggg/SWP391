namespace ParkingBuilding.CoreApi.Domain.Entities;

public class FloorVehicleType
{
    public long FloorId { get; set; }

    public long VehicleTypeId { get; set; }

    // Navigation
    public Floor Floor { get; set; } = null!;

    public VehicleType VehicleType { get; set; } = null!;
}
