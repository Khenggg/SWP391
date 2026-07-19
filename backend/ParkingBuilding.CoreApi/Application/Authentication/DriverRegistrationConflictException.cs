using Microsoft.AspNetCore.Http;
using ParkingBuilding.CoreApi.Contracts.Common;

namespace ParkingBuilding.CoreApi.Application.Authentication;

public sealed class DriverRegistrationConflictException : BusinessException
{
    public DriverRegistrationConflictException(string errorCode)
        : base(errorCode, StatusCodes.Status409Conflict)
    {
    }
}
