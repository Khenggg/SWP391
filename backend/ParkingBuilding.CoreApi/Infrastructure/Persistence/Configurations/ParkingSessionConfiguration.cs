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

            // Đảm bảo map đúng khóa ngoại PricingRuleId
            builder.HasOne(x => x.PricingRule)
                   .WithMany()
                   .HasForeignKey(x => x.PricingRuleId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Map rõ ràng các cột khác để tránh EF tự suy luận sai
            builder.Property(x => x.PlateNumber).HasColumnName("plate_number");
            builder.Property(x => x.PricingRuleId).HasColumnName("pricing_rule_id");
            // ... thêm các thuộc tính khác nếu cần
        }
    }
}