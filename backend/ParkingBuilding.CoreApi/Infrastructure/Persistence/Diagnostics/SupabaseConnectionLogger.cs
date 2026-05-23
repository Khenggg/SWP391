using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Diagnostics;

public sealed class SupabaseConnectionLogger(
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<SupabaseConnectionLogger> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (!SupabaseConnectionProbe.IsConfigured(configuration))
        {
            logger.LogWarning(
                "Supabase PostgreSQL connection string is not configured. Set ConnectionStrings:DefaultConnection with dotnet user-secrets or an environment variable.");
            return;
        }

        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ParkingDbContext>();

        var result = await SupabaseConnectionProbe.CheckAsync(dbContext, cancellationToken);
        if (result.Success)
        {
            logger.LogInformation(
                "Supabase PostgreSQL connection successful. Database: {DatabaseName}; User: {UserName}; PostgreSQL: {PostgreSqlVersion}",
                result.DatabaseName,
                result.UserName,
                result.PostgreSqlVersion);
            return;
        }

        logger.LogError("Supabase PostgreSQL connection failed: {ErrorMessage}", result.ErrorMessage);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
