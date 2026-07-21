using System;
using System.Data;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Domain.Enums;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Infrastructure.Security;

namespace ParkingBuilding.CoreApi.Application.Authentication;

public class AuthSessionService : IAuthSessionService
{
    private readonly ParkingDbContext _context;
    private readonly JwtTokenGenerator _jwtTokenGenerator;
    private readonly IConfiguration _configuration;

    public AuthSessionService(
        ParkingDbContext context,
        JwtTokenGenerator jwtTokenGenerator,
        IConfiguration configuration)
    {
        _context = context;
        _jwtTokenGenerator = jwtTokenGenerator;
        _configuration = configuration;
    }

    public async Task<AuthTokenPair> CreateSessionAsync(User user, string? ipAddress)
    {
        var now = DateTimeOffset.UtcNow;
        var sessionId = Guid.NewGuid();
        var sessionExpiresAt = now.AddDays(GetRefreshTokenDays());
        var rawRefreshToken = GenerateRefreshToken();
        var refreshTokenHash = HashToken(rawRefreshToken);
        var accessToken = _jwtTokenGenerator.GenerateToken(user, sessionId, out var jwtId);

        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

            _context.AuthSessions.Add(new AuthSession
            {
                Id = sessionId,
                UserId = user.Id,
                CreatedAt = now,
                ExpiresAt = sessionExpiresAt,
                CreatedByIp = ipAddress
            });

            _context.RefreshTokens.Add(new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TokenHash = refreshTokenHash,
                TokenFamilyId = sessionId,
                JwtId = jwtId,
                ExpiresAt = sessionExpiresAt,
                CreatedAt = now,
                CreatedByIp = ipAddress
            });

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new AuthTokenPair(
                accessToken,
                rawRefreshToken,
                _jwtTokenGenerator.GetExpirationSeconds(),
                sessionId,
                jwtId);
        });
    }

    public async Task<AuthTokenPair> RefreshAsync(string rawRefreshToken, string? ipAddress)
    {
        if (string.IsNullOrWhiteSpace(rawRefreshToken))
        {
            throw new BusinessException(ErrorCodes.AuthRefreshTokenRequired);
        }

        var now = DateTimeOffset.UtcNow;
        var tokenHash = HashToken(rawRefreshToken);

        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

            var storedToken = await _context.RefreshTokens
                .SingleOrDefaultAsync(token => token.TokenHash == tokenHash);

            if (storedToken == null)
            {
                throw new BusinessException(ErrorCodes.AuthRefreshTokenInvalid);
            }

            var session = await _context.AuthSessions
                .SingleOrDefaultAsync(item => item.Id == storedToken.TokenFamilyId);

            if (storedToken.RevokedAt.HasValue)
            {
                await RevokeFamilyAsync(storedToken.TokenFamilyId, now, ipAddress, "REFRESH_TOKEN_REUSE");
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                throw new BusinessException(ErrorCodes.AuthRefreshTokenInvalid);
            }

            if (session == null || session.RevokedAt.HasValue || storedToken.ExpiresAt <= now)
            {
                throw new BusinessException(ErrorCodes.AuthRefreshTokenInvalid);
            }

            var user = await _context.Users.SingleOrDefaultAsync(item => item.Id == storedToken.UserId);
            if (user == null || user.DeletedAt.HasValue || user.Status != UserStatus.ACTIVE)
            {
                throw new BusinessException(ErrorCodes.AuthUserInactive, 403);
            }

            var replacementRawToken = GenerateRefreshToken();
            var replacementHash = HashToken(replacementRawToken);
            var accessToken = _jwtTokenGenerator.GenerateToken(user, storedToken.TokenFamilyId, out var jwtId);

            storedToken.RevokedAt = now;
            storedToken.RevokedByIp = ipAddress;
            storedToken.RevocationReason = "ROTATED";
            storedToken.ReplacedByTokenHash = replacementHash;

            _context.RefreshTokens.Add(new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TokenHash = replacementHash,
                TokenFamilyId = storedToken.TokenFamilyId,
                JwtId = jwtId,
                ExpiresAt = session.ExpiresAt,
                CreatedAt = now,
                CreatedByIp = ipAddress
            });

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new AuthTokenPair(
                accessToken,
                replacementRawToken,
                _jwtTokenGenerator.GetExpirationSeconds(),
                storedToken.TokenFamilyId,
                jwtId);
        });
    }

    public async Task RevokeCurrentSessionAsync(
        long userId,
        Guid? sessionId,
        string? jwtId,
        DateTimeOffset accessTokenExpiresAt,
        string? ipAddress)
    {
        var now = DateTimeOffset.UtcNow;
        var strategy = _context.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

            if (sessionId.HasValue)
            {
                var session = await _context.AuthSessions
                    .SingleOrDefaultAsync(item => item.Id == sessionId.Value && item.UserId == userId);

                if (session != null && !session.RevokedAt.HasValue)
                {
                    session.RevokedAt = now;
                    session.RevokedByIp = ipAddress;
                    session.RevocationReason = "LOGOUT";
                }

                await RevokeFamilyAsync(sessionId.Value, now, ipAddress, "LOGOUT");
            }

            if (!string.IsNullOrWhiteSpace(jwtId))
            {
                var alreadyRevoked = await _context.RevokedAccessTokens
                    .AnyAsync(item => item.JwtId == jwtId);

                if (!alreadyRevoked)
                {
                    _context.RevokedAccessTokens.Add(new RevokedAccessToken
                    {
                        Id = Guid.NewGuid(),
                        JwtId = jwtId,
                        UserId = userId,
                        ExpiresAt = accessTokenExpiresAt,
                        RevokedAt = now,
                        Reason = "LOGOUT"
                    });
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        });
    }

    public Task<bool> IsAccessTokenRevokedAsync(string? jwtId, Guid? sessionId)
    {
        return IsAccessTokenRevokedInternalAsync(jwtId, sessionId);
    }

    public async Task<bool> IsUserActiveAsync(long userId)
    {
        return await _context.Users
            .AsNoTracking()
            .AnyAsync(user => user.Id == userId && !user.DeletedAt.HasValue && user.Status == UserStatus.ACTIVE);
    }

    private async Task<bool> IsAccessTokenRevokedInternalAsync(string? jwtId, Guid? sessionId)
    {
        if (!string.IsNullOrWhiteSpace(jwtId) && await _context.RevokedAccessTokens.AnyAsync(item => item.JwtId == jwtId))
        {
            return true;
        }

        return sessionId.HasValue && await _context.AuthSessions
            .AsNoTracking()
            .AnyAsync(item => item.Id == sessionId.Value && item.RevokedAt.HasValue);
    }

    private async Task RevokeFamilyAsync(Guid sessionId, DateTimeOffset now, string? ipAddress, string reason)
    {
        var session = await _context.AuthSessions.SingleOrDefaultAsync(item => item.Id == sessionId);
        if (session != null && !session.RevokedAt.HasValue)
        {
            session.RevokedAt = now;
            session.RevokedByIp = ipAddress;
            session.RevocationReason = reason;
        }

        var tokens = await _context.RefreshTokens
            .Where(item => item.TokenFamilyId == sessionId && !item.RevokedAt.HasValue)
            .ToListAsync();

        foreach (var token in tokens)
        {
            token.RevokedAt = now;
            token.RevokedByIp = ipAddress;
            token.RevocationReason = reason;
        }
    }

    private int GetRefreshTokenDays()
    {
        return int.TryParse(_configuration["Jwt:RefreshTokenDays"], out var days) && days > 0
            ? days
            : 30;
    }

    private static string GenerateRefreshToken()
    {
        return Base64UrlEncoder.Encode(RandomNumberGenerator.GetBytes(64));
    }

    private static string HashToken(string token)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();
    }
}
