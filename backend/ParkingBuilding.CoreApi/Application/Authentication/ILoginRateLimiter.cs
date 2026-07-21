namespace ParkingBuilding.CoreApi.Application.Authentication;

public interface ILoginRateLimiter
{
    bool TryAllow(string username, string? ipAddress);
    void RegisterFailure(string username, string? ipAddress);
    void Reset(string username, string? ipAddress);
}
