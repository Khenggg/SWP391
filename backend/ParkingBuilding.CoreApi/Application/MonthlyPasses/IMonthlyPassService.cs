using System;
using System.Threading.Tasks;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public interface IMonthlyPassService
    {
        Task<MonthlyPass> CreateMonthlyPassAsync(CreateMonthlyPassRequest request, long userId);
        Task<MonthlyPass> UpdateMonthlyPassAsync(long id, UpdateMonthlyPassRequest request, long userId);
        Task<MonthlyPass> RenewAsync(long id, RenewMonthlyPassRequest request, long userId);
        Task<MonthlyPass> ChangeStatusAsync(long id, string status, long userId);
        Task<MonthlyPass?> FindValidPassAsync(string plateNumber, long vehicleTypeId, DateTimeOffset time);
        bool IsValid(MonthlyPass pass, DateTimeOffset time);
    }
}
