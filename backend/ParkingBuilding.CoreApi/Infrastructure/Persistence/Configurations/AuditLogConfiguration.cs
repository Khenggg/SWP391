using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.Persistence.Configurations
{
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.ToTable("audit_logs");

            builder.HasKey(a => a.Id);
            builder.Property(a => a.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            builder.Property(a => a.ActorUserId)
                   .HasColumnName("actor_user_id");

            builder.Property(a => a.SourceService)
                   .HasColumnName("source_service")
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(a => a.Action)
                   .HasColumnName("action")
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(a => a.TargetType)
                   .HasColumnName("target_type")
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(a => a.TargetId)
                   .HasColumnName("target_id")
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(a => a.OldValue)
                   .HasColumnName("old_value")
                   .HasColumnType("jsonb");

            builder.Property(a => a.NewValue)
                   .HasColumnName("new_value")
                   .HasColumnType("jsonb");

            builder.Property(a => a.Reason)
                   .HasColumnName("reason")
                   .HasColumnType("text");

            builder.Property(a => a.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            // Set up relationship with User
            builder.HasOne(a => a.ActorUser)
                   .WithMany()
                   .HasForeignKey(a => a.ActorUserId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
