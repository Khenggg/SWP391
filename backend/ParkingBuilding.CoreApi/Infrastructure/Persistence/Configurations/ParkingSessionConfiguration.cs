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

            // Map các cột rõ ràng (chỉ khai báo mỗi cột 1 lần)
            builder.Property(x => x.PlateNumber).HasColumnName("plate_number");
            builder.Property(x => x.NormalizedPlateNumber).HasColumnName("normalized_plate_number");
            builder.Property(x => x.PricingRuleId).HasColumnName("pricing_rule_id");
            builder.Property(x => x.NoPlate).HasColumnName("no_plate"); // Đảm bảo đã map cột này!

            builder.HasOne(x => x.PricingRule)
                   .WithMany()
                   .HasForeignKey(x => x.PricingRuleId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}