using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.Persistence.Configurations
{
    public class PricingRuleConfiguration : IEntityTypeConfiguration<PricingRule>
    {
        public void Configure(EntityTypeBuilder<PricingRule> builder)
        {
            builder.ToTable("pricing_rules");

            builder.HasKey(pr => pr.Id);
            builder.Property(pr => pr.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            builder.Property(pr => pr.VehicleTypeId)
                   .HasColumnName("vehicle_type_id")
                   .IsRequired();

            builder.Property(pr => pr.DayPrice)
                   .HasColumnName("day_price")
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(pr => pr.NightPrice)
                   .HasColumnName("night_price")
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(pr => pr.MonthlyPrice)
                   .HasColumnName("monthly_price")
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(pr => pr.ReservationHourlyPrice)
                   .HasColumnName("reservation_hourly_price")
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(pr => pr.LostCardFee)
                   .HasColumnName("lost_card_fee")
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(pr => pr.EffectiveFrom)
                   .HasColumnName("effective_from")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            builder.Property(pr => pr.Status)
                   .HasColumnName("status")
                   .HasMaxLength(30)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(pr => pr.CreatedBy)
                   .HasColumnName("created_by")
                   .IsRequired();

            builder.Property(pr => pr.UpdatedBy)
                   .HasColumnName("updated_by")
                   .IsRequired(false);

            builder.Property(pr => pr.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            builder.Property(pr => pr.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            // Relationships
            builder.HasOne(pr => pr.VehicleType)
                   .WithMany()
                   .HasForeignKey(pr => pr.VehicleTypeId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(pr => pr.Creator)
                   .WithMany()
                   .HasForeignKey(pr => pr.CreatedBy)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(pr => pr.Updater)
                   .WithMany()
                   .HasForeignKey(pr => pr.UpdatedBy)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
