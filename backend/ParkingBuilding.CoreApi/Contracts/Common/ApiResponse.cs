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
        public int? StatusCode { get; set; }
        public string? ErrorCode { get; set; }
        public string? TraceId { get; set; }
        public string? Path { get; set; }
        public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

        public ApiResponse() { }

        public ApiResponse(
            bool success,
            string message,
            T? data = default,
            List<string>? errors = null,
            int? statusCode = null,
            string? errorCode = null,
            string? traceId = null,
            string? path = null)
        {
            Success = success;
            Message = message;
            Data = data;
            Errors = errors;
            StatusCode = statusCode;
            ErrorCode = errorCode;
            TraceId = traceId;
            Path = path;
        }

        public static ApiResponse<T> SuccessResult(
            T data,
            string message = "OK",
            int? statusCode = null,
            string? traceId = null,
            string? path = null)
        {
            return new ApiResponse<T>(true, message, data, null, statusCode, null, traceId, path);
        }
    }

    public class ApiResponse : ApiResponse<object>
    {
        public ApiResponse() { }

        public ApiResponse(
            bool success,
            string message,
            object? data = null,
            List<string>? errors = null,
            int? statusCode = null,
            string? errorCode = null,
            string? traceId = null,
            string? path = null)
            : base(success, message, data, errors, statusCode, errorCode, traceId, path)
        {
        }

        // Factory helpers
        public static ApiResponse<T> SuccessResult<T>(
            T data,
            string message = "OK",
            int? statusCode = null,
            string? traceId = null,
            string? path = null) =>
            new(true, message, data, null, statusCode, null, traceId, path);

        public static ApiResponse SuccessResult(
            string message = "OK",
            int? statusCode = null,
            string? traceId = null,
            string? path = null) =>
            new(true, message, null, null, statusCode, null, traceId, path);

        public static ApiResponse FailureResult(
            string message,
            List<string>? errors = null,
            string? errorCode = null,
            int? statusCode = null,
            string? traceId = null,
            string? path = null) =>
            new(false, message, null, errors, statusCode, errorCode, traceId, path);

        public static ApiResponse FailureResult(
            string message,
            string error,
            string? errorCode = null,
            int? statusCode = null,
            string? traceId = null,
            string? path = null) =>
            new(false, message, null, new List<string> { error }, statusCode, errorCode, traceId, path);
    }
}
