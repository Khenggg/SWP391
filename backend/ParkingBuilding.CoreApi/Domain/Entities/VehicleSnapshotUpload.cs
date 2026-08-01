namespace ParkingBuilding.CoreApi.Domain.Entities;

public class VehicleSnapshotUpload
{
    public long Id { get; set; }
    public Guid SnapshotToken { get; set; } = Guid.NewGuid();

    public long? SessionId { get; set; }
    public virtual ParkingSession? Session { get; set; }

    public string ImageType { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string? StoragePath { get; set; }
    public string? MimeType { get; set; }
    public long? SizeBytes { get; set; }

    public string UploadStatus { get; set; } = "UPLOADED";
    public string OcrStatus { get; set; } = "NOT_REQUESTED";
    public string? OcrProvider { get; set; }
    public DateTimeOffset? OcrProcessedAt { get; set; }
    public string? OcrError { get; set; }
    public string? OcrPayload { get; set; }

    public string? DetectedPlateNumber { get; set; }
    public string? DetectedNormalizedPlateNumber { get; set; }
    public decimal? Confidence { get; set; }

    public long? UploadedBy { get; set; }
    public virtual User? UploadedByUser { get; set; }

    public DateTimeOffset CapturedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AttachedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
