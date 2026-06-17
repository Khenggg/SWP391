namespace ParkingBuilding.CoreApi.Contracts.Responses
{
    public class FloorResponse
    {
        public long Id { get; set; }
        public string FloorCode { get; set; } = string.Empty;
        public string FloorName { get; set; } = string.Empty;
        public string Status { get; set; } = "ACTIVE";
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }
}
