namespace ParkingBuilding.CoreApi.Domain.Entities;

public class AreaVehicleType
{
    public long AreaId { get; set; }

    public long VehicleTypeId { get; set; }

    // Navigation
    public Area Area { get; set; } = null!;

    public VehicleType VehicleType { get; set; } = null!;
}