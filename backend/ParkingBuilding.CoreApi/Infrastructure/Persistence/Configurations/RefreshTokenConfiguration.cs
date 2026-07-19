using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(x => x.TokenHash).HasColumnName("token_hash").HasMaxLength(128).IsRequired();
        builder.HasIndex(x => x.TokenHash).IsUnique();
        builder.Property(x => x.TokenFamilyId).HasColumnName("token_family_id").IsRequired();
        builder.Property(x => x.JwtId).HasColumnName("jwt_id").HasMaxLength(255);
        builder.Property(x => x.ExpiresAt).HasColumnName("expires_at").HasColumnType("timestamp with time zone").IsRequired();
        builder.Property(x => x.RevokedAt).HasColumnName("revoked_at").HasColumnType("timestamp with time zone");
        builder.Property(x => x.ReplacedByTokenHash).HasColumnName("replaced_by_token_hash").HasMaxLength(128);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone").IsRequired();
        builder.Property(x => x.CreatedByIp).HasColumnName("created_by_ip").HasMaxLength(100);
        builder.Property(x => x.RevokedByIp).HasColumnName("revoked_by_ip").HasMaxLength(100);
        builder.Property(x => x.RevocationReason).HasColumnName("revocation_reason").HasMaxLength(255);
    }
}
