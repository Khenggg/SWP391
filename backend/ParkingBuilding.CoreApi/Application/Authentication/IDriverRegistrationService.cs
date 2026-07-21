using System.Threading.Tasks;
using ParkingBuilding.CoreApi.Contracts.Requests;

namespace ParkingBuilding.CoreApi.Application.Authentication;

public interface IDriverRegistrationService
{
    Task<DriverRegistrationResult> RegisterAsync(RegisterRequest request, string? ipAddress);
}

public sealed record DriverRegistrationResult(
    long UserId,
    long DriverProfileId,
    string FullName,
    string Username,
    string Email,
    string Phone,
    string Role,
    string Status,
    System.DateTimeOffset CreatedAt);
