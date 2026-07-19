using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class ParkingSessionImage
    {
        public long Id { get; set; }
        public long SessionId { get; set; }
        public virtual ParkingSession Session { get; set; } = null!;

        public string ImageType { get; set; } = null!; // 'ENTRY_PLATE', 'ENTRY_VEHICLE', 'EXIT_PLATE', 'EXIT_VEHICLE'
        public string ImageUrl { get; set; } = null!;
        public string? ThumbnailUrl { get; set; }
        public string? DetectedPlateNumber { get; set; }
        public string? DetectedNormalizedPlateNumber { get; set; }
        public decimal? Confidence { get; set; }
        public bool IsPrimary { get; set; }

        public DateTimeOffset CapturedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
