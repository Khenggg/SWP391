using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;
using System.ComponentModel.DataAnnotations.Schema; // Thêm dòng này để dùng Table Attribute

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
                   .IsRequired();

            builder.Property(x => x.CardId)
                   .HasColumnName("card_id")
                   .IsRequired();

            builder.Property(x => x.DriverId)
                   .HasColumnName("driver_id");

            builder.Property(x => x.VehicleId)
                   .HasColumnName("vehicle_id");

            builder.Property(x => x.PlateNumber)
                   .HasColumnName("plate_number");

            builder.Property(x => x.NormalizedPlateNumber)
                   .HasColumnName("normalized_plate_number");

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
                   .IsRequired();

            builder.Property(x => x.PaymentRequired)
                   .HasColumnName("payment_required")
                   .IsRequired();

            builder.Property(x => x.PaymentStatus)
                   .HasColumnName("payment_status")
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
                   .HasColumnType("numeric")
                   .IsRequired();

            builder.Property(x => x.SnapshotNightPrice)
                   .HasColumnName("snapshot_night_price")
                   .HasColumnType("numeric")
                   .IsRequired();

            builder.Property(x => x.SnapshotMonthlyPrice)
                   .HasColumnName("snapshot_monthly_price")
                   .HasColumnType("numeric")
                   .IsRequired();

            builder.Property(x => x.SnapshotLostCardFee)
                   .HasColumnName("snapshot_lost_card_fee")
                   .HasColumnType("numeric")
                   .IsRequired();

            builder.Property(x => x.CustomerType)
                   .HasColumnName("customer_type")
                   .IsRequired();

            builder.Property(x => x.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            builder.Property(x => x.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            // Relationships
            builder.HasOne(x => x.PricingRule)
                   .WithMany()
                   .HasForeignKey(x => x.PricingRuleId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ParkingCard)
                   .WithMany()
                   .HasForeignKey(x => x.CardId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Driver)
                   .WithMany(x => x.ParkingSessions)
                   .HasForeignKey(x => x.DriverId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}