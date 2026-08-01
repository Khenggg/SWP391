public class UpdateAreaRequest
{
    public string AreaName { get; set; } = null!;

    public int PriorityOrder { get; set; }

    public int TotalCapacity { get; set; }

    public string Status { get; set; } = null!;

    public List<long> VehicleTypeIds { get; set; } = new();
}