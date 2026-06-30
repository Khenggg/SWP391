using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class ReceiptConfiguration : IEntityTypeConfiguration<Receipt>
    {
        public void Configure(EntityTypeBuilder<Receipt> builder)
        {
            builder.ToTable("receipts");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id");

            builder.Property(x => x.ReceiptCode)
                .HasColumnName("receipt_code")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.SessionId)
                .HasColumnName("session_id");

            builder.Property(x => x.PaymentId)
                .HasColumnName("payment_id");

            builder.Property(x => x.CardCode)
                .HasColumnName("card_code")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.PlateNumber)
                .HasColumnName("plate_number")
                .HasMaxLength(30);

            builder.Property(x => x.VehicleTypeName)
                .HasColumnName("vehicle_type_name")
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(x => x.EntryTime)
                .HasColumnName("entry_time");

            builder.Property(x => x.ExitTime)
                .HasColumnName("exit_time");

            builder.Property(x => x.Amount)
                .HasColumnName("amount")
                .HasPrecision(12, 2);

            builder.Property(x => x.LostCardFee)
                .HasColumnName("lost_card_fee")
                .HasPrecision(12, 2);

            builder.Property(x => x.TotalAmount)
                .HasColumnName("total_amount")
                .HasPrecision(12, 2);

            builder.Property(x => x.PaymentMethod)
                .HasColumnName("payment_method")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.PrintedCount)
                .HasColumnName("printed_count")
                .IsRequired();

            builder.Property(x => x.CreatedBy)
                .HasColumnName("created_by");

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at");

            // Relationships
            builder.HasOne(x => x.ParkingSession)
                .WithMany()
                .HasForeignKey(x => x.SessionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Payment)
                .WithMany()
                .HasForeignKey(x => x.PaymentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.CreatedByUser)
                .WithMany()
                .HasForeignKey(x => x.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
