# Tài liệu Templates và Hướng dẫn Kỹ thuật chi tiết Sprint 2

Tài liệu này lưu trữ toàn bộ mô tả nghiệp vụ (Scope, Acceptance Criteria) và hướng dẫn kỹ thuật chi tiết (Cấu trúc thư mục, Entities, Configurations, Controller mẫu) cho 4 issue lớn của Sprint 2. Thành viên trong đội phát triển có thể tham khảo trực tiếp file này ngay trên VS Code / Visual Studio cục bộ.

---

## 📋 [Issue #71] [Backend-.NET] Quản trị dữ liệu nền cốt lõi (Users, Cards, Vehicles, Pricing)

### 👤 Người chịu trách nhiệm: `Ahug05`

### 🎯 Mục tiêu
Thiết lập database, entities, repositories, services và controllers cho toàn bộ các chức năng quản lý cốt lõi/dữ liệu nền của hệ thống trên phân hệ .NET Core API.

### 🛠️ Scope công việc
1. **Quản trị người dùng (User Management):**
   - CRUD người dùng nội bộ (Admin quản lý Staff/Manager).
   - Mã hóa mật khẩu người dùng trước khi lưu vào DB bằng thư viện BCrypt.
2. **Quản lý Thẻ đỗ xe (Parking Cards):**
   - CRUD Thẻ đỗ xe (Parking Cards) và mã QR định danh đi kèm.
3. **Quản lý cấu hình Xe & Bảng giá (Vehicles & Pricing):**
   - CRUD Loại xe (Vehicle Types).
   - CRUD Quy tắc tính phí (Pricing Rules) tương ứng với từng loại xe.
4. **Cấu hình & Bảo mật JWT:**
   - Đảm bảo JwtTokenGenerator sinh token chứa đúng các claim: `sub` là user ID dạng String, `user_id`, `username`, `role`, và `fullName`.

### 📂 Các bảng Database liên quan
- `users`
- `driver_profiles`
- `vehicle_types`
- `vehicles`
- `parking_cards`
- `pricing_rules`

### ⚙️ Yêu cầu kỹ thuật & Kiến trúc
- Không hardcode Connection String hay JWT Secret (đọc từ biến môi trường `ConnectionStrings__DefaultConnection` và `JWT_SECRET`).
- Sử dụng Repository Pattern kết hợp EF Core.
- API Endpoints tuân thủ RESTful chuẩn (sử dụng đúng HTTP Methods: GET, POST, PUT, DELETE).

### ✅ Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] Chạy `dotnet build` không có cảnh báo hoặc lỗi biên dịch.
- [ ] Đăng nhập thành công trả về JWT Token đúng cấu trúc claim đã thống nhất.
- [ ] API CRUD hoạt động chính xác với đầy đủ validation (ví dụ: Không được tạo trùng mã thẻ hoặc trùng username).
- [ ] Mật khẩu được mã hóa an toàn dưới DB (kiểm tra cột `password_hash` không chứa text thô).

### 💻 HƯỚNG DẪN KỸ THUẬT CHI TIẾT (Dành cho Lập trình viên .NET 1 - Ahug05)

#### 📂 Bước 1: Tạo các thực thể (Entities)
Tạo mới các file class sau trong thư mục: `backend/ParkingBuilding.CoreApi/Domain/Entities/`

##### 1. `VehicleType.cs` (Loại xe)
```csharp
namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class VehicleType
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
```

##### 2. `ParkingCard.cs` (Thẻ xe)
```csharp
using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public enum CardStatus
    {
        ACTIVE,
        INACTIVE,
        LOCKED
    }

    public class ParkingCard
    {
        public long Id { get; set; }
        public string CardNumber { get; set; } = string.Empty; // Mã vật lý thẻ (phải duy nhất)
        public string QrToken { get; set; } = string.Empty;    // Token QR đi kèm (phải duy nhất)
        public CardStatus Status { get; set; } = CardStatus.ACTIVE;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
```

##### 3. `PricingRule.cs` (Bảng giá tính phí)
```csharp
using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class PricingRule
    {
        public long Id { get; set; }
        public long VehicleTypeId { get; set; }
        public string RuleName { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public int DurationMinutes { get; set; }
        public bool IsActive { get; set; } = true;
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public VehicleType? VehicleType { get; set; }
    }
}
```

#### 📂 Bước 2: Cấu hình ánh xạ Database (EF Core Fluent API)
Tạo các class cấu hình để EF Core ánh xạ chính xác kiểu dữ liệu và ràng buộc vào DB PostgreSQL có sẵn. Tạo trong thư mục: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/`

##### 1. `VehicleTypeConfiguration.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class VehicleTypeConfiguration : IEntityTypeConfiguration<VehicleType>
    {
        public void Configure(EntityTypeBuilder<VehicleType> builder)
        {
            builder.ToTable("vehicle_types");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id");
            builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(50).IsRequired();
            builder.Property(x => x.Description).HasColumnName("description").HasMaxLength(255);
        }
    }
}
```

##### 2. `ParkingCardConfiguration.cs`
```csharp
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
            builder.Property(x => x.Id).HasColumnName("id");
            builder.Property(x => x.CardNumber).HasColumnName("card_number").HasMaxLength(100).IsRequired();
            builder.Property(x => x.QrToken).HasColumnName("qr_token").HasMaxLength(255).IsRequired();
            builder.Property(x => x.Status).HasColumnName("status").HasConversion<string>().IsRequired();
            builder.Property(x => x.CreatedAt).HasColumnName("created_at");

            // Ràng buộc duy nhất (Unique Index)
            builder.HasIndex(x => x.CardNumber).IsUnique();
            builder.HasIndex(x => x.QrToken).IsUnique();
        }
    }
}
```

##### 3. `PricingRuleConfiguration.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class PricingRuleConfiguration : IEntityTypeConfiguration<PricingRule>
    {
        public void Configure(EntityTypeBuilder<PricingRule> builder)
        {
            builder.ToTable("pricing_rules");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id");
            builder.Property(x => x.VehicleTypeId).HasColumnName("vehicle_type_id").IsRequired();
            builder.Property(x => x.RuleName).HasColumnName("rule_name").HasMaxLength(100).IsRequired();
            builder.Property(x => x.BasePrice).HasColumnName("base_price").HasColumnType("decimal(10,2)").IsRequired();
            builder.Property(x => x.DurationMinutes).HasColumnName("duration_minutes").IsRequired();
            builder.Property(x => x.IsActive).HasColumnName("is_active").IsRequired();
            builder.Property(x => x.CreatedBy).HasColumnName("created_by").IsRequired();
            builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");
            builder.Property(x => x.CreatedAt).HasColumnName("created_at");
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

            // Mối quan hệ Khóa ngoại
            builder.HasOne(x => x.VehicleType)
                   .WithMany()
                   .HasForeignKey(x => x.VehicleTypeId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
```

#### 📂 Bước 3: Đăng ký trong `ParkingDbContext.cs`
Mở file [ParkingDbContext.cs](file:///f:/Ky%205/SWP301/backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/ParkingDbContext.cs), bổ sung khai báo 3 bảng mới:
```csharp
public DbSet<VehicleType> VehicleTypes => Set<VehicleType>();
public DbSet<ParkingCard> ParkingCards => Set<ParkingCard>();
public DbSet<PricingRule> PricingRules => Set<PricingRule>();
```

#### 📂 Bước 4: Viết các API Controllers
Tạo các Controller kế thừa `BaseApiController` trong thư mục `backend/ParkingBuilding.CoreApi/Controllers/`. Hãy truyền `ParkingDbContext _context` trực tiếp qua Constructor và viết các hàm xử lý dữ liệu.

##### 📝 Ví dụ mẫu CRUD cho `VehicleTypesController.cs`:
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize(Roles = "ADMIN,MANAGER")]
    [Route("api/core/vehicle-types")]
    public class VehicleTypesController : BaseApiController
    {
        private readonly ParkingDbContext _context;

        public VehicleTypesController(ParkingDbContext context)
        {
            _context = context;
        }

        // 1. GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.VehicleTypes.ToListAsync();
            return Success(list, "Get vehicle types successfully");
        }

        // 2. GET BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var item = await _context.VehicleTypes.FindAsync(id);
            if (item == null) return Fail("Not Found", $"Vehicle type with ID {id} not found.");
            return Success(item, "Get vehicle type successfully");
        }

        // 3. CREATE
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] VehicleType model)
        {
            if (string.IsNullOrWhiteSpace(model.Name)) 
                return Fail("Bad Request", "Name is required.");

            _context.VehicleTypes.Add(model);
            await _context.SaveChangesAsync();
            return Success(model, "Create vehicle type successfully");
        }

        // 4. UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] VehicleType model)
        {
            var existing = await _context.VehicleTypes.FindAsync(id);
            if (existing == null) return Fail("Not Found", "Vehicle type not found.");

            existing.Name = model.Name;
            existing.Description = model.Description;

            _context.VehicleTypes.Update(existing);
            await _context.SaveChangesAsync();
            return Success(existing, "Update vehicle type successfully");
        }

        // 5. DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var existing = await _context.VehicleTypes.FindAsync(id);
            if (existing == null) return Fail("Not Found", "Vehicle type not found.");

            _context.VehicleTypes.Remove(existing);
            await _context.SaveChangesAsync();
            return Success(true, "Delete vehicle type successfully");
        }
    }
}
```

#### 🧪 Bước 5: Kiểm thử (Testing)
1. Bật PostgreSQL cục bộ và thiết lập các biến môi trường để chạy app.
2. Sử dụng Postman để:
   - Gọi POST `/api/core/auth/login` với tài khoản Admin lấy token JWT.
   - Gắn JWT Token vào tab `Authorization` -> `Bearer Token`.
   - Test thử các API CRUD đã viết để đảm bảo trả về HTTP 200/201.
3. Chạy lệnh kiểm thử biên dịch: `dotnet build`

---

## 📋 [Issue #72] [Backend-.NET] Quản trị cấu trúc bãi đỗ xe (Floor, Area, Slot, Gate)

### 👤 Người chịu trách nhiệm: `ToTrieuTien`

### 🎯 Mục tiêu
Thiết lập và quản lý cấu trúc sơ đồ bãi đỗ xe bao gồm các Tầng, Khu vực, Vị trí đỗ và Cổng kiểm soát trên phân hệ .NET Core API.

### 🛠️ Scope công việc
1. **Quản lý Tầng (Floors):** CRUD Tầng.
2. **Quản lý Khu vực (Areas):** CRUD Khu vực (thuộc Tầng).
3. **Quản lý Vị trí đỗ (Slots):** CRUD Vị trí đỗ (thuộc Khu vực), chỉ định loại xe được phép đỗ (`allowed_vehicle_type_id`).
4. **Quản lý Cổng kiểm soát (Gates):** CRUD Cổng kiểm soát và trạng thái hoạt động.
5. **Logic kiểm soát nghiệp vụ:**
   - Ràng buộc không cho phép trùng tên tầng trong bãi xe.
   - Ràng buộc không cho phép trùng mã vị trí đỗ trong cùng một tầng/khu vực.

### 📂 Các bảng Database liên quan
- `floors`
- `areas`
- `area_vehicle_types`
- `slots`
- `gates`

### ⚙️ Yêu cầu kỹ thuật & Kiến trúc
- Ánh xạ đúng mối quan hệ khóa ngoại (Foreign Keys) trong Entity Framework Core.
- Khi tạo Slot, thuộc tính `allowed_vehicle_type_id` cần trỏ đúng tới ID của bảng `vehicle_types` (sử dụng Skeleton class `VehicleType.cs` để biên dịch không lỗi).
- Bảo vệ các API quản trị bãi xe bằng quyền `[Authorize(Roles = "MANAGER,ADMIN")]`.

### ✅ Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] Các API CRUD Floor, Area, Slot, Gate hoạt động đúng spec RESTful.
- [ ] Khi xóa một Floor, hệ thống phải xử lý ràng buộc cascade đúng cách hoặc chặn nếu đã có Area/Slot liên kết.
- [ ] Không có lỗi biên dịch.
- [ ] Validate dữ liệu đầu vào chuẩn (ví dụ: Tên tầng không được trống, sức chứa/số lượng slot phải là số dương).

### 💻 HƯỚNG DẪN KỸ THUẬT CHI TIẾT (Dành cho Lập trình viên .NET 2 - ToTrieuTien)

#### 📂 Bước 1: Tạo các thực thể (Entities)
Tạo mới các file class sau trong thư mục: `backend/ParkingBuilding.CoreApi/Domain/Entities/`

##### 1. `Floor.cs` (Tầng bãi xe)
```csharp
namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class Floor
    {
        public long Id { get; set; }
        public string FloorName { get; set; } = string.Empty; // Tên tầng (Ví dụ: B1, B2)
        public int Capacity { get; set; }                     // Sức chứa tối đa của tầng
        public bool IsActive { get; set; } = true;
    }
}
```

##### 2. `Area.cs` (Khu vực đỗ xe - nằm trong Tầng)
```csharp
namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class Area
    {
        public long Id { get; set; }
        public long FloorId { get; set; }
        public string AreaName { get; set; } = string.Empty; // Tên khu vực (Ví dụ: Khu A, Khu B)
        public int Capacity { get; set; }

        // Navigation properties
        public Floor? Floor { get; set; }
    }
}
```

##### 3. `Slot.cs` (Vị trí đỗ xe cụ thể)
```csharp
namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public enum SlotStatus
    {
        AVAILABLE,
        OCCUPIED,
        RESERVED
    }

    public class Slot
    {
        public long Id { get; set; }
        public long AreaId { get; set; }
        public string SlotNumber { get; set; } = string.Empty; // Mã vị trí (Ví dụ: A-01, A-02)
        public long AllowedVehicleTypeId { get; set; }          // FK tới VehicleType (Cần skeleton VehicleType.cs để compile)
        public SlotStatus Status { get; set; } = SlotStatus.AVAILABLE;

        // Navigation properties
        public Area? Area { get; set; }
        public VehicleType? AllowedVehicleType { get; set; }
    }
}
```

##### 4. `Gate.cs` (Cổng vào/ra của bãi đỗ xe)
```csharp
namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public enum GateType
    {
        ENTRY,
        EXIT
    }

    public class Gate
    {
        public long Id { get; set; }
        public long FloorId { get; set; }
        public string GateName { get; set; } = string.Empty; // Ví dụ: Cổng chính, Cổng phụ 1
        public GateType GateType { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public Floor? Floor { get; set; }
    }
}
```

#### 📂 Bước 2: Cấu hình ánh xạ Database (EF Core Fluent API)
Tạo các class cấu hình ánh xạ DB trong thư mục: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/`

##### 1. `FloorConfiguration.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class FloorConfiguration : IEntityTypeConfiguration<Floor>
    {
        public void Configure(EntityTypeBuilder<Floor> builder)
        {
            builder.ToTable("floors");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id");
            builder.Property(x => x.FloorName).HasColumnName("floor_name").HasMaxLength(50).IsRequired();
            builder.Property(x => x.Capacity).HasColumnName("capacity").IsRequired();
            builder.Property(x => x.IsActive).HasColumnName("is_active").IsRequired();

            // Ràng buộc duy nhất: Không cho phép trùng tên Tầng
            builder.HasIndex(x => x.FloorName).IsUnique();
        }
    }
}
```

##### 2. `AreaConfiguration.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class AreaConfiguration : IEntityTypeConfiguration<Area>
    {
        public void Configure(EntityTypeBuilder<Area> builder)
        {
            builder.ToTable("areas");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id");
            builder.Property(x => x.FloorId).HasColumnName("floor_id").IsRequired();
            builder.Property(x => x.AreaName).HasColumnName("area_name").HasMaxLength(50).IsRequired();
            builder.Property(x => x.Capacity).HasColumnName("capacity").IsRequired();

            // Mối quan hệ
            builder.HasOne(x => x.Floor)
                   .WithMany()
                   .HasForeignKey(x => x.FloorId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Ràng buộc: Tên khu vực duy nhất trong mỗi tầng
            builder.HasIndex(x => new { x.FloorId, x.AreaName }).IsUnique();
        }
    }
}
```

##### 3. `SlotConfiguration.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class SlotConfiguration : IEntityTypeConfiguration<Slot>
    {
        public void Configure(EntityTypeBuilder<Slot> builder)
        {
            builder.ToTable("slots");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id");
            builder.Property(x => x.AreaId).HasColumnName("area_id").IsRequired();
            builder.Property(x => x.SlotNumber).HasColumnName("slot_number").HasMaxLength(50).IsRequired();
            builder.Property(x => x.AllowedVehicleTypeId).HasColumnName("allowed_vehicle_type_id").IsRequired();
            builder.Property(x => x.Status).HasColumnName("status").HasConversion<string>().IsRequired();

            // Mối quan hệ
            builder.HasOne(x => x.Area)
                   .WithMany()
                   .HasForeignKey(x => x.AreaId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.AllowedVehicleType)
                   .WithMany()
                   .HasForeignKey(x => x.AllowedVehicleTypeId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Ràng buộc: Số vị trí đỗ (SlotNumber) duy nhất trong mỗi Khu vực
            builder.HasIndex(x => new { x.AreaId, x.SlotNumber }).IsUnique();
        }
    }
}
```

##### 4. `GateConfiguration.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class GateConfiguration : IEntityTypeConfiguration<Gate>
    {
        public void Configure(EntityTypeBuilder<Gate> builder)
        {
            builder.ToTable("gates");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id");
            builder.Property(x => x.FloorId).HasColumnName("floor_id").IsRequired();
            builder.Property(x => x.GateName).HasColumnName("gate_name").HasMaxLength(100).IsRequired();
            builder.Property(x => x.GateType).HasColumnName("gate_type").HasConversion<string>().IsRequired();
            builder.Property(x => x.IsActive).HasColumnName("is_active").IsRequired();

            // Mối quan hệ
            builder.HasOne(x => x.Floor)
                   .WithMany()
                   .HasForeignKey(x => x.FloorId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
```

#### 📂 Bước 3: Đăng ký trong `ParkingDbContext.cs`
Mở file [ParkingDbContext.cs](file:///f:/Ky%205/SWP301/backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/ParkingDbContext.cs), khai báo thêm 4 bảng mới:
```csharp
public DbSet<Floor> Floors => Set<Floor>();
public DbSet<Area> Areas => Set<Area>();
public DbSet<Slot> Slots => Set<Slot>();
public DbSet<Gate> Gates => Set<Gate>();
```

#### 📂 Bước 4: Viết các API Controllers
Tạo các Controller tương tự `VehicleTypesController.cs` vào thư mục `backend/ParkingBuilding.CoreApi/Controllers/`:
- `FloorsController.cs` (Quản lý Floor)
- `AreasController.cs` (Quản lý Area)
- `SlotsController.cs` (Quản lý Slot)
- `GatesController.cs` (Quản lý Gate)

#### ⚠️ Quy định kiểm tra logic khi CRUD:
- **Tạo/Cập nhật Floor:** Kiểm tra xem `FloorName` có bị trùng trong DB không. Nếu trùng, trả về lỗi Bad Request (`return Fail("Bad Request", "Floor name already exists.");`).
- **Tạo/Cập nhật Slot:** Kiểm tra xem `SlotNumber` trong Area đó đã tồn tại chưa. Đồng thời kiểm tra xem ID `AllowedVehicleTypeId` gửi lên có hợp lệ (tồn tại trong DB) hay không.
- **Phân quyền APIs:** Các Controller này cần được bảo vệ bằng quyền: `[Authorize(Roles = "MANAGER,ADMIN")]`.

#### 🧪 Bước 5: Kiểm thử (Testing)
1. Hãy thiết lập database cục bộ, đăng nhập qua Postman và gán Bearer Token.
2. Gọi các hàm CRUD để đảm bảo các ràng buộc trùng lặp hoạt động đúng.
3. Chạy lệnh kiểm thử biên dịch trước khi push code: `dotnet build`

---

## 📋 [Issue #73] [Backend-Spring] Xây dựng APIs đọc dữ liệu công cộng & Khung Dashboard

### 👤 Người chịu trách nhiệm: `fong-gif`

### 🎯 Mục tiêu
Xây dựng phân hệ chỉ đọc (Read-Model) cho các thông tin công cộng và dữ liệu thống kê phục vụ Manager/Visitor trên phân hệ Spring Boot Support API.

### 🛠️ Scope công việc
1. **APIs Công cộng (Public APIs - Không cần Login):**
   - API xem thông tin chung của bãi xe: `/api/public/parking-info` (Tên bãi, hotline, giờ hoạt động...).
   - API xem danh sách vị trí đỗ còn trống: `/api/public/slots/available` (Có filter theo loại xe, tầng).
   - API xem bảng giá đỗ xe hiện hành: `/api/public/pricing`.
   - API xem nội quy bãi xe: `/api/public/rules`.
2. **Khung API Dashboard (Chỉ đọc - Yêu cầu Login MANAGER/ADMIN):**
   - API đếm tổng số lượng slot trống/bận.
3. **Bảo mật và Tích hợp:**
   - Cấu hình JwtDecoder xác thực nghiêm ngặt chữ ký, `iss`, `aud`, và hạn sử dụng của JWT Token được cấp từ .NET Core.

### 📂 Các bảng Database liên quan
- Chỉ thực hiện truy vấn SELECT trên các bảng: `floors`, `areas`, `slots`, `pricing_rules`, `users`, `vehicle_types`.

### ⚙️ Yêu cầu kỹ thuật & Kiến trúc
- **Bắt buộc:** Tất cả Repository kế thừa `ReadOnlyRepository` để ngăn chặn hành vi ghi (INSERT/UPDATE/DELETE).
- Đánh dấu `@Transactional(readOnly = true)` cấp độ Service/Repository để tối ưu hóa truy vấn.
- Đọc thông tin kết nối DB và JWT cấu hình thông qua biến môi trường của hệ thống.

### ✅ Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] APIs hoạt động bình thường trên cổng `8080` (hoặc cổng cấu hình).
- [ ] Gửi token JWT không hợp lệ (hết hạn, sai chữ ký) lên `/auth-check` phải bị chặn 401.
- [ ] Chạy kiểm thử tự động `mvn clean test` thành công 100%.
- [ ] Kiểm tra phân hệ Spring Boot không có bất kỳ dòng code nào cố ghi dữ liệu vào DB.

### 💻 HƯỚNG DẪN KỸ THUẬT CHI TIẾT (Dành cho Lập trình viên Spring Boot - fong-gif)

#### 📂 Bước 1: Khai báo Entities đọc dữ liệu (Read Entities)
Các entity trong Spring Boot chỉ ánh xạ bảng để đọc dữ liệu. Tạo mới/cập nhật các file trong thư mục: `backend/parking-building-support-api/src/main/java/com/parkingbuilding/support/sharedreadmodel/entity/`

Đảm bảo các class được đánh dấu `@Entity` và các thuộc tính tương thích với cấu trúc của database PostgreSQL hiện có (sử dụng `@Column(name = "column_name")`).

#### 📂 Bước 2: Tạo các Repository chỉ đọc (Read-Only Repositories)
Tạo các repository trong thư mục: `backend/parking-building-support-api/src/main/java/com/parkingbuilding/support/sharedreadmodel/repository/`

**Quy tắc bắt buộc:** Kế thừa từ `ReadOnlyRepository` (đã được tạo sẵn ở bước sửa lỗi trước) thay vì `JpaRepository` thông thường. Điều này giúp ngăn ngừa hoàn toàn các hàm ghi (save, delete).

##### 📝 Ví dụ mẫu: `SlotReadRepository.java`
```java
package com.parkingbuilding.support.sharedreadmodel.repository;

import com.parkingbuilding.support.sharedreadmodel.entity.SlotReadEntity;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SlotReadRepository extends ReadOnlyRepository<SlotReadEntity, Long> {
    // Tự sinh truy vấn động lấy các slot theo trạng thái (AVAILABLE/OCCUPIED)
    List<SlotReadEntity> findByStatus(String status);
    
    // Đếm số lượng slot trống
    long countByStatus(String status);
}
```
*(Tương tự, tạo/sửa các Repository khác: `FloorReadRepository`, `AreaReadRepository`, `PricingRuleReadRepository`).*

#### 📂 Bước 3: Viết các API Controllers
Tạo các file REST Controller cung cấp các endpoint dữ liệu.

##### 🌐 1. APIs công cộng (Không cần đăng nhập)
Tạo file: `backend/parking-building-support-api/src/main/java/com/parkingbuilding/support/publicapi/PublicParkingController.java`
```java
package com.parkingbuilding.support.publicapi;

import com.parkingbuilding.support.sharedreadmodel.repository.SlotReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.PricingRuleReadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*") // Hỗ trợ gọi từ Frontend khác port
public class PublicParkingController {

    @Autowired
    private SlotReadRepository slotRepository;

    @Autowired
    private PricingRuleReadRepository pricingRepository;

    // 1. Xem thông tin bãi xe
    @GetMapping("/parking-info")
    public Map<String, Object> getParkingInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("name", "Parking Building Center");
        info.put("address", "123 Street, District 9, HCM City");
        info.put("status", "OPEN");
        info.put("openingHours", "00:00 - 24:00");
        info.put("hotline", "1900-5678");
        return info;
    }

    // 2. Xem các vị trí đỗ xe còn trống
    @GetMapping("/slots/available")
    public Map<String, Object> getAvailableSlots() {
        Map<String, Object> res = new HashMap<>();
        res.put("totalAvailable", slotRepository.countByStatus("AVAILABLE"));
        res.put("slots", slotRepository.findByStatus("AVAILABLE"));
        return res;
    }

    // 3. Xem bảng giá đỗ xe hiện hành
    @GetMapping("/pricing")
    public Map<String, Object> getPricing() {
        Map<String, Object> res = new HashMap<>();
        res.put("pricingRules", pricingRepository.findAll()); // Hãy viết phương thức findAll() trong ReadOnlyRepository hoặc Custom Query nếu cần
        return res;
    }

    // 4. Xem nội quy bãi đỗ xe
    @GetMapping("/rules")
    public Map<String, Object> getRules() {
        Map<String, Object> rules = new HashMap<>();
        rules.put("lostCardFee", "50,000 VND");
        rules.put("notes", "Yêu cầu khóa xe cẩn thận, không để tài sản quý giá trong xe. Mất thẻ vui lòng liên hệ nhân viên.");
        return rules;
    }
}
```

##### 📊 2. API Dashboard cho Manager (Yêu cầu Đăng nhập)
Tạo file: `backend/parking-building-support-api/src/main/java/com/parkingbuilding/support/dashboard/DashboardController.java`
```java
package com.parkingbuilding.support.dashboard;

import com.parkingbuilding.support.sharedreadmodel.repository.SlotReadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/support/dashboard")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')") // Chỉ cho phép ADMIN hoặc MANAGER truy cập
public class DashboardController {

    @Autowired
    private SlotReadRepository slotRepository;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSlotsAvailable", slotRepository.countByStatus("AVAILABLE"));
        stats.put("totalSlotsOccupied", slotRepository.countByStatus("OCCUPIED"));
        stats.put("totalSlotsReserved", slotRepository.countByStatus("RESERVED"));
        return stats;
    }
}
```

#### 📂 Bước 4: Kiểm tra cấu hình Bảo mật (JWT Token)
* Đảm bảo file cấu hình Spring Security `SecurityConfig.java` bảo vệ chính xác các endpoint dashboard: `/api/support/dashboard/**` yêu cầu xác thực JWT.
* Các endpoint `/api/public/**` được cấu hình `.permitAll()` (không yêu cầu đăng nhập).
* Phân hệ Spring Boot sẽ tự động giải mã JWT Token do .NET Core phát sinh, trích xuất Claims (userId, username, role) và kiểm soát vai trò dựa trên claim `role`.

#### 🧪 Bước 5: Kiểm tra (Testing)
1. Cấu hình biến môi trường kết nối database trên IDE của bạn (DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET).
2. Chạy thử ứng dụng Spring Boot trên cổng `8080`.
3. Sử dụng Postman để kiểm tra các public và dashboard APIs.
4. Chạy kiểm thử tự động của dự án: `mvn clean test`
