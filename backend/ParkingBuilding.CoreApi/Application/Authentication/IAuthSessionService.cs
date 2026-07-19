using System;
using System.Threading.Tasks;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Application.Authentication;

public interface IAuthSessionService
{
    Task<AuthTokenPair> CreateSessionAsync(User user, string? ipAddress);
    Task<AuthTokenPair> RefreshAsync(string rawRefreshToken, string? ipAddress);
    Task RevokeCurrentSessionAsync(long userId, Guid? sessionId, string? jwtId, DateTimeOffset accessTokenExpiresAt, string? ipAddress);
    Task<bool> IsAccessTokenRevokedAsync(string? jwtId, Guid? sessionId);
    Task<bool> IsUserActiveAsync(long userId);
}

public sealed record AuthTokenPair(
    string AccessToken,
    string RefreshToken,
    int ExpiresIn,
    Guid SessionId,
    string JwtId);
