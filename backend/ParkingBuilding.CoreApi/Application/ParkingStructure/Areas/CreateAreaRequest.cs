public class CreateAreaRequest
{
    public long FloorId { get; set; }

    public string AreaCode { get; set; } = null!;

    public string AreaName { get; set; } = null!;

    public int PriorityOrder { get; set; }

    public int TotalCapacity { get; set; }

    public List<long> VehicleTypeIds { get; set; } = new();
}