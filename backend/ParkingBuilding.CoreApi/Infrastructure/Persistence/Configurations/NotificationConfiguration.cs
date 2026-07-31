using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.Persistence.Configurations
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.ToTable("notifications");

            builder.HasKey(n => n.Id);
            builder.Property(n => n.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            builder.Property(n => n.UserId)
                   .HasColumnName("user_id")
                   .IsRequired();

            builder.Property(n => n.MonthlyPassId)
                   .HasColumnName("monthly_pass_id");

            builder.Property(n => n.ReservationId)
                   .HasColumnName("reservation_id");

            builder.Property(n => n.PaymentId)
                   .HasColumnName("payment_id");

            builder.Property(n => n.ParkingSessionId)
                   .HasColumnName("parking_session_id");

            builder.Property(n => n.Title)
                   .HasColumnName("title")
                   .HasMaxLength(200)
                   .IsRequired();

            builder.Property(n => n.Content)
                   .HasColumnName("content")
                   .HasColumnType("text")
                   .IsRequired();

            builder.Property(n => n.Type)
                   .HasColumnName("type")
                   .HasMaxLength(255)
                   .IsRequired();

            builder.Property(n => n.Priority)
                   .HasColumnName("priority")
                   .HasMaxLength(255)
                   .HasDefaultValue("NORMAL")
                   .IsRequired();

            builder.Property(n => n.IsRead)
                   .HasColumnName("is_read")
                   .HasDefaultValue(false)
                   .IsRequired();

            builder.Property(n => n.ReadAt)
                   .HasColumnName("read_at")
                   .HasColumnType("timestamp with time zone");

            builder.Property(n => n.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            builder.HasOne(n => n.User)
                   .WithMany()
                   .HasForeignKey(n => n.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(n => n.MonthlyPass)
                   .WithMany()
                   .HasForeignKey(n => n.MonthlyPassId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(n => n.Reservation)
                   .WithMany()
                   .HasForeignKey(n => n.ReservationId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(n => n.Payment)
                   .WithMany()
                   .HasForeignKey(n => n.PaymentId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(n => n.ParkingSession)
                   .WithMany()
                   .HasForeignKey(n => n.ParkingSessionId)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
