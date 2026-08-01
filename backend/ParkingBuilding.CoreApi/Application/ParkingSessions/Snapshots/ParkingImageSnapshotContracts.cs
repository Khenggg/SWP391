using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Snapshots;

public sealed class CreateParkingImageSnapshotRequest
{
    public string ImageSource { get; set; } = string.Empty;
    public string ImageType { get; set; } = string.Empty;
    public long? SessionId { get; set; }
    public DateTimeOffset? CapturedAt { get; set; }
}

public sealed class ParkingImageSnapshotResponse
{
    public long Id { get; init; }
    public Guid SnapshotToken { get; init; }
    public long? SessionId { get; init; }
    public string ImageType { get; init; } = string.Empty;
    public string ImageUrl { get; init; } = string.Empty;
    public string UploadStatus { get; init; } = string.Empty;
    public string OcrStatus { get; init; } = string.Empty;
    public string? DetectedPlateNumber { get; init; }
    public string? DetectedNormalizedPlateNumber { get; init; }
    public decimal? Confidence { get; init; }
    public DateTimeOffset CapturedAt { get; init; }
    public DateTimeOffset? ExpiresAt { get; init; }
}

public sealed class PromoteParkingImageSnapshotCommand
{
    public long SnapshotId { get; init; }
    public long SessionId { get; init; }
    public string ExpectedImageType { get; init; } = string.Empty;
    public long ActorUserId { get; init; }
    public bool IsPrimary { get; init; } = true;
    public string? DetectedPlateNumber { get; init; }
    public string? DetectedNormalizedPlateNumber { get; init; }
    public decimal? Confidence { get; init; }
}

internal static class ParkingImageSnapshotMapper
{
    public static ParkingImageSnapshotResponse ToResponse(this VehicleSnapshotUpload snapshot)
        => new()
        {
            Id = snapshot.Id,
            SnapshotToken = snapshot.SnapshotToken,
            SessionId = snapshot.SessionId,
            ImageType = snapshot.ImageType,
            ImageUrl = snapshot.ImageUrl,
            UploadStatus = snapshot.UploadStatus,
            OcrStatus = snapshot.OcrStatus,
            DetectedPlateNumber = snapshot.DetectedPlateNumber,
            DetectedNormalizedPlateNumber = snapshot.DetectedNormalizedPlateNumber,
            Confidence = snapshot.Confidence,
            CapturedAt = snapshot.CapturedAt,
            ExpiresAt = snapshot.ExpiresAt
        };
}
