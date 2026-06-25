namespace ParkingBuilding.CoreApi.Domain.Entities;

public class Gate
{
    public long Id { get; set; }

    public long FloorId { get; set; }

    public string GateCode { get; set; } = null!;

    public string GateType { get; set; } = null!; // ENTRY | EXIT

    public string Status { get; set; } = "ACTIVE";

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation
    public Floor Floor { get; set; } = null!;
}