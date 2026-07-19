using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class PlateMismatchCaseConfiguration : IEntityTypeConfiguration<PlateMismatchCase>
    {
        public void Configure(EntityTypeBuilder<PlateMismatchCase> builder)
        {
            builder.ToTable("plate_mismatch_cases");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id");

            builder.Property(x => x.SessionId)
                .HasColumnName("session_id")
                .IsRequired();

            builder.Property(x => x.EntryPlateNumber)
                .HasColumnName("entry_plate_number")
                .HasMaxLength(30);

            builder.Property(x => x.ExitPlateNumber)
                .HasColumnName("exit_plate_number")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.Reason)
                .HasColumnName("reason");

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.CreatedBy)
                .HasColumnName("created_by")
                .IsRequired();

            builder.Property(x => x.ConfirmedBy)
                .HasColumnName("confirmed_by");

            builder.Property(x => x.ConfirmedAt)
                .HasColumnName("confirmed_at");

            builder.Property(x => x.RejectionReason)
                .HasColumnName("rejection_reason");

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at");

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at");

            // Relationships
            builder.HasOne(x => x.ParkingSession)
                .WithMany()
                .HasForeignKey(x => x.SessionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.CreatedByUser)
                .WithMany()
                .HasForeignKey(x => x.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ConfirmedByUser)
                .WithMany()
                .HasForeignKey(x => x.ConfirmedBy)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
