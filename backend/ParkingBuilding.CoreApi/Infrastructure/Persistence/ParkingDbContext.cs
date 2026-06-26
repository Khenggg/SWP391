using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using System.Text.RegularExpressions;

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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // SỬA TẠI ĐÂY: Sử dụng Type của chính ParkingDbContext để EF Core tự động quét 
            // và áp dụng tất cả các lớp cấu hình (bao gồm UserConfiguration) trong cùng Assembly này.
            // Cách này không cần dòng "using ...Configurations;" nên sẽ không bao giờ bị lỗi CS0234 nữa!
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ParkingDbContext).Assembly);

            // CẤU HÌNH TỰ ĐỘNG CONVERT PASCALCASE -> SNAKE_CASE CHO POSTGRESQL
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                // 1. Map tên bảng (Ví dụ: PricingRules -> pricing_rules)
                var tableName = entity.GetTableName();
                if (!string.IsNullOrEmpty(tableName))
                {
                    entity.SetTableName(ToSnakeCase(tableName));
                }

                // 2. Map tất cả tên cột (Kiểm tra nếu có Attribute [Column] thì tôn trọng, không đè lên nữa)
                foreach (var property in entity.GetProperties())
                {
                    // Check xem thuộc tính này có gắn attribute [Column] hay không
                    var columnAttr = property.PropertyInfo?
                        .GetCustomAttributes(typeof(System.ComponentModel.DataAnnotations.Schema.ColumnAttribute), false)
                        .FirstOrDefault() as System.ComponentModel.DataAnnotations.Schema.ColumnAttribute;

                    if (columnAttr != null && !string.IsNullOrEmpty(columnAttr.Name))
                    {
                        // Nếu có [Column("tên_cột")], ép EF Core giữ nguyên tên cột được chỉ định
                        property.SetColumnName(columnAttr.Name);
                    }
                    else
                    {
                        // Nếu không có, mới tự động convert PascalCase -> snake_case như cũ
                        property.SetColumnName(ToSnakeCase(property.Name));
                    }
                }

                // 3. Map lại tên các Khóa chính (Primary Key)
                foreach (var key in entity.GetKeys())
                {
                    var keyName = key.GetName();
                    if (!string.IsNullOrEmpty(keyName))
                    {
                        key.SetName(ToSnakeCase(keyName));
                    }
                }

                // 4. Map lại tên các Khóa ngoại (Foreign Key)
                foreach (var foreignKey in entity.GetForeignKeys())
                {
                    var constraintName = foreignKey.GetConstraintName();
                    if (!string.IsNullOrEmpty(constraintName))
                    {
                        foreignKey.SetConstraintName(ToSnakeCase(constraintName));
                    }
                }

                // 5. Map lại tên các Chỉ mục (Index) nếu có
                foreach (var index in entity.GetIndexes())
                {
                    var indexName = index.GetDatabaseName();
                    if (!string.IsNullOrEmpty(indexName))
                    {
                        index.SetDatabaseName(ToSnakeCase(indexName));
                    }
                }
            }
        }

        // Hàm Helper chuyển đổi chuỗi PascalCase sang snake_case bằng Regex
        private static string ToSnakeCase(string input)
        {
            if (string.IsNullOrEmpty(input)) return input;

            // Tìm các ký tự viết hoa đứng sau chữ thường hoặc số để chèn dấu gạch dưới, sau đó lowercase toàn bộ
            return Regex.Replace(input, "([a-z0-9])([A-Z])", "$1_$2").ToLower();
        }
    }
}