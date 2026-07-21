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
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Application.Authentication;
using Microsoft.OpenApi;
using System.IdentityModel.Tokens.Jwt;

// Import đúng namespace chứa các Service
using ParkingBuilding.CoreApi.Application.ParkingStructure.Floors;
using ParkingBuilding.CoreApi.Application.ParkingStructure.Areas;
using ParkingBuilding.CoreApi.Application.ParkingStructure.Slots;
using ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion;
using ParkingBuilding.CoreApi.Application.ParkingSessions.Admin;

// THÊM DÒNG NÀY: Để nhận diện lớp dịch vụ vào bãi xe
using ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;
using ParkingBuilding.CoreApi.Application.Reservations;
using ParkingBuilding.CoreApi.Application.MonthlyPasses;
using ParkingBuilding.CoreApi.Application.Payments;
using ParkingBuilding.CoreApi.Application.Storage;
using ParkingBuilding.CoreApi.Application.LostCards;
using ParkingBuilding.CoreApi.Application.Mismatch;
using ParkingBuilding.CoreApi.Application.LostCards.Documents;
using ParkingBuilding.CoreApi.Application.ParkingSessions.Exit;
using ParkingBuilding.CoreApi.Infrastructure.Configuration;

LocalEnvironmentFile.LoadIfPresent(Directory.GetCurrentDirectory());
var builder = WebApplication.CreateBuilder(args);

var allowedOrigins = (builder.Configuration["CORS_ALLOWED_ORIGINS"]
        ?? "http://localhost:5173,http://127.0.0.1:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

if (allowedOrigins.Length == 0)
{
    throw new InvalidOperationException("CORS_ALLOWED_ORIGINS must contain at least one origin.");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? string.Empty;

builder.Services.AddDbContext<ParkingDbContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3);
        npgsqlOptions.CommandTimeout(30);
    }));

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuditWriterService, AuditWriterService>();
builder.Services.AddScoped<IAuthSessionService, AuthSessionService>();
builder.Services.AddScoped<IDriverRegistrationService, DriverRegistrationService>();
builder.Services.AddSingleton<ILoginRateLimiter, InMemoryLoginRateLimiter>();
builder.Services.AddSingleton<IRegistrationRateLimiter, InMemoryRegistrationRateLimiter>();
builder.Services.AddHostedService<SupabaseConnectionLogger>();
builder.Services.AddSingleton<JwtTokenGenerator>();

// Khai báo quản lý vòng đời (Dependency Injection) cho các Service nghiệp vụ
builder.Services.AddScoped<FloorService>();
builder.Services.AddScoped<AreaService>();
builder.Services.AddScoped<SlotService>();
builder.Services.AddScoped<ILocationSuggestionService, LocationSuggestionService>();
builder.Services.AddScoped<ISuggestionTokenService, SuggestionTokenService>();

// THÊM DÒNG NÀY: Đăng ký interface và implementation xử lý xe vào bãi
builder.Services.AddScoped<IEntryService, EntryService>();

// Register Booking/Reservation services
builder.Services.AddScoped<IReservationEntryTokenService, ReservationEntryTokenService>();
builder.Services.AddScoped<ReservationService>();
builder.Services.AddHostedService<ReservationExpiryWorker>();

// Register Monthly Pass services
builder.Services.AddScoped<IMonthlyPassService, MonthlyPassService>();
builder.Services.AddScoped<IMonthlyEntryTokenService, MonthlyEntryTokenService>();
builder.Services.AddScoped<MonthlyPassApplicationService>();

builder.Services.AddScoped<ILostCardService, LostCardService>();
builder.Services.AddScoped<IPlateMismatchService, PlateMismatchService>();

builder.Services.Configure<ReservationBookingOptions>(options =>
{
    options.AllowZeroBookingFee = false;

    if (int.TryParse(builder.Configuration["RESERVATION_PAYMENT_DEADLINE_MINUTES"], out var minutes))
    {
        options.PaymentDeadlineMinutes = minutes;
    }
    if (bool.TryParse(builder.Configuration["RESERVATION_ALLOW_ZERO_BOOKING_FEE"], out var allowZero))
    {
        options.AllowZeroBookingFee = allowZero;
    }
});

builder.Services.Configure<PayOsOptions>(options =>
{
    options.ClientId = builder.Configuration["PAYOS_CLIENT_ID"];
    options.ApiKey = builder.Configuration["PAYOS_API_KEY"];
    options.ChecksumKey = builder.Configuration["PAYOS_CHECKSUM_KEY"];
    options.ReturnUrl = builder.Configuration["PAYOS_RETURN_URL"];
    options.CancelUrl = builder.Configuration["PAYOS_CANCEL_URL"];
    options.WebhookUrl = builder.Configuration["PAYOS_WEBHOOK_URL"];

    if (int.TryParse(builder.Configuration["PAYOS_REQUEST_TIMEOUT_MS"], out var payOsTimeoutMs) && payOsTimeoutMs > 0)
    {
        options.RequestTimeoutMs = payOsTimeoutMs;
    }
});
builder.Services.AddScoped<IPayOsPaymentService, PayOsPaymentService>();

builder.Services.Configure<SupabaseStorageOptions>(options =>
{
    options.Url = builder.Configuration["SUPABASE_URL"];
    options.ServiceRoleKey = builder.Configuration["SUPABASE_SERVICE_ROLE_KEY"];
    options.Bucket = builder.Configuration["SUPABASE_STORAGE_BUCKET"] ?? "parking-images";

    if (int.TryParse(builder.Configuration["SUPABASE_SIGNED_URL_EXPIRES_SECONDS"], out var expiresSeconds))
    {
        options.SignedUrlExpiresSeconds = expiresSeconds;
    }

    if (long.TryParse(builder.Configuration["SUPABASE_MAX_UPLOAD_BYTES"], out var maxBytes))
    {
        options.MaxFileSizeBytes = maxBytes;
    }
});
builder.Services.AddHttpClient<IStorageService, SupabaseStorageService>();
builder.Services.AddScoped<ILostCardDocumentService, LostCardDocumentService>();
builder.Services.AddScoped<IFeeCalculationService, FeeCalculationService>();
builder.Services.AddScoped<IExitService, ExitService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ISessionAdminService, SessionAdminService>();

// Cau hinh JWT Authentication
var jwtSecret = builder.Configuration["JWT_SECRET"] ?? builder.Configuration["Jwt:Secret"];
var jwtSecretBytes = JwtSecretValidator.GetValidatedKeyBytes(jwtSecret);
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ParkingBuilding.CoreApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ParkingBuilding.Frontend";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.MapInboundClaims = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(jwtSecretBytes),
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = "role",
        NameClaimType = "username"
    };

    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var userIdClaim = context.Principal?.FindFirst("user_id")?.Value
                ?? context.Principal?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                context.Fail("Invalid user identity.");
                return;
            }

            var jwtId = context.Principal?.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
            var sessionId = Guid.TryParse(
                context.Principal?.FindFirst(JwtRegisteredClaimNames.Sid)?.Value,
                out var parsedSessionId)
                ? parsedSessionId
                : (Guid?)null;

            using var scope = context.HttpContext.RequestServices.CreateScope();
            var authSessionService = scope.ServiceProvider.GetRequiredService<IAuthSessionService>();

            if (!await authSessionService.IsUserActiveAsync(userId)
                || await authSessionService.IsAccessTokenRevokedAsync(jwtId, sessionId))
            {
                context.Fail("Authentication session is no longer active.");
            }
        },
        OnChallenge = async context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = Microsoft.AspNetCore.Http.StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";

            var response = ApiResponse.FailureResult(
                message: ErrorMessages.GetMessage(ErrorCodes.Unauthorized),
                errors: new List<string> { ErrorCodes.Unauthorized },
                errorCode: ErrorCodes.Unauthorized,
                statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status401Unauthorized,
                traceId: context.HttpContext.TraceIdentifier,
                path: context.HttpContext.Request.Path
            );
            await context.Response.WriteAsJsonAsync(response);
        },
        OnForbidden = async context =>
        {
            context.Response.StatusCode = Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";

            var response = ApiResponse.FailureResult(
                message: ErrorMessages.GetMessage(ErrorCodes.Forbidden),
                errors: new List<string> { ErrorCodes.Forbidden },
                errorCode: ErrorCodes.Forbidden,
                statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden,
                traceId: context.HttpContext.TraceIdentifier,
                path: context.HttpContext.Request.Path
            );
            await context.Response.WriteAsJsonAsync(response);
        }
    };
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            var response = ApiResponse.FailureResult(
                message: ErrorMessages.GetMessage(ErrorCodes.ValidationError),
                errors: errors,
                errorCode: ErrorCodes.ValidationError,
                statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status400BadRequest,
                traceId: context.HttpContext.TraceIdentifier,
                path: context.HttpContext.Request.Path
            );
            return new BadRequestObjectResult(response);
        };
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo
    {
        Title = "Parking Building Core API",
        Version = "v1",
        Description = "ASP.NET Core API for core parking building operations"
    });

    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.OpenApiSecurityScheme
    {
        Type = Microsoft.OpenApi.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.ParameterLocation.Header,
        Description = "Enter JWT token only. Do not include the word 'Bearer'."
    });

    options.AddSecurityRequirement(document => new Microsoft.OpenApi.OpenApiSecurityRequirement
    {
        [new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer", document)] = new System.Collections.Generic.List<string>()
    });
});

var app = builder.Build();

app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<GlobalExceptionMiddleware>();

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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Parking Building Core API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
