using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class ParkingSessionImageConfiguration : IEntityTypeConfiguration<ParkingSessionImage>
    {
        public void Configure(EntityTypeBuilder<ParkingSessionImage> builder)
        {
            builder.ToTable("parking_session_images");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.SessionId)
                .HasColumnName("session_id")
                .IsRequired();

            builder.Property(x => x.ImageType)
                .HasColumnName("image_type")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.ImageUrl)
                .HasColumnName("image_url")
                .HasMaxLength(500)
                .IsRequired();

            builder.Property(x => x.ThumbnailUrl)
                .HasColumnName("thumbnail_url")
                .HasMaxLength(500);

            builder.Property(x => x.DetectedPlateNumber)
                .HasColumnName("detected_plate_number")
                .HasMaxLength(30);

            builder.Property(x => x.DetectedNormalizedPlateNumber)
                .HasColumnName("detected_normalized_plate_number")
                .HasMaxLength(30);

            builder.Property(x => x.Confidence)
                .HasColumnName("confidence")
                .HasColumnType("numeric(5,2)");

            builder.Property(x => x.IsPrimary)
                .HasColumnName("is_primary")
                .HasDefaultValue(false)
                .IsRequired();

            builder.Property(x => x.CapturedAt)
                .HasColumnName("captured_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            // Relationship
            builder.HasOne(x => x.Session)
                .WithMany(s => s.ParkingSessionImages)
                .HasForeignKey(x => x.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
