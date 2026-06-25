using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.ToTable("payments");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.SessionId)
                .HasColumnName("session_id");

            builder.Property(x => x.ReservationId)
                .HasColumnName("reservation_id");

            builder.Property(x => x.MonthlyPassId)
                .HasColumnName("monthly_pass_id");

            builder.Property(x => x.Amount)
                .HasColumnName("amount")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.LostCardFee)
                .HasColumnName("lost_card_fee")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.TotalAmount)
                .HasColumnName("total_amount")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.Purpose)
                .HasColumnName("purpose")
                .HasMaxLength(40)
                .IsRequired();

            builder.Property(x => x.Method)
                .HasColumnName("method")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.Provider)
                .HasColumnName("provider")
                .HasMaxLength(50);

            builder.Property(x => x.ProviderTransactionId)
                .HasColumnName("provider_transaction_id")
                .HasMaxLength(120);

            builder.Property(x => x.PaymentUrl)
                .HasColumnName("payment_url")
                .HasMaxLength(500);

            builder.Property(x => x.ExpiredAt)
                .HasColumnName("expired_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.GatewayPayload)
                .HasColumnName("gateway_payload")
                .HasColumnType("jsonb");

            builder.Property(x => x.PaidByUserId)
                .HasColumnName("paid_by_user_id");

            builder.Property(x => x.ReceivedAmount)
                .HasColumnName("received_amount")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.FeeCalculatedAt)
                .HasColumnName("fee_calculated_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.PaymentValidUntil)
                .HasColumnName("payment_valid_until")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.PaidAt)
                .HasColumnName("paid_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.CollectedBy)
                .HasColumnName("collected_by");

            builder.Property(x => x.WaiveReason)
                .HasColumnName("waive_reason")
                .HasMaxLength(100);

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            // Relationships
            builder.HasOne(x => x.ParkingSession)
                .WithMany()
                .HasForeignKey(x => x.SessionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Reservation)
                .WithMany()
                .HasForeignKey(x => x.ReservationId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.MonthlyPass)
                .WithMany()
                .HasForeignKey(x => x.MonthlyPassId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.PaidByUser)
                .WithMany()
                .HasForeignKey(x => x.PaidByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.CollectedByUser)
                .WithMany()
                .HasForeignKey(x => x.CollectedBy)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
