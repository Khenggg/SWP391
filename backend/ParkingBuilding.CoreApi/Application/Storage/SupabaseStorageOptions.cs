namespace ParkingBuilding.CoreApi.Application.Storage;

public class SupabaseStorageOptions
{
    public string? Url { get; set; }
    public string? ServiceRoleKey { get; set; }
    public string Bucket { get; set; } = "parking-images";
    public int SignedUrlExpiresSeconds { get; set; } = 900;
    public long MaxFileSizeBytes { get; set; } = 5_242_880;
    public string[] AllowedMimeTypes { get; set; } =
    [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf"
    ];

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(Url)
        && !string.IsNullOrWhiteSpace(ServiceRoleKey)
        && !string.IsNullOrWhiteSpace(Bucket)
        && !Url.Contains("__SET_BY_ENV", StringComparison.OrdinalIgnoreCase)
        && !ServiceRoleKey.Contains("__SET_BY_ENV", StringComparison.OrdinalIgnoreCase);
}
