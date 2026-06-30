using System;
using Microsoft.AspNetCore.Http;

namespace ParkingBuilding.CoreApi.Contracts.Common;

public class BusinessException : Exception
{
    public string ErrorCode { get; }
    public int StatusCode { get; }

    public BusinessException(
        string errorCode,
        int statusCode = StatusCodes.Status400BadRequest)
        : base(errorCode)
    {
        ErrorCode = errorCode;
        StatusCode = statusCode;
    }
}
