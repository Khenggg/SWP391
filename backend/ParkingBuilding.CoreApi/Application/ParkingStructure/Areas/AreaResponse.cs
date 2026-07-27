namespace ParkingBuilding.CoreApi.Application.ParkingStructure.Areas;

public class AreaResponse
{
    public long Id { get; set; }

    public long FloorId { get; set; }

    public string FloorCode { get; set; } = null!;

    public string AreaCode { get; set; } = null!;

    public string AreaName { get; set; } = null!;

    public int PriorityOrder { get; set; }

    public int TotalCapacity { get; set; }

    public string Status { get; set; } = null!;

    public List<long> VehicleTypeIds { get; set; } = new();

    public List<string> VehicleTypeNames { get; set; } = new();
}