using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations;

public class VehicleSnapshotUploadConfiguration : IEntityTypeConfiguration<VehicleSnapshotUpload>
{
    public void Configure(EntityTypeBuilder<VehicleSnapshotUpload> builder)
    {
        builder.ToTable("vehicle_snapshot_uploads");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.SnapshotToken).HasColumnName("snapshot_token").IsRequired();
        builder.Property(x => x.SessionId).HasColumnName("session_id");
        builder.Property(x => x.ImageType).HasColumnName("image_type").HasMaxLength(30).IsRequired();
        builder.Property(x => x.ImageUrl).HasColumnName("image_url").HasMaxLength(500).IsRequired();
        builder.Property(x => x.StoragePath).HasColumnName("storage_path").HasMaxLength(500);
        builder.Property(x => x.MimeType).HasColumnName("mime_type").HasMaxLength(100);
        builder.Property(x => x.SizeBytes).HasColumnName("size_bytes");
        builder.Property(x => x.UploadStatus).HasColumnName("upload_status").HasMaxLength(20).IsRequired();
        builder.Property(x => x.OcrStatus).HasColumnName("ocr_status").HasMaxLength(20).IsRequired();
        builder.Property(x => x.OcrProvider).HasColumnName("ocr_provider").HasMaxLength(100);
        builder.Property(x => x.OcrProcessedAt).HasColumnName("ocr_processed_at").HasColumnType("timestamp with time zone");
        builder.Property(x => x.OcrError).HasColumnName("ocr_error");
        builder.Property(x => x.OcrPayload).HasColumnName("ocr_payload").HasColumnType("jsonb");
        builder.Property(x => x.DetectedPlateNumber).HasColumnName("detected_plate_number").HasMaxLength(30);
        builder.Property(x => x.DetectedNormalizedPlateNumber).HasColumnName("detected_normalized_plate_number").HasMaxLength(30);
        builder.Property(x => x.Confidence).HasColumnName("confidence").HasColumnType("numeric(5,2)");
        builder.Property(x => x.UploadedBy).HasColumnName("uploaded_by");
        builder.Property(x => x.CapturedAt).HasColumnName("captured_at").HasColumnType("timestamp with time zone").IsRequired();
        builder.Property(x => x.AttachedAt).HasColumnName("attached_at").HasColumnType("timestamp with time zone");
        builder.Property(x => x.ExpiresAt).HasColumnName("expires_at").HasColumnType("timestamp with time zone");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone").IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone").IsRequired();

        builder.HasIndex(x => x.SnapshotToken).IsUnique();

        builder.HasOne(x => x.Session)
            .WithMany()
            .HasForeignKey(x => x.SessionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.UploadedByUser)
            .WithMany()
            .HasForeignKey(x => x.UploadedBy)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
