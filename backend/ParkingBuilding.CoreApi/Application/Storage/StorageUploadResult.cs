namespace ParkingBuilding.CoreApi.Application.Storage;

public class StorageUploadResult
{
    public string FilePath { get; set; } = string.Empty;
    public string? PublicUrl { get; set; }
    public long SizeBytes { get; set; }
    public string ContentType { get; set; } = string.Empty;
}
