namespace ParkingBuilding.CoreApi.Domain.Entities;

public class Floor
{
    public long Id { get; set; }

    public string FloorCode { get; set; } = null!;

    public string FloorName { get; set; } = null!;

    public string Status { get; set; } = "ACTIVE";

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation
    public ICollection<Area> Areas { get; set; } = new List<Area>();

    public ICollection<Gate> Gates { get; set; } = new List<Gate>();
}