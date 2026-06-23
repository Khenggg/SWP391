public class AreaResponse
{
    public long Id { get; set; }

    public long FloorId { get; set; }

    public string AreaCode { get; set; } = null!;

    public string AreaName { get; set; } = null!;

    public int TotalCapacity { get; set; }

    public string Status { get; set; } = null!;
}