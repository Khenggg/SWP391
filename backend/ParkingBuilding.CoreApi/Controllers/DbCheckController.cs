using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Infrastructure.Persistence.Diagnostics;

namespace ParkingBuilding.CoreApi.Controllers;

[ApiController]
[Route("api/core/db-check")]
public sealed class DbCheckController(
    ParkingDbContext dbContext,
    IConfiguration configuration,
    ILogger<DbCheckController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Check(CancellationToken cancellationToken)
    {
        if (!SupabaseConnectionProbe.IsConfigured(configuration))
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "not_configured",
                message = "Set ConnectionStrings:DefaultConnection with dotnet user-secrets or an environment variable."
            });
        }

        var result = await SupabaseConnectionProbe.CheckAsync(dbContext, cancellationToken);
        if (!result.Success)
        {
            logger.LogError("Manual Supabase PostgreSQL check failed: {ErrorMessage}", result.ErrorMessage);

            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "failed",
                result.ErrorMessage
            });
        }

        logger.LogInformation(
            "Manual Supabase PostgreSQL check successful. Database: {DatabaseName}; User: {UserName}",
            result.DatabaseName,
            result.UserName);

        return Ok(new
        {
            status = "connected",
            provider = "Supabase PostgreSQL",
            result.DatabaseName,
            result.UserName,
            result.PostgreSqlVersion,
            checkedAtUtc = DateTimeOffset.UtcNow
        });
    }
}
