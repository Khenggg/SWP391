using System;

namespace ParkingBuilding.CoreApi.Domain.Entities;

public class RevokedAccessToken
{
    public Guid Id { get; set; }
    public string JwtId { get; set; } = string.Empty;
    public long UserId { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset RevokedAt { get; set; }
    public string? Reason { get; set; }
}
