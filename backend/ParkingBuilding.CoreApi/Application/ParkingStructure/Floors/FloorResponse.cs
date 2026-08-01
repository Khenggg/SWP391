namespace ParkingBuilding.CoreApi.Application.ParkingStructure.Floors;

public class FloorResponse
{
    public long Id { get; set; }
    public string FloorCode { get; set; } = null!;
    public string FloorName { get; set; } = null!;
    public string Status { get; set; } = null!;
    public List<long> VehicleTypeIds { get; set; } = new();
    public List<string> VehicleTypeNames { get; set; } = new();
}