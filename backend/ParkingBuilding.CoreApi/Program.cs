using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Infrastructure.Persistence.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// 1. Cau hinh chinh sach CORS de ung dung React ket noi khong bi chan
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 2. Lay Connection String tu appsettings/user-secrets/env va cau hinh DbContext ket noi Supabase
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? string.Empty;

builder.Services.AddDbContext<ParkingDbContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3);
        npgsqlOptions.CommandTimeout(30);
    }));
builder.Services.AddHostedService<SupabaseConnectionLogger>();

builder.Services.AddControllers();

// 3. Kich hoat dich vu OpenAPI va Swagger UI cho .NET 10
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 4. Bat Swagger UI cho tat ca cac moi truong local test nen tang
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        // Cau hinh endpoint Swagger UI tro dung file JSON dac ta cua OpenAPI
        options.SwaggerEndpoint("/openapi/v1.json", "ParkingBuilding Core API v1");
        options.RoutePrefix = "swagger"; // Duong dan truy cap se la /swagger
    });
}

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
