using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Infrastructure.Persistence.Diagnostics;
using System.Linq;
using ParkingBuilding.CoreApi.Infrastructure.Middleware;
using ParkingBuilding.CoreApi.Contracts.Common;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Infrastructure.Security;

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
builder.Services.AddSingleton<JwtTokenGenerator>();

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            var response = ApiResponse.FailureResult("Validation failed", errors);
            return new BadRequestObjectResult(response);
        };
    });

// 3. Kich hoat dich vu OpenAPI va Swagger UI cho .NET 10
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseMiddleware<GlobalExceptionMiddleware>();

// =====================================================================================
// THÊM VÀO ĐÂY: Đoạn mã tự động kiểm tra kết nối Database khi khởi chạy ứng dụng (Bước 8)
// =====================================================================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ParkingDbContext>();
        if (context.Database.CanConnect())
        {
            Console.WriteLine("\n[SUCCESS] ======> ĐÃ KẾT NỐI ĐẾN POSTGRESQL/SUPABASE DATABASE THÀNH CÔNG! <======\n");
        }
        else
        {
            Console.WriteLine("\n[FAILURE] ======> KẾT NỐI DATABASE THẤT BẠI! Vui lòng kiểm tra lại Connection String. <======\n");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"\n[ERROR] ======> LỖI KHI KHỞI TẠO HOẶC KẾT NỐI DATABASE: {ex.Message} <======\n");
    }
}
// =====================================================================================

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