using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Contracts.Common;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Controllers
{
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        protected OkObjectResult Success<T>(T data, string message = "OK")
        {
            return Ok(ApiResponse.SuccessResult(data, message));
        }

        protected OkObjectResult Success(string message = "OK")
        {
            return Ok(ApiResponse.SuccessResult(message));
        }

        protected BadRequestObjectResult Fail(string message, List<string>? errors = null)
        {
            return BadRequest(ApiResponse.FailureResult(message, errors));
        }

        protected BadRequestObjectResult Fail(string message, string error)
        {
            return BadRequest(ApiResponse.FailureResult(message, error));
        }

        protected ObjectResult StatusCodeResponse(int statusCode, string message, string error)
        {
            return StatusCode(statusCode, ApiResponse.FailureResult(message, error));
        }

        protected ObjectResult StatusCodeResponse(int statusCode, string message, List<string>? errors = null)
        {
            return StatusCode(statusCode, ApiResponse.FailureResult(message, errors));
        }
    }
}