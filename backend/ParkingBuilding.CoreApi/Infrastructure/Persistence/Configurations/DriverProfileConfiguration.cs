using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class DriverProfileConfiguration : IEntityTypeConfiguration<DriverProfile>
    {
        public void Configure(EntityTypeBuilder<DriverProfile> builder)
        {
            builder.ToTable("driver_profiles");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.UserId)
                   .HasColumnName("user_id");

            builder.Property(x => x.FullName)
                   .HasColumnName("full_name")
                   .IsRequired();

            builder.Property(x => x.Phone)
                   .HasColumnName("phone")
                   .IsRequired();

            builder.Property(x => x.Email)
                   .HasColumnName("email")
                   .IsRequired();

            builder.Property(x => x.Status)
                   .HasColumnName("status")
                   .IsRequired();

            builder.Property(x => x.DriverType)
                   .HasColumnName("driver_type")
                   .IsRequired();

            builder.Property(x => x.ApartmentNumber)
                   .HasColumnName("apartment_number")
                   .IsRequired();

            builder.Property(x => x.CccdNumber)
                   .HasColumnName("cccd_number")
                   .IsRequired();

            builder.Property(x => x.CccdImageUrl)
                   .HasColumnName("cccd_image_url")
                   .IsRequired();

            builder.Property(x => x.ResidentVerified)
                   .HasColumnName("resident_verified")
                   .IsRequired();

            builder.Property(x => x.ResidentVerifiedAt)
                   .HasColumnName("resident_verified_at")
                   .HasColumnType("timestamp with time zone");

            builder.Property(x => x.ResidentVerifiedBy)
                   .HasColumnName("resident_verified_by");

            builder.Property(x => x.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            builder.Property(x => x.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            // Relationships
            builder.HasOne(x => x.User)
                   .WithMany()
                   .HasForeignKey(x => x.UserId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
