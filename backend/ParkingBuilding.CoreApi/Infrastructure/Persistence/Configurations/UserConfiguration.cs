using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Domain.Enums;

namespace ParkingBuilding.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // Map vào đúng bảng 'users' trong PostgreSQL (chữ thường)
            builder.ToTable("users");

            // Cấu hình Khóa chính và map với BIGINT/BIGSERIAL
            builder.HasKey(u => u.Id);
            builder.Property(u => u.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd(); // Tương ứng với BIGSERIAL tự tăng

            // Cấu hình các thuộc tính khớp chính xác tên cột và độ dài mã hóa chữ thường
            builder.Property(u => u.Username)
                   .HasColumnName("username")
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(u => u.Email)
                   .HasColumnName("email")
                   .HasMaxLength(150)
                   .IsRequired(false);

            builder.Property(u => u.Phone)
                   .HasColumnName("phone")
                   .HasMaxLength(30)
                   .IsRequired(false);

            builder.Property(u => u.PasswordHash)
                   .HasColumnName("password_hash")
                   .HasMaxLength(255)
                   .IsRequired();

            builder.Property(u => u.FullName)
                   .HasColumnName("full_name")
                   .HasMaxLength(150)
                   .IsRequired();

            // Mapping Enum thành String trong Postgres VARCHAR
            builder.Property(u => u.Role)
                   .HasColumnName("role")
                   .HasMaxLength(30)
                   .HasConversion<string>()
                   .IsRequired();


            builder.Property(u => u.Status)
                   .HasColumnName("status")
                   .HasMaxLength(30)
                   .HasConversion<string>()
                   .IsRequired();

            // Mapping các trường thời gian với TIMESTAMPTZ
            builder.Property(u => u.LastLoginAt)
                   .HasColumnName("last_login_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired(false);

            builder.Property(u => u.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            builder.Property(u => u.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();
        }
    }
}