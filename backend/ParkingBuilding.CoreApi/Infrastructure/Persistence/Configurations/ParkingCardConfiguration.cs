using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.Persistence.Configurations
{
    public class ParkingCardConfiguration : IEntityTypeConfiguration<ParkingCard>
    {
        public void Configure(EntityTypeBuilder<ParkingCard> builder)
        {
            builder.ToTable("parking_cards");

            builder.HasKey(c => c.Id);
            builder.Property(c => c.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            builder.Property(c => c.CardCode)
                   .HasColumnName("card_code")
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(c => c.QrToken)
                   .HasColumnName("qr_token")
                   .HasMaxLength(120)
                   .IsRequired();

            builder.Property(c => c.Status)
                   .HasColumnName("status")
                   .HasMaxLength(30)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(c => c.CurrentSessionId)
                   .HasColumnName("current_session_id")
                   .IsRequired(false);

            builder.Property(c => c.Note)
                   .HasColumnName("note")
                   .HasColumnType("text")
                   .IsRequired(false);

            builder.Property(c => c.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            builder.Property(c => c.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();
        }
    }
}
