using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class VehicleTypeConfiguration : IEntityTypeConfiguration<VehicleType>
    {
        public void Configure(EntityTypeBuilder<VehicleType> builder)
        {
            builder.ToTable("vehicle_types");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();
                   
            builder.Property(x => x.Name)
                   .HasColumnName("name")
                   .HasMaxLength(100)
                   .IsRequired();
                   
            builder.Property(x => x.Description)
                   .HasColumnName("description");
                   
            builder.Property(x => x.IsActive)
                   .HasColumnName("is_active")
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.RequiresSlot)
                   .HasColumnName("requires_slot")
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone");

            builder.Property(x => x.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp with time zone");
        }
    }
}
