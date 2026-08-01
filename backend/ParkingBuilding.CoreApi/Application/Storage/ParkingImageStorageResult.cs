namespace ParkingBuilding.CoreApi.Application.Storage;

public sealed class ParkingImageStorageResult
{
    public string ImageUrl { get; init; } = string.Empty;
    public string? StoragePath { get; init; }
    public string? MimeType { get; init; }
    public long? SizeBytes { get; init; }
}
