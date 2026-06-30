using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using ParkingBuilding.CoreApi.Contracts.Common;

namespace ParkingBuilding.CoreApi.Infrastructure.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex, context.TraceIdentifier, context.Request.Path);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception, string traceId, string path)
        {
            var (statusCode, errorCode) = MapException(exception);
            var message = ErrorMessages.GetMessage(errorCode);

            LogException(exception, statusCode, errorCode, traceId, path);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var response = ApiResponse.FailureResult(
                message: message,
                errors: new List<string> { errorCode },
                errorCode: errorCode,
                statusCode: (int)statusCode,
                traceId: traceId,
                path: path
            );

            var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(json);
        }

        private static (HttpStatusCode StatusCode, string ErrorCode) MapException(Exception exception)
        {
            return exception switch
            {
                BusinessException businessException => ((HttpStatusCode)businessException.StatusCode, businessException.ErrorCode),
                UnauthorizedAccessException => (HttpStatusCode.Unauthorized, ErrorCodes.Unauthorized),
                KeyNotFoundException keyNotFoundException => (HttpStatusCode.NotFound, GetErrorCodeOrFallback(keyNotFoundException.Message, ErrorCodes.NotFound)),
                ArgumentException argumentException => (HttpStatusCode.BadRequest, GetErrorCodeOrFallback(argumentException.Message, ErrorCodes.InvalidRequest)),
                InvalidOperationException invalidOperationException => (HttpStatusCode.BadRequest, GetErrorCodeOrFallback(invalidOperationException.Message, ErrorCodes.InvalidRequest)),
                _ => (HttpStatusCode.InternalServerError, ErrorCodes.InternalServerError)
            };
        }

        private static string GetErrorCodeOrFallback(string value, string fallback)
            => IsErrorCode(value) ? value : fallback;

        private static bool IsErrorCode(string value)
            => !string.IsNullOrWhiteSpace(value)
                && Regex.IsMatch(value, "^[A-Z0-9_]+$");

        private void LogException(Exception exception, HttpStatusCode statusCode, string errorCode, string traceId, string path)
        {
            if ((int)statusCode >= StatusCodes.Status500InternalServerError)
            {
                _logger.LogError(exception, "Unhandled system exception. ErrorCode={ErrorCode}, TraceId={TraceId}, Path={Path}", errorCode, traceId, path);
                return;
            }

            _logger.LogWarning(exception, "Handled API exception. StatusCode={StatusCode}, ErrorCode={ErrorCode}, TraceId={TraceId}, Path={Path}", (int)statusCode, errorCode, traceId, path);
        }
    }
}
