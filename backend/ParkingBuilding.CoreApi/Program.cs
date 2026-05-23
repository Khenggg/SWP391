using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Infrastructure.Persistence.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ParkingDbContext>((serviceProvider, options) =>
{
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var connectionString = configuration.GetConnectionString("DefaultConnection");

    if (!string.IsNullOrWhiteSpace(connectionString) &&
        !connectionString.Contains("__SET_WITH_USER_SECRETS__", StringComparison.OrdinalIgnoreCase))
    {
        options.UseNpgsql(connectionString);
    }
});

builder.Services.AddHostedService<SupabaseConnectionLogger>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Parking Building Core API v1");
        options.RoutePrefix = "swagger";
    });
}

app.MapControllers();

app.MapGet("/api/core/health", () => Results.Ok(new
{
    status = "ok",
    service = "ParkingBuilding.CoreApi",
    timestampUtc = DateTimeOffset.UtcNow
}))
.WithName("CoreApiHealth")
.WithTags("Health");

app.Run();
