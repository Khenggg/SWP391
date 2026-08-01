namespace ParkingBuilding.CoreApi.Application.ParkingStructure.Floors;

public class CreateFloorRequest
{
    public string FloorCode { get; set; } = null!;
    public string FloorName { get; set; } = null!;
    public List<long> VehicleTypeIds { get; set; } = new();
}