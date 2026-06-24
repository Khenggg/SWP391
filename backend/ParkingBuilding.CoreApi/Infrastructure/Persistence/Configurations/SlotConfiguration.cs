using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations;

public class SlotConfiguration : IEntityTypeConfiguration<Slot>
{
    public void Configure(EntityTypeBuilder<Slot> builder)
    {
        builder.ToTable("slots");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.AreaId)
            .HasColumnName("area_id")
            .IsRequired();

        builder.Property(x => x.SlotCode)
            .HasColumnName("slot_code")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.AllowedVehicleTypeId)
            .HasColumnName("allowed_vehicle_type_id")
            .IsRequired();

        builder.Property(x => x.Status)
            .HasColumnName("status")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.CurrentSessionId)
            .HasColumnName("current_session_id");

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at");

        // UNIQUE (area_id, slot_code)
        builder.HasIndex(x => new { x.AreaId, x.SlotCode })
            .IsUnique()
            .HasDatabaseName("ux_slots_area_code");

        // FK -> Area
        builder.HasOne(x => x.Area)
            .WithMany(a => a.Slots)
            .HasForeignKey(x => x.AreaId)
            .OnDelete(DeleteBehavior.Restrict);

        // FK -> VehicleType
        builder.HasOne(x => x.VehicleType)
            .WithMany()
            .HasForeignKey(x => x.AllowedVehicleTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}