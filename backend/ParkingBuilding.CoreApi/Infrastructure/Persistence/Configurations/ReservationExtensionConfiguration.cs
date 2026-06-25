using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class ReservationExtensionConfiguration : IEntityTypeConfiguration<ReservationExtension>
    {
        public void Configure(EntityTypeBuilder<ReservationExtension> builder)
        {
            builder.ToTable("reservation_extensions");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.ReservationId)
                .HasColumnName("reservation_id")
                .IsRequired();

            builder.Property(x => x.OldExpiresAt)
                .HasColumnName("old_expires_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.NewExpiresAt)
                .HasColumnName("new_expires_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.AddedMinutes)
                .HasColumnName("added_minutes")
                .IsRequired();

            builder.Property(x => x.PricingRuleId)
                .HasColumnName("pricing_rule_id");

            builder.Property(x => x.SnapshotReservationHourlyPrice)
                .HasColumnName("snapshot_reservation_hourly_price")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.Amount)
                .HasColumnName("amount")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.PaymentId)
                .HasColumnName("payment_id");

            builder.Property(x => x.RequestedBy)
                .HasColumnName("requested_by");

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            // Relationships
            builder.HasOne(x => x.Reservation)
                .WithMany(r => r.Extensions)
                .HasForeignKey(x => x.ReservationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.PricingRule)
                .WithMany()
                .HasForeignKey(x => x.PricingRuleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Payment)
                .WithMany()
                .HasForeignKey(x => x.PaymentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.RequestedByUser)
                .WithMany()
                .HasForeignKey(x => x.RequestedBy)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
