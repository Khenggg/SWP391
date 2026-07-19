using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
    {
        public void Configure(EntityTypeBuilder<Reservation> builder)
        {
            builder.ToTable("reservations");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.ReservationCode)
                .HasColumnName("reservation_code")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.DriverId)
                .HasColumnName("driver_id");

            builder.Property(x => x.VehicleId)
                .HasColumnName("vehicle_id");

            builder.Property(x => x.PlateNumber)
                .HasColumnName("plate_number")
                .HasMaxLength(30);

            builder.Property(x => x.NormalizedPlateNumber)
                .HasColumnName("normalized_plate_number")
                .HasMaxLength(30);

            builder.Property(x => x.VehicleTypeId)
                .HasColumnName("vehicle_type_id")
                .IsRequired();

            builder.Property(x => x.FloorId)
                .HasColumnName("floor_id")
                .IsRequired();

            builder.Property(x => x.AreaId)
                .HasColumnName("area_id")
                .IsRequired();

            builder.Property(x => x.SlotId)
                .HasColumnName("slot_id");

            builder.Property(x => x.PricingRuleId)
                .HasColumnName("pricing_rule_id");

            builder.Property(x => x.SnapshotReservationHourlyPrice)
                .HasColumnName("snapshot_reservation_hourly_price")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.ReservedDurationMinutes)
                .HasColumnName("reserved_duration_minutes")
                .IsRequired();

            builder.Property(x => x.BookingAmount)
                .HasColumnName("booking_amount")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.PaymentStatus)
                .HasColumnName("payment_status")
                .HasMaxLength(40)
                .IsRequired();

            builder.Property(x => x.ReservedAt)
                .HasColumnName("reserved_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.ExpiresAt)
                .HasColumnName("expires_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.PaymentDeadline)
                .HasColumnName("payment_deadline")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.ConfirmedAt)
                .HasColumnName("confirmed_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.CheckedInAt)
                .HasColumnName("checked_in_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.CheckedInBy)
                .HasColumnName("checked_in_by");

            builder.Property(x => x.CancelledAt)
                .HasColumnName("cancelled_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.CreatedBy)
                .HasColumnName("created_by");

            builder.Property(x => x.CancelledBy)
                .HasColumnName("cancelled_by");

            builder.Property(x => x.CancellationReason)
                .HasColumnName("cancellation_reason");

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            // Relationships
            builder.HasOne(x => x.Driver)
                .WithMany()
                .HasForeignKey(x => x.DriverId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Vehicle)
                .WithMany()
                .HasForeignKey(x => x.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.VehicleType)
                .WithMany()
                .HasForeignKey(x => x.VehicleTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Floor)
                .WithMany()
                .HasForeignKey(x => x.FloorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Area)
                .WithMany()
                .HasForeignKey(x => x.AreaId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Slot)
                .WithMany()
                .HasForeignKey(x => x.SlotId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.PricingRule)
                .WithMany()
                .HasForeignKey(x => x.PricingRuleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.CheckedInByUser)
                .WithMany()
                .HasForeignKey(x => x.CheckedInBy)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.CreatedByUser)
                .WithMany()
                .HasForeignKey(x => x.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.CancelledByUser)
                .WithMany()
                .HasForeignKey(x => x.CancelledBy)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
