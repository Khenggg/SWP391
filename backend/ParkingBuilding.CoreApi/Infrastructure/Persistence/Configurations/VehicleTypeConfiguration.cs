using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.Persistence.Configurations
{
    public class VehicleTypeConfiguration : IEntityTypeConfiguration<VehicleType>
    {
        public void Configure(EntityTypeBuilder<VehicleType> builder)
        {
            builder.ToTable("vehicle_types");

            builder.HasKey(vt => vt.Id);
            builder.Property(vt => vt.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            builder.Property(vt => vt.Name)
                   .HasColumnName("name")
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(vt => vt.Description)
                   .HasColumnName("description")
                   .HasColumnType("text")
                   .IsRequired(false);

            builder.Property(vt => vt.IsActive)
                   .HasColumnName("is_active")
                   .IsRequired();

            builder.Property(vt => vt.RequiresSlot)
                   .HasColumnName("requires_slot")
                   .IsRequired();

            builder.Property(vt => vt.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            builder.Property(vt => vt.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();
        }
    }
}
