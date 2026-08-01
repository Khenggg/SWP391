using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Snapshots;

public interface IParkingImageSnapshotService
{
    Task<ParkingImageSnapshotResponse> CreateAsync(
        CreateParkingImageSnapshotRequest request,
        long uploadedBy,
        CancellationToken ct = default);

    Task<ParkingSessionImage> PromoteAsync(
        PromoteParkingImageSnapshotCommand command,
        CancellationToken ct = default);
}
