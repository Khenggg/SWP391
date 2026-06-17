using System;
namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class Floor
    {
        public long Id { get; set; }
        public string FloorCode { get; set; } = string.Empty;
        public string FloorName { get; set; } = string.Empty;
        public string Status { get; set; } = "ACTIVE";
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
