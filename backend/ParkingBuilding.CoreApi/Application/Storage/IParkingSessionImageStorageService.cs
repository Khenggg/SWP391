namespace ParkingBuilding.CoreApi.Application.Storage;

public interface IParkingSessionImageStorageService
{
    Task<string> StoreAsync(
        string imageSource,
        long sessionId,
        string phase,
        string imageKind,
        CancellationToken ct = default);
}
