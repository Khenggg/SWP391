using System;
using ParkingBuilding.CoreApi.Domain.Enums;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class ParkingCard
    {
        public long Id { get; set; }
        public string CardCode { get; set; } = string.Empty;
        public string QrToken { get; set; } = string.Empty;
        public ParkingCardStatus Status { get; set; } = ParkingCardStatus.AVAILABLE;
        public long? CurrentSessionId { get; set; }
        public string? Note { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
