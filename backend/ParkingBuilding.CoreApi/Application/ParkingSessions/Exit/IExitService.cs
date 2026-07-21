
using System;
using System.Threading.Tasks;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Exit
{
    public interface IExitService
    {
        Task<ParkingSession> FindActiveSessionByCardCodeAsync(string cardCode);
        Task<ExitResponse> CompleteCasualExitAsync(long sessionId, ExitRequest request, long staffId);
        Task<ParkingSession> FindActiveSessionByPlateAsync(string plateNumber, long vehicleTypeId);
        
        Task<ExitResponse> CompleteMonthlyPassExitAsync(long sessionId, MonthlyPassExitRequest request, long staffId);

    }
}

