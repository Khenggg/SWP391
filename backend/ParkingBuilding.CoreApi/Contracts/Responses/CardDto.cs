using System;

namespace ParkingBuilding.CoreApi.Contracts.Responses
{
    public class CardDto
    {
        public long Id { get; set; }
        public string CardCode { get; set; } = string.Empty;
        public string QrToken { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public long? CurrentSessionId { get; set; }
        public string? Note { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }
}
