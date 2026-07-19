using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class LostCardCaseDocument
    {
        public long Id { get; set; }
        public long LostCardCaseId { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string? ThumbnailPath { get; set; }
        public string? OriginalFileName { get; set; }
        public string? MimeType { get; set; }
        public long? SizeBytes { get; set; }
        public string? Sha256Hash { get; set; }
        public string? Note { get; set; }
        public bool IsSensitive { get; set; } = true;
        public long UploadedBy { get; set; }
        public virtual User UploadedByUser { get; set; } = null!;
        public DateTimeOffset UploadedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
