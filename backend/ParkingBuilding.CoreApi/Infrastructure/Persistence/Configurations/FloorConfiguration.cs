using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.Persistence.Configurations
{
    public class FloorConfiguration : IEntityTypeConfiguration<Floor>
    {
        public void Configure(EntityTypeBuilder<Floor> builder)
        {
            builder.ToTable("floors");

            builder.HasKey(f => f.Id);
            builder.Property(f => f.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            builder.Property(f => f.FloorCode)
                   .HasColumnName("floor_code")
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(f => f.FloorName)
                   .HasColumnName("floor_name")
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(f => f.Status)
                   .HasColumnName("status")
                   .HasMaxLength(30)
                   .IsRequired()
                   .HasDefaultValue("ACTIVE");

            builder.Property(f => f.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            builder.Property(f => f.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();
        }
    }
}
