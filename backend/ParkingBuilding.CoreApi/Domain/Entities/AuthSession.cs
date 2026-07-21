using System;

namespace ParkingBuilding.CoreApi.Domain.Entities;

public class AuthSession
{
    public Guid Id { get; set; }
    public long UserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public string? CreatedByIp { get; set; }
    public string? RevokedByIp { get; set; }
    public string? RevocationReason { get; set; }
}
