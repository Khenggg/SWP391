namespace ParkingBuilding.CoreApi.Application.ParkingStructure.Floors;

public class UpdateFloorRequest
{
    public string? FloorCode { get; set; }
    public string FloorName { get; set; } = null!;
    public string Status { get; set; } = null!;
    public List<long> VehicleTypeIds { get; set; } = new();
}