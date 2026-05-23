using System.Data.Common;
using Microsoft.EntityFrameworkCore;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Diagnostics;

public sealed record SupabaseConnectionResult(
    bool Success,
    string? DatabaseName,
    string? UserName,
    string? PostgreSqlVersion,
    string? ErrorMessage);

public static class SupabaseConnectionProbe
{
    public static bool IsConfigured(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        return !string.IsNullOrWhiteSpace(connectionString) &&
               !connectionString.Contains("__SET_WITH_USER_SECRETS__", StringComparison.OrdinalIgnoreCase);
    }

    public static async Task<SupabaseConnectionResult> CheckAsync(
        ParkingDbContext dbContext,
        CancellationToken cancellationToken)
    {
        try
        {
            var connection = dbContext.Database.GetDbConnection();

            await connection.OpenAsync(cancellationToken);

            await using var command = connection.CreateCommand();
            command.CommandText = "select current_database(), current_user, version();";

            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            if (!await reader.ReadAsync(cancellationToken))
            {
                return new SupabaseConnectionResult(false, null, null, null, "Database check query returned no rows.");
            }

            return new SupabaseConnectionResult(
                true,
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                null);
        }
        catch (Exception ex) when (ex is DbException or InvalidOperationException or TimeoutException)
        {
            return new SupabaseConnectionResult(false, null, null, null, ex.Message);
        }
    }
}
