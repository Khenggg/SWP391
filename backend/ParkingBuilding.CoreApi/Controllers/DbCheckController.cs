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

        List<string> auditLogColumns = new List<string>();
        List<object> sampleAuditLogs = new List<object>();
        try
        {
            var connection = dbContext.Database.GetDbConnection();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT column_name FROM information_schema.columns WHERE table_name = 'audit_logs';";
                if (connection.State != System.Data.ConnectionState.Open)
                {
                    await connection.OpenAsync(cancellationToken);
                }
                using (var reader = await command.ExecuteReaderAsync(cancellationToken))
                {
                    while (await reader.ReadAsync(cancellationToken))
                    {
                        auditLogColumns.Add(reader.GetString(0));
                    }
                }
            }
            auditLogsCount = await dbContext.AuditLogs.CountAsync(cancellationToken);
            var logs = await dbContext.AuditLogs
                .OrderByDescending(a => a.Id)
                .Take(5)
                .ToListAsync(cancellationToken);
            
            foreach (var log in logs)
            {
                sampleAuditLogs.Add(new
                {
                    log.Id,
                    log.ActorUserId,
                    log.SourceService,
                    log.Action,
                    log.TargetType,
                    log.TargetId,
                    log.OldValue,
                    log.NewValue,
                    log.Reason,
                    log.CreatedAt
                });
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "EF Core AuditLog mapping check failed.");
            auditMappingError = ex.Message;
        }

        logger.LogInformation(
            "Manual Supabase PostgreSQL check successful. Database: {DatabaseName}; User: {UserName}. Columns: {Columns}",
            result.DatabaseName,
            result.UserName,
            string.Join(", ", auditLogColumns));

        bool isMappingSuccessful = userMappingError == null && auditMappingError == null;

        var claims = new List<object>();
        if (User.Identity?.IsAuthenticated == true)
        {
            foreach (var claim in User.Claims)
            {
                claims.Add(new { Type = claim.Type, Value = claim.Value });
            }
        }

        var responseData = new
        {
            provider = "Supabase PostgreSQL",
            result.DatabaseName,
            result.UserName,
            result.PostgreSqlVersion,
            claims,
            efCoreVerification = new
            {
                success = isMappingSuccessful,
                usersCount,
                auditLogsCount,
                auditLogColumns,
                sampleAuditLogs,
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

