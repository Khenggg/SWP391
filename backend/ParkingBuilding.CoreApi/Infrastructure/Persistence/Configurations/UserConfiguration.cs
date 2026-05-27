using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Domain.Enums;
using System;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // 1. Map Entity với bảng "users" trong DB
            builder.ToTable("users");

            // 2. Cấu hình Khóa chính và định nghĩa kiểu dữ liệu UUID cụ thể của PostgreSQL
            builder.HasKey(u => u.Id);
            builder.Property(u => u.Id)
                   .HasColumnName("id")
                   .HasColumnType("uuid");

            // 3. Cấu hình các trường thông tin chuỗi văn bản (Đảm bảo độ dài và tính bắt buộc)
            builder.Property(u => u.FullName)
                   .HasColumnName("full_name")
                   .HasColumnType("varchar(255)")
                   .IsRequired();

            builder.Property(u => u.Username)
                   .HasColumnName("username")
                   .HasColumnType("varchar(100)")
                   .IsRequired();

            builder.Property(u => u.Email)
                   .HasColumnName("email")
                   .HasColumnType("varchar(255)")
                   .IsRequired();

            builder.Property(u => u.Phone)
                   .HasColumnName("phone")
                   .HasColumnType("varchar(20)");

            builder.Property(u => u.PasswordHash)
                   .HasColumnName("password_hash")
                   .HasColumnType("text")
                   .IsRequired();

            // 4. Tối ưu hóa chuyển đổi Enum thành String Uppercase an toàn (Bật ignoreCase)
            builder.Property(u => u.Role)
                   .HasColumnName("role")
                   .HasColumnType("varchar(50)")
                   .HasConversion(
                       v => v.ToString(),
                       v => Enum.Parse<UserRole>(v, true)
                   )
                   .IsRequired();

            builder.Property(u => u.Status)
                   .HasColumnName("status")
                   .HasColumnType("varchar(50)")
                   .HasConversion(
                       v => v.ToString(),
                       v => Enum.Parse<UserStatus>(v, true)
                   )
                   .IsRequired();

            // 5. Cấu hình đồng bộ kiểu dữ liệu Thời gian cho PostgreSQL (timestamp)
            builder.Property(u => u.LastLoginAt)
                   .HasColumnName("last_login_at")
                   .HasColumnType("timestamp");

            builder.Property(u => u.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp")
                   .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(u => u.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp")
                   .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}