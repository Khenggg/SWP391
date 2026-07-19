namespace ParkingBuilding.CoreApi.Application.LostCards.Documents;

public class LostCardDocumentResponse
{
    public long Id { get; set; }
    public long LostCardCaseId { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? ThumbnailPath { get; set; }
    public string? SignedUrl { get; set; }
    public string? OriginalFileName { get; set; }
    public string? MimeType { get; set; }
    public long? SizeBytes { get; set; }
    public string? Note { get; set; }
    public bool IsSensitive { get; set; }
    public long UploadedBy { get; set; }
    public DateTimeOffset UploadedAt { get; set; }
}
