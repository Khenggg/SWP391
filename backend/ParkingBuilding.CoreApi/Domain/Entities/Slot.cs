namespace ParkingBuilding.CoreApi.Domain.Entities;

public class Slot
{
    public long Id { get; set; }

    public long AreaId { get; set; }

    public string SlotCode { get; set; } = null!;

    public long AllowedVehicleTypeId { get; set; }

    public string Status { get; set; } = "AVAILABLE";

    public long? CurrentSessionId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation
    public Area Area { get; set; } = null!;

    public VehicleType VehicleType { get; set; } = null!;
}