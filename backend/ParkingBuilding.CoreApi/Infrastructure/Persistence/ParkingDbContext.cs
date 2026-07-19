using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence
{
    public class ParkingDbContext : DbContext
    {
        public ParkingDbContext(DbContextOptions<ParkingDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
        public DbSet<VehicleType> VehicleTypes => Set<VehicleType>();
        public DbSet<ParkingCard> ParkingCards => Set<ParkingCard>();
        public DbSet<PricingRule> PricingRules => Set<PricingRule>();
        public DbSet<Floor> Floors { get; set; }
        public DbSet<Area> Areas { get; set; }
        public DbSet<AreaVehicleType> AreaVehicleTypes { get; set; }
        public DbSet<Slot> Slots { get; set; }
        public DbSet<Gate> Gates { get; set; }
        public DbSet<ParkingSession> ParkingSessions { get; set; }
        public DbSet<DriverProfile> DriverProfiles { get; set; } // Hoặc tên DbSet tương ứng trong context
        public DbSet<MonthlyPass> MonthlyPasses { get; set; }
        public DbSet<MonthlyPassApplication> MonthlyPassApplications { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<ReservationExtension> ReservationExtensions { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<ParkingSessionImage> ParkingSessionImages { get; set; }
        public DbSet<LostCardCaseDocument> LostCardCaseDocuments { get; set; }
        public DbSet<Receipt> Receipts { get; set; }
        public DbSet<PlateMismatchCase> PlateMismatchCases { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // SỬA TẠI ĐÂY: Sử dụng Type của chính ParkingDbContext để EF Core tự động quét 
            // và áp dụng tất cả các lớp cấu hình (bao gồm UserConfiguration) trong cùng Assembly này.
            // Cách này không cần dòng "using ...Configurations;" nên sẽ không bao giờ bị lỗi CS0234 nữa!
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ParkingDbContext).Assembly);
        }
    }
}
