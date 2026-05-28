using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Infrastructure.Persistence.Diagnostics;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Controllers;

[ApiController]
[Route("api/core/db-check")]
public sealed class DbCheckController(
    ParkingDbContext dbContext,
    IConfiguration configuration,
    ILogger<DbCheckController> logger) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> Check(CancellationToken cancellationToken)
    {
        if (!SupabaseConnectionProbe.IsConfigured(configuration))
        {
            return StatusCodeResponse(
                StatusCodes.Status503ServiceUnavailable,
                "Database configuration is missing.",
                "Set ConnectionStrings:DefaultConnection with dotnet user-secrets or an environment variable."
            );
        }

        var result = await SupabaseConnectionProbe.CheckAsync(dbContext, cancellationToken);
        if (!result.Success)
        {
            logger.LogError("Manual Supabase PostgreSQL check failed: {ErrorMessage}", result.ErrorMessage);

            return StatusCodeResponse(
                StatusCodes.Status503ServiceUnavailable,
                "Database connection check failed.",
                result.ErrorMessage ?? "Unknown connection error"
            );
        }

        // EF Core mapping and query check
        int usersCount = 0;
        int auditLogsCount = 0;
        object? sampleUser = null;
        string? userMappingError = null;
        string? auditMappingError = null;

        try
        {
            usersCount = await dbContext.Users.CountAsync(cancellationToken);
            var firstUser = await dbContext.Users.OrderBy(u => u.Id).FirstOrDefaultAsync(cancellationToken);
            if (firstUser != null)
            {
                sampleUser = new
                {
                    firstUser.Id,
                    firstUser.Username,
                    firstUser.Email,
                    firstUser.FullName,
                    firstUser.Role,
                    firstUser.Status,
                    firstUser.Phone,
                    firstUser.LastLoginAt,
                    firstUser.CreatedAt,
                    firstUser.UpdatedAt
                };
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "EF Core User mapping check failed.");
            userMappingError = ex.Message;
        }

        try
        {
            auditLogsCount = await dbContext.AuditLogs.CountAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "EF Core AuditLog mapping check failed.");
            auditMappingError = ex.Message;
        }

        logger.LogInformation(
            "Manual Supabase PostgreSQL check successful. Database: {DatabaseName}; User: {UserName}",
            result.DatabaseName,
            result.UserName);

        bool isMappingSuccessful = userMappingError == null && auditMappingError == null;

        var responseData = new
        {
            provider = "Supabase PostgreSQL",
            result.DatabaseName,
            result.UserName,
            result.PostgreSqlVersion,
            efCoreVerification = new
            {
                success = isMappingSuccessful,
                usersCount,
                auditLogsCount,
                sampleUser,
                userMappingError,
                auditMappingError
            }
        };

        if (!isMappingSuccessful)
        {
            var errors = new List<string>();
            if (userMappingError != null) errors.Add($"User Mapping: {userMappingError}");
            if (auditMappingError != null) errors.Add($"AuditLog Mapping: {auditMappingError}");
            return StatusCodeResponse(
                StatusCodes.Status500InternalServerError,
                "EF Core mapping validation failed.",
                errors
            );
        }

        return Success(responseData, "Connected and verified EF Core mappings successfully.");
    }
}

