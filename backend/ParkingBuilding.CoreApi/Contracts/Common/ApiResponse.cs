using System;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Contracts.Common
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }
        public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

        public ApiResponse() { }

        public ApiResponse(bool success, string message, T? data = default, List<string>? errors = null)
        {
            Success = success;
            Message = message;
            Data = data;
            Errors = errors;
        }
    }

    public class ApiResponse : ApiResponse<object>
    {
        public ApiResponse() { }

        public ApiResponse(bool success, string message, object? data = null, List<string>? errors = null)
            : base(success, message, data, errors)
        {
        }

        // Factory helpers
        public static ApiResponse<T> SuccessResult<T>(T data, string message = "OK") =>
            new(true, message, data);

        public static ApiResponse SuccessResult(string message = "OK") =>
            new(true, message);

        public static ApiResponse FailureResult(string message, List<string>? errors = null) =>
            new(false, message, errors: errors);

        public static ApiResponse FailureResult(string message, string error) =>
            new(false, message, errors: new List<string> { error });
    }
}
