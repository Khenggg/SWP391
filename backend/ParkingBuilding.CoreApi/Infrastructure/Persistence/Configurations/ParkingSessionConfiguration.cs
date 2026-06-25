using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class ParkingSessionConfiguration : IEntityTypeConfiguration<ParkingSession>
    {
        public void Configure(EntityTypeBuilder<ParkingSession> builder)
        {
            builder.ToTable("parking_sessions");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.SessionCode)
                .HasColumnName("session_code")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.CardId)
                .HasColumnName("card_id")
                .IsRequired();

            builder.Property(x => x.DriverId)
                .HasColumnName("driver_id");

            builder.Property(x => x.VehicleId)
                .HasColumnName("vehicle_id");

            builder.Property(x => x.PlateNumber)
                .HasColumnName("plate_number")
                .HasMaxLength(30);

            builder.Property(x => x.NoPlate)
                .HasColumnName("no_plate")
                .IsRequired();

            builder.Property(x => x.VehicleDescription)
                .HasColumnName("vehicle_description");

            builder.Property(x => x.VehicleTypeId)
                .HasColumnName("vehicle_type_id")
                .IsRequired();

            builder.Property(x => x.EntryGateId)
                .HasColumnName("entry_gate_id")
                .IsRequired();

            builder.Property(x => x.EntryStaffId)
                .HasColumnName("entry_staff_id")
                .IsRequired();

            builder.Property(x => x.EntryTime)
                .HasColumnName("entry_time")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.BillableStartTime)
                .HasColumnName("billable_start_time")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasMaxLength(40)
                .IsRequired();

            builder.Property(x => x.PaymentRequired)
                .HasColumnName("payment_required")
                .IsRequired();

            builder.Property(x => x.PaymentStatus)
                .HasColumnName("payment_status")
                .HasMaxLength(40)
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

            builder.Property(x => x.SnapshotDayPrice)
                .HasColumnName("snapshot_day_price")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.SnapshotNightPrice)
                .HasColumnName("snapshot_night_price")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.SnapshotMonthlyPrice)
                .HasColumnName("snapshot_monthly_price")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.SnapshotLostCardFee)
                .HasColumnName("snapshot_lost_card_fee")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.CustomerType)
                .HasColumnName("customer_type")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.ReservationId)
                .HasColumnName("reservation_id");

            // Relationships
            builder.HasOne(x => x.ParkingCard)
                .WithMany()
                .HasForeignKey(x => x.CardId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Driver)
                .WithMany(d => d.ParkingSessions)
                .HasForeignKey(x => x.DriverId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Reservation)
                .WithOne()
                .HasForeignKey<ParkingSession>(x => x.ReservationId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
