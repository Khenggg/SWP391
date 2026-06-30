using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Contracts.Common;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace ParkingBuilding.CoreApi.Controllers
{
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        protected IActionResult Success<T>(
            T data,
            string message = "Success",
            int statusCode = StatusCodes.Status200OK)
        {
            var apiResponse = ApiResponse.SuccessResult(
                data,
                message,
                statusCode,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return StatusCode(statusCode, apiResponse);
        }

        protected IActionResult Success(
            string message = "Success",
            int statusCode = StatusCodes.Status200OK)
        {
            var apiResponse = ApiResponse.SuccessResult<object?>(
                null,
                message,
                statusCode,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return StatusCode(statusCode, apiResponse);
        }

        protected IActionResult CreatedSuccess<T>(
            T data,
            string message = "Created successfully")
        {
            var apiResponse = ApiResponse.SuccessResult(
                data,
                message,
                StatusCodes.Status201Created,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return StatusCode(StatusCodes.Status201Created, apiResponse);
        }

        protected IActionResult Failure(
            string message,
            string errorCode,
            int statusCode,
            IEnumerable<string>? errors = null)
        {
            var apiResponse = ApiResponse.FailureResult(
                message,
                errors != null ? new List<string>(errors) : null,
                errorCode,
                statusCode,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return StatusCode(statusCode, apiResponse);
        }

        protected IActionResult BusinessError(
            string errorCode,
            string? message = null,
            int statusCode = StatusCodes.Status400BadRequest)
        {
            var displayMessage = message ?? ErrorMessages.GetMessage(errorCode);
            return Failure(
                message: displayMessage,
                errorCode: errorCode,
                statusCode: statusCode,
                errors: new[] { errorCode }
            );
        }

        // Legacy helper. Do not use in new controllers; prefer Success<T>(..., statusCode) or CreatedSuccess<T>.
        protected OkObjectResult Success<T>(T data, string message)
        {
            var apiResponse = ApiResponse.SuccessResult(
                data,
                message,
                StatusCodes.Status200OK,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return Ok(apiResponse);
        }

        // Legacy helper. Do not use in new controllers; prefer Success(message, statusCode).
        protected OkObjectResult Success(string message)
        {
            var apiResponse = ApiResponse.SuccessResult<object?>(
                null,
                message,
                StatusCodes.Status200OK,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return Ok(apiResponse);
        }

        // Legacy helper. Do not use in new controllers; prefer BusinessError or Failure.
        protected BadRequestObjectResult Fail(string message, List<string>? errors = null)
        {
            var apiResponse = ApiResponse.FailureResult(
                message,
                errors,
                ErrorCodes.InvalidRequest,
                StatusCodes.Status400BadRequest,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return BadRequest(apiResponse);
        }

        // Legacy helper. Do not use in new controllers; prefer BusinessError(ErrorCodes.X).
        protected BadRequestObjectResult Fail(string message, string error)
        {
            var errorCode = NormalizeErrorCode(error, StatusCodes.Status400BadRequest);
            var apiResponse = ApiResponse.FailureResult(
                ErrorMessages.GetMessage(errorCode),
                new List<string> { error },
                errorCode,
                StatusCodes.Status400BadRequest,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return BadRequest(apiResponse);
        }

        protected ObjectResult StatusCodeResponse(int statusCode, string message, string error)
        {
            var errorCode = NormalizeErrorCode(error, statusCode);
            var apiResponse = ApiResponse.FailureResult(
                IsErrorCode(error) ? ErrorMessages.GetMessage(errorCode) : message,
                new List<string> { error },
                errorCode,
                statusCode,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return StatusCode(statusCode, apiResponse);
        }

        protected ObjectResult StatusCodeResponse(int statusCode, string message, List<string>? errors = null)
        {
            var apiResponse = ApiResponse.FailureResult(
                message,
                errors,
                DefaultErrorCodeForStatus(statusCode),
                statusCode,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return StatusCode(statusCode, apiResponse);
        }

        private static string NormalizeErrorCode(string value, int statusCode)
        {
            return IsErrorCode(value) ? value : DefaultErrorCodeForStatus(statusCode);
        }

        private static string DefaultErrorCodeForStatus(int statusCode)
        {
            return statusCode switch
            {
                StatusCodes.Status401Unauthorized => ErrorCodes.Unauthorized,
                StatusCodes.Status403Forbidden => ErrorCodes.Forbidden,
                StatusCodes.Status404NotFound => ErrorCodes.NotFound,
                StatusCodes.Status409Conflict => ErrorCodes.Conflict,
                >= StatusCodes.Status500InternalServerError => ErrorCodes.InternalServerError,
                _ => ErrorCodes.InvalidRequest
            };
        }

        private static bool IsErrorCode(string value)
        {
            return !string.IsNullOrWhiteSpace(value)
                && Regex.IsMatch(value, "^[A-Z0-9_]+$");
        }
    }
}
