namespace ParkingBuilding.CoreApi.Domain.Entities;

public class Area
{
    public long Id { get; set; }

    public long FloorId { get; set; }

    public string AreaCode { get; set; } = null!;

    public string AreaName { get; set; } = null!;

    public int PriorityOrder { get; set; }

    public string Status { get; set; } = "ACTIVE";

    public int TotalCapacity { get; set; }

    public int CurrentRealOccupancy { get; set; }

    public int CurrentBookedSlots { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation
    public Floor Floor { get; set; } = null!;

    public ICollection<AreaVehicleType> AreaVehicleTypes { get; set; } = new List<AreaVehicleType>();

    public ICollection<Slot> Slots { get; set; } = new List<Slot>();
}