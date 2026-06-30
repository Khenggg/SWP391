using System;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public interface IMonthlyEntryTokenService
    {
        string CreateToken(MonthlyEntryTokenPayload payload);
        MonthlyEntryTokenPayload VerifyToken(string token);
    }
}
