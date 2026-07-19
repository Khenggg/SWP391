namespace ParkingBuilding.CoreApi.Application.Storage;

public interface IStorageService
{
    Task<StorageUploadResult> UploadAsync(
        Stream stream,
        string path,
        string contentType,
        CancellationToken ct = default);

    Task<string> CreateSignedUrlAsync(
        string path,
        int? expiresInSeconds = null,
        CancellationToken ct = default);

    Task DeleteAsync(string path, CancellationToken ct = default);
}
