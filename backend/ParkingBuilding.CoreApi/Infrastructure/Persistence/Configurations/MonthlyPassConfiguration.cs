using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class MonthlyPassConfiguration : IEntityTypeConfiguration<MonthlyPass>
    {
        public void Configure(EntityTypeBuilder<MonthlyPass> builder)
        {
            builder.ToTable("monthly_passes");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.DriverId)
                .HasColumnName("driver_id");

            builder.Property(x => x.CardId)
                .HasColumnName("card_id")
                .IsRequired();

            builder.Property(x => x.OwnerName)
                .HasColumnName("owner_name")
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(x => x.Phone)
                .HasColumnName("phone")
                .HasMaxLength(30);

            builder.Property(x => x.PlateNumber)
                .HasColumnName("plate_number")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.NormalizedPlateNumber)
                .HasColumnName("normalized_plate_number")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.VehicleTypeId)
                .HasColumnName("vehicle_type_id")
                .IsRequired();

            builder.Property(x => x.StartDate)
                .HasColumnName("start_date")
                .HasColumnType("date")
                .IsRequired();

            builder.Property(x => x.EndDate)
                .HasColumnName("end_date")
                .HasColumnType("date")
                .IsRequired();

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.CreatedBy)
                .HasColumnName("created_by")
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();
        }
    }
}
