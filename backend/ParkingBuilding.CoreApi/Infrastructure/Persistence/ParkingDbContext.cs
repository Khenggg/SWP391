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