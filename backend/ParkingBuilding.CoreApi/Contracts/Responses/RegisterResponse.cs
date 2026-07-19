using System;

namespace ParkingBuilding.CoreApi.Contracts.Responses;

public sealed class RegisterResponse
{
    public long Id { get; set; }
    public long DriverProfileId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = "DRIVER";
    public string Status { get; set; } = "ACTIVE";
    public DateTimeOffset CreatedAt { get; set; }
}
