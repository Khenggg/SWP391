using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class PricingRuleConfiguration : IEntityTypeConfiguration<PricingRule>
    {
        public void Configure(EntityTypeBuilder<PricingRule> builder)
        {
            builder.ToTable("pricing_rules");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.VehicleTypeId)
                   .HasColumnName("vehicle_type_id")
                   .IsRequired();

            builder.Property(x => x.DayPrice)
                   .HasColumnName("day_price")
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(x => x.NightPrice)
                   .HasColumnName("night_price")
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(x => x.MonthlyPrice)
                   .HasColumnName("monthly_price")
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(x => x.ReservationHourlyPrice)
                   .HasColumnName("reservation_hourly_price")
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(x => x.LostCardFee)
                   .HasColumnName("lost_card_fee")
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(x => x.EffectiveFrom)
                   .HasColumnName("effective_from")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            builder.Property(x => x.Status)
                   .HasColumnName("status")
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(x => x.CreatedBy)
                   .HasColumnName("created_by")
                   .IsRequired();

            builder.Property(x => x.UpdatedBy)
                   .HasColumnName("updated_by");

            builder.Property(x => x.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone");

            builder.Property(x => x.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp with time zone");

            // Relationships
            builder.HasOne(x => x.VehicleType)
                   .WithMany()
                   .HasForeignKey(x => x.VehicleTypeId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
