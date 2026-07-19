namespace ParkingBuilding.CoreApi.Application.Authentication;

public interface IRegistrationRateLimiter
{
    bool TryAllow(string? ipAddress);
}
