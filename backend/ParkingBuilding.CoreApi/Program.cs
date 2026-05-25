using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình chính sách CORS để ứng dụng React kết nối không bị chặn
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();

// 2. Kích hoạt dịch vụ OpenAPI và Swagger UI cho .NET 10
builder.Services.AddOpenApi(); 
builder.Services.AddEndpointsApiExplorer(); 
builder.Services.AddSwaggerGen(); 

var app = builder.Build();

// Đảm bảo Swagger VÀ các môi trường local luôn bật trong lúc setup/test nền tảng
// Bạn có thể để bên ngoài hoặc giữ IsDevelopment nhưng phải chạy đúng lệnh ở Bước 3
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.MapOpenApi(); 
    app.UseSwagger();   
    app.UseSwaggerUI(options =>
    {
        // Cấu hình endpoint Swagger UI trỏ đúng file JSON đặc tả của OpenAPI
        options.SwaggerEndpoint("/openapi/v1.json", "ParkingBuilding Core API v1");
        options.RoutePrefix = "swagger"; // Đường dẫn truy cập sẽ là /swagger
    });
}

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();