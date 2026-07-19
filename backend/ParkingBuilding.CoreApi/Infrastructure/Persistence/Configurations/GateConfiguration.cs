using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations;

public class GateConfiguration : IEntityTypeConfiguration<Gate>
{
    public void Configure(EntityTypeBuilder<Gate> builder)
    {
        builder.ToTable("gates");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.FloorId)
            .HasColumnName("floor_id")
            .IsRequired();

        builder.Property(x => x.GateCode)
            .HasColumnName("gate_code")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.GateType)
            .HasColumnName("gate_type")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.Status)
            .HasColumnName("status")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at");

        // UNIQUE (floor_id, gate_code)
        builder.HasIndex(x => new { x.FloorId, x.GateCode })
            .IsUnique()
            .HasDatabaseName("ux_gates_floor_code");

        // FK -> Floor
        builder.HasOne(x => x.Floor)
            .WithMany(f => f.Gates)
            .HasForeignKey(x => x.FloorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}