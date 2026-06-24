using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations;

public class AreaVehicleTypeConfiguration : IEntityTypeConfiguration<AreaVehicleType>
{
    public void Configure(EntityTypeBuilder<AreaVehicleType> builder)
    {
        builder.ToTable("area_vehicle_types");

        // COMPOSITE KEY
        builder.HasKey(x => new { x.AreaId, x.VehicleTypeId });

        builder.Property(x => x.AreaId)
            .HasColumnName("area_id");

        builder.Property(x => x.VehicleTypeId)
            .HasColumnName("vehicle_type_id");

        // FK -> Area
        builder.HasOne(x => x.Area)
            .WithMany(a => a.AreaVehicleTypes)
            .HasForeignKey(x => x.AreaId)
            .OnDelete(DeleteBehavior.Cascade);

        // FK -> VehicleType
        builder.HasOne(x => x.VehicleType)
            .WithMany()
            .HasForeignKey(x => x.VehicleTypeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}