using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class LostCardCaseDocumentConfiguration : IEntityTypeConfiguration<LostCardCaseDocument>
    {
        public void Configure(EntityTypeBuilder<LostCardCaseDocument> builder)
        {
            builder.ToTable("lost_card_case_documents");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.LostCardCaseId)
                .HasColumnName("lost_card_case_id")
                .IsRequired();

            builder.Property(x => x.DocumentType)
                .HasColumnName("document_type")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.FilePath)
                .HasColumnName("file_path")
                .IsRequired();

            builder.Property(x => x.ThumbnailPath)
                .HasColumnName("thumbnail_path");

            builder.Property(x => x.OriginalFileName)
                .HasColumnName("original_file_name")
                .HasMaxLength(255);

            builder.Property(x => x.MimeType)
                .HasColumnName("mime_type")
                .HasMaxLength(100);

            builder.Property(x => x.SizeBytes)
                .HasColumnName("size_bytes");

            builder.Property(x => x.Sha256Hash)
                .HasColumnName("sha256_hash")
                .HasMaxLength(100);

            builder.Property(x => x.Note)
                .HasColumnName("note");

            builder.Property(x => x.IsSensitive)
                .HasColumnName("is_sensitive")
                .HasDefaultValue(true)
                .IsRequired();

            builder.Property(x => x.UploadedBy)
                .HasColumnName("uploaded_by")
                .IsRequired();

            builder.Property(x => x.UploadedAt)
                .HasColumnName("uploaded_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.DeletedAt)
                .HasColumnName("deleted_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.HasOne(x => x.UploadedByUser)
                .WithMany()
                .HasForeignKey(x => x.UploadedBy)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.LostCardCaseId)
                .HasDatabaseName("ix_lost_card_documents_case");

            builder.HasIndex(x => x.DocumentType)
                .HasDatabaseName("ix_lost_card_documents_type");

            builder.HasIndex(x => x.UploadedAt)
                .HasDatabaseName("ix_lost_card_documents_uploaded_at");
        }
    }
}
