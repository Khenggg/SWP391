using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class ParkingCardConfiguration : IEntityTypeConfiguration<ParkingCard>
    {
        public void Configure(EntityTypeBuilder<ParkingCard> builder)
        {
            builder.ToTable("parking_cards");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            // CardNumber in C# maps to card_code in DB
            builder.Property(x => x.CardNumber)
                   .HasColumnName("card_code")
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(x => x.QrToken)
                   .HasColumnName("qr_token")
                   .HasMaxLength(120)
                   .IsRequired();

            // Status is mapped as enum string conversion
            builder.Property(x => x.Status)
                   .HasColumnName("status")
                   .HasMaxLength(30)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(x => x.Note)
                   .HasColumnName("note");

            builder.Property(x => x.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone");

            builder.Property(x => x.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp with time zone");

            // Unique indexes
            builder.HasIndex(x => x.CardNumber).IsUnique();
            builder.HasIndex(x => x.QrToken).IsUnique();
        }
    }
}
