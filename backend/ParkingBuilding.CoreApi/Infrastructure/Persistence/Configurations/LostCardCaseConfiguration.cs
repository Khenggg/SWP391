using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class LostCardCaseConfiguration : IEntityTypeConfiguration<LostCardCase>
    {
        public void Configure(EntityTypeBuilder<LostCardCase> builder)
        {
            builder.ToTable("lost_card_cases");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
            builder.Property(x => x.SessionId).HasColumnName("session_id").IsRequired();
            builder.Property(x => x.CardId).HasColumnName("card_id");
            builder.Property(x => x.ReporterName).HasColumnName("reporter_name").HasMaxLength(150).IsRequired();
            builder.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(30);
            builder.Property(x => x.VerificationNote).HasColumnName("verification_note").IsRequired();
            builder.Property(x => x.Reason).HasColumnName("reason").IsRequired();
            builder.Property(x => x.LostCardFee)
                .HasColumnName("lost_card_fee")
                .HasColumnType("numeric(12,2)")
                .HasDefaultValue(0m)
                .IsRequired();
            builder.Property(x => x.Status).HasColumnName("status").HasMaxLength(30).IsRequired();
            builder.Property(x => x.CreatedBy).HasColumnName("created_by").IsRequired();
            builder.Property(x => x.ApprovedBy).HasColumnName("approved_by");
            builder.Property(x => x.ApprovedAt)
                .HasColumnName("approved_at")
                .HasColumnType("timestamp with time zone");
            builder.Property(x => x.RejectionReason).HasColumnName("rejection_reason");
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
            builder.HasOne(x => x.ParkingCard)
                .WithMany()
                .HasForeignKey(x => x.CardId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.CreatedByUser)
                .WithMany()
                .HasForeignKey(x => x.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.ApprovedByUser)
                .WithMany()
                .HasForeignKey(x => x.ApprovedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            builder.HasIndex(x => x.SessionId).HasDatabaseName("ix_lost_card_cases_session");
            builder.HasIndex(x => x.Status).HasDatabaseName("ix_lost_card_cases_status");
            builder.HasIndex(x => x.CardId).HasDatabaseName("ix_lost_card_cases_card");
            builder.HasIndex(x => x.CreatedBy).HasDatabaseName("ix_lost_card_cases_created_by");
            builder.HasIndex(x => x.ApprovedBy).HasDatabaseName("ix_lost_card_cases_approved_by");
        }
    }
}
