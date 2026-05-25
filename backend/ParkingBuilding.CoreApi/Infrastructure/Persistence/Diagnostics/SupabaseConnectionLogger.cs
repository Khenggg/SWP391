using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Diagnostics;

public sealed class SupabaseConnectionLogger(
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<SupabaseConnectionLogger> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Dang kiem tra ket noi Supabase PostgreSQL khi khoi dong server...");

        if (!SupabaseConnectionProbe.IsConfigured(configuration))
        {
            logger.LogWarning(
                "KET NOI DATABASE CHUA DUOC CAU HINH. Hay set ConnectionStrings:DefaultConnection trong appsettings.Development.json, dotnet user-secrets, hoac bien moi truong ConnectionStrings__DefaultConnection.");
            return;
        }

        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ParkingDbContext>();

        var result = await SupabaseConnectionProbe.CheckAsync(dbContext, cancellationToken);
        if (result.Success)
        {
            logger.LogInformation(
                "KET NOI DATABASE THANH CONG. Provider: Supabase PostgreSQL; Database: {DatabaseName}; User: {UserName}; PostgreSQL: {PostgreSqlVersion}",
                result.DatabaseName,
                result.UserName,
                result.PostgreSqlVersion);
            return;
        }

        logger.LogError("KET NOI DATABASE THAT BAI. Provider: Supabase PostgreSQL; Error: {ErrorMessage}", result.ErrorMessage);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
