using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations;

public class AreaConfiguration : IEntityTypeConfiguration<Area>
{
    public void Configure(EntityTypeBuilder<Area> builder)
    {
        builder.ToTable("areas");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.FloorId)
            .HasColumnName("floor_id")
            .IsRequired();

        builder.Property(x => x.AreaCode)
            .HasColumnName("area_code")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.AreaName)
            .HasColumnName("area_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.PriorityOrder)
            .HasColumnName("priority_order");

        builder.Property(x => x.Status)
            .HasColumnName("status")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.TotalCapacity)
            .HasColumnName("total_capacity");

        builder.Property(x => x.CurrentRealOccupancy)
            .HasColumnName("current_real_occupancy");

        builder.Property(x => x.CurrentBookedSlots)
            .HasColumnName("current_booked_slots");

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at");

        // UNIQUE (floor_id, area_code)
        builder.HasIndex(x => new { x.FloorId, x.AreaCode })
            .IsUnique()
            .HasDatabaseName("ux_areas_floor_code");

        // FK Floor
        builder.HasOne(x => x.Floor)
            .WithMany(f => f.Areas)
            .HasForeignKey(x => x.FloorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}