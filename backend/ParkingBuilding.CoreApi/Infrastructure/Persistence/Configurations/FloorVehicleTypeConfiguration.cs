using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations;

public class FloorVehicleTypeConfiguration : IEntityTypeConfiguration<FloorVehicleType>
{
    public void Configure(EntityTypeBuilder<FloorVehicleType> builder)
    {
        builder.ToTable("floor_vehicle_types");

        // COMPOSITE KEY
        builder.HasKey(x => new { x.FloorId, x.VehicleTypeId });

        builder.Property(x => x.FloorId)
            .HasColumnName("floor_id");

        builder.Property(x => x.VehicleTypeId)
            .HasColumnName("vehicle_type_id");

        // FK -> Floor
        builder.HasOne(x => x.Floor)
            .WithMany(f => f.FloorVehicleTypes)
            .HasForeignKey(x => x.FloorId)
            .OnDelete(DeleteBehavior.Cascade);

        // FK -> VehicleType
        builder.HasOne(x => x.VehicleType)
            .WithMany()
            .HasForeignKey(x => x.VehicleTypeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
