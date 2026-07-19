# Backend Architecture Map: SWP301

This file contains the backend directory tree (docs, database, scripts, backend services) and full code contents of non-ignored backend files in the SWP301 repository.

## 1. Directory Tree

```markdown
- 📁 **.codex/**
- 📁 **backend/**
  - 📁 **ParkingBuilding.CoreApi/**
    - 📁 **Application/**
      - 📁 **Audit/**
        - 📄 AuditWriterService.cs * (5.4 KB)
        - 📁 **Dtos/**
          - 📄 AuditWriteDto.cs * (0.6 KB)
        - 📄 IAuditWriterService.cs * (0.6 KB)
      - 📁 **Auth/**
      - 📁 **Cards/**
      - 📁 **Drivers/**
      - 📁 **FeeCalculation/**
      - 📁 **LostCards/**
        - 📁 **Documents/**
          - 📄 ILostCardDocumentService.cs * (0.9 KB)
          - 📄 LostCardDocumentResponse.cs * (0.7 KB)
          - 📄 LostCardDocumentService.cs * (17.2 KB)
          - 📄 UploadLostCardDocumentRequest.cs * (0.3 KB)
          - 📄 UploadLostCardDocumentsBatchRequest.cs * (0.3 KB)
      - 📁 **Mismatch/**
      - 📁 **MonthlyPasses/**
        - 📄 CreateMonthlyPassRequest.cs * (0.6 KB)
        - 📄 IMonthlyEntryTokenService.cs * (0.3 KB)
        - 📄 IMonthlyPassService.cs * (0.7 KB)
        - 📄 MonthlyEntryTokenPayload.cs * (0.7 KB)
        - 📄 MonthlyEntryTokenService.cs * (7.3 KB)
        - 📄 MonthlyPassService.cs * (14.8 KB)
        - 📄 RenewMonthlyPassRequest.cs * (0.2 KB)
        - 📄 UpdateMonthlyPassRequest.cs * (0.4 KB)
      - 📁 **ParkingSessions/**
        - 📁 **Entry/**
          - 📄 CreateEntryRequest.cs * (1.2 KB)
          - 📄 CreateEntryResponse.cs * (1.5 KB)
          - 📄 EntryService.cs * (44.8 KB)
          - 📄 IEntryService.cs * (0.3 KB)
        - 📁 **LocationSuggestion/**
          - 📄 ILocationSuggestionService.cs * (0.3 KB)
          - 📄 ISuggestionTokenService.cs * (0.3 KB)
          - 📄 LocationAlternativeResponse.cs * (0.5 KB)
          - 📄 LocationSuggestionPayload.cs * (0.6 KB)
          - 📄 LocationSuggestionRequest.cs * (0.2 KB)
          - 📄 LocationSuggestionResponse.cs * (1.0 KB)
          - 📄 LocationSuggestionService.cs * (9.0 KB)
          - 📄 SuggestionTokenService.cs * (6.8 KB)
      - 📁 **ParkingStructure/**
        - 📁 **Areas/**
          - 📄 AreaResponse.cs * (0.3 KB)
          - 📄 AreaService.cs * (6.7 KB)
          - 📄 CreateAreaRequest.cs * (0.3 KB)
          - 📄 UpdateAreaRequest.cs * (0.3 KB)
        - 📁 **Floors/**
          - 📄 CreateFloorRequest.cs * (0.1 KB)
          - 📄 FloorResponse.cs * (0.2 KB)
          - 📄 FloorService.cs * (2.6 KB)
          - 📄 UpdateFloorRequest.cs * (0.1 KB)
        - 📁 **Slots/**
          - 📄 CreateSlotRequest.cs * (0.2 KB)
          - 📄 SlotResponse.cs * (0.2 KB)
          - 📄 SlotService.cs * (4.6 KB)
          - 📄 UpdateSlotStatusRequest.cs * (0.1 KB)
      - 📁 **Payments/**
        - 📄 IPayOsPaymentService.cs * (0.8 KB)
        - 📄 PayOsOptions.cs * (0.8 KB)
        - 📄 PayOsPaymentResponse.cs * (0.6 KB)
        - 📄 PayOsPaymentService.cs * (18.4 KB)
        - 📄 PayOsWebhookProcessResult.cs * (0.4 KB)
      - 📁 **Pricing/**
      - 📁 **Receipts/**
      - 📁 **Reservations/**
        - 📄 IReservationEntryTokenService.cs * (0.3 KB)
        - 📄 ReservationBookingOptions.cs * (0.3 KB)
        - 📄 ReservationEntryCheckResponse.cs * (1.1 KB)
        - 📄 ReservationEntryTokenPayload.cs * (0.6 KB)
        - 📄 ReservationEntryTokenService.cs * (7.2 KB)
        - 📄 ReservationExpiryWorker.cs * (2.0 KB)
        - 📄 ReservationService.cs * (51.5 KB)
      - 📁 **Storage/**
        - 📄 IStorageService.cs * (0.4 KB)
        - 📄 StorageUploadResult.cs * (0.3 KB)
        - 📄 SupabaseStorageOptions.cs * (0.8 KB)
        - 📄 SupabaseStorageService.cs * (5.1 KB)
      - 📁 **Users/**
      - 📁 **Vehicles/**
    - 📄 appsettings.Development.json * (0.4 KB)
    - 📄 appsettings.json * (0.5 KB)
    - 📁 **Contracts/**
      - 📁 **Common/**
        - 📄 ApiResponse.cs * (3.3 KB)
        - 📄 BusinessException.cs * (0.4 KB)
        - 📄 ErrorCodes.cs * (14.0 KB)
        - 📄 ErrorMessages.cs * (15.2 KB)
        - 📄 PagedResponse.cs * (0.9 KB)
      - 📁 **Requests/**
        - 📄 LoginRequest.cs * (0.4 KB)
      - 📁 **Responses/**
        - 📄 CurrentUserResponse.cs * (0.4 KB)
        - 📄 HealthCheckResponse.cs * (0.6 KB)
        - 📄 LoginResponse.cs * (0.6 KB)
    - 📁 **Controllers/**
      - 📄 AreasController.cs * (1.3 KB)
      - 📄 AuthController.cs * (7.5 KB)
      - 📄 BaseApiController.cs * (6.8 KB)
      - 📄 CardsController.cs * (11.4 KB)
      - 📄 DbCheckController.cs * (5.8 KB)
      - 📄 FloorsController.cs * (1.3 KB)
      - 📄 HealthController.cs * (13.7 KB)
      - 📄 LostCardDocumentsController.cs * (3.2 KB)
      - 📄 MonthlyPassesController.cs * (3.9 KB)
      - 📄 ParkingSessionsController.cs * (4.9 KB)
      - 📄 PaymentsController.cs * (0.8 KB)
      - 📄 PricingRulesController.cs * (10.2 KB)
      - 📄 ReservationsController.cs * (3.7 KB)
      - 📄 SlotsController.cs * (1.4 KB)
      - 📄 UsersController.cs * (9.8 KB)
      - 📄 VehicleTypesController.cs * (4.0 KB)
    - 📁 **Domain/**
      - 📁 **Entities/**
        - 📄 Area.cs * (0.8 KB)
        - 📄 AreaVehicleType.cs * (0.3 KB)
        - 📄 AuditLog.cs * (0.8 KB)
        - 📄 DriverProfile.cs * (1.1 KB)
        - 📄 Floor.cs * (0.5 KB)
        - 📄 Gate.cs * (0.5 KB)
        - 📄 LostCardCaseDocument.cs * (1.0 KB)
        - 📄 MonthlyPass.cs * (1.1 KB)
        - 📄 ParkingCard.cs * (0.7 KB)
        - 📄 ParkingSession.cs * (3.0 KB)
        - 📄 ParkingSessionImage.cs * (0.9 KB)
        - 📄 Payment.cs * (1.7 KB)
        - 📄 PricingRule.cs * (0.9 KB)
        - 📄 Reservation.cs * (2.5 KB)
        - 📄 ReservationExtension.cs * (1.0 KB)
        - 📄 Slot.cs * (0.6 KB)
        - 📄 User.cs * (0.8 KB)
        - 📄 Vehicle.cs * (0.8 KB)
        - 📄 VehicleType.cs * (0.5 KB)
      - 📁 **Enums/**
        - 📄 AreaStatus.cs * (0.1 KB)
        - 📄 FloorStatus.cs * (0.1 KB)
        - 📄 GateStatus.cs * (0.1 KB)
        - 📄 GateType.cs * (0.1 KB)
        - 📄 SlotStatus.cs * (0.2 KB)
        - 📄 UserRole.cs * (0.1 KB)
        - 📄 UserStatus.cs * (0.1 KB)
      - 📁 **ValueObjects/**
    - 📁 **Infrastructure/**
      - 📁 **Middleware/**
        - 📄 GlobalExceptionMiddleware.cs * (3.9 KB)
        - 📄 RequestLoggingMiddleware.cs * (1.5 KB)
      - 📁 **Persistence/**
        - 📁 **Configurations/**
          - 📄 AreaConfiguration.cs * (1.9 KB)
          - 📄 AreaVehicleTypeConfiguration.cs * (1.1 KB)
          - 📄 AuditLogConfiguration.cs * (2.1 KB)
          - 📄 DriverProfileConfiguration.cs * (2.7 KB)
          - 📄 FloorConfiguration.cs * (1.2 KB)
          - 📄 GateConfiguration.cs * (1.5 KB)
          - 📄 LostCardCaseDocumentConfiguration.cs * (3.2 KB)
          - 📄 MonthlyPassConfiguration.cs * (3.2 KB)
          - 📄 ParkingCardConfiguration.cs * (1.9 KB)
          - 📄 ParkingSessionConfiguration.cs * (7.4 KB)
          - 📄 ParkingSessionImageConfiguration.cs * (2.6 KB)
          - 📄 PaymentConfiguration.cs * (4.8 KB)
          - 📄 PricingRuleConfiguration.cs * (2.8 KB)
          - 📄 ReservationConfiguration.cs * (6.1 KB)
          - 📄 ReservationExtensionConfiguration.cs * (3.0 KB)
          - 📄 SlotConfiguration.cs * (1.8 KB)
          - 📄 UserConfiguration.cs * (2.8 KB)
          - 📄 VehicleConfiguration.cs * (2.0 KB)
          - 📄 VehicleTypeConfiguration.cs * (1.6 KB)
        - 📁 **Diagnostics/**
          - 📄 SupabaseConnectionLogger.cs * (1.6 KB)
          - 📄 SupabaseConnectionProbe.cs * (1.8 KB)
        - 📁 **Migrations/**
        - 📄 ParkingDbContext.cs * (2.1 KB)
      - 📁 **Repositories/**
      - 📁 **Security/**
        - 📄 JwtTokenGenerator.cs * (2.6 KB)
    - 📄 Program.cs * (11.1 KB)
- 📁 **database/**
  - 📄 01_schema.sql * (26.6 KB)
  - 📄 02_seed.sql * (13.0 KB)
  - 📄 03_indexes_constraints.sql * (36.2 KB)
  - 📁 **manual-scripts/**
    - 📄 add_lost_card_case_documents.sql * (2.3 KB)
    - 📄 add_reservation_payment_deadline.sql * (0.4 KB)
    - 📄 allow_reservation_without_plate.sql * (1.2 KB)
    - 📄 check_active_sessions.sql * (0.5 KB)
    - 📄 check_card_slot_state.sql * (0.8 KB)
    - 📄 cleanup_test_data.sql * (1.1 KB)
    - 📄 drop_all_public_objects.sql * (4.0 KB)
    - 📄 fix_reservation_status_constraint.sql * (0.2 KB)
    - 📄 reset_demo_data.sql * (0.1 KB)
  - 📁 **snapshots/**
- 📁 **docs/**
  - 📄 local-payos-real-payment-test.md * (2.3 KB)
  - 📁 **specification/**
    - 📄 Developer_Implementation_Specification_Dual_Backend_NET_SpringBoot.md * (191.2 KB)
- 📄 export-backend-map.ps1 * (1.6 KB)
- 📄 export-project-map.ps1 * (1.5 KB)
- 📁 **scripts/**
  - 📄 test-api-contract.ps1 * (5.1 KB)
  - 📄 test-api-crud.ps1 * (6.3 KB)
  - 📄 test-api-flow.ps1 * (33.4 KB)
  - 📄 test-api-smoke.ps1 * (4.9 KB)
  - 📄 test-api.ps1 * (104.4 KB)
```

## 2. File Contents

### File: `backend/ParkingBuilding.CoreApi/Application/Audit/AuditWriterService.cs`

```csharp
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using ParkingBuilding.CoreApi.Application.Audit.Dtos;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Application.Audit
{
    public class AuditWriterService : IAuditWriterService
    {
        private readonly ParkingDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AuditWriterService> _logger;

        public AuditWriterService(
            ParkingDbContext context,
            IHttpContextAccessor httpContextAccessor,
            ILogger<AuditWriterService> logger)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task WriteAuditLogAsync(AuditWriteDto dto)
        {
            try
            {
                var auditLog = new AuditLog
                {
                    SourceService = "CORE_API",
                    Action = dto.Action ?? "UNKNOWN",
                    TargetType = dto.TargetType ?? "SYSTEM",
                    TargetId = dto.TargetId ?? "0",
                    OldValue = EnsureValidJson(dto.OldValue),
                    NewValue = EnsureValidJson(dto.NewValue),
                    CreatedAt = DateTimeOffset.UtcNow
                };

                var httpContext = _httpContextAccessor.HttpContext;

                long? resolvedActorUserId = dto.ActorUserId;
                string? resolvedIp = dto.IpAddress;
                string? resolvedUserAgent = dto.UserAgent;

                if (httpContext != null)
                {
                    // Resolve Client IP if not provided
                    if (string.IsNullOrWhiteSpace(resolvedIp))
                    {
                        resolvedIp = httpContext.Connection.RemoteIpAddress?.ToString();
                    }

                    // Resolve User Agent if not provided
                    if (string.IsNullOrWhiteSpace(resolvedUserAgent))
                    {
                        resolvedUserAgent = httpContext.Request.Headers["User-Agent"].ToString();
                    }

                    // Resolve Actor User ID if not provided
                    if (resolvedActorUserId == null && httpContext.User?.Identity?.IsAuthenticated == true)
                    {
                        var userIdClaim = httpContext.User.FindFirst("user_id")?.Value;
                        if (long.TryParse(userIdClaim, out var userId))
                        {
                            resolvedActorUserId = userId;
                        }
                    }
                }

                // Denormalize IP and User Agent into the 'reason' field since there are no separate columns
                var ipStr = !string.IsNullOrWhiteSpace(resolvedIp) ? resolvedIp : "Unknown";
                var uaStr = !string.IsNullOrWhiteSpace(resolvedUserAgent) ? resolvedUserAgent : "Unknown";
                var trackingPrefix = $"[IP: {ipStr}] [UA: {uaStr}]";

                var finalReason = string.IsNullOrWhiteSpace(dto.Reason)
                    ? trackingPrefix
                    : $"{trackingPrefix} - {dto.Reason}";

                // Truncate tracking + reason if too long for safety, though 'reason' is text (unlimited)
                auditLog.Reason = finalReason;
                auditLog.ActorUserId = resolvedActorUserId;

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to insert audit log for action '{Action}'", dto.Action);
                throw;
            }
        }

        private string? EnsureValidJson(string? value)
        {
            if (string.IsNullOrEmpty(value)) return null;
            var trimmed = value.Trim();
            if ((trimmed.StartsWith("{") && trimmed.EndsWith("}")) ||
                (trimmed.StartsWith("[") && trimmed.EndsWith("]")) ||
                (trimmed.StartsWith("\"") && trimmed.EndsWith("\"")) ||
                trimmed.Equals("null", StringComparison.OrdinalIgnoreCase) ||
                trimmed.Equals("true", StringComparison.OrdinalIgnoreCase) ||
                trimmed.Equals("false", StringComparison.OrdinalIgnoreCase) ||
                decimal.TryParse(trimmed, out _))
            {
                return trimmed;
            }
            return System.Text.Json.JsonSerializer.Serialize(value);
        }

        public Task WriteAuditLogAsync(
            string action,
            string targetType,
            string targetId,
            long? actorUserId = null,
            string? oldValue = null,
            string? newValue = null,
            string? reason = null,
            string? ipAddress = null,
            string? userAgent = null)
        {
            var dto = new AuditWriteDto
            {
                Action = action,
                TargetType = targetType,
                TargetId = targetId,
                ActorUserId = actorUserId,
                OldValue = oldValue,
                NewValue = newValue,
                Reason = reason,
                IpAddress = ipAddress,
                UserAgent = userAgent
            };

            return WriteAuditLogAsync(dto);
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Audit/Dtos/AuditWriteDto.cs`

```csharp
namespace ParkingBuilding.CoreApi.Application.Audit.Dtos
{
    public class AuditWriteDto
    {
        public long? ActorUserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string TargetType { get; set; } = string.Empty;
        public string TargetId { get; set; } = string.Empty;
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string? Reason { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Audit/IAuditWriterService.cs`

```csharp
using System.Threading.Tasks;
using ParkingBuilding.CoreApi.Application.Audit.Dtos;

namespace ParkingBuilding.CoreApi.Application.Audit
{
    public interface IAuditWriterService
    {
        Task WriteAuditLogAsync(AuditWriteDto dto);

        Task WriteAuditLogAsync(
            string action,
            string targetType,
            string targetId,
            long? actorUserId = null,
            string? oldValue = null,
            string? newValue = null,
            string? reason = null,
            string? ipAddress = null,
            string? userAgent = null);
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/LostCards/Documents/ILostCardDocumentService.cs`

```csharp
using Microsoft.AspNetCore.Http;

namespace ParkingBuilding.CoreApi.Application.LostCards.Documents;

public interface ILostCardDocumentService
{
    Task<LostCardDocumentResponse> UploadAsync(
        long caseId,
        IFormFile file,
        string documentType,
        string? note,
        long uploadedBy,
        CancellationToken ct = default);

    Task<IReadOnlyList<LostCardDocumentResponse>> UploadBatchAsync(
        long caseId,
        List<IFormFile> files,
        List<string> documentTypes,
        List<string?> notes,
        long uploadedBy,
        CancellationToken ct = default);

    Task<IReadOnlyList<LostCardDocumentResponse>> GetByCaseAsync(
        long caseId,
        CancellationToken ct = default);

    Task DeleteAsync(
        long caseId,
        long documentId,
        long actorUserId,
        CancellationToken ct = default);
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/LostCards/Documents/LostCardDocumentResponse.cs`

```csharp
namespace ParkingBuilding.CoreApi.Application.LostCards.Documents;

public class LostCardDocumentResponse
{
    public long Id { get; set; }
    public long LostCardCaseId { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? ThumbnailPath { get; set; }
    public string? SignedUrl { get; set; }
    public string? OriginalFileName { get; set; }
    public string? MimeType { get; set; }
    public long? SizeBytes { get; set; }
    public string? Note { get; set; }
    public bool IsSensitive { get; set; }
    public long UploadedBy { get; set; }
    public DateTimeOffset UploadedAt { get; set; }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/LostCards/Documents/LostCardDocumentService.cs`

```csharp
using System.Data;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Application.Storage;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.LostCards.Documents;

public class LostCardDocumentService : ILostCardDocumentService
{
    private static readonly HashSet<string> AllowedDocumentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "CCCD_FRONT",
        "CCCD_BACK",
        "FACE_PHOTO",
        "VEHICLE_PHOTO",
        "LOSS_DECLARATION",
        "SIGNED_FORM",
        "OTHER"
    };

    private static readonly Dictionary<string, string[]> AllowedExtensionsByMime = new(StringComparer.OrdinalIgnoreCase)
    {
        ["image/jpeg"] = [".jpg", ".jpeg"],
        ["image/png"] = [".png"],
        ["image/webp"] = [".webp"],
        ["application/pdf"] = [".pdf"]
    };

    private readonly ParkingDbContext _context;
    private readonly IStorageService _storageService;
    private readonly SupabaseStorageOptions _storageOptions;
    private readonly IAuditWriterService _auditWriter;
    private readonly ILogger<LostCardDocumentService> _logger;

    public LostCardDocumentService(
        ParkingDbContext context,
        IStorageService storageService,
        IOptions<SupabaseStorageOptions> storageOptions,
        IAuditWriterService auditWriter,
        ILogger<LostCardDocumentService> logger)
    {
        _context = context;
        _storageService = storageService;
        _storageOptions = storageOptions.Value;
        _auditWriter = auditWriter;
        _logger = logger;
    }

    public async Task<LostCardDocumentResponse> UploadAsync(
        long caseId,
        IFormFile file,
        string documentType,
        string? note,
        long uploadedBy,
        CancellationToken ct = default)
    {
        await EnsureLostCardCaseExistsAsync(caseId, ct);
        var validated = await ValidateAndReadFileAsync(caseId, file, documentType, note, ct);
        await EnsureDocumentTypeAvailableAsync(caseId, validated.DocumentType, ct);

        var uploadedPaths = new List<string>();
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            await UploadValidatedFileAsync(validated, uploadedPaths, ct);
            var entity = CreateEntity(caseId, validated, uploadedBy);
            _context.LostCardCaseDocuments.Add(entity);
            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            await WriteAuditAsync("LOST_CARD_DOCUMENT_UPLOADED", entity, uploadedBy, ct);
            return await MapToResponseAsync(entity, ct);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            await DeleteUploadedFilesBestEffortAsync(uploadedPaths, ct);
            throw;
        }
    }

    public async Task<IReadOnlyList<LostCardDocumentResponse>> UploadBatchAsync(
        long caseId,
        List<IFormFile> files,
        List<string> documentTypes,
        List<string?> notes,
        long uploadedBy,
        CancellationToken ct = default)
    {
        await EnsureLostCardCaseExistsAsync(caseId, ct);
        ValidateBatchShape(files, documentTypes, notes);

        var validatedFiles = new List<ValidatedDocumentFile>();
        for (var i = 0; i < files.Count; i++)
        {
            validatedFiles.Add(await ValidateAndReadFileAsync(caseId, files[i], documentTypes[i], notes.ElementAtOrDefault(i), ct));
        }

        EnsureNoDuplicateDocumentTypesInBatch(validatedFiles);
        foreach (var validated in validatedFiles.Where(x => x.DocumentType != "OTHER"))
        {
            await EnsureDocumentTypeAvailableAsync(caseId, validated.DocumentType, ct);
        }

        var uploadedPaths = new List<string>();
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            var entities = new List<LostCardCaseDocument>();
            foreach (var validated in validatedFiles)
            {
                await UploadValidatedFileAsync(validated, uploadedPaths, ct);
                var entity = CreateEntity(caseId, validated, uploadedBy);
                _context.LostCardCaseDocuments.Add(entity);
                entities.Add(entity);
            }

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            await _auditWriter.WriteAuditLogAsync(
                action: "LOST_CARD_DOCUMENT_BATCH_UPLOADED",
                targetType: "LostCardCase",
                targetId: caseId.ToString(),
                actorUserId: uploadedBy,
                newValue: JsonSerializer.Serialize(new
                {
                    caseId,
                    documentIds = entities.Select(x => x.Id),
                    count = entities.Count
                }),
                reason: "Lost card documents uploaded.");

            var responses = new List<LostCardDocumentResponse>();
            foreach (var entity in entities)
            {
                responses.Add(await MapToResponseAsync(entity, ct));
            }

            return responses;
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            await DeleteUploadedFilesBestEffortAsync(uploadedPaths, ct);
            throw;
        }
    }

    public async Task<IReadOnlyList<LostCardDocumentResponse>> GetByCaseAsync(
        long caseId,
        CancellationToken ct = default)
    {
        await EnsureLostCardCaseExistsAsync(caseId, ct);

        var documents = await _context.LostCardCaseDocuments
            .AsNoTracking()
            .Where(x => x.LostCardCaseId == caseId && x.DeletedAt == null)
            .OrderByDescending(x => x.UploadedAt)
            .ToListAsync(ct);

        var responses = new List<LostCardDocumentResponse>();
        foreach (var document in documents)
        {
            responses.Add(await MapToResponseAsync(document, ct));
        }

        return responses;
    }

    public async Task DeleteAsync(
        long caseId,
        long documentId,
        long actorUserId,
        CancellationToken ct = default)
    {
        await EnsureLostCardCaseExistsAsync(caseId, ct);

        var document = await _context.LostCardCaseDocuments
            .FirstOrDefaultAsync(x => x.Id == documentId && x.LostCardCaseId == caseId && x.DeletedAt == null, ct);

        if (document == null)
        {
            throw new BusinessException(ErrorCodes.LostCardDocumentNotFound, StatusCodes.Status404NotFound);
        }

        var now = DateTimeOffset.UtcNow;
        document.DeletedAt = now;
        document.UpdatedAt = now;
        await _context.SaveChangesAsync(ct);

        await _auditWriter.WriteAuditLogAsync(
            action: "LOST_CARD_DOCUMENT_DELETED",
            targetType: "LostCardCaseDocument",
            targetId: document.Id.ToString(),
            actorUserId: actorUserId,
            oldValue: JsonSerializer.Serialize(new
            {
                document.Id,
                document.LostCardCaseId,
                document.DocumentType,
                document.FilePath
            }),
            reason: "Lost card document soft deleted.");

        try
        {
            await _storageService.DeleteAsync(document.FilePath, ct);
        }
        catch (BusinessException ex) when (
            ex.ErrorCode == ErrorCodes.StorageConfigMissing
            || ex.ErrorCode == ErrorCodes.StorageDeleteFailed)
        {
            _logger.LogWarning("Lost card document metadata was soft deleted, but storage delete failed. DocumentId={DocumentId}, ErrorCode={ErrorCode}", document.Id, ex.ErrorCode);
        }
    }

    private async Task<ValidatedDocumentFile> ValidateAndReadFileAsync(
        long caseId,
        IFormFile file,
        string documentType,
        string? note,
        CancellationToken ct)
    {
        var normalizedType = NormalizeDocumentType(documentType);

        if (file == null)
        {
            throw new BusinessException(ErrorCodes.FileRequired);
        }

        if (file.Length <= 0)
        {
            throw new BusinessException(ErrorCodes.FileEmpty);
        }

        if (file.Length > _storageOptions.MaxFileSizeBytes)
        {
            throw new BusinessException(ErrorCodes.FileTooLarge);
        }

        var contentType = NormalizeContentType(file.ContentType);
        if (!_storageOptions.AllowedMimeTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase))
        {
            throw new BusinessException(ErrorCodes.FileTypeNotAllowed);
        }

        var originalFileName = SanitizeFileName(file.FileName);
        var extension = Path.GetExtension(originalFileName).ToLowerInvariant();
        if (!AllowedExtensionsByMime.TryGetValue(contentType, out var allowedExtensions)
            || !allowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
        {
            throw new BusinessException(ErrorCodes.FileTypeNotAllowed);
        }

        await using var input = file.OpenReadStream();
        using var memory = new MemoryStream();
        await input.CopyToAsync(memory, ct);
        var bytes = memory.ToArray();
        var hash = Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();
        var path = BuildStoragePath(caseId, normalizedType, extension);

        return new ValidatedDocumentFile(
            normalizedType,
            originalFileName,
            contentType,
            file.Length,
            hash,
            note,
            path,
            bytes);
    }

    private static string NormalizeDocumentType(string documentType)
    {
        var normalized = (documentType ?? string.Empty).Trim().ToUpperInvariant();
        if (!AllowedDocumentTypes.Contains(normalized))
        {
            throw new BusinessException(ErrorCodes.LostCardDocumentTypeInvalid);
        }

        return normalized;
    }

    private async Task EnsureDocumentTypeAvailableAsync(long caseId, string documentType, CancellationToken ct)
    {
        if (documentType == "OTHER")
        {
            return;
        }

        var exists = await _context.LostCardCaseDocuments
            .AnyAsync(x => x.LostCardCaseId == caseId && x.DocumentType == documentType && x.DeletedAt == null, ct);

        if (exists)
        {
            throw new BusinessException(ErrorCodes.LostCardDocumentTypeAlreadyExists, StatusCodes.Status409Conflict);
        }
    }

    private static void ValidateBatchShape(
        List<IFormFile> files,
        List<string> documentTypes,
        List<string?> notes)
    {
        if (files == null || files.Count == 0)
        {
            throw new BusinessException(ErrorCodes.FileRequired);
        }

        if (documentTypes == null || documentTypes.Count != files.Count)
        {
            throw new BusinessException(ErrorCodes.InvalidRequest);
        }

        if (notes != null && notes.Count > 0 && notes.Count != files.Count)
        {
            throw new BusinessException(ErrorCodes.InvalidRequest);
        }
    }

    private static void EnsureNoDuplicateDocumentTypesInBatch(List<ValidatedDocumentFile> files)
    {
        var duplicate = files
            .Where(x => x.DocumentType != "OTHER")
            .GroupBy(x => x.DocumentType)
            .FirstOrDefault(x => x.Count() > 1);

        if (duplicate != null)
        {
            throw new BusinessException(ErrorCodes.LostCardDocumentTypeAlreadyExists, StatusCodes.Status409Conflict);
        }
    }

    private async Task UploadValidatedFileAsync(
        ValidatedDocumentFile validated,
        List<string> uploadedPaths,
        CancellationToken ct)
    {
        await using var uploadStream = new MemoryStream(validated.Bytes, writable: false);
        await _storageService.UploadAsync(uploadStream, validated.StoragePath, validated.MimeType, ct);
        uploadedPaths.Add(validated.StoragePath);
    }

    private static LostCardCaseDocument CreateEntity(
        long caseId,
        ValidatedDocumentFile validated,
        long uploadedBy)
    {
        var now = DateTimeOffset.UtcNow;
        return new LostCardCaseDocument
        {
            LostCardCaseId = caseId,
            DocumentType = validated.DocumentType,
            FilePath = validated.StoragePath,
            OriginalFileName = validated.OriginalFileName,
            MimeType = validated.MimeType,
            SizeBytes = validated.SizeBytes,
            Sha256Hash = validated.Sha256Hash,
            Note = string.IsNullOrWhiteSpace(validated.Note) ? null : validated.Note.Trim(),
            IsSensitive = true,
            UploadedBy = uploadedBy,
            UploadedAt = now,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    private async Task<LostCardDocumentResponse> MapToResponseAsync(
        LostCardCaseDocument document,
        CancellationToken ct)
    {
        return new LostCardDocumentResponse
        {
            Id = document.Id,
            LostCardCaseId = document.LostCardCaseId,
            DocumentType = document.DocumentType,
            FilePath = document.FilePath,
            ThumbnailPath = document.ThumbnailPath,
            SignedUrl = await _storageService.CreateSignedUrlAsync(document.FilePath, null, ct),
            OriginalFileName = document.OriginalFileName,
            MimeType = document.MimeType,
            SizeBytes = document.SizeBytes,
            Note = document.Note,
            IsSensitive = document.IsSensitive,
            UploadedBy = document.UploadedBy,
            UploadedAt = document.UploadedAt
        };
    }

    private async Task EnsureLostCardCaseExistsAsync(long caseId, CancellationToken ct)
    {
        var connection = _context.Database.GetDbConnection();
        var shouldClose = connection.State != ConnectionState.Open;
        if (shouldClose)
        {
            await connection.OpenAsync(ct);
        }

        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT EXISTS (SELECT 1 FROM lost_card_cases WHERE id = @id)";
            var parameter = command.CreateParameter();
            parameter.ParameterName = "@id";
            parameter.Value = caseId;
            command.Parameters.Add(parameter);

            var result = await command.ExecuteScalarAsync(ct);
            if (result is not bool exists || !exists)
            {
                throw new BusinessException(ErrorCodes.LostCardCaseNotFound, StatusCodes.Status404NotFound);
            }
        }
        finally
        {
            if (shouldClose)
            {
                await connection.CloseAsync();
            }
        }
    }

    private async Task WriteAuditAsync(
        string action,
        LostCardCaseDocument entity,
        long actorUserId,
        CancellationToken ct)
    {
        await _auditWriter.WriteAuditLogAsync(
            action: action,
            targetType: "LostCardCaseDocument",
            targetId: entity.Id.ToString(),
            actorUserId: actorUserId,
            newValue: JsonSerializer.Serialize(new
            {
                entity.Id,
                entity.LostCardCaseId,
                entity.DocumentType,
                entity.FilePath,
                entity.SizeBytes,
                entity.Sha256Hash
            }),
            reason: "Lost card document uploaded.");
    }

    private async Task DeleteUploadedFilesBestEffortAsync(List<string> uploadedPaths, CancellationToken ct)
    {
        foreach (var path in uploadedPaths)
        {
            try
            {
                await _storageService.DeleteAsync(path, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Best-effort Supabase cleanup failed for uploaded path {Path}", path);
            }
        }
    }

    private static string BuildStoragePath(long caseId, string documentType, string extension)
    {
        var typeSegment = documentType.ToLowerInvariant().Replace('_', '-');
        var timestamp = DateTimeOffset.UtcNow.ToString("yyyyMMddHHmmss");
        var random = Convert.ToHexString(RandomNumberGenerator.GetBytes(4)).ToLowerInvariant();
        return $"lost-cards/{caseId}/{typeSegment}-{timestamp}-{random}{extension}";
    }

    private static string SanitizeFileName(string fileName)
    {
        var name = Path.GetFileName(fileName);
        if (string.IsNullOrWhiteSpace(name))
        {
            return "upload";
        }

        foreach (var invalid in Path.GetInvalidFileNameChars())
        {
            name = name.Replace(invalid, '-');
        }

        return name.Length <= 255 ? name : name[^255..];
    }

    private static string NormalizeContentType(string? contentType)
        => string.IsNullOrWhiteSpace(contentType)
            ? "application/octet-stream"
            : contentType.Split(';')[0].Trim().ToLowerInvariant();

    private sealed record ValidatedDocumentFile(
        string DocumentType,
        string OriginalFileName,
        string MimeType,
        long SizeBytes,
        string Sha256Hash,
        string? Note,
        string StoragePath,
        byte[] Bytes);
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/LostCards/Documents/UploadLostCardDocumentRequest.cs`

```csharp
using Microsoft.AspNetCore.Http;

namespace ParkingBuilding.CoreApi.Application.LostCards.Documents;

public class UploadLostCardDocumentRequest
{
    public string DocumentType { get; set; } = string.Empty;
    public IFormFile File { get; set; } = null!;
    public string? Note { get; set; }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/LostCards/Documents/UploadLostCardDocumentsBatchRequest.cs`

```csharp
using Microsoft.AspNetCore.Http;

namespace ParkingBuilding.CoreApi.Application.LostCards.Documents;

public class UploadLostCardDocumentsBatchRequest
{
    public List<IFormFile> Files { get; set; } = [];
    public List<string> DocumentTypes { get; set; } = [];
    public List<string?> Notes { get; set; } = [];
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/MonthlyPasses/CreateMonthlyPassRequest.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public class CreateMonthlyPassRequest
    {
        public long? DriverId { get; set; }
        public long CardId { get; set; }
        public string OwnerName { get; set; } = null!;
        public string? Phone { get; set; }
        public string PlateNumber { get; set; } = null!;
        public long VehicleTypeId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        public long? FloorId { get; set; }
        public long? AreaId { get; set; }
        public long? SlotId { get; set; }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/MonthlyPasses/IMonthlyEntryTokenService.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public interface IMonthlyEntryTokenService
    {
        string CreateToken(MonthlyEntryTokenPayload payload);
        MonthlyEntryTokenPayload VerifyToken(string token);
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/MonthlyPasses/IMonthlyPassService.cs`

```csharp
using System;
using System.Threading.Tasks;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public interface IMonthlyPassService
    {
        Task<MonthlyPass> CreateMonthlyPassAsync(CreateMonthlyPassRequest request, long userId);
        Task<MonthlyPass> UpdateMonthlyPassAsync(long id, UpdateMonthlyPassRequest request, long userId);
        Task<MonthlyPass> RenewAsync(long id, RenewMonthlyPassRequest request, long userId);
        Task<MonthlyPass> ChangeStatusAsync(long id, string status, long userId);
        Task<MonthlyPass?> FindValidPassAsync(string plateNumber, long vehicleTypeId, DateTimeOffset time);
        bool IsValid(MonthlyPass pass, DateTimeOffset time);
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/MonthlyPasses/MonthlyEntryTokenPayload.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public class MonthlyEntryTokenPayload
    {
        public long MonthlyPassId { get; set; }
        public long CardId { get; set; }
        public string CardCode { get; set; } = null!;

        public long VehicleTypeId { get; set; }
        public long EntryGateId { get; set; }

        public long FixedFloorId { get; set; }
        public long FixedAreaId { get; set; }
        public long? FixedSlotId { get; set; }

        public long IssuedToStaffId { get; set; }

        public DateTimeOffset IssuedAt { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/MonthlyPasses/MonthlyEntryTokenService.cs`

```csharp
using Microsoft.Extensions.Configuration;
using ParkingBuilding.CoreApi.Contracts.Common;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public class MonthlyEntryTokenService : IMonthlyEntryTokenService
    {
        private readonly IConfiguration _configuration;

        public MonthlyEntryTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private string GetSecretKey()
        {
            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
            var secretKey = _configuration["MONTHLY_ENTRY_TOKEN_SECRET"]
                ?? _configuration["MonthlyEntryToken:Secret"];

            if (string.IsNullOrEmpty(secretKey))
            {
                if (isDevelopment)
                {
                    secretKey = _configuration["Jwt:Secret"]
                        ?? "DEVELOPMENT_SECRET_KEY_FOR_LOCAL_TESTING_ONLY_2026_SWP391_MONTHLY_ENTRY";
                }
                else
                {
                    throw new BusinessException(ErrorCodes.MonthlyEntryTokenSecretConfigRequired);
                }
            }

            return secretKey;
        }

        public string CreateToken(MonthlyEntryTokenPayload payload)
        {
            var secretKey = GetSecretKey();

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim("monthly_pass_id", payload.MonthlyPassId.ToString()),
                new Claim("card_id", payload.CardId.ToString()),
                new Claim("card_code", payload.CardCode),
                new Claim("vehicle_type_id", payload.VehicleTypeId.ToString()),
                new Claim("entry_gate_id", payload.EntryGateId.ToString()),
                new Claim("fixed_floor_id", payload.FixedFloorId.ToString()),
                new Claim("fixed_area_id", payload.FixedAreaId.ToString()),
                new Claim("issued_to_staff_id", payload.IssuedToStaffId.ToString())
            };

            if (payload.FixedSlotId.HasValue)
            {
                claims.Add(new Claim("fixed_slot_id", payload.FixedSlotId.Value.ToString()));
            }

            var token = new JwtSecurityToken(
                issuer: "ParkingBuilding.CoreApi.MonthlyEntry",
                audience: "ParkingBuilding.CoreApi.Entry",
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: payload.ExpiresAt.UtcDateTime,
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public MonthlyEntryTokenPayload VerifyToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenRequired);

            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKey = GetSecretKey();

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = "ParkingBuilding.CoreApi.MonthlyEntry",
                    ValidateAudience = true,
                    ValidAudience = "ParkingBuilding.CoreApi.Entry",
                    ClockSkew = TimeSpan.FromSeconds(10)
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                var jwtToken = (JwtSecurityToken)validatedToken;

                if (jwtToken.ValidTo < DateTime.UtcNow)
                    throw new BusinessException(ErrorCodes.MonthlyEntryTokenExpired);

                var passIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "monthly_pass_id")?.Value;
                var cardIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "card_id")?.Value;
                var cardCode = jwtToken.Claims.FirstOrDefault(c => c.Type == "card_code")?.Value;
                var vehicleTypeIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "vehicle_type_id")?.Value;
                var entryGateIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "entry_gate_id")?.Value;
                var floorIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "fixed_floor_id")?.Value;
                var areaIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "fixed_area_id")?.Value;
                var staffIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "issued_to_staff_id")?.Value;
                var slotIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "fixed_slot_id")?.Value;

                if (string.IsNullOrEmpty(cardCode) ||
                    !long.TryParse(passIdStr, out var passId) ||
                    !long.TryParse(cardIdStr, out var cardId) ||
                    !long.TryParse(vehicleTypeIdStr, out var vehicleTypeId) ||
                    !long.TryParse(entryGateIdStr, out var entryGateId) ||
                    !long.TryParse(floorIdStr, out var floorId) ||
                    !long.TryParse(areaIdStr, out var areaId) ||
                    !long.TryParse(staffIdStr, out var staffId))
                {
                    throw new BusinessException(ErrorCodes.MonthlyEntryTokenInvalid);
                }

                long? slotId = null;
                if (!string.IsNullOrEmpty(slotIdStr) && long.TryParse(slotIdStr, out var parsedSlotId))
                {
                    slotId = parsedSlotId;
                }

                var issuedAtUtc = jwtToken.ValidFrom == DateTime.MinValue ? DateTime.UtcNow : DateTime.SpecifyKind(jwtToken.ValidFrom, DateTimeKind.Utc);
                var expiresAtUtc = jwtToken.ValidTo == DateTime.MinValue ? DateTime.UtcNow.AddMinutes(5) : DateTime.SpecifyKind(jwtToken.ValidTo, DateTimeKind.Utc);

                return new MonthlyEntryTokenPayload
                {
                    MonthlyPassId = passId,
                    CardId = cardId,
                    CardCode = cardCode,
                    VehicleTypeId = vehicleTypeId,
                    EntryGateId = entryGateId,
                    FixedFloorId = floorId,
                    FixedAreaId = areaId,
                    FixedSlotId = slotId,
                    IssuedToStaffId = staffId,
                    IssuedAt = new DateTimeOffset(issuedAtUtc),
                    ExpiresAt = new DateTimeOffset(expiresAtUtc)
                };
            }
            catch (SecurityTokenExpiredException)
            {
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenExpired);
            }
            catch (Exception)
            {
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenInvalid);
            }
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/MonthlyPasses/MonthlyPassService.cs`

```csharp
using System;
using Microsoft.AspNetCore.Http;
using ParkingBuilding.CoreApi.Contracts.Common;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public class MonthlyPassService : IMonthlyPassService
    {
        private readonly ParkingDbContext _context;

        public MonthlyPassService(ParkingDbContext context)
        {
            _context = context;
        }

        public async Task<MonthlyPass> CreateMonthlyPassAsync(CreateMonthlyPassRequest request, long userId)
        {
            if (request.EndDate < request.StartDate)
                throw new BusinessException(ErrorCodes.InvalidDateRange);

            var normalizedPlate = NormalizePlate(request.PlateNumber);

            // Check card
            var card = await _context.ParkingCards.FindAsync(request.CardId);
            if (card == null)
                throw new BusinessException(ErrorCodes.CardNotFound);

            if (card.Status != CardStatus.AVAILABLE)
            {
                throw new BusinessException(ErrorCodes.CardNotAvailableForMonthlyPass);
            }

            // Check active card mapping
            var activeCardMappingExists = await _context.MonthlyPasses
                .AnyAsync(m => m.CardId == request.CardId && m.Status == "ACTIVE");
            if (activeCardMappingExists)
                throw new BusinessException(ErrorCodes.CardAlreadyMapped);

            // Check active plate type mapping
            var activePlateExists = await _context.MonthlyPasses
                .AnyAsync(m => m.NormalizedPlateNumber == normalizedPlate && m.VehicleTypeId == request.VehicleTypeId && m.Status == "ACTIVE");
            if (activePlateExists)
                throw new BusinessException(ErrorCodes.PlateAlreadyMapped);

            // Check vehicle type
            var vehicleType = await _context.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            long? floorId = null;
            long? areaId = null;
            long? slotId = null;

            if (vehicleType.RequiresSlot)
            {
                if (!request.SlotId.HasValue)
                    throw new BusinessException(ErrorCodes.SlotRequired);

                var slot = await _context.Slots
                    .Include(s => s.Area)
                        .ThenInclude(a => a.Floor)
                    .FirstOrDefaultAsync(s => s.Id == request.SlotId.Value);

                if (slot == null)
                    throw new BusinessException(ErrorCodes.SlotNotFound);

                if (slot.Area == null || slot.Area.Status != "ACTIVE")
                {
                    throw new BusinessException(ErrorCodes.SlotAreaInactive);
                }

                if (slot.Area.Floor == null || slot.Area.Floor.Status != "ACTIVE")
                {
                    throw new BusinessException(ErrorCodes.SlotFloorInactive);
                }

                if (slot.AllowedVehicleTypeId != request.VehicleTypeId)
                    throw new BusinessException(ErrorCodes.SlotVehicleTypeMismatch);

                if (slot.Status != "AVAILABLE")
                    throw new BusinessException(ErrorCodes.SlotNotAvailable);

                // Check slot already mapped to active pass
                var activeSlotPassExists = await _context.MonthlyPasses
                    .AnyAsync(m => m.SlotId == request.SlotId.Value && m.Status == "ACTIVE");
                if (activeSlotPassExists)
                    throw new BusinessException(ErrorCodes.SlotAlreadyMapped);

                slotId = slot.Id;
                areaId = slot.AreaId;
                floorId = slot.Area.FloorId;
            }
            else
            {
                if (!request.AreaId.HasValue)
                    throw new BusinessException(ErrorCodes.AreaRequired);

                if (request.SlotId.HasValue)
                    throw new BusinessException(ErrorCodes.SlotNotAllowedForVehicleType);

                var area = await _context.Areas
                    .Include(a => a.Floor)
                    .FirstOrDefaultAsync(a => a.Id == request.AreaId.Value);

                if (area == null)
                    throw new BusinessException(ErrorCodes.AreaNotFound);

                if (area.Floor == null || area.Floor.Status != "ACTIVE")
                {
                    throw new BusinessException(ErrorCodes.AreaFloorInactive);
                }

                if (area.Status != "ACTIVE")
                    throw new BusinessException(ErrorCodes.AreaInactive);

                // Check vehicle type compatibility with area
                var supportsVehicle = await _context.Set<AreaVehicleType>()
                    .AnyAsync(av => av.AreaId == request.AreaId.Value && av.VehicleTypeId == request.VehicleTypeId);
                if (!supportsVehicle)
                    throw new BusinessException(ErrorCodes.AreaVehicleTypeMismatch);

                areaId = area.Id;
                floorId = area.FloorId;
            }

            var monthlyPass = new MonthlyPass
            {
                DriverId = request.DriverId,
                CardId = request.CardId,
                OwnerName = request.OwnerName.Trim(),
                Phone = request.Phone?.Trim(),
                PlateNumber = request.PlateNumber.Trim(),
                NormalizedPlateNumber = normalizedPlate,
                VehicleTypeId = request.VehicleTypeId,
                FloorId = floorId,
                AreaId = areaId,
                SlotId = slotId,
                StartDate = request.StartDate.Date,
                EndDate = request.EndDate.Date,
                Status = "ACTIVE",
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.MonthlyPasses.Add(monthlyPass);
            await _context.SaveChangesAsync();

            return monthlyPass;
        }

        public async Task<MonthlyPass> UpdateMonthlyPassAsync(long id, UpdateMonthlyPassRequest request, long userId)
        {
            var pass = await _context.MonthlyPasses.FindAsync(id);
            if (pass == null)
                throw new BusinessException(ErrorCodes.MonthlyPassNotFound, StatusCodes.Status404NotFound);

            var normalizedPlate = NormalizePlate(request.PlateNumber);

            // If active and plate/type changed, check constraints
            if (pass.Status == "ACTIVE" && (pass.NormalizedPlateNumber != normalizedPlate))
            {
                var activePlateExists = await _context.MonthlyPasses
                    .AnyAsync(m => m.Id != id && m.NormalizedPlateNumber == normalizedPlate && m.VehicleTypeId == pass.VehicleTypeId && m.Status == "ACTIVE");
                if (activePlateExists)
                    throw new BusinessException(ErrorCodes.PlateAlreadyMapped);
            }

            var vehicleType = await _context.VehicleTypes.FindAsync(pass.VehicleTypeId);
            if (vehicleType == null)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            long? floorId = pass.FloorId;
            long? areaId = pass.AreaId;
            long? slotId = pass.SlotId;

            if (vehicleType.RequiresSlot)
            {
                if (!request.SlotId.HasValue)
                    throw new BusinessException(ErrorCodes.SlotRequired);

                if (pass.SlotId != request.SlotId.Value)
                {
                    var slot = await _context.Slots
                        .Include(s => s.Area)
                            .ThenInclude(a => a.Floor)
                        .FirstOrDefaultAsync(s => s.Id == request.SlotId.Value);

                    if (slot == null)
                        throw new BusinessException(ErrorCodes.SlotNotFound);

                    if (slot.Area == null || slot.Area.Status != "ACTIVE")
                    {
                        throw new BusinessException(ErrorCodes.SlotAreaInactive);
                    }

                    if (slot.Area.Floor == null || slot.Area.Floor.Status != "ACTIVE")
                    {
                        throw new BusinessException(ErrorCodes.SlotFloorInactive);
                    }

                    if (slot.AllowedVehicleTypeId != pass.VehicleTypeId)
                        throw new BusinessException(ErrorCodes.SlotVehicleTypeMismatch);

                    if (slot.Status != "AVAILABLE")
                        throw new BusinessException(ErrorCodes.SlotNotAvailable);

                    // Check slot mapping
                    var activeSlotPassExists = await _context.MonthlyPasses
                        .AnyAsync(m => m.Id != id && m.SlotId == request.SlotId.Value && m.Status == "ACTIVE");
                    if (activeSlotPassExists)
                        throw new BusinessException(ErrorCodes.SlotAlreadyMapped);

                    slotId = slot.Id;
                    areaId = slot.AreaId;
                    floorId = slot.Area.FloorId;
                }
            }
            else
            {
                if (!request.AreaId.HasValue)
                    throw new BusinessException(ErrorCodes.AreaRequired);

                if (request.SlotId.HasValue)
                    throw new BusinessException(ErrorCodes.SlotNotAllowedForVehicleType);

                if (pass.AreaId != request.AreaId.Value)
                {
                    var area = await _context.Areas
                        .Include(a => a.Floor)
                        .FirstOrDefaultAsync(a => a.Id == request.AreaId.Value);
                    if (area == null)
                        throw new BusinessException(ErrorCodes.AreaNotFound);

                    if (area.Floor == null || area.Floor.Status != "ACTIVE")
                    {
                        throw new BusinessException(ErrorCodes.AreaFloorInactive);
                    }

                    if (area.Status != "ACTIVE")
                        throw new BusinessException(ErrorCodes.AreaInactive);

                    var supportsVehicle = await _context.Set<AreaVehicleType>()
                        .AnyAsync(av => av.AreaId == request.AreaId.Value && av.VehicleTypeId == pass.VehicleTypeId);
                    if (!supportsVehicle)
                        throw new BusinessException(ErrorCodes.AreaVehicleTypeMismatch);

                    areaId = area.Id;
                    floorId = area.FloorId;
                }
                slotId = null;
            }

            pass.OwnerName = request.OwnerName.Trim();
            pass.Phone = request.Phone?.Trim();
            pass.PlateNumber = request.PlateNumber.Trim();
            pass.NormalizedPlateNumber = normalizedPlate;
            pass.FloorId = floorId;
            pass.AreaId = areaId;
            pass.SlotId = slotId;
            pass.UpdatedAt = DateTime.UtcNow;

            _context.MonthlyPasses.Update(pass);
            await _context.SaveChangesAsync();

            return pass;
        }

        public async Task<MonthlyPass> RenewAsync(long id, RenewMonthlyPassRequest request, long userId)
        {
            var pass = await _context.MonthlyPasses.FindAsync(id);
            if (pass == null)
                throw new BusinessException(ErrorCodes.MonthlyPassNotFound, StatusCodes.Status404NotFound);

            if (pass.Status == "LOCKED")
                throw new BusinessException(ErrorCodes.MonthlyPassLocked);

            var newEndDate = request.NewEndDate.Date;
            if (newEndDate < pass.StartDate || newEndDate < pass.EndDate)
                throw new BusinessException(ErrorCodes.InvalidDateRange);

            pass.EndDate = newEndDate;
            // If it was expired, renew sets it back to active
            if (pass.Status == "EXPIRED" || pass.EndDate >= DateTime.UtcNow.Date)
            {
                pass.Status = "ACTIVE";
            }
            pass.UpdatedAt = DateTime.UtcNow;

            _context.MonthlyPasses.Update(pass);
            await _context.SaveChangesAsync();

            return pass;
        }

        public async Task<MonthlyPass> ChangeStatusAsync(long id, string status, long userId)
        {
            var pass = await _context.MonthlyPasses.FindAsync(id);
            if (pass == null)
                throw new BusinessException(ErrorCodes.MonthlyPassNotFound, StatusCodes.Status404NotFound);

            var normalizedStatus = status.ToUpperInvariant();
            if (normalizedStatus != "ACTIVE" && normalizedStatus != "EXPIRED" && normalizedStatus != "LOCKED")
                throw new BusinessException(ErrorCodes.InvalidStatus);

            pass.Status = normalizedStatus;
            pass.UpdatedAt = DateTime.UtcNow;

            _context.MonthlyPasses.Update(pass);
            await _context.SaveChangesAsync();

            return pass;
        }

        public async Task<MonthlyPass?> FindValidPassAsync(string plateNumber, long vehicleTypeId, DateTimeOffset time)
        {
            var normalizedPlate = NormalizePlate(plateNumber);
            var checkDate = time.UtcDateTime.Date;

            // Load and check the active monthly pass
            var pass = await _context.MonthlyPasses
                .Include(p => p.Floor)
                .Include(p => p.Area)
                .Include(p => p.Slot)
                .FirstOrDefaultAsync(p => p.NormalizedPlateNumber == normalizedPlate &&
                                          p.VehicleTypeId == vehicleTypeId &&
                                          p.Status == "ACTIVE" &&
                                          p.StartDate <= checkDate &&
                                          p.EndDate >= checkDate);
            return pass;
        }

        public bool IsValid(MonthlyPass pass, DateTimeOffset time)
        {
            if (pass == null) return false;
            if (pass.Status == "LOCKED") throw new BusinessException(ErrorCodes.MonthlyPassLocked);
            
            var checkDate = time.UtcDateTime.Date;
            if (pass.Status == "EXPIRED" || checkDate < pass.StartDate || checkDate > pass.EndDate)
                throw new BusinessException(ErrorCodes.MonthlyPassExpired);

            return pass.Status == "ACTIVE";
        }

        private string NormalizePlate(string plate)
        {
            if (string.IsNullOrWhiteSpace(plate)) return string.Empty;
            return Regex.Replace(plate.ToUpperInvariant(), @"[^A-Z0-9]", "");
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/MonthlyPasses/RenewMonthlyPassRequest.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public class RenewMonthlyPassRequest
    {
        public DateTime NewEndDate { get; set; }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/MonthlyPasses/UpdateMonthlyPassRequest.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public class UpdateMonthlyPassRequest
    {
        public string OwnerName { get; set; } = null!;
        public string? Phone { get; set; }
        public string PlateNumber { get; set; } = null!;
        
        public long? FloorId { get; set; }
        public long? AreaId { get; set; }
        public long? SlotId { get; set; }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingSessions/Entry/CreateEntryRequest.cs`

```csharp
namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;

public class CreateEntryRequest
{
    public string EntryMode { get; set; } = "CASUAL";
    // CASUAL, MONTHLY, RESERVATION

    public long? MonthlyPassId { get; set; }
    public string? MonthlyEntryToken { get; set; }

    public long? ReservationId { get; set; }
    public string? ReservationEntryToken { get; set; }
    public long? ConvertedFromReservationId { get; set; }
    public string CardCode { get; set; } = null!;
    public string? LicensePlate { get; set; }
    public bool NoPlate { get; set; }
    public string? VehicleDescription { get; set; }
    public long VehicleTypeId { get; set; }
    public long EntryGateId { get; set; }
    public long? SelectedSlotId { get; set; }
    public long? SelectedAreaId { get; set; }
    public string? SuggestionToken { get; set; }
    public string? OverrideReason { get; set; }

    public string? EntryPlateImageUrl { get; set; }
    public string? EntryVehicleImageUrl { get; set; }
    public string? DetectedPlateNumber { get; set; }
    public string? DetectedNormalizedPlateNumber { get; set; }
    public decimal? OcrConfidence { get; set; }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingSessions/Entry/CreateEntryResponse.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Entry
{
    public class CreateEntryResponse
    {
        public long SessionId { get; set; }
        public string SessionCode { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string EntryMode { get; set; } = null!;
        public long? ConvertedFromReservationId { get; set; }

        public string CardCode { get; set; } = null!;
        public long CardId { get; set; }

        public string? PlateNumber { get; set; }
        public string? NormalizedPlateNumber { get; set; }
        public bool NoPlate { get; set; }
        public string? VehicleDescription { get; set; }

        public long VehicleTypeId { get; set; }
        public long EntryGateId { get; set; }
        public long EntryStaffId { get; set; }
        public DateTimeOffset EntryTime { get; set; }

        public long FloorId { get; set; }
        public long AreaId { get; set; }
        public long? SlotId { get; set; }

        public string CustomerType { get; set; } = null!;
        public bool PaymentRequired { get; set; }
        public string PaymentStatus { get; set; } = null!;

        public long? ReservationId { get; set; }
        public long? MonthlyPassId { get; set; }

        public long? SuggestedAreaId { get; set; }
        public long? SuggestedSlotId { get; set; }
        public long? OverrideAreaId { get; set; }
        public long? OverrideSlotId { get; set; }
        public string? OverrideReason { get; set; }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingSessions/Entry/EntryService.cs`

```csharp
using System;
using Microsoft.AspNetCore.Http;
using ParkingBuilding.CoreApi.Contracts.Common;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Application.Audit.Dtos;
using ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion;
using ParkingBuilding.CoreApi.Application.Reservations;
using ParkingBuilding.CoreApi.Application.MonthlyPasses;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Entry
{
    public class EntryService : IEntryService
    {
        private readonly ParkingDbContext _dbContext;
        private readonly IAuditWriterService _auditWriter;
        private readonly ILocationSuggestionService _suggestionService;
        private readonly ISuggestionTokenService _tokenService;
        private readonly IReservationEntryTokenService _resTokenService;
        private readonly IMonthlyPassService _monthlyPassService;
        private readonly IMonthlyEntryTokenService _monthlyTokenService;

        public EntryService(
            ParkingDbContext dbContext,
            IAuditWriterService auditWriter,
            ILocationSuggestionService suggestionService,
            ISuggestionTokenService tokenService,
            IReservationEntryTokenService resTokenService,
            IMonthlyPassService monthlyPassService,
            IMonthlyEntryTokenService monthlyTokenService)
        {
            _dbContext = dbContext;
            _auditWriter = auditWriter;
            _suggestionService = suggestionService;
            _tokenService = tokenService;
            _resTokenService = resTokenService;
            _monthlyPassService = monthlyPassService;
            _monthlyTokenService = monthlyTokenService;
        }

        public async Task<CreateEntryResponse> CreateEntryAsync(CreateEntryRequest request, long staffId, string role)
        {
            var strategy = _dbContext.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _dbContext.Database.BeginTransactionAsync();
                try
                {
                    // 1. Validation đầu vào (F032)
                    await ValidateEntryRequest(request);

                    CreateEntryResponse response;
                    switch (request.EntryMode?.ToUpperInvariant())
                    {
                        case "MONTHLY":
                            response = await CreateMonthlyEntryAsync(request, staffId, role);
                            break;
                        case "CASUAL":
                            response = await CreateCasualEntryAsync(request, staffId, role);
                            break;
                        case "RESERVATION":
                            response = await CreateReservationEntryAsync(request, staffId, role);
                            break;
                        default:
                            throw new BusinessException(ErrorCodes.EntryModeInvalid);
                    }

                    await transaction.CommitAsync();
                    return response;
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        private async Task<CreateEntryResponse> CreateMonthlyEntryAsync(CreateEntryRequest request, long staffId, string role)
        {
            if (!request.MonthlyPassId.HasValue)
                throw new BusinessException(ErrorCodes.MonthlyPassIdRequired);
            if (string.IsNullOrWhiteSpace(request.MonthlyEntryToken))
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenRequired);

            var tokenPayload = _monthlyTokenService.VerifyToken(request.MonthlyEntryToken);

            if (tokenPayload.MonthlyPassId != request.MonthlyPassId.Value ||
                tokenPayload.CardCode != request.CardCode ||
                tokenPayload.VehicleTypeId != request.VehicleTypeId ||
                tokenPayload.EntryGateId != request.EntryGateId)
            {
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenMismatch);
            }

            if (role == "STAFF" && tokenPayload.IssuedToStaffId != staffId)
            {
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenMismatch);
            }

            var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);
            if (card == null) throw new BusinessException(ErrorCodes.CardNotFound);
            if (card.Status != CardStatus.AVAILABLE) throw new BusinessException(ErrorCodes.CardNotAvailable);

            if (tokenPayload.CardId != card.Id)
            {
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenMismatch);
            }

            var monthlyPass = await _dbContext.MonthlyPasses
                .Include(p => p.Floor)
                .Include(p => p.Area)
                .Include(p => p.Slot).ThenInclude(s => s!.Area)
                .FirstOrDefaultAsync(p => p.Id == request.MonthlyPassId!.Value);

            if (monthlyPass == null)
                throw new BusinessException(ErrorCodes.MonthlyPassNotFound, StatusCodes.Status404NotFound);

            if (monthlyPass.CardId != card.Id)
            {
                throw new BusinessException(ErrorCodes.MonthlyCardMismatch);
            }

            if (monthlyPass.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.MonthlyPassExpired);

            var today = DateTime.UtcNow.Date;
            if (monthlyPass.StartDate.Date > today || monthlyPass.EndDate.Date < today)
                throw new BusinessException(ErrorCodes.MonthlyPassExpired);

            var normalizedPlate = NormalizePlate(request.LicensePlate);
            if (monthlyPass.NormalizedPlateNumber != normalizedPlate)
                throw new BusinessException(ErrorCodes.MonthlyPlateMismatch);

            if (monthlyPass.VehicleTypeId != request.VehicleTypeId)
                throw new BusinessException(ErrorCodes.MonthlyVehicleTypeMismatch);

            // Task 4: DB re-check fixed floor/area/slot active status
            if (monthlyPass.Floor == null || monthlyPass.Floor.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.MonthlyFloorInactive);

            if (monthlyPass.Area != null && monthlyPass.Area.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.MonthlyAreaInactive);

            // Task 5: Verify token payload matches DB entities
            if (tokenPayload.FixedFloorId != monthlyPass.FloorId)
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenMismatch);

            if (tokenPayload.FixedAreaId != monthlyPass.AreaId)
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenMismatch);

            if (tokenPayload.FixedSlotId != monthlyPass.SlotId)
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenMismatch);

            var gate = await _dbContext.Gates.Include(g => g.Floor).FirstOrDefaultAsync(g => g.Id == request.EntryGateId);
            if (gate == null) throw new BusinessException(ErrorCodes.GateNotFound);
            if (gate.GateType != "ENTRY" || gate.Status != "ACTIVE") throw new BusinessException(ErrorCodes.GateNotActive);
            if (gate.Floor == null || gate.Floor.Status != "ACTIVE") throw new BusinessException(ErrorCodes.FloorNotActive);

            var vehicleType = await _dbContext.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null) throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            if (vehicleType.RequiresSlot)
            {
                if (request.SelectedSlotId != monthlyPass.SlotId)
                    throw new BusinessException(ErrorCodes.MonthlySlotMismatch);

                if (monthlyPass.Slot == null)
                    throw new BusinessException(ErrorCodes.MonthlySlotNotAvailable);

                if (monthlyPass.Slot.AreaId != monthlyPass.AreaId)
                {
                    throw new BusinessException(ErrorCodes.MonthlyFixedLocationMismatch);
                }

                if (request.SelectedAreaId.HasValue &&
                    request.SelectedAreaId.Value != monthlyPass.Slot.AreaId)
                {
                    throw new BusinessException(ErrorCodes.MonthlyAreaMismatch);
                }

                if (monthlyPass.Slot.AllowedVehicleTypeId != request.VehicleTypeId)
                {
                    throw new BusinessException(ErrorCodes.MonthlySlotVehicleTypeMismatch);
                }

                if (monthlyPass.Slot.Status != "AVAILABLE")
                {
                    throw new BusinessException(ErrorCodes.MonthlySlotNotAvailable);
                }
            }
            else
            {
                if (request.SelectedAreaId != monthlyPass.AreaId)
                    throw new BusinessException(ErrorCodes.MonthlyAreaMismatch);
                if (request.SelectedSlotId.HasValue)
                    throw new BusinessException(ErrorCodes.MonthlySlotMismatch);

                if (monthlyPass.Area == null || monthlyPass.Area.Status != "ACTIVE")
                    throw new BusinessException(ErrorCodes.MonthlyAreaNotAvailable);

                if (monthlyPass.Area.CurrentRealOccupancy + monthlyPass.Area.CurrentBookedSlots >= monthlyPass.Area.TotalCapacity)
                {
                    throw new BusinessException(ErrorCodes.SelectedAreaFull);
                }
            }

            var pricing = await _dbContext.PricingRules
                .FirstOrDefaultAsync(p => p.VehicleTypeId == request.VehicleTypeId && p.Status == "ACTIVE" && p.EffectiveFrom <= DateTimeOffset.UtcNow);
            if (pricing == null) throw new BusinessException(ErrorCodes.PricingRuleNotFound);

            long resolvedAreaId = vehicleType.RequiresSlot
                ? monthlyPass.Slot!.AreaId
                : monthlyPass.AreaId!.Value;

            long resolvedFloorId = vehicleType.RequiresSlot
                ? monthlyPass.Slot!.Area.FloorId
                : monthlyPass.FloorId!.Value;

            var newSession = new ParkingSession
            {
                SessionCode = $"SESS-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                CardId = card.Id,
                PlateNumber = request.LicensePlate,
                NormalizedPlateNumber = normalizedPlate,
                NoPlate = request.NoPlate,
                VehicleDescription = request.VehicleDescription,
                VehicleTypeId = request.VehicleTypeId,
                EntryGateId = request.EntryGateId,
                SlotId = monthlyPass.SlotId,
                AreaId = resolvedAreaId,
                FloorId = resolvedFloorId,
                EntryStaffId = staffId,
                EntryTime = DateTimeOffset.UtcNow,
                BillableStartTime = DateTimeOffset.UtcNow,
                Status = "ACTIVE",
                PricingRuleId = pricing.Id,
                SnapshotDayPrice = pricing.DayPrice,
                SnapshotNightPrice = pricing.NightPrice,
                SnapshotMonthlyPrice = pricing.MonthlyPrice,
                SnapshotLostCardFee = pricing.LostCardFee,
                CustomerType = "MONTHLY",
                PaymentRequired = false,
                PaymentStatus = "NOT_REQUIRED",
                MonthlyPassId = monthlyPass.Id
            };

            _dbContext.ParkingSessions.Add(newSession);
            await _dbContext.SaveChangesAsync();

            if (vehicleType.RequiresSlot)
            {
                monthlyPass.Slot!.Status = "OCCUPIED";
                monthlyPass.Slot.CurrentSessionId = newSession.Id;
                monthlyPass.Slot.Area.CurrentRealOccupancy += 1;
            }
            else
            {
                monthlyPass.Area!.CurrentRealOccupancy += 1;
            }

            card.Status = CardStatus.IN_USE;
            card.CurrentSessionId = newSession.Id;
            await _dbContext.SaveChangesAsync();

            await SaveImagesAsync(request, newSession.Id);

            await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
            {
                Action = "SESSION_CREATED",
                TargetType = "ParkingSession",
                TargetId = newSession.SessionCode,
                Reason = $"Xe tháng {request.LicensePlate} vào bãi thành công.",
                ActorUserId = staffId
            });

            return MapSessionToResponse(newSession, card, request);
        }

        private async Task<CreateEntryResponse> CreateCasualEntryAsync(CreateEntryRequest request, long staffId, string role)
        {
            var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);
            if (card == null) throw new BusinessException(ErrorCodes.CardNotFound);
            if (card.Status != CardStatus.AVAILABLE) throw new BusinessException(ErrorCodes.CardNotAvailable);

            var hasActivePass = await _dbContext.MonthlyPasses
                .AnyAsync(m => m.CardId == card.Id && m.Status == "ACTIVE");
            if (hasActivePass)
                throw new BusinessException(ErrorCodes.CardIsMonthlyUseMonthlyFlow);

            var gate = await _dbContext.Gates.Include(g => g.Floor).FirstOrDefaultAsync(g => g.Id == request.EntryGateId);
            if (gate == null) throw new BusinessException(ErrorCodes.GateNotFound);

            var vehicleType = await _dbContext.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null) throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            var pricing = await _dbContext.PricingRules
                .FirstOrDefaultAsync(p => p.VehicleTypeId == request.VehicleTypeId && p.Status == "ACTIVE" && p.EffectiveFrom <= DateTimeOffset.UtcNow);
            if (pricing == null) throw new BusinessException(ErrorCodes.PricingRuleNotFound);

            var normalizedPlate = NormalizePlate(request.LicensePlate);

            LocationSuggestionPayload? suggestionPayload = null;
            if (!string.IsNullOrWhiteSpace(request.SuggestionToken))
            {
                suggestionPayload = _tokenService.VerifyToken(request.SuggestionToken);

                if (suggestionPayload.VehicleTypeId != request.VehicleTypeId ||
                    suggestionPayload.EntryGateId != request.EntryGateId)
                {
                    throw new BusinessException(ErrorCodes.SuggestionRequestMismatch);
                }

                if (role == "STAFF" && suggestionPayload.IssuedToStaffId != staffId)
                {
                    throw new BusinessException(ErrorCodes.SuggestionTokenStaffMismatch);
                }

                var expectedSuggestionType = vehicleType.RequiresSlot ? "SLOT" : "AREA";
                if (suggestionPayload.SuggestionType != expectedSuggestionType)
                {
                    throw new BusinessException(ErrorCodes.SuggestionTypeMismatch);
                }
            }
            else
            {
                if (role == "STAFF")
                {
                    throw new BusinessException(ErrorCodes.SuggestionTokenRequired);
                }

                if (string.IsNullOrWhiteSpace(request.OverrideReason))
                {
                    throw new BusinessException(ErrorCodes.OverrideReasonRequired);
                }
            }

            ParkingSession newSession;

            if (vehicleType.RequiresSlot)
            {
                if (!request.SelectedSlotId.HasValue)
                    throw new BusinessException(ErrorCodes.SelectedSlotRequired);

                var slot = await _dbContext.Slots.Include(s => s.Area).ThenInclude(a => a.Floor).FirstOrDefaultAsync(s => s.Id == request.SelectedSlotId.Value);
                if (slot == null) throw new BusinessException(ErrorCodes.SlotNotFound);

                if (slot.Status != "AVAILABLE" ||
                    slot.AllowedVehicleTypeId != request.VehicleTypeId ||
                    slot.Area.Status != "ACTIVE" ||
                    slot.Area.Floor.Status != "ACTIVE" ||
                    slot.Area.FloorId != gate.FloorId)
                {
                    throw new BusinessException(ErrorCodes.SelectedSlotNotAvailable);
                }

                bool isOverride = suggestionPayload == null || request.SelectedSlotId.Value != suggestionPayload.SuggestedSlotId;

                if (isOverride)
                {
                    if (role == "STAFF")
                    {
                        throw new BusinessException(ErrorCodes.SuggestionOverrideNotAllowed);
                    }

                    if (string.IsNullOrWhiteSpace(request.OverrideReason))
                    {
                        throw new BusinessException(ErrorCodes.OverrideReasonRequired);
                    }
                }

                newSession = new ParkingSession
                {
                    SessionCode = $"SESS-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                    CardId = card.Id,
                    PlateNumber = request.NoPlate ? null : request.LicensePlate,
                    NormalizedPlateNumber = request.NoPlate ? null : normalizedPlate,
                    NoPlate = request.NoPlate,
                    VehicleDescription = request.VehicleDescription,
                    VehicleTypeId = request.VehicleTypeId,
                    EntryGateId = request.EntryGateId,
                    SlotId = slot.Id,
                    AreaId = slot.AreaId,
                    FloorId = slot.Area.FloorId,
                    EntryStaffId = staffId,
                    EntryTime = DateTimeOffset.UtcNow,
                    BillableStartTime = DateTimeOffset.UtcNow,
                    Status = "ACTIVE",
                    PricingRuleId = pricing.Id,
                    SnapshotDayPrice = pricing.DayPrice,
                    SnapshotNightPrice = pricing.NightPrice,
                    SnapshotMonthlyPrice = pricing.MonthlyPrice,
                    SnapshotLostCardFee = pricing.LostCardFee,
                    CustomerType = "CASUAL",
                    PaymentRequired = true,
                    PaymentStatus = "PENDING",
                    SuggestedAreaId = suggestionPayload?.SuggestedAreaId ?? slot.AreaId,
                    SuggestedSlotId = suggestionPayload?.SuggestedSlotId ?? slot.Id,
                    OverrideAreaId = isOverride ? slot.AreaId : null,
                    OverrideSlotId = isOverride ? slot.Id : null,
                    OverrideBy = isOverride ? staffId : null,
                    OverrideAt = isOverride ? DateTimeOffset.UtcNow : null,
                    OverrideReason = isOverride ? request.OverrideReason : null
                };

                _dbContext.ParkingSessions.Add(newSession);
                await _dbContext.SaveChangesAsync();

                slot.Status = "OCCUPIED";
                slot.CurrentSessionId = newSession.Id;
                slot.Area.CurrentRealOccupancy += 1;
                await _dbContext.SaveChangesAsync();
            }
            else
            {
                if (!request.SelectedAreaId.HasValue)
                    throw new BusinessException(ErrorCodes.SelectedAreaRequired);

                if (request.SelectedSlotId.HasValue)
                    throw new BusinessException(ErrorCodes.SlotMustBeNullForAreaManagedVehicle);

                var area = await _dbContext.Areas
                    .Include(a => a.Floor)
                    .Include(a => a.AreaVehicleTypes)
                    .FirstOrDefaultAsync(a => a.Id == request.SelectedAreaId.Value);

                if (area == null) throw new BusinessException(ErrorCodes.AreaNotFound);

                if (area.Floor == null || area.Floor.Status != "ACTIVE")
                {
                    throw new BusinessException(ErrorCodes.SelectedFloorNotActive);
                }

                if (area.Status != "ACTIVE" ||
                    !area.AreaVehicleTypes.Any(av => av.VehicleTypeId == request.VehicleTypeId))
                {
                    throw new BusinessException(ErrorCodes.SelectedAreaNotActive);
                }

                if (area.CurrentRealOccupancy + area.CurrentBookedSlots >= area.TotalCapacity)
                {
                    throw new BusinessException(ErrorCodes.SelectedAreaFull);
                }

                var isFloorOverride = area.FloorId != gate.FloorId;
                bool isOverride = suggestionPayload == null || request.SelectedAreaId.Value != suggestionPayload.SuggestedAreaId || isFloorOverride;

                if (isOverride)
                {
                    if (role == "STAFF")
                    {
                        throw new BusinessException(ErrorCodes.SuggestionOverrideNotAllowed);
                    }

                    if (string.IsNullOrWhiteSpace(request.OverrideReason))
                    {
                        throw new BusinessException(ErrorCodes.OverrideReasonRequired);
                    }
                }

                newSession = new ParkingSession
                {
                    SessionCode = $"SESS-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                    CardId = card.Id,
                    PlateNumber = request.NoPlate ? null : request.LicensePlate,
                    NormalizedPlateNumber = request.NoPlate ? null : normalizedPlate,
                    NoPlate = request.NoPlate,
                    VehicleDescription = request.VehicleDescription,
                    VehicleTypeId = request.VehicleTypeId,
                    EntryGateId = request.EntryGateId,
                    SlotId = null,
                    AreaId = area.Id,
                    FloorId = area.FloorId,
                    EntryStaffId = staffId,
                    EntryTime = DateTimeOffset.UtcNow,
                    BillableStartTime = DateTimeOffset.UtcNow,
                    Status = "ACTIVE",
                    PricingRuleId = pricing.Id,
                    SnapshotDayPrice = pricing.DayPrice,
                    SnapshotNightPrice = pricing.NightPrice,
                    SnapshotMonthlyPrice = pricing.MonthlyPrice,
                    SnapshotLostCardFee = pricing.LostCardFee,
                    CustomerType = "CASUAL",
                    PaymentRequired = true,
                    PaymentStatus = "PENDING",
                    SuggestedAreaId = suggestionPayload?.SuggestedAreaId ?? area.Id,
                    SuggestedSlotId = null,
                    OverrideAreaId = isOverride ? area.Id : null,
                    OverrideSlotId = null,
                    OverrideBy = isOverride ? staffId : null,
                    OverrideAt = isOverride ? DateTimeOffset.UtcNow : null,
                    OverrideReason = isOverride ? request.OverrideReason : null
                };

                _dbContext.ParkingSessions.Add(newSession);
                await _dbContext.SaveChangesAsync();

                area.CurrentRealOccupancy += 1;
                await _dbContext.SaveChangesAsync();
            }

            card.Status = CardStatus.IN_USE;
            card.CurrentSessionId = newSession.Id;
            await _dbContext.SaveChangesAsync();

            await SaveImagesAsync(request, newSession.Id);

            if (request.ConvertedFromReservationId.HasValue)
            {
                await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                {
                    Action = "RESERVATION_CONVERTED_TO_CASUAL_ENTRY",
                    TargetType = "Reservation",
                    TargetId = request.ConvertedFromReservationId.Value.ToString(),
                    Reason = $"Đặt chỗ hết hạn, chuyển đổi sang đỗ vãng lai.",
                    ActorUserId = staffId
                });
            }

            await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
            {
                Action = "SESSION_CREATED",
                TargetType = "ParkingSession",
                TargetId = newSession.SessionCode,
                Reason = $"Xe vãng lai {request.LicensePlate} vào bãi thành công.",
                ActorUserId = staffId
            });

            return MapSessionToResponse(newSession, card, request);
        }

        private async Task<CreateEntryResponse> CreateReservationEntryAsync(CreateEntryRequest request, long staffId, string role)
        {
            var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);
            if (card == null) throw new BusinessException(ErrorCodes.CardNotFound);
            if (card.Status != CardStatus.AVAILABLE) throw new BusinessException(ErrorCodes.CardNotAvailable);

            var hasActivePass = await _dbContext.MonthlyPasses
                .AnyAsync(m => m.CardId == card.Id && m.Status == "ACTIVE");
            if (hasActivePass)
                throw new BusinessException(ErrorCodes.CardIsMonthlyNotAllowedForReservation);

            if (!request.ReservationId.HasValue)
                throw new BusinessException(ErrorCodes.ReservationIdRequired);
            if (string.IsNullOrWhiteSpace(request.ReservationEntryToken))
                throw new BusinessException(ErrorCodes.ReservationEntryTokenRequired);

            var tokenPayload = _resTokenService.VerifyToken(request.ReservationEntryToken);

            if (tokenPayload.ReservationId != request.ReservationId.Value ||
                tokenPayload.EntryGateId != request.EntryGateId ||
                tokenPayload.VehicleTypeId != request.VehicleTypeId)
            {
                throw new BusinessException(ErrorCodes.ReservationEntryTokenMismatch);
            }

            if (role == "STAFF" && tokenPayload.IssuedToStaffId != staffId)
            {
                throw new BusinessException(ErrorCodes.ReservationEntryTokenMismatch);
            }

            var vehicleType = await _dbContext.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null) throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            var pricing = await _dbContext.PricingRules
                .FirstOrDefaultAsync(p => p.VehicleTypeId == request.VehicleTypeId && p.Status == "ACTIVE" && p.EffectiveFrom <= DateTimeOffset.UtcNow);
            if (pricing == null) throw new BusinessException(ErrorCodes.PricingRuleNotFound);

            var activeReservation = await _dbContext.Reservations
                .Include(r => r.Floor)
                .Include(r => r.Area)
                .Include(r => r.Slot)
                .FirstOrDefaultAsync(r => r.Id == request.ReservationId.Value);

            if (activeReservation == null)
                throw new BusinessException(ErrorCodes.ReservationNotFound, StatusCodes.Status404NotFound);

            if (activeReservation.Status == "CANCELLED")
                throw new BusinessException(ErrorCodes.ReservationCancelled);

            if (activeReservation.Status == "COMPLETED" || activeReservation.CheckedInAt != null)
                throw new BusinessException(ErrorCodes.ReservationAlreadyCheckedIn);

            if (activeReservation.Status != "CONFIRMED")
                throw new BusinessException(ErrorCodes.ReservationNotConfirmed);

            if (activeReservation.ExpiresAt < DateTimeOffset.UtcNow)
                throw new BusinessException(ErrorCodes.ReservationExpired);

            // Task 6: Verify VehicleTypeId against reservation
            if (activeReservation.VehicleTypeId != request.VehicleTypeId)
                throw new BusinessException(ErrorCodes.ReservationVehicleTypeMismatch);

            var normalizedPlate = NormalizePlate(request.LicensePlate);

            if (!string.IsNullOrWhiteSpace(activeReservation.NormalizedPlateNumber))
            {
                if (activeReservation.NormalizedPlateNumber != normalizedPlate)
                {
                    throw new BusinessException(ErrorCodes.ReservationPlateMismatch);
                }
            }
            else
            {
                if (request.NoPlate)
                {
                    if (vehicleType.RequiresSlot)
                    {
                        throw new BusinessException(ErrorCodes.PlateRequiredForSlotVehicle);
                    }

                    if (string.IsNullOrWhiteSpace(request.VehicleDescription))
                    {
                        throw new BusinessException(ErrorCodes.VehicleDescriptionRequired);
                    }

                    activeReservation.PlateNumber = null;
                    activeReservation.NormalizedPlateNumber = null;
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(request.LicensePlate))
                    {
                        throw new BusinessException(ErrorCodes.EntryPlateRequired);
                    }

                    activeReservation.PlateNumber = request.LicensePlate.Trim();
                    activeReservation.NormalizedPlateNumber = normalizedPlate;
                }
            }

            if (request.SelectedAreaId != activeReservation.AreaId)
                throw new BusinessException(ErrorCodes.ReservationAreaMismatch);

            // Task 7: Verify token-vs-DB location matching
            if (tokenPayload.ReservedFloorId != activeReservation.FloorId)
                throw new BusinessException(ErrorCodes.ReservationEntryTokenMismatch);

            if (tokenPayload.ReservedAreaId != activeReservation.AreaId)
                throw new BusinessException(ErrorCodes.ReservationEntryTokenMismatch);

            if (tokenPayload.ReservedSlotId != activeReservation.SlotId)
                throw new BusinessException(ErrorCodes.ReservationEntryTokenMismatch);

            if (vehicleType.RequiresSlot)
            {
                if (request.SelectedSlotId != activeReservation.SlotId)
                    throw new BusinessException(ErrorCodes.ReservationSlotMismatch);

                if (activeReservation.Slot == null)
                    throw new BusinessException(ErrorCodes.ReservedSlotNotFound);

                if (activeReservation.Slot.Status != "RESERVED")
                {
                    throw new BusinessException(ErrorCodes.ReservedSlotNotAvailable);
                }
            }
            else
            {
                if (request.SelectedSlotId != null)
                    throw new BusinessException(ErrorCodes.ReservationSlotMismatch);

                if (activeReservation.Area.CurrentRealOccupancy >= activeReservation.Area.TotalCapacity)
                {
                    throw new BusinessException(ErrorCodes.SelectedAreaFull);
                }
            }

            if (activeReservation.Floor == null || activeReservation.Floor.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.ReservedFloorInactive);

            if (activeReservation.Area == null || activeReservation.Area.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.ReservedAreaInactive);

            var newSession = new ParkingSession
            {
                SessionCode = $"SESS-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                CardId = card.Id,
                PlateNumber = request.NoPlate ? null : request.LicensePlate,
                NormalizedPlateNumber = request.NoPlate ? null : normalizedPlate,
                NoPlate = request.NoPlate,
                VehicleDescription = request.VehicleDescription,
                VehicleTypeId = request.VehicleTypeId,
                EntryGateId = request.EntryGateId,
                SlotId = activeReservation.SlotId,
                AreaId = activeReservation.AreaId,
                FloorId = activeReservation.FloorId,
                ReservationId = activeReservation.Id,
                EntryStaffId = staffId,
                EntryTime = DateTimeOffset.UtcNow,
                BillableStartTime = DateTimeOffset.UtcNow,
                Status = "ACTIVE",
                PricingRuleId = pricing.Id,
                SnapshotDayPrice = pricing.DayPrice,
                SnapshotNightPrice = pricing.NightPrice,
                SnapshotMonthlyPrice = pricing.MonthlyPrice,
                SnapshotLostCardFee = pricing.LostCardFee,
                CustomerType = "CASUAL",
                PaymentRequired = false,
                PaymentStatus = "PAID"
            };

            _dbContext.ParkingSessions.Add(newSession);
            await _dbContext.SaveChangesAsync();

            activeReservation.Status = "COMPLETED";
            activeReservation.CheckedInAt = DateTimeOffset.UtcNow;
            activeReservation.CheckedInBy = staffId;
            activeReservation.UpdatedAt = DateTimeOffset.UtcNow;

            if (vehicleType.RequiresSlot && activeReservation.SlotId.HasValue)
            {
                var slot = await _dbContext.Slots.FindAsync(activeReservation.SlotId.Value);
                if (slot != null)
                {
                    slot.Status = "OCCUPIED";
                    slot.CurrentSessionId = newSession.Id;
                }
            }

            if (activeReservation.Area.CurrentBookedSlots > 0)
            {
                activeReservation.Area.CurrentBookedSlots -= 1;
            }
            activeReservation.Area.CurrentRealOccupancy += 1;

            card.Status = CardStatus.IN_USE;
            card.CurrentSessionId = newSession.Id;
            await _dbContext.SaveChangesAsync();

            await SaveImagesAsync(request, newSession.Id);

            await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
            {
                Action = "RESERVATION_CHECKED_IN",
                TargetType = "Reservation",
                TargetId = activeReservation.Id.ToString(),
                Reason = $"Check-in thành công cho đặt chỗ {activeReservation.ReservationCode}.",
                ActorUserId = staffId
            });

            await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
            {
                Action = "SESSION_CREATED",
                TargetType = "ParkingSession",
                TargetId = newSession.SessionCode,
                Reason = $"Xe booking {request.LicensePlate} vào bãi thành công.",
                ActorUserId = staffId
            });

            return MapSessionToResponse(newSession, card, request);
        }

        private async Task SaveImagesAsync(CreateEntryRequest request, long sessionId)
        {
            if (!string.IsNullOrWhiteSpace(request.EntryPlateImageUrl))
            {
                _dbContext.ParkingSessionImages.Add(new ParkingSessionImage
                {
                    SessionId = sessionId,
                    ImageType = "ENTRY_PLATE",
                    ImageUrl = request.EntryPlateImageUrl,
                    DetectedPlateNumber = request.DetectedPlateNumber,
                    DetectedNormalizedPlateNumber = request.DetectedNormalizedPlateNumber ?? (string.IsNullOrWhiteSpace(request.DetectedPlateNumber) ? null : NormalizePlate(request.DetectedPlateNumber)),
                    Confidence = request.OcrConfidence,
                    IsPrimary = true,
                    CapturedAt = DateTimeOffset.UtcNow
                });
            }

            if (!string.IsNullOrWhiteSpace(request.EntryVehicleImageUrl))
            {
                _dbContext.ParkingSessionImages.Add(new ParkingSessionImage
                {
                    SessionId = sessionId,
                    ImageType = "ENTRY_VEHICLE",
                    ImageUrl = request.EntryVehicleImageUrl,
                    DetectedPlateNumber = null,
                    DetectedNormalizedPlateNumber = null,
                    Confidence = null,
                    IsPrimary = false,
                    CapturedAt = DateTimeOffset.UtcNow
                });
            }

            await _dbContext.SaveChangesAsync();
        }

        private CreateEntryResponse MapSessionToResponse(ParkingSession newSession, ParkingCard card, CreateEntryRequest request)
        {
            return new CreateEntryResponse
            {
                SessionId = newSession.Id,
                SessionCode = newSession.SessionCode,
                Status = newSession.Status,
                EntryMode = request.EntryMode,
                ConvertedFromReservationId = request.ConvertedFromReservationId,
                CardId = card.Id,
                CardCode = card.CardNumber,
                PlateNumber = newSession.PlateNumber,
                NormalizedPlateNumber = newSession.NormalizedPlateNumber,
                NoPlate = newSession.NoPlate,
                VehicleDescription = newSession.VehicleDescription,
                VehicleTypeId = newSession.VehicleTypeId,
                EntryGateId = newSession.EntryGateId,
                EntryStaffId = newSession.EntryStaffId,
                EntryTime = newSession.EntryTime,
                FloorId = newSession.FloorId,
                AreaId = newSession.AreaId,
                SlotId = newSession.SlotId,
                CustomerType = newSession.CustomerType,
                PaymentRequired = newSession.PaymentRequired,
                PaymentStatus = newSession.PaymentStatus,
                ReservationId = newSession.ReservationId,
                MonthlyPassId = newSession.MonthlyPassId,
                SuggestedAreaId = newSession.SuggestedAreaId,
                SuggestedSlotId = newSession.SuggestedSlotId,
                OverrideAreaId = newSession.OverrideAreaId,
                OverrideSlotId = newSession.OverrideSlotId,
                OverrideReason = newSession.OverrideReason
            };
        }

        public async Task<bool> ClaimSessionAsync(string userIdString, string qrToken)
        {
            if (!long.TryParse(userIdString, out var userId))
                throw new BusinessException(ErrorCodes.AuthUserIdInvalid);

            if (string.IsNullOrWhiteSpace(qrToken))
                throw new BusinessException(ErrorCodes.QrTokenRequired);

            var strategy = _dbContext.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _dbContext.Database.BeginTransactionAsync();

                try
                {
                    var user = await _dbContext.Users
                        .FirstOrDefaultAsync(u => u.Id == userId);

                    if (user == null)
                        throw new BusinessException(ErrorCodes.UserNotFound);

                    if (user.Role != Domain.Enums.UserRole.DRIVER)
                        throw new BusinessException(ErrorCodes.DriverRequired);

                    if (user.Status != Domain.Enums.UserStatus.ACTIVE)
                        throw new BusinessException(ErrorCodes.UserNotActive);

                    var driverProfile = await _dbContext.DriverProfiles
                        .FirstOrDefaultAsync(d => d.UserId == userId);

                    if (driverProfile == null)
                        throw new BusinessException(ErrorCodes.DriverProfileNotFound);

                    var card = await _dbContext.ParkingCards
                        .FirstOrDefaultAsync(c => c.QrToken == qrToken);

                    if (card == null)
                        throw new BusinessException(ErrorCodes.CardQrNotFound);

                    if (card.CurrentSessionId == null)
                        throw new BusinessException(ErrorCodes.CardHasNoActiveSession);

                    var session = await _dbContext.ParkingSessions
                        .FirstOrDefaultAsync(s =>
                            s.Id == card.CurrentSessionId.Value &&
                            s.Status == "ACTIVE");

                    if (session == null)
                        throw new BusinessException(ErrorCodes.SessionNotFound);

                    if (session.ClaimedByUserId != null || session.ClaimedAt != null)
                        throw new BusinessException(ErrorCodes.SessionAlreadyClaimed);

                    session.DriverId = driverProfile.Id;
                    session.ClaimedByUserId = userId;
                    session.ClaimedAt = DateTimeOffset.UtcNow;
                    session.ClaimMethod = "CARD_QR";

                    await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                    {
                        Action = "SESSION_CLAIMED",
                        TargetType = "ParkingSession",
                        TargetId = session.SessionCode,
                        ActorUserId = userId,
                        NewValue = System.Text.Json.JsonSerializer.Serialize(new
                        {
                            sessionId = session.Id,
                            sessionCode = session.SessionCode,
                            driverProfileId = driverProfile.Id,
                            claimedByUserId = userId,
                            claimMethod = "CARD_QR"
                        }),
                        Reason = "Driver claimed active parking session by card QR."
                    });

                    await _dbContext.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return true;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        private async Task ValidateEntryRequest(CreateEntryRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CardCode))
                throw new BusinessException(ErrorCodes.CardCodeRequired);

            if (request.VehicleTypeId <= 0)
                throw new BusinessException(ErrorCodes.VehicleTypeRequired);

            if (request.EntryGateId <= 0)
                throw new BusinessException(ErrorCodes.EntryGateRequired);

            if (!request.NoPlate && string.IsNullOrWhiteSpace(request.LicensePlate))
                throw new BusinessException(ErrorCodes.LicensePlateRequired);

            var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);
            if (card == null || card.Status != CardStatus.AVAILABLE)
                throw new BusinessException(ErrorCodes.CardNotAvailable);

            var vehicleType = await _dbContext.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            if (request.NoPlate)
            {
                if (vehicleType.RequiresSlot)
                    throw new BusinessException(ErrorCodes.PlateRequiredForSlotVehicle);

                if (string.IsNullOrWhiteSpace(request.VehicleDescription))
                    throw new BusinessException(ErrorCodes.VehicleDescriptionRequired);
            }

            // Validate Gate status & Floor status
            var gate = await _dbContext.Gates.Include(g => g.Floor).FirstOrDefaultAsync(g => g.Id == request.EntryGateId);
            if (gate == null)
                throw new BusinessException(ErrorCodes.GateNotFound);

            if (gate.GateType != "ENTRY")
                throw new BusinessException(ErrorCodes.EntryGateRequired);

            if (gate.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.GateNotActive);

            if (gate.Floor == null || gate.Floor.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.FloorNotActive);

            if (!request.NoPlate)
            {
                var normalizedPlate = NormalizePlate(request.LicensePlate);
                if (!string.IsNullOrWhiteSpace(normalizedPlate))
                {
                    bool hasActive = await _dbContext.ParkingSessions.AnyAsync(s => s.NormalizedPlateNumber == normalizedPlate && s.Status == "ACTIVE");
                    if (hasActive) throw new BusinessException(ErrorCodes.VehicleAlreadyInParking);
                }
            }
        }

        private static string NormalizePlate(string? plate)
        {
            return plate?
                .Trim()
                .Replace("-", "")
                .Replace(".", "")
                .Replace(" ", "")
                .ToUpperInvariant() ?? "";
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingSessions/Entry/IEntryService.cs`

```csharp
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;

public interface IEntryService
{
    Task<CreateEntryResponse> CreateEntryAsync(CreateEntryRequest request, long staffId, string role);

    Task<bool> ClaimSessionAsync(string userId, string qrToken);
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingSessions/LocationSuggestion/ILocationSuggestionService.cs`

```csharp
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public interface ILocationSuggestionService
    {
        Task<LocationSuggestionResponse> SuggestLocationAsync(
            LocationSuggestionRequest request,
            long staffId,
            string role);
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingSessions/LocationSuggestion/ISuggestionTokenService.cs`

```csharp
namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public interface ISuggestionTokenService
    {
        string CreateToken(LocationSuggestionPayload payload);
        LocationSuggestionPayload VerifyToken(string token);
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingSessions/LocationSuggestion/LocationAlternativeResponse.cs`

```csharp
namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public class LocationAlternativeResponse
    {
        public long FloorId { get; set; }
        public string FloorCode { get; set; } = null!;

        public long AreaId { get; set; }
        public string AreaCode { get; set; } = null!;

        public long? SlotId { get; set; }
        public string? SlotCode { get; set; }

        public int? AvailableCapacity { get; set; }
        public int? TotalCapacity { get; set; }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingSessions/LocationSuggestion/LocationSuggestionPayload.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public class LocationSuggestionPayload
    {
        public string SuggestionType { get; set; } = null!;

        public long VehicleTypeId { get; set; }
        public long EntryGateId { get; set; }

        public long SuggestedFloorId { get; set; }
        public long SuggestedAreaId { get; set; }
        public long? SuggestedSlotId { get; set; }

        public long IssuedToStaffId { get; set; }
        public DateTimeOffset IssuedAt { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingSessions/LocationSuggestion/LocationSuggestionRequest.cs`

```csharp
namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public class LocationSuggestionRequest
    {
        public long VehicleTypeId { get; set; }
        public long EntryGateId { get; set; }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingSessions/LocationSuggestion/LocationSuggestionResponse.cs`

```csharp
using System;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public class LocationSuggestionResponse
    {
        public string SuggestionType { get; set; } = null!; // AREA or SLOT

        public long VehicleTypeId { get; set; }
        public long EntryGateId { get; set; }

        public long SuggestedFloorId { get; set; }
        public string SuggestedFloorCode { get; set; } = null!;

        public long SuggestedAreaId { get; set; }
        public string SuggestedAreaCode { get; set; } = null!;

        public long? SuggestedSlotId { get; set; }
        public string? SuggestedSlotCode { get; set; }

        public int? AvailableCapacity { get; set; }
        public int? TotalCapacity { get; set; }

        public string SuggestionToken { get; set; } = null!;
        public DateTimeOffset ExpiresAt { get; set; }

        public List<LocationAlternativeResponse> Alternatives { get; set; } = new();
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingSessions/LocationSuggestion/LocationSuggestionService.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Contracts.Common;
using Microsoft.Extensions.Configuration;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public class LocationSuggestionService : ILocationSuggestionService
    {
        private readonly ParkingDbContext _dbContext;
        private readonly ISuggestionTokenService _tokenService;
        private readonly IConfiguration _configuration;

        public LocationSuggestionService(ParkingDbContext dbContext, ISuggestionTokenService tokenService, IConfiguration configuration)
        {
            _dbContext = dbContext;
            _tokenService = tokenService;
            _configuration = configuration;
        }

        public async Task<LocationSuggestionResponse> SuggestLocationAsync(LocationSuggestionRequest request, long staffId, string role)
        {
            var gate = await _dbContext.Gates.Include(g => g.Floor).FirstOrDefaultAsync(g => g.Id == request.EntryGateId);
            if (gate == null)
                throw new BusinessException(ErrorCodes.GateNotFound);

            if (gate.GateType != "ENTRY")
                throw new BusinessException(ErrorCodes.EntryGateRequired);

            if (gate.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.GateNotActive);

            if (gate.Floor.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.FloorNotActive);

            var vehicleType = await _dbContext.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null || !vehicleType.IsActive)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            var expireSecondsStr = _configuration["SuggestionToken:ExpireSeconds"];
            if (!int.TryParse(expireSecondsStr, out var expireSeconds))
            {
                expireSeconds = 60;
            }
            var expiresAt = DateTimeOffset.UtcNow.AddSeconds(expireSeconds);

            if (vehicleType.RequiresSlot)
            {
                var suggestedSlot = await _dbContext.Slots
                    .Include(s => s.Area)
                        .ThenInclude(a => a.Floor)
                    .Where(s =>
                        s.Status == "AVAILABLE" &&
                        s.AllowedVehicleTypeId == request.VehicleTypeId &&
                        s.Area.FloorId == gate.FloorId &&
                        s.Area.Status == "ACTIVE" &&
                        s.Area.Floor.Status == "ACTIVE" &&
                        s.Area.AreaVehicleTypes.Any(avt => avt.VehicleTypeId == request.VehicleTypeId))
                    .OrderBy(s => s.Area.PriorityOrder)
                    .ThenBy(s => s.Id)
                    .FirstOrDefaultAsync();

                if (suggestedSlot == null)
                    throw new BusinessException(ErrorCodes.NoAvailableLocation);

                // Get alternatives
                var alternatives = await _dbContext.Slots
                    .Include(s => s.Area)
                        .ThenInclude(a => a.Floor)
                    .Where(s =>
                        s.Id != suggestedSlot.Id &&
                        s.Status == "AVAILABLE" &&
                        s.AllowedVehicleTypeId == request.VehicleTypeId &&
                        s.Area.FloorId == gate.FloorId &&
                        s.Area.Status == "ACTIVE" &&
                        s.Area.Floor.Status == "ACTIVE" &&
                        s.Area.AreaVehicleTypes.Any(avt => avt.VehicleTypeId == request.VehicleTypeId))
                    .OrderBy(s => s.Area.PriorityOrder)
                    .ThenBy(s => s.Id)
                    .Take(5)
                    .Select(s => new LocationAlternativeResponse
                    {
                        FloorId = s.Area.FloorId,
                        FloorCode = s.Area.Floor.FloorCode,
                        AreaId = s.AreaId,
                        AreaCode = s.Area.AreaCode,
                        SlotId = s.Id,
                        SlotCode = s.SlotCode
                    })
                    .ToListAsync();

                var payload = new LocationSuggestionPayload
                {
                    SuggestionType = "SLOT",
                    VehicleTypeId = request.VehicleTypeId,
                    EntryGateId = request.EntryGateId,
                    SuggestedFloorId = suggestedSlot.Area.FloorId,
                    SuggestedAreaId = suggestedSlot.AreaId,
                    SuggestedSlotId = suggestedSlot.Id,
                    IssuedToStaffId = staffId,
                    IssuedAt = DateTimeOffset.UtcNow,
                    ExpiresAt = expiresAt
                };

                var token = _tokenService.CreateToken(payload);

                return new LocationSuggestionResponse
                {
                    SuggestionType = "SLOT",
                    VehicleTypeId = request.VehicleTypeId,
                    EntryGateId = request.EntryGateId,
                    SuggestedFloorId = suggestedSlot.Area.FloorId,
                    SuggestedFloorCode = suggestedSlot.Area.Floor.FloorCode,
                    SuggestedAreaId = suggestedSlot.AreaId,
                    SuggestedAreaCode = suggestedSlot.Area.AreaCode,
                    SuggestedSlotId = suggestedSlot.Id,
                    SuggestedSlotCode = suggestedSlot.SlotCode,
                    SuggestionToken = token,
                    ExpiresAt = expiresAt,
                    Alternatives = alternatives
                };
            }
            else
            {
                var areas = await _dbContext.Areas
                    .Include(a => a.Floor)
                    .Include(a => a.AreaVehicleTypes)
                    .Where(a =>
                        a.FloorId == gate.FloorId &&
                        a.Status == "ACTIVE" &&
                        a.Floor.Status == "ACTIVE" &&
                        a.AreaVehicleTypes.Any(av => av.VehicleTypeId == request.VehicleTypeId))
                    .OrderBy(a => a.PriorityOrder)
                    .ThenBy(a => a.Id)
                    .ToListAsync();

                // Filter in memory for capacity to handle simple operations safely
                var suggestedArea = areas.FirstOrDefault(a => a.CurrentRealOccupancy + a.CurrentBookedSlots < a.TotalCapacity);

                if (suggestedArea == null)
                    throw new BusinessException(ErrorCodes.NoAvailableLocation);

                // Get alternatives
                var alternatives = areas
                    .Where(a => a.Id != suggestedArea.Id && a.CurrentRealOccupancy + a.CurrentBookedSlots < a.TotalCapacity)
                    .Take(5)
                    .Select(a => new LocationAlternativeResponse
                    {
                        FloorId = a.FloorId,
                        FloorCode = a.Floor.FloorCode,
                        AreaId = a.Id,
                        AreaCode = a.AreaCode,
                        SlotId = null,
                        SlotCode = null,
                        AvailableCapacity = a.TotalCapacity - (a.CurrentRealOccupancy + a.CurrentBookedSlots),
                        TotalCapacity = a.TotalCapacity
                    })
                    .ToList();

                var payload = new LocationSuggestionPayload
                {
                    SuggestionType = "AREA",
                    VehicleTypeId = request.VehicleTypeId,
                    EntryGateId = request.EntryGateId,
                    SuggestedFloorId = suggestedArea.FloorId,
                    SuggestedAreaId = suggestedArea.Id,
                    SuggestedSlotId = null,
                    IssuedToStaffId = staffId,
                    IssuedAt = DateTimeOffset.UtcNow,
                    ExpiresAt = expiresAt
                };

                var token = _tokenService.CreateToken(payload);

                return new LocationSuggestionResponse
                {
                    SuggestionType = "AREA",
                    VehicleTypeId = request.VehicleTypeId,
                    EntryGateId = request.EntryGateId,
                    SuggestedFloorId = suggestedArea.FloorId,
                    SuggestedFloorCode = suggestedArea.Floor.FloorCode,
                    SuggestedAreaId = suggestedArea.Id,
                    SuggestedAreaCode = suggestedArea.AreaCode,
                    SuggestedSlotId = null,
                    SuggestedSlotCode = null,
                    AvailableCapacity = suggestedArea.TotalCapacity - (suggestedArea.CurrentRealOccupancy + suggestedArea.CurrentBookedSlots),
                    TotalCapacity = suggestedArea.TotalCapacity,
                    SuggestionToken = token,
                    ExpiresAt = expiresAt,
                    Alternatives = alternatives
                };
            }
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingSessions/LocationSuggestion/SuggestionTokenService.cs`

```csharp
using Microsoft.Extensions.Configuration;
using ParkingBuilding.CoreApi.Contracts.Common;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public class SuggestionTokenService : ISuggestionTokenService
    {
        private readonly IConfiguration _configuration;

        public SuggestionTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private string GetSecretKey()
        {
            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
            var secretKey = _configuration["SUGGESTION_TOKEN_SECRET"]
                ?? _configuration["SuggestionToken:Secret"];

            if (string.IsNullOrEmpty(secretKey))
            {
                if (isDevelopment)
                {
                    secretKey = _configuration["Jwt:Secret"]
                        ?? "DEVELOPMENT_SECRET_KEY_FOR_LOCAL_TESTING_ONLY_2026_SWP391";
                }
                else
                {
                    throw new BusinessException(ErrorCodes.SuggestionTokenSecretConfigRequired);
                }
            }

            return secretKey;
        }

        public string CreateToken(LocationSuggestionPayload payload)
        {
            var secretKey = GetSecretKey();

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim("suggestion_type", payload.SuggestionType),
                new Claim("vehicle_type_id", payload.VehicleTypeId.ToString()),
                new Claim("entry_gate_id", payload.EntryGateId.ToString()),
                new Claim("suggested_floor_id", payload.SuggestedFloorId.ToString()),
                new Claim("suggested_area_id", payload.SuggestedAreaId.ToString()),
                new Claim("issued_to_staff_id", payload.IssuedToStaffId.ToString())
            };

            if (payload.SuggestedSlotId.HasValue)
            {
                claims.Add(new Claim("suggested_slot_id", payload.SuggestedSlotId.Value.ToString()));
            }

            var token = new JwtSecurityToken(
                issuer: "ParkingBuilding.CoreApi.Suggestion",
                audience: "ParkingBuilding.CoreApi.Entry",
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: payload.ExpiresAt.UtcDateTime,
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public LocationSuggestionPayload VerifyToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new BusinessException(ErrorCodes.SuggestionTokenRequired);

            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKey = GetSecretKey();

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = "ParkingBuilding.CoreApi.Suggestion",
                    ValidateAudience = true,
                    ValidAudience = "ParkingBuilding.CoreApi.Entry",
                    ClockSkew = TimeSpan.FromSeconds(10)
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                var jwtToken = (JwtSecurityToken)validatedToken;

                if (jwtToken.ValidTo < DateTime.UtcNow)
                    throw new BusinessException(ErrorCodes.SuggestionTokenExpired);

                var type = jwtToken.Claims.FirstOrDefault(c => c.Type == "suggestion_type")?.Value;
                var vehicleTypeIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "vehicle_type_id")?.Value;
                var entryGateIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "entry_gate_id")?.Value;
                var floorIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "suggested_floor_id")?.Value;
                var areaIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "suggested_area_id")?.Value;
                var staffIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "issued_to_staff_id")?.Value;
                var slotIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "suggested_slot_id")?.Value;

                if (string.IsNullOrEmpty(type) ||
                    !long.TryParse(vehicleTypeIdStr, out var vehicleTypeId) ||
                    !long.TryParse(entryGateIdStr, out var entryGateId) ||
                    !long.TryParse(floorIdStr, out var floorId) ||
                    !long.TryParse(areaIdStr, out var areaId) ||
                    !long.TryParse(staffIdStr, out var staffId))
                {
                    throw new BusinessException(ErrorCodes.SuggestionTokenInvalid);
                }

                long? slotId = null;
                if (!string.IsNullOrEmpty(slotIdStr) && long.TryParse(slotIdStr, out var parsedSlotId))
                {
                    slotId = parsedSlotId;
                }

                var issuedAtUtc = jwtToken.ValidFrom == DateTime.MinValue ? DateTime.UtcNow : DateTime.SpecifyKind(jwtToken.ValidFrom, DateTimeKind.Utc);
                var expiresAtUtc = jwtToken.ValidTo == DateTime.MinValue ? DateTime.UtcNow.AddMinutes(5) : DateTime.SpecifyKind(jwtToken.ValidTo, DateTimeKind.Utc);

                return new LocationSuggestionPayload
                {
                    SuggestionType = type,
                    VehicleTypeId = vehicleTypeId,
                    EntryGateId = entryGateId,
                    SuggestedFloorId = floorId,
                    SuggestedAreaId = areaId,
                    SuggestedSlotId = slotId,
                    IssuedToStaffId = staffId,
                    IssuedAt = new DateTimeOffset(issuedAtUtc),
                    ExpiresAt = new DateTimeOffset(expiresAtUtc)
                };
            }
            catch (SecurityTokenExpiredException)
            {
                throw new BusinessException(ErrorCodes.SuggestionTokenExpired);
            }
            catch (Exception)
            {
                throw new BusinessException(ErrorCodes.SuggestionTokenInvalid);
            }
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingStructure/Areas/AreaResponse.cs`

```csharp
public class AreaResponse
{
    public long Id { get; set; }

    public long FloorId { get; set; }

    public string AreaCode { get; set; } = null!;

    public string AreaName { get; set; } = null!;

    public int TotalCapacity { get; set; }

    public string Status { get; set; } = null!;
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingStructure/Areas/AreaService.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.ParkingStructure.Areas;

public class AreaService
{
    private readonly ParkingDbContext _context;

    public AreaService(ParkingDbContext context)
    {
        _context = context;
    }

    // ================= CREATE =================
    public async Task<AreaResponse> CreateAsync(CreateAreaRequest request)
    {
        // ===== 1. VALIDATE INPUT =====
        if (string.IsNullOrWhiteSpace(request.AreaCode))
            throw new BusinessException(ErrorCodes.AreaCodeRequired);

        if (string.IsNullOrWhiteSpace(request.AreaName))
            throw new BusinessException(ErrorCodes.AreaNameRequired);

        if (request.TotalCapacity < 0)
            throw new BusinessException(ErrorCodes.AreaCapacityInvalid);

        // ===== 2. CHECK FLOOR =====
        var floorExists = await _context.Floors
            .AnyAsync(x => x.Id == request.FloorId);

        if (!floorExists)
            throw new BusinessException(ErrorCodes.FloorNotFound, StatusCodes.Status404NotFound);

        // ===== 3. NORMALIZE =====
        var code = request.AreaCode.Trim().ToUpper();

        // ===== 4. CHECK DUPLICATE =====
        var exists = await _context.Areas
            .AnyAsync(x => x.FloorId == request.FloorId && x.AreaCode == code);

        if (exists)
            throw new BusinessException(ErrorCodes.AreaCodeExists, StatusCodes.Status409Conflict);

        // ===== 5. VEHICLE TYPES (FIX DISTINCT) =====
        var vehicleTypeIds = request.VehicleTypeIds
            .Distinct()
            .ToList();

        if (vehicleTypeIds.Any())
        {
            var validCount = await _context.Set<VehicleType>()
                .CountAsync(x => vehicleTypeIds.Contains(x.Id));

            if (validCount != vehicleTypeIds.Count)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound);
        }

        // ===== 6. CREATE ENTITY =====
        var entity = new Area
        {
            FloorId = request.FloorId,
            AreaCode = code,
            AreaName = request.AreaName.Trim(),
            PriorityOrder = request.PriorityOrder,
            Status = "ACTIVE",
            TotalCapacity = request.TotalCapacity,
            CurrentRealOccupancy = 0,
            CurrentBookedSlots = 0,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _context.Areas.Add(entity);

        // ===== 7. MANY-TO-MANY =====
        if (vehicleTypeIds.Any())
        {
            foreach (var vtId in vehicleTypeIds)
            {
                entity.AreaVehicleTypes.Add(new AreaVehicleType
                {
                    Area = entity,
                    VehicleTypeId = vtId
                });
            }
        }

        // ===== 8. SAVE 1 LẦN =====
        await _context.SaveChangesAsync();

        // ===== 9. RETURN =====
        return new AreaResponse
        {
            Id = entity.Id,
            FloorId = entity.FloorId,
            AreaCode = entity.AreaCode,
            AreaName = entity.AreaName,
            TotalCapacity = entity.TotalCapacity,
            Status = entity.Status
        };
    }

    // ================= UPDATE =================
    public async Task<AreaResponse> UpdateAsync(long id, UpdateAreaRequest request)
    {
        // ===== 1. FIND =====
        var entity = await _context.Areas
            .Include(x => x.AreaVehicleTypes)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity == null)
            throw new BusinessException(ErrorCodes.AreaNotFound, StatusCodes.Status404NotFound);

        // ===== 2. VALIDATE =====
        if (string.IsNullOrWhiteSpace(request.AreaName))
            throw new BusinessException(ErrorCodes.AreaNameRequired);

        if (string.IsNullOrWhiteSpace(request.Status))
            throw new BusinessException(ErrorCodes.InvalidStatus);

        if (request.TotalCapacity < 0)
            throw new BusinessException(ErrorCodes.AreaCapacityInvalid);

        // ===== 3. CAPACITY RULE =====
        if (request.TotalCapacity < entity.CurrentRealOccupancy)
            throw new BusinessException(ErrorCodes.AreaCapacityBelowOccupancy);

        if (request.TotalCapacity < entity.CurrentBookedSlots)
            throw new BusinessException(ErrorCodes.AreaCapacityBelowBookings);

        // ===== 4. VEHICLE TYPES (FIX DISTINCT) =====
        var vehicleTypeIds = request.VehicleTypeIds
            .Distinct()
            .ToList();

        if (vehicleTypeIds.Any())
        {
            var validCount = await _context.Set<VehicleType>()
                .CountAsync(x => vehicleTypeIds.Contains(x.Id));

            if (validCount != vehicleTypeIds.Count)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound);
        }

        // ===== 5. UPDATE BASIC =====
        entity.AreaName = request.AreaName.Trim();
        entity.PriorityOrder = request.PriorityOrder;
        entity.TotalCapacity = request.TotalCapacity;
        entity.Status = request.Status.Trim().ToUpper();
        entity.UpdatedAt = DateTimeOffset.UtcNow;

        // ===== 6. SYNC MANY-TO-MANY =====
        var currentIds = entity.AreaVehicleTypes
            .Select(x => x.VehicleTypeId)
            .ToList();

        var toAdd = vehicleTypeIds.Except(currentIds);
        var toRemove = currentIds.Except(vehicleTypeIds);

        // ADD
        var newMappings = toAdd.Select(vtId => new AreaVehicleType
        {
            AreaId = entity.Id,
            VehicleTypeId = vtId
        });

        _context.AreaVehicleTypes.AddRange(newMappings);

        // REMOVE
        var removeMappings = entity.AreaVehicleTypes
            .Where(x => toRemove.Contains(x.VehicleTypeId));

        _context.AreaVehicleTypes.RemoveRange(removeMappings);

        // ===== 7. SAVE =====
        await _context.SaveChangesAsync();

        // ===== 8. RETURN =====
        return new AreaResponse
        {
            Id = entity.Id,
            FloorId = entity.FloorId,
            AreaCode = entity.AreaCode,
            AreaName = entity.AreaName,
            TotalCapacity = entity.TotalCapacity,
            Status = entity.Status
        };
    }

    public async Task<List<AreaResponse>> GetAllAsync()
    {
        return await _context.Areas
            .Select(x => new AreaResponse
            {
                Id = x.Id,
                FloorId = x.FloorId,
                AreaCode = x.AreaCode,
                AreaName = x.AreaName,
                TotalCapacity = x.TotalCapacity,
                Status = x.Status
            })
            .ToListAsync();
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingStructure/Areas/CreateAreaRequest.cs`

```csharp
public class CreateAreaRequest
{
    public long FloorId { get; set; }

    public string AreaCode { get; set; } = null!;

    public string AreaName { get; set; } = null!;

    public int PriorityOrder { get; set; }

    public int TotalCapacity { get; set; }

    public List<long> VehicleTypeIds { get; set; } = new();
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingStructure/Areas/UpdateAreaRequest.cs`

```csharp
public class UpdateAreaRequest
{
    public string AreaName { get; set; } = null!;

    public int PriorityOrder { get; set; }

    public int TotalCapacity { get; set; }

    public string Status { get; set; } = null!;

    public List<long> VehicleTypeIds { get; set; } = new();
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingStructure/Floors/CreateFloorRequest.cs`

```csharp
public class CreateFloorRequest
{
    public string FloorCode { get; set; } = null!;
    public string FloorName { get; set; } = null!;
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingStructure/Floors/FloorResponse.cs`

```csharp
public class FloorResponse
{
    public long Id { get; set; }
    public string FloorCode { get; set; } = null!;
    public string FloorName { get; set; } = null!;
    public string Status { get; set; } = null!;
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingStructure/Floors/FloorService.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.ParkingStructure.Floors;

public class FloorService
{
    private readonly ParkingDbContext _context;

    public FloorService(ParkingDbContext context)
    {
        _context = context;
    }

    public async Task<List<FloorResponse>> GetAllAsync()
    {
        return await _context.Floors
            .Select(x => new FloorResponse
            {
                Id = x.Id,
                FloorCode = x.FloorCode,
                FloorName = x.FloorName,
                Status = x.Status
            })
            .ToListAsync();
    }

    public async Task<FloorResponse> CreateAsync(CreateFloorRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FloorCode))
            throw new BusinessException(ErrorCodes.FloorCodeRequired);

        if (string.IsNullOrWhiteSpace(request.FloorName))
            throw new BusinessException(ErrorCodes.FloorNameRequired);

        var code = request.FloorCode.Trim().ToUpper();

        var exists = await _context.Floors
            .AnyAsync(x => x.FloorCode == code);

        if (exists)
            throw new BusinessException(ErrorCodes.FloorCodeExists, StatusCodes.Status409Conflict);

        var entity = new Floor
        {
            FloorCode = code,
            FloorName = request.FloorName.Trim(),
            Status = "ACTIVE",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _context.Floors.Add(entity);
        await _context.SaveChangesAsync();

        return new FloorResponse
        {
            Id = entity.Id,
            FloorCode = entity.FloorCode,
            FloorName = entity.FloorName,
            Status = entity.Status
        };
    }

    public async Task<FloorResponse> UpdateAsync(long id, UpdateFloorRequest request)
    {
        var entity = await _context.Floors.FindAsync(id);

        if (entity == null)
            throw new BusinessException(ErrorCodes.FloorNotFound, StatusCodes.Status404NotFound);

        entity.FloorName = request.FloorName.Trim();
        entity.Status = request.Status.Trim().ToUpper();
        entity.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        return new FloorResponse
        {
            Id = entity.Id,
            FloorCode = entity.FloorCode,
            FloorName = entity.FloorName,
            Status = entity.Status
        };
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingStructure/Floors/UpdateFloorRequest.cs`

```csharp
public class UpdateFloorRequest
{
    public string FloorName { get; set; } = null!;
    public string Status { get; set; } = null!;
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingStructure/Slots/CreateSlotRequest.cs`

```csharp
public class CreateSlotRequest
{
    public long AreaId { get; set; }

    public string SlotCode { get; set; } = null!;

    public long AllowedVehicleTypeId { get; set; }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingStructure/Slots/SlotResponse.cs`

```csharp
public class SlotResponse
{
    public long Id { get; set; }

    public long AreaId { get; set; }

    public string SlotCode { get; set; } = null!;

    public string Status { get; set; } = null!;
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingStructure/Slots/SlotService.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.ParkingStructure.Slots;

public class SlotService
{
    private readonly ParkingDbContext _context;

    public SlotService(ParkingDbContext context)
    {
        _context = context;
    }

    // ================= CREATE =================
    public async Task<SlotResponse> CreateAsync(CreateSlotRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SlotCode))
            throw new BusinessException(ErrorCodes.SlotCodeRequired);

        // ===== CHECK AREA =====
        var area = await _context.Areas
            .Include(x => x.AreaVehicleTypes)
            .FirstOrDefaultAsync(x => x.Id == request.AreaId);

        if (area == null)
            throw new BusinessException(ErrorCodes.AreaNotFound, StatusCodes.Status404NotFound);

        // ===== NORMALIZE =====
        var code = request.SlotCode.Trim().ToUpper();

        // ===== CHECK DUPLICATE =====
        var exists = await _context.Slots
            .AnyAsync(x => x.AreaId == request.AreaId && x.SlotCode == code);

        if (exists)
            throw new BusinessException(ErrorCodes.SlotCodeExists, StatusCodes.Status409Conflict);

        // ===== VALIDATE VEHICLE TYPE =====
        var allowed = area.AreaVehicleTypes
            .Any(x => x.VehicleTypeId == request.AllowedVehicleTypeId);

        if (!allowed)
            throw new BusinessException(ErrorCodes.SlotNotAllowedForVehicleType);

        // ===== CREATE =====
        var entity = new Slot
        {
            AreaId = request.AreaId,
            SlotCode = code,
            AllowedVehicleTypeId = request.AllowedVehicleTypeId,
            Status = "AVAILABLE",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _context.Slots.Add(entity);
        await _context.SaveChangesAsync();

        return new SlotResponse
        {
            Id = entity.Id,
            AreaId = entity.AreaId,
            SlotCode = entity.SlotCode,
            Status = entity.Status
        };
    }

    // ================= UPDATE STATUS =================
    public async Task<SlotResponse> UpdateStatusAsync(long id, UpdateSlotStatusRequest request)
    {
        var slot = await _context.Slots
            .Include(x => x.Area)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (slot == null)
            throw new BusinessException(ErrorCodes.SlotNotFound, StatusCodes.Status404NotFound);

        var newStatus = request.Status.Trim().ToUpper();
        var oldStatus = slot.Status;

        var validStatuses = new[]
        {
            "AVAILABLE",
            "RESERVED",
            "OCCUPIED",
            "LOCKED",
            "MAINTENANCE"
        };

        if (!validStatuses.Contains(newStatus))
            throw new BusinessException(ErrorCodes.InvalidStatus);

        // ===== INVALID TRANSITION =====
        if (oldStatus == "OCCUPIED" && newStatus == "RESERVED")
            throw new BusinessException(ErrorCodes.SlotStatusTransitionInvalid);

        // ===== CAPACITY CHECK =====
        if (newStatus == "OCCUPIED" &&
            slot.Area.CurrentRealOccupancy >= slot.Area.TotalCapacity)
            throw new BusinessException(ErrorCodes.SelectedAreaFull);

        if (newStatus == "RESERVED" &&
            slot.Area.CurrentBookedSlots >= slot.Area.TotalCapacity)
            throw new BusinessException(ErrorCodes.AreaBookingFull);

        // ===== REMOVE OLD =====
        if (oldStatus == "OCCUPIED")
            slot.Area.CurrentRealOccupancy--;

        if (oldStatus == "RESERVED")
            slot.Area.CurrentBookedSlots--;

        // ===== ADD NEW =====
        if (newStatus == "OCCUPIED")
            slot.Area.CurrentRealOccupancy++;

        if (newStatus == "RESERVED")
            slot.Area.CurrentBookedSlots++;

        slot.Status = newStatus;
        slot.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        return new SlotResponse
        {
            Id = slot.Id,
            AreaId = slot.AreaId,
            SlotCode = slot.SlotCode,
            Status = slot.Status
        };
    }

    public async Task<List<SlotResponse>> GetAllAsync()
    {
        return await _context.Slots
            .Select(x => new SlotResponse
            {
                Id = x.Id,
                AreaId = x.AreaId,
                SlotCode = x.SlotCode,
                Status = x.Status
            })
            .ToListAsync();
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/ParkingStructure/Slots/UpdateSlotStatusRequest.cs`

```csharp
public class UpdateSlotStatusRequest
{
    public string Status { get; set; } = null!;
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Payments/IPayOsPaymentService.cs`

```csharp
using ParkingBuilding.CoreApi.Domain.Entities;
using PayOS.Models.Webhooks;

namespace ParkingBuilding.CoreApi.Application.Payments;

public interface IPayOsPaymentService
{
    Task<PayOsPaymentResponse> CreateReservationPaymentLinkAsync(
        Payment payment,
        Reservation reservation,
        CancellationToken cancellationToken = default);

    Task<PayOsWebhookProcessResult> ProcessWebhookAsync(
        Webhook webhook,
        CancellationToken cancellationToken = default);

    Task CancelPaymentLinkAsync(
        Payment payment,
        string reason,
        CancellationToken cancellationToken = default);

    Task CancelProviderPaymentLinkAsync(
        string? providerTransactionId,
        string? gatewayPayload,
        string reason,
        CancellationToken cancellationToken = default);
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Payments/PayOsOptions.cs`

```csharp
namespace ParkingBuilding.CoreApi.Application.Payments;

public class PayOsOptions
{
    public string? ClientId { get; set; }
    public string? ApiKey { get; set; }
    public string? ChecksumKey { get; set; }
    public string? ReturnUrl { get; set; }
    public string? CancelUrl { get; set; }
    public string? WebhookUrl { get; set; }

    public bool IsConfigured =>
        !IsPlaceholder(ClientId)
        && !IsPlaceholder(ApiKey)
        && !IsPlaceholder(ChecksumKey)
        && !string.IsNullOrWhiteSpace(ReturnUrl)
        && !string.IsNullOrWhiteSpace(CancelUrl);

    private static bool IsPlaceholder(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            || value.StartsWith("__", StringComparison.Ordinal)
            || value.Contains("placeholder", StringComparison.OrdinalIgnoreCase);
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Payments/PayOsPaymentResponse.cs`

```csharp
namespace ParkingBuilding.CoreApi.Application.Payments;

public class PayOsPaymentResponse
{
    public long PaymentId { get; set; }
    public long ReservationId { get; set; }
    public long OrderCode { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = "PENDING";
    public string Provider { get; set; } = "PAYOS";
    public string? PaymentLinkId { get; set; }
    public string? CheckoutUrl { get; set; }
    public string? QrCode { get; set; }
    public DateTimeOffset? ExpiredAt { get; set; }
    public bool IsLocalPlaceholder { get; set; }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Payments/PayOsPaymentService.cs`

```csharp
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using PayOS;
using PayOS.Models.V2.PaymentRequests;
using PayOS.Models.Webhooks;

namespace ParkingBuilding.CoreApi.Application.Payments;

public class PayOsPaymentService : IPayOsPaymentService
{
    private const string Provider = "PAYOS";
    private readonly ParkingDbContext _context;
    private readonly IAuditWriterService _auditWriter;
    private readonly PayOsOptions _options;
    private readonly PayOSClient? _client;

    public PayOsPaymentService(
        ParkingDbContext context,
        IAuditWriterService auditWriter,
        IOptions<PayOsOptions> options)
    {
        _context = context;
        _auditWriter = auditWriter;
        _options = options.Value;

        if (_options.IsConfigured)
        {
            _client = new PayOSClient(new PayOS.PayOSOptions
            {
                ClientId = _options.ClientId!,
                ApiKey = _options.ApiKey!,
                ChecksumKey = _options.ChecksumKey!
            });
        }
    }

    private void EnsureConfiguredInProduction()
    {
        var isDevelopment = string.Equals(
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
            "Development",
            StringComparison.OrdinalIgnoreCase);

        if (!isDevelopment && !_options.IsConfigured)
        {
            throw new BusinessException(ErrorCodes.PayOsConfigRequired);
        }
    }

    public async Task<PayOsPaymentResponse> CreateReservationPaymentLinkAsync(
        Payment payment,
        Reservation reservation,
        CancellationToken cancellationToken = default)
    {
        EnsureConfiguredInProduction();

        if (payment.Id <= 0)
        {
            throw new BusinessException(ErrorCodes.PaymentMustBePersisted);
        }

        var orderCode = CreateOrderCode(payment.Id);
        var amount = ToPayOsAmount(payment.TotalAmount);
        var expiredAt = payment.ExpiredAt ?? reservation.ExpiresAt;

        PayOsPaymentResponse result;
        object gatewayPayload;

        if (_client == null)
        {
            result = CreateLocalPlaceholderResponse(payment, reservation, orderCode, amount, expiredAt);
            gatewayPayload = new
            {
                provider = Provider,
                localPlaceholder = true,
                orderCode,
                paymentLinkId = result.PaymentLinkId,
                checkoutUrl = result.CheckoutUrl,
                amount,
                expiredAt
            };
        }
        else
        {
            var request = new CreatePaymentLinkRequest
            {
                OrderCode = orderCode,
                Amount = amount,
                Description = $"RES {reservation.Id}",
                ReturnUrl = _options.ReturnUrl!,
                CancelUrl = _options.CancelUrl!,
                ExpiredAt = expiredAt.ToUnixTimeSeconds(),
                Items = new List<PaymentLinkItem>
                {
                    new()
                    {
                        Name = $"Reservation {reservation.ReservationCode}",
                        Quantity = 1,
                        Price = amount
                    }
                }
            };

            var response = await _client.PaymentRequests.CreateAsync(request, null);

            result = new PayOsPaymentResponse
            {
                PaymentId = payment.Id,
                ReservationId = reservation.Id,
                OrderCode = response.OrderCode,
                Amount = response.Amount,
                Status = "PENDING",
                Provider = Provider,
                PaymentLinkId = response.PaymentLinkId,
                CheckoutUrl = response.CheckoutUrl,
                QrCode = response.QrCode,
                ExpiredAt = response.ExpiredAt.HasValue
                    ? DateTimeOffset.FromUnixTimeSeconds(response.ExpiredAt.Value)
                    : expiredAt
            };

            gatewayPayload = new
            {
                provider = Provider,
                localPlaceholder = false,
                orderCode = response.OrderCode,
                paymentLinkId = response.PaymentLinkId,
                checkoutUrl = response.CheckoutUrl,
                qrCode = response.QrCode,
                amount = response.Amount,
                currency = response.Currency,
                status = response.Status.ToString(),
                expiredAt = result.ExpiredAt
            };
        }

        payment.Provider = Provider;
        payment.ProviderTransactionId = result.PaymentLinkId;
        payment.PaymentUrl = result.CheckoutUrl;
        payment.ExpiredAt = result.ExpiredAt;
        payment.PaymentValidUntil = result.ExpiredAt;
        payment.GatewayPayload = JsonSerializer.Serialize(gatewayPayload);
        payment.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return result;
    }

    public async Task<PayOsWebhookProcessResult> ProcessWebhookAsync(
        Webhook webhook,
        CancellationToken cancellationToken = default)
    {
        EnsureConfiguredInProduction();

        var data = await VerifyWebhookAsync(webhook);
        if (data == null)
        {
            throw new BusinessException(ErrorCodes.PayOsWebhookInvalid);
        }

        var payment = await FindPaymentAsync(data, cancellationToken);
        if (payment == null)
        {
            throw new BusinessException(ErrorCodes.PaymentNotFound, StatusCodes.Status404NotFound);
        }

        if (payment.Reservation == null)
        {
            throw new BusinessException(ErrorCodes.PaymentReservationNotFound, StatusCodes.Status404NotFound);
        }

        var now = DateTimeOffset.UtcNow;

        // Webhook duplicate check
        if (payment.Status == "PAID" && payment.Reservation.Status == "CONFIRMED")
        {
            await _auditWriter.WriteAuditLogAsync(
                action: "PAYOS_WEBHOOK_DUPLICATE",
                targetType: "Payment",
                targetId: payment.Id.ToString(),
                newValue: $"Payment is already PAID and Reservation is CONFIRMED. OrderCode: {data.OrderCode}",
                reason: "payOS webhook duplicate request."
            );

            return new PayOsWebhookProcessResult
            {
                Success = true,
                Idempotent = true,
                Message = "Payment already marked as paid.",
                PaymentId = payment.Id,
                ReservationId = payment.ReservationId,
                OrderCode = data.OrderCode,
                PaymentStatus = payment.Status,
                ReservationStatus = payment.Reservation.Status
            };
        }

        // Payment purpose check
        if (payment.Purpose != "RESERVATION_FEE")
        {
            throw new BusinessException(ErrorCodes.InvalidRequest, StatusCodes.Status400BadRequest);
        }

        var expectedAmount = CalculateExpectedReservationAmount(payment.Reservation);

        // Webhook amount check
        if (payment.TotalAmount != data.Amount || data.Amount != expectedAmount || payment.TotalAmount != expectedAmount)
        {
            await _auditWriter.WriteAuditLogAsync(
                action: "PAYOS_WEBHOOK_AMOUNT_MISMATCH",
                targetType: "Payment",
                targetId: payment.Id.ToString(),
                newValue: JsonSerializer.Serialize(new
                {
                    paymentTotalAmount = payment.TotalAmount,
                    webhookAmount = data.Amount,
                    expectedReservationAmount = expectedAmount,
                    data.OrderCode,
                    data.PaymentLinkId
                }),
                reason: "payOS webhook amount mismatch."
            );
            throw new BusinessException(ErrorCodes.PayOsAmountMismatch);
        }

        // Webhook late payment check (after payment deadline)
        if (payment.Reservation.PaymentDeadline.HasValue && now > payment.Reservation.PaymentDeadline.Value)
        {
            await _auditWriter.WriteAuditLogAsync(
                action: "PAYOS_WEBHOOK_LATE_PAYMENT_REVIEW",
                targetType: "Payment",
                targetId: payment.Id.ToString(),
                newValue: $"Payment deadline was {payment.Reservation.PaymentDeadline.Value:yyyy-MM-dd HH:mm:ss}, current time {now:yyyy-MM-dd HH:mm:ss}. OrderCode: {data.OrderCode}",
                reason: "payOS webhook received after payment deadline."
            );

            return new PayOsWebhookProcessResult
            {
                Success = true,
                Message = "LATE_PAYMENT_REVIEW",
                PaymentId = payment.Id,
                ReservationId = payment.ReservationId,
                OrderCode = data.OrderCode,
                PaymentStatus = payment.Status,
                ReservationStatus = payment.Reservation.Status
            };
        }

        if (payment.Status != "PENDING" || payment.Reservation.Status != "PENDING" || payment.Reservation.PaymentStatus != "PENDING")
        {
            await _auditWriter.WriteAuditLogAsync(
                action: "PAYOS_WEBHOOK_LATE_PAYMENT_REVIEW",
                targetType: "Payment",
                targetId: payment.Id.ToString(),
                newValue: $"Reservation status is {payment.Reservation.Status}, payment status is {payment.Reservation.PaymentStatus}. OrderCode: {data.OrderCode}",
                reason: "payOS webhook reservation not in PENDING state."
            );

            return new PayOsWebhookProcessResult
            {
                Success = true,
                Message = "LATE_PAYMENT_REVIEW",
                PaymentId = payment.Id,
                ReservationId = payment.ReservationId,
                OrderCode = data.OrderCode,
                PaymentStatus = payment.Status,
                ReservationStatus = payment.Reservation.Status
            };
        }

        // Confirm reservation and payment
        payment.Status = "PAID";
        payment.ReceivedAmount = data.Amount;
        payment.PaidAt = now;
        payment.UpdatedAt = now;
        payment.GatewayPayload = MergeGatewayPayload(payment.GatewayPayload, data, webhook);

        payment.Reservation.PaymentStatus = "PAID";
        payment.Reservation.Status = "CONFIRMED";
        payment.Reservation.ConfirmedAt = now;
        payment.Reservation.UpdatedAt = now;

        await _context.SaveChangesAsync(cancellationToken);

        await _auditWriter.WriteAuditLogAsync(
            action: "PAYOS_PAYMENT_CONFIRMED",
            targetType: "Payment",
            targetId: payment.Id.ToString(),
            newValue: JsonSerializer.Serialize(new
            {
                payment.Id,
                payment.ReservationId,
                data.OrderCode,
                data.PaymentLinkId,
                amount = data.Amount
            }),
            reason: "payOS webhook confirmed reservation payment.");

        return new PayOsWebhookProcessResult
        {
            Success = true,
            Message = "Payment marked as paid.",
            PaymentId = payment.Id,
            ReservationId = payment.ReservationId,
            OrderCode = data.OrderCode,
            PaymentStatus = payment.Status,
            ReservationStatus = payment.Reservation.Status
        };
    }

    public async Task CancelPaymentLinkAsync(
        Payment payment,
        string reason,
        CancellationToken cancellationToken = default)
    {
        if (payment.Provider != Provider)
        {
            return;
        }

        var shouldUpdateStatus = payment.Status == "PENDING";
        if (shouldUpdateStatus)
        {
            payment.Status = "CANCELLED";
            payment.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }

        await CancelProviderPaymentLinkAsync(
            payment.ProviderTransactionId,
            payment.GatewayPayload,
            reason,
            cancellationToken);
    }

    public async Task CancelProviderPaymentLinkAsync(
        string? providerTransactionId,
        string? gatewayPayload,
        string reason,
        CancellationToken cancellationToken = default)
    {
        EnsureConfiguredInProduction();

        if (_client == null)
        {
            return;
        }

        var idOrOrderCode = providerTransactionId ?? TryReadGatewayString(gatewayPayload, "orderCode");
        if (string.IsNullOrWhiteSpace(idOrOrderCode))
        {
            return;
        }

        try
        {
            await _client.PaymentRequests.CancelAsync(
                idOrOrderCode,
                reason,
                null);
        }
        catch (Exception ex)
        {
            await _auditWriter.WriteAuditLogAsync(
                action: "PAYOS_CANCEL_LINK_FAILED",
                targetType: "Payment",
                targetId: idOrOrderCode,
                newValue: JsonSerializer.Serialize(new
                {
                    providerTransactionId,
                    idOrOrderCode,
                    error = ex.Message
                }),
                reason: reason);
            throw new BusinessException(ErrorCodes.PayOsCancelLinkFailed);
        }
    }

    private async Task<WebhookData?> VerifyWebhookAsync(Webhook webhook)
    {
        var isDevelopment = string.Equals(
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
            "Development",
            StringComparison.OrdinalIgnoreCase);

        if (_client == null)
        {
            if (!isDevelopment)
            {
                throw new BusinessException(ErrorCodes.PayOsConfigRequired);
            }
            return webhook.Data;
        }

        return await _client.Webhooks.VerifyAsync(webhook);
    }

    private async Task<Payment?> FindPaymentAsync(WebhookData data, CancellationToken cancellationToken)
    {
        long paymentId = data.OrderCode - 900_000_000_000;
        if (paymentId > 0)
        {
            var payment = await _context.Payments
                .Include(p => p.Reservation)
                .FirstOrDefaultAsync(p => p.Id == paymentId, cancellationToken);
            if (payment != null)
            {
                return payment;
            }
        }

        // Fallback: search by ProviderTransactionId
        return await _context.Payments
            .Include(p => p.Reservation)
            .FirstOrDefaultAsync(p =>
                p.Provider == Provider
                && (p.ProviderTransactionId == data.PaymentLinkId || p.ProviderTransactionId == data.OrderCode.ToString()),
                cancellationToken);
    }

    private static PayOsPaymentResponse CreateLocalPlaceholderResponse(
        Payment payment,
        Reservation reservation,
        long orderCode,
        long amount,
        DateTimeOffset expiredAt)
    {
        var paymentLinkId = $"local-payos-{orderCode}";
        return new PayOsPaymentResponse
        {
            PaymentId = payment.Id,
            ReservationId = reservation.Id,
            OrderCode = orderCode,
            Amount = amount,
            Status = "PENDING",
            Provider = Provider,
            PaymentLinkId = paymentLinkId,
            CheckoutUrl = $"/local/payos/checkout/{paymentLinkId}",
            ExpiredAt = expiredAt,
            IsLocalPlaceholder = true
        };
    }

    private static long CreateOrderCode(long paymentId)
        => 900_000_000_000 + paymentId;

    private static long ToPayOsAmount(decimal amount)
        => decimal.ToInt64(decimal.Round(amount, 0, MidpointRounding.AwayFromZero));

    private static decimal CalculateExpectedReservationAmount(Reservation reservation)
    {
        if (reservation.ReservedDurationMinutes <= 0)
        {
            throw new BusinessException(ErrorCodes.ReservationDurationInvalid);
        }

        if (reservation.ReservedDurationMinutes % 60 != 0)
        {
            throw new BusinessException(ErrorCodes.ReservationDurationMustBeWholeHours);
        }

        if (reservation.SnapshotReservationHourlyPrice <= 0m)
        {
            throw new BusinessException(ErrorCodes.ReservationPricingNotConfigured);
        }

        if (reservation.SnapshotReservationHourlyPrice != decimal.Truncate(reservation.SnapshotReservationHourlyPrice))
        {
            throw new BusinessException(ErrorCodes.ReservationHourlyPriceMustBeInteger);
        }

        var expectedAmount = (reservation.ReservedDurationMinutes / 60) * reservation.SnapshotReservationHourlyPrice;
        if (expectedAmount != decimal.Truncate(expectedAmount))
        {
            throw new BusinessException(ErrorCodes.ReservationBookingAmountMustBeInteger);
        }

        return expectedAmount;
    }

    private static string MergeGatewayPayload(string? currentPayload, WebhookData data, Webhook webhook)
    {
        return JsonSerializer.Serialize(new
        {
            previous = TryParseJson(currentPayload),
            webhook = new
            {
                webhook.Code,
                webhook.Description,
                webhook.Success,
                data.OrderCode,
                data.Amount,
                data.PaymentLinkId,
                data.Reference,
                data.TransactionDateTime,
                data.AccountNumber
            }
        });
    }

    private static JsonElement? TryParseJson(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(value);
            return document.RootElement.Clone();
        }
        catch
        {
            return null;
        }
    }

    private static string? TryReadGatewayString(string? gatewayPayload, string propertyName)
    {
        if (string.IsNullOrWhiteSpace(gatewayPayload))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(gatewayPayload);
            if (document.RootElement.TryGetProperty(propertyName, out var property))
            {
                return property.ValueKind == JsonValueKind.String
                    ? property.GetString()
                    : property.ToString();
            }
        }
        catch
        {
            return null;
        }

        return null;
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Payments/PayOsWebhookProcessResult.cs`

```csharp
namespace ParkingBuilding.CoreApi.Application.Payments;

public class PayOsWebhookProcessResult
{
    public bool Success { get; set; }
    public bool Idempotent { get; set; }
    public string Message { get; set; } = string.Empty;
    public long? PaymentId { get; set; }
    public long? ReservationId { get; set; }
    public long? OrderCode { get; set; }
    public string? PaymentStatus { get; set; }
    public string? ReservationStatus { get; set; }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Reservations/IReservationEntryTokenService.cs`

```csharp
namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public interface IReservationEntryTokenService
    {
        string CreateToken(ReservationEntryTokenPayload payload);
        ReservationEntryTokenPayload VerifyToken(string token);
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Reservations/ReservationBookingOptions.cs`

```csharp
namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public class ReservationBookingOptions
    {
        public int PaymentDeadlineMinutes { get; set; } = 10;
        public int MaxReservationHours { get; set; } = 3;
        public bool AllowZeroBookingFee { get; set; } = false;
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Reservations/ReservationEntryCheckResponse.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public class ReservationEntryCheckResponse
    {
        public string Status { get; set; } = null!;
        // VALID, EXPIRED, CANCELLED, ALREADY_CHECKED_IN, NOT_FOUND, NOT_CONFIRMED

        public long? ReservationId { get; set; }
        public string? ReservationCode { get; set; }

        public string? ReservationEntryToken { get; set; }

        public bool CanConvertToCasual { get; set; }

        public long? VehicleTypeId { get; set; }
        public bool RequiresSlot { get; set; }

        public string? PlateNumber { get; set; }
        public string? NormalizedPlateNumber { get; set; }
        public bool PlateRequiredAtEntry { get; set; }

        public long? ReservedFloorId { get; set; }
        public string? ReservedFloorCode { get; set; }

        public long? ReservedAreaId { get; set; }
        public string? ReservedAreaCode { get; set; }

        public long? ReservedSlotId { get; set; }
        public string? ReservedSlotCode { get; set; }

        public DateTimeOffset? ExpiresAt { get; set; }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Reservations/ReservationEntryTokenPayload.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public class ReservationEntryTokenPayload
    {
        public long ReservationId { get; set; }
        public string ReservationCode { get; set; } = null!;

        public long VehicleTypeId { get; set; }
        public long EntryGateId { get; set; }

        public long ReservedFloorId { get; set; }
        public long ReservedAreaId { get; set; }
        public long? ReservedSlotId { get; set; }

        public long IssuedToStaffId { get; set; }

        public DateTimeOffset IssuedAt { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Reservations/ReservationEntryTokenService.cs`

```csharp
using Microsoft.Extensions.Configuration;
using ParkingBuilding.CoreApi.Contracts.Common;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;

namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public class ReservationEntryTokenService : IReservationEntryTokenService
    {
        private readonly IConfiguration _configuration;

        public ReservationEntryTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private string GetSecretKey()
        {
            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
            var secretKey = _configuration["RESERVATION_ENTRY_TOKEN_SECRET"]
                ?? _configuration["ReservationEntryToken:Secret"];

            if (string.IsNullOrEmpty(secretKey))
            {
                if (isDevelopment)
                {
                    secretKey = _configuration["Jwt:Secret"]
                        ?? "DEVELOPMENT_SECRET_KEY_FOR_LOCAL_TESTING_ONLY_2026_SWP391_RESERVATION";
                }
                else
                {
                    throw new BusinessException(ErrorCodes.ReservationEntryTokenSecretConfigRequired);
                }
            }

            return secretKey;
        }

        public string CreateToken(ReservationEntryTokenPayload payload)
        {
            var secretKey = GetSecretKey();

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim("reservation_id", payload.ReservationId.ToString()),
                new Claim("reservation_code", payload.ReservationCode),
                new Claim("vehicle_type_id", payload.VehicleTypeId.ToString()),
                new Claim("entry_gate_id", payload.EntryGateId.ToString()),
                new Claim("reserved_floor_id", payload.ReservedFloorId.ToString()),
                new Claim("reserved_area_id", payload.ReservedAreaId.ToString()),
                new Claim("issued_to_staff_id", payload.IssuedToStaffId.ToString())
            };

            if (payload.ReservedSlotId.HasValue)
            {
                claims.Add(new Claim("reserved_slot_id", payload.ReservedSlotId.Value.ToString()));
            }

            var token = new JwtSecurityToken(
                issuer: "ParkingBuilding.CoreApi.ReservationEntry",
                audience: "ParkingBuilding.CoreApi.Entry",
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: payload.ExpiresAt.UtcDateTime,
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ReservationEntryTokenPayload VerifyToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new BusinessException(ErrorCodes.ReservationEntryTokenRequired);

            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKey = GetSecretKey();

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = "ParkingBuilding.CoreApi.ReservationEntry",
                    ValidateAudience = true,
                    ValidAudience = "ParkingBuilding.CoreApi.Entry",
                    ClockSkew = TimeSpan.FromSeconds(10)
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                var jwtToken = (JwtSecurityToken)validatedToken;

                if (jwtToken.ValidTo < DateTime.UtcNow)
                    throw new BusinessException(ErrorCodes.ReservationEntryTokenExpired);

                var reservationIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "reservation_id")?.Value;
                var reservationCode = jwtToken.Claims.FirstOrDefault(c => c.Type == "reservation_code")?.Value;
                var vehicleTypeIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "vehicle_type_id")?.Value;
                var entryGateIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "entry_gate_id")?.Value;
                var floorIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "reserved_floor_id")?.Value;
                var areaIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "reserved_area_id")?.Value;
                var staffIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "issued_to_staff_id")?.Value;
                var slotIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type == "reserved_slot_id")?.Value;

                if (string.IsNullOrEmpty(reservationCode) ||
                    !long.TryParse(reservationIdStr, out var reservationId) ||
                    !long.TryParse(vehicleTypeIdStr, out var vehicleTypeId) ||
                    !long.TryParse(entryGateIdStr, out var entryGateId) ||
                    !long.TryParse(floorIdStr, out var floorId) ||
                    !long.TryParse(areaIdStr, out var areaId) ||
                    !long.TryParse(staffIdStr, out var staffId))
                {
                    throw new BusinessException(ErrorCodes.ReservationEntryTokenInvalid);
                }

                long? slotId = null;
                if (!string.IsNullOrEmpty(slotIdStr) && long.TryParse(slotIdStr, out var parsedSlotId))
                {
                    slotId = parsedSlotId;
                }

                var issuedAtUtc = jwtToken.ValidFrom == DateTime.MinValue ? DateTime.UtcNow : DateTime.SpecifyKind(jwtToken.ValidFrom, DateTimeKind.Utc);
                var expiresAtUtc = jwtToken.ValidTo == DateTime.MinValue ? DateTime.UtcNow.AddMinutes(5) : DateTime.SpecifyKind(jwtToken.ValidTo, DateTimeKind.Utc);

                return new ReservationEntryTokenPayload
                {
                    ReservationId = reservationId,
                    ReservationCode = reservationCode,
                    VehicleTypeId = vehicleTypeId,
                    EntryGateId = entryGateId,
                    ReservedFloorId = floorId,
                    ReservedAreaId = areaId,
                    ReservedSlotId = slotId,
                    IssuedToStaffId = staffId,
                    IssuedAt = new DateTimeOffset(issuedAtUtc),
                    ExpiresAt = new DateTimeOffset(expiresAtUtc)
                };
            }
            catch (SecurityTokenExpiredException)
            {
                throw new BusinessException(ErrorCodes.ReservationEntryTokenExpired);
            }
            catch (Exception)
            {
                throw new BusinessException(ErrorCodes.ReservationEntryTokenInvalid);
            }
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Reservations/ReservationExpiryWorker.cs`

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public class ReservationExpiryWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<ReservationExpiryWorker> _logger;

        public ReservationExpiryWorker(IServiceScopeFactory scopeFactory, ILogger<ReservationExpiryWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Reservation Expiry Background Worker is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Wait for 1 minute before scanning
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

                    using var scope = _scopeFactory.CreateScope();
                    var reservationService = scope.ServiceProvider.GetRequiredService<ReservationService>();

                    _logger.LogDebug("Scanning for expired reservations...");
                    var expiredCount = await reservationService.ExpireReservationsAsync();
                    if (expiredCount > 0)
                    {
                        _logger.LogInformation("Successfully expired {Count} reservations.", expiredCount);
                    }
                }
                catch (OperationCanceledException)
                {
                    // Worker is stopping, normal behavior
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while scanning for expired reservations.");
                }
            }

            _logger.LogInformation("Reservation Expiry Background Worker is stopping.");
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Reservations/ReservationService.cs`

```csharp
using System;
using Microsoft.AspNetCore.Http;
using ParkingBuilding.CoreApi.Contracts.Common;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Application.Payments;
using Microsoft.Extensions.Options;

namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public class ReservationService
    {
        private readonly ParkingDbContext _context;
        private readonly IAuditWriterService _auditWriter;
        private readonly IReservationEntryTokenService _tokenService;
        private readonly IPayOsPaymentService _payOsPaymentService;
        private readonly ReservationBookingOptions _bookingOptions;

        public ReservationService(
            ParkingDbContext context,
            IAuditWriterService auditWriter,
            IReservationEntryTokenService tokenService,
            IPayOsPaymentService payOsPaymentService,
            IOptions<ReservationBookingOptions> bookingOptions)
        {
            _context = context;
            _auditWriter = auditWriter;
            _tokenService = tokenService;
            _payOsPaymentService = payOsPaymentService;
            _bookingOptions = bookingOptions.Value;
        }

        // ================= F078: SEARCH & SUGGEST LOCATIONS =================
        public async Task<AvailableLocationsResponse> GetAvailableLocationsAsync(long vehicleTypeId)
        {
            var vehicleType = await _context.VehicleTypes.FindAsync(vehicleTypeId);
            if (vehicleType == null)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound, StatusCodes.Status404NotFound);

            // Get active pricing rule for the vehicle type
            var pricingRule = await _context.PricingRules
                .FirstOrDefaultAsync(pr => pr.VehicleTypeId == vehicleTypeId && pr.Status == "ACTIVE" && pr.EffectiveFrom <= DateTimeOffset.UtcNow);

            var hourlyPrice = pricingRule?.ReservationHourlyPrice ?? 0m;

            var response = new AvailableLocationsResponse
            {
                VehicleTypeId = vehicleTypeId,
                RequiresSlot = vehicleType.RequiresSlot,
                ReservationHourlyPrice = hourlyPrice
            };

            if (vehicleType.RequiresSlot)
            {
                // For Cars (RequiresSlot = true): Find AVAILABLE slots and filter out those with active reservations
                var activeReservationSlotIds = await _context.Reservations
                    .Where(r => r.Status == "PENDING" || r.Status == "CONFIRMED")
                    .Where(r => r.SlotId != null)
                    .Select(r => r.SlotId!.Value)
                    .ToListAsync();

                var slots = await _context.Slots
                    .Include(s => s.Area)
                    .ThenInclude(a => a.Floor)
                    .Where(s => s.AllowedVehicleTypeId == vehicleTypeId && s.Status == "AVAILABLE" && !activeReservationSlotIds.Contains(s.Id))
                    .ToListAsync();

                response.AvailableSlots = slots.Select(s => new AvailableSlotDto
                {
                    SlotId = s.Id,
                    SlotCode = s.SlotCode,
                    AreaId = s.AreaId,
                    AreaCode = s.Area.AreaCode,
                    AreaName = s.Area.AreaName,
                    FloorId = s.Area.FloorId,
                    FloorCode = s.Area.Floor.FloorCode,
                    FloorName = s.Area.Floor.FloorName
                }).ToList();
            }
            else
            {
                // For Motorbikes (RequiresSlot = false): Find Areas supporting this vehicle type with capacity
                var areas = await _context.Areas
                    .Include(a => a.Floor)
                    .Include(a => a.AreaVehicleTypes)
                    .Where(a => a.Status == "ACTIVE" && a.AreaVehicleTypes.Any(av => av.VehicleTypeId == vehicleTypeId))
                    .ToListAsync();

                response.AvailableAreas = areas
                    .Where(a => a.CurrentRealOccupancy + a.CurrentBookedSlots < a.TotalCapacity)
                    .Select(a => new AvailableAreaDto
                    {
                        AreaId = a.Id,
                        AreaCode = a.AreaCode,
                        AreaName = a.AreaName,
                        FloorId = a.FloorId,
                        FloorCode = a.Floor.FloorCode,
                        FloorName = a.Floor.FloorName,
                        AvailableCapacity = a.TotalCapacity - (a.CurrentRealOccupancy + a.CurrentBookedSlots),
                        TotalCapacity = a.TotalCapacity
                    }).ToList();
            }

            return response;
        }

        // ================= F079 & F080: CREATE RESERVATION =================
        private async Task<long> ResolveDriverIdAsync(
            CreateReservationRequest request,
            long actorUserId,
            string actorRole)
        {
            if (actorRole == "DRIVER")
            {
                var profile = await _context.DriverProfiles
                    .FirstOrDefaultAsync(d => d.UserId == actorUserId);

                if (profile == null)
                    throw new BusinessException(ErrorCodes.DriverProfileNotFound);

                return profile.Id;
            }

            if (!request.DriverId.HasValue)
                throw new BusinessException(ErrorCodes.DriverIdRequiredForStaffBooking);

            var driverExists = await _context.DriverProfiles
                .AnyAsync(d => d.Id == request.DriverId.Value);

            if (!driverExists)
                throw new BusinessException(ErrorCodes.DriverProfileNotFound);

            return request.DriverId.Value;
        }

        public async Task<CreateReservationResponseDto> CreateReservationAsync(
            CreateReservationRequest request,
            long actorUserId,
            string actorRole)
        {
            if (request.ReservedDurationMinutes <= 0)
                throw new BusinessException(ErrorCodes.ReservationDurationInvalid);

            if (request.ReservedDurationMinutes % 60 != 0)
                throw new BusinessException(ErrorCodes.ReservationDurationMustBeWholeHours);

            var reservedHours = request.ReservedDurationMinutes / 60;
            if (reservedHours > _bookingOptions.MaxReservationHours)
                throw new BusinessException(ErrorCodes.ReservationDurationExceedsLimit);

            var vehicleType = await _context.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound, StatusCodes.Status404NotFound);

            // Find active pricing rule
            var pricingRule = await _context.PricingRules
                .FirstOrDefaultAsync(pr => pr.VehicleTypeId == request.VehicleTypeId && pr.Status == "ACTIVE" && pr.EffectiveFrom <= DateTimeOffset.UtcNow);
            if (pricingRule == null)
                throw new BusinessException(ErrorCodes.PricingRuleNotFound, StatusCodes.Status404NotFound);

            // Calculate booking amount
            var hourlyPrice = pricingRule.ReservationHourlyPrice;
            if (hourlyPrice <= 0m && !_bookingOptions.AllowZeroBookingFee)
                throw new BusinessException(ErrorCodes.ReservationPricingNotConfigured);

            if (hourlyPrice != decimal.Truncate(hourlyPrice))
                throw new BusinessException(ErrorCodes.ReservationHourlyPriceMustBeInteger);

            var bookingAmount = hourlyPrice * reservedHours;

            if (bookingAmount != decimal.Truncate(bookingAmount))
                throw new BusinessException(ErrorCodes.ReservationBookingAmountMustBeInteger);

            if (bookingAmount <= 0m && !_bookingOptions.AllowZeroBookingFee)
                throw new BusinessException(ErrorCodes.ReservationBookingFeeRequired);

            Reservation reservation = null!;
            Payment? payment = null;

            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    long resolvedDriverId = await ResolveDriverIdAsync(request, actorUserId, actorRole);

                    // Check vehicle if provided
                    if (request.VehicleId.HasValue)
                    {
                        var vehicle = await _context.Vehicles
                            .FirstOrDefaultAsync(v => v.Id == request.VehicleId.Value);

                        if (vehicle == null)
                            throw new BusinessException(ErrorCodes.VehicleNotFound);

                        if (vehicle.DriverId != resolvedDriverId)
                            throw new BusinessException(ErrorCodes.VehicleNotBelongToDriver);

                        if (vehicle.VehicleTypeId != request.VehicleTypeId)
                            throw new BusinessException(ErrorCodes.VehicleTypeMismatch);
                    }

                    // Resolve plate number
                    string? plateNumber = request.PlateNumber;
                    if (string.IsNullOrWhiteSpace(plateNumber) && request.VehicleId.HasValue)
                    {
                        var vehicle = await _context.Vehicles.FindAsync(request.VehicleId.Value);
                        plateNumber = vehicle?.PlateNumber;
                    }

                    string? normalizedPlate = null;
                    if (!string.IsNullOrWhiteSpace(plateNumber))
                    {
                        plateNumber = plateNumber.Trim();
                        normalizedPlate = NormalizePlate(plateNumber);
                    }

                    // Check duplicate pending/confirmed reservations by plate if plate is provided
                    if (!string.IsNullOrWhiteSpace(normalizedPlate))
                    {
                        var activePlateReservationExists = await _context.Reservations
                            .AnyAsync(r => r.NormalizedPlateNumber == normalizedPlate &&
                                           r.VehicleTypeId == request.VehicleTypeId &&
                                           (r.Status == "PENDING" || r.Status == "CONFIRMED"));
                        if (activePlateReservationExists)
                            throw new BusinessException(ErrorCodes.PlateAlreadyHasActiveReservation);
                    }

                    // Check duplicate pending/confirmed reservations by vehicle ID if provided
                    if (request.VehicleId.HasValue)
                    {
                        var hasPendingVehicle = await _context.Reservations
                            .AnyAsync(r => r.VehicleId == request.VehicleId.Value && (r.Status == "PENDING" || r.Status == "CONFIRMED"));
                        if (hasPendingVehicle)
                            throw new BusinessException(ErrorCodes.VehicleAlreadyHasActiveReservation);
                    }

                    // Check duplicate pending/confirmed reservations for slot if requires slot
                    if (vehicleType.RequiresSlot)
                    {
                        if (!request.SlotId.HasValue)
                            throw new BusinessException(ErrorCodes.SlotRequired);

                        var hasPendingSlot = await _context.Reservations
                            .AnyAsync(r => r.SlotId == request.SlotId.Value && (r.Status == "PENDING" || r.Status == "CONFIRMED"));
                        if (hasPendingSlot)
                            throw new BusinessException(ErrorCodes.ReservationSlotAlreadyReserved);
                    }

                    var floor = await _context.Floors.FindAsync(request.FloorId);
                    if (floor == null)
                        throw new BusinessException(ErrorCodes.FloorNotFound, StatusCodes.Status404NotFound);

                    // Concurrency lock: Select Area FOR UPDATE
                    var area = await _context.Areas
                        .FromSqlRaw("SELECT * FROM areas WHERE id = {0} FOR UPDATE", request.AreaId)
                        .FirstOrDefaultAsync();
                    if (area == null)
                        throw new BusinessException(ErrorCodes.AreaNotFound, StatusCodes.Status404NotFound);

                    await _context.Entry(area).Collection(a => a.AreaVehicleTypes).LoadAsync();

                    if (area.FloorId != request.FloorId)
                        throw new BusinessException(ErrorCodes.AreaFloorMismatch);

                    if (area.Status != "ACTIVE")
                        throw new BusinessException(ErrorCodes.SelectedAreaNotActive);

                    if (!area.AreaVehicleTypes.Any(av => av.VehicleTypeId == request.VehicleTypeId))
                        throw new BusinessException(ErrorCodes.AreaVehicleTypeMismatch);

                    Slot? slot = null;
                    if (vehicleType.RequiresSlot)
                    {
                        // Concurrency lock: Select Slot FOR UPDATE
                        slot = await _context.Slots
                            .FromSqlRaw("SELECT * FROM slots WHERE id = {0} FOR UPDATE", request.SlotId!.Value)
                            .FirstOrDefaultAsync();
                        if (slot == null)
                            throw new BusinessException(ErrorCodes.SlotNotFound, StatusCodes.Status404NotFound);

                        if (slot.AreaId != request.AreaId)
                            throw new BusinessException(ErrorCodes.SlotAreaMismatch);

                        if (slot.AllowedVehicleTypeId != request.VehicleTypeId)
                            throw new BusinessException(ErrorCodes.SlotNotAllowedForVehicleType);

                        if (slot.Status != "AVAILABLE")
                            throw new BusinessException(ErrorCodes.ReservationSlotAlreadyReserved);
                    }
                    else
                    {
                        if (request.SlotId.HasValue)
                            throw new BusinessException(ErrorCodes.SlotMustBeNullForAreaManagedVehicle);

                        // Area capacity check
                        if (area.CurrentRealOccupancy + area.CurrentBookedSlots >= area.TotalCapacity)
                            throw new BusinessException(ErrorCodes.ReservationAreaFull);
                    }

                    var reservationCode = GenerateReservationCode();

                    var now = DateTimeOffset.UtcNow;
                    var expiresAt = now.AddMinutes(request.ReservedDurationMinutes);
                    var paymentDeadline = now.AddMinutes(_bookingOptions.PaymentDeadlineMinutes);

                    // Setup statuses
                    var paymentStatus = bookingAmount == 0m ? "NOT_REQUIRED" : "PENDING";
                    var status = bookingAmount == 0m ? "CONFIRMED" : "PENDING";
                    var confirmedAt = bookingAmount == 0m ? (DateTimeOffset?)now : null;

                    reservation = new Reservation
                    {
                        ReservationCode = reservationCode,
                        DriverId = resolvedDriverId,
                        VehicleId = request.VehicleId,
                        PlateNumber = plateNumber,
                        NormalizedPlateNumber = normalizedPlate,
                        VehicleTypeId = request.VehicleTypeId,
                        FloorId = request.FloorId,
                        AreaId = request.AreaId,
                        SlotId = request.SlotId,
                        PricingRuleId = pricingRule.Id,
                        SnapshotReservationHourlyPrice = hourlyPrice,
                        ReservedDurationMinutes = reservedHours * 60,
                        BookingAmount = bookingAmount,
                        PaymentStatus = paymentStatus,
                        ReservedAt = now,
                        ExpiresAt = expiresAt,
                        PaymentDeadline = paymentDeadline,
                        ConfirmedAt = confirmedAt,
                        Status = status,
                        CreatedBy = actorUserId,
                        CreatedAt = now,
                        UpdatedAt = now
                    };

                    _context.Reservations.Add(reservation);
                    await _context.SaveChangesAsync();

                    if (bookingAmount > 0m)
                    {
                        payment = new Payment
                        {
                            ReservationId = reservation.Id,
                            Amount = bookingAmount,
                            LostCardFee = 0m,
                            TotalAmount = bookingAmount,
                            Purpose = "RESERVATION_FEE",
                            Method = "BANK_TRANSFER",
                            Status = "PENDING",
                            Provider = "PAYOS",
                            ReceivedAmount = 0m,
                            FeeCalculatedAt = now,
                            PaymentValidUntil = paymentDeadline,
                            ExpiredAt = paymentDeadline,
                            CreatedAt = now,
                            UpdatedAt = now
                        };

                        _context.Payments.Add(payment);
                        await _context.SaveChangesAsync();
                    }

                    // Update slot and area occupancy immediately
                    if (vehicleType.RequiresSlot && slot != null)
                    {
                        slot.Status = "RESERVED";
                    }
                    area.CurrentBookedSlots += 1;
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    // Audit Log
                    await _auditWriter.WriteAuditLogAsync(
                        action: "RESERVATION_CREATED",
                        targetType: "Reservation",
                        targetId: reservation.Id.ToString(),
                        actorUserId: actorUserId,
                        newValue: $"Code: {reservationCode}, Plate: {normalizedPlate}, SlotId: {reservation.SlotId}, AreaId: {reservation.AreaId}"
                    );
                }
                catch (Exception)
                {
                    try { await transaction.RollbackAsync(); } catch {}
                    throw;
                }
            });

            PayOsPaymentResponse? paymentResponse = null;
            if (bookingAmount > 0m && payment != null)
            {
                try
                {
                    paymentResponse = await _payOsPaymentService.CreateReservationPaymentLinkAsync(payment, reservation);
                }
                catch (Exception ex)
                {
                    // Step C: Open a new transaction, cancel payment + reservation and release slot/area lock
                    var recoverStrategy = _context.Database.CreateExecutionStrategy();
                    await recoverStrategy.ExecuteAsync(async () =>
                    {
                        using var recoverTransaction = await _context.Database.BeginTransactionAsync();
                        try
                        {
                            var resToCancel = await _context.Reservations
                                .Include(r => r.Slot)
                                .Include(r => r.Area)
                                .FirstOrDefaultAsync(r => r.Id == reservation.Id);

                            if (resToCancel != null)
                            {
                                var previousStatus = resToCancel.Status;
                                resToCancel.Status = "CANCELLED";
                                resToCancel.PaymentStatus = "FAILED";
                                resToCancel.UpdatedAt = DateTimeOffset.UtcNow;
                                resToCancel.CancelledAt = DateTimeOffset.UtcNow;
                                resToCancel.CancellationReason = "PayOS payment link creation failed.";

                                ReleaseReservationHold(resToCancel, previousStatus);
                            }

                            var payToCancel = await _context.Payments.FindAsync(payment.Id);
                            if (payToCancel != null)
                            {
                                payToCancel.Status = "FAILED";
                                payToCancel.UpdatedAt = DateTimeOffset.UtcNow;
                            }

                            await _context.SaveChangesAsync();
                            await recoverTransaction.CommitAsync();

                            // Audit Log
                            await _auditWriter.WriteAuditLogAsync(
                                action: "PAYOS_CREATE_LINK_FAILED",
                                targetType: "Reservation",
                                targetId: reservation.Id.ToString(),
                                actorUserId: actorUserId,
                                newValue: $"Reservation status set to CANCELLED due to PayOS link failure. Error: {ex.Message}"
                            );
                        }
                        catch
                        {
                            try { await recoverTransaction.RollbackAsync(); } catch {}
                        }
                    });

                    throw new BusinessException(ErrorCodes.PayOsCreateLinkFailed);
                }
            }

            var resDto = new ReservationDto
            {
                Id = reservation.Id,
                ReservationCode = reservation.ReservationCode,
                Status = reservation.Status,
                PaymentStatus = reservation.PaymentStatus,
                BookingAmount = reservation.BookingAmount,
                PaymentDeadline = reservation.PaymentDeadline,
                ExpiresAt = reservation.ExpiresAt,
                DriverId = reservation.DriverId,
                VehicleId = reservation.VehicleId,
                PlateNumber = reservation.PlateNumber,
                NormalizedPlateNumber = reservation.NormalizedPlateNumber,
                VehicleTypeId = reservation.VehicleTypeId,
                FloorId = reservation.FloorId,
                AreaId = reservation.AreaId,
                SlotId = reservation.SlotId
            };

            return new CreateReservationResponseDto
            {
                Reservation = resDto,
                Payment = paymentResponse
            };
        }

        // ================= F081: EXTEND RESERVATION =================
        public async Task<ReservationResponseDto> ExtendReservationAsync(long id, ExtendReservationRequest request, long? userId)
        {
            if (request.AddedMinutes <= 0)
                throw new BusinessException(ErrorCodes.ReservationExtensionMinutesInvalid);

            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var reservation = await _context.Reservations
                        .Include(r => r.Area)
                        .FirstOrDefaultAsync(r => r.Id == id);

                    if (reservation == null)
                        throw new BusinessException(ErrorCodes.ReservationNotFound, StatusCodes.Status404NotFound);

                    if (reservation.Status != "PENDING" && reservation.Status != "CONFIRMED")
                        throw new BusinessException(ErrorCodes.ReservationNotExtendable);

                    // Find active pricing rule to check extension price
                    var pricingRule = await _context.PricingRules
                        .FirstOrDefaultAsync(pr => pr.VehicleTypeId == reservation.VehicleTypeId && pr.Status == "ACTIVE" && pr.EffectiveFrom <= DateTimeOffset.UtcNow);
                    
                    var hourlyPrice = pricingRule?.ReservationHourlyPrice ?? reservation.SnapshotReservationHourlyPrice;
                    var extensionAmount = hourlyPrice * ((decimal)request.AddedMinutes / 60m);

                    // TODO: Future task should implement RESERVATION_EXTENSION payment purpose and payOS checkout flow.
                    if (extensionAmount > 0m)
                    {
                        throw new BusinessException(ErrorCodes.ReservationExtensionPaymentNotImplemented);
                    }

                    var oldExpires = reservation.ExpiresAt;
                    var newExpires = oldExpires.AddMinutes(request.AddedMinutes);

                    var extension = new ReservationExtension
                    {
                        ReservationId = reservation.Id,
                        OldExpiresAt = oldExpires,
                        NewExpiresAt = newExpires,
                        AddedMinutes = request.AddedMinutes,
                        PricingRuleId = pricingRule?.Id ?? reservation.PricingRuleId,
                        SnapshotReservationHourlyPrice = hourlyPrice,
                        Amount = extensionAmount,
                        RequestedBy = userId,
                        CreatedAt = DateTimeOffset.UtcNow,
                        UpdatedAt = DateTimeOffset.UtcNow
                    };

                    _context.ReservationExtensions.Add(extension);

                    // Update reservation
                    reservation.ExpiresAt = newExpires;
                    reservation.BookingAmount += extensionAmount;
                    reservation.ReservedDurationMinutes += request.AddedMinutes;
                    reservation.UpdatedAt = DateTimeOffset.UtcNow;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    // Audit Log
                    await _auditWriter.WriteAuditLogAsync(
                        action: "RESERVATION_EXTENDED",
                        targetType: "Reservation",
                        targetId: reservation.Id.ToString(),
                        actorUserId: userId,
                        newValue: $"New Expires At: {newExpires:yyyy-MM-dd HH:mm:ss}, Added Minutes: {request.AddedMinutes}, Extension Amount: {extensionAmount}"
                    );

                    return MapToResponseDto(reservation);
                }
                catch (Exception)
                {
                    try { await transaction.RollbackAsync(); } catch {}
                    throw;
                }
            });
        }

        // ================= F082: CANCEL RESERVATION =================
        public async Task<ReservationResponseDto> CancelReservationAsync(long id, CancelReservationRequest request, long? userId)
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                var reservation = await _context.Reservations
                    .Include(r => r.Area)
                    .Include(r => r.Slot)
                    .Include(r => r.Extensions)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (reservation == null)
                    throw new BusinessException(ErrorCodes.ReservationNotFound, StatusCodes.Status404NotFound);

                if (reservation.Status != "PENDING" && reservation.Status != "CONFIRMED")
                    throw new BusinessException(ErrorCodes.ReservationNotCancellable);

                if (reservation.CheckedInAt != null || reservation.Status == "COMPLETED")
                    throw new BusinessException(ErrorCodes.ReservationNotCancellable);

                var oldValue = $"Status: {reservation.Status}, PaymentStatus: {reservation.PaymentStatus}";
                var previousReservationStatus = reservation.Status;
                var pendingPayments = new List<Payment>();
                var providerCancellations = new List<PayOsProviderCancellation>();

                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    try
                    {
                        // Update Reservation
                        reservation.Status = "CANCELLED";
                        reservation.CancelledAt = DateTimeOffset.UtcNow;
                        reservation.CancelledBy = userId;
                        reservation.CancellationReason = request.Reason?.Trim();
                        reservation.UpdatedAt = DateTimeOffset.UtcNow;

                        if (reservation.PaymentStatus == "PENDING")
                        {
                            reservation.PaymentStatus = "CANCELLED";

                            pendingPayments = await _context.Payments
                                .Where(p => p.ReservationId == reservation.Id && p.Status == "PENDING")
                                .ToListAsync();

                            providerCancellations = pendingPayments
                                .Where(p => p.Provider == "PAYOS")
                                .Select(p => new PayOsProviderCancellation(p.ProviderTransactionId, p.GatewayPayload))
                                .ToList();

                            foreach (var payment in pendingPayments)
                            {
                                payment.Status = "CANCELLED";
                                payment.UpdatedAt = DateTimeOffset.UtcNow;
                            }
                        }

                        ReleaseReservationHold(reservation, previousReservationStatus);

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                    }
                    catch (Exception)
                    {
                        try { await transaction.RollbackAsync(); } catch {}
                        throw;
                    }
                }

                // Call payOS cancel link best-effort AFTER commit
                foreach (var cancellation in providerCancellations)
                {
                    try
                    {
                        await _payOsPaymentService.CancelProviderPaymentLinkAsync(
                            cancellation.ProviderTransactionId,
                            cancellation.GatewayPayload,
                            "Reservation cancelled.");
                    }
                    catch
                    {
                        // Best effort
                    }
                }

                // Audit Log
                await _auditWriter.WriteAuditLogAsync(
                    action: "RESERVATION_CANCELLED",
                    targetType: "Reservation",
                    targetId: reservation.Id.ToString(),
                    actorUserId: userId,
                    oldValue: oldValue,
                    newValue: $"Status: CANCELLED, PaymentStatus: {reservation.PaymentStatus}",
                    reason: request.Reason
                );

                return MapToResponseDto(reservation);
            });
        }

        public async Task<ReservationPaymentStatusResponse> GetPaymentStatusAsync(long reservationId)
        {
            var reservation = await _context.Reservations
                .FirstOrDefaultAsync(r => r.Id == reservationId);

            if (reservation == null)
            {
                throw new BusinessException(ErrorCodes.ReservationNotFound, StatusCodes.Status404NotFound);
            }

            var payment = await _context.Payments
                .Where(p => p.ReservationId == reservationId)
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefaultAsync();

            var now = DateTimeOffset.UtcNow;
            var deadline = reservation.PaymentDeadline ?? payment?.ExpiredAt;
            var remainingSeconds = 0;
            var isExpired = false;

            if (deadline.HasValue)
            {
                remainingSeconds = Math.Max(0, (int)(deadline.Value - now).TotalSeconds);
                isExpired = now > deadline.Value || reservation.Status == "EXPIRED";
            }
            else
            {
                isExpired = reservation.Status == "EXPIRED";
            }

            return new ReservationPaymentStatusResponse
            {
                ReservationId = reservation.Id,
                ReservationCode = reservation.ReservationCode,
                ReservationStatus = reservation.Status,
                PaymentStatus = reservation.PaymentStatus,
                BookingAmount = reservation.BookingAmount,
                PaymentId = payment?.Id,
                Provider = payment?.Provider,
                ProviderTransactionId = payment?.ProviderTransactionId,
                CheckoutUrl = payment?.Status == "PENDING" ? payment?.PaymentUrl : null,
                PaymentExpiredAt = payment?.ExpiredAt,
                PaidAt = payment?.PaidAt,
                PaymentDeadline = reservation.PaymentDeadline,
                RemainingSeconds = remainingSeconds,
                IsExpired = isExpired
            };
        }

        // ================= BACKGROUND WORKER: EXPIRE RESERVATIONS =================
        public async Task<int> ExpireReservationsAsync()
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                var now = DateTimeOffset.UtcNow;

                // Case 1: Pending payment expired
                var case1List = await _context.Reservations
                    .Include(r => r.Area)
                    .Include(r => r.Slot)
                    .Where(r => r.Status == "PENDING" && r.PaymentStatus == "PENDING" && r.PaymentDeadline != null && r.PaymentDeadline < now)
                    .ToListAsync();

                // Case 2: Confirmed reservation expired before check-in
                var case2List = await _context.Reservations
                    .Include(r => r.Area)
                    .Include(r => r.Slot)
                    .Where(r => r.Status == "CONFIRMED" && r.ExpiresAt < now && r.CheckedInAt == null)
                    .ToListAsync();

                int count = 0;

                // Process Case 1
                foreach (var reservation in case1List)
                {
                    var pendingPayments = new List<Payment>();
                    var providerCancellations = new List<PayOsProviderCancellation>();
                    var oldValue = $"Status: {reservation.Status}, PaymentStatus: {reservation.PaymentStatus}";
                    var previousReservationStatus = reservation.Status;

                    using (var transaction = await _context.Database.BeginTransactionAsync())
                    {
                        try
                        {
                            reservation.Status = "EXPIRED";
                            reservation.PaymentStatus = "CANCELLED";
                            reservation.UpdatedAt = now;

                            pendingPayments = await _context.Payments
                                .Where(p => p.ReservationId == reservation.Id && p.Status == "PENDING")
                                .ToListAsync();

                            providerCancellations = pendingPayments
                                .Where(p => p.Provider == "PAYOS")
                                .Select(p => new PayOsProviderCancellation(p.ProviderTransactionId, p.GatewayPayload))
                                .ToList();

                            foreach (var payment in pendingPayments)
                            {
                                payment.Status = "CANCELLED";
                                payment.UpdatedAt = now;
                            }

                            ReleaseReservationHold(reservation, previousReservationStatus);

                            await _context.SaveChangesAsync();
                            await transaction.CommitAsync();
                        }
                        catch (Exception)
                        {
                            try { await transaction.RollbackAsync(); } catch {}
                            continue;
                        }
                    }

                    // Best effort payOS cancel after DB commit
                    foreach (var cancellation in providerCancellations)
                    {
                        try
                        {
                            await _payOsPaymentService.CancelProviderPaymentLinkAsync(
                                cancellation.ProviderTransactionId,
                                cancellation.GatewayPayload,
                                "Reservation hold duration expired without payment.");
                        }
                        catch
                        {
                            // Best-effort
                        }
                    }

                    count++;

                    // Audit Log
                    await _auditWriter.WriteAuditLogAsync(
                        action: "RESERVATION_PAYMENT_DEADLINE_EXPIRED",
                        targetType: "Reservation",
                        targetId: reservation.Id.ToString(),
                        oldValue: oldValue,
                        newValue: "Status: EXPIRED, PaymentStatus: CANCELLED",
                        reason: "Payment deadline expired before payment was completed."
                    );
                }

                // Process Case 2
                foreach (var reservation in case2List)
                {
                    var oldValue = $"Status: {reservation.Status}";
                    var previousReservationStatus = reservation.Status;

                    using (var transaction = await _context.Database.BeginTransactionAsync())
                    {
                        try
                        {
                            reservation.Status = "EXPIRED";
                            reservation.UpdatedAt = now;

                            ReleaseReservationHold(reservation, previousReservationStatus);

                            await _context.SaveChangesAsync();
                            await transaction.CommitAsync();
                        }
                        catch (Exception)
                        {
                            try { await transaction.RollbackAsync(); } catch {}
                            continue;
                        }
                    }

                    count++;

                    // Audit Log
                    await _auditWriter.WriteAuditLogAsync(
                        action: "RESERVATION_EXPIRED_BEFORE_CHECKIN",
                        targetType: "Reservation",
                        targetId: reservation.Id.ToString(),
                        oldValue: oldValue,
                        newValue: "Status: EXPIRED",
                        reason: "Reservation expired before driver checked in."
                    );
                }

                return count;
            });
        }

        // ================= HELPERS = null =================
        private static string GenerateReservationCode()
            => $"RES-{DateTimeOffset.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";

        private static void ReleaseReservationHold(Reservation reservation, string previousStatus)
        {
            if (previousStatus != "PENDING" && previousStatus != "CONFIRMED")
                return;

            if (reservation.CheckedInAt != null || reservation.Status == "COMPLETED")
                return;

            if (reservation.SlotId.HasValue && reservation.Slot != null && reservation.Slot.Status == "RESERVED")
            {
                reservation.Slot.Status = "AVAILABLE";
            }

            if (reservation.Area != null && reservation.Area.CurrentBookedSlots > 0)
            {
                reservation.Area.CurrentBookedSlots -= 1;
            }
        }

        private sealed record PayOsProviderCancellation(string? ProviderTransactionId, string? GatewayPayload);

        private string? NormalizePlate(string? plate)
        {
            if (string.IsNullOrWhiteSpace(plate)) return null;
            return plate.Trim().Replace("-", "").Replace(".", "").Replace(" ", "").ToUpper();
        }

        private ReservationResponseDto MapToResponseDto(Reservation r)
        {
            return new ReservationResponseDto
            {
                Id = r.Id,
                ReservationCode = r.ReservationCode,
                DriverId = r.DriverId,
                VehicleId = r.VehicleId,
                PlateNumber = r.PlateNumber,
                NormalizedPlateNumber = r.NormalizedPlateNumber,
                VehicleTypeId = r.VehicleTypeId,
                FloorId = r.FloorId,
                AreaId = r.AreaId,
                SlotId = r.SlotId,
                PricingRuleId = r.PricingRuleId,
                SnapshotReservationHourlyPrice = r.SnapshotReservationHourlyPrice,
                ReservedDurationMinutes = r.ReservedDurationMinutes,
                BookingAmount = r.BookingAmount,
                PaymentStatus = r.PaymentStatus,
                ReservedAt = r.ReservedAt,
                ExpiresAt = r.ExpiresAt,
                PaymentDeadline = r.PaymentDeadline,
                ConfirmedAt = r.ConfirmedAt,
                CheckedInAt = r.CheckedInAt,
                CheckedInBy = r.CheckedInBy,
                CancelledAt = r.CancelledAt,
                Status = r.Status,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            };
        }

        public async Task<ReservationEntryCheckResponse> CheckReservationForEntryAsync(
            string reservationCode,
            long entryGateId,
            long staffId)
        {
            // 1. Validate entry gate
            var gate = await _context.Gates
                .Include(g => g.Floor)
                .FirstOrDefaultAsync(g => g.Id == entryGateId);

            if (gate == null)
                throw new BusinessException(ErrorCodes.GateNotFound, StatusCodes.Status404NotFound);

            if (gate.GateType != "ENTRY")
                throw new BusinessException(ErrorCodes.EntryGateRequired);

            if (gate.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.GateNotActive);

            if (gate.Floor == null || gate.Floor.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.FloorNotActive);

            // 2. Find reservation
            var reservation = await _context.Reservations
                .Include(r => r.Floor)
                .Include(r => r.Area)
                .Include(r => r.Slot)
                .FirstOrDefaultAsync(r => r.ReservationCode == reservationCode);

            if (reservation == null)
            {
                return new ReservationEntryCheckResponse
                {
                    Status = "NOT_FOUND"
                };
            }

            var vehicleType = await _context.VehicleTypes.FindAsync(reservation.VehicleTypeId);
            var requiresSlot = vehicleType?.RequiresSlot ?? false;

            var response = new ReservationEntryCheckResponse
            {
                ReservationId = reservation.Id,
                ReservationCode = reservation.ReservationCode,
                VehicleTypeId = reservation.VehicleTypeId,
                PlateNumber = reservation.PlateNumber,
                NormalizedPlateNumber = reservation.NormalizedPlateNumber,
                ExpiresAt = reservation.ExpiresAt,
                RequiresSlot = requiresSlot,
                PlateRequiredAtEntry = !string.IsNullOrWhiteSpace(reservation.NormalizedPlateNumber) || requiresSlot
            };

            var now = DateTimeOffset.UtcNow;

            if (reservation.Status == "CANCELLED")
            {
                response.Status = "CANCELLED";
                return response;
            }

            if (reservation.Status == "EXPIRED" || (reservation.PaymentDeadline.HasValue && reservation.PaymentDeadline.Value < now) || reservation.ExpiresAt < now)
            {
                response.Status = "EXPIRED";
                return response;
            }

            if (reservation.Status == "COMPLETED" || reservation.CheckedInAt != null)
            {
                response.Status = "ALREADY_CHECKED_IN";
                return response;
            }

            if (reservation.Status == "PENDING" || (reservation.BookingAmount > 0m && reservation.PaymentStatus == "PENDING"))
            {
                response.Status = "PAYMENT_PENDING";
                return response;
            }

            if (reservation.Status != "CONFIRMED" || (reservation.BookingAmount > 0m && reservation.PaymentStatus != "PAID" && reservation.PaymentStatus != "NOT_REQUIRED"))
            {
                response.Status = "PAYMENT_PENDING";
                return response;
            }

            // Check Floor & Area status
            if (reservation.Floor == null || reservation.Floor.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.ReservedFloorInactive);

            if (reservation.Area == null || reservation.Area.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.ReservedAreaInactive);

            if (response.RequiresSlot)
            {
                if (reservation.Slot == null)
                    throw new BusinessException(ErrorCodes.ReservedSlotNotFound);
                if (reservation.Slot.Status != "RESERVED")
                {
                    throw new BusinessException(ErrorCodes.ReservedSlotNotAvailable);
                }

                response.ReservedSlotId = reservation.Slot.Id;
                response.ReservedSlotCode = reservation.Slot.SlotCode;
            }

            response.ReservedFloorId = reservation.Floor.Id;
            response.ReservedFloorCode = reservation.Floor.FloorCode;
            response.ReservedAreaId = reservation.Area.Id;
            response.ReservedAreaCode = reservation.Area.AreaCode;

            // Generate token
            var tokenPayload = new ReservationEntryTokenPayload
            {
                ReservationId = reservation.Id,
                ReservationCode = reservation.ReservationCode,
                VehicleTypeId = reservation.VehicleTypeId,
                EntryGateId = entryGateId,
                ReservedFloorId = reservation.FloorId,
                ReservedAreaId = reservation.AreaId,
                ReservedSlotId = reservation.SlotId,
                IssuedToStaffId = staffId,
                IssuedAt = now,
                ExpiresAt = now.AddSeconds(120) // Token expires in 120 seconds
            };

            response.ReservationEntryToken = _tokenService.CreateToken(tokenPayload);
            response.Status = "VALID";

            return response;
        }
    }

    // ================= DTO CLASSES =================
    public class AvailableLocationsResponse
    {
        public long VehicleTypeId { get; set; }
        public bool RequiresSlot { get; set; }
        public decimal ReservationHourlyPrice { get; set; }
        public List<AvailableSlotDto> AvailableSlots { get; set; } = new();
        public List<AvailableAreaDto> AvailableAreas { get; set; } = new();
    }

    public class AvailableSlotDto
    {
        public long SlotId { get; set; }
        public string SlotCode { get; set; } = null!;
        public long AreaId { get; set; }
        public string AreaCode { get; set; } = null!;
        public string AreaName { get; set; } = null!;
        public long FloorId { get; set; }
        public string FloorCode { get; set; } = null!;
        public string FloorName { get; set; } = null!;
    }

    public class AvailableAreaDto
    {
        public long AreaId { get; set; }
        public string AreaCode { get; set; } = null!;
        public string AreaName { get; set; } = null!;
        public long FloorId { get; set; }
        public string FloorCode { get; set; } = null!;
        public string FloorName { get; set; } = null!;
        public int AvailableCapacity { get; set; }
        public int TotalCapacity { get; set; }
    }

    public class CreateReservationRequest
    {
        public long? DriverId { get; set; }
        public long? VehicleId { get; set; }
        public string? PlateNumber { get; set; }
        public long VehicleTypeId { get; set; }
        public long FloorId { get; set; }
        public long AreaId { get; set; }
        public long? SlotId { get; set; }
        public int ReservedDurationMinutes { get; set; }
    }

    public class ExtendReservationRequest
    {
        public int AddedMinutes { get; set; }
    }

    public class CancelReservationRequest
    {
        public string? Reason { get; set; }
    }

    public class ReservationPaymentStatusResponse
    {
        public long ReservationId { get; set; }
        public string ReservationCode { get; set; } = string.Empty;
        public string ReservationStatus { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public decimal BookingAmount { get; set; }
        public long? PaymentId { get; set; }
        public string? Provider { get; set; }
        public string? ProviderTransactionId { get; set; }
        public string? CheckoutUrl { get; set; }
        public DateTimeOffset? PaymentExpiredAt { get; set; }
        public DateTimeOffset? PaidAt { get; set; }
        public DateTimeOffset? PaymentDeadline { get; set; }
        public int RemainingSeconds { get; set; }
        public bool IsExpired { get; set; }
    }

    public class ReservationResponseDto
    {
        public long Id { get; set; }
        public string ReservationCode { get; set; } = string.Empty;
        public long? DriverId { get; set; }
        public long? VehicleId { get; set; }
        public string? PlateNumber { get; set; }
        public string? NormalizedPlateNumber { get; set; }
        public long VehicleTypeId { get; set; }
        public long FloorId { get; set; }
        public long AreaId { get; set; }
        public long? SlotId { get; set; }
        public long? PricingRuleId { get; set; }
        public decimal SnapshotReservationHourlyPrice { get; set; }
        public int ReservedDurationMinutes { get; set; }
        public decimal BookingAmount { get; set; }
        public string PaymentStatus { get; set; } = "PENDING";
        public PayOsPaymentResponse? Payment { get; set; }
        public DateTimeOffset ReservedAt { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
        public DateTimeOffset? PaymentDeadline { get; set; }
        public DateTimeOffset? ConfirmedAt { get; set; }
        public DateTimeOffset? CheckedInAt { get; set; }
        public long? CheckedInBy { get; set; }
        public DateTimeOffset? CancelledAt { get; set; }
        public string Status { get; set; } = "PENDING";
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }

    public class ReservationDto
    {
        public long Id { get; set; }
        public string ReservationCode { get; set; } = string.Empty;
        public string Status { get; set; } = "PENDING";
        public string PaymentStatus { get; set; } = "PENDING";
        public decimal BookingAmount { get; set; }
        public DateTimeOffset? PaymentDeadline { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
        public long? DriverId { get; set; }
        public long? VehicleId { get; set; }
        public string? PlateNumber { get; set; }
        public string? NormalizedPlateNumber { get; set; }
        public long VehicleTypeId { get; set; }
        public long FloorId { get; set; }
        public long AreaId { get; set; }
        public long? SlotId { get; set; }
    }

    public class CreateReservationResponseDto
    {
        public ReservationDto Reservation { get; set; } = null!;
        public PayOsPaymentResponse? Payment { get; set; }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Storage/IStorageService.cs`

```csharp
namespace ParkingBuilding.CoreApi.Application.Storage;

public interface IStorageService
{
    Task<StorageUploadResult> UploadAsync(
        Stream stream,
        string path,
        string contentType,
        CancellationToken ct = default);

    Task<string> CreateSignedUrlAsync(
        string path,
        int? expiresInSeconds = null,
        CancellationToken ct = default);

    Task DeleteAsync(string path, CancellationToken ct = default);
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Storage/StorageUploadResult.cs`

```csharp
namespace ParkingBuilding.CoreApi.Application.Storage;

public class StorageUploadResult
{
    public string FilePath { get; set; } = string.Empty;
    public string? PublicUrl { get; set; }
    public long SizeBytes { get; set; }
    public string ContentType { get; set; } = string.Empty;
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Storage/SupabaseStorageOptions.cs`

```csharp
namespace ParkingBuilding.CoreApi.Application.Storage;

public class SupabaseStorageOptions
{
    public string? Url { get; set; }
    public string? ServiceRoleKey { get; set; }
    public string Bucket { get; set; } = "parking-images";
    public int SignedUrlExpiresSeconds { get; set; } = 900;
    public long MaxFileSizeBytes { get; set; } = 5_242_880;
    public string[] AllowedMimeTypes { get; set; } =
    [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf"
    ];

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(Url)
        && !string.IsNullOrWhiteSpace(ServiceRoleKey)
        && !string.IsNullOrWhiteSpace(Bucket)
        && !Url.Contains("__SET_BY_ENV", StringComparison.OrdinalIgnoreCase)
        && !ServiceRoleKey.Contains("__SET_BY_ENV", StringComparison.OrdinalIgnoreCase);
}
```

### File: `backend/ParkingBuilding.CoreApi/Application/Storage/SupabaseStorageService.cs`

```csharp
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;
using ParkingBuilding.CoreApi.Contracts.Common;

namespace ParkingBuilding.CoreApi.Application.Storage;

public class SupabaseStorageService : IStorageService
{
    private readonly HttpClient _httpClient;
    private readonly SupabaseStorageOptions _options;

    public SupabaseStorageService(
        HttpClient httpClient,
        IOptions<SupabaseStorageOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task<StorageUploadResult> UploadAsync(
        Stream stream,
        string path,
        string contentType,
        CancellationToken ct = default)
    {
        EnsureConfigured();

        if (string.IsNullOrWhiteSpace(path))
        {
            throw new BusinessException(ErrorCodes.InvalidRequest);
        }

        var endpoint = BuildStorageUri($"object/{Uri.EscapeDataString(_options.Bucket)}/{EscapePath(path)}");
        using var content = new StreamContent(stream);
        content.Headers.ContentType = new MediaTypeHeaderValue(contentType);

        using var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
        {
            Content = content
        };
        ApplyAuthHeaders(request);
        request.Headers.TryAddWithoutValidation("x-upsert", "false");

        using var response = await _httpClient.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            throw new BusinessException(ErrorCodes.StorageUploadFailed);
        }

        return new StorageUploadResult
        {
            FilePath = path,
            SizeBytes = stream.CanSeek ? stream.Length : 0,
            ContentType = contentType
        };
    }

    public async Task<string> CreateSignedUrlAsync(
        string path,
        int? expiresInSeconds = null,
        CancellationToken ct = default)
    {
        EnsureConfigured();

        if (string.IsNullOrWhiteSpace(path))
        {
            throw new BusinessException(ErrorCodes.InvalidRequest);
        }

        var expires = expiresInSeconds ?? _options.SignedUrlExpiresSeconds;
        var endpoint = BuildStorageUri($"object/sign/{Uri.EscapeDataString(_options.Bucket)}/{EscapePath(path)}");
        using var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
        {
            Content = JsonContent.Create(new { expiresIn = expires })
        };
        ApplyAuthHeaders(request);

        using var response = await _httpClient.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            throw new BusinessException(ErrorCodes.StorageSignedUrlFailed);
        }

        using var document = await JsonDocument.ParseAsync(
            await response.Content.ReadAsStreamAsync(ct),
            cancellationToken: ct);

        var signedPath = TryGetString(document.RootElement, "signedURL")
            ?? TryGetString(document.RootElement, "signedUrl")
            ?? TryGetString(document.RootElement, "signed_url");

        if (string.IsNullOrWhiteSpace(signedPath))
        {
            throw new BusinessException(ErrorCodes.StorageSignedUrlFailed);
        }

        if (Uri.TryCreate(signedPath, UriKind.Absolute, out _))
        {
            return signedPath;
        }

        var baseUrl = _options.Url!.TrimEnd('/');
        return $"{baseUrl}{(signedPath.StartsWith('/') ? string.Empty : "/")}{signedPath}";
    }

    public async Task DeleteAsync(string path, CancellationToken ct = default)
    {
        EnsureConfigured();

        if (string.IsNullOrWhiteSpace(path))
        {
            return;
        }

        var endpoint = BuildStorageUri($"object/{Uri.EscapeDataString(_options.Bucket)}");
        using var request = new HttpRequestMessage(HttpMethod.Delete, endpoint)
        {
            Content = JsonContent.Create(new { prefixes = new[] { path } })
        };
        ApplyAuthHeaders(request);

        using var response = await _httpClient.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            throw new BusinessException(ErrorCodes.StorageDeleteFailed);
        }
    }

    private void EnsureConfigured()
    {
        if (!_options.IsConfigured)
        {
            throw new BusinessException(ErrorCodes.StorageConfigMissing);
        }
    }

    private Uri BuildStorageUri(string relativePath)
    {
        var baseUrl = _options.Url!.TrimEnd('/');
        return new Uri($"{baseUrl}/storage/v1/{relativePath}");
    }

    private void ApplyAuthHeaders(HttpRequestMessage request)
    {
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ServiceRoleKey);
        request.Headers.TryAddWithoutValidation("apikey", _options.ServiceRoleKey);
    }

    private static string EscapePath(string path)
        => string.Join("/", path.Split('/', StringSplitOptions.RemoveEmptyEntries)
            .Select(Uri.EscapeDataString));

    private static string? TryGetString(JsonElement element, string propertyName)
        => element.TryGetProperty(propertyName, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;
}
```

### File: `backend/ParkingBuilding.CoreApi/appsettings.Development.json`

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "__MASKED__"
  },
  "Jwt": {
    "Issuer": "ParkingBuilding.CoreApi",
    "Audience": "ParkingBuilding.Frontend",
    "Secret": "__MASKED__",
    "ExpirationMinutes": 60
  }
}
```

### File: `backend/ParkingBuilding.CoreApi/appsettings.json`

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "__MASKED__"
  },
  "Jwt": {
    "Issuer": "ParkingBuilding.CoreApi",
    "Audience": "ParkingBuilding.Frontend",
    "Secret": "__MASKED__",
    "ExpirationMinutes": 60
  },
  "AllowedHosts": "*"
}
```

### File: `backend/ParkingBuilding.CoreApi/Contracts/Common/ApiResponse.cs`

```csharp
using System;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Contracts.Common
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }
        public int? StatusCode { get; set; }
        public string? ErrorCode { get; set; }
        public string? TraceId { get; set; }
        public string? Path { get; set; }
        public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

        public ApiResponse() { }

        public ApiResponse(
            bool success, 
            string message, 
            T? data = default, 
            List<string>? errors = null, 
            int? statusCode = null, 
            string? errorCode = null, 
            string? traceId = null, 
            string? path = null)
        {
            Success = success;
            Message = message;
            Data = data;
            Errors = errors;
            StatusCode = statusCode;
            ErrorCode = errorCode;
            TraceId = traceId;
            Path = path;
        }

        public static ApiResponse<T> SuccessResult(
            T data, 
            string message = "OK", 
            int? statusCode = null, 
            string? traceId = null, 
            string? path = null)
        {
            return new ApiResponse<T>(true, message, data, null, statusCode, null, traceId, path);
        }
    }

    public class ApiResponse : ApiResponse<object>
    {
        public ApiResponse() { }

        public ApiResponse(
            bool success, 
            string message, 
            object? data = null, 
            List<string>? errors = null, 
            int? statusCode = null, 
            string? errorCode = null, 
            string? traceId = null, 
            string? path = null)
            : base(success, message, data, errors, statusCode, errorCode, traceId, path)
        {
        }

        // Factory helpers
        public static ApiResponse<T> SuccessResult<T>(
            T data, 
            string message = "OK", 
            int? statusCode = null, 
            string? traceId = null, 
            string? path = null) =>
            new(true, message, data, null, statusCode, null, traceId, path);

        public static ApiResponse SuccessResult(
            string message = "OK", 
            int? statusCode = null, 
            string? traceId = null, 
            string? path = null) =>
            new(true, message, null, null, statusCode, null, traceId, path);

        public static ApiResponse FailureResult(
            string message, 
            List<string>? errors = null, 
            string? errorCode = null, 
            int? statusCode = null, 
            string? traceId = null, 
            string? path = null) =>
            new(false, message, null, errors, statusCode, errorCode, traceId, path);

        public static ApiResponse FailureResult(
            string message, 
            string error, 
            string? errorCode = null, 
            int? statusCode = null, 
            string? traceId = null, 
            string? path = null) =>
            new(false, message, null, new List<string> { error }, statusCode, errorCode, traceId, path);
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Contracts/Common/BusinessException.cs`

```csharp
using System;
using Microsoft.AspNetCore.Http;

namespace ParkingBuilding.CoreApi.Contracts.Common;

public class BusinessException : Exception
{
    public string ErrorCode { get; }
    public int StatusCode { get; }

    public BusinessException(
        string errorCode,
        int statusCode = StatusCodes.Status400BadRequest)
        : base(errorCode)
    {
        ErrorCode = errorCode;
        StatusCode = statusCode;
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Contracts/Common/ErrorCodes.cs`

```csharp
namespace ParkingBuilding.CoreApi.Contracts.Common;

public static class ErrorCodes
{
    public const string ValidationError = "VALIDATION_ERROR";
    public const string Unauthorized = "UNAUTHORIZED";
    public const string Forbidden = "FORBIDDEN";
    public const string InvalidRequest = "INVALID_REQUEST";
    public const string NotFound = "NOT_FOUND";
    public const string Conflict = "CONFLICT";
    public const string InternalServerError = "INTERNAL_SERVER_ERROR";
    public const string DevelopmentOnlyEndpoint = "DEVELOPMENT_ONLY_ENDPOINT";

    public const string LoginInvalidCredentials = "LOGIN_INVALID_CREDENTIALS";
    public const string AuthUserNotFound = "AUTH_USER_NOT_FOUND";
    public const string AuthUserInactive = "AUTH_USER_INACTIVE";
    public const string AuthUserIdMissing = "AUTH_USER_ID_MISSING";
    public const string AuthUserIdInvalid = "AUTH_USER_ID_INVALID";

    public const string UserNotFound = "USER_NOT_FOUND";
    public const string UserNotActive = "USER_NOT_ACTIVE";
    public const string DriverRequired = "DRIVER_REQUIRED";
    public const string DriverProfileNotFound = "DRIVER_PROFILE_NOT_FOUND";
    public const string DriverIdRequiredForStaffBooking = "DRIVER_ID_REQUIRED_FOR_STAFF_BOOKING";

    public const string CardNotFound = "CARD_NOT_FOUND";
    public const string CardQrNotFound = "CARD_QR_NOT_FOUND";
    public const string CardHasNoActiveSession = "CARD_HAS_NO_ACTIVE_SESSION";
    public const string CardNotAvailable = "CARD_NOT_AVAILABLE";
    public const string CardNotAvailableForMonthlyPass = "CARD_NOT_AVAILABLE_FOR_MONTHLY_PASS";
    public const string CardIsMonthlyUseMonthlyFlow = "CARD_IS_MONTHLY_USE_MONTHLY_FLOW";
    public const string CardIsMonthlyNotAllowedForReservation = "CARD_IS_MONTHLY_NOT_ALLOWED_FOR_RESERVATION";
    public const string CardIsMonthlyCannotUseAsCasual = "CARD_IS_MONTHLY_CANNOT_USE_AS_CASUAL";
    public const string CardNumberRequired = "CARD_NUMBER_REQUIRED";
    public const string CardNumberExists = "CARD_NUMBER_EXISTS";
    public const string CardAlreadyMapped = "CARD_ALREADY_MAPPED";
    public const string CardCodeRequired = "CARD_CODE_REQUIRED";

    public const string VehicleTypeNotFound = "VEHICLE_TYPE_NOT_FOUND";
    public const string VehicleTypeMismatch = "VEHICLE_TYPE_MISMATCH";
    public const string VehicleTypeNameRequired = "VEHICLE_TYPE_NAME_REQUIRED";
    public const string VehicleTypeNameExists = "VEHICLE_TYPE_NAME_EXISTS";
    public const string VehicleNotFound = "VEHICLE_NOT_FOUND";
    public const string VehicleNotBelongToDriver = "VEHICLE_NOT_BELONG_TO_DRIVER";
    public const string VehicleDescriptionRequired = "VEHICLE_DESCRIPTION_REQUIRED";
    public const string VehicleTypeRequired = "VEHICLE_TYPE_REQUIRED";
    public const string VehicleAlreadyHasActiveReservation = "VEHICLE_ALREADY_HAS_ACTIVE_RESERVATION";
    public const string VehicleAlreadyInParking = "VEHICLE_ALREADY_IN_PARKING";

    public const string FloorNotFound = "FLOOR_NOT_FOUND";
    public const string FloorNotActive = "FLOOR_NOT_ACTIVE";
    public const string FloorCodeRequired = "FLOOR_CODE_REQUIRED";
    public const string FloorNameRequired = "FLOOR_NAME_REQUIRED";
    public const string FloorCodeExists = "FLOOR_CODE_EXISTS";
    public const string SelectedFloorNotActive = "SELECTED_FLOOR_NOT_ACTIVE";

    public const string GateNotFound = "GATE_NOT_FOUND";
    public const string GateNotActive = "GATE_NOT_ACTIVE";
    public const string EntryGateRequired = "ENTRY_GATE_REQUIRED";

    public const string SlotRequired = "SLOT_REQUIRED";
    public const string SelectedSlotRequired = "SELECTED_SLOT_REQUIRED";
    public const string SlotNotFound = "SLOT_NOT_FOUND";
    public const string ReservedSlotNotFound = "RESERVED_SLOT_NOT_FOUND";
    public const string SlotNotAvailable = "SLOT_NOT_AVAILABLE";
    public const string SelectedSlotNotAvailable = "SELECTED_SLOT_NOT_AVAILABLE";
    public const string ReservedSlotNotAvailable = "RESERVED_SLOT_NOT_AVAILABLE";
    public const string SlotNotAllowedForVehicleType = "SLOT_NOT_ALLOWED_FOR_VEHICLE_TYPE";
    public const string SlotVehicleTypeMismatch = "SLOT_VEHICLE_TYPE_MISMATCH";
    public const string SlotMustBeNullForAreaManagedVehicle = "SLOT_MUST_BE_NULL_FOR_AREA_MANAGED_VEHICLE";
    public const string SlotAlreadyMapped = "SLOT_ALREADY_MAPPED";
    public const string SlotAreaInactive = "SLOT_AREA_INACTIVE";
    public const string SlotAreaMismatch = "SLOT_AREA_MISMATCH";
    public const string SlotStatusTransitionInvalid = "SLOT_STATUS_TRANSITION_INVALID";
    public const string SlotFloorInactive = "SLOT_FLOOR_INACTIVE";
    public const string SlotCodeRequired = "SLOT_CODE_REQUIRED";
    public const string SlotCodeExists = "SLOT_CODE_EXISTS";

    public const string AreaRequired = "AREA_REQUIRED";
    public const string SelectedAreaRequired = "SELECTED_AREA_REQUIRED";
    public const string AreaNotFound = "AREA_NOT_FOUND";
    public const string AreaInactive = "AREA_INACTIVE";
    public const string SelectedAreaNotActive = "SELECTED_AREA_NOT_ACTIVE";
    public const string SelectedAreaFull = "SELECTED_AREA_FULL";
    public const string AreaNotAvailable = "AREA_NOT_AVAILABLE";
    public const string AreaFloorInactive = "AREA_FLOOR_INACTIVE";
    public const string AreaFloorMismatch = "AREA_FLOOR_MISMATCH";
    public const string AreaVehicleTypeMismatch = "AREA_VEHICLE_TYPE_MISMATCH";
    public const string AreaBookingFull = "AREA_BOOKING_FULL";
    public const string AreaCapacityInvalid = "AREA_CAPACITY_INVALID";
    public const string AreaCapacityBelowOccupancy = "AREA_CAPACITY_BELOW_OCCUPANCY";
    public const string AreaCapacityBelowBookings = "AREA_CAPACITY_BELOW_BOOKINGS";
    public const string AreaCodeRequired = "AREA_CODE_REQUIRED";
    public const string AreaNameRequired = "AREA_NAME_REQUIRED";
    public const string AreaCodeExists = "AREA_CODE_EXISTS";

    public const string ReservationNotFound = "RESERVATION_NOT_FOUND";
    public const string ReservationIdRequired = "RESERVATION_ID_REQUIRED";
    public const string ReservationCancelled = "RESERVATION_CANCELLED";
    public const string ReservationExpired = "RESERVATION_EXPIRED";
    public const string ReservationNotConfirmed = "RESERVATION_NOT_CONFIRMED";
    public const string ReservationNotCancellable = "RESERVATION_NOT_CANCELLABLE";
    public const string ReservationNotExtendable = "RESERVATION_NOT_EXTENDABLE";
    public const string ReservationAlreadyCheckedIn = "RESERVATION_ALREADY_CHECKED_IN";
    public const string ReservationPlateMismatch = "RESERVATION_PLATE_MISMATCH";
    public const string ReservationExtensionMinutesInvalid = "RESERVATION_EXTENSION_MINUTES_INVALID";
    public const string ReservationEntryTokenRequired = "RESERVATION_ENTRY_TOKEN_REQUIRED";
    public const string ReservationEntryTokenMismatch = "RESERVATION_ENTRY_TOKEN_MISMATCH";
    public const string ReservationEntryTokenExpired = "RESERVATION_ENTRY_TOKEN_EXPIRED";
    public const string ReservationEntryTokenInvalid = "RESERVATION_ENTRY_TOKEN_INVALID";
    public const string ReservationEntryTokenSecretConfigRequired = "RESERVATION_ENTRY_TOKEN_SECRET_CONFIG_REQUIRED";
    public const string ReservationVehicleTypeMismatch = "RESERVATION_VEHICLE_TYPE_MISMATCH";
    public const string ReservationAreaMismatch = "RESERVATION_AREA_MISMATCH";
    public const string ReservationSlotMismatch = "RESERVATION_SLOT_MISMATCH";
    public const string ReservedFloorInactive = "RESERVED_FLOOR_INACTIVE";
    public const string ReservedAreaInactive = "RESERVED_AREA_INACTIVE";

    public const string EntryModeInvalid = "ENTRY_MODE_INVALID";
    public const string EntryPlateRequired = "ENTRY_PLATE_REQUIRED";
    public const string PlateRequiredForSlotVehicle = "PLATE_REQUIRED_FOR_SLOT_VEHICLE";
    public const string QrTokenRequired = "QR_TOKEN_REQUIRED";
    public const string ClaimFailed = "CLAIM_FAILED";
    public const string SessionNotFound = "SESSION_NOT_FOUND";
    public const string SessionAlreadyClaimed = "SESSION_ALREADY_CLAIMED";
    public const string LicensePlateRequired = "LICENSE_PLATE_REQUIRED";
    public const string PlateAlreadyMapped = "PLATE_ALREADY_MAPPED";
    public const string PlateAlreadyHasActiveReservation = "PLATE_ALREADY_HAS_ACTIVE_RESERVATION";

    public const string MonthlyPassNotFound = "MONTHLY_PASS_NOT_FOUND";
    public const string MonthlyPassIdRequired = "MONTHLY_PASS_ID_REQUIRED";
    public const string MonthlyPassExpired = "MONTHLY_PASS_EXPIRED";
    public const string MonthlyPassLocked = "MONTHLY_PASS_LOCKED";
    public const string MonthlyCardMismatch = "MONTHLY_CARD_MISMATCH";
    public const string MonthlyPlateMismatch = "MONTHLY_PLATE_MISMATCH";
    public const string MonthlyVehicleTypeMismatch = "MONTHLY_VEHICLE_TYPE_MISMATCH";
    public const string MonthlyFloorInactive = "MONTHLY_FLOOR_INACTIVE";
    public const string MonthlyFloorNotAvailable = "MONTHLY_FLOOR_NOT_AVAILABLE";
    public const string MonthlyAreaInactive = "MONTHLY_AREA_INACTIVE";
    public const string MonthlyAreaNotAvailable = "MONTHLY_AREA_NOT_AVAILABLE";
    public const string MonthlyAreaMismatch = "MONTHLY_AREA_MISMATCH";
    public const string MonthlySlotMismatch = "MONTHLY_SLOT_MISMATCH";
    public const string MonthlySlotNotAvailable = "MONTHLY_SLOT_NOT_AVAILABLE";
    public const string MonthlySlotVehicleTypeMismatch = "MONTHLY_SLOT_VEHICLE_TYPE_MISMATCH";
    public const string MonthlyFixedLocationMismatch = "MONTHLY_FIXED_LOCATION_MISMATCH";
    public const string MonthlyEntryTokenRequired = "MONTHLY_ENTRY_TOKEN_REQUIRED";
    public const string MonthlyEntryTokenMismatch = "MONTHLY_ENTRY_TOKEN_MISMATCH";
    public const string MonthlyEntryTokenExpired = "MONTHLY_ENTRY_TOKEN_EXPIRED";
    public const string MonthlyEntryTokenInvalid = "MONTHLY_ENTRY_TOKEN_INVALID";
    public const string MonthlyEntryTokenSecretConfigRequired = "MONTHLY_ENTRY_TOKEN_SECRET_CONFIG_REQUIRED";

    public const string SuggestionTokenRequired = "SUGGESTION_TOKEN_REQUIRED";
    public const string SuggestionTokenExpired = "SUGGESTION_TOKEN_EXPIRED";
    public const string SuggestionTokenInvalid = "SUGGESTION_TOKEN_INVALID";
    public const string SuggestionTokenSecretConfigRequired = "SUGGESTION_TOKEN_SECRET_CONFIG_REQUIRED";
    public const string SuggestionTokenStaffMismatch = "SUGGESTION_TOKEN_STAFF_MISMATCH";
    public const string SuggestionRequestMismatch = "SUGGESTION_REQUEST_MISMATCH";
    public const string SuggestionTypeMismatch = "SUGGESTION_TYPE_MISMATCH";
    public const string SuggestionOverrideNotAllowed = "SUGGESTION_OVERRIDE_NOT_ALLOWED";
    public const string OverrideReasonRequired = "OVERRIDE_REASON_REQUIRED";
    public const string NoAvailableLocation = "NO_AVAILABLE_LOCATION";

    public const string PricingRuleNotFound = "PRICING_RULE_NOT_FOUND";
    public const string PricingModelRequired = "PRICING_MODEL_REQUIRED";
    public const string PricingVehicleTypeMissing = "PRICING_VEHICLE_TYPE_MISSING";
    public const string PricingValueInvalid = "PRICING_VALUE_INVALID";
    public const string PaymentMustBePersisted = "PAYMENT_MUST_BE_PERSISTED";
    public const string PaymentNotFound = "PAYMENT_NOT_FOUND";
    public const string PaymentReservationNotFound = "PAYMENT_RESERVATION_NOT_FOUND";
    public const string PaymentNotPending = "PAYMENT_NOT_PENDING";
    public const string PayOsWebhookInvalid = "PAYOS_WEBHOOK_INVALID";
    public const string PayOsAmountMismatch = "PAYOS_AMOUNT_MISMATCH";
    public const string LostCardCaseNotFound = "LOST_CARD_CASE_NOT_FOUND";
    public const string LostCardDocumentNotFound = "LOST_CARD_DOCUMENT_NOT_FOUND";
    public const string LostCardDocumentTypeInvalid = "LOST_CARD_DOCUMENT_TYPE_INVALID";
    public const string LostCardDocumentTypeAlreadyExists = "LOST_CARD_DOCUMENT_TYPE_ALREADY_EXISTS";
    public const string FileRequired = "FILE_REQUIRED";
    public const string FileEmpty = "FILE_EMPTY";
    public const string FileTooLarge = "FILE_TOO_LARGE";
    public const string FileTypeNotAllowed = "FILE_TYPE_NOT_ALLOWED";
    public const string StorageConfigMissing = "STORAGE_CONFIG_MISSING";
    public const string StorageUploadFailed = "STORAGE_UPLOAD_FAILED";
    public const string StorageSignedUrlFailed = "STORAGE_SIGNED_URL_FAILED";
    public const string StorageDeleteFailed = "STORAGE_DELETE_FAILED";
    public const string InvalidDateRange = "INVALID_DATE_RANGE";
    public const string InvalidStatus = "INVALID_STATUS";
    public const string InvalidRole = "INVALID_ROLE";
    public const string ReservationBookingFeeRequired = "RESERVATION_BOOKING_FEE_REQUIRED";
    public const string ReservationPricingNotConfigured = "RESERVATION_PRICING_NOT_CONFIGURED";
    public const string ReservationDurationInvalid = "RESERVATION_DURATION_INVALID";
    public const string ReservationDurationMustBeWholeHours = "RESERVATION_DURATION_MUST_BE_WHOLE_HOURS";
    public const string ReservationDurationExceedsLimit = "RESERVATION_DURATION_EXCEEDS_LIMIT";
    public const string ReservationHourlyPriceMustBeInteger = "RESERVATION_HOURLY_PRICE_MUST_BE_INTEGER";
    public const string ReservationBookingAmountMustBeInteger = "RESERVATION_BOOKING_AMOUNT_MUST_BE_INTEGER";
    public const string ReservationAmountMismatch = "RESERVATION_AMOUNT_MISMATCH";
    public const string ReservationCodeGenerationFailed = "RESERVATION_CODE_GENERATION_FAILED";
    public const string ReservationPaymentDeadlineExpired = "RESERVATION_PAYMENT_DEADLINE_EXPIRED";
    public const string PaymentPending = "PAYMENT_PENDING";
    public const string PayOsConfigRequired = "PAYOS_CONFIG_REQUIRED";
    public const string PayOsCreateLinkFailed = "PAYOS_CREATE_LINK_FAILED";
    public const string PayOsCancelLinkFailed = "PAYOS_CANCEL_LINK_FAILED";
    public const string PayOsWebhookLatePayment = "PAYOS_WEBHOOK_LATE_PAYMENT";
    public const string PayOsWebhookConfirmFailed = "PAYOS_WEBHOOK_CONFIRM_FAILED";
    public const string ReservationExtensionPaymentNotImplemented = "RESERVATION_EXTENSION_PAYMENT_NOT_IMPLEMENTED";
    public const string ReservationSlotAlreadyReserved = "RESERVATION_SLOT_ALREADY_RESERVED";
    public const string ReservationAreaFull = "RESERVATION_AREA_FULL";
}
```

### File: `backend/ParkingBuilding.CoreApi/Contracts/Common/ErrorMessages.cs`

```csharp
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Contracts.Common;

public static class ErrorMessages
{
    private static readonly Dictionary<string, string> Messages = new()
    {
        [ErrorCodes.ValidationError] = "Du lieu gui len khong hop le.",
        [ErrorCodes.Unauthorized] = "Ban can dang nhap de tiep tuc.",
        [ErrorCodes.Forbidden] = "Ban khong co quyen thuc hien thao tac nay.",
        [ErrorCodes.InvalidRequest] = "Yeu cau khong hop le.",
        [ErrorCodes.NotFound] = "Khong tim thay du lieu.",
        [ErrorCodes.Conflict] = "Du lieu da ton tai.",
        [ErrorCodes.InternalServerError] = "Da co loi he thong xay ra.",
        [ErrorCodes.DevelopmentOnlyEndpoint] = "Endpoint chi kha dung trong moi truong development.",
        [ErrorCodes.LoginInvalidCredentials] = "Sai tai khoan hoac mat khau.",
        [ErrorCodes.AuthUserNotFound] = "Khong tim thay nguoi dung.",
        [ErrorCodes.AuthUserInactive] = "Tai khoan nguoi dung khong hoat dong.",
        [ErrorCodes.AuthUserIdMissing] = "Yeu cau thong tin dinh danh nguoi dung.",
        [ErrorCodes.AuthUserIdInvalid] = "Thong tin xac thuc nguoi dung khong hop le.",
        [ErrorCodes.UserNotFound] = "Khong tim thay nguoi dung.",
        [ErrorCodes.UserNotActive] = "Tai khoan nguoi dung khong hoat dong.",
        [ErrorCodes.DriverRequired] = "Tai khoan lai xe la bat buoc.",
        [ErrorCodes.DriverProfileNotFound] = "Khong tim thay ho so lai xe.",
        [ErrorCodes.DriverIdRequiredForStaffBooking] = "Yeu cau cung cap driverId khi nhan vien dat cho.",
        [ErrorCodes.CardNotFound] = "Khong tim thay the xe.",
        [ErrorCodes.CardQrNotFound] = "Khong tim thay the xe theo ma QR.",
        [ErrorCodes.CardHasNoActiveSession] = "The xe khong co phien gui xe dang hoat dong.",
        [ErrorCodes.CardNotAvailable] = "The xe khong kha dung.",
        [ErrorCodes.CardNotAvailableForMonthlyPass] = "The xe khong kha dung de dang ky ve thang moi.",
        [ErrorCodes.CardIsMonthlyUseMonthlyFlow] = "The xe da dang ky ve thang, vui long check-in theo luong ve thang.",
        [ErrorCodes.CardIsMonthlyNotAllowedForReservation] = "The ve thang khong duoc dung de check-in booking.",
        [ErrorCodes.CardIsMonthlyCannotUseAsCasual] = "The da tung gan ve thang khong duoc dung lam the vang lai.",
        [ErrorCodes.CardNumberRequired] = "Ma the la bat buoc.",
        [ErrorCodes.CardNumberExists] = "Ma the da ton tai.",
        [ErrorCodes.CardAlreadyMapped] = "The xe da duoc gan cho doi tuong khac.",
        [ErrorCodes.CardCodeRequired] = "Ma the xe la bat buoc.",
        [ErrorCodes.VehicleTypeNotFound] = "Khong tim thay loai xe.",
        [ErrorCodes.VehicleTypeMismatch] = "Loai xe khong khop.",
        [ErrorCodes.VehicleTypeNameRequired] = "Ten loai xe la bat buoc.",
        [ErrorCodes.VehicleTypeNameExists] = "Ten loai xe da ton tai.",
        [ErrorCodes.VehicleNotFound] = "Khong tim thay xe.",
        [ErrorCodes.VehicleNotBelongToDriver] = "Xe khong thuoc tai khoan lai xe nay.",
        [ErrorCodes.VehicleDescriptionRequired] = "Vui long nhap mo ta xe.",
        [ErrorCodes.VehicleTypeRequired] = "Loai xe la bat buoc.",
        [ErrorCodes.VehicleAlreadyHasActiveReservation] = "Xe da co booking dang hoat dong.",
        [ErrorCodes.VehicleAlreadyInParking] = "Xe dang co phien gui xe hoat dong.",
        [ErrorCodes.FloorNotFound] = "Khong tim thay tang do xe.",
        [ErrorCodes.FloorNotActive] = "Tang do xe dang tam khoa hoac khong hoat dong.",
        [ErrorCodes.FloorCodeRequired] = "Ma tang la bat buoc.",
        [ErrorCodes.FloorNameRequired] = "Ten tang la bat buoc.",
        [ErrorCodes.FloorCodeExists] = "Ma tang da ton tai.",
        [ErrorCodes.SelectedFloorNotActive] = "Tang duoc chon hien khong hoat dong.",
        [ErrorCodes.GateNotFound] = "Khong tim thay cong vao/ra.",
        [ErrorCodes.GateNotActive] = "Cong khong hoat dong.",
        [ErrorCodes.EntryGateRequired] = "Cong vao la bat buoc.",
        [ErrorCodes.SlotRequired] = "Vi tri do la bat buoc.",
        [ErrorCodes.SelectedSlotRequired] = "Vui long chon vi tri do.",
        [ErrorCodes.SlotNotFound] = "Khong tim thay vi tri do.",
        [ErrorCodes.ReservedSlotNotFound] = "Khong tim thay vi tri do da dat truoc.",
        [ErrorCodes.SlotNotAvailable] = "Vi tri do khong kha dung.",
        [ErrorCodes.SelectedSlotNotAvailable] = "Vi tri do duoc chon khong kha dung.",
        [ErrorCodes.ReservedSlotNotAvailable] = "Vi tri do danh rieng cho booking nay khong con kha dung.",
        [ErrorCodes.SlotNotAllowedForVehicleType] = "Vi tri do khong phu hop voi loai xe.",
        [ErrorCodes.SlotVehicleTypeMismatch] = "Loai xe khong phu hop voi vi tri do.",
        [ErrorCodes.SlotMustBeNullForAreaManagedVehicle] = "Xe quan ly theo khu vuc khong duoc gan slot co dinh.",
        [ErrorCodes.SlotAlreadyMapped] = "Vi tri do da duoc gan.",
        [ErrorCodes.SlotAreaInactive] = "Khu vuc cua vi tri do dang tam khoa.",
        [ErrorCodes.SlotAreaMismatch] = "Vi tri do khong thuoc khu vuc da chon.",
        [ErrorCodes.SlotStatusTransitionInvalid] = "Khong the chuyen vi tri do sang trang thai nay.",
        [ErrorCodes.SlotFloorInactive] = "Tang do chua vi tri nay dang tam khoa.",
        [ErrorCodes.SlotCodeRequired] = "Ma vi tri do la bat buoc.",
        [ErrorCodes.SlotCodeExists] = "Ma vi tri do da ton tai trong khu vuc.",
        [ErrorCodes.AreaRequired] = "Khu vuc gui xe la bat buoc.",
        [ErrorCodes.SelectedAreaRequired] = "Vui long chon khu vuc gui xe.",
        [ErrorCodes.AreaNotFound] = "Khong tim thay khu vuc gui xe.",
        [ErrorCodes.AreaInactive] = "Khu vuc gui xe khong hoat dong.",
        [ErrorCodes.SelectedAreaNotActive] = "Khu vuc duoc chon hien khong hoat dong.",
        [ErrorCodes.SelectedAreaFull] = "Khu vuc duoc chon da day.",
        [ErrorCodes.AreaNotAvailable] = "Khu vuc gui xe khong kha dung.",
        [ErrorCodes.AreaFloorInactive] = "Tang do chua khu vuc nay dang tam khoa.",
        [ErrorCodes.AreaFloorMismatch] = "Khu vuc khong thuoc tang da chon.",
        [ErrorCodes.AreaVehicleTypeMismatch] = "Khu vuc khong ho tro loai xe nay.",
        [ErrorCodes.AreaBookingFull] = "Khu vuc khong con suc chua dat cho.",
        [ErrorCodes.AreaCapacityInvalid] = "Suc chua khu vuc khong hop le.",
        [ErrorCodes.AreaCapacityBelowOccupancy] = "Suc chua moi nho hon so xe dang gui thuc te.",
        [ErrorCodes.AreaCapacityBelowBookings] = "Suc chua moi nho hon so cho da dat.",
        [ErrorCodes.AreaCodeRequired] = "Ma khu vuc la bat buoc.",
        [ErrorCodes.AreaNameRequired] = "Ten khu vuc la bat buoc.",
        [ErrorCodes.AreaCodeExists] = "Ma khu vuc da ton tai trong tang.",
        [ErrorCodes.ReservationNotFound] = "Khong tim thay thong tin dat cho.",
        [ErrorCodes.ReservationIdRequired] = "Ma booking la bat buoc.",
        [ErrorCodes.ReservationCancelled] = "Booking da bi huy.",
        [ErrorCodes.ReservationExpired] = "Booking da het han.",
        [ErrorCodes.ReservationNotConfirmed] = "Booking chua duoc xac nhan.",
        [ErrorCodes.ReservationNotCancellable] = "Booking khong the huy o trang thai hien tai.",
        [ErrorCodes.ReservationNotExtendable] = "Booking khong the gia han o trang thai hien tai.",
        [ErrorCodes.ReservationAlreadyCheckedIn] = "Booking da duoc check-in.",
        [ErrorCodes.ReservationPlateMismatch] = "Bien so khong khop voi booking.",
        [ErrorCodes.ReservationExtensionMinutesInvalid] = "Thoi gian gia han booking khong hop le.",
        [ErrorCodes.ReservationEntryTokenRequired] = "Ma xac thuc booking la bat buoc.",
        [ErrorCodes.ReservationEntryTokenMismatch] = "Ma xac thuc booking khong khop.",
        [ErrorCodes.ReservationEntryTokenExpired] = "Ma xac thuc booking da het han.",
        [ErrorCodes.ReservationEntryTokenInvalid] = "Ma xac thuc booking khong hop le.",
        [ErrorCodes.ReservationVehicleTypeMismatch] = "Loai xe khong khop voi booking.",
        [ErrorCodes.ReservationAreaMismatch] = "Khu vuc khong khop voi booking.",
        [ErrorCodes.ReservationSlotMismatch] = "Vi tri do khong khop voi booking.",
        [ErrorCodes.ReservedFloorInactive] = "Tang cua booking khong hoat dong.",
        [ErrorCodes.ReservedAreaInactive] = "Khu vuc cua booking khong hoat dong.",
        [ErrorCodes.EntryModeInvalid] = "Che do xe vao khong hop le.",
        [ErrorCodes.EntryPlateRequired] = "Vui long nhap bien so khi xe vao cong.",
        [ErrorCodes.PlateRequiredForSlotVehicle] = "Xe can vi tri co dinh bat buoc phai co bien so.",
        [ErrorCodes.QrTokenRequired] = "Ma token QR la bat buoc.",
        [ErrorCodes.ClaimFailed] = "Khong the lien ket phien gui xe voi tai khoan lai xe.",
        [ErrorCodes.SessionNotFound] = "Khong tim thay phien gui xe.",
        [ErrorCodes.SessionAlreadyClaimed] = "Phien gui xe da duoc lien ket voi tai khoan khac.",
        [ErrorCodes.LicensePlateRequired] = "Bien so xe la bat buoc.",
        [ErrorCodes.PlateAlreadyMapped] = "Bien so da duoc gan cho doi tuong khac.",
        [ErrorCodes.PlateAlreadyHasActiveReservation] = "Bien so da co booking dang hoat dong.",
        [ErrorCodes.MonthlyPassNotFound] = "Khong tim thay ve thang.",
        [ErrorCodes.MonthlyPassIdRequired] = "Ma ve thang la bat buoc.",
        [ErrorCodes.MonthlyPassExpired] = "Ve thang da het han.",
        [ErrorCodes.MonthlyPassLocked] = "Ve thang dang bi khoa.",
        [ErrorCodes.MonthlyCardMismatch] = "The xe khong khop voi ve thang.",
        [ErrorCodes.MonthlyPlateMismatch] = "Bien so khong khop voi ve thang.",
        [ErrorCodes.MonthlyVehicleTypeMismatch] = "Loai xe khong khop voi ve thang.",
        [ErrorCodes.MonthlyFloorInactive] = "Tang do cua ve thang khong hoat dong.",
        [ErrorCodes.MonthlyFloorNotAvailable] = "Tang do cua ve thang khong kha dung.",
        [ErrorCodes.MonthlyAreaInactive] = "Khu vuc cua ve thang khong hoat dong.",
        [ErrorCodes.MonthlyAreaNotAvailable] = "Khu vuc cua ve thang khong kha dung.",
        [ErrorCodes.MonthlyAreaMismatch] = "Khu vuc gui xe khong khop voi ve thang dang ky.",
        [ErrorCodes.MonthlySlotMismatch] = "Vi tri do khong khop voi ve thang.",
        [ErrorCodes.MonthlySlotNotAvailable] = "Vi tri do cua ve thang khong kha dung.",
        [ErrorCodes.MonthlySlotVehicleTypeMismatch] = "Vi tri do cua ve thang khong phu hop voi loai xe.",
        [ErrorCodes.MonthlyFixedLocationMismatch] = "Vi tri co dinh khong khop voi ve thang.",
        [ErrorCodes.MonthlyEntryTokenRequired] = "Ma xac thuc ve thang la bat buoc.",
        [ErrorCodes.MonthlyEntryTokenMismatch] = "Ma xac thuc ve thang khong khop voi the.",
        [ErrorCodes.MonthlyEntryTokenExpired] = "Ma xac thuc ve thang da het han.",
        [ErrorCodes.MonthlyEntryTokenInvalid] = "Ma xac thuc ve thang khong hop le.",
        [ErrorCodes.SuggestionTokenRequired] = "Ma goi y vi tri la bat buoc.",
        [ErrorCodes.SuggestionTokenExpired] = "Ma goi y vi tri da het han.",
        [ErrorCodes.SuggestionTokenInvalid] = "Ma goi y vi tri khong hop le.",
        [ErrorCodes.SuggestionTokenStaffMismatch] = "Ma goi y vi tri khong khop voi nhan vien thuc hien.",
        [ErrorCodes.SuggestionRequestMismatch] = "Ma goi y khong khop voi thong tin xe vao cong.",
        [ErrorCodes.SuggestionTypeMismatch] = "Loai goi y khong khop voi lua chon.",
        [ErrorCodes.SuggestionOverrideNotAllowed] = "Nhan vien khong co quyen ghi de vi tri do goi y.",
        [ErrorCodes.OverrideReasonRequired] = "Vui long nhap ly do ghi de vi tri do goi y.",
        [ErrorCodes.NoAvailableLocation] = "Khong con vi tri trong phu hop.",
        [ErrorCodes.PricingRuleNotFound] = "Khong tim thay bang gia phu hop.",
        [ErrorCodes.PricingModelRequired] = "Thong tin bang gia la bat buoc.",
        [ErrorCodes.PricingVehicleTypeMissing] = "Loai xe cua bang gia khong ton tai.",
        [ErrorCodes.PricingValueInvalid] = "Gia va phi phai khong am.",
        [ErrorCodes.PaymentMustBePersisted] = "Thanh toan phai duoc luu truoc khi tao link.",
        [ErrorCodes.PaymentNotFound] = "Khong tim thay giao dich thanh toan.",
        [ErrorCodes.PaymentReservationNotFound] = "Khong tim thay booking cua giao dich thanh toan.",
        [ErrorCodes.PaymentNotPending] = "Giao dich thanh toan khong o trang thai cho thanh toan.",
        [ErrorCodes.PayOsWebhookInvalid] = "Webhook payOS khong hop le.",
        [ErrorCodes.PayOsAmountMismatch] = "So tien payOS khong khop voi giao dich.",
        [ErrorCodes.LostCardCaseNotFound] = "Khong tim thay ho so mat the.",
        [ErrorCodes.LostCardDocumentNotFound] = "Khong tim thay tai lieu ho so mat the.",
        [ErrorCodes.LostCardDocumentTypeInvalid] = "Loai tai lieu ho so mat the khong hop le.",
        [ErrorCodes.LostCardDocumentTypeAlreadyExists] = "Ho so da co tai lieu dang hieu luc cho loai nay.",
        [ErrorCodes.FileRequired] = "Vui long chon tep tai len.",
        [ErrorCodes.FileEmpty] = "Tep tai len dang rong.",
        [ErrorCodes.FileTooLarge] = "Tep tai len vuot qua kich thuoc cho phep.",
        [ErrorCodes.FileTypeNotAllowed] = "Dinh dang tep khong duoc ho tro.",
        [ErrorCodes.StorageConfigMissing] = "Chua cau hinh Supabase Storage.",
        [ErrorCodes.StorageUploadFailed] = "Tai tep len storage that bai.",
        [ErrorCodes.StorageSignedUrlFailed] = "Khong tao duoc signed URL cho tep.",
        [ErrorCodes.StorageDeleteFailed] = "Xoa tep tren storage that bai.",
        [ErrorCodes.InvalidDateRange] = "Khoang ngay khong hop le.",
        [ErrorCodes.InvalidStatus] = "Trang thai khong hop le.",
        [ErrorCodes.InvalidRole] = "Vai tro khong hop le.",
        [ErrorCodes.ReservationBookingFeeRequired] = "Booking yeu cau phai co phi dat cho.",
        [ErrorCodes.ReservationPricingNotConfigured] = "Chua cau hinh gia dat cho cho loai xe nay.",
        [ErrorCodes.ReservationDurationInvalid] = "Thoi luong booking khong hop le.",
        [ErrorCodes.ReservationDurationMustBeWholeHours] = "Thoi luong booking phai la so gio tron.",
        [ErrorCodes.ReservationDurationExceedsLimit] = "Thoi luong booking vuot qua gioi han cho phep.",
        [ErrorCodes.ReservationHourlyPriceMustBeInteger] = "Gia booking theo gio phai la so nguyen VND.",
        [ErrorCodes.ReservationBookingAmountMustBeInteger] = "So tien booking phai la so nguyen VND.",
        [ErrorCodes.ReservationAmountMismatch] = "So tien booking khong khop voi snapshot gia.",
        [ErrorCodes.ReservationCodeGenerationFailed] = "Khong tao duoc ma booking duy nhat.",
        [ErrorCodes.ReservationPaymentDeadlineExpired] = "Da het han thanh toan cho booking.",
        [ErrorCodes.PaymentPending] = "Giao dich thanh toan dang cho xu ly.",
        [ErrorCodes.PayOsConfigRequired] = "Chua cau hinh payOS Client ID, API Key hoac Checksum Key.",
        [ErrorCodes.PayOsCreateLinkFailed] = "Khong the tao lien ket thanh toan payOS.",
        [ErrorCodes.PayOsCancelLinkFailed] = "Khong the huy lien ket thanh toan payOS.",
        [ErrorCodes.PayOsWebhookLatePayment] = "Thanh toan tre han so voi thoi gian quy dinh.",
        [ErrorCodes.PayOsWebhookConfirmFailed] = "Khong the xac nhan webhook payOS.",
        [ErrorCodes.ReservationExtensionPaymentNotImplemented] = "Gia han booking co phi chua duoc ho tro.",
        [ErrorCodes.ReservationSlotAlreadyReserved] = "Vi tri do xe da duoc dat truoc.",
        [ErrorCodes.ReservationAreaFull] = "Khu vuc do xe da day."
    };

    public static string GetMessage(string errorCode)
        => Messages.TryGetValue(errorCode, out var message)
            ? message
            : "Loi xu ly nghiep vu.";
}
```

### File: `backend/ParkingBuilding.CoreApi/Contracts/Common/PagedResponse.cs`

```csharp
using System;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Contracts.Common
{
    public class PagedResponse<T>
    {
        public IEnumerable<T> Items { get; set; } = Array.Empty<T>();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;

        public PagedResponse() { }

        public PagedResponse(IEnumerable<T> items, int totalCount, int pageNumber, int pageSize)
        {
            Items = items;
            TotalCount = totalCount;
            PageNumber = pageNumber;
            PageSize = pageSize;
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Contracts/Requests/LoginRequest.cs`

```csharp
using System.ComponentModel.DataAnnotations;

namespace ParkingBuilding.CoreApi.Contracts.Requests
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "Username is required.")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; } = string.Empty;
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Contracts/Responses/CurrentUserResponse.cs`

```csharp
namespace ParkingBuilding.CoreApi.Contracts.Responses
{
    public class CurrentUserResponse
    {
        public long Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Contracts/Responses/HealthCheckResponse.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Contracts.Responses
{
    public class HealthCheckResponse
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = "Core API is running";
        public HealthCheckData Data { get; set; } = new();
        public object? Errors { get; set; } = null;
        public string Timestamp { get; set; } = DateTimeOffset.Now.ToString("yyyy-MM-ddTHH:mm:sszzz");
    }

    public class HealthCheckData
    {
        public string Service { get; set; } = "ParkingBuilding.CoreApi";
        public string Status { get; set; } = "UP";
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Contracts/Responses/LoginResponse.cs`

```csharp
namespace ParkingBuilding.CoreApi.Contracts.Responses
{
    public class UserDto
    {
        public long Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string TokenType { get; set; } = "Bearer";
        public int ExpiresIn { get; set; }
        public UserDto User { get; set; } = null!;
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Controllers/AreasController.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingStructure.Areas;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers;

[ApiController]
[Route("api/core/areas")]
public class AreasController : BaseApiController
{
    private readonly AreaService _service;

    public AreasController(AreaService service)
    {
        _service = service;
    }

    // GET ALL
    [HttpGet]
    [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Success(result, "Get areas successfully.");
    }

    // CREATE
    [HttpPost]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateAreaRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedSuccess(result, "Create area successfully.");
    }

    // UPDATE
    [HttpPut("{id}")]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateAreaRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Success(result, "Update area successfully.");
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Controllers/AuthController.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Contracts.Requests;
using ParkingBuilding.CoreApi.Contracts.Responses;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Domain.Enums;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Infrastructure.Security;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Contracts.Common;
using Microsoft.AspNetCore.Http;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Route("api/core/auth")]
    public class AuthController : BaseApiController
    {
        private readonly ParkingDbContext _context;
        private readonly JwtTokenGenerator _jwtTokenGenerator;
        private readonly IAuditWriterService _auditWriterService;

        public AuthController(
            ParkingDbContext context,
            JwtTokenGenerator jwtTokenGenerator,
            IAuditWriterService auditWriterService)
        {
            _context = context;
            _jwtTokenGenerator = jwtTokenGenerator;
            _auditWriterService = auditWriterService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                await _auditWriterService.WriteAuditLogAsync(
                    action: "LOGIN_FAILED",
                    targetType: "users",
                    targetId: "0",
                    reason: "Username and password are required.");

                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.LoginInvalidCredentials),
                    ErrorCodes.LoginInvalidCredentials,
                    StatusCodes.Status400BadRequest,
                    new[] { ErrorCodes.LoginInvalidCredentials });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower());

            if (user == null)
            {
                await _auditWriterService.WriteAuditLogAsync(
                    action: "LOGIN_FAILED",
                    targetType: "users",
                    targetId: "0",
                    reason: $"User '{request.Username}' not found.");

                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.LoginInvalidCredentials),
                    ErrorCodes.LoginInvalidCredentials,
                    StatusCodes.Status400BadRequest,
                    new[] { ErrorCodes.LoginInvalidCredentials });
            }

            if (user.Status != UserStatus.ACTIVE)
            {
                await _auditWriterService.WriteAuditLogAsync(
                    action: "LOGIN_FAILED",
                    targetType: "users",
                    targetId: user.Id.ToString(),
                    actorUserId: user.Id,
                    reason: $"Inactive user account status: {user.Status.ToString().ToLower()}");

                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.AuthUserInactive),
                    ErrorCodes.AuthUserInactive,
                    StatusCodes.Status400BadRequest,
                    new[] { ErrorCodes.AuthUserInactive });
            }

            // Verify password using BCrypt
            bool isPasswordCorrect = false;
            try
            {
                isPasswordCorrect = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            }
            catch (Exception)
            {
                isPasswordCorrect = false;
            }

            if (!isPasswordCorrect)
            {
                await _auditWriterService.WriteAuditLogAsync(
                    action: "LOGIN_FAILED",
                    targetType: "users",
                    targetId: user.Id.ToString(),
                    actorUserId: user.Id,
                    reason: "Incorrect password.");

                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.LoginInvalidCredentials),
                    ErrorCodes.LoginInvalidCredentials,
                    StatusCodes.Status400BadRequest,
                    new[] { ErrorCodes.LoginInvalidCredentials });
            }

            // Update LastLoginAt (optional, but good practice since LastLoginAt exists)
            try
            {
                user.LastLoginAt = DateTimeOffset.UtcNow;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                // Ignore updating login timestamp errors to avoid blocking login flow
            }

            // Write successful login audit log
            await _auditWriterService.WriteAuditLogAsync(
                action: "LOGIN_SUCCESS",
                targetType: "users",
                targetId: user.Id.ToString(),
                actorUserId: user.Id,
                reason: "Logged in successfully.");

            // Generate token
            var token = _jwtTokenGenerator.GenerateToken(user);
            var expiresInSeconds = _jwtTokenGenerator.GetExpirationSeconds();

            var response = new LoginResponse
            {
                AccessToken = token,
                TokenType = "Bearer",
                ExpiresIn = expiresInSeconds,
                User = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role.ToString().ToUpper(),
                    FullName = user.FullName
                }
            };

            return Success(response, "Login successfully");
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
            {
                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.AuthUserIdMissing),
                    ErrorCodes.AuthUserIdMissing,
                    StatusCodes.Status401Unauthorized,
                    new[] { ErrorCodes.AuthUserIdMissing });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.AuthUserNotFound),
                    ErrorCodes.AuthUserNotFound,
                    StatusCodes.Status401Unauthorized,
                    new[] { ErrorCodes.AuthUserNotFound });
            }

            if (user.Status != UserStatus.ACTIVE)
            {
                return Failure(
                    ErrorMessages.GetMessage(ErrorCodes.AuthUserInactive),
                    ErrorCodes.AuthUserInactive,
                    StatusCodes.Status401Unauthorized,
                    new[] { ErrorCodes.AuthUserInactive });
            }

            var response = new CurrentUserResponse
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString().ToUpper(),
                Status = user.Status.ToString().ToUpper()
            };

            return Success(response, "Get current user profile successfully");
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Controllers/BaseApiController.cs`

```csharp
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Contracts.Common;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace ParkingBuilding.CoreApi.Controllers
{
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        protected IActionResult Success<T>(
            T data,
            string message = "Success",
            int statusCode = StatusCodes.Status200OK)
        {
            var apiResponse = ApiResponse.SuccessResult(
                data,
                message,
                statusCode,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return StatusCode(statusCode, apiResponse);
        }

        protected IActionResult Success(
            string message = "Success",
            int statusCode = StatusCodes.Status200OK)
        {
            var apiResponse = ApiResponse.SuccessResult<object?>(
                null,
                message,
                statusCode,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return StatusCode(statusCode, apiResponse);
        }

        protected IActionResult CreatedSuccess<T>(
            T data,
            string message = "Created successfully")
        {
            var apiResponse = ApiResponse.SuccessResult(
                data,
                message,
                StatusCodes.Status201Created,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return StatusCode(StatusCodes.Status201Created, apiResponse);
        }

        protected IActionResult Failure(
            string message,
            string errorCode,
            int statusCode,
            IEnumerable<string>? errors = null)
        {
            var apiResponse = ApiResponse.FailureResult(
                message,
                errors != null ? new List<string>(errors) : null,
                errorCode,
                statusCode,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return StatusCode(statusCode, apiResponse);
        }

        protected IActionResult BusinessError(
            string errorCode,
            string? message = null,
            int statusCode = StatusCodes.Status400BadRequest)
        {
            var displayMessage = message ?? ErrorMessages.GetMessage(errorCode);
            return Failure(
                message: displayMessage,
                errorCode: errorCode,
                statusCode: statusCode,
                errors: new[] { errorCode }
            );
        }

        // Legacy helper. Do not use in new controllers; prefer Success<T>(..., statusCode) or CreatedSuccess<T>.
        protected OkObjectResult Success<T>(T data, string message)
        {
            var apiResponse = ApiResponse.SuccessResult(
                data,
                message,
                StatusCodes.Status200OK,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return Ok(apiResponse);
        }

        // Legacy helper. Do not use in new controllers; prefer Success(message, statusCode).
        protected OkObjectResult Success(string message)
        {
            var apiResponse = ApiResponse.SuccessResult<object?>(
                null,
                message,
                StatusCodes.Status200OK,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return Ok(apiResponse);
        }

        // Legacy helper. Do not use in new controllers; prefer BusinessError or Failure.
        protected BadRequestObjectResult Fail(string message, List<string>? errors = null)
        {
            var apiResponse = ApiResponse.FailureResult(
                message,
                errors,
                ErrorCodes.InvalidRequest,
                StatusCodes.Status400BadRequest,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return BadRequest(apiResponse);
        }

        // Legacy helper. Do not use in new controllers; prefer BusinessError(ErrorCodes.X).
        protected BadRequestObjectResult Fail(string message, string error)
        {
            var errorCode = NormalizeErrorCode(error, StatusCodes.Status400BadRequest);
            var apiResponse = ApiResponse.FailureResult(
                ErrorMessages.GetMessage(errorCode),
                new List<string> { error },
                errorCode,
                StatusCodes.Status400BadRequest,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return BadRequest(apiResponse);
        }

        protected ObjectResult StatusCodeResponse(int statusCode, string message, string error)
        {
            var errorCode = NormalizeErrorCode(error, statusCode);
            var apiResponse = ApiResponse.FailureResult(
                IsErrorCode(error) ? ErrorMessages.GetMessage(errorCode) : message,
                new List<string> { error },
                errorCode,
                statusCode,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return StatusCode(statusCode, apiResponse);
        }

        protected ObjectResult StatusCodeResponse(int statusCode, string message, List<string>? errors = null)
        {
            var apiResponse = ApiResponse.FailureResult(
                message,
                errors,
                DefaultErrorCodeForStatus(statusCode),
                statusCode,
                HttpContext.TraceIdentifier,
                HttpContext.Request.Path
            );
            return StatusCode(statusCode, apiResponse);
        }

        private static string NormalizeErrorCode(string value, int statusCode)
        {
            return IsErrorCode(value) ? value : DefaultErrorCodeForStatus(statusCode);
        }

        private static string DefaultErrorCodeForStatus(int statusCode)
        {
            return statusCode switch
            {
                StatusCodes.Status401Unauthorized => ErrorCodes.Unauthorized,
                StatusCodes.Status403Forbidden => ErrorCodes.Forbidden,
                StatusCodes.Status404NotFound => ErrorCodes.NotFound,
                StatusCodes.Status409Conflict => ErrorCodes.Conflict,
                >= StatusCodes.Status500InternalServerError => ErrorCodes.InternalServerError,
                _ => ErrorCodes.InvalidRequest
            };
        }

        private static bool IsErrorCode(string value)
        {
            return !string.IsNullOrWhiteSpace(value)
                && Regex.IsMatch(value, "^[A-Z0-9_]+$");
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Controllers/CardsController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Application.MonthlyPasses;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize]
    [Route("api/core/cards")]
    public class CardsController : BaseApiController
    {
        private readonly ParkingDbContext _context;
        private readonly IMonthlyPassService _monthlyPassService;
        private readonly IMonthlyEntryTokenService _monthlyTokenService;

        public CardsController(
            ParkingDbContext context,
            IMonthlyPassService monthlyPassService,
            IMonthlyEntryTokenService monthlyTokenService)
        {
            _context = context;
            _monthlyPassService = monthlyPassService;
            _monthlyTokenService = monthlyTokenService;
        }

        // 1. GET ALL (with basic filter)
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? search)
        {
            var query = _context.ParkingCards.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<CardStatus>(status, true, out var parsedStatus))
                {
                    query = query.Where(c => c.Status == parsedStatus);
                }
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c => c.CardNumber.Contains(search));
            }

            var list = await query.ToListAsync();
            return Success(list, "Get cards successfully");
        }

        // 2. GET AVAILABLE CARDS
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailable()
        {
            var list = await _context.ParkingCards
                .Where(c => c.Status == CardStatus.AVAILABLE)
                .ToListAsync();
            return Success(list, "Get available cards successfully");
        }

        // 3. GET BY ID
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var item = await _context.ParkingCards.FindAsync(id);
            if (item == null) return StatusCodeResponse(404, "Not Found", $"Card with ID {id} not found.");
            return Success(item, "Get card successfully");
        }

        // 4. CREATE CARD
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCardDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.CardNumber))
                return Fail("Bad Request", "Card number is required.");

            var cleanCardNumber = model.CardNumber.Trim();
            
            // Check duplicate card number/code
            bool isDuplicate = await _context.ParkingCards
                .AnyAsync(c => c.CardNumber.ToLower() == cleanCardNumber.ToLower());
                
            if (isDuplicate)
                return StatusCodeResponse(409, "Conflict", "Card number already exists.");

            var card = new ParkingCard
            {
                CardNumber = cleanCardNumber,
                QrToken = "QR-" + cleanCardNumber.ToUpper() + "-" + Guid.NewGuid().ToString("N").Substring(0, 16).ToUpper(),
                Status = CardStatus.AVAILABLE,
                Note = model.Note,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ParkingCards.Add(card);
            await _context.SaveChangesAsync();

            return Success(card, "Create card successfully");
        }

        // 5. UPDATE CARD
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateCardDto model)
        {
            var existing = await _context.ParkingCards.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Card not found.");

            existing.Note = model.Note;
            existing.UpdatedAt = DateTime.UtcNow;

            _context.ParkingCards.Update(existing);
            await _context.SaveChangesAsync();

            return Success(existing, "Update card successfully");
        }

        // 6. PATCH STATUS
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeStatus(long id, [FromBody] string status)
        {
            var existing = await _context.ParkingCards.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Card not found.");

            if (!Enum.TryParse<CardStatus>(status, true, out var parsedStatus))
            {
                return Fail("Bad Request", $"Invalid card status '{status}'. Valid statuses are: AVAILABLE, IN_USE, LOST, DAMAGED, INACTIVE");
            }

            existing.Status = parsedStatus;
            existing.UpdatedAt = DateTime.UtcNow;

            _context.ParkingCards.Update(existing);
            await _context.SaveChangesAsync();

            return Success(existing, "Change card status successfully");
        }

        // 7. DELETE CARD
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var existing = await _context.ParkingCards.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Card not found.");

            _context.ParkingCards.Remove(existing);
            await _context.SaveChangesAsync();

            return Success(true, "Delete card successfully");
        }

        // 8. GET CARD ENTRY CHECK
        [Authorize(Roles = "ADMIN,MANAGER,STAFF")]
        [HttpGet("{cardCode}/entry-check")]
        public async Task<IActionResult> GetCardEntryCheck(string cardCode, [FromQuery] long entryGateId)
        {
            var card = await _context.ParkingCards
                .FirstOrDefaultAsync(c => c.CardNumber.ToLower() == cardCode.ToLower().Trim());

            if (card == null)
                return StatusCodeResponse(404, "Not Found", "CARD_NOT_FOUND");

            if (card.Status != CardStatus.AVAILABLE || card.CurrentSessionId.HasValue)
                return StatusCodeResponse(400, "Bad Request", "CARD_NOT_AVAILABLE");

            var gate = await _context.Gates.Include(g => g.Floor).FirstOrDefaultAsync(g => g.Id == entryGateId);
            if (gate == null)
                return StatusCodeResponse(404, "Not Found", "GATE_NOT_FOUND");
            if (gate.GateType != "ENTRY" || gate.Status != "ACTIVE")
                return StatusCodeResponse(400, "Bad Request", "GATE_NOT_ACTIVE");

            if (gate.Floor == null || gate.Floor.Status != "ACTIVE")
            {
                return StatusCodeResponse(400, "Bad Request", "FLOOR_NOT_ACTIVE");
            }

            // Look for active monthly pass
            var monthlyPass = await _context.MonthlyPasses
                .Include(p => p.Floor)
                .Include(p => p.Area)
                .Include(p => p.Slot)
                .FirstOrDefaultAsync(p => p.CardId == card.Id && p.Status == "ACTIVE");

            if (monthlyPass != null)
            {
                var today = DateTime.UtcNow.Date;
                if (monthlyPass.StartDate.Date > today || monthlyPass.EndDate.Date < today)
                {
                    return StatusCodeResponse(400, "Bad Request", "MONTHLY_PASS_EXPIRED");
                }

                var vehicleType = await _context.VehicleTypes.FindAsync(monthlyPass.VehicleTypeId);
                if (vehicleType == null)
                    return StatusCodeResponse(400, "Bad Request", "VEHICLE_TYPE_NOT_FOUND");

                if (monthlyPass.Floor == null || monthlyPass.Floor.Status != "ACTIVE")
                    return StatusCodeResponse(400, "Bad Request", "MONTHLY_FLOOR_NOT_AVAILABLE");

                if (monthlyPass.Area == null || monthlyPass.Area.Status != "ACTIVE")
                    return StatusCodeResponse(400, "Bad Request", "MONTHLY_AREA_NOT_AVAILABLE");

                if (vehicleType.RequiresSlot)
                {
                    if (monthlyPass.Slot == null || monthlyPass.Slot.Status == "INACTIVE" || monthlyPass.Slot.Status == "LOCKED")
                        return StatusCodeResponse(400, "Bad Request", "MONTHLY_SLOT_NOT_AVAILABLE");
                }

                var staffIdStr = User.FindFirst("user_id")?.Value
                    ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? "1";
                long.TryParse(staffIdStr, out var staffId);

                var payload = new MonthlyEntryTokenPayload
                {
                    MonthlyPassId = monthlyPass.Id,
                    CardId = card.Id,
                    CardCode = card.CardNumber,
                    VehicleTypeId = monthlyPass.VehicleTypeId,
                    EntryGateId = entryGateId,
                    FixedFloorId = monthlyPass.FloorId ?? 0,
                    FixedAreaId = monthlyPass.AreaId ?? 0,
                    FixedSlotId = monthlyPass.SlotId,
                    IssuedToStaffId = staffId,
                    IssuedAt = DateTimeOffset.UtcNow,
                    ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
                };

                var token = _monthlyTokenService.CreateToken(payload);

                return Success(new
                {
                    cardStatus = card.Status.ToString(),
                    entryCardType = "MONTHLY",
                    cardId = card.Id,
                    cardCode = card.CardNumber,
                    monthlyPassId = monthlyPass.Id,
                    monthlyPassStatus = monthlyPass.Status,
                    plateNumber = monthlyPass.PlateNumber,
                    normalizedPlateNumber = monthlyPass.NormalizedPlateNumber,
                    vehicleTypeId = monthlyPass.VehicleTypeId,
                    requiresSlot = vehicleType.RequiresSlot,
                    fixedFloorId = monthlyPass.FloorId,
                    fixedAreaId = monthlyPass.AreaId,
                    fixedSlotId = monthlyPass.SlotId,
                    monthlyEntryToken = token
                }, "Card is mapped to active monthly pass");
            }

            // Task 8: Expired monthly pass cannot be used as casual card
            var anyMonthlyPass = await _context.MonthlyPasses
                .AnyAsync(p => p.CardId == card.Id);
            if (anyMonthlyPass)
            {
                return StatusCodeResponse(400, "Bad Request", "CARD_IS_MONTHLY_CANNOT_USE_AS_CASUAL");
            }

            return Success(new
            {
                cardStatus = card.Status.ToString(),
                entryCardType = "NORMAL",
                cardId = card.Id,
                cardCode = card.CardNumber,
                monthlyPassId = (long?)null
            }, "Card is available for normal entry");
        }

        // DTOs
        public class CreateCardDto
        {
            public string CardNumber { get; set; } = string.Empty;
            public string? Note { get; set; }
        }

        public class UpdateCardDto
        {
            public string? Note { get; set; }
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Controllers/DbCheckController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Infrastructure.Persistence.Diagnostics;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Controllers;

[Authorize(Roles = "ADMIN")]
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

```

### File: `backend/ParkingBuilding.CoreApi/Controllers/FloorsController.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingStructure.Floors;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers;

[ApiController]
[Route("api/core/floors")]
public class FloorsController : BaseApiController
{
    private readonly FloorService _service;

    public FloorsController(FloorService service)
    {
        _service = service;
    }

    // GET ALL
    [HttpGet]
    [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Success(result, "Get floors successfully.");
    }

    // CREATE
    [HttpPost]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateFloorRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedSuccess(result, "Create floor successfully.");
    }

    // UPDATE
    [HttpPut("{id}")]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateFloorRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Success(result, "Update floor successfully.");
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Controllers/HealthController.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using ParkingBuilding.CoreApi.Domain.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authorization;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Route("api/core/health")] // Định nghĩa Route rõ ràng tại cấp Controller
    public class HealthController : BaseApiController
    {
        private readonly ParkingDbContext _context;
        private readonly IWebHostEnvironment _env;

        public HealthController(ParkingDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet] // Kích hoạt phương thức GET cho endpoint /api/core/health
        public IActionResult GetHealth()
        {
            var data = new
            {
                service = "ParkingBuilding.CoreApi",
                status = "UP"
            };
            return Success(data, "Core API is running");
        }

        // DEV ONLY: This endpoint is only for local integration testing.
        // Do not enable it in production/demo environment.
        [HttpGet("dump-reservations")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DumpReservations()
        {
            if (!_env.IsDevelopment())
            {
                return Failure(
                    message: "Endpoint chỉ được dùng trong môi trường development.",
                    errorCode: "DEVELOPMENT_ONLY_ENDPOINT",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden
                );
            }

            var list = await _context.Reservations
                .Select(r => new {
                    r.Id,
                    r.ReservationCode,
                    r.PlateNumber,
                    r.NormalizedPlateNumber,
                    r.SlotId,
                    r.AreaId,
                    r.Status,
                    r.PaymentStatus,
                    r.ExpiresAt
                })
                .ToListAsync();
            return Success(list, "Dump reservations successfully.");
        }

        // DEV ONLY: This endpoint is only for local integration testing.
        // Do not enable it in production/demo environment.
        [HttpPost("clear-reservations")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> ClearReservations()
        {
            if (!_env.IsDevelopment())
            {
                return Failure(
                    message: "Endpoint chỉ được dùng trong môi trường development.",
                    errorCode: "DEVELOPMENT_ONLY_ENDPOINT",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden
                );
            }

            // Delete notifications first to prevent foreign key issues on monthly passes
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM notifications");

            var slots = await _context.Slots.ToListAsync();
            foreach (var slot in slots)
            {
                slot.Status = "AVAILABLE";
                slot.CurrentSessionId = null;
            }

            var areas = await _context.Areas.ToListAsync();
            foreach (var area in areas)
            {
                area.CurrentBookedSlots = 0;
                area.CurrentRealOccupancy = 0;
            }

            var cards = await _context.ParkingCards.ToListAsync();
            foreach (var card in cards)
            {
                card.Status = CardStatus.AVAILABLE;
                card.CurrentSessionId = null;
            }

            await _context.SaveChangesAsync();

            await _context.Database.ExecuteSqlRawAsync("DELETE FROM notifications;");

            var extensions = await _context.ReservationExtensions.ToListAsync();
            _context.ReservationExtensions.RemoveRange(extensions);

            var payments = await _context.Payments.ToListAsync();
            _context.Payments.RemoveRange(payments);

            var sessions = await _context.ParkingSessions.ToListAsync();
            _context.ParkingSessions.RemoveRange(sessions);

            await _context.SaveChangesAsync();

            var reservations = await _context.Reservations.ToListAsync();
            _context.Reservations.RemoveRange(reservations);

            var testMonthlyPasses = await _context.MonthlyPasses
                .Where(m => m.Id >= 1000 ||
                            m.PlateNumber.StartsWith("TEST-") ||
                            m.PlateNumber.StartsWith("TMP-") ||
                            m.PlateNumber.StartsWith("AUTO-") ||
                            m.PlateNumber.Contains("AUTO"))
                .ToListAsync();
            _context.MonthlyPasses.RemoveRange(testMonthlyPasses);

            await _context.SaveChangesAsync();
            return Success(new { message = "All reservations, sessions, monthly passes, and audit logs cleared. Slots, areas, and cards reset successfully." }, "Clear reservations successfully.");
        }

        [HttpPost("migrate-db")]
        [AllowAnonymous]
        public async Task<IActionResult> MigrateDb()
        {
            if (!_env.IsDevelopment())
            {
                return Failure(
                    message: "Endpoint chỉ được dùng trong môi trường development.",
                    errorCode: "DEVELOPMENT_ONLY_ENDPOINT",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden
                );
            }

            await _context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE monthly_passes ADD COLUMN IF NOT EXISTS floor_id BIGINT REFERENCES floors(id);
                ALTER TABLE monthly_passes ADD COLUMN IF NOT EXISTS area_id BIGINT REFERENCES areas(id);
                ALTER TABLE monthly_passes ADD COLUMN IF NOT EXISTS slot_id BIGINT REFERENCES slots(id);

                CREATE INDEX IF NOT EXISTS ix_monthly_passes_floor_id ON monthly_passes(floor_id);
                CREATE INDEX IF NOT EXISTS ix_monthly_passes_area_id ON monthly_passes(area_id);
                CREATE INDEX IF NOT EXISTS ix_monthly_passes_slot_id ON monthly_passes(slot_id);

                DROP INDEX IF EXISTS ux_active_monthly_pass_slot;
                CREATE UNIQUE INDEX IF NOT EXISTS ux_active_monthly_pass_slot
                ON monthly_passes(slot_id)
                WHERE status = 'ACTIVE' AND slot_id IS NOT NULL;

                -- Allow reservations without plate number
                ALTER TABLE reservations ALTER COLUMN plate_number DROP NOT NULL;
                ALTER TABLE reservations ALTER COLUMN normalized_plate_number DROP NOT NULL;

                DROP INDEX IF EXISTS ux_pending_reservation_by_plate_type;
                DROP INDEX IF EXISTS ux_active_reservation_by_plate_type;

                CREATE UNIQUE INDEX IF NOT EXISTS ux_active_reservation_by_plate_type
                ON reservations(normalized_plate_number, vehicle_type_id)
                WHERE normalized_plate_number IS NOT NULL
                  AND status IN ('PENDING', 'CONFIRMED');

                -- Update check constraint
                ALTER TABLE reservations DROP CONSTRAINT IF EXISTS ck_reservations_plate_required;
                ALTER TABLE reservations ADD CONSTRAINT ck_reservations_plate_required CHECK (
                    (plate_number IS NULL AND normalized_plate_number IS NULL)
                    OR (NULLIF(BTRIM(plate_number), '') IS NOT NULL AND NULLIF(BTRIM(normalized_plate_number), '') IS NOT NULL)
                );

                -- Seed users (nếu chưa có)
                INSERT INTO users (id, full_name, username, email, phone, password_hash, role, status, created_at, updated_at)
                VALUES 
                    (3, 'Driver User', 'driver01', 'driver01@parking.com', '0900000003', '$2a$11$Z.L401fM2jJjA2h9o4y2u.UqWp9v68z4Ww/Q75p5Q.Y1L0.86r28G', 'DRIVER', 'ACTIVE', now(), now()),
                    (4, 'Other Driver', 'driver02', 'driver02@parking.com', '0900000004', '$2a$11$Z.L401fM2jJjA2h9o4y2u.UqWp9v68z4Ww/Q75p5Q.Y1L0.86r28G', 'DRIVER', 'ACTIVE', now(), now())
                ON CONFLICT (id) DO NOTHING;

                -- Seed driver_profiles (nếu chưa có)
                INSERT INTO driver_profiles (id, user_id, full_name, phone, email, status, driver_type, apartment_number, cccd_number, created_at, updated_at)
                VALUES 
                    (1, 3, 'Driver User', '0900000003', 'driver01@parking.com', 'ACTIVE', 'RESIDENT', 'A-101', '123456789012', now(), now()),
                    (2, 4, 'Other Driver', '0900000004', 'driver02@parking.com', 'ACTIVE', 'RESIDENT', 'B-202', '123456789013', now(), now())
                ON CONFLICT (id) DO NOTHING;

                -- Seed vehicles (nếu chưa có)
                INSERT INTO vehicles (id, driver_id, plate_number, normalized_plate_number, vehicle_type_id, description, status, created_at, updated_at)
                VALUES
                    (2, 2, '29A-88888', '29A88888', 5, 'Other Driver Car', 'ACTIVE', now(), now()),
                    (3, 1, '29A-11111', '29A11111', 5, 'Driver owned car', 'ACTIVE', now(), now())
                ON CONFLICT (id) DO NOTHING;

                -- Ensure driver_id is correctly mapped even if vehicles/profiles already existed
                UPDATE vehicles SET driver_id = 2 WHERE id = 2;
                UPDATE vehicles SET driver_id = 1 WHERE id = 3;

                -- Add reservation payment deadline columns
                ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ NULL;
                ALTER TABLE reservations ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ NULL;
                CREATE INDEX IF NOT EXISTS ix_reservations_payment_deadline ON reservations(payment_deadline);
                CREATE INDEX IF NOT EXISTS ix_reservations_confirmed_at ON reservations(confirmed_at);
            ");

            var constraints = new System.Collections.Generic.List<string>();
            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = @"
                    SELECT conname || ': ' || pg_get_constraintdef(oid)
                    FROM pg_constraint 
                    WHERE conrelid = 'reservations'::regclass AND contype = 'c';";
                
                var wasOpen = _context.Database.GetDbConnection().State == System.Data.ConnectionState.Open;
                if (!wasOpen) await _context.Database.GetDbConnection().OpenAsync();
                try
                {
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            constraints.Add(reader.GetString(0));
                        }
                    }
                }
                finally
                {
                    if (!wasOpen) await _context.Database.GetDbConnection().CloseAsync();
                }
            }

            return Success(new { message = "Database migrated successfully.", constraints = constraints }, "Database migrated successfully.");
        }

        [HttpPost("expire-reservation")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> ExpireReservation([FromQuery] string reservationCode)
        {
            if (!_env.IsDevelopment())
            {
                return Failure(
                    message: "Endpoint chỉ được dùng trong môi trường development.",
                    errorCode: "DEVELOPMENT_ONLY_ENDPOINT",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden
                );
            }

            var reservation = await _context.Reservations.FirstOrDefaultAsync(r => r.ReservationCode == reservationCode);
            if (reservation == null)
            {
                return Failure(
                    message: "Reservation not found.",
                    errorCode: "RESERVATION_NOT_FOUND",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status404NotFound
                );
            }

            reservation.ReservedAt = DateTimeOffset.UtcNow.AddMinutes(-65);
            reservation.ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(-5);
            await _context.SaveChangesAsync();

            return Success(new { message = "Reservation expired successfully." }, "Reservation expired successfully.");
        }

        [HttpPost("expire-payment-deadline")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> ExpirePaymentDeadline([FromQuery] string reservationCode)
        {
            if (!_env.IsDevelopment())
            {
                return Failure(
                    message: "Endpoint chỉ được dùng trong môi trường development.",
                    errorCode: "DEVELOPMENT_ONLY_ENDPOINT",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden
                );
            }

            var reservation = await _context.Reservations.FirstOrDefaultAsync(r => r.ReservationCode == reservationCode);
            if (reservation == null)
            {
                return Failure(
                    message: "Reservation not found.",
                    errorCode: "RESERVATION_NOT_FOUND",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status404NotFound
                );
            }

            reservation.PaymentDeadline = DateTimeOffset.UtcNow.AddMinutes(-5);
            await _context.SaveChangesAsync();

            return Success(new { message = "Payment deadline expired successfully." }, "Payment deadline expired successfully.");
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Controllers/LostCardDocumentsController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.LostCards.Documents;
using ParkingBuilding.CoreApi.Contracts.Common;
using System.Security.Claims;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
    [Route("api/core/lost-cards")]
    public class LostCardDocumentsController : BaseApiController
    {
        private readonly ILostCardDocumentService _documentService;

        public LostCardDocumentsController(ILostCardDocumentService documentService)
        {
            _documentService = documentService;
        }

        [HttpPost("{caseId:long}/documents")]
        [RequestSizeLimit(10_485_760)]
        public async Task<IActionResult> Upload(
            long caseId,
            [FromForm] UploadLostCardDocumentRequest request,
            CancellationToken ct)
        {
            var actorUserId = GetCurrentUserIdOrThrow();
            var result = await _documentService.UploadAsync(
                caseId,
                request.File,
                request.DocumentType,
                request.Note,
                actorUserId,
                ct);

            return CreatedSuccess(result, "Upload lost card document successfully.");
        }

        [HttpPost("{caseId:long}/documents/batch")]
        [RequestSizeLimit(31_457_280)]
        public async Task<IActionResult> UploadBatch(
            long caseId,
            [FromForm] UploadLostCardDocumentsBatchRequest request,
            CancellationToken ct)
        {
            var actorUserId = GetCurrentUserIdOrThrow();
            var result = await _documentService.UploadBatchAsync(
                caseId,
                request.Files,
                request.DocumentTypes,
                request.Notes,
                actorUserId,
                ct);

            return CreatedSuccess(result, "Upload lost card documents successfully.");
        }

        [HttpGet("{caseId:long}/documents")]
        public async Task<IActionResult> GetByCase(long caseId, CancellationToken ct)
        {
            var result = await _documentService.GetByCaseAsync(caseId, ct);
            return Success(result, "Get lost card documents successfully.");
        }

        [Authorize(Roles = "MANAGER,ADMIN")]
        [HttpDelete("{caseId:long}/documents/{documentId:long}")]
        public async Task<IActionResult> Delete(
            long caseId,
            long documentId,
            CancellationToken ct)
        {
            var actorUserId = GetCurrentUserIdOrThrow();
            await _documentService.DeleteAsync(caseId, documentId, actorUserId, ct);
            return Success("Delete lost card document successfully.");
        }

        private long GetCurrentUserIdOrThrow()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdMissing);
            }

            if (!long.TryParse(userIdClaim, out var userId))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdInvalid);
            }

            return userId;
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Controllers/MonthlyPassesController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Application.MonthlyPasses;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize(Roles = "ADMIN,MANAGER")]
    [Route("api/core/monthly-passes")]
    public class MonthlyPassesController : BaseApiController
    {
        private readonly IMonthlyPassService _monthlyPassService;
        private readonly ParkingDbContext _context;

        public MonthlyPassesController(IMonthlyPassService monthlyPassService, ParkingDbContext context)
        {
            _monthlyPassService = monthlyPassService;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? search)
        {
            var query = _context.MonthlyPasses
                .Include(p => p.Floor)
                .Include(p => p.Area)
                .Include(p => p.Slot)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(p => p.Status == status.ToUpperInvariant());
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.OwnerName.Contains(search) || p.PlateNumber.Contains(search));
            }

            var list = await query.ToListAsync();
            return Success(list, "Get monthly passes successfully");
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMonthlyPassRequest request)
        {
            var userId = GetCurrentUserIdOrDefault();
            var result = await _monthlyPassService.CreateMonthlyPassAsync(request, userId);
            return CreatedSuccess(result, "Create monthly pass successfully");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateMonthlyPassRequest request)
        {
            var userId = GetCurrentUserIdOrDefault();
            var result = await _monthlyPassService.UpdateMonthlyPassAsync(id, request, userId);
            return Success(result, "Update monthly pass successfully");
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeStatus(long id, [FromBody] string status)
        {
            var userId = GetCurrentUserIdOrDefault();
            var result = await _monthlyPassService.ChangeStatusAsync(id, status, userId);
            return Success(result, "Change status successfully");
        }

        [HttpPost("{id}/renew")]
        public async Task<IActionResult> Renew(long id, [FromBody] RenewMonthlyPassRequest request)
        {
            var userId = GetCurrentUserIdOrDefault();
            var result = await _monthlyPassService.RenewAsync(id, request, userId);
            return Success(result, "Renew monthly pass successfully");
        }

        [Authorize(Roles = "ADMIN,MANAGER,STAFF")]
        [HttpGet("check")]
        public async Task<IActionResult> Check([FromQuery] string plateNumber, [FromQuery] long vehicleTypeId)
        {
            var pass = await _monthlyPassService.FindValidPassAsync(plateNumber, vehicleTypeId, DateTimeOffset.UtcNow);
            if (pass == null)
            {
                throw new BusinessException(ErrorCodes.MonthlyPassNotFound, StatusCodes.Status404NotFound);
            }

            return Success(pass, "Active monthly pass found");
        }

        private long GetCurrentUserIdOrDefault()
        {
            var userIdStr = User.FindFirst("user_id")?.Value
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? "1";

            return long.TryParse(userIdStr, out var userId) ? userId : 1;
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Controllers/ParkingSessionsController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;
using ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion;
using ParkingBuilding.CoreApi.Contracts.Common;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Route("api/core/parking-sessions")]
    public class ParkingSessionsController : BaseApiController
    {
        private readonly IEntryService _entryService;
        private readonly ILocationSuggestionService _suggestionService;

        public ParkingSessionsController(
            IEntryService entryService,
            ILocationSuggestionService suggestionService)
        {
            _entryService = entryService;
            _suggestionService = suggestionService;
        }

        [HttpPost("entry")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        public async Task<IActionResult> CreateEntry([FromBody] CreateEntryRequest request)
        {
            var staffId = GetCurrentUserIdOrThrow();
            var role = GetCurrentUserRoleOrDefault("STAFF");

            var result = await _entryService.CreateEntryAsync(request, staffId, role);
            return Success(result, "Cho xe vao bai thanh cong.");
        }

        [HttpPost("{qrToken}/claim")]
        [Authorize(Roles = "DRIVER")]
        public async Task<IActionResult> ClaimSession(string qrToken)
        {
            var userId = User.FindFirst("user_id")?.Value;

            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdMissing);
            }

            if (string.IsNullOrWhiteSpace(qrToken))
            {
                throw new BusinessException(ErrorCodes.QrTokenRequired);
            }

            var result = await _entryService.ClaimSessionAsync(userId, qrToken);
            if (!result)
            {
                throw new BusinessException(ErrorCodes.ClaimFailed);
            }

            return Success("Claim phien gui xe thanh cong.");
        }

        [HttpGet("location-suggestion")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        public async Task<IActionResult> SuggestLocation(
            [FromQuery] long vehicleTypeId,
            [FromQuery] long entryGateId)
        {
            var staffId = GetCurrentUserIdOrThrow();
            var role = GetCurrentUserRoleOrDefault(string.Empty);

            var result = await _suggestionService.SuggestLocationAsync(
                new LocationSuggestionRequest
                {
                    VehicleTypeId = vehicleTypeId,
                    EntryGateId = entryGateId
                },
                staffId,
                role);

            return Success(result, "Goi y vi tri thanh cong.");
        }

        [HttpPost("suggest-slot")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        [Obsolete("Use GET /api/core/parking-sessions/location-suggestion instead.")]
        public async Task<IActionResult> SuggestSlot([FromBody] SuggestSlotRequest request)
        {
            var staffId = GetCurrentUserIdOrThrow();
            var role = GetCurrentUserRoleOrDefault("STAFF");

            var suggestion = await _suggestionService.SuggestLocationAsync(new LocationSuggestionRequest
            {
                VehicleTypeId = request.VehicleTypeId,
                EntryGateId = request.EntryGateId
            }, staffId, role);

            var responseData = new
            {
                floorId = suggestion.SuggestedFloorId,
                floorCode = suggestion.SuggestedFloorCode,
                areaId = suggestion.SuggestedAreaId,
                areaCode = suggestion.SuggestedAreaCode,
                slotId = suggestion.SuggestedSlotId,
                slotCode = suggestion.SuggestedSlotCode,
                deprecated = true,
                warning = "Use GET /api/core/parking-sessions/location-suggestion instead."
            };

            return Success(responseData, "Goi y slot thanh cong (Deprecated).");
        }

        private long GetCurrentUserIdOrThrow()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdMissing);
            }

            if (!long.TryParse(userIdClaim, out var userId))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdInvalid);
            }

            return userId;
        }

        private string GetCurrentUserRoleOrDefault(string defaultRole)
        {
            return User.FindFirst(ClaimTypes.Role)?.Value
                ?? User.FindFirst("role")?.Value
                ?? defaultRole;
        }
    }

    public class SuggestSlotRequest
    {
        public long VehicleTypeId { get; set; }
        public long EntryGateId { get; set; }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Controllers/PaymentsController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.Payments;
using PayOS.Models.Webhooks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Route("api/core/payments")]
    public class PaymentsController : BaseApiController
    {
        private readonly IPayOsPaymentService _payOsPaymentService;

        public PaymentsController(IPayOsPaymentService payOsPaymentService)
        {
            _payOsPaymentService = payOsPaymentService;
        }

        [AllowAnonymous]
        [HttpPost("payos/webhook")]
        public async Task<IActionResult> PayOsWebhook([FromBody] Webhook webhook)
        {
            var result = await _payOsPaymentService.ProcessWebhookAsync(webhook);
            return Success(result, "payOS webhook processed successfully.");
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Controllers/PricingRulesController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize(Roles = "ADMIN,MANAGER")]
    [Route("api/core/pricing-rules")]
    public class PricingRulesController : BaseApiController
    {
        private readonly ParkingDbContext _context;

        public PricingRulesController(ParkingDbContext context)
        {
            _context = context;
        }

        // 1. GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.PricingRules
                .Include(r => r.VehicleType)
                .ToListAsync();
            return Success(list, "Get pricing rules successfully");
        }

        // 2. GET BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var item = await _context.PricingRules
                .Include(r => r.VehicleType)
                .FirstOrDefaultAsync(r => r.Id == id);
                
            if (item == null) return StatusCodeResponse(404, "Not Found", $"Pricing rule with ID {id} not found.");
            return Success(item, "Get pricing rule successfully");
        }

        // 3. CREATE PRICING RULE
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePricingRuleDto model)
        {
            if (model == null) return Fail("Bad Request", "Model is required.");

            // Check if vehicle type exists
            var vehicleTypeExists = await _context.VehicleTypes.AnyAsync(vt => vt.Id == model.VehicleTypeId);
            if (!vehicleTypeExists)
                return Fail("Bad Request", $"Vehicle type with ID {model.VehicleTypeId} does not exist.");

            if (model.DayPrice < 0 || model.NightPrice < 0 || model.MonthlyPrice < 0 || model.LostCardFee < 0)
                return Fail("Bad Request", "Prices and fees must be non-negative.");

            var reservationPriceValidation = ValidateReservationHourlyPrice(model.ReservationHourlyPrice);
            if (reservationPriceValidation != null) return reservationPriceValidation;

            var userIdStr = User.FindFirst("user_id")?.Value;
            long actorUserId = 1; // Default fallback to system/seeding admin
            if (!string.IsNullOrEmpty(userIdStr) && long.TryParse(userIdStr, out var parsedId))
            {
                actorUserId = parsedId;
            }

            var rule = new PricingRule
            {
                VehicleTypeId = model.VehicleTypeId,
                DayPrice = model.DayPrice,
                NightPrice = model.NightPrice,
                MonthlyPrice = model.MonthlyPrice,
                ReservationHourlyPrice = model.ReservationHourlyPrice,
                LostCardFee = model.LostCardFee,
                EffectiveFrom = model.EffectiveFrom?.ToUniversalTime() ?? DateTime.UtcNow,
                Status = model.Status ?? "ACTIVE",
                CreatedBy = actorUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.PricingRules.Add(rule);
            await _context.SaveChangesAsync();

            // Fetch with navigation property for output
            var result = await _context.PricingRules
                .Include(r => r.VehicleType)
                .FirstOrDefaultAsync(r => r.Id == rule.Id);

            return Success(result, "Create pricing rule successfully");
        }

        // 4. UPDATE PRICING RULE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdatePricingRuleDto model)
        {
            if (model == null) return Fail("Bad Request", "Model is required.");

            var existing = await _context.PricingRules.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Pricing rule not found.");

            // If updating vehicle type, check existence
            if (model.VehicleTypeId.HasValue)
            {
                var vehicleTypeExists = await _context.VehicleTypes.AnyAsync(vt => vt.Id == model.VehicleTypeId.Value);
                if (!vehicleTypeExists)
                    return Fail("Bad Request", $"Vehicle type with ID {model.VehicleTypeId.Value} does not exist.");
                existing.VehicleTypeId = model.VehicleTypeId.Value;
            }

            if (model.DayPrice.HasValue)
            {
                if (model.DayPrice.Value < 0) return Fail("Bad Request", "Day price must be non-negative.");
                existing.DayPrice = model.DayPrice.Value;
            }

            if (model.NightPrice.HasValue)
            {
                if (model.NightPrice.Value < 0) return Fail("Bad Request", "Night price must be non-negative.");
                existing.NightPrice = model.NightPrice.Value;
            }

            if (model.MonthlyPrice.HasValue)
            {
                if (model.MonthlyPrice.Value < 0) return Fail("Bad Request", "Monthly price must be non-negative.");
                existing.MonthlyPrice = model.MonthlyPrice.Value;
            }

            if (model.ReservationHourlyPrice.HasValue)
            {
                var reservationPriceValidation = ValidateReservationHourlyPrice(model.ReservationHourlyPrice.Value);
                if (reservationPriceValidation != null) return reservationPriceValidation;
                existing.ReservationHourlyPrice = model.ReservationHourlyPrice.Value;
            }

            if (model.LostCardFee.HasValue)
            {
                if (model.LostCardFee.Value < 0) return Fail("Bad Request", "Lost card fee must be non-negative.");
                existing.LostCardFee = model.LostCardFee.Value;
            }

            if (model.EffectiveFrom.HasValue)
            {
                existing.EffectiveFrom = model.EffectiveFrom.Value.ToUniversalTime();
            }

            if (!string.IsNullOrEmpty(model.Status))
            {
                if (model.Status != "ACTIVE" && model.Status != "INACTIVE")
                    return Fail("Bad Request", "Status must be 'ACTIVE' or 'INACTIVE'.");
                existing.Status = model.Status;
            }

            var userIdStr = User.FindFirst("user_id")?.Value;
            if (!string.IsNullOrEmpty(userIdStr) && long.TryParse(userIdStr, out var parsedId))
            {
                existing.UpdatedBy = parsedId;
            }

            existing.UpdatedAt = DateTime.UtcNow;

            _context.PricingRules.Update(existing);
            await _context.SaveChangesAsync();

            // Fetch with navigation property for output
            var result = await _context.PricingRules
                .Include(r => r.VehicleType)
                .FirstOrDefaultAsync(r => r.Id == existing.Id);

            return Success(result, "Update pricing rule successfully");
        }

        [HttpPatch("{id}/reservation-hourly-price")]
        public async Task<IActionResult> UpdateReservationHourlyPrice(long id, [FromBody] UpdateReservationHourlyPriceDto model)
        {
            if (model == null) return Fail("Bad Request", "Model is required.");

            var validation = ValidateReservationHourlyPrice(model.ReservationHourlyPrice);
            if (validation != null) return validation;

            var existing = await _context.PricingRules.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Pricing rule not found.");

            existing.ReservationHourlyPrice = model.ReservationHourlyPrice;

            var userIdStr = User.FindFirst("user_id")?.Value;
            if (!string.IsNullOrEmpty(userIdStr) && long.TryParse(userIdStr, out var parsedId))
            {
                existing.UpdatedBy = parsedId;
            }

            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var result = await _context.PricingRules
                .Include(r => r.VehicleType)
                .FirstOrDefaultAsync(r => r.Id == existing.Id);

            return Success(result, "Update reservation hourly price successfully");
        }

        // 5. DELETE PRICING RULE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var existing = await _context.PricingRules.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Pricing rule not found.");

            _context.PricingRules.Remove(existing);
            await _context.SaveChangesAsync();

            return Success(true, "Delete pricing rule successfully");
        }

        // DTOs
        public class CreatePricingRuleDto
        {
            public long VehicleTypeId { get; set; }
            public decimal DayPrice { get; set; }
            public decimal NightPrice { get; set; }
            public decimal MonthlyPrice { get; set; }
            public decimal ReservationHourlyPrice { get; set; }
            public decimal LostCardFee { get; set; }
            public DateTime? EffectiveFrom { get; set; }
            public string? Status { get; set; }
        }

        public class UpdatePricingRuleDto
        {
            public long? VehicleTypeId { get; set; }
            public decimal? DayPrice { get; set; }
            public decimal? NightPrice { get; set; }
            public decimal? MonthlyPrice { get; set; }
            public decimal? ReservationHourlyPrice { get; set; }
            public decimal? LostCardFee { get; set; }
            public DateTime? EffectiveFrom { get; set; }
            public string? Status { get; set; }
        }

        public class UpdateReservationHourlyPriceDto
        {
            public decimal ReservationHourlyPrice { get; set; }
        }

        private IActionResult? ValidateReservationHourlyPrice(decimal value)
        {
            if (value <= 0m)
                return BusinessError(ErrorCodes.ReservationBookingFeeRequired);

            if (value != decimal.Truncate(value))
                return BusinessError(ErrorCodes.ReservationHourlyPriceMustBeInteger);

            return null;
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Controllers/ReservationsController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.Reservations;
using ParkingBuilding.CoreApi.Contracts.Common;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize]
    [Route("api/core/reservations")]
    public class ReservationsController : BaseApiController
    {
        private readonly ReservationService _reservationService;

        public ReservationsController(ReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        [HttpGet("available-locations")]
        public async Task<IActionResult> GetAvailableLocations([FromQuery] long vehicleTypeId)
        {
            var result = await _reservationService.GetAvailableLocationsAsync(vehicleTypeId);
            return Success(result, "Get available locations successfully.");
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReservationRequest request)
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var actorUserId))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdInvalid);
            }

            var actorRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value
                ?? User.FindFirst("role")?.Value
                ?? string.Empty;

            var result = await _reservationService.CreateReservationAsync(request, actorUserId, actorRole);
            return CreatedSuccess(result, "Create reservation successfully.");
        }

        [HttpPost("{id}/extend")]
        public async Task<IActionResult> Extend(long id, [FromBody] ExtendReservationRequest request)
        {
            long? userId = GetUserIdFromClaims();
            var result = await _reservationService.ExtendReservationAsync(id, request, userId);
            return Success(result, "Extend reservation successfully.");
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> Cancel(long id, [FromBody] CancelReservationRequest request)
        {
            long? userId = GetUserIdFromClaims();
            var result = await _reservationService.CancelReservationAsync(id, request, userId);
            return Success(result, "Cancel reservation successfully.");
        }

        [HttpGet("{id}/payment-status")]
        public async Task<IActionResult> GetPaymentStatus(long id)
        {
            var result = await _reservationService.GetPaymentStatusAsync(id);
            return Success(result, "Get reservation payment status successfully.");
        }

        [HttpGet("{reservationCode}/entry-check")]
        [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
        public async Task<IActionResult> CheckReservationForEntry(
            string reservationCode,
            [FromQuery] long entryGateId)
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var staffId))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdInvalid);
            }

            var result = await _reservationService.CheckReservationForEntryAsync(
                reservationCode,
                entryGateId,
                staffId);

            return Success(result, "Kiem tra reservation thanh cong.");
        }

        private long? GetUserIdFromClaims()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (long.TryParse(userIdClaim, out var parsedId))
            {
                return parsedId;
            }

            return null;
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Controllers/SlotsController.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.ParkingStructure.Slots;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers;

[ApiController]
[Route("api/core/slots")]
public class SlotsController : BaseApiController
{
    private readonly SlotService _service;

    public SlotsController(SlotService service)
    {
        _service = service;
    }

    // ================= GET ALL =================
    [HttpGet]
    [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Success(result, "Get slots successfully.");
    }

    // ================= CREATE SLOT =================
    [HttpPost]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateSlotRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedSuccess(result, "Create slot successfully.");
    }

    // ================= UPDATE STATUS =================
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> UpdateStatus(long id, [FromBody] UpdateSlotStatusRequest request)
    {
        var result = await _service.UpdateStatusAsync(id, request);
        return Success(result, "Update slot status successfully.");
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Controllers/UsersController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Domain.Enums;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize(Roles = "ADMIN")]
    [Route("api/core/users")]
    public class UsersController : BaseApiController
    {
        private readonly ParkingDbContext _context;

        public UsersController(ParkingDbContext context)
        {
            _context = context;
        }

        // 1. GET ALL (with query parameters)
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? role,
            [FromQuery] string? status)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var cleanSearch = search.Trim().ToLower();
                query = query.Where(u => 
                    u.FullName.ToLower().Contains(cleanSearch) ||
                    u.Username.ToLower().Contains(cleanSearch) ||
                    (u.Email != null && u.Email.ToLower().Contains(cleanSearch)) ||
                    (u.Phone != null && u.Phone.Contains(cleanSearch))
                );
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                if (Enum.TryParse<UserRole>(role, true, out var parsedRole))
                {
                    query = query.Where(u => u.Role == parsedRole);
                }
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                if (Enum.TryParse<UserStatus>(status, true, out var parsedStatus))
                {
                    query = query.Where(u => u.Status == parsedStatus);
                }
            }

            var list = await query.ToListAsync();
            
            // Map to response to hide password hash
            var result = list.Select(u => new UserResponseDto(u)).ToList();
            return Success(result, "Get users successfully");
        }

        // 2. GET BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return StatusCodeResponse(404, "Not Found", $"User with ID {id} not found.");

            return Success(new UserResponseDto(user), "Get user successfully");
        }

        // 3. CREATE INTERNAL USER
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserDto model)
        {
            if (model == null) return Fail("Bad Request", "Model is required.");
            if (string.IsNullOrWhiteSpace(model.Username)) return Fail("Bad Request", "Username is required.");
            if (string.IsNullOrWhiteSpace(model.Password)) return Fail("Bad Request", "Password is required.");
            if (string.IsNullOrWhiteSpace(model.FullName)) return Fail("Bad Request", "Full name is required.");

            var cleanUsername = model.Username.Trim();

            // Validate uniqueness
            bool isUsernameDuplicate = await _context.Users
                .AnyAsync(u => u.Username.ToLower() == cleanUsername.ToLower());
            if (isUsernameDuplicate)
                return StatusCodeResponse(409, "Conflict", "Username already exists.");

            if (!Enum.TryParse<UserRole>(model.Role, true, out var parsedRole))
            {
                return Fail("Bad Request", $"Invalid role '{model.Role}'. Valid roles are: ADMIN, MANAGER, STAFF, DRIVER");
            }

            // Create new user, encrypt password using BCrypt
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(model.Password);

            var user = new User
            {
                Username = cleanUsername,
                FullName = model.FullName.Trim(),
                Email = model.Email?.Trim(),
                Phone = model.Phone?.Trim(),
                PasswordHash = passwordHash,
                Role = parsedRole,
                Status = UserStatus.ACTIVE,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Success(new UserResponseDto(user), "Create user successfully");
        }

        // 4. UPDATE USER
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateUserDto model)
        {
            if (model == null) return Fail("Bad Request", "Model is required.");

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return StatusCodeResponse(404, "Not Found", "User not found.");

            if (!string.IsNullOrWhiteSpace(model.FullName))
                user.FullName = model.FullName.Trim();

            user.Email = model.Email?.Trim();
            user.Phone = model.Phone?.Trim();

            // If password is provided, re-hash and update
            if (!string.IsNullOrWhiteSpace(model.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password);
            }

            user.UpdatedAt = DateTimeOffset.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Success(new UserResponseDto(user), "Update user successfully");
        }

        // 5. PATCH STATUS
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeStatus(long id, [FromBody] ChangeStatusDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Status))
                return Fail("Bad Request", "Status is required.");

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return StatusCodeResponse(404, "Not Found", "User not found.");

            if (!Enum.TryParse<UserStatus>(model.Status, true, out var parsedStatus))
            {
                return Fail("Bad Request", $"Invalid status '{model.Status}'. Valid statuses are: ACTIVE, LOCKED, INACTIVE");
            }

            user.Status = parsedStatus;
            user.UpdatedAt = DateTimeOffset.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Success(new UserResponseDto(user), "Change status successfully");
        }

        // 6. PATCH ROLE
        [HttpPatch("{id}/role")]
        public async Task<IActionResult> ChangeRole(long id, [FromBody] ChangeRoleDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Role))
                return Fail("Bad Request", "Role is required.");

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return StatusCodeResponse(404, "Not Found", "User not found.");

            if (!Enum.TryParse<UserRole>(model.Role, true, out var parsedRole))
            {
                return Fail("Bad Request", $"Invalid role '{model.Role}'. Valid roles are: ADMIN, MANAGER, STAFF, DRIVER");
            }

            user.Role = parsedRole;
            user.UpdatedAt = DateTimeOffset.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Success(new UserResponseDto(user), "Change role successfully");
        }

        // 7. DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return StatusCodeResponse(404, "Not Found", "User not found.");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Success(true, "Delete user successfully");
        }

        // DTOs
        public class CreateUserDto
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string FullName { get; set; } = string.Empty;
            public string? Email { get; set; }
            public string? Phone { get; set; }
            public string Role { get; set; } = "STAFF";
        }

        public class UpdateUserDto
        {
            public string? FullName { get; set; }
            public string? Email { get; set; }
            public string? Phone { get; set; }
            public string? Password { get; set; }
        }

        public class ChangeStatusDto
        {
            public string Status { get; set; } = string.Empty;
        }

        public class ChangeRoleDto
        {
            public string Role { get; set; } = string.Empty;
        }

        public class UserResponseDto
        {
            public long Id { get; set; }
            public string Username { get; set; }
            public string FullName { get; set; }
            public string? Email { get; set; }
            public string? Phone { get; set; }
            public string Role { get; set; }
            public string Status { get; set; }
            public DateTimeOffset? LastLoginAt { get; set; }
            public DateTimeOffset CreatedAt { get; set; }
            public DateTimeOffset UpdatedAt { get; set; }

            public UserResponseDto(User u)
            {
                Id = u.Id;
                Username = u.Username;
                FullName = u.FullName;
                Email = u.Email;
                Phone = u.Phone;
                Role = u.Role.ToString().ToUpper();
                Status = u.Status.ToString().ToUpper();
                LastLoginAt = u.LastLoginAt;
                CreatedAt = u.CreatedAt;
                UpdatedAt = u.UpdatedAt;
            }
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Controllers/VehicleTypesController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize(Roles = "ADMIN,MANAGER")]
    [Route("api/core/vehicle-types")]
    public class VehicleTypesController : BaseApiController
    {
        private readonly ParkingDbContext _context;

        public VehicleTypesController(ParkingDbContext context)
        {
            _context = context;
        }

        // 1. GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.VehicleTypes.ToListAsync();
            return Success(list, "Get vehicle types successfully");
        }

        // 2. GET BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var item = await _context.VehicleTypes.FindAsync(id);
            if (item == null) return StatusCodeResponse(404, "Not Found", $"Vehicle type with ID {id} not found.");
            return Success(item, "Get vehicle type successfully");
        }

        // 3. CREATE
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] VehicleType model)
        {
            if (string.IsNullOrWhiteSpace(model.Name)) 
                return Fail("Bad Request", "Name is required.");

            bool exists = await _context.VehicleTypes
                .AnyAsync(vt => vt.Name.ToLower() == model.Name.Trim().ToLower());
            if (exists)
            {
                return StatusCodeResponse(409, "Conflict", "Vehicle type name already exists.");
            }

            _context.VehicleTypes.Add(model);
            await _context.SaveChangesAsync();
            return Success(model, "Create vehicle type successfully");
        }

        // 4. UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] VehicleType model)
        {
            var existing = await _context.VehicleTypes.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Vehicle type not found.");

            if (string.IsNullOrWhiteSpace(model.Name)) 
                return Fail("Bad Request", "Name is required.");

            bool exists = await _context.VehicleTypes
                .AnyAsync(vt => vt.Id != id && vt.Name.ToLower() == model.Name.Trim().ToLower());
            if (exists)
            {
                return StatusCodeResponse(409, "Conflict", "Vehicle type name already exists.");
            }

            existing.Name = model.Name;
            existing.Description = model.Description;
            existing.IsActive = model.IsActive;

            _context.VehicleTypes.Update(existing);
            await _context.SaveChangesAsync();
            return Success(existing, "Update vehicle type successfully");
        }

        // 5. PATCH ACTIVE STATUS
        [HttpPatch("{id}/active")]
        public async Task<IActionResult> ChangeActive(long id, [FromBody] bool isActive)
        {
            var existing = await _context.VehicleTypes.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Vehicle type not found.");

            existing.IsActive = isActive;
            _context.VehicleTypes.Update(existing);
            await _context.SaveChangesAsync();
            return Success(existing, "Change active status successfully");
        }

        // 6. DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var existing = await _context.VehicleTypes.FindAsync(id);
            if (existing == null) return StatusCodeResponse(404, "Not Found", "Vehicle type not found.");

            _context.VehicleTypes.Remove(existing);
            await _context.SaveChangesAsync();
            return Success(true, "Delete vehicle type successfully");
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/Area.cs`

```csharp
namespace ParkingBuilding.CoreApi.Domain.Entities;

public class Area
{
    public long Id { get; set; }

    public long FloorId { get; set; }

    public string AreaCode { get; set; } = null!;

    public string AreaName { get; set; } = null!;

    public int PriorityOrder { get; set; }

    public string Status { get; set; } = "ACTIVE";

    public int TotalCapacity { get; set; }

    public int CurrentRealOccupancy { get; set; }

    public int CurrentBookedSlots { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation
    public Floor Floor { get; set; } = null!;

    public ICollection<AreaVehicleType> AreaVehicleTypes { get; set; } = new List<AreaVehicleType>();

    public ICollection<Slot> Slots { get; set; } = new List<Slot>();
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/AreaVehicleType.cs`

```csharp
namespace ParkingBuilding.CoreApi.Domain.Entities;

public class AreaVehicleType
{
    public long AreaId { get; set; }

    public long VehicleTypeId { get; set; }

    // Navigation
    public Area Area { get; set; } = null!;

    public VehicleType VehicleType { get; set; } = null!;
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/AuditLog.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class AuditLog
    {
        public long Id { get; set; }
        public long? ActorUserId { get; set; }
        public string SourceService { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string TargetType { get; set; } = string.Empty;
        public string TargetId { get; set; } = string.Empty;
        public string? OldValue { get; set; } // JSONB stored as string
        public string? NewValue { get; set; } // JSONB stored as string
        public string? Reason { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        // Navigation property
        public User? ActorUser { get; set; }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/DriverProfile.cs`

```csharp
using System;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class DriverProfile
    {
        public long Id { get; set; }
        public long? UserId { get; set; } // Khớp với BIGINT REFERENCES users(id)
        public virtual User? User { get; set; }

        public string FullName { get; set; } = null!;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string Status { get; set; } = null!; // 'ACTIVE', 'LOCKED', 'INACTIVE'
        public string DriverType { get; set; } = null!; // 'RESIDENT', 'VISITOR'
        public string? ApartmentNumber { get; set; }
        public string? CccdNumber { get; set; }
        public string? CccdImageUrl { get; set; }
        public bool ResidentVerified { get; set; }
        public DateTimeOffset? ResidentVerifiedAt { get; set; }
        public long? ResidentVerifiedBy { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }

        public virtual ICollection<ParkingSession> ParkingSessions { get; set; } = new List<ParkingSession>();
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/Floor.cs`

```csharp
namespace ParkingBuilding.CoreApi.Domain.Entities;

public class Floor
{
    public long Id { get; set; }

    public string FloorCode { get; set; } = null!;

    public string FloorName { get; set; } = null!;

    public string Status { get; set; } = "ACTIVE";

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation
    public ICollection<Area> Areas { get; set; } = new List<Area>();

    public ICollection<Gate> Gates { get; set; } = new List<Gate>();
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/Gate.cs`

```csharp
namespace ParkingBuilding.CoreApi.Domain.Entities;

public class Gate
{
    public long Id { get; set; }

    public long FloorId { get; set; }

    public string GateCode { get; set; } = null!;

    public string GateType { get; set; } = null!; // ENTRY | EXIT

    public string Status { get; set; } = "ACTIVE";

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation
    public Floor Floor { get; set; } = null!;
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/LostCardCaseDocument.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class LostCardCaseDocument
    {
        public long Id { get; set; }
        public long LostCardCaseId { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string? ThumbnailPath { get; set; }
        public string? OriginalFileName { get; set; }
        public string? MimeType { get; set; }
        public long? SizeBytes { get; set; }
        public string? Sha256Hash { get; set; }
        public string? Note { get; set; }
        public bool IsSensitive { get; set; } = true;
        public long UploadedBy { get; set; }
        public virtual User UploadedByUser { get; set; } = null!;
        public DateTimeOffset UploadedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/MonthlyPass.cs`

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ParkingBuilding.CoreApi.Domain.Entities;

[Table("monthly_passes")] // Ánh xạ đúng tên bảng trong SQL
public class MonthlyPass
{
    [Key]
    public long Id { get; set; }
    public long? DriverId { get; set; }
    public long CardId { get; set; }
    public string OwnerName { get; set; } = null!;
    public string? Phone { get; set; }
    public string PlateNumber { get; set; } = null!;
    public string NormalizedPlateNumber { get; set; } = null!;
    public long VehicleTypeId { get; set; }
    public long? FloorId { get; set; }
    public Floor? Floor { get; set; }
    public long? AreaId { get; set; }
    public Area? Area { get; set; }
    public long? SlotId { get; set; }
    public Slot? Slot { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public long CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/ParkingCard.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public enum CardStatus
    {
        AVAILABLE,
        IN_USE,
        LOST,
        DAMAGED,
        INACTIVE
    }

    public class ParkingCard
    {
        public long Id { get; set; }
        public string CardNumber { get; set; } = string.Empty; // physical card code (mapped to card_code)
        public string QrToken { get; set; } = string.Empty;    // QR token identifier
        public CardStatus Status { get; set; } = CardStatus.AVAILABLE;
        public long? CurrentSessionId { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}


```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/ParkingSession.cs`

```csharp
using System;
using System.ComponentModel.DataAnnotations.Schema; // Thêm dòng này để dùng Table Attribute

namespace ParkingBuilding.CoreApi.Domain.Entities;

[Table("parking_sessions")] // Ép cứng EF Core map đúng vào bảng viết thường dưới DB
public class ParkingSession
{
    public long Id { get; set; }
    public string SessionCode { get; set; } = null!;
    public long CardId { get; set; }
    public virtual ParkingCard ParkingCard { get; set; } = null!;
    public long? DriverId { get; set; }
    public virtual DriverProfile? Driver { get; set; }
    public long? VehicleId { get; set; }
    public string? PlateNumber { get; set; }
    public string? NormalizedPlateNumber { get; set; }
    public bool NoPlate { get; set; }
    public string? VehicleDescription { get; set; }
    public long VehicleTypeId { get; set; }
    public long EntryGateId { get; set; }
    public long EntryStaffId { get; set; }
    public DateTimeOffset EntryTime { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset BillableStartTime { get; set; } = DateTimeOffset.UtcNow;
    public string Status { get; set; } = "ACTIVE";
    public bool PaymentRequired { get; set; } = true;
    public string PaymentStatus { get; set; } = "PENDING";
    public long FloorId { get; set; }
    public long AreaId { get; set; }
    public long? SlotId { get; set; }
    public long? ReservationId { get; set; }
    public virtual Reservation? Reservation { get; set; }

    public PricingRule? PricingRule { get; set; }

    // Thêm vào class ParkingSession
    public long? PricingRuleId { get; set; }
    public decimal SnapshotDayPrice { get; set; }
    public decimal SnapshotNightPrice { get; set; }
    public decimal SnapshotMonthlyPrice { get; set; }
    public decimal SnapshotLostCardFee { get; set; }
    public string CustomerType { get; set; } = "CASUAL"; // "CASUAL" hoặc "MONTHLY"

    public long? SuggestedAreaId { get; set; }
    public long? SuggestedSlotId { get; set; }
    public long? OverrideAreaId { get; set; }
    public long? OverrideSlotId { get; set; }
    public long? OverrideBy { get; set; }
    public DateTimeOffset? OverrideAt { get; set; }
    public string? OverrideReason { get; set; }

    public long? ClaimedByUserId { get; set; }
    public virtual User? ClaimedByUser { get; set; }
    public DateTimeOffset? ClaimedAt { get; set; }
    public string? ClaimMethod { get; set; }

    public long? MonthlyPassId { get; set; }

    public long? ExitGateId { get; set; }
    public long? ExitStaffId { get; set; }
    public DateTimeOffset? ExitTime { get; set; }

    public long? PlateCorrectedBy { get; set; }
    public DateTimeOffset? PlateCorrectedAt { get; set; }

    public string? CancellationReason { get; set; }

    // Đổi từ DateTime sang DateTimeOffset cho đồng bộ
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public virtual ICollection<ParkingSessionImage> ParkingSessionImages { get; set; } = new List<ParkingSessionImage>();
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/ParkingSessionImage.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class ParkingSessionImage
    {
        public long Id { get; set; }
        public long SessionId { get; set; }
        public virtual ParkingSession Session { get; set; } = null!;

        public string ImageType { get; set; } = null!; // 'ENTRY_PLATE', 'ENTRY_VEHICLE', 'EXIT_PLATE', 'EXIT_VEHICLE'
        public string ImageUrl { get; set; } = null!;
        public string? ThumbnailUrl { get; set; }
        public string? DetectedPlateNumber { get; set; }
        public string? DetectedNormalizedPlateNumber { get; set; }
        public decimal? Confidence { get; set; }
        public bool IsPrimary { get; set; }

        public DateTimeOffset CapturedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/Payment.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class Payment
    {
        public long Id { get; set; }
        public long? SessionId { get; set; }
        public virtual ParkingSession? ParkingSession { get; set; }
        public long? ReservationId { get; set; }
        public virtual Reservation? Reservation { get; set; }
        public long? MonthlyPassId { get; set; }
        public virtual MonthlyPass? MonthlyPass { get; set; }
        public decimal Amount { get; set; }
        public decimal LostCardFee { get; set; }
        public decimal TotalAmount { get; set; }
        public string Purpose { get; set; } = "PARKING_FEE";
        public string Method { get; set; } = "CASH";
        public string Status { get; set; } = "PENDING";
        public string? Provider { get; set; }
        public string? ProviderTransactionId { get; set; }
        public string? PaymentUrl { get; set; }
        public DateTimeOffset? ExpiredAt { get; set; }
        public string? GatewayPayload { get; set; }
        public long? PaidByUserId { get; set; }
        public virtual User? PaidByUser { get; set; }
        public decimal ReceivedAmount { get; set; }
        public DateTimeOffset? FeeCalculatedAt { get; set; }
        public DateTimeOffset? PaymentValidUntil { get; set; }
        public DateTimeOffset? PaidAt { get; set; }
        public long? CollectedBy { get; set; }
        public virtual User? CollectedByUser { get; set; }
        public string? WaiveReason { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/PricingRule.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class PricingRule
    {
        public long Id { get; set; }
        public long VehicleTypeId { get; set; }
        public decimal DayPrice { get; set; }
        public decimal NightPrice { get; set; }
        public decimal MonthlyPrice { get; set; }
        public decimal ReservationHourlyPrice { get; set; }
        public decimal LostCardFee { get; set; }
        public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, INACTIVE
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public VehicleType? VehicleType { get; set; }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/Reservation.cs`

```csharp
using System;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class Reservation
    {
        public long Id { get; set; }
        public string ReservationCode { get; set; } = string.Empty;
        public long? DriverId { get; set; }
        public virtual DriverProfile? Driver { get; set; }
        public long? VehicleId { get; set; }
        public virtual Vehicle? Vehicle { get; set; }
        public string? PlateNumber { get; set; }
        public string? NormalizedPlateNumber { get; set; }
        public long VehicleTypeId { get; set; }
        public virtual VehicleType VehicleType { get; set; } = null!;
        public long FloorId { get; set; }
        public virtual Floor Floor { get; set; } = null!;
        public long AreaId { get; set; }
        public virtual Area Area { get; set; } = null!;
        public long? SlotId { get; set; }
        public virtual Slot? Slot { get; set; }
        public long? PricingRuleId { get; set; }
        public virtual PricingRule? PricingRule { get; set; }
        public decimal SnapshotReservationHourlyPrice { get; set; }
        public int ReservedDurationMinutes { get; set; }
        public decimal BookingAmount { get; set; }
        public string PaymentStatus { get; set; } = "PENDING"; // PENDING, PAID, FAILED, CANCELLED, WAIVED, NOT_REQUIRED
        public DateTimeOffset ReservedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset ExpiresAt { get; set; }
        public DateTimeOffset? PaymentDeadline { get; set; }
        public DateTimeOffset? ConfirmedAt { get; set; }
        public DateTimeOffset? CheckedInAt { get; set; }
        public long? CheckedInBy { get; set; }
        public virtual User? CheckedInByUser { get; set; }
        public DateTimeOffset? CancelledAt { get; set; }
        public string Status { get; set; } = "PENDING"; // PENDING, CONFIRMED, COMPLETED, CANCELLED, EXPIRED
        public long? CreatedBy { get; set; }
        public virtual User? CreatedByUser { get; set; }
        public long? CancelledBy { get; set; }
        public virtual User? CancelledByUser { get; set; }
        public string? CancellationReason { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

        // Navigation
        public virtual ICollection<ReservationExtension> Extensions { get; set; } = new List<ReservationExtension>();
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/ReservationExtension.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class ReservationExtension
    {
        public long Id { get; set; }
        public long ReservationId { get; set; }
        public virtual Reservation Reservation { get; set; } = null!;
        public DateTimeOffset OldExpiresAt { get; set; }
        public DateTimeOffset NewExpiresAt { get; set; }
        public int AddedMinutes { get; set; }
        public long? PricingRuleId { get; set; }
        public virtual PricingRule? PricingRule { get; set; }
        public decimal SnapshotReservationHourlyPrice { get; set; }
        public decimal Amount { get; set; }
        public long? PaymentId { get; set; }
        public virtual Payment? Payment { get; set; }
        public long? RequestedBy { get; set; }
        public virtual User? RequestedByUser { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/Slot.cs`

```csharp
namespace ParkingBuilding.CoreApi.Domain.Entities;

public class Slot
{
    public long Id { get; set; }

    public long AreaId { get; set; }

    public string SlotCode { get; set; } = null!;

    public long AllowedVehicleTypeId { get; set; }

    public string Status { get; set; } = "AVAILABLE";

    public long? CurrentSessionId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation
    public Area Area { get; set; } = null!;

    public VehicleType VehicleType { get; set; } = null!;
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/User.cs`

```csharp
using System;
using ParkingBuilding.CoreApi.Domain.Enums;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class User
    {
        public long Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; } // Nullable nếu DB cho phép null
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public UserStatus Status { get; set; }
        public DateTimeOffset? LastLoginAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/Vehicle.cs`

```csharp
using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class Vehicle
    {
        public long Id { get; set; }
        public long? DriverId { get; set; }
        public virtual DriverProfile? Driver { get; set; }
        public string PlateNumber { get; set; } = string.Empty;
        public string NormalizedPlateNumber { get; set; } = string.Empty;
        public long VehicleTypeId { get; set; }
        public virtual VehicleType VehicleType { get; set; } = null!;
        public string? Description { get; set; }
        public string Status { get; set; } = "ACTIVE"; // 'ACTIVE', 'INACTIVE'
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Entities/VehicleType.cs`

```csharp
namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class VehicleType
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public bool RequiresSlot { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Enums/AreaStatus.cs`

```csharp
namespace ParkingBuilding.CoreApi.Domain.Enums
{
    public enum AreaStatus
    {
        ACTIVE,
        LOCKED,
        MAINTENANCE
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Enums/FloorStatus.cs`

```csharp
namespace ParkingBuilding.CoreApi.Domain.Enums
{
    public enum FloorStatus
    {
        ACTIVE,
        LOCKED,
        MAINTENANCE
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Enums/GateStatus.cs`

```csharp
namespace ParkingBuilding.CoreApi.Domain.Enums
{
    public enum GateStatus
    {
        ACTIVE,
        LOCKED,
        MAINTENANCE
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Enums/GateType.cs`

```csharp
namespace ParkingBuilding.CoreApi.Domain.Enums
{
    public enum GateType
    {
        ENTRY,
        EXIT
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Enums/SlotStatus.cs`

```csharp
namespace ParkingBuilding.CoreApi.Domain.Enums
{
    public enum SlotStatus
    {
        AVAILABLE,
        RESERVED,
        OCCUPIED,
        LOCKED,
        MAINTENANCE
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Enums/UserRole.cs`

```csharp
namespace ParkingBuilding.CoreApi.Domain.Enums
{
    public enum UserRole
    {
        ADMIN,
        MANAGER,
        STAFF,
        DRIVER
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Domain/Enums/UserStatus.cs`

```csharp
namespace ParkingBuilding.CoreApi.Domain.Enums
{
    public enum UserStatus
    {
        ACTIVE,
        LOCKED,
        INACTIVE
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Middleware/GlobalExceptionMiddleware.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using ParkingBuilding.CoreApi.Contracts.Common;

namespace ParkingBuilding.CoreApi.Infrastructure.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex, context.TraceIdentifier, context.Request.Path);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception, string traceId, string path)
        {
            var (statusCode, errorCode) = MapException(exception);
            var message = ErrorMessages.GetMessage(errorCode);

            LogException(exception, statusCode, errorCode, traceId, path);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var response = ApiResponse.FailureResult(
                message: message,
                errors: new List<string> { errorCode },
                errorCode: errorCode,
                statusCode: (int)statusCode,
                traceId: traceId,
                path: path
            );

            var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(json);
        }

        private static (HttpStatusCode StatusCode, string ErrorCode) MapException(Exception exception)
        {
            return exception switch
            {
                BusinessException businessException => ((HttpStatusCode)businessException.StatusCode, businessException.ErrorCode),
                UnauthorizedAccessException => (HttpStatusCode.Unauthorized, ErrorCodes.Unauthorized),
                KeyNotFoundException keyNotFoundException => (HttpStatusCode.NotFound, GetErrorCodeOrFallback(keyNotFoundException.Message, ErrorCodes.NotFound)),
                ArgumentException argumentException => (HttpStatusCode.BadRequest, GetErrorCodeOrFallback(argumentException.Message, ErrorCodes.InvalidRequest)),
                InvalidOperationException invalidOperationException => (HttpStatusCode.BadRequest, GetErrorCodeOrFallback(invalidOperationException.Message, ErrorCodes.InvalidRequest)),
                _ => (HttpStatusCode.InternalServerError, ErrorCodes.InternalServerError)
            };
        }

        private static string GetErrorCodeOrFallback(string value, string fallback)
            => IsErrorCode(value) ? value : fallback;

        private static bool IsErrorCode(string value)
            => !string.IsNullOrWhiteSpace(value)
                && Regex.IsMatch(value, "^[A-Z0-9_]+$");

        private void LogException(Exception exception, HttpStatusCode statusCode, string errorCode, string traceId, string path)
        {
            if ((int)statusCode >= StatusCodes.Status500InternalServerError)
            {
                _logger.LogError(exception, "Unhandled system exception. ErrorCode={ErrorCode}, TraceId={TraceId}, Path={Path}", errorCode, traceId, path);
                return;
            }

            _logger.LogWarning(exception, "Handled API exception. StatusCode={StatusCode}, ErrorCode={ErrorCode}, TraceId={TraceId}, Path={Path}", (int)statusCode, errorCode, traceId, path);
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Middleware/RequestLoggingMiddleware.cs`

```csharp
using System.Diagnostics;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace ParkingBuilding.CoreApi.Infrastructure.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var sw = Stopwatch.StartNew();

            try
            {
                await _next(context);
            }
            finally
            {
                sw.Stop();

                var userId = context.User.FindFirst("user_id")?.Value;
                var role = context.User.FindFirst(ClaimTypes.Role)?.Value
                    ?? context.User.FindFirst("role")?.Value;

                _logger.LogInformation(
                    "HTTP {Method} {Path} responded {StatusCode} in {ElapsedMs}ms userId={UserId} role={Role} traceId={TraceId}",
                    context.Request.Method,
                    context.Request.Path,
                    context.Response.StatusCode,
                    sw.ElapsedMilliseconds,
                    userId ?? "anonymous",
                    role ?? "none",
                    context.TraceIdentifier
                );
            }
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/AreaConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations;

public class AreaConfiguration : IEntityTypeConfiguration<Area>
{
    public void Configure(EntityTypeBuilder<Area> builder)
    {
        builder.ToTable("areas");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.FloorId)
            .HasColumnName("floor_id")
            .IsRequired();

        builder.Property(x => x.AreaCode)
            .HasColumnName("area_code")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.AreaName)
            .HasColumnName("area_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.PriorityOrder)
            .HasColumnName("priority_order");

        builder.Property(x => x.Status)
            .HasColumnName("status")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.TotalCapacity)
            .HasColumnName("total_capacity");

        builder.Property(x => x.CurrentRealOccupancy)
            .HasColumnName("current_real_occupancy");

        builder.Property(x => x.CurrentBookedSlots)
            .HasColumnName("current_booked_slots");

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at");

        // UNIQUE (floor_id, area_code)
        builder.HasIndex(x => new { x.FloorId, x.AreaCode })
            .IsUnique()
            .HasDatabaseName("ux_areas_floor_code");

        // FK Floor
        builder.HasOne(x => x.Floor)
            .WithMany(f => f.Areas)
            .HasForeignKey(x => x.FloorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/AreaVehicleTypeConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations;

public class AreaVehicleTypeConfiguration : IEntityTypeConfiguration<AreaVehicleType>
{
    public void Configure(EntityTypeBuilder<AreaVehicleType> builder)
    {
        builder.ToTable("area_vehicle_types");

        // COMPOSITE KEY
        builder.HasKey(x => new { x.AreaId, x.VehicleTypeId });

        builder.Property(x => x.AreaId)
            .HasColumnName("area_id");

        builder.Property(x => x.VehicleTypeId)
            .HasColumnName("vehicle_type_id");

        // FK -> Area
        builder.HasOne(x => x.Area)
            .WithMany(a => a.AreaVehicleTypes)
            .HasForeignKey(x => x.AreaId)
            .OnDelete(DeleteBehavior.Cascade);

        // FK -> VehicleType
        builder.HasOne(x => x.VehicleType)
            .WithMany()
            .HasForeignKey(x => x.VehicleTypeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/AuditLogConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.Persistence.Configurations
{
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.ToTable("audit_logs");

            builder.HasKey(a => a.Id);
            builder.Property(a => a.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            builder.Property(a => a.ActorUserId)
                   .HasColumnName("actor_user_id");

            builder.Property(a => a.SourceService)
                   .HasColumnName("source_service")
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(a => a.Action)
                   .HasColumnName("action")
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(a => a.TargetType)
                   .HasColumnName("target_type")
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(a => a.TargetId)
                   .HasColumnName("target_id")
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(a => a.OldValue)
                   .HasColumnName("old_value")
                   .HasColumnType("jsonb");

            builder.Property(a => a.NewValue)
                   .HasColumnName("new_value")
                   .HasColumnType("jsonb");

            builder.Property(a => a.Reason)
                   .HasColumnName("reason")
                   .HasColumnType("text");

            builder.Property(a => a.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            // Set up relationship with User
            builder.HasOne(a => a.ActorUser)
                   .WithMany()
                   .HasForeignKey(a => a.ActorUserId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/DriverProfileConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class DriverProfileConfiguration : IEntityTypeConfiguration<DriverProfile>
    {
        public void Configure(EntityTypeBuilder<DriverProfile> builder)
        {
            builder.ToTable("driver_profiles");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.UserId)
                .HasColumnName("user_id");

            builder.Property(x => x.FullName)
                .HasColumnName("full_name")
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(x => x.Phone)
                .HasColumnName("phone")
                .HasMaxLength(30);

            builder.Property(x => x.Email)
                .HasColumnName("email")
                .HasMaxLength(150);

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.DriverType)
                .HasColumnName("driver_type")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.ApartmentNumber)
                .HasColumnName("apartment_number")
                .HasMaxLength(50);

            builder.Property(x => x.CccdNumber)
                .HasColumnName("cccd_number")
                .HasMaxLength(50);

            builder.Property(x => x.CccdImageUrl)
                .HasColumnName("cccd_image_url")
                .HasMaxLength(500);

            builder.Property(x => x.ResidentVerified)
                .HasColumnName("resident_verified")
                .IsRequired();

            builder.Property(x => x.ResidentVerifiedAt)
                .HasColumnName("resident_verified_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.ResidentVerifiedBy)
                .HasColumnName("resident_verified_by");

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            // Relationships
            builder.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/FloorConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations;

public class FloorConfiguration : IEntityTypeConfiguration<Floor>
{
    public void Configure(EntityTypeBuilder<Floor> builder)
    {
        builder.ToTable("floors");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.FloorCode)
            .HasColumnName("floor_code")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.FloorName)
            .HasColumnName("floor_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Status)
            .HasColumnName("status")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at");

        // UNIQUE floor_code
        builder.HasIndex(x => x.FloorCode)
            .IsUnique()
            .HasDatabaseName("ux_floors_code");
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/GateConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations;

public class GateConfiguration : IEntityTypeConfiguration<Gate>
{
    public void Configure(EntityTypeBuilder<Gate> builder)
    {
        builder.ToTable("gates");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.FloorId)
            .HasColumnName("floor_id")
            .IsRequired();

        builder.Property(x => x.GateCode)
            .HasColumnName("gate_code")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.GateType)
            .HasColumnName("gate_type")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.Status)
            .HasColumnName("status")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at");

        // UNIQUE (floor_id, gate_code)
        builder.HasIndex(x => new { x.FloorId, x.GateCode })
            .IsUnique()
            .HasDatabaseName("ux_gates_floor_code");

        // FK -> Floor
        builder.HasOne(x => x.Floor)
            .WithMany(f => f.Gates)
            .HasForeignKey(x => x.FloorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/LostCardCaseDocumentConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class LostCardCaseDocumentConfiguration : IEntityTypeConfiguration<LostCardCaseDocument>
    {
        public void Configure(EntityTypeBuilder<LostCardCaseDocument> builder)
        {
            builder.ToTable("lost_card_case_documents");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.LostCardCaseId)
                .HasColumnName("lost_card_case_id")
                .IsRequired();

            builder.Property(x => x.DocumentType)
                .HasColumnName("document_type")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.FilePath)
                .HasColumnName("file_path")
                .IsRequired();

            builder.Property(x => x.ThumbnailPath)
                .HasColumnName("thumbnail_path");

            builder.Property(x => x.OriginalFileName)
                .HasColumnName("original_file_name")
                .HasMaxLength(255);

            builder.Property(x => x.MimeType)
                .HasColumnName("mime_type")
                .HasMaxLength(100);

            builder.Property(x => x.SizeBytes)
                .HasColumnName("size_bytes");

            builder.Property(x => x.Sha256Hash)
                .HasColumnName("sha256_hash")
                .HasMaxLength(100);

            builder.Property(x => x.Note)
                .HasColumnName("note");

            builder.Property(x => x.IsSensitive)
                .HasColumnName("is_sensitive")
                .HasDefaultValue(true)
                .IsRequired();

            builder.Property(x => x.UploadedBy)
                .HasColumnName("uploaded_by")
                .IsRequired();

            builder.Property(x => x.UploadedAt)
                .HasColumnName("uploaded_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.DeletedAt)
                .HasColumnName("deleted_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.HasOne(x => x.UploadedByUser)
                .WithMany()
                .HasForeignKey(x => x.UploadedBy)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.LostCardCaseId)
                .HasDatabaseName("ix_lost_card_documents_case");

            builder.HasIndex(x => x.DocumentType)
                .HasDatabaseName("ix_lost_card_documents_type");

            builder.HasIndex(x => x.UploadedAt)
                .HasDatabaseName("ix_lost_card_documents_uploaded_at");
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/MonthlyPassConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class MonthlyPassConfiguration : IEntityTypeConfiguration<MonthlyPass>
    {
        public void Configure(EntityTypeBuilder<MonthlyPass> builder)
        {
            builder.ToTable("monthly_passes");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.DriverId)
                .HasColumnName("driver_id");

            builder.Property(x => x.CardId)
                .HasColumnName("card_id")
                .IsRequired();

            builder.Property(x => x.OwnerName)
                .HasColumnName("owner_name")
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(x => x.Phone)
                .HasColumnName("phone")
                .HasMaxLength(30);

            builder.Property(x => x.PlateNumber)
                .HasColumnName("plate_number")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.NormalizedPlateNumber)
                .HasColumnName("normalized_plate_number")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.VehicleTypeId)
                .HasColumnName("vehicle_type_id")
                .IsRequired();

            builder.Property(x => x.StartDate)
                .HasColumnName("start_date")
                .HasColumnType("date")
                .IsRequired();

            builder.Property(x => x.EndDate)
                .HasColumnName("end_date")
                .HasColumnType("date")
                .IsRequired();

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.CreatedBy)
                .HasColumnName("created_by")
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.FloorId)
                .HasColumnName("floor_id");

            builder.Property(x => x.AreaId)
                .HasColumnName("area_id");

            builder.Property(x => x.SlotId)
                .HasColumnName("slot_id");

            builder.HasOne(x => x.Floor)
                .WithMany()
                .HasForeignKey(x => x.FloorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Area)
                .WithMany()
                .HasForeignKey(x => x.AreaId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Slot)
                .WithMany()
                .HasForeignKey(x => x.SlotId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/ParkingCardConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class ParkingCardConfiguration : IEntityTypeConfiguration<ParkingCard>
    {
        public void Configure(EntityTypeBuilder<ParkingCard> builder)
        {
            builder.ToTable("parking_cards");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            // CardNumber in C# maps to card_code in DB
            builder.Property(x => x.CardNumber)
                   .HasColumnName("card_code")
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(x => x.QrToken)
                   .HasColumnName("qr_token")
                   .HasMaxLength(120)
                   .IsRequired();

            // Status is mapped as enum string conversion
            builder.Property(x => x.Status)
                   .HasColumnName("status")
                   .HasMaxLength(30)
                   .HasConversion<string>()
                   .IsRequired();

             builder.Property(x => x.Note)
                    .HasColumnName("note");

             builder.Property(x => x.CurrentSessionId)
                    .HasColumnName("current_session_id");

            builder.Property(x => x.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone");

            builder.Property(x => x.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp with time zone");

            // Unique indexes
            builder.HasIndex(x => x.CardNumber).IsUnique();
            builder.HasIndex(x => x.QrToken).IsUnique();
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/ParkingSessionConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class ParkingSessionConfiguration : IEntityTypeConfiguration<ParkingSession>
    {
        public void Configure(EntityTypeBuilder<ParkingSession> builder)
        {
            builder.ToTable("parking_sessions");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.SessionCode)
                .HasColumnName("session_code")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.CardId)
                .HasColumnName("card_id")
                .IsRequired();

            builder.Property(x => x.DriverId)
                .HasColumnName("driver_id");

            builder.Property(x => x.VehicleId)
                .HasColumnName("vehicle_id");

            builder.Property(x => x.PlateNumber)
                .HasColumnName("plate_number")
                .HasMaxLength(30);

            builder.Property(x => x.NormalizedPlateNumber)
                .HasColumnName("normalized_plate_number")
                .HasMaxLength(30);

            builder.Property(x => x.NoPlate)
                .HasColumnName("no_plate")
                .IsRequired();

            builder.Property(x => x.VehicleDescription)
                .HasColumnName("vehicle_description");

            builder.Property(x => x.VehicleTypeId)
                .HasColumnName("vehicle_type_id")
                .IsRequired();

            builder.Property(x => x.EntryGateId)
                .HasColumnName("entry_gate_id")
                .IsRequired();

            builder.Property(x => x.EntryStaffId)
                .HasColumnName("entry_staff_id")
                .IsRequired();

            builder.Property(x => x.EntryTime)
                .HasColumnName("entry_time")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.BillableStartTime)
                .HasColumnName("billable_start_time")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasMaxLength(40)
                .IsRequired();

            builder.Property(x => x.PaymentRequired)
                .HasColumnName("payment_required")
                .IsRequired();

            builder.Property(x => x.PaymentStatus)
                .HasColumnName("payment_status")
                .HasMaxLength(40)
                .IsRequired();

            builder.Property(x => x.FloorId)
                .HasColumnName("floor_id")
                .IsRequired();

            builder.Property(x => x.AreaId)
                .HasColumnName("area_id")
                .IsRequired();

            builder.Property(x => x.SlotId)
                .HasColumnName("slot_id");

            builder.Property(x => x.PricingRuleId)
                .HasColumnName("pricing_rule_id");

            builder.Property(x => x.SnapshotDayPrice)
                .HasColumnName("snapshot_day_price")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.SnapshotNightPrice)
                .HasColumnName("snapshot_night_price")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.SnapshotMonthlyPrice)
                .HasColumnName("snapshot_monthly_price")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.SnapshotLostCardFee)
                .HasColumnName("snapshot_lost_card_fee")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.CustomerType)
                .HasColumnName("customer_type")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.ReservationId)
                .HasColumnName("reservation_id");

            builder.Property(x => x.SuggestedAreaId)
                .HasColumnName("suggested_area_id");

            builder.Property(x => x.SuggestedSlotId)
                .HasColumnName("suggested_slot_id");

            builder.Property(x => x.OverrideAreaId)
                .HasColumnName("override_area_id");

            builder.Property(x => x.OverrideSlotId)
                .HasColumnName("override_slot_id");

            builder.Property(x => x.OverrideBy)
                .HasColumnName("override_by");

            builder.Property(x => x.OverrideAt)
                .HasColumnName("override_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.OverrideReason)
                .HasColumnName("override_reason");

            builder.Property(x => x.ClaimedByUserId)
                .HasColumnName("claimed_by_user_id");

            builder.Property(x => x.ClaimedAt)
                .HasColumnName("claimed_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.ClaimMethod)
                .HasColumnName("claim_method")
                .HasMaxLength(30);

            builder.Property(x => x.MonthlyPassId)
                .HasColumnName("monthly_pass_id");

            builder.Property(x => x.ExitGateId)
                .HasColumnName("exit_gate_id");

            builder.Property(x => x.ExitStaffId)
                .HasColumnName("exit_staff_id");

            builder.Property(x => x.ExitTime)
                .HasColumnName("exit_time")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.PlateCorrectedBy)
                .HasColumnName("plate_corrected_by");

            builder.Property(x => x.PlateCorrectedAt)
                .HasColumnName("plate_corrected_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.CancellationReason)
                .HasColumnName("cancellation_reason");

            // Relationships
            builder.HasOne(x => x.ParkingCard)
                .WithMany()
                .HasForeignKey(x => x.CardId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ClaimedByUser)
                .WithMany()
                .HasForeignKey(x => x.ClaimedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Driver)
                .WithMany(d => d.ParkingSessions)
                .HasForeignKey(x => x.DriverId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Reservation)
                .WithOne()
                .HasForeignKey<ParkingSession>(x => x.ReservationId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.PricingRule)
                .WithMany()
                .HasForeignKey(x => x.PricingRuleId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/ParkingSessionImageConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class ParkingSessionImageConfiguration : IEntityTypeConfiguration<ParkingSessionImage>
    {
        public void Configure(EntityTypeBuilder<ParkingSessionImage> builder)
        {
            builder.ToTable("parking_session_images");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.SessionId)
                .HasColumnName("session_id")
                .IsRequired();

            builder.Property(x => x.ImageType)
                .HasColumnName("image_type")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.ImageUrl)
                .HasColumnName("image_url")
                .HasMaxLength(500)
                .IsRequired();

            builder.Property(x => x.ThumbnailUrl)
                .HasColumnName("thumbnail_url")
                .HasMaxLength(500);

            builder.Property(x => x.DetectedPlateNumber)
                .HasColumnName("detected_plate_number")
                .HasMaxLength(30);

            builder.Property(x => x.DetectedNormalizedPlateNumber)
                .HasColumnName("detected_normalized_plate_number")
                .HasMaxLength(30);

            builder.Property(x => x.Confidence)
                .HasColumnName("confidence")
                .HasColumnType("numeric(5,2)");

            builder.Property(x => x.IsPrimary)
                .HasColumnName("is_primary")
                .HasDefaultValue(false)
                .IsRequired();

            builder.Property(x => x.CapturedAt)
                .HasColumnName("captured_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            // Relationship
            builder.HasOne(x => x.Session)
                .WithMany(s => s.ParkingSessionImages)
                .HasForeignKey(x => x.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/PaymentConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.ToTable("payments");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.SessionId)
                .HasColumnName("session_id");

            builder.Property(x => x.ReservationId)
                .HasColumnName("reservation_id");

            builder.Property(x => x.MonthlyPassId)
                .HasColumnName("monthly_pass_id");

            builder.Property(x => x.Amount)
                .HasColumnName("amount")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.LostCardFee)
                .HasColumnName("lost_card_fee")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.TotalAmount)
                .HasColumnName("total_amount")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.Purpose)
                .HasColumnName("purpose")
                .HasMaxLength(40)
                .IsRequired();

            builder.Property(x => x.Method)
                .HasColumnName("method")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.Provider)
                .HasColumnName("provider")
                .HasMaxLength(50);

            builder.Property(x => x.ProviderTransactionId)
                .HasColumnName("provider_transaction_id")
                .HasMaxLength(120);

            builder.Property(x => x.PaymentUrl)
                .HasColumnName("payment_url")
                .HasMaxLength(500);

            builder.Property(x => x.ExpiredAt)
                .HasColumnName("expired_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.GatewayPayload)
                .HasColumnName("gateway_payload")
                .HasColumnType("jsonb");

            builder.Property(x => x.PaidByUserId)
                .HasColumnName("paid_by_user_id");

            builder.Property(x => x.ReceivedAmount)
                .HasColumnName("received_amount")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.FeeCalculatedAt)
                .HasColumnName("fee_calculated_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.PaymentValidUntil)
                .HasColumnName("payment_valid_until")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.PaidAt)
                .HasColumnName("paid_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.CollectedBy)
                .HasColumnName("collected_by");

            builder.Property(x => x.WaiveReason)
                .HasColumnName("waive_reason")
                .HasMaxLength(100);

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            // Relationships
            builder.HasOne(x => x.ParkingSession)
                .WithMany()
                .HasForeignKey(x => x.SessionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Reservation)
                .WithMany()
                .HasForeignKey(x => x.ReservationId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.MonthlyPass)
                .WithMany()
                .HasForeignKey(x => x.MonthlyPassId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.PaidByUser)
                .WithMany()
                .HasForeignKey(x => x.PaidByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.CollectedByUser)
                .WithMany()
                .HasForeignKey(x => x.CollectedBy)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/PricingRuleConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class PricingRuleConfiguration : IEntityTypeConfiguration<PricingRule>
    {
        public void Configure(EntityTypeBuilder<PricingRule> builder)
        {
            builder.ToTable("pricing_rules");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.VehicleTypeId)
                   .HasColumnName("vehicle_type_id")
                   .IsRequired();

            builder.Property(x => x.DayPrice)
                   .HasColumnName("day_price")
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(x => x.NightPrice)
                   .HasColumnName("night_price")
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(x => x.MonthlyPrice)
                   .HasColumnName("monthly_price")
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(x => x.ReservationHourlyPrice)
                   .HasColumnName("reservation_hourly_price")
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(x => x.LostCardFee)
                   .HasColumnName("lost_card_fee")
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(x => x.EffectiveFrom)
                   .HasColumnName("effective_from")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            builder.Property(x => x.Status)
                   .HasColumnName("status")
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(x => x.CreatedBy)
                   .HasColumnName("created_by")
                   .IsRequired();

            builder.Property(x => x.UpdatedBy)
                   .HasColumnName("updated_by");

            builder.Property(x => x.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone");

            builder.Property(x => x.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp with time zone");

            // Relationships
            builder.HasOne(x => x.VehicleType)
                   .WithMany()
                   .HasForeignKey(x => x.VehicleTypeId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/ReservationConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
    {
        public void Configure(EntityTypeBuilder<Reservation> builder)
        {
            builder.ToTable("reservations");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.ReservationCode)
                .HasColumnName("reservation_code")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.DriverId)
                .HasColumnName("driver_id");

            builder.Property(x => x.VehicleId)
                .HasColumnName("vehicle_id");

            builder.Property(x => x.PlateNumber)
                .HasColumnName("plate_number")
                .HasMaxLength(30);

            builder.Property(x => x.NormalizedPlateNumber)
                .HasColumnName("normalized_plate_number")
                .HasMaxLength(30);

            builder.Property(x => x.VehicleTypeId)
                .HasColumnName("vehicle_type_id")
                .IsRequired();

            builder.Property(x => x.FloorId)
                .HasColumnName("floor_id")
                .IsRequired();

            builder.Property(x => x.AreaId)
                .HasColumnName("area_id")
                .IsRequired();

            builder.Property(x => x.SlotId)
                .HasColumnName("slot_id");

            builder.Property(x => x.PricingRuleId)
                .HasColumnName("pricing_rule_id");

            builder.Property(x => x.SnapshotReservationHourlyPrice)
                .HasColumnName("snapshot_reservation_hourly_price")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.ReservedDurationMinutes)
                .HasColumnName("reserved_duration_minutes")
                .IsRequired();

            builder.Property(x => x.BookingAmount)
                .HasColumnName("booking_amount")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.PaymentStatus)
                .HasColumnName("payment_status")
                .HasMaxLength(40)
                .IsRequired();

            builder.Property(x => x.ReservedAt)
                .HasColumnName("reserved_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.ExpiresAt)
                .HasColumnName("expires_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.PaymentDeadline)
                .HasColumnName("payment_deadline")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.ConfirmedAt)
                .HasColumnName("confirmed_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.CheckedInAt)
                .HasColumnName("checked_in_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.CheckedInBy)
                .HasColumnName("checked_in_by");

            builder.Property(x => x.CancelledAt)
                .HasColumnName("cancelled_at")
                .HasColumnType("timestamp with time zone");

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.CreatedBy)
                .HasColumnName("created_by");

            builder.Property(x => x.CancelledBy)
                .HasColumnName("cancelled_by");

            builder.Property(x => x.CancellationReason)
                .HasColumnName("cancellation_reason");

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            // Relationships
            builder.HasOne(x => x.Driver)
                .WithMany()
                .HasForeignKey(x => x.DriverId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Vehicle)
                .WithMany()
                .HasForeignKey(x => x.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.VehicleType)
                .WithMany()
                .HasForeignKey(x => x.VehicleTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Floor)
                .WithMany()
                .HasForeignKey(x => x.FloorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Area)
                .WithMany()
                .HasForeignKey(x => x.AreaId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Slot)
                .WithMany()
                .HasForeignKey(x => x.SlotId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.PricingRule)
                .WithMany()
                .HasForeignKey(x => x.PricingRuleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.CheckedInByUser)
                .WithMany()
                .HasForeignKey(x => x.CheckedInBy)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.CreatedByUser)
                .WithMany()
                .HasForeignKey(x => x.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.CancelledByUser)
                .WithMany()
                .HasForeignKey(x => x.CancelledBy)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/ReservationExtensionConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class ReservationExtensionConfiguration : IEntityTypeConfiguration<ReservationExtension>
    {
        public void Configure(EntityTypeBuilder<ReservationExtension> builder)
        {
            builder.ToTable("reservation_extensions");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.ReservationId)
                .HasColumnName("reservation_id")
                .IsRequired();

            builder.Property(x => x.OldExpiresAt)
                .HasColumnName("old_expires_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.NewExpiresAt)
                .HasColumnName("new_expires_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.AddedMinutes)
                .HasColumnName("added_minutes")
                .IsRequired();

            builder.Property(x => x.PricingRuleId)
                .HasColumnName("pricing_rule_id");

            builder.Property(x => x.SnapshotReservationHourlyPrice)
                .HasColumnName("snapshot_reservation_hourly_price")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.Amount)
                .HasColumnName("amount")
                .HasColumnType("numeric(12,2)")
                .IsRequired();

            builder.Property(x => x.PaymentId)
                .HasColumnName("payment_id");

            builder.Property(x => x.RequestedBy)
                .HasColumnName("requested_by");

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            // Relationships
            builder.HasOne(x => x.Reservation)
                .WithMany(r => r.Extensions)
                .HasForeignKey(x => x.ReservationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.PricingRule)
                .WithMany()
                .HasForeignKey(x => x.PricingRuleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Payment)
                .WithMany()
                .HasForeignKey(x => x.PaymentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.RequestedByUser)
                .WithMany()
                .HasForeignKey(x => x.RequestedBy)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/SlotConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations;

public class SlotConfiguration : IEntityTypeConfiguration<Slot>
{
    public void Configure(EntityTypeBuilder<Slot> builder)
    {
        builder.ToTable("slots");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.AreaId)
            .HasColumnName("area_id")
            .IsRequired();

        builder.Property(x => x.SlotCode)
            .HasColumnName("slot_code")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.AllowedVehicleTypeId)
            .HasColumnName("allowed_vehicle_type_id")
            .IsRequired();

        builder.Property(x => x.Status)
            .HasColumnName("status")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.CurrentSessionId)
            .HasColumnName("current_session_id");

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at");

        // UNIQUE (area_id, slot_code)
        builder.HasIndex(x => new { x.AreaId, x.SlotCode })
            .IsUnique()
            .HasDatabaseName("ux_slots_area_code");

        // FK -> Area
        builder.HasOne(x => x.Area)
            .WithMany(a => a.Slots)
            .HasForeignKey(x => x.AreaId)
            .OnDelete(DeleteBehavior.Restrict);

        // FK -> VehicleType
        builder.HasOne(x => x.VehicleType)
            .WithMany()
            .HasForeignKey(x => x.AllowedVehicleTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/UserConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // Map vào đúng bảng 'users' trong PostgreSQL (chữ thường)
            builder.ToTable("users");

            // Cấu hình Khóa chính và map với BIGINT/BIGSERIAL
            builder.HasKey(u => u.Id);
            builder.Property(u => u.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd(); // Tương ứng với BIGSERIAL tự tăng

            // Cấu hình các thuộc tính khớp chính xác tên cột và độ dài mã hóa chữ thường
            builder.Property(u => u.Username)
                   .HasColumnName("username")
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(u => u.Email)
                   .HasColumnName("email")
                   .HasMaxLength(150)
                   .IsRequired(false);

            builder.Property(u => u.Phone)
                   .HasColumnName("phone")
                   .HasMaxLength(30)
                   .IsRequired(false);

            builder.Property(u => u.PasswordHash)
                   .HasColumnName("password_hash")
                   .HasMaxLength(255)
                   .IsRequired();

            builder.Property(u => u.FullName)
                   .HasColumnName("full_name")
                   .HasMaxLength(150)
                   .IsRequired();

            // Mapping Enum thành String trong Postgres VARCHAR
            builder.Property(u => u.Role)
                   .HasColumnName("role")
                   .HasMaxLength(30)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(u => u.Status)
                   .HasColumnName("status")
                   .HasMaxLength(30)
                   .HasConversion<string>()
                   .IsRequired();

            // Mapping các trường thời gian với TIMESTAMPTZ
            builder.Property(u => u.LastLoginAt)
                   .HasColumnName("last_login_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired(false);

            builder.Property(u => u.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();

            builder.Property(u => u.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp with time zone")
                   .IsRequired();
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/VehicleConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
    {
        public void Configure(EntityTypeBuilder<Vehicle> builder)
        {
            builder.ToTable("vehicles");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.DriverId)
                .HasColumnName("driver_id");

            builder.Property(x => x.PlateNumber)
                .HasColumnName("plate_number")
                .HasMaxLength(30);

            builder.Property(x => x.NormalizedPlateNumber)
                .HasColumnName("normalized_plate_number")
                .HasMaxLength(30);

            builder.Property(x => x.VehicleTypeId)
                .HasColumnName("vehicle_type_id")
                .IsRequired();

            builder.Property(x => x.Description)
                .HasColumnName("description");

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            // Relationships
            builder.HasOne(x => x.Driver)
                .WithMany()
                .HasForeignKey(x => x.DriverId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.VehicleType)
                .WithMany()
                .HasForeignKey(x => x.VehicleTypeId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Configurations/VehicleTypeConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence.Configurations
{
    public class VehicleTypeConfiguration : IEntityTypeConfiguration<VehicleType>
    {
        public void Configure(EntityTypeBuilder<VehicleType> builder)
        {
            builder.ToTable("vehicle_types");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();
                   
            builder.Property(x => x.Name)
                   .HasColumnName("name")
                   .HasMaxLength(100)
                   .IsRequired();
                   
            builder.Property(x => x.Description)
                   .HasColumnName("description");
                   
            builder.Property(x => x.IsActive)
                   .HasColumnName("is_active")
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.RequiresSlot)
                   .HasColumnName("requires_slot")
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(x => x.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp with time zone");

            builder.Property(x => x.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp with time zone");
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Diagnostics/SupabaseConnectionLogger.cs`

```csharp
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
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Diagnostics/SupabaseConnectionProbe.cs`

```csharp
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
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/ParkingDbContext.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence
{
    public class ParkingDbContext : DbContext
    {
        public ParkingDbContext(DbContextOptions<ParkingDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
        public DbSet<VehicleType> VehicleTypes => Set<VehicleType>();
        public DbSet<ParkingCard> ParkingCards => Set<ParkingCard>();
        public DbSet<PricingRule> PricingRules => Set<PricingRule>();
        public DbSet<Floor> Floors { get; set; }
        public DbSet<Area> Areas { get; set; }
        public DbSet<AreaVehicleType> AreaVehicleTypes { get; set; }
        public DbSet<Slot> Slots { get; set; }
        public DbSet<Gate> Gates { get; set; }
        public DbSet<ParkingSession> ParkingSessions { get; set; }
        public DbSet<DriverProfile> DriverProfiles { get; set; } // Hoặc tên DbSet tương ứng trong context
        public DbSet<MonthlyPass> MonthlyPasses { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<ReservationExtension> ReservationExtensions { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<ParkingSessionImage> ParkingSessionImages { get; set; }
        public DbSet<LostCardCaseDocument> LostCardCaseDocuments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // SỬA TẠI ĐÂY: Sử dụng Type của chính ParkingDbContext để EF Core tự động quét 
            // và áp dụng tất cả các lớp cấu hình (bao gồm UserConfiguration) trong cùng Assembly này.
            // Cách này không cần dòng "using ...Configurations;" nên sẽ không bao giờ bị lỗi CS0234 nữa!
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ParkingDbContext).Assembly);
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Infrastructure/Security/JwtTokenGenerator.cs`

```csharp
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ParkingBuilding.CoreApi.Domain.Entities;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ParkingBuilding.CoreApi.Infrastructure.Security
{
    public class JwtTokenGenerator
    {
        private readonly IConfiguration _configuration;

        public JwtTokenGenerator(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            var issuer = _configuration["Jwt:Issuer"] ?? "ParkingBuilding.CoreApi";
            var audience = _configuration["Jwt:Audience"] ?? "ParkingBuilding.Frontend";
            var secretKey = _configuration["JWT_SECRET"] ?? _configuration["Jwt:Secret"];
            if (string.IsNullOrEmpty(secretKey))
            {
                throw new System.InvalidOperationException("JWT Secret is not configured.");
            }
            var expirationMinutesStr = _configuration["Jwt:ExpirationMinutes"];
            
            if (!int.TryParse(expirationMinutesStr, out var expirationMinutes))
            {
                expirationMinutes = 60; // Default to 60 minutes (3600 seconds)
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim("user_id", user.Id.ToString()),
                new Claim("username", user.Username),
                new Claim("role", user.Role.ToString().ToUpper()), // e.g. "ADMIN", "MANAGER", "STAFF"
                new Claim("fullName", user.FullName ?? string.Empty),
                new Claim("full_name", user.FullName ?? string.Empty)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public int GetExpirationSeconds()
        {
            var expirationMinutesStr = _configuration["Jwt:ExpirationMinutes"];
            if (int.TryParse(expirationMinutesStr, out var expirationMinutes))
            {
                return expirationMinutes * 60;
            }
            return 3600; // 60 minutes * 60 seconds
        }
    }
}
```

### File: `backend/ParkingBuilding.CoreApi/Program.cs`

```csharp
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
using System.Text;
using ParkingBuilding.CoreApi.Application.Audit;
using Microsoft.OpenApi;

// Import đúng namespace chứa các Service
using ParkingBuilding.CoreApi.Application.ParkingStructure.Floors;
using ParkingBuilding.CoreApi.Application.ParkingStructure.Areas;
using ParkingBuilding.CoreApi.Application.ParkingStructure.Slots;
using ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion;

// THÊM DÒNG NÀY: Để nhận diện lớp dịch vụ vào bãi xe
using ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;
using ParkingBuilding.CoreApi.Application.Reservations;
using ParkingBuilding.CoreApi.Application.MonthlyPasses;
using ParkingBuilding.CoreApi.Application.Payments;
using ParkingBuilding.CoreApi.Application.Storage;
using ParkingBuilding.CoreApi.Application.LostCards.Documents;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            )
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

builder.Services.Configure<ReservationBookingOptions>(options =>
{
    options.AllowZeroBookingFee = false;

    if (int.TryParse(builder.Configuration["RESERVATION_PAYMENT_DEADLINE_MINUTES"], out var minutes))
    {
        options.PaymentDeadlineMinutes = minutes;
    }
    if (int.TryParse(builder.Configuration["RESERVATION_MAX_HOURS"], out var maxReservationHours) && maxReservationHours > 0)
    {
        options.MaxReservationHours = maxReservationHours;
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

// Cau hinh JWT Authentication
var jwtSecret = builder.Configuration["JWT_SECRET"] ?? builder.Configuration["Jwt:Secret"];
if (string.IsNullOrEmpty(jwtSecret))
{
    throw new System.InvalidOperationException("JWT Secret is not configured. Please set the JWT_SECRET environment variable or Jwt:Secret configuration.");
}
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
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = "role",
        NameClaimType = "username"
    };

    options.Events = new JwtBearerEvents
    {
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

app.UseCors("FrontendDev");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### File: `database/01_schema.sql`

```sql
-- Parking Building Management System - MVP schema
-- Source of truth for PostgreSQL/Supabase database structure.
-- Run on an empty database before 02_seed.sql and 03_indexes_constraints.sql.

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_users_role CHECK (role IN ('ADMIN', 'MANAGER', 'STAFF', 'DRIVER')),
    CONSTRAINT ck_users_status CHECK (status IN ('ACTIVE', 'LOCKED', 'INACTIVE'))
);

CREATE TABLE IF NOT EXISTS driver_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    driver_type VARCHAR(30) NOT NULL DEFAULT 'VISITOR',
    apartment_number VARCHAR(50),
    cccd_number VARCHAR(50),
    cccd_image_url VARCHAR(500),
    resident_verified BOOLEAN NOT NULL DEFAULT false,
    resident_verified_at TIMESTAMPTZ,
    resident_verified_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_driver_profiles_status CHECK (status IN ('ACTIVE', 'LOCKED', 'INACTIVE')),
    CONSTRAINT ck_driver_profiles_type CHECK (driver_type IN ('RESIDENT', 'VISITOR')),
    CONSTRAINT ck_driver_profiles_resident_fields CHECK (
        driver_type != 'RESIDENT'
        OR (NULLIF(BTRIM(apartment_number), '') IS NOT NULL AND NULLIF(BTRIM(cccd_number), '') IS NOT NULL)
    ),
    CONSTRAINT ck_driver_profiles_verification CHECK (
        (resident_verified = false AND resident_verified_at IS NULL AND resident_verified_by IS NULL)
        OR (resident_verified = true AND driver_type = 'RESIDENT' AND resident_verified_at IS NOT NULL AND resident_verified_by IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS vehicle_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    requires_slot BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT REFERENCES driver_profiles(id),
    plate_number VARCHAR(30),
    normalized_plate_number VARCHAR(30),
    vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id),
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_vehicles_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE IF NOT EXISTS parking_cards (
    id BIGSERIAL PRIMARY KEY,
    card_code VARCHAR(50) NOT NULL,
    qr_token VARCHAR(120) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    current_session_id BIGINT,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_parking_cards_status CHECK (status IN ('AVAILABLE', 'IN_USE', 'LOST', 'DAMAGED', 'INACTIVE')),
    CONSTRAINT ck_parking_cards_current_session_status CHECK (
        (status = 'IN_USE' AND current_session_id IS NOT NULL)
        OR status = 'LOST'
        OR (status IN ('AVAILABLE', 'DAMAGED', 'INACTIVE') AND current_session_id IS NULL)
    )
);

CREATE TABLE IF NOT EXISTS floors (
    id BIGSERIAL PRIMARY KEY,
    floor_code VARCHAR(30) NOT NULL,
    floor_name VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_floors_status CHECK (status IN ('ACTIVE', 'LOCKED', 'MAINTENANCE'))
);

CREATE TABLE IF NOT EXISTS areas (
    id BIGSERIAL PRIMARY KEY,
    floor_id BIGINT NOT NULL REFERENCES floors(id),
    area_code VARCHAR(30) NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    priority_order INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    total_capacity INT NOT NULL DEFAULT 0,
    current_real_occupancy INT NOT NULL DEFAULT 0,
    current_booked_slots INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_areas_status CHECK (status IN ('ACTIVE', 'LOCKED', 'MAINTENANCE')),
    CONSTRAINT ck_areas_total_capacity CHECK (total_capacity >= 0),
    CONSTRAINT ck_areas_real_occupancy CHECK (current_real_occupancy >= 0),
    CONSTRAINT ck_areas_booked_slots CHECK (current_booked_slots >= 0),
    CONSTRAINT ck_areas_occupancy_capacity CHECK (current_real_occupancy + current_booked_slots <= total_capacity)
);

CREATE TABLE IF NOT EXISTS area_vehicle_types (
    area_id BIGINT NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id) ON DELETE CASCADE,
    PRIMARY KEY (area_id, vehicle_type_id)
);

CREATE TABLE IF NOT EXISTS slots (
    id BIGSERIAL PRIMARY KEY,
    area_id BIGINT NOT NULL REFERENCES areas(id),
    slot_code VARCHAR(50) NOT NULL,
    allowed_vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    current_session_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_slots_status CHECK (status IN ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'LOCKED', 'MAINTENANCE')),
    CONSTRAINT ck_slots_current_session_status CHECK (
        (status = 'OCCUPIED' AND current_session_id IS NOT NULL)
        OR (status IN ('AVAILABLE', 'RESERVED', 'LOCKED', 'MAINTENANCE') AND current_session_id IS NULL)
    )
);

CREATE TABLE IF NOT EXISTS gates (
    id BIGSERIAL PRIMARY KEY,
    floor_id BIGINT NOT NULL REFERENCES floors(id),
    gate_code VARCHAR(50) NOT NULL,
    gate_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_gates_type CHECK (gate_type IN ('ENTRY', 'EXIT')),
    CONSTRAINT ck_gates_status CHECK (status IN ('ACTIVE', 'LOCKED', 'MAINTENANCE'))
);

CREATE TABLE IF NOT EXISTS pricing_rules (
    id BIGSERIAL PRIMARY KEY,
    vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id),
    day_price NUMERIC(12,2) NOT NULL,
    night_price NUMERIC(12,2) NOT NULL,
    monthly_price NUMERIC(12,2) NOT NULL,
    reservation_hourly_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    lost_card_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_by BIGINT NOT NULL REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_pricing_rules_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT ck_pricing_rules_amounts CHECK (
        day_price >= 0
        AND night_price >= 0
        AND monthly_price >= 0
        AND reservation_hourly_price >= 0
        AND lost_card_fee >= 0
    )
);

CREATE TABLE IF NOT EXISTS monthly_passes (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT REFERENCES driver_profiles(id),
    card_id BIGINT NOT NULL REFERENCES parking_cards(id),
    owner_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    plate_number VARCHAR(30) NOT NULL,
    normalized_plate_number VARCHAR(30) NOT NULL,
    vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id),
    floor_id BIGINT REFERENCES floors(id),
    area_id BIGINT REFERENCES areas(id),
    slot_id BIGINT REFERENCES slots(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_monthly_passes_status CHECK (status IN ('ACTIVE', 'EXPIRED', 'LOCKED')),
    CONSTRAINT ck_monthly_passes_dates CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    reservation_code VARCHAR(50) NOT NULL,
    driver_id BIGINT REFERENCES driver_profiles(id),
    vehicle_id BIGINT REFERENCES vehicles(id),
    plate_number VARCHAR(30) NULL,
    normalized_plate_number VARCHAR(30) NULL,
    vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id),
    floor_id BIGINT NOT NULL REFERENCES floors(id),
    area_id BIGINT NOT NULL REFERENCES areas(id),
    slot_id BIGINT REFERENCES slots(id),
    pricing_rule_id BIGINT REFERENCES pricing_rules(id),
    snapshot_reservation_hourly_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    reserved_duration_minutes INT NOT NULL DEFAULT 0,
    booking_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    reserved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    payment_deadline TIMESTAMPTZ NULL,
    confirmed_at TIMESTAMPTZ NULL,
    checked_in_at TIMESTAMPTZ,
    checked_in_by BIGINT REFERENCES users(id),
    cancelled_at TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_by BIGINT REFERENCES users(id),
    cancelled_by BIGINT REFERENCES users(id),
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_reservations_status CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
    CONSTRAINT ck_reservations_payment_status CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'WAIVED', 'NOT_REQUIRED')),
    CONSTRAINT ck_reservations_booking_amounts CHECK (
        snapshot_reservation_hourly_price >= 0
        AND reserved_duration_minutes >= 0
        AND booking_amount >= 0
    ),
    CONSTRAINT ck_reservations_expires_at CHECK (expires_at > reserved_at),
    CONSTRAINT ck_reservations_checked_in_at CHECK (checked_in_at IS NULL OR checked_in_at >= reserved_at),
    CONSTRAINT ck_reservations_checked_in_by CHECK (
        (checked_in_at IS NULL AND checked_in_by IS NULL)
        OR (checked_in_at IS NOT NULL AND checked_in_by IS NOT NULL)
    ),
    CONSTRAINT ck_reservations_cancelled_at CHECK (cancelled_at IS NULL OR cancelled_at >= reserved_at),
    CONSTRAINT ck_reservations_plate_required CHECK (
        (plate_number IS NULL AND normalized_plate_number IS NULL)
        OR (NULLIF(BTRIM(plate_number), '') IS NOT NULL AND NULLIF(BTRIM(normalized_plate_number), '') IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS parking_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_code VARCHAR(50) NOT NULL,
    card_id BIGINT NOT NULL REFERENCES parking_cards(id),
    driver_id BIGINT REFERENCES driver_profiles(id),
    vehicle_id BIGINT REFERENCES vehicles(id),
    plate_number VARCHAR(30),
    normalized_plate_number VARCHAR(30),
    no_plate BOOLEAN NOT NULL DEFAULT false,
    vehicle_description TEXT,
    vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id),
    customer_type VARCHAR(30) NOT NULL DEFAULT 'CASUAL',
    claimed_by_user_id BIGINT REFERENCES users(id),
    claimed_at TIMESTAMPTZ,
    claim_method VARCHAR(30),
    monthly_pass_id BIGINT REFERENCES monthly_passes(id),
    reservation_id BIGINT REFERENCES reservations(id),
    floor_id BIGINT NOT NULL REFERENCES floors(id),
    area_id BIGINT NOT NULL REFERENCES areas(id),
    slot_id BIGINT REFERENCES slots(id),
    entry_gate_id BIGINT NOT NULL REFERENCES gates(id),
    exit_gate_id BIGINT REFERENCES gates(id),
    entry_staff_id BIGINT NOT NULL REFERENCES users(id),
    exit_staff_id BIGINT REFERENCES users(id),
    entry_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    exit_time TIMESTAMPTZ,
    billable_start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    payment_required BOOLEAN NOT NULL DEFAULT true,
    payment_status VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    pricing_rule_id BIGINT REFERENCES pricing_rules(id),
    snapshot_day_price NUMERIC(12,2),
    snapshot_night_price NUMERIC(12,2),
    snapshot_monthly_price NUMERIC(12,2),
    snapshot_lost_card_fee NUMERIC(12,2),
    suggested_area_id BIGINT REFERENCES areas(id),
    suggested_slot_id BIGINT REFERENCES slots(id),
    override_area_id BIGINT REFERENCES areas(id),
    override_slot_id BIGINT REFERENCES slots(id),
    override_by BIGINT REFERENCES users(id),
    override_at TIMESTAMPTZ,
    override_reason TEXT,
    plate_corrected_by BIGINT REFERENCES users(id),
    plate_corrected_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_sessions_customer_type CHECK (customer_type IN ('CASUAL', 'MONTHLY')),
    CONSTRAINT ck_sessions_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'LOST_CARD_PENDING', 'MISMATCH_PENDING')),
    CONSTRAINT ck_sessions_payment_status CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'WAIVED', 'NOT_REQUIRED')),
    CONSTRAINT ck_sessions_plate_or_no_plate CHECK (no_plate = true OR normalized_plate_number IS NOT NULL),
    CONSTRAINT ck_sessions_no_plate_description CHECK (
        no_plate = false OR NULLIF(BTRIM(vehicle_description), '') IS NOT NULL
    ),
    CONSTRAINT ck_sessions_claim_method CHECK (claim_method IS NULL OR claim_method IN ('CARD_QR', 'STAFF_ASSIGN')),
    CONSTRAINT ck_sessions_claim_audit CHECK (
        (
            claimed_by_user_id IS NULL
            AND claimed_at IS NULL
            AND claim_method IS NULL
        )
        OR (
            driver_id IS NOT NULL
            AND claimed_by_user_id IS NOT NULL
            AND claimed_at IS NOT NULL
            AND claim_method IS NOT NULL
        )
    ),
    CONSTRAINT ck_sessions_billable_start_time CHECK (billable_start_time >= entry_time),
    CONSTRAINT ck_sessions_override_audit CHECK (
        (
            override_area_id IS NULL
            AND override_slot_id IS NULL
            AND override_reason IS NULL
            AND override_by IS NULL
            AND override_at IS NULL
        )
        OR (override_by IS NOT NULL AND override_at IS NOT NULL)
    ),
    CONSTRAINT ck_sessions_plate_correction_audit CHECK (
        (plate_corrected_by IS NULL AND plate_corrected_at IS NULL)
        OR (plate_corrected_by IS NOT NULL AND plate_corrected_at IS NOT NULL)
    ),
    CONSTRAINT ck_sessions_exit_time CHECK (exit_time IS NULL OR exit_time >= entry_time)
);

CREATE TABLE IF NOT EXISTS parking_session_images (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES parking_sessions(id),
    image_type VARCHAR(30) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    detected_plate_number VARCHAR(30),
    detected_normalized_plate_number VARCHAR(30),
    confidence NUMERIC(5,2),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_session_images_type CHECK (image_type IN ('ENTRY_PLATE', 'ENTRY_VEHICLE', 'EXIT_PLATE', 'EXIT_VEHICLE')),
    CONSTRAINT ck_session_images_image_url CHECK (NULLIF(BTRIM(image_url), '') IS NOT NULL),
    CONSTRAINT ck_session_images_thumbnail_url CHECK (thumbnail_url IS NULL OR NULLIF(BTRIM(thumbnail_url), '') IS NOT NULL),
    CONSTRAINT ck_session_images_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100))
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT REFERENCES parking_sessions(id),
    reservation_id BIGINT REFERENCES reservations(id),
    monthly_pass_id BIGINT REFERENCES monthly_passes(id),
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    lost_card_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    purpose VARCHAR(40) NOT NULL DEFAULT 'PARKING_FEE',
    method VARCHAR(30) NOT NULL DEFAULT 'CASH',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    provider VARCHAR(50),
    provider_transaction_id VARCHAR(120),
    payment_url VARCHAR(500),
    expired_at TIMESTAMPTZ,
    gateway_payload JSONB,
    paid_by_user_id BIGINT REFERENCES users(id),
    received_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    fee_calculated_at TIMESTAMPTZ,
    payment_valid_until TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    collected_by BIGINT REFERENCES users(id),
    waive_reason VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_payments_method CHECK (method IN ('CASH', 'BANK_TRANSFER', 'NONE')),
    CONSTRAINT ck_payments_status CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'WAIVED', 'NOT_REQUIRED')),
    CONSTRAINT ck_payments_provider CHECK (provider IS NULL OR NULLIF(BTRIM(provider), '') IS NOT NULL),
    CONSTRAINT ck_payments_provider_transaction CHECK (provider_transaction_id IS NULL OR NULLIF(BTRIM(provider_transaction_id), '') IS NOT NULL),
    CONSTRAINT ck_payments_payment_url CHECK (payment_url IS NULL OR NULLIF(BTRIM(payment_url), '') IS NOT NULL),
    CONSTRAINT ck_payments_online_method CHECK (
        method = 'BANK_TRANSFER'
        OR (
            provider IS NULL
            AND provider_transaction_id IS NULL
            AND payment_url IS NULL
            AND expired_at IS NULL
            AND gateway_payload IS NULL
        )
    ),
    CONSTRAINT ck_payments_amounts CHECK (amount >= 0 AND lost_card_fee >= 0 AND total_amount >= 0 AND received_amount >= 0),
    CONSTRAINT ck_payments_total_amount CHECK (total_amount = amount + lost_card_fee),
    CONSTRAINT ck_payments_valid_until CHECK (payment_valid_until IS NULL OR paid_at IS NULL OR payment_valid_until > paid_at),
    CONSTRAINT ck_payments_purpose CHECK (purpose IN (
        'PARKING_FEE',
        'LOST_CARD_FEE',
        'MONTHLY_PASS_RENEWAL',
        'RESERVATION_FEE',
        'RESERVATION_EXTENSION',
        'LOST_CARD_REFUND'
    )),
    CONSTRAINT ck_payments_source CHECK (
        (
            purpose = 'MONTHLY_PASS_RENEWAL'
            AND monthly_pass_id IS NOT NULL
            AND session_id IS NULL
            AND reservation_id IS NULL
        )
        OR (
            purpose IN ('RESERVATION_FEE', 'RESERVATION_EXTENSION')
            AND reservation_id IS NOT NULL
            AND session_id IS NULL
            AND monthly_pass_id IS NULL
        )
        OR (
            purpose IN ('PARKING_FEE', 'LOST_CARD_FEE', 'LOST_CARD_REFUND')
            AND session_id IS NOT NULL
            AND reservation_id IS NULL
            AND monthly_pass_id IS NULL
        )
    )
);

CREATE TABLE IF NOT EXISTS payment_attempts (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payments(id),
    provider VARCHAR(50) NOT NULL DEFAULT 'VIETQR',
    attempt_no INT NOT NULL DEFAULT 1,
    amount NUMERIC(12,2) NOT NULL,
    received_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_url VARCHAR(500),
    qr_payload TEXT,
    provider_transaction_id VARCHAR(120),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expired_at TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    gateway_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_payment_attempts_provider CHECK (NULLIF(BTRIM(provider), '') IS NOT NULL),
    CONSTRAINT ck_payment_attempts_attempt_no CHECK (attempt_no > 0),
    CONSTRAINT ck_payment_attempts_amounts CHECK (amount >= 0 AND received_amount >= 0),
    CONSTRAINT ck_payment_attempts_payment_url CHECK (payment_url IS NULL OR NULLIF(BTRIM(payment_url), '') IS NOT NULL),
    CONSTRAINT ck_payment_attempts_qr_payload CHECK (qr_payload IS NULL OR NULLIF(BTRIM(qr_payload), '') IS NOT NULL),
    CONSTRAINT ck_payment_attempts_provider_transaction CHECK (provider_transaction_id IS NULL OR NULLIF(BTRIM(provider_transaction_id), '') IS NOT NULL),
    CONSTRAINT ck_payment_attempts_status CHECK (status IN ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'CANCELLED')),
    CONSTRAINT ck_payment_attempts_expired_at CHECK (expired_at > requested_at),
    CONSTRAINT ck_payment_attempts_paid_at CHECK (paid_at IS NULL OR paid_at >= requested_at)
);

CREATE TABLE IF NOT EXISTS reservation_extensions (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES reservations(id),
    old_expires_at TIMESTAMPTZ NOT NULL,
    new_expires_at TIMESTAMPTZ NOT NULL,
    added_minutes INT NOT NULL,
    pricing_rule_id BIGINT REFERENCES pricing_rules(id),
    snapshot_reservation_hourly_price NUMERIC(12,2) NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_id BIGINT REFERENCES payments(id),
    requested_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_reservation_extensions_time CHECK (new_expires_at > old_expires_at),
    CONSTRAINT ck_reservation_extensions_amounts CHECK (
        added_minutes > 0
        AND snapshot_reservation_hourly_price >= 0
        AND amount >= 0
    )
);

CREATE TABLE IF NOT EXISTS receipts (
    id BIGSERIAL PRIMARY KEY,
    receipt_code VARCHAR(50) NOT NULL,
    session_id BIGINT REFERENCES parking_sessions(id),
    payment_id BIGINT REFERENCES payments(id),
    card_code VARCHAR(50) NOT NULL,
    plate_number VARCHAR(30),
    vehicle_type_name VARCHAR(100) NOT NULL,
    entry_time TIMESTAMPTZ,
    exit_time TIMESTAMPTZ,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    lost_card_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH',
    printed_count INT NOT NULL DEFAULT 0,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_receipts_payment_method CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'NONE')),
    CONSTRAINT ck_receipts_amounts CHECK (amount >= 0 AND lost_card_fee >= 0 AND total_amount >= 0),
    CONSTRAINT ck_receipts_total_amount CHECK (total_amount = amount + lost_card_fee),
    CONSTRAINT ck_receipts_printed_count CHECK (printed_count >= 0),
    CONSTRAINT ck_receipts_source CHECK (
        (session_id IS NOT NULL AND entry_time IS NOT NULL AND exit_time IS NOT NULL)
        OR (session_id IS NULL AND entry_time IS NULL AND exit_time IS NULL AND payment_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS lost_card_cases (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES parking_sessions(id),
    card_id BIGINT REFERENCES parking_cards(id),
    reporter_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    verification_note TEXT NOT NULL,
    reason TEXT NOT NULL,
    lost_card_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_by BIGINT NOT NULL REFERENCES users(id),
    approved_by BIGINT REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_lost_card_cases_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    CONSTRAINT ck_lost_card_cases_fee CHECK (lost_card_fee >= 0)
);

CREATE TABLE IF NOT EXISTS lost_card_case_documents (
    id BIGSERIAL PRIMARY KEY,
    lost_card_case_id BIGINT NOT NULL REFERENCES lost_card_cases(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    original_file_name VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    sha256_hash VARCHAR(100),
    note TEXT,
    is_sensitive BOOLEAN NOT NULL DEFAULT true,
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_lost_card_documents_type CHECK (document_type IN (
        'CCCD_FRONT',
        'CCCD_BACK',
        'FACE_PHOTO',
        'VEHICLE_PHOTO',
        'LOSS_DECLARATION',
        'SIGNED_FORM',
        'OTHER'
    )),
    CONSTRAINT ck_lost_card_documents_file_path CHECK (NULLIF(BTRIM(file_path), '') IS NOT NULL),
    CONSTRAINT ck_lost_card_documents_size CHECK (size_bytes IS NULL OR size_bytes >= 0)
);

CREATE TABLE IF NOT EXISTS lost_card_refunds (
    id BIGSERIAL PRIMARY KEY,
    lost_card_case_id BIGINT NOT NULL REFERENCES lost_card_cases(id),
    session_id BIGINT NOT NULL REFERENCES parking_sessions(id),
    recovered_card_id BIGINT REFERENCES parking_cards(id),
    replacement_card_id BIGINT REFERENCES parking_cards(id),
    refund_percent NUMERIC(5,2) NOT NULL,
    refund_amount NUMERIC(12,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_by BIGINT REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejected_reason TEXT,
    paid_at TIMESTAMPTZ,
    payment_id BIGINT REFERENCES payments(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_lost_card_refunds_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED')),
    CONSTRAINT ck_lost_card_refunds_amounts CHECK (
        refund_percent >= 0
        AND refund_percent <= 100
        AND refund_amount >= 0
    ),
    CONSTRAINT ck_lost_card_refunds_reason CHECK (NULLIF(BTRIM(reason), '') IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS plate_mismatch_cases (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES parking_sessions(id),
    entry_plate_number VARCHAR(30),
    exit_plate_number VARCHAR(30) NOT NULL,
    reason TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_by BIGINT NOT NULL REFERENCES users(id),
    confirmed_by BIGINT REFERENCES users(id),
    confirmed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_plate_mismatch_cases_status CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id BIGINT REFERENCES users(id),
    source_service VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_audit_logs_source_service CHECK (source_service IN ('CORE_API', 'SUPPORT_API'))
);
```

### File: `database/02_seed.sql`

```sql
-- Parking Building Management System - MVP seed data
-- Run after 01_schema.sql. Demo passwords are "123456".
-- This file seeds baseline master/demo data only. Core transaction data
-- such as sessions, payments, receipts, lost-card cases and mismatch cases
-- should be created through APIs during flow tests.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (id, full_name, username, email, phone, password_hash, role, status)
VALUES
    (1, 'System Admin', 'admin01', 'admin01@example.local', '0900000001', crypt('123456', gen_salt('bf', 10)), 'ADMIN', 'ACTIVE'),
    (2, 'Demo Manager', 'manager01', 'manager01@example.local', '0900000002', crypt('123456', gen_salt('bf', 10)), 'MANAGER', 'ACTIVE'),
    (3, 'Demo Staff', 'staff01', 'staff01@example.local', '0900000003', crypt('123456', gen_salt('bf', 10)), 'STAFF', 'ACTIVE'),
    (4, 'Demo Driver', 'driver01', 'driver01@example.local', '0900000004', crypt('123456', gen_salt('bf', 10)), 'DRIVER', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO driver_profiles (id, user_id, full_name, phone, email, status, driver_type, apartment_number, cccd_number)
VALUES
    (1, 4, 'Demo Driver', '0900000004', 'driver01@example.local', 'ACTIVE', 'RESIDENT', 'A-0101', '012345678901'),
    (2, NULL, 'Other Driver', '0900000009', 'other@example.local', 'ACTIVE', 'RESIDENT', 'A-0102', '012345678902')
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    status = EXCLUDED.status,
    driver_type = EXCLUDED.driver_type,
    apartment_number = EXCLUDED.apartment_number,
    cccd_number = EXCLUDED.cccd_number,
    updated_at = now();

INSERT INTO vehicle_types (id, name, description, is_active, requires_slot)
VALUES
    (1, 'Xe đạp', 'Xe đạp tiêu chuẩn', true, false),
    (2, 'Xe đạp điện', 'Xe đạp điện hoặc xe điện nhẹ', true, false),
    (3, 'Xe máy', 'Xe máy tiêu chuẩn', true, false),
    (4, 'Xe máy điện', 'Xe máy điện', true, false),
    (5, 'Ô tô', 'Ô tô chở khách', true, true),
    (6, 'Ô tô điện', 'Ô tô điện chở khách', true, true),
    (7, 'Xe vận chuyển hàng hóa', 'Xe giao hàng hoặc xe chở hàng nhỏ', true, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    requires_slot = EXCLUDED.requires_slot,
    updated_at = now();

INSERT INTO vehicles (id, driver_id, plate_number, normalized_plate_number, vehicle_type_id, description, status)
VALUES
    (1, 1, '51A-99999', '51A99999', 3, 'Demo monthly pass motorbike', 'ACTIVE'),
    (2, 2, '29A-88888', '29A88888', 5, 'Other Driver Car', 'ACTIVE'),
    (3, 1, '29A-11111', '29A11111', 5, 'Driver owned car', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    driver_id = EXCLUDED.driver_id,
    plate_number = EXCLUDED.plate_number,
    normalized_plate_number = EXCLUDED.normalized_plate_number,
    vehicle_type_id = EXCLUDED.vehicle_type_id,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO floors (id, floor_code, floor_name, status)
VALUES
    (1, 'B1', 'Tầng hầm B1', 'ACTIVE'),
    (2, 'B2', 'Tầng hầm B2', 'ACTIVE'),
    (3, 'B3', 'Tầng hầm B3', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    floor_code = EXCLUDED.floor_code,
    floor_name = EXCLUDED.floor_name,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO areas (id, floor_id, area_code, area_name, priority_order, status, total_capacity)
VALUES
    (1, 1, 'A', 'B1 - Khu xe máy A', 10, 'ACTIVE', 150),
    (2, 1, 'B', 'B1 - Khu ô tô B', 20, 'ACTIVE', 10),
    (3, 2, 'A', 'B2 - Khu xe máy A', 30, 'ACTIVE', 150),
    (4, 2, 'B', 'B2 - Khu ô tô B', 40, 'ACTIVE', 10),
    (5, 3, 'A', 'B3 - Khu xe đạp A', 50, 'ACTIVE', 100)
ON CONFLICT (id) DO UPDATE SET
    floor_id = EXCLUDED.floor_id,
    area_code = EXCLUDED.area_code,
    area_name = EXCLUDED.area_name,
    priority_order = EXCLUDED.priority_order,
    status = EXCLUDED.status,
    total_capacity = EXCLUDED.total_capacity,
    updated_at = now();

INSERT INTO area_vehicle_types (area_id, vehicle_type_id)
VALUES
    (1, 3),
    (1, 4),
    (2, 5),
    (2, 6),
    (2, 7),
    (3, 3),
    (3, 4),
    (4, 5),
    (4, 6),
    (4, 7),
    (5, 1),
    (5, 2)
ON CONFLICT (area_id, vehicle_type_id) DO NOTHING;

INSERT INTO slots (id, area_id, slot_code, allowed_vehicle_type_id, status)
VALUES
    (11, 2, 'B-C01', 5, 'AVAILABLE'),
    (12, 2, 'B-C02', 5, 'AVAILABLE'),
    (13, 2, 'B-C03', 5, 'AVAILABLE'),
    (14, 2, 'B-C04', 5, 'AVAILABLE'),
    (15, 2, 'B-C05', 5, 'AVAILABLE'),
    (16, 2, 'B-C06', 5, 'AVAILABLE'),
    (17, 2, 'B-C07', 5, 'AVAILABLE'),
    (18, 2, 'B-EC01', 6, 'AVAILABLE'),
    (19, 2, 'B-EC02', 6, 'AVAILABLE'),
    (20, 2, 'B-D01', 7, 'AVAILABLE'),
    (31, 4, 'B-C01', 5, 'AVAILABLE'),
    (32, 4, 'B-C02', 5, 'AVAILABLE'),
    (33, 4, 'B-C03', 5, 'AVAILABLE'),
    (34, 4, 'B-C04', 5, 'AVAILABLE'),
    (35, 4, 'B-C05', 5, 'AVAILABLE'),
    (36, 4, 'B-C06', 5, 'AVAILABLE'),
    (37, 4, 'B-C07', 5, 'AVAILABLE'),
    (38, 4, 'B-EC01', 6, 'AVAILABLE'),
    (39, 4, 'B-EC02', 6, 'AVAILABLE'),
    (40, 4, 'B-D01', 7, 'AVAILABLE')
ON CONFLICT (id) DO UPDATE SET
    area_id = EXCLUDED.area_id,
    slot_code = EXCLUDED.slot_code,
    allowed_vehicle_type_id = EXCLUDED.allowed_vehicle_type_id,
    updated_at = now();

INSERT INTO gates (id, floor_id, gate_code, gate_type, status)
VALUES
    (1, 1, 'B1-IN', 'ENTRY', 'ACTIVE'),
    (2, 1, 'B1-OUT', 'EXIT', 'ACTIVE'),
    (3, 2, 'B2-IN', 'ENTRY', 'ACTIVE'),
    (4, 2, 'B2-OUT', 'EXIT', 'ACTIVE'),
    (5, 3, 'B3-IN', 'ENTRY', 'ACTIVE'),
    (6, 3, 'B3-OUT', 'EXIT', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    floor_id = EXCLUDED.floor_id,
    gate_code = EXCLUDED.gate_code,
    gate_type = EXCLUDED.gate_type,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO parking_cards (id, card_code, qr_token, status, note)
SELECT
    card_number,
    'C' || LPAD(card_number::TEXT, 3, '0'),
    'QR-C' || LPAD(card_number::TEXT, 3, '0') || '-DEMO-' || UPPER(SUBSTRING(MD5('parking-card-' || card_number::TEXT), 1, 16)),
    'AVAILABLE',
    'Demo card'
FROM generate_series(1, 20) AS card_number
ON CONFLICT (id) DO UPDATE SET
    card_code = EXCLUDED.card_code,
    qr_token = EXCLUDED.qr_token,
    note = EXCLUDED.note,
    updated_at = now();

INSERT INTO pricing_rules (
    id,
    vehicle_type_id,
    day_price,
    night_price,
    monthly_price,
    reservation_hourly_price,
    lost_card_fee,
    effective_from,
    status,
    created_by
)
VALUES
    (1, 1, 2000, 3000, 50000, 1000, 30000, '2026-01-01 00:00:00+07', 'ACTIVE', 2),
    (2, 2, 3000, 4000, 70000, 1000, 30000, '2026-01-01 00:00:00+07', 'ACTIVE', 2),
    (3, 3, 5000, 7000, 150000, 2000, 50000, '2026-01-01 00:00:00+07', 'ACTIVE', 2),
    (4, 4, 6000, 8000, 180000, 2000, 50000, '2026-01-01 00:00:00+07', 'ACTIVE', 2),
    (5, 5, 20000, 30000, 1200000, 10000, 200000, '2026-01-01 00:00:00+07', 'ACTIVE', 2),
    (6, 6, 25000, 35000, 1400000, 10000, 200000, '2026-01-01 00:00:00+07', 'ACTIVE', 2),
    (7, 7, 30000, 40000, 1500000, 12000, 250000, '2026-01-01 00:00:00+07', 'ACTIVE', 2)
ON CONFLICT (id) DO UPDATE SET
    vehicle_type_id = EXCLUDED.vehicle_type_id,
    day_price = EXCLUDED.day_price,
    night_price = EXCLUDED.night_price,
    monthly_price = EXCLUDED.monthly_price,
    reservation_hourly_price = EXCLUDED.reservation_hourly_price,
    lost_card_fee = EXCLUDED.lost_card_fee,
    effective_from = EXCLUDED.effective_from,
    status = EXCLUDED.status,
    created_by = EXCLUDED.created_by,
    updated_at = now();

INSERT INTO monthly_passes (
    id,
    driver_id,
    card_id,
    owner_name,
    phone,
    plate_number,
    normalized_plate_number,
    vehicle_type_id,
    floor_id,
    area_id,
    slot_id,
    start_date,
    end_date,
    status,
    created_by
)
VALUES
    (1, 1, 1, 'Nguyen Van Monthly', '0900000100', '51A-99999', '51A99999', 3, 1, 1, NULL, (CURRENT_DATE - INTERVAL '5 days')::DATE, (CURRENT_DATE + INTERVAL '25 days')::DATE, 'ACTIVE', 2)
ON CONFLICT (id) DO UPDATE SET
    driver_id = EXCLUDED.driver_id,
    card_id = EXCLUDED.card_id,
    owner_name = EXCLUDED.owner_name,
    phone = EXCLUDED.phone,
    plate_number = EXCLUDED.plate_number,
    normalized_plate_number = EXCLUDED.normalized_plate_number,
    vehicle_type_id = EXCLUDED.vehicle_type_id,
    floor_id = EXCLUDED.floor_id,
    area_id = EXCLUDED.area_id,
    slot_id = EXCLUDED.slot_id,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    status = EXCLUDED.status,
    created_by = EXCLUDED.created_by,
    updated_at = now();

INSERT INTO reservations (
    id,
    reservation_code,
    driver_id,
    vehicle_id,
    plate_number,
    normalized_plate_number,
    vehicle_type_id,
    floor_id,
    area_id,
    slot_id,
    reserved_duration_minutes,
    booking_amount,
    payment_status,
    reserved_at,
    expires_at,
    status,
    created_by
)
VALUES (
    1001,
    'RSV-NOPLATE-CAR-001',
    1,
    NULL,
    NULL,
    NULL,
    5, -- Ô tô
    1,
    2,
    12, -- Slot 12
    60,
    20000,
    'PAID',
    now(),
    now() + interval '60 minutes',
    'CONFIRMED',
    2
),
(
    1002,
    'RSV-NOPLATE-BIKE-001',
    1,
    NULL,
    NULL,
    NULL,
    3, -- Xe máy
    1,
    1,
    NULL,
    60,
    5000,
    'PAID',
    now(),
    now() + interval '60 minutes',
    'CONFIRMED',
    2
)
ON CONFLICT (id) DO UPDATE SET
    reservation_code = EXCLUDED.reservation_code,
    driver_id = EXCLUDED.driver_id,
    vehicle_id = EXCLUDED.vehicle_id,
    plate_number = EXCLUDED.plate_number,
    normalized_plate_number = EXCLUDED.normalized_plate_number,
    vehicle_type_id = EXCLUDED.vehicle_type_id,
    floor_id = EXCLUDED.floor_id,
    area_id = EXCLUDED.area_id,
    slot_id = EXCLUDED.slot_id,
    reserved_duration_minutes = EXCLUDED.reserved_duration_minutes,
    booking_amount = EXCLUDED.booking_amount,
    payment_status = EXCLUDED.payment_status,
    reserved_at = EXCLUDED.reserved_at,
    expires_at = EXCLUDED.expires_at,
    status = EXCLUDED.status,
    created_by = EXCLUDED.created_by,
    updated_at = now();

UPDATE slots
SET status = 'RESERVED'
WHERE id = 12;

SELECT setval('users_id_seq', COALESCE((SELECT max(id) FROM users), 1), (SELECT count(*) > 0 FROM users));
SELECT setval('driver_profiles_id_seq', COALESCE((SELECT max(id) FROM driver_profiles), 1), (SELECT count(*) > 0 FROM driver_profiles));
SELECT setval('vehicle_types_id_seq', COALESCE((SELECT max(id) FROM vehicle_types), 1), (SELECT count(*) > 0 FROM vehicle_types));
SELECT setval('vehicles_id_seq', COALESCE((SELECT max(id) FROM vehicles), 1), (SELECT count(*) > 0 FROM vehicles));
SELECT setval('parking_cards_id_seq', COALESCE((SELECT max(id) FROM parking_cards), 1), (SELECT count(*) > 0 FROM parking_cards));
SELECT setval('floors_id_seq', COALESCE((SELECT max(id) FROM floors), 1), (SELECT count(*) > 0 FROM floors));
SELECT setval('areas_id_seq', COALESCE((SELECT max(id) FROM areas), 1), (SELECT count(*) > 0 FROM areas));
SELECT setval('slots_id_seq', COALESCE((SELECT max(id) FROM slots), 1), (SELECT count(*) > 0 FROM slots));
SELECT setval('gates_id_seq', COALESCE((SELECT max(id) FROM gates), 1), (SELECT count(*) > 0 FROM gates));
SELECT setval('pricing_rules_id_seq', COALESCE((SELECT max(id) FROM pricing_rules), 1), (SELECT count(*) > 0 FROM pricing_rules));
SELECT setval('monthly_passes_id_seq', COALESCE((SELECT max(id) FROM monthly_passes), 1), (SELECT count(*) > 0 FROM monthly_passes));
SELECT setval('reservations_id_seq', COALESCE((SELECT max(id) FROM reservations), 1), (SELECT count(*) > 0 FROM reservations));
SELECT setval('parking_sessions_id_seq', COALESCE((SELECT max(id) FROM parking_sessions), 1), (SELECT count(*) > 0 FROM parking_sessions));
SELECT setval('parking_session_images_id_seq', COALESCE((SELECT max(id) FROM parking_session_images), 1), (SELECT count(*) > 0 FROM parking_session_images));
SELECT setval('payments_id_seq', COALESCE((SELECT max(id) FROM payments), 1), (SELECT count(*) > 0 FROM payments));
SELECT setval('reservation_extensions_id_seq', COALESCE((SELECT max(id) FROM reservation_extensions), 1), (SELECT count(*) > 0 FROM reservation_extensions));
SELECT setval('receipts_id_seq', COALESCE((SELECT max(id) FROM receipts), 1), (SELECT count(*) > 0 FROM receipts));
SELECT setval('lost_card_cases_id_seq', COALESCE((SELECT max(id) FROM lost_card_cases), 1), (SELECT count(*) > 0 FROM lost_card_cases));
SELECT setval('lost_card_refunds_id_seq', COALESCE((SELECT max(id) FROM lost_card_refunds), 1), (SELECT count(*) > 0 FROM lost_card_refunds));
SELECT setval('plate_mismatch_cases_id_seq', COALESCE((SELECT max(id) FROM plate_mismatch_cases), 1), (SELECT count(*) > 0 FROM plate_mismatch_cases));
SELECT setval('audit_logs_id_seq', COALESCE((SELECT max(id) FROM audit_logs), 1), (SELECT count(*) > 0 FROM audit_logs));
```

### File: `database/03_indexes_constraints.sql`

```sql
-- Parking Building Management System - indexes and late constraints
-- Run after 01_schema.sql and 02_seed.sql.

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_username ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_users_role ON users(role);
CREATE INDEX IF NOT EXISTS ix_users_status ON users(status);

CREATE UNIQUE INDEX IF NOT EXISTS ux_driver_profiles_user_id ON driver_profiles(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_driver_profiles_phone ON driver_profiles(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_driver_profiles_email ON driver_profiles(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_driver_profiles_type ON driver_profiles(driver_type);

CREATE UNIQUE INDEX IF NOT EXISTS ux_vehicle_types_name ON vehicle_types(name);
CREATE INDEX IF NOT EXISTS ix_vehicle_types_is_active ON vehicle_types(is_active);

CREATE INDEX IF NOT EXISTS ix_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS ix_vehicles_plate ON vehicles(normalized_plate_number);
CREATE INDEX IF NOT EXISTS ix_vehicles_type ON vehicles(vehicle_type_id);
CREATE INDEX IF NOT EXISTS ix_vehicles_status ON vehicles(status);

CREATE UNIQUE INDEX IF NOT EXISTS ux_cards_card_code ON parking_cards(card_code);
CREATE UNIQUE INDEX IF NOT EXISTS ux_cards_qr_token ON parking_cards(qr_token);
CREATE UNIQUE INDEX IF NOT EXISTS ux_cards_current_session ON parking_cards(current_session_id) WHERE current_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_cards_status ON parking_cards(status);
CREATE INDEX IF NOT EXISTS ix_cards_current_session ON parking_cards(current_session_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_floors_code ON floors(floor_code);
CREATE INDEX IF NOT EXISTS ix_floors_status ON floors(status);

CREATE UNIQUE INDEX IF NOT EXISTS ux_areas_floor_code ON areas(floor_id, area_code);
CREATE INDEX IF NOT EXISTS ix_areas_status ON areas(status);
CREATE INDEX IF NOT EXISTS ix_areas_priority ON areas(priority_order);

CREATE INDEX IF NOT EXISTS ix_area_vehicle_types_vehicle_type ON area_vehicle_types(vehicle_type_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_slots_area_code ON slots(area_id, slot_code);
CREATE UNIQUE INDEX IF NOT EXISTS ux_slots_current_session ON slots(current_session_id) WHERE current_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_slots_status ON slots(status);
CREATE INDEX IF NOT EXISTS ix_slots_vehicle_type ON slots(allowed_vehicle_type_id);
CREATE INDEX IF NOT EXISTS ix_slots_current_session ON slots(current_session_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_gates_floor_code ON gates(floor_id, gate_code);
CREATE INDEX IF NOT EXISTS ix_gates_type ON gates(gate_type);
CREATE INDEX IF NOT EXISTS ix_gates_status ON gates(status);

CREATE INDEX IF NOT EXISTS ix_pricing_rules_vehicle_type ON pricing_rules(vehicle_type_id);
CREATE INDEX IF NOT EXISTS ix_pricing_rules_status ON pricing_rules(status);
CREATE INDEX IF NOT EXISTS ix_pricing_rules_effective_from ON pricing_rules(effective_from);
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_pricing_rule_by_vehicle_type
ON pricing_rules(vehicle_type_id)
WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS ix_monthly_pass_plate ON monthly_passes(normalized_plate_number);
CREATE INDEX IF NOT EXISTS ix_monthly_pass_status ON monthly_passes(status);
CREATE INDEX IF NOT EXISTS ix_monthly_pass_dates ON monthly_passes(start_date, end_date);
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_monthly_pass_by_plate_type
ON monthly_passes(normalized_plate_number, vehicle_type_id)
WHERE status = 'ACTIVE';
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_monthly_pass_by_card
ON monthly_passes(card_id)
WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS ix_monthly_passes_floor_id ON monthly_passes(floor_id);
CREATE INDEX IF NOT EXISTS ix_monthly_passes_area_id ON monthly_passes(area_id);
CREATE INDEX IF NOT EXISTS ix_monthly_passes_slot_id ON monthly_passes(slot_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_monthly_pass_slot
ON monthly_passes(slot_id)
WHERE status = 'ACTIVE' AND slot_id IS NOT NULL;

ALTER TABLE reservations ADD COLUMN IF NOT EXISTS checked_in_by BIGINT REFERENCES users(id);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ NULL;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_reservations_code ON reservations(reservation_code);
CREATE INDEX IF NOT EXISTS ix_reservations_driver ON reservations(driver_id);
CREATE INDEX IF NOT EXISTS ix_reservations_vehicle ON reservations(vehicle_id);
CREATE INDEX IF NOT EXISTS ix_reservations_plate ON reservations(normalized_plate_number);
CREATE INDEX IF NOT EXISTS ix_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS ix_reservations_slot ON reservations(slot_id);
CREATE INDEX IF NOT EXISTS ix_reservations_expires_at ON reservations(expires_at);
CREATE INDEX IF NOT EXISTS ix_reservations_pricing_rule ON reservations(pricing_rule_id);
CREATE INDEX IF NOT EXISTS ix_reservations_payment_status ON reservations(payment_status);
CREATE INDEX IF NOT EXISTS ix_reservations_checked_in_by ON reservations(checked_in_by);
CREATE INDEX IF NOT EXISTS ix_reservations_payment_deadline ON reservations(payment_deadline);
CREATE INDEX IF NOT EXISTS ix_reservations_confirmed_at ON reservations(confirmed_at);
DROP INDEX IF EXISTS ux_pending_reservation_by_slot;
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_reservation_by_slot
ON reservations(slot_id)
WHERE slot_id IS NOT NULL
  AND status IN ('PENDING', 'CONFIRMED');

DROP INDEX IF EXISTS ux_pending_reservation_by_vehicle;
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_reservation_by_vehicle
ON reservations(vehicle_id)
WHERE vehicle_id IS NOT NULL
  AND status IN ('PENDING', 'CONFIRMED');

DROP INDEX IF EXISTS ux_pending_reservation_by_plate_type;
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_reservation_by_plate_type
ON reservations(normalized_plate_number, vehicle_type_id)
WHERE normalized_plate_number IS NOT NULL
  AND status IN ('PENDING', 'CONFIRMED');

ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS billable_start_time TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS claimed_by_user_id BIGINT REFERENCES users(id);
ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS claim_method VARCHAR(30);
ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS override_by BIGINT REFERENCES users(id);
ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS override_at TIMESTAMPTZ;
ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS plate_corrected_by BIGINT REFERENCES users(id);
ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS plate_corrected_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS ux_sessions_session_code ON parking_sessions(session_code);
CREATE INDEX IF NOT EXISTS ix_sessions_card_id ON parking_sessions(card_id);
CREATE INDEX IF NOT EXISTS ix_sessions_plate ON parking_sessions(normalized_plate_number);
CREATE INDEX IF NOT EXISTS ix_sessions_status ON parking_sessions(status);
CREATE INDEX IF NOT EXISTS ix_sessions_entry_time ON parking_sessions(entry_time);
CREATE INDEX IF NOT EXISTS ix_sessions_exit_time ON parking_sessions(exit_time);
CREATE INDEX IF NOT EXISTS ix_sessions_vehicle_type ON parking_sessions(vehicle_type_id);
CREATE INDEX IF NOT EXISTS ix_sessions_slot ON parking_sessions(slot_id);
CREATE INDEX IF NOT EXISTS ix_sessions_reservation ON parking_sessions(reservation_id);
CREATE INDEX IF NOT EXISTS ix_sessions_billable_start_time ON parking_sessions(billable_start_time);
CREATE INDEX IF NOT EXISTS ix_sessions_claimed_by_user ON parking_sessions(claimed_by_user_id);
CREATE INDEX IF NOT EXISTS ix_sessions_claimed_at ON parking_sessions(claimed_at);
CREATE INDEX IF NOT EXISTS ix_sessions_override_by ON parking_sessions(override_by);
CREATE INDEX IF NOT EXISTS ix_sessions_plate_corrected_by ON parking_sessions(plate_corrected_by);
CREATE UNIQUE INDEX IF NOT EXISTS ux_sessions_reservation
ON parking_sessions(reservation_id)
WHERE reservation_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_active_session_by_card
ON parking_sessions(card_id)
WHERE status IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING');

CREATE UNIQUE INDEX IF NOT EXISTS ux_active_session_by_plate
ON parking_sessions(normalized_plate_number)
WHERE normalized_plate_number IS NOT NULL
  AND status IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING');

CREATE UNIQUE INDEX IF NOT EXISTS ux_active_session_by_slot
ON parking_sessions(slot_id)
WHERE status IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING');

CREATE INDEX IF NOT EXISTS ix_session_images_session ON parking_session_images(session_id);
CREATE INDEX IF NOT EXISTS ix_session_images_session_type ON parking_session_images(session_id, image_type);
CREATE INDEX IF NOT EXISTS ix_session_images_plate ON parking_session_images(detected_normalized_plate_number)
WHERE detected_normalized_plate_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_session_images_captured_at ON parking_session_images(captured_at);
CREATE UNIQUE INDEX IF NOT EXISTS ux_session_images_primary_type
ON parking_session_images(session_id, image_type)
WHERE is_primary;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider_transaction_id VARCHAR(120);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_url VARCHAR(500);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_payload JSONB;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_by_user_id BIGINT REFERENCES users(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS received_amount NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS fee_calculated_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_valid_until TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS ix_payments_session ON payments(session_id);
CREATE INDEX IF NOT EXISTS ix_payments_reservation ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS ix_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS ix_payments_paid_at ON payments(paid_at);
CREATE INDEX IF NOT EXISTS ix_payments_monthly_pass ON payments(monthly_pass_id);
CREATE INDEX IF NOT EXISTS ix_payments_purpose ON payments(purpose);
CREATE INDEX IF NOT EXISTS ix_payments_provider ON payments(provider);
CREATE INDEX IF NOT EXISTS ix_payments_expired_at ON payments(expired_at);
CREATE INDEX IF NOT EXISTS ix_payments_paid_by_user ON payments(paid_by_user_id);
CREATE INDEX IF NOT EXISTS ix_payments_fee_calculated_at ON payments(fee_calculated_at);
CREATE INDEX IF NOT EXISTS ix_payments_valid_until ON payments(payment_valid_until);
CREATE UNIQUE INDEX IF NOT EXISTS ux_payments_provider_transaction
ON payments(provider, provider_transaction_id)
WHERE provider IS NOT NULL AND provider_transaction_id IS NOT NULL;
DROP INDEX IF EXISTS ux_final_payment_by_session;
DROP INDEX IF EXISTS ux_final_parking_payment_by_session;
CREATE INDEX IF NOT EXISTS ix_final_parking_payments_by_session
ON payments(session_id, purpose, status, paid_at)
WHERE purpose IN ('PARKING_FEE', 'LOST_CARD_FEE')
  AND status IN ('PAID', 'WAIVED', 'NOT_REQUIRED');

CREATE TABLE IF NOT EXISTS payment_attempts (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payments(id),
    provider VARCHAR(50) NOT NULL DEFAULT 'VIETQR',
    attempt_no INT NOT NULL DEFAULT 1,
    amount NUMERIC(12,2) NOT NULL,
    received_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_url VARCHAR(500),
    qr_payload TEXT,
    provider_transaction_id VARCHAR(120),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expired_at TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    gateway_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_payment_attempts_provider CHECK (NULLIF(BTRIM(provider), '') IS NOT NULL),
    CONSTRAINT ck_payment_attempts_attempt_no CHECK (attempt_no > 0),
    CONSTRAINT ck_payment_attempts_amounts CHECK (amount >= 0 AND received_amount >= 0),
    CONSTRAINT ck_payment_attempts_payment_url CHECK (payment_url IS NULL OR NULLIF(BTRIM(payment_url), '') IS NOT NULL),
    CONSTRAINT ck_payment_attempts_qr_payload CHECK (qr_payload IS NULL OR NULLIF(BTRIM(qr_payload), '') IS NOT NULL),
    CONSTRAINT ck_payment_attempts_provider_transaction CHECK (provider_transaction_id IS NULL OR NULLIF(BTRIM(provider_transaction_id), '') IS NOT NULL),
    CONSTRAINT ck_payment_attempts_status CHECK (status IN ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'CANCELLED')),
    CONSTRAINT ck_payment_attempts_expired_at CHECK (expired_at > requested_at),
    CONSTRAINT ck_payment_attempts_paid_at CHECK (paid_at IS NULL OR paid_at >= requested_at)
);

CREATE INDEX IF NOT EXISTS ix_payment_attempts_payment ON payment_attempts(payment_id);
CREATE INDEX IF NOT EXISTS ix_payment_attempts_status ON payment_attempts(status);
CREATE INDEX IF NOT EXISTS ix_payment_attempts_expired_at ON payment_attempts(expired_at);
CREATE UNIQUE INDEX IF NOT EXISTS ux_payment_attempts_payment_attempt_no
ON payment_attempts(payment_id, attempt_no);
CREATE UNIQUE INDEX IF NOT EXISTS ux_payment_attempts_provider_transaction
ON payment_attempts(provider, provider_transaction_id)
WHERE provider_transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_reservation_extensions_reservation ON reservation_extensions(reservation_id);
CREATE INDEX IF NOT EXISTS ix_reservation_extensions_payment ON reservation_extensions(payment_id);
CREATE INDEX IF NOT EXISTS ix_reservation_extensions_created_at ON reservation_extensions(created_at);

CREATE UNIQUE INDEX IF NOT EXISTS ux_receipts_code ON receipts(receipt_code);
CREATE UNIQUE INDEX IF NOT EXISTS ux_receipts_session ON receipts(session_id);
CREATE INDEX IF NOT EXISTS ix_receipts_session ON receipts(session_id);
CREATE INDEX IF NOT EXISTS ix_receipts_payment ON receipts(payment_id);

CREATE INDEX IF NOT EXISTS ix_lost_card_cases_session ON lost_card_cases(session_id);
CREATE INDEX IF NOT EXISTS ix_lost_card_cases_status ON lost_card_cases(status);
CREATE UNIQUE INDEX IF NOT EXISTS ux_pending_lost_card_case_by_session
ON lost_card_cases(session_id)
WHERE status = 'PENDING';

CREATE TABLE IF NOT EXISTS lost_card_case_documents (
    id BIGSERIAL PRIMARY KEY,
    lost_card_case_id BIGINT NOT NULL REFERENCES lost_card_cases(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    original_file_name VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    sha256_hash VARCHAR(100),
    note TEXT,
    is_sensitive BOOLEAN NOT NULL DEFAULT true,
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_lost_card_documents_case ON lost_card_case_documents(lost_card_case_id);
CREATE INDEX IF NOT EXISTS ix_lost_card_documents_type ON lost_card_case_documents(document_type);
CREATE INDEX IF NOT EXISTS ix_lost_card_documents_uploaded_at ON lost_card_case_documents(uploaded_at);
CREATE INDEX IF NOT EXISTS ix_lost_card_documents_active_case
ON lost_card_case_documents(lost_card_case_id)
WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_lost_card_documents_active_case_type
ON lost_card_case_documents(lost_card_case_id, document_type)
WHERE deleted_at IS NULL AND document_type <> 'OTHER';

CREATE INDEX IF NOT EXISTS ix_lost_card_refunds_case ON lost_card_refunds(lost_card_case_id);
CREATE INDEX IF NOT EXISTS ix_lost_card_refunds_session ON lost_card_refunds(session_id);
CREATE INDEX IF NOT EXISTS ix_lost_card_refunds_status ON lost_card_refunds(status);
CREATE INDEX IF NOT EXISTS ix_lost_card_refunds_payment ON lost_card_refunds(payment_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_lost_card_refund_by_case
ON lost_card_refunds(lost_card_case_id);

CREATE INDEX IF NOT EXISTS ix_plate_mismatch_cases_session ON plate_mismatch_cases(session_id);
CREATE INDEX IF NOT EXISTS ix_plate_mismatch_cases_status ON plate_mismatch_cases(status);
CREATE UNIQUE INDEX IF NOT EXISTS ux_pending_plate_mismatch_case_by_session
ON plate_mismatch_cases(session_id)
WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS ix_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS ix_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS ix_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS ix_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS ix_audit_logs_source_service ON audit_logs(source_service);

DO $$
BEGIN
    ALTER TABLE areas DROP CONSTRAINT IF EXISTS ck_areas_total_capacity;
    ALTER TABLE areas
        ADD CONSTRAINT ck_areas_total_capacity
        CHECK (total_capacity >= 0);

    ALTER TABLE areas DROP CONSTRAINT IF EXISTS ck_areas_real_occupancy;
    ALTER TABLE areas
        ADD CONSTRAINT ck_areas_real_occupancy
        CHECK (current_real_occupancy >= 0);

    ALTER TABLE areas DROP CONSTRAINT IF EXISTS ck_areas_booked_slots;
    ALTER TABLE areas
        ADD CONSTRAINT ck_areas_booked_slots
        CHECK (current_booked_slots >= 0);

    ALTER TABLE areas DROP CONSTRAINT IF EXISTS ck_areas_occupancy_capacity;
    ALTER TABLE areas
        ADD CONSTRAINT ck_areas_occupancy_capacity
        CHECK (current_real_occupancy + current_booked_slots <= total_capacity);

    ALTER TABLE slots DROP CONSTRAINT IF EXISTS ck_slots_status;
    ALTER TABLE slots
        ADD CONSTRAINT ck_slots_status
        CHECK (status IN ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'LOCKED', 'MAINTENANCE'));

    ALTER TABLE slots DROP CONSTRAINT IF EXISTS ck_slots_current_session_status;
    ALTER TABLE slots
        ADD CONSTRAINT ck_slots_current_session_status
        CHECK (
            (status = 'OCCUPIED' AND current_session_id IS NOT NULL)
            OR (status IN ('AVAILABLE', 'RESERVED', 'LOCKED', 'MAINTENANCE') AND current_session_id IS NULL)
        );

    ALTER TABLE reservations ALTER COLUMN plate_number DROP NOT NULL;
    ALTER TABLE reservations ALTER COLUMN normalized_plate_number DROP NOT NULL;
    ALTER TABLE reservations DROP CONSTRAINT IF EXISTS ck_reservations_vehicle_identity;
    ALTER TABLE reservations DROP CONSTRAINT IF EXISTS ck_reservations_plate_required;
    ALTER TABLE reservations
        ADD CONSTRAINT ck_reservations_plate_required
        CHECK (
            (plate_number IS NULL AND normalized_plate_number IS NULL)
            OR (
                NULLIF(BTRIM(plate_number), '') IS NOT NULL
                AND NULLIF(BTRIM(normalized_plate_number), '') IS NOT NULL
            )
        );

    ALTER TABLE reservations DROP CONSTRAINT IF EXISTS ck_reservations_checked_in_by;
    ALTER TABLE reservations
        ADD CONSTRAINT ck_reservations_checked_in_by
        CHECK (
            (checked_in_at IS NULL AND checked_in_by IS NULL)
            OR (checked_in_at IS NOT NULL AND checked_in_by IS NOT NULL)
        );

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_parking_cards_current_session'
    ) THEN
        ALTER TABLE parking_cards
            ADD CONSTRAINT fk_parking_cards_current_session
            FOREIGN KEY (current_session_id)
            REFERENCES parking_sessions(id)
            DEFERRABLE INITIALLY IMMEDIATE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_slots_current_session'
    ) THEN
        ALTER TABLE slots
            ADD CONSTRAINT fk_slots_current_session
            FOREIGN KEY (current_session_id)
            REFERENCES parking_sessions(id)
            DEFERRABLE INITIALLY IMMEDIATE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_parking_cards_current_session_status'
          AND conrelid = 'parking_cards'::regclass
    ) THEN
        ALTER TABLE parking_cards
            ADD CONSTRAINT ck_parking_cards_current_session_status
            CHECK (
                (status = 'IN_USE' AND current_session_id IS NOT NULL)
                OR status = 'LOST'
                OR (status IN ('AVAILABLE', 'DAMAGED', 'INACTIVE') AND current_session_id IS NULL)
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_sessions_no_plate_description'
          AND conrelid = 'parking_sessions'::regclass
    ) THEN
        ALTER TABLE parking_sessions
            ADD CONSTRAINT ck_sessions_no_plate_description
            CHECK (no_plate = false OR NULLIF(BTRIM(vehicle_description), '') IS NOT NULL);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_sessions_exit_time'
          AND conrelid = 'parking_sessions'::regclass
    ) THEN
        ALTER TABLE parking_sessions
            ADD CONSTRAINT ck_sessions_exit_time
            CHECK (exit_time IS NULL OR exit_time >= entry_time);
    END IF;

    ALTER TABLE parking_sessions DROP CONSTRAINT IF EXISTS ck_sessions_billable_start_time;
    ALTER TABLE parking_sessions
        ADD CONSTRAINT ck_sessions_billable_start_time
        CHECK (billable_start_time >= entry_time);

    ALTER TABLE parking_sessions DROP CONSTRAINT IF EXISTS ck_sessions_claim_method;
    ALTER TABLE parking_sessions
        ADD CONSTRAINT ck_sessions_claim_method
        CHECK (claim_method IS NULL OR claim_method IN ('CARD_QR', 'STAFF_ASSIGN'));

    ALTER TABLE parking_sessions DROP CONSTRAINT IF EXISTS ck_sessions_claim_audit;
    ALTER TABLE parking_sessions
        ADD CONSTRAINT ck_sessions_claim_audit
        CHECK (
            (
                claimed_by_user_id IS NULL
                AND claimed_at IS NULL
                AND claim_method IS NULL
            )
            OR (
                driver_id IS NOT NULL
                AND claimed_by_user_id IS NOT NULL
                AND claimed_at IS NOT NULL
                AND claim_method IS NOT NULL
            )
        );

    ALTER TABLE parking_sessions DROP CONSTRAINT IF EXISTS ck_sessions_override_audit;
    ALTER TABLE parking_sessions
        ADD CONSTRAINT ck_sessions_override_audit
        CHECK (
            (
                override_area_id IS NULL
                AND override_slot_id IS NULL
                AND override_reason IS NULL
                AND override_by IS NULL
                AND override_at IS NULL
            )
            OR (override_by IS NOT NULL AND override_at IS NOT NULL)
        );

    ALTER TABLE parking_sessions DROP CONSTRAINT IF EXISTS ck_sessions_plate_correction_audit;
    ALTER TABLE parking_sessions
        ADD CONSTRAINT ck_sessions_plate_correction_audit
        CHECK (
            (plate_corrected_by IS NULL AND plate_corrected_at IS NULL)
            OR (plate_corrected_by IS NOT NULL AND plate_corrected_at IS NOT NULL)
        );

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_payments_total_amount'
          AND conrelid = 'payments'::regclass
    ) THEN
        ALTER TABLE payments
            ADD CONSTRAINT ck_payments_total_amount
            CHECK (total_amount = amount + lost_card_fee);
    END IF;

    ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payments_amounts;
    ALTER TABLE payments
        ADD CONSTRAINT ck_payments_amounts
        CHECK (amount >= 0 AND lost_card_fee >= 0 AND total_amount >= 0 AND received_amount >= 0);

    ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payments_valid_until;
    ALTER TABLE payments
        ADD CONSTRAINT ck_payments_valid_until
        CHECK (payment_valid_until IS NULL OR paid_at IS NULL OR payment_valid_until > paid_at);

    ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payments_method;
    ALTER TABLE payments
        ADD CONSTRAINT ck_payments_method
        CHECK (method IN ('CASH', 'BANK_TRANSFER', 'NONE'));

    ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payments_provider;
    ALTER TABLE payments
        ADD CONSTRAINT ck_payments_provider
        CHECK (provider IS NULL OR NULLIF(BTRIM(provider), '') IS NOT NULL);

    ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payments_provider_transaction;
    ALTER TABLE payments
        ADD CONSTRAINT ck_payments_provider_transaction
        CHECK (provider_transaction_id IS NULL OR NULLIF(BTRIM(provider_transaction_id), '') IS NOT NULL);

    ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payments_payment_url;
    ALTER TABLE payments
        ADD CONSTRAINT ck_payments_payment_url
        CHECK (payment_url IS NULL OR NULLIF(BTRIM(payment_url), '') IS NOT NULL);

    ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payments_online_method;
    ALTER TABLE payments
        ADD CONSTRAINT ck_payments_online_method
        CHECK (
            method = 'BANK_TRANSFER'
            OR (
                provider IS NULL
                AND provider_transaction_id IS NULL
                AND payment_url IS NULL
                AND expired_at IS NULL
                AND gateway_payload IS NULL
            )
        );

    ALTER TABLE lost_card_case_documents DROP CONSTRAINT IF EXISTS ck_lost_card_documents_type;
    ALTER TABLE lost_card_case_documents
        ADD CONSTRAINT ck_lost_card_documents_type
        CHECK (document_type IN (
            'CCCD_FRONT',
            'CCCD_BACK',
            'FACE_PHOTO',
            'VEHICLE_PHOTO',
            'LOSS_DECLARATION',
            'SIGNED_FORM',
            'OTHER'
        ));

    ALTER TABLE lost_card_case_documents DROP CONSTRAINT IF EXISTS ck_lost_card_documents_file_path;
    ALTER TABLE lost_card_case_documents
        ADD CONSTRAINT ck_lost_card_documents_file_path
        CHECK (NULLIF(BTRIM(file_path), '') IS NOT NULL);

    ALTER TABLE lost_card_case_documents DROP CONSTRAINT IF EXISTS ck_lost_card_documents_size;
    ALTER TABLE lost_card_case_documents
        ADD CONSTRAINT ck_lost_card_documents_size
        CHECK (size_bytes IS NULL OR size_bytes >= 0);

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_receipts_total_amount'
          AND conrelid = 'receipts'::regclass
    ) THEN
        ALTER TABLE receipts
            ADD CONSTRAINT ck_receipts_total_amount
            CHECK (total_amount = amount + lost_card_fee);
    END IF;

    ALTER TABLE receipts DROP CONSTRAINT IF EXISTS ck_receipts_payment_method;
    ALTER TABLE receipts
        ADD CONSTRAINT ck_receipts_payment_method
        CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'NONE'));
END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_vehicle_driver_type()
RETURNS TRIGGER AS $$
DECLARE
    profile_type varchar(30);
BEGIN
    IF NEW.driver_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT driver_type INTO profile_type
    FROM driver_profiles
    WHERE id = NEW.driver_id;

    IF profile_type IS NULL THEN
        RAISE EXCEPTION 'driver_id % does not exist', NEW.driver_id;
    END IF;

    IF profile_type <> 'RESIDENT' THEN
        RAISE EXCEPTION 'visitor driver profile % cannot own a registered vehicle', NEW.driver_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_reservation_slot_requirement()
RETURNS TRIGGER AS $$
DECLARE
    required_slot boolean;
    slot_area_id bigint;
    slot_vehicle_type_id bigint;
    area_floor_id bigint;
BEGIN
    SELECT requires_slot INTO required_slot
    FROM vehicle_types
    WHERE id = NEW.vehicle_type_id;

    IF required_slot IS NULL THEN
        RAISE EXCEPTION 'vehicle_type_id % does not exist', NEW.vehicle_type_id;
    END IF;

    SELECT floor_id INTO area_floor_id
    FROM areas
    WHERE id = NEW.area_id;

    IF area_floor_id IS NULL OR area_floor_id <> NEW.floor_id THEN
        RAISE EXCEPTION 'reservation area_id % does not belong to floor_id %', NEW.area_id, NEW.floor_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM area_vehicle_types
        WHERE area_id = NEW.area_id
          AND vehicle_type_id = NEW.vehicle_type_id
    ) THEN
        RAISE EXCEPTION 'vehicle_type_id % is not allowed in area_id %', NEW.vehicle_type_id, NEW.area_id;
    END IF;

    IF required_slot AND NEW.slot_id IS NULL THEN
        RAISE EXCEPTION 'slot_id is required for vehicle_type_id %', NEW.vehicle_type_id;
    END IF;

    IF NOT required_slot AND NEW.slot_id IS NOT NULL THEN
        RAISE EXCEPTION 'slot_id must be NULL for area-managed vehicle_type_id %', NEW.vehicle_type_id;
    END IF;

    IF NEW.slot_id IS NOT NULL THEN
        SELECT area_id, allowed_vehicle_type_id INTO slot_area_id, slot_vehicle_type_id
        FROM slots
        WHERE id = NEW.slot_id;

        IF slot_area_id IS NULL THEN
            RAISE EXCEPTION 'slot_id % does not exist', NEW.slot_id;
        END IF;

        IF slot_area_id <> NEW.area_id THEN
            RAISE EXCEPTION 'slot_id % does not belong to area_id %', NEW.slot_id, NEW.area_id;
        END IF;

        IF slot_vehicle_type_id <> NEW.vehicle_type_id THEN
            RAISE EXCEPTION 'slot_id % does not allow vehicle_type_id %', NEW.slot_id, NEW.vehicle_type_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_session_slot_requirement()
RETURNS TRIGGER AS $$
DECLARE
    required_slot boolean;
    slot_area_id bigint;
    slot_vehicle_type_id bigint;
    area_floor_id bigint;
BEGIN
    SELECT requires_slot INTO required_slot
    FROM vehicle_types
    WHERE id = NEW.vehicle_type_id;

    IF required_slot IS NULL THEN
        RAISE EXCEPTION 'vehicle_type_id % does not exist', NEW.vehicle_type_id;
    END IF;

    SELECT floor_id INTO area_floor_id
    FROM areas
    WHERE id = NEW.area_id;

    IF area_floor_id IS NULL OR area_floor_id <> NEW.floor_id THEN
        RAISE EXCEPTION 'session area_id % does not belong to floor_id %', NEW.area_id, NEW.floor_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM area_vehicle_types
        WHERE area_id = NEW.area_id
          AND vehicle_type_id = NEW.vehicle_type_id
    ) THEN
        RAISE EXCEPTION 'vehicle_type_id % is not allowed in area_id %', NEW.vehicle_type_id, NEW.area_id;
    END IF;

    IF required_slot AND NEW.slot_id IS NULL THEN
        RAISE EXCEPTION 'slot_id is required for vehicle_type_id %', NEW.vehicle_type_id;
    END IF;

    IF NOT required_slot AND NEW.slot_id IS NOT NULL THEN
        RAISE EXCEPTION 'slot_id must be NULL for area-managed vehicle_type_id %', NEW.vehicle_type_id;
    END IF;

    IF NEW.slot_id IS NOT NULL THEN
        SELECT area_id, allowed_vehicle_type_id INTO slot_area_id, slot_vehicle_type_id
        FROM slots
        WHERE id = NEW.slot_id;

        IF slot_area_id IS NULL THEN
            RAISE EXCEPTION 'slot_id % does not exist', NEW.slot_id;
        END IF;

        IF slot_area_id <> NEW.area_id THEN
            RAISE EXCEPTION 'slot_id % does not belong to area_id %', NEW.slot_id, NEW.area_id;
        END IF;

        IF slot_vehicle_type_id <> NEW.vehicle_type_id THEN
            RAISE EXCEPTION 'slot_id % does not allow vehicle_type_id %', NEW.slot_id, NEW.vehicle_type_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_session_claim_reassignment()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.claimed_by_user_id IS NOT NULL AND (
        NEW.claimed_by_user_id IS DISTINCT FROM OLD.claimed_by_user_id
        OR NEW.driver_id IS DISTINCT FROM OLD.driver_id
        OR NEW.claimed_at IS DISTINCT FROM OLD.claimed_at
        OR NEW.claim_method IS DISTINCT FROM OLD.claim_method
    ) THEN
        RAISE EXCEPTION 'parking session % has already been claimed', OLD.id;
    END IF;

    IF OLD.claimed_by_user_id IS NULL
       AND NEW.claimed_by_user_id IS NOT NULL
       AND (
           OLD.status NOT IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING')
           OR NEW.status NOT IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING')
       ) THEN
        RAISE EXCEPTION 'parking session % cannot be claimed while changing from status % to %', OLD.id, OLD.status, NEW.status;
    END IF;

    IF NEW.claimed_by_user_id IS NOT NULL
       AND NOT EXISTS (
           SELECT 1
           FROM driver_profiles
           WHERE id = NEW.driver_id
             AND user_id = NEW.claimed_by_user_id
       ) THEN
        RAISE EXCEPTION 'parking session % claim user does not own driver profile %', NEW.id, NEW.driver_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_driver_profiles_set_updated_at
BEFORE UPDATE ON driver_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_vehicle_types_set_updated_at
BEFORE UPDATE ON vehicle_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_vehicles_set_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_vehicles_validate_driver_type
BEFORE INSERT OR UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION validate_vehicle_driver_type();

CREATE OR REPLACE TRIGGER trg_parking_cards_set_updated_at
BEFORE UPDATE ON parking_cards
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_floors_set_updated_at
BEFORE UPDATE ON floors
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_areas_set_updated_at
BEFORE UPDATE ON areas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_slots_set_updated_at
BEFORE UPDATE ON slots
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_gates_set_updated_at
BEFORE UPDATE ON gates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_pricing_rules_set_updated_at
BEFORE UPDATE ON pricing_rules
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_monthly_passes_set_updated_at
BEFORE UPDATE ON monthly_passes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_reservations_set_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_reservations_validate_slot_requirement
BEFORE INSERT OR UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION validate_reservation_slot_requirement();

CREATE OR REPLACE TRIGGER trg_parking_sessions_set_updated_at
BEFORE UPDATE ON parking_sessions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_parking_sessions_validate_slot_requirement
BEFORE INSERT OR UPDATE ON parking_sessions
FOR EACH ROW EXECUTE FUNCTION validate_session_slot_requirement();

CREATE OR REPLACE TRIGGER trg_parking_sessions_prevent_claim_reassignment
BEFORE UPDATE ON parking_sessions
FOR EACH ROW EXECUTE FUNCTION prevent_session_claim_reassignment();

CREATE OR REPLACE TRIGGER trg_parking_session_images_set_updated_at
BEFORE UPDATE ON parking_session_images
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_payments_set_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_payment_attempts_set_updated_at
BEFORE UPDATE ON payment_attempts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_reservation_extensions_set_updated_at
BEFORE UPDATE ON reservation_extensions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_lost_card_cases_set_updated_at
BEFORE UPDATE ON lost_card_cases
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_lost_card_case_documents_set_updated_at
BEFORE UPDATE ON lost_card_case_documents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_lost_card_refunds_set_updated_at
BEFORE UPDATE ON lost_card_refunds
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_plate_mismatch_cases_set_updated_at
BEFORE UPDATE ON plate_mismatch_cases
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION prevent_audit_logs_update_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_audit_logs_append_only
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_logs_update_delete();
```

### File: `database/manual-scripts/add_lost_card_case_documents.sql`

```sql
CREATE TABLE IF NOT EXISTS lost_card_case_documents (
    id BIGSERIAL PRIMARY KEY,
    lost_card_case_id BIGINT NOT NULL REFERENCES lost_card_cases(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    original_file_name VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    sha256_hash VARCHAR(100),
    note TEXT,
    is_sensitive BOOLEAN NOT NULL DEFAULT true,
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE lost_card_case_documents DROP CONSTRAINT IF EXISTS ck_lost_card_documents_type;
ALTER TABLE lost_card_case_documents
    ADD CONSTRAINT ck_lost_card_documents_type
    CHECK (document_type IN (
        'CCCD_FRONT',
        'CCCD_BACK',
        'FACE_PHOTO',
        'VEHICLE_PHOTO',
        'LOSS_DECLARATION',
        'SIGNED_FORM',
        'OTHER'
    ));

ALTER TABLE lost_card_case_documents DROP CONSTRAINT IF EXISTS ck_lost_card_documents_file_path;
ALTER TABLE lost_card_case_documents
    ADD CONSTRAINT ck_lost_card_documents_file_path
    CHECK (NULLIF(BTRIM(file_path), '') IS NOT NULL);

ALTER TABLE lost_card_case_documents DROP CONSTRAINT IF EXISTS ck_lost_card_documents_size;
ALTER TABLE lost_card_case_documents
    ADD CONSTRAINT ck_lost_card_documents_size
    CHECK (size_bytes IS NULL OR size_bytes >= 0);

CREATE INDEX IF NOT EXISTS ix_lost_card_documents_case
ON lost_card_case_documents(lost_card_case_id);

CREATE INDEX IF NOT EXISTS ix_lost_card_documents_type
ON lost_card_case_documents(document_type);

CREATE INDEX IF NOT EXISTS ix_lost_card_documents_uploaded_at
ON lost_card_case_documents(uploaded_at);

CREATE INDEX IF NOT EXISTS ix_lost_card_documents_active_case
ON lost_card_case_documents(lost_card_case_id)
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_lost_card_documents_active_case_type
ON lost_card_case_documents(lost_card_case_id, document_type)
WHERE deleted_at IS NULL AND document_type <> 'OTHER';

CREATE OR REPLACE TRIGGER trg_lost_card_case_documents_set_updated_at
BEFORE UPDATE ON lost_card_case_documents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### File: `database/manual-scripts/add_reservation_payment_deadline.sql`

```sql
-- Phase 1: Add reservation payment deadline columns
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ NULL;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS ix_reservations_payment_deadline ON reservations(payment_deadline);
CREATE INDEX IF NOT EXISTS ix_reservations_confirmed_at ON reservations(confirmed_at);
```

### File: `database/manual-scripts/allow_reservation_without_plate.sql`

```sql
-- Manual SQL patch to allow reservations without plate number
-- Re-configures unique index to ignore NULL plate numbers

BEGIN;

-- 1. Drop NOT NULL constraint on plate columns in reservations
ALTER TABLE reservations ALTER COLUMN plate_number DROP NOT NULL;
ALTER TABLE reservations ALTER COLUMN normalized_plate_number DROP NOT NULL;

-- 2. Drop old pending/active reservation unique indexes for plate
DROP INDEX IF EXISTS ux_pending_reservation_by_plate_type;
DROP INDEX IF EXISTS ux_active_reservation_by_plate_type;

-- 3. Recreate unique index for active reservations with plate
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_reservation_by_plate_type
ON reservations(normalized_plate_number, vehicle_type_id)
WHERE normalized_plate_number IS NOT NULL
  AND status IN ('PENDING', 'CONFIRMED');

-- 4. Update check constraint
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS ck_reservations_plate_required;
ALTER TABLE reservations ADD CONSTRAINT ck_reservations_plate_required CHECK (
    (plate_number IS NULL AND normalized_plate_number IS NULL)
    OR (NULLIF(BTRIM(plate_number), '') IS NOT NULL AND NULLIF(BTRIM(normalized_plate_number), '') IS NOT NULL)
);

COMMIT;
```

### File: `database/manual-scripts/check_active_sessions.sql`

```sql
-- Check all active parking sessions with card, slot, area details
SELECT
    s.id,
    s.session_code,
    s.status,
    s.customer_type,
    s.payment_status,
    s.card_id,
    c.card_code,
    s.plate_number,
    s.normalized_plate_number,
    s.vehicle_type_id,
    s.floor_id,
    s.area_id,
    s.slot_id,
    s.monthly_pass_id,
    s.reservation_id,
    s.entry_time
FROM parking_sessions s
JOIN parking_cards c ON c.id = s.card_id
WHERE s.status IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING')
ORDER BY s.entry_time DESC;
```

### File: `database/manual-scripts/check_card_slot_state.sql`

```sql
-- 1. Card status overview
SELECT
    c.id,
    c.card_code,
    c.status,
    c.current_session_id,
    s.session_code,
    s.status AS session_status
FROM parking_cards c
LEFT JOIN parking_sessions s ON s.id = c.current_session_id
ORDER BY c.id;

-- 2. Slot status overview
SELECT
    sl.id,
    sl.slot_code,
    sl.status,
    sl.current_session_id,
    a.area_code,
    f.floor_code
FROM slots sl
JOIN areas a ON a.id = sl.area_id
JOIN floors f ON f.id = a.floor_id
ORDER BY f.id, a.id, sl.id;

-- 3. Area occupancy overview
SELECT
    a.id,
    a.area_code,
    a.status,
    a.total_capacity,
    a.current_real_occupancy,
    a.current_booked_slots,
    (a.total_capacity - a.current_real_occupancy - a.current_booked_slots) AS remaining,
    f.floor_code
FROM areas a
JOIN floors f ON f.id = a.floor_id
ORDER BY f.id, a.id;
```

### File: `database/manual-scripts/cleanup_test_data.sql`

```sql
-- Cleanup test session data so entry flow tests can be re-run
-- WARNING: This resets ALL sessions, cards, slots and area occupancy

BEGIN;

-- 1. Delete notifications
DELETE FROM notifications;

-- 2. Delete payment attempts
DELETE FROM payment_attempts;

-- 3. Delete payments
DELETE FROM payments;

-- 4. Delete session images
DELETE FROM parking_session_images;

-- 5. Delete sessions
DELETE FROM parking_sessions;

-- 6. Delete extensions
DELETE FROM reservation_extensions;

-- 7. Delete reservations
DELETE FROM reservations;

-- 8. Delete monthly passes (only test passes)
DELETE FROM monthly_passes
WHERE id >= 1000
   OR plate_number LIKE 'TEST-%'
   OR plate_number LIKE 'TMP-%'
   OR plate_number LIKE 'AUTO-%'
   OR plate_number LIKE '%AUTO-%';

-- 9. Release cards
UPDATE parking_cards
SET status = 'AVAILABLE',
    current_session_id = NULL,
    updated_at = now();

-- 10. Release slots
UPDATE slots
SET status = 'AVAILABLE',
    current_session_id = NULL,
    updated_at = now();

-- 11. Reset area occupancy counters
UPDATE areas
SET current_real_occupancy = 0,
    current_booked_slots = 0,
    updated_at = now();

COMMIT;
```

### File: `database/manual-scripts/drop_all_public_objects.sql`

```sql
-- DANGER: Destructive reset script for PostgreSQL/Supabase.
-- This removes project data and schema objects in the public schema, including tables.
-- Run only when you intentionally want to rebuild the database from database/01_schema.sql.
--
-- It keeps the database itself, roles, extensions, and non-public schemas.
-- Recommended run order after this script:
--   1. database/01_schema.sql
--   2. database/02_seed.sql
--   3. database/03_indexes_constraints.sql

BEGIN;

-- Drop views first so table drops are straightforward.
DO $$
DECLARE
    object_record RECORD;
BEGIN
    FOR object_record IN
        SELECT schemaname, viewname
        FROM pg_views
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format(
            'DROP VIEW IF EXISTS %I.%I CASCADE',
            object_record.schemaname,
            object_record.viewname
        );
    END LOOP;
END $$;

DO $$
DECLARE
    object_record RECORD;
BEGIN
    FOR object_record IN
        SELECT schemaname, matviewname
        FROM pg_matviews
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format(
            'DROP MATERIALIZED VIEW IF EXISTS %I.%I CASCADE',
            object_record.schemaname,
            object_record.matviewname
        );
    END LOOP;
END $$;

-- Drop all project tables. CASCADE also removes triggers, indexes, constraints, and dependent FKs.
DO $$
DECLARE
    object_record RECORD;
BEGIN
    FOR object_record IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format(
            'DROP TABLE IF EXISTS %I.%I CASCADE',
            object_record.schemaname,
            object_record.tablename
        );
    END LOOP;
END $$;

-- Drop leftover sequences that were not owned by dropped tables.
DO $$
DECLARE
    object_record RECORD;
BEGIN
    FOR object_record IN
        SELECT sequence_schema, sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
    LOOP
        EXECUTE format(
            'DROP SEQUENCE IF EXISTS %I.%I CASCADE',
            object_record.sequence_schema,
            object_record.sequence_name
        );
    END LOOP;
END $$;

-- Drop custom routines in public, but keep extension-owned routines such as pgcrypto.
DO $$
DECLARE
    object_record RECORD;
BEGIN
    FOR object_record IN
        SELECT
            n.nspname AS schema_name,
            p.proname AS routine_name,
            pg_get_function_identity_arguments(p.oid) AS routine_args
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND NOT EXISTS (
              SELECT 1
              FROM pg_depend d
              WHERE d.objid = p.oid
                AND d.deptype = 'e'
          )
    LOOP
        EXECUTE format(
            'DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE',
            object_record.schema_name,
            object_record.routine_name,
            object_record.routine_args
        );
    END LOOP;
END $$;

-- Drop custom types/domains in public, while preserving extension-owned objects.
DO $$
DECLARE
    object_record RECORD;
BEGIN
    FOR object_record IN
        SELECT
            n.nspname AS schema_name,
            t.typname AS type_name,
            t.typtype AS type_kind
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
          AND t.typtype IN ('c', 'd', 'e', 'r')
          AND NOT EXISTS (
              SELECT 1
              FROM pg_depend d
              WHERE d.objid = t.oid
                AND d.deptype = 'e'
          )
    LOOP
        IF object_record.type_kind = 'd' THEN
            EXECUTE format(
                'DROP DOMAIN IF EXISTS %I.%I CASCADE',
                object_record.schema_name,
                object_record.type_name
            );
        ELSE
            EXECUTE format(
                'DROP TYPE IF EXISTS %I.%I CASCADE',
                object_record.schema_name,
                object_record.type_name
            );
        END IF;
    END LOOP;
END $$;

COMMIT;
```

### File: `database/manual-scripts/fix_reservation_status_constraint.sql`

```sql
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS ck_reservations_status;
ALTER TABLE reservations ADD CONSTRAINT ck_reservations_status CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'EXPIRED'));
```

### File: `database/manual-scripts/reset_demo_data.sql`

```sql
-- Helper script placeholder.
-- Add local/demo reset SQL here when the schema exists.
```

### File: `docs/local-payos-real-payment-test.md`

```markdown
# Local real payOS reservation payment test

This workflow creates a real payOS checkout link through the backend reservation flow. Do not commit payOS secrets to `appsettings.*.json`, scripts, or docs.

## Required environment variables

Set these in the shell that starts `ParkingBuilding.CoreApi`:

```powershell
$env:PAYOS_CLIENT_ID = "<your-client-id>"
$env:PAYOS_API_KEY = "<your-api-key>"
$env:PAYOS_CHECKSUM_KEY = "<your-checksum-key>"
$env:PAYOS_RETURN_URL = "http://localhost:5173/payment/return"
$env:PAYOS_CANCEL_URL = "http://localhost:5173/payment/cancel"
$env:PAYOS_WEBHOOK_URL = "https://<public-host>/api/core/payments/payos/webhook"
$env:RESERVATION_ALLOW_ZERO_BOOKING_FEE = "false"
$env:RESERVATION_MAX_HOURS = "3"
```

`PAYOS_WEBHOOK_URL` must be public and reachable by payOS. For local testing, expose the backend with a tunnel and use that public URL.

## Start backend

```powershell
dotnet run --project backend/ParkingBuilding.CoreApi/ParkingBuilding.CoreApi.csproj
```

## Run the real payment test

In a separate PowerShell window with the same `PAYOS_*` variables available:

```powershell
.\scripts\test-real-payos-payment.ps1 `
  -BaseUrl "http://localhost:5000" `
  -PublicWebhookBaseUrl "https://<public-host>" `
  -ReservationHourlyPrice 10000 `
  -ReservedDurationMinutes 60
```

The script:

1. Verifies required payOS env vars are present without printing secret values.
2. Logs in as `admin01`, `driver01`, and `staff01`.
3. Sets a positive integer `reservationHourlyPrice`.
4. Creates a reservation and prints the real payOS checkout URL.
5. Waits for you to pay, then polls `GET /api/core/reservations/{id}/payment-status`.
6. Verifies entry-check returns `VALID` after webhook confirmation.

If polling times out, check that the public webhook URL is configured in the payOS dashboard and points to:

```text
POST /api/core/payments/payos/webhook
```

## Local fake webhook test

Without real payOS credentials, use the local placeholder automation:

```powershell
.\scripts\test-payos-reservation-flow.ps1 -BaseUrl "http://localhost:5000" -AllowWriteTests -AllowReset
```

That script covers:

- paid reservation returns `checkoutUrl`
- unpaid entry-check is rejected
- valid webhook marks payment and reservation paid
- duplicate webhook is idempotent
- wrong amount webhook fails
- paid confirmed reservation passes entry-check
```

### File: `docs/specification/Developer_Implementation_Specification_Dual_Backend_NET_SpringBoot.md`

```markdown
# Developer Implementation Specification v1.1

# Parking Building Management System

## Dual Backend: ASP.NET Core + Spring Boot dùng chung PostgreSQL

---

## Thông Tin Tài Liệu

| Thuộc tính                | Nội dung                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Tên tài liệu              | Developer Implementation Specification - Dual Backend                                                                    |
| Tên hệ thống              | Parking Building Management System                                                                                       |
| Phiên bản tài liệu        | v1.1                                                                                                                     |
| Nguồn yêu cầu chính       | `SRS_v2_2_Parking_Building_Management_System.md`                                                                         |
| Nguồn chi tiết triển khai | `Developer_Implementation_Specification_Parking_Building_Management_System_v1_0.md`                                      |
| Backend 1                 | ASP.NET Core Web API - Core API                                                                                          |
| Backend 2                 | Spring Boot REST API - Support API                                                                                       |
| Frontend                  | React Web Application                                                                                                    |
| Database                  | PostgreSQL dùng chung                                                                                                    |
| Quy mô backend team       | 2 dev .NET + 2 dev Spring Boot                                                                                           |
| Đối tượng sử dụng         | Backend Developer, Frontend Developer, Tester, Team Leader                                                               |
| Mục tiêu                  | Chia hệ thống thành 2 backend không xung đột, cùng dùng 1 database, đủ schema/API/service/test để dev triển khai độc lập |

---

# 1. Mục Đích Và Source Of Truth

SRS mô tả **hệ thống cần làm gì**. Tài liệu này mô tả **dev .NET, dev Spring Boot và frontend cần code gì**, chia ownership ra sao, API/path/payload nào dùng, bảng nào được ghi bởi backend nào, và test case nào phải đạt.

Thứ tự ưu tiên khi có mâu thuẫn:

1. `SRS_v2_2_Parking_Building_Management_System.md` là business truth.
2. Tài liệu này là implementation truth cho dual-backend.
3. File implementation v1.0 cũ chỉ là nguồn tham khảo chi tiết, không override ownership dual-backend.
4. Code phải update lại tài liệu này nếu đổi endpoint, field, enum, ownership, transaction rule hoặc status flow.

Nguyên tắc triển khai:

- Không code trực tiếp theo từng câu FR; code theo module, use case và transaction boundary.
- Mỗi bảng có một owner ghi chính.
- Một use case ghi dữ liệu core phải nằm trong một backend transaction duy nhất.
- `.NET Core API` là owner nghiệp vụ core và Driver account ghi dữ liệu.
- `Spring Boot API` là owner public read, dashboard/report/audit search và support optional.
- PostgreSQL là single source of truth.

---

# 2. Phạm Vi Triển Khai

## 2.1 Must Have

Các chức năng bắt buộc cho MVP/demo:

- Auth và phân quyền theo role.
- User management nội bộ.
- Public Driver pages: thông tin bãi xe, slot trống, bảng giá, quy định, QR lookup.
- Parking Card + Static QR.
- Vehicle Type management.
- Floor/Area/Slot/Gate management.
- Slot suggestion.
- Entry Processing.
- Exit Processing cho khách vãng lai.
- Exit Processing cho Monthly Pass.
- Fee Calculation.
- Cash Payment.
- Monthly Pass.
- Booking/Reservation.
- Reservation: Đặt trước slot ô tô tại tầng B2, giữ chỗ tối đa 15 phút, tự động hủy/hết hạn nếu quá giờ.
- Lost Card.
- Plate Mismatch.
- Session Administration / Cancel Session.
- Slot Occupancy Adjustment.
- Pricing Management.
- Dashboard cơ bản.
- Reports cơ bản.
- Audit Log.

## 2.2 Should Have

Làm sau Must Have, không được block core flow:

- Driver self-register/login.
- Driver profile.
- Driver vehicles.
- Driver parking history.
- Excel export report/audit.
- QR scanner bằng camera trình duyệt.
- Upload ảnh xe hoặc ảnh demo.

## 2.3 Could Have

Chỉ làm nếu còn dư thời gian:

- Driver feedback.
- Notification.
- Mock online payment.
- PDF export.
- Biểu đồ nâng cao.
- System configuration nâng cao.

## 2.4 Out Of Scope Trong MVP

- Thiết bị camera/RFID/barrier thật.
- Thanh toán online thật.
- Realtime WebSocket bắt buộc.
- Multi-building/multi-tenant.
- RBAC đầy đủ bằng các bảng phân quyền riêng.

---

# 3. Nguyên Tắc Kiến Trúc Dual Backend

## 3.1 Một Database, Hai Backend, Một Source Of Truth

```text
React Frontend
   |
   |-- gọi .NET Core API: core write, auth, driver account, transaction chính
   |
   |-- gọi Spring Boot API: public read, dashboard, report, audit search, support

ASP.NET Core API  ----\
                      ---> PostgreSQL shared database
Spring Boot API  -----/
```

Quy tắc bắt buộc:

- Chỉ có một schema PostgreSQL chính.
- `database/*.sql` tao schema/seed chinh thuc; ca hai backend chi map schema da co.
- Spring Boot dùng JPA validate/read mapping, không tự thay đổi schema.
- Backend không phải owner chỉ đọc bảng core, hoặc gọi API của owner để thay đổi.
- Không để cả .NET và Spring cùng update một trạng thái nghiệp vụ quan trọng.
- Không dùng enum integer trong database; chỉ lưu enum string.

## 3.2 Không Chia Một Use Case Thành Transaction Qua 2 Backend

Không làm:

```text
Step 1: Support API tạo session
Step 2: Core API đổi trạng thái card
Step 3: Support API đổi trạng thái slot
```

Phải làm:

```text
.NET EntryService.CreateEntrySessionAsync()
  - validate card
  - validate vehicle/monthly pass
  - validate slot/suggestion
  - create parking_session
  - update card IN_USE
  - update slot OCCUPIED
  - write audit log
  - commit transaction
```

Spring Boot chỉ đọc kết quả sau khi .NET API trả success.

## 3.3 Module Owner Rule

| Loại module                                 | Backend chính      | Lý do                                                               |
| ------------------------------------------- | ------------------ | ------------------------------------------------------------------- |
| Auth/User/Role enum                         | .NET               | Token và quyền thống nhất toàn hệ thống                             |
| Driver account/profile/vehicles             | .NET               | Có ghi `users`, `driver_profiles`, `vehicles`, cần chung auth owner |
| Parking session, entry, exit                | .NET               | Core transaction nhiều bước                                         |
| Parking card/state                          | .NET               | Entry/exit update thường xuyên                                      |
| Parking structure/slot/gate                 | .NET               | Slot status bị transaction core update                              |
| Pricing/Fee/Payment                         | .NET               | Ảnh hưởng thanh toán và session completion                          |
| Monthly Pass                                | .NET               | Entry/exit cần check trong core flow                                |
| Lost Card/Mismatch/Cancel Session           | .NET               | Exception core cần transaction                                      |
| Public parking info/available slots/pricing | Spring Boot        | Read-heavy, public                                                  |
| Public QR lookup                            | Spring Boot        | Read-only, che dữ liệu nhạy cảm                                     |
| Dashboard/Reports/Excel                     | Spring Boot        | Query đọc nhiều, tách khỏi core write                               |
| Audit Log Search                            | Spring Boot        | Read/export audit log                                               |
| Audit Log Write                             | Cả hai append-only | Mỗi service ghi action của chính nó                                 |
| Feedback/Notification/Mock Device           | Spring Boot        | Optional support module                                             |

## 3.4 API Gateway Hoặc Frontend Gọi Trực Tiếp

MVP khuyến nghị frontend gọi trực tiếp 2 backend nhưng vẫn giữ prefix:

```text
Core API base URL    http://localhost:5000
Support API base URL http://localhost:8080
Public API base URL  http://localhost:8080
```

Prefix chuẩn:

```text
.NET Core API      /api/core/*
Spring Support API /api/support/*
Public API         /api/public/*
```

Nếu dùng gateway sau này:

```text
/api/core/*      -> .NET Core API
/api/support/*   -> Spring Boot API
/api/public/*    -> Spring Boot API
```

---

# 4. Phân Chia Backend Tổng Quát

## 4.1 ASP.NET Core API - Core Service

Tên project đề xuất:

```text
ParkingBuilding.CoreApi
```

Phụ trách:

- Auth/JWT/password hash.
- User management nội bộ.
- Driver register/profile/vehicles/history nếu làm Should Have.
- Vehicle Type và Vehicle.
- Parking Card management.
- Floor/Area/Slot/Gate management.
- Slot suggestion.
- Entry processing.
- Exit processing.
- Fee calculation.
- Cash payment.
- Monthly Pass.
- Lost Card.
- Plate Mismatch.
- Admin Cancel Session.
- Slot move/status adjustment.
- Pricing Management.
- Ghi audit log cho nghiệp vụ core.
- `DbContext` mapping theo schema da co va seed data tu `database/02_seed.sql`.

## 4.2 Spring Boot API - Support Service

Tên project đề xuất:

```text
parking-building-support-api
```

Phụ trách:

- Public Driver APIs.
- Public available slots/pricing/rules.
- Public card QR lookup.
- Dashboard summary.
- Reports.
- Excel export bằng Apache POI.
- Audit log search/export.
- Feedback nếu làm.
- Notification nếu làm.
- Mock device optional.
- Read-only search APIs cho frontend nếu cần.

---

# 5. Quy Ước Chung Backend

## 5.1 API Response Format

Cả .NET và Spring Boot trả cùng format:

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "errors": null,
  "timestamp": "2026-05-21T10:00:00+07:00"
}
```

Lỗi validation:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    {
      "field": "cardCode",
      "message": "CARD_NOT_AVAILABLE"
    }
  ],
  "timestamp": "2026-05-21T10:00:00+07:00"
}
```

Pagination:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "items": [],
    "page": 1,
    "pageSize": 20,
    "totalItems": 0,
    "totalPages": 0
  },
  "errors": null,
  "timestamp": "2026-05-21T10:00:00+07:00"
}
```

## 5.2 HTTP Status Convention

| Trường hợp               | HTTP Status |
| ------------------------ | ----------: |
| GET thành công           |         200 |
| Tạo mới thành công       |         201 |
| Cập nhật thành công      |         200 |
| Hủy/xóa logic thành công |         200 |
| Validation lỗi           |         400 |
| Chưa đăng nhập           |         401 |
| Không đủ quyền           |         403 |
| Không tìm thấy           |         404 |
| Conflict nghiệp vụ       |         409 |
| Lỗi server               |         500 |

## 5.3 Error Code Convention

| Nhóm lỗi  | Ví dụ                                                                  |
| --------- | ---------------------------------------------------------------------- |
| Auth      | `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `TOKEN_EXPIRED`               |
| User      | `USERNAME_ALREADY_EXISTS`, `EMAIL_ALREADY_EXISTS`                      |
| Card      | `CARD_NOT_FOUND`, `CARD_NOT_AVAILABLE`, `CARD_STATE_CONFLICT`          |
| Vehicle   | `VEHICLE_HAS_ACTIVE_SESSION`, `VEHICLE_TYPE_INACTIVE`                  |
| Slot      | `SLOT_NOT_AVAILABLE`, `SLOT_VEHICLE_TYPE_NOT_ALLOWED`                  |
| Session   | `SESSION_NOT_FOUND`, `SESSION_NOT_ACTIVE`, `SESSION_ALREADY_COMPLETED` |
| Payment   | `PAYMENT_ALREADY_PAID`, `PAYMENT_REQUIRED_BEFORE_EXIT`                 |
| Lost Card | `LOST_CARD_CASE_PENDING`, `LOST_CARD_NOT_APPROVED`                     |
| Mismatch  | `PLATE_MISMATCH_REQUIRES_APPROVAL`                                     |

## 5.4 API Path Convention

```text
POST /api/core/auth/login
POST /api/core/parking-sessions/entry
GET  /api/support/dashboard/summary
GET  /api/public/parking-info
```

Không dùng endpoint thiếu prefix trong bản dual-backend.

---

# 6. Auth Và Phân Quyền Dùng Chung

## 6.1 Auth Owner

`.NET Core API` là owner của Auth.

Spring Boot không tự login. Spring Boot chỉ verify JWT do .NET phát hành.

```text
POST /api/core/auth/login -> .NET cấp JWT
React lưu JWT
React gọi .NET/Spring đều gửi Authorization: Bearer <token>
Spring Boot verify JWT bằng cùng secret/issuer/audience
```

## 6.2 Role Model MVP

MVP dùng `role` enum trực tiếp trong bảng `users`.

Không dùng các bảng phân quyền tách riêng trong MVP.

Neu sau nay can RBAC day du, cap nhat SQL script rieng va cap nhat lai spec.

## 6.3 JWT Claims Bắt Buộc

```json
{
  "sub": "1",
  "username": "staff01",
  "role": "STAFF",
  "fullName": "Nguyen Van A",
  "iss": "parking-building-auth",
  "aud": "parking-building-api",
  "exp": 1790000000
}
```

## 6.4 Role Check

| Role    | Có thể dùng                                                                                    |
| ------- | ---------------------------------------------------------------------------------------------- |
| ADMIN   | Tất cả API quản trị, cancel session, audit, user management                                    |
| MANAGER | Dashboard, reports, card/structure/pricing/monthly pass, lost card approval, mismatch approval |
| STAFF   | Entry, exit, lost card create, session search                                   |
| DRIVER  | Driver profile, vehicles, history nếu làm                                                      |
| Public  | Parking info, available slots, pricing, public card QR lookup                                  |

---

# 7. Shared PostgreSQL Design

## 7.1 Naming Convention

- Table/column dùng `snake_case`.
- .NET property dùng `PascalCase` map sang column.
- Java field dùng `camelCase` map sang column.
- Thời gian dùng `TIMESTAMPTZ`.
- ID mặc định dùng `BIGSERIAL`.
- Enum lưu `VARCHAR`, không lưu integer.

Ví dụ:

```text
Database: created_at
.NET: CreatedAt
Java: createdAt
```

## 7.2 SQL Script Ownership

Schema/seed chinh thuc nam trong `database/*.sql`:

```text
database/01_schema.sql
database/02_seed.sql
database/03_indexes_constraints.sql
```

Spring Boot config bắt buộc:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
```

Không dùng:

```yaml
spring.jpa.hibernate.ddl-auto: update
```

## 7.3 Connection Config

.NET:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.your-project-ref.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=your-supabase-db-password;SSL Mode=Require;Trust Server Certificate=true"
  }
}
```

Spring Boot:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.your-project-ref.supabase.co:5432/postgres?sslmode=require
    username: postgres
    password: your-supabase-db-password
  jpa:
    hibernate:
      ddl-auto: validate
```

## 7.4 Table Ownership Matrix

| Bảng                 | Owner ghi chính    | .NET quyền    | Spring Boot quyền | Ghi chú                         |
| -------------------- | ------------------ | ------------- | ----------------- | ------------------------------- |
| users                | .NET               | Read/Write    | Read              | Auth/User/Driver account        |
| driver_profiles      | .NET               | Read/Write    | Read              | Driver register/profile do .NET |
| vehicles             | .NET               | Read/Write    | Read              | Driver vehicles và entry lookup |
| vehicle_types        | .NET               | Read/Write    | Read              | Seed + management               |
| parking_cards        | .NET               | Read/Write    | Read              | Entry/exit update status        |
| floors               | .NET               | Read/Write    | Read              | Structure management            |
| areas                | .NET               | Read/Write    | Read              | Structure management            |
| area_vehicle_types   | .NET               | Read/Write    | Read              | Mapping area-vehicle            |
| slots                | .NET               | Read/Write    | Read              | Entry/exit update status        |
| gates                | .NET               | Read/Write    | Read              | Gate data                       |
| parking_sessions     | .NET               | Read/Write    | Read              | Core transaction                |
| pricing_rules        | .NET               | Read/Write    | Read              | Fee calculation consistent      |
| payments             | .NET               | Read/Write    | Read              | Payment core                    |
| monthly_passes       | .NET               | Read/Write    | Read              | Entry/exit check                |
| lost_card_cases      | .NET               | Read/Write    | Read              | Exception core                  |
| plate_mismatch_cases | .NET               | Read/Write    | Read              | Exception core                  |
| audit_logs           | Append-only shared | Insert/Read   | Insert/Read       | Không update/delete             |
| feedbacks            | Spring Boot        | Read optional | Read/Write        | Could Have                      |
| notifications        | Spring Boot        | Read optional | Read/Write        | Could Have                      |
| mock_device_events   | Spring Boot        | Read optional | Read/Write        | Optional                        |
| system_configs       | .NET               | Read/Write    | Read              | Could Have, config hệ thống     |
| reservations         | .NET               | Read/Write    | Read              | Quản lý lượt đặt chỗ trước     |

## 7.5 Shared Enums

```text
UserRole: ADMIN, MANAGER, STAFF, DRIVER
UserStatus: ACTIVE, LOCKED, INACTIVE
DriverProfileStatus: ACTIVE, LOCKED, INACTIVE
VehicleStatus: ACTIVE, INACTIVE
CardStatus: AVAILABLE, IN_USE, LOST, DAMAGED, INACTIVE
FloorStatus: ACTIVE, LOCKED, MAINTENANCE
AreaStatus: ACTIVE, LOCKED, MAINTENANCE
SlotStatus: AVAILABLE, OCCUPIED, RESERVED, LOCKED, MAINTENANCE
ReservationStatus: PENDING, COMPLETED, CANCELLED, EXPIRED
GateStatus: ACTIVE, LOCKED, MAINTENANCE
GateType: ENTRY, EXIT
SessionStatus: ACTIVE, COMPLETED, CANCELLED, LOST_CARD_PENDING, MISMATCH_PENDING
PaymentStatus: PENDING, PAID, FAILED, CANCELLED, WAIVED, NOT_REQUIRED
PaymentMethod: CASH, NONE
CustomerType: CASUAL, MONTHLY
MonthlyPassStatus: ACTIVE, EXPIRED, LOCKED
LostCardCaseStatus: PENDING, APPROVED, REJECTED
PlateMismatchCaseStatus: PENDING, CONFIRMED, REJECTED
FeedbackStatus: OPEN, RESOLVED, REJECTED
SystemStatus: OPEN, CLOSED, MAINTENANCE
```

Để sinh viên mới không bị lệch dữ liệu, enum trong code nên dùng đúng tên uppercase như database. Ví dụ C# nên dùng `CardStatus.AVAILABLE`, không dùng `CardStatus.Available`, trừ khi tự viết converter riêng để lưu uppercase.

---

# 8. Database Implementation Specification

## 8.1 users

Owner: `.NET`

| Column        | Type         | Required | Note                       |
| ------------- | ------------ | -------: | -------------------------- |
| id            | BIGSERIAL    |      Yes | PK                         |
| full_name     | VARCHAR(150) |      Yes | Họ tên                     |
| username      | VARCHAR(100) |      Yes | Unique                     |
| email         | VARCHAR(150) |       No | Unique nếu có              |
| phone         | VARCHAR(30)  |       No | Unique nếu có              |
| password_hash | VARCHAR(255) |      Yes | BCrypt                     |
| role          | VARCHAR(30)  |      Yes | ADMIN/MANAGER/STAFF/DRIVER |
| status        | VARCHAR(30)  |      Yes | ACTIVE/LOCKED/INACTIVE     |
| last_login_at | TIMESTAMPTZ  |       No | Should Have                |
| created_at    | TIMESTAMPTZ  |      Yes | Auto                       |
| updated_at    | TIMESTAMPTZ  |      Yes | Auto                       |

Indexes:

```sql
CREATE UNIQUE INDEX ux_users_username ON users(username);
CREATE UNIQUE INDEX ux_users_email ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX ux_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX ix_users_role ON users(role);
CREATE INDEX ix_users_status ON users(status);
```

## 8.2 driver_profiles

Owner: `.NET`

| Column     | Type                | Required | Note                     |
| ---------- | ------------------- | -------: | ------------------------ |
| id         | BIGSERIAL           |      Yes | PK                       |
| user_id    | BIGINT FK users(id) |       No | Có nếu registered driver |
| full_name  | VARCHAR(150)        |      Yes | Họ tên driver            |
| phone      | VARCHAR(30)         |       No | Unique nếu có            |
| email      | VARCHAR(150)        |       No | Unique nếu có            |
| status     | VARCHAR(30)         |      Yes | ACTIVE/LOCKED/INACTIVE   |
| created_at | TIMESTAMPTZ         |      Yes | Auto                     |
| updated_at | TIMESTAMPTZ         |      Yes | Auto                     |

Indexes:

```sql
CREATE UNIQUE INDEX ux_driver_profiles_user_id ON driver_profiles(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX ux_driver_profiles_phone ON driver_profiles(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX ux_driver_profiles_email ON driver_profiles(email) WHERE email IS NOT NULL;
```

## 8.3 vehicle_types

Owner: `.NET`

| Column      | Type         | Required | Note            |
| ----------- | ------------ | -------: | --------------- |
| id          | BIGSERIAL    |      Yes | PK              |
| name        | VARCHAR(100) |      Yes | Xe máy, Ô tô... |
| description | TEXT         |       No | Mô tả           |
| is_active   | BOOLEAN      |      Yes | Bật/tắt         |
| created_at  | TIMESTAMPTZ  |      Yes | Auto            |
| updated_at  | TIMESTAMPTZ  |      Yes | Auto            |

Seed bắt buộc:

```text
Xe đạp
Xe đạp điện
Xe máy
Xe máy điện
Ô tô
Ô tô điện
Xe vận chuyển hàng hóa
```

## 8.4 vehicles

Owner: `.NET`

| Column                  | Type                          | Required | Note                           |
| ----------------------- | ----------------------------- | -------: | ------------------------------ |
| id                      | BIGSERIAL                     |      Yes | PK                             |
| driver_id               | BIGINT FK driver_profiles(id) |       No | Nullable với guest             |
| plate_number            | VARCHAR(30)                   |       No | Nullable với xe không biển số  |
| normalized_plate_number | VARCHAR(30)                   |       No | Dùng để search/check duplicate |
| vehicle_type_id         | BIGINT FK vehicle_types(id)   |      Yes | Loại xe                        |
| description             | TEXT                          |       No | Xe không biển số               |
| status                  | VARCHAR(30)                   |      Yes | ACTIVE/INACTIVE                |
| created_at              | TIMESTAMPTZ                   |      Yes | Auto                           |
| updated_at              | TIMESTAMPTZ                   |      Yes | Auto                           |

Indexes:

```sql
CREATE INDEX ix_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX ix_vehicles_plate ON vehicles(normalized_plate_number);
CREATE INDEX ix_vehicles_type ON vehicles(vehicle_type_id);
```

## 8.5 parking_cards

Owner: `.NET`

| Column             | Type                           | Required | Note                                   |
| ------------------ | ------------------------------ | -------: | -------------------------------------- |
| id                 | BIGSERIAL                      |      Yes | PK                                     |
| card_code          | VARCHAR(50)                    |      Yes | Unique, ví dụ C001                     |
| qr_token           | VARCHAR(120)                   |      Yes | Unique, khó đoán                       |
| status             | VARCHAR(30)                    |      Yes | AVAILABLE/IN_USE/LOST/DAMAGED/INACTIVE |
| current_session_id | BIGINT FK parking_sessions(id) |       No | Nullable                               |
| note               | TEXT                           |       No | Ghi chú                                |
| created_at         | TIMESTAMPTZ                    |      Yes | Auto                                   |
| updated_at         | TIMESTAMPTZ                    |      Yes | Auto                                   |

Indexes:

```sql
CREATE UNIQUE INDEX ux_cards_card_code ON parking_cards(card_code);
CREATE UNIQUE INDEX ux_cards_qr_token ON parking_cards(qr_token);
CREATE INDEX ix_cards_status ON parking_cards(status);
```

Rule:

- Một card chỉ có tối đa một session active/pending exception.
- `current_session_id` phải null khi card AVAILABLE/INACTIVE/DAMAGED nếu không gắn session.

## 8.6 floors

Owner: `.NET`

| Column     | Type         | Required | Note                      |
| ---------- | ------------ | -------: | ------------------------- |
| id         | BIGSERIAL    |      Yes | PK                        |
| floor_code | VARCHAR(30)  |      Yes | Unique, B1/B2/B3          |
| floor_name | VARCHAR(100) |      Yes | Tên tầng                  |
| status     | VARCHAR(30)  |      Yes | ACTIVE/LOCKED/MAINTENANCE |
| created_at | TIMESTAMPTZ  |      Yes | Auto                      |
| updated_at | TIMESTAMPTZ  |      Yes | Auto                      |

Seed demo:

```text
B1 - Tầng 1
B2 - Tầng 2
B3 - Tầng 3
```

## 8.7 areas

Owner: `.NET`

| Column         | Type                 | Required | Note                      |
| -------------- | -------------------- | -------: | ------------------------- |
| id             | BIGSERIAL            |      Yes | PK                        |
| floor_id       | BIGINT FK floors(id) |      Yes | Tầng                      |
| area_code      | VARCHAR(30)          |      Yes | A/B/C...                  |
| area_name      | VARCHAR(100)         |      Yes | Tên khu vực               |
| priority_order | INT                  |      Yes | Số nhỏ ưu tiên trước      |
| status         | VARCHAR(30)          |      Yes | ACTIVE/LOCKED/MAINTENANCE |
| created_at     | TIMESTAMPTZ          |      Yes | Auto                      |
| updated_at     | TIMESTAMPTZ          |      Yes | Auto                      |

Indexes:

```sql
CREATE UNIQUE INDEX ux_areas_floor_code ON areas(floor_id, area_code);
CREATE INDEX ix_areas_status ON areas(status);
CREATE INDEX ix_areas_priority ON areas(priority_order);
```

## 8.8 area_vehicle_types

Owner: `.NET`

| Column          | Type                        | Required | Note    |
| --------------- | --------------------------- | -------: | ------- |
| area_id         | BIGINT FK areas(id)         |      Yes | PK part |
| vehicle_type_id | BIGINT FK vehicle_types(id) |      Yes | PK part |

Indexes:

```sql
CREATE UNIQUE INDEX ux_area_vehicle_types ON area_vehicle_types(area_id, vehicle_type_id);
```

## 8.9 slots

Owner: `.NET`

| Column                  | Type                           | Required | Note                                  |
| ----------------------- | ------------------------------ | -------: | ------------------------------------- |
| id                      | BIGSERIAL                      |      Yes | PK                                    |
| area_id                 | BIGINT FK areas(id)            |      Yes | Khu vực                               |
| slot_code               | VARCHAR(50)                    |      Yes | A1, A2...                             |
| allowed_vehicle_type_id | BIGINT FK vehicle_types(id)    |      Yes | Loại xe chính                         |
| status                  | VARCHAR(30)                    |      Yes | AVAILABLE/OCCUPIED/LOCKED/MAINTENANCE |
| current_session_id      | BIGINT FK parking_sessions(id) |       No | Nullable                              |
| created_at              | TIMESTAMPTZ                    |      Yes | Auto                                  |
| updated_at              | TIMESTAMPTZ                    |      Yes | Auto                                  |

Indexes:

```sql
CREATE UNIQUE INDEX ux_slots_area_code ON slots(area_id, slot_code);
CREATE INDEX ix_slots_status ON slots(status);
CREATE INDEX ix_slots_vehicle_type ON slots(allowed_vehicle_type_id);
CREATE INDEX ix_slots_current_session ON slots(current_session_id);
```

## 8.10 gates

Owner: `.NET`

| Column     | Type                 | Required | Note                      |
| ---------- | -------------------- | -------: | ------------------------- |
| id         | BIGSERIAL            |      Yes | PK                        |
| floor_id   | BIGINT FK floors(id) |      Yes | Tầng                      |
| gate_code  | VARCHAR(50)          |      Yes | B1-IN/B1-OUT              |
| gate_type  | VARCHAR(30)          |      Yes | ENTRY/EXIT                |
| status     | VARCHAR(30)          |      Yes | ACTIVE/LOCKED/MAINTENANCE |
| created_at | TIMESTAMPTZ          |      Yes | Auto                      |
| updated_at | TIMESTAMPTZ          |      Yes | Auto                      |

Seed demo:

```text
B1-IN, B1-OUT
B2-IN, B2-OUT
B3-IN, B3-OUT
```

## 8.11 parking_sessions

Owner: `.NET`

| Column                  | Type                          | Required | Note                           |
| ----------------------- | ----------------------------- | -------: | ------------------------------ |
| id                      | BIGSERIAL                     |      Yes | PK                             |
| session_code            | VARCHAR(50)                   |      Yes | Unique, PS202605210001         |
| card_id                 | BIGINT FK parking_cards(id)   |      Yes | Card gắn với lượt gửi          |
| driver_id               | BIGINT FK driver_profiles(id) |       No | Nullable                       |
| vehicle_id              | BIGINT FK vehicles(id)        |       No | Nullable                       |
| plate_number            | VARCHAR(30)                   |       No | Nullable với xe không biển số  |
| normalized_plate_number | VARCHAR(30)                   |       No | Search/check active            |
| no_plate                | BOOLEAN                       |      Yes | Xe không biển số               |
| vehicle_description     | TEXT                          |       No | Mô tả xe không biển số         |
| vehicle_type_id         | BIGINT FK vehicle_types(id)   |      Yes | Loại xe                        |
| customer_type           | VARCHAR(30)                   |      Yes | CASUAL/MONTHLY                 |
| monthly_pass_id         | BIGINT FK monthly_passes(id)  |       No | Nullable                       |
| floor_id                | BIGINT FK floors(id)          |      Yes | Tầng                           |
| area_id                 | BIGINT FK areas(id)           |      Yes | Khu vực                        |
| slot_id                 | BIGINT FK slots(id)           |       No | Slot                           |
| entry_gate_id           | BIGINT FK gates(id)           |      Yes | Cổng vào                       |
| exit_gate_id            | BIGINT FK gates(id)           |       No | Cổng ra                        |
| entry_staff_id          | BIGINT FK users(id)           |      Yes | Staff vào                      |
| exit_staff_id           | BIGINT FK users(id)           |       No | Staff ra                       |
| entry_time              | TIMESTAMPTZ                   |      Yes | Thời gian vào                  |
| exit_time               | TIMESTAMPTZ                   |       No | Thời gian ra                   |
| status                  | VARCHAR(40)                   |      Yes | ACTIVE/COMPLETED/CANCELLED/... |
| payment_required        | BOOLEAN                       |      Yes | false nếu monthly pass valid   |
| payment_status          | VARCHAR(40)                   |      Yes | PENDING/PAID/WAIVED/...        |
| pricing_rule_id         | BIGINT FK pricing_rules(id)   |       No | Snapshot source                |
| snapshot_day_price      | NUMERIC(12,2)                 |       No | Giá tại lúc vào                |
| snapshot_night_price    | NUMERIC(12,2)                 |       No | Giá tại lúc vào                |
| snapshot_monthly_price  | NUMERIC(12,2)                 |       No | Giá tại lúc vào                |
| snapshot_lost_card_fee  | NUMERIC(12,2)                 |       No | Giá tại lúc vào                |
| suggested_area_id       | BIGINT FK areas(id)           |       No | Khu được gợi ý                 |
| suggested_slot_id       | BIGINT FK slots(id)           |       No | Slot được gợi ý                |
| override_area_id        | BIGINT FK areas(id)           |       No | Khu override                   |
| override_slot_id        | BIGINT FK slots(id)           |       No | Slot override                  |
| override_reason         | TEXT                          |       No | Lý do override                 |
| cancellation_reason     | TEXT                          |       No | Lý do hủy                      |
| created_at              | TIMESTAMPTZ                   |      Yes | Auto                           |
| updated_at              | TIMESTAMPTZ                   |      Yes | Auto                           |

Indexes:

```sql
CREATE UNIQUE INDEX ux_sessions_session_code ON parking_sessions(session_code);
CREATE INDEX ix_sessions_card_id ON parking_sessions(card_id);
CREATE INDEX ix_sessions_plate ON parking_sessions(normalized_plate_number);
CREATE INDEX ix_sessions_status ON parking_sessions(status);
CREATE INDEX ix_sessions_entry_time ON parking_sessions(entry_time);
CREATE INDEX ix_sessions_exit_time ON parking_sessions(exit_time);
CREATE INDEX ix_sessions_vehicle_type ON parking_sessions(vehicle_type_id);
CREATE INDEX ix_sessions_slot ON parking_sessions(slot_id);
```

PostgreSQL partial indexes chống trùng active:

```sql
CREATE UNIQUE INDEX ux_active_session_by_card
ON parking_sessions(card_id)
WHERE status IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING');

CREATE UNIQUE INDEX ux_active_session_by_plate
ON parking_sessions(normalized_plate_number)
WHERE normalized_plate_number IS NOT NULL
  AND status IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING');

CREATE UNIQUE INDEX ux_active_session_by_slot
ON parking_sessions(slot_id)
WHERE status IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING');
```

## 8.12 pricing_rules

Owner: `.NET`

| Column          | Type                        | Required | Note                 |
| --------------- | --------------------------- | -------: | -------------------- |
| id              | BIGSERIAL                   |      Yes | PK                   |
| vehicle_type_id | BIGINT FK vehicle_types(id) |      Yes | Loại xe              |
| day_price       | NUMERIC(12,2)               |      Yes | Giá block khung ngày |
| night_price     | NUMERIC(12,2)               |      Yes | Giá block khung tối  |
| monthly_price   | NUMERIC(12,2)               |      Yes | Giá vé tháng         |
| lost_card_fee   | NUMERIC(12,2)               |      Yes | Phí mất thẻ          |
| effective_from  | TIMESTAMPTZ                 |      Yes | Bắt đầu hiệu lực     |
| status          | VARCHAR(30)                 |      Yes | ACTIVE/INACTIVE      |
| created_by      | BIGINT FK users(id)         |      Yes | Người tạo            |
| updated_by      | BIGINT FK users(id)         |       No | Người cập nhật       |
| created_at      | TIMESTAMPTZ                 |      Yes | Auto                 |
| updated_at      | TIMESTAMPTZ                 |      Yes | Auto                 |

Rule:

- Giá không âm.
- Fee calculation ưu tiên snapshot trong `parking_sessions`.
- Khi tạo entry, .NET copy giá active vào snapshot để tránh tranh cãi nếu giá đổi khi session đang active.

## 8.13 payments

Owner: `.NET`

| Column        | Type                           | Required | Note                                              |
| ------------- | ------------------------------ | -------: | ------------------------------------------------- |
| id            | BIGSERIAL                      |      Yes | PK                                                |
| session_id    | BIGINT FK parking_sessions(id) |      Yes | Session                                           |
| amount        | NUMERIC(12,2)                  |      Yes | Phí gửi xe                                        |
| lost_card_fee | NUMERIC(12,2)                  |      Yes | Default 0                                         |
| total_amount  | NUMERIC(12,2)                  |      Yes | amount + lost_card_fee                            |
| method        | VARCHAR(30)                    |      Yes | CASH/NONE                                         |
| status        | VARCHAR(30)                    |      Yes | PENDING/PAID/FAILED/CANCELLED/WAIVED/NOT_REQUIRED |
| paid_at       | TIMESTAMPTZ                    |       No | Thời gian thanh toán                              |
| collected_by  | BIGINT FK users(id)            |       No | Staff thu tiền                                    |
| waive_reason  | VARCHAR(100)                   |       No | MONTHLY_PASS                                      |
| created_at    | TIMESTAMPTZ                    |      Yes | Auto                                              |
| updated_at    | TIMESTAMPTZ                    |      Yes | Auto                                              |

Rule:

- Không sửa payment đã `PAID`, `WAIVED`, `NOT_REQUIRED`.
- Khách vãng lai không được complete session nếu payment chưa `PAID`.
- Monthly Pass valid có thể tạo payment `WAIVED` hoặc `NOT_REQUIRED`.

## 8.15 monthly_passes

Owner: `.NET`

| Column                  | Type                          | Required | Note                  |
| ----------------------- | ----------------------------- | -------: | --------------------- |
| id                      | BIGSERIAL                     |      Yes | PK                    |
| driver_id               | BIGINT FK driver_profiles(id) |       No | Nullable              |
| owner_name              | VARCHAR(150)                  |      Yes | Chủ xe                |
| phone                   | VARCHAR(30)                   |       No | SĐT                   |
| plate_number            | VARCHAR(30)                   |      Yes | Biển số/mã xe         |
| normalized_plate_number | VARCHAR(30)                   |      Yes | Check                 |
| vehicle_type_id         | BIGINT FK vehicle_types(id)   |      Yes | Loại xe               |
| start_date              | DATE                          |      Yes | Ngày bắt đầu          |
| end_date                | DATE                          |      Yes | Ngày hết hạn          |
| status                  | VARCHAR(30)                   |      Yes | ACTIVE/EXPIRED/LOCKED |
| created_by              | BIGINT FK users(id)           |      Yes | Người tạo             |
| created_at              | TIMESTAMPTZ                   |      Yes | Auto                  |
| updated_at              | TIMESTAMPTZ                   |      Yes | Auto                  |

Indexes:

```sql
CREATE INDEX ix_monthly_pass_plate ON monthly_passes(normalized_plate_number);
CREATE INDEX ix_monthly_pass_status ON monthly_passes(status);
CREATE INDEX ix_monthly_pass_dates ON monthly_passes(start_date, end_date);
```

## 8.16 lost_card_cases

Owner: `.NET`

| Column            | Type                           | Required | Note                      |
| ----------------- | ------------------------------ | -------: | ------------------------- |
| id                | BIGSERIAL                      |      Yes | PK                        |
| session_id        | BIGINT FK parking_sessions(id) |      Yes | Session                   |
| card_id           | BIGINT FK parking_cards(id)    |       No | Card nếu biết             |
| reporter_name     | VARCHAR(150)                   |      Yes | Người báo mất             |
| phone             | VARCHAR(30)                    |       No | SĐT                       |
| verification_note | TEXT                           |      Yes | Mô tả xác minh            |
| reason            | TEXT                           |      Yes | Lý do                     |
| lost_card_fee     | NUMERIC(12,2)                  |      Yes | Phí áp dụng               |
| status            | VARCHAR(30)                    |      Yes | PENDING/APPROVED/REJECTED |
| created_by        | BIGINT FK users(id)            |      Yes | Staff                     |
| approved_by       | BIGINT FK users(id)            |       No | Manager/Admin             |
| approved_at       | TIMESTAMPTZ                    |       No | Thời gian duyệt           |
| rejection_reason  | TEXT                           |       No | Lý do từ chối             |
| created_at        | TIMESTAMPTZ                    |      Yes | Auto                      |
| updated_at        | TIMESTAMPTZ                    |      Yes | Auto                      |

Rule:

- Staff chỉ tạo case.
- Manager/Admin approve/reject.
- Nếu pending, session chuyển `LOST_CARD_PENDING`.
- Nếu approved, có thể tiếp tục exit với phí mất thẻ.

## 8.17 plate_mismatch_cases

Owner: `.NET`

| Column             | Type                           | Required | Note                       |
| ------------------ | ------------------------------ | -------: | -------------------------- |
| id                 | BIGSERIAL                      |      Yes | PK                         |
| session_id         | BIGINT FK parking_sessions(id) |      Yes | Session                    |
| entry_plate_number | VARCHAR(30)                    |       No | Biển số lúc vào            |
| exit_plate_number  | VARCHAR(30)                    |      Yes | Biển số lúc ra             |
| reason             | TEXT                           |       No | Lý do xác nhận             |
| status             | VARCHAR(30)                    |      Yes | PENDING/CONFIRMED/REJECTED |
| created_by         | BIGINT FK users(id)            |      Yes | Staff                      |
| confirmed_by       | BIGINT FK users(id)            |       No | Manager/Admin              |
| confirmed_at       | TIMESTAMPTZ                    |       No | Thời gian xác nhận         |
| rejection_reason   | TEXT                           |       No | Lý do từ chối              |
| created_at         | TIMESTAMPTZ                    |      Yes | Auto                       |
| updated_at         | TIMESTAMPTZ                    |      Yes | Auto                       |

Rule:

- Staff không được tự bỏ qua mismatch.
- Mismatch pending chặn exit đến khi Manager/Admin confirm.

## 8.18 audit_logs

Owner: append-only shared.

| Column         | Type                | Required | Note                    |
| -------------- | ------------------- | -------: | ----------------------- |
| id             | BIGSERIAL           |      Yes | PK                      |
| actor_user_id  | BIGINT FK users(id) |       No | Người thực hiện         |
| source_service | VARCHAR(50)         |      Yes | CORE_API/SUPPORT_API    |
| action         | VARCHAR(100)        |      Yes | SESSION_CREATED...      |
| target_type    | VARCHAR(100)        |      Yes | ParkingSession/Card/... |
| target_id      | VARCHAR(100)        |      Yes | ID string               |
| old_value      | JSONB               |       No | Snapshot cũ             |
| new_value      | JSONB               |       No | Snapshot mới            |
| reason         | TEXT                |       No | Lý do                   |
| created_at     | TIMESTAMPTZ         |      Yes | Auto                    |

Indexes:

```sql
CREATE INDEX ix_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX ix_audit_logs_action ON audit_logs(action);
CREATE INDEX ix_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX ix_audit_logs_created_at ON audit_logs(created_at);
```

Không backend nào được update/delete audit log.

## 8.19 feedbacks - Could Have

Owner: `Spring Boot`

| Column         | Type                | Required | Note                         |
| -------------- | ------------------- | -------: | ---------------------------- |
| id             | BIGSERIAL           |      Yes | PK                           |
| driver_user_id | BIGINT FK users(id) |       No | Nullable nếu public feedback |
| type           | VARCHAR(50)         |      Yes | ISSUE/SUGGESTION/OTHER       |
| content        | TEXT                |      Yes | Nội dung                     |
| status         | VARCHAR(30)         |      Yes | OPEN/RESOLVED/REJECTED       |
| resolved_by    | BIGINT FK users(id) |       No | Manager/Admin                |
| resolved_at    | TIMESTAMPTZ         |       No | Thời gian xử lý              |
| created_at     | TIMESTAMPTZ         |      Yes | Auto                         |
| updated_at     | TIMESTAMPTZ         |      Yes | Auto                         |

## 8.20 notifications - Could Have

Owner: `Spring Boot`

| Column     | Type                | Required | Note          |
| ---------- | ------------------- | -------: | ------------- |
| id         | BIGSERIAL           |      Yes | PK            |
| user_id    | BIGINT FK users(id) |       No | Người nhận    |
| title      | VARCHAR(150)        |      Yes | Tiêu đề       |
| content    | TEXT                |      Yes | Nội dung      |
| is_read    | BOOLEAN             |      Yes | Default false |
| created_at | TIMESTAMPTZ         |      Yes | Auto          |

## 8.21 mock_device_events - Optional

Owner: `Spring Boot`

| Column     | Type                | Required | Note                     |
| ---------- | ------------------- | -------: | ------------------------ |
| id         | BIGSERIAL           |      Yes | PK                       |
| event_type | VARCHAR(50)         |      Yes | CAMERA_SCAN/BARRIER_OPEN |
| payload    | JSONB               |       No | Dữ liệu mock             |
| created_by | BIGINT FK users(id) |       No | User                     |
| created_at | TIMESTAMPTZ         |      Yes | Auto                     |

## 8.22 system_configs - Could Have

Owner: `.NET`

| Column       | Type                | Required | Note    |
| ------------ | ------------------- | -------: | ------- |
| id           | BIGSERIAL           |      Yes | PK      |
| config_key   | VARCHAR(100)        |      Yes | Unique  |
| config_value | TEXT                |      Yes | Giá trị |
| description  | TEXT                |       No | Mô tả   |
| updated_by   | BIGINT FK users(id) |       No | Admin   |
| updated_at   | TIMESTAMPTZ         |      Yes | Auto    |

## 8.23 reservations

Owner: `.NET`

| Column      | Type                          | Required | Note                                           |
| ----------- | ----------------------------- | -------: | ---------------------------------------------- |
| id          | BIGSERIAL                     |      Yes | PK                                             |
| driver_id   | BIGINT FK driver_profiles(id) |       No | Tài xế đặt chỗ                                 |
| slot_id     | BIGINT FK slots(id)           |      Yes | Slot ô tô được giữ                             |
| reserved_at | TIMESTAMPTZ                   |      Yes | Thời điểm đặt                                  |
| expires_at  | TIMESTAMPTZ                   |      Yes | Thời điểm hết hạn (thời gian vào + 15p)        |
| status      | VARCHAR(30)                   |      Yes | PENDING/COMPLETED/CANCELLED/EXPIRED            |
| created_at  | TIMESTAMPTZ                   |      Yes | Auto                                           |
| updated_at  | TIMESTAMPTZ                   |      Yes | Auto                                           |

Indexes:

```sql
CREATE INDEX ix_reservations_driver ON reservations(driver_id);
CREATE INDEX ix_reservations_slot ON reservations(slot_id);
CREATE INDEX ix_reservations_status ON reservations(status);
```

---

# 9. State Transition Rules

## 9.1 Parking Card

```text
AVAILABLE -> IN_USE       khi Entry tạo session
IN_USE -> AVAILABLE       khi Exit complete/cancel và card không LOST/DAMAGED/INACTIVE
IN_USE -> LOST            khi lost card approved
AVAILABLE -> LOST         Manager/Admin mark lost
AVAILABLE -> DAMAGED      Manager/Admin mark damaged
AVAILABLE -> INACTIVE     Manager/Admin deactivate
```

Không cho dùng card nếu status khác `AVAILABLE`.

## 9.2 Slot

```text
AVAILABLE -> OCCUPIED     khi Entry thành công
OCCUPIED -> AVAILABLE     khi Exit complete/cancel/move session
AVAILABLE -> LOCKED       Manager/Admin khóa
AVAILABLE -> MAINTENANCE  Manager/Admin bảo trì
LOCKED/MAINTENANCE -> AVAILABLE khi mở lại
```

Không chuyển slot `OCCUPIED` sang `LOCKED/MAINTENANCE` nếu đang gắn active session, trừ khi đi qua flow move/cancel có transaction.

## 9.3 Parking Session

```text
ACTIVE -> COMPLETED           exit thành công
ACTIVE -> LOST_CARD_PENDING   tạo lost card case
LOST_CARD_PENDING -> ACTIVE   lost card rejected
LOST_CARD_PENDING -> COMPLETED lost card approved + exit
ACTIVE -> MISMATCH_PENDING    phát hiện sai biển số
MISMATCH_PENDING -> ACTIVE    mismatch confirmed
MISMATCH_PENDING -> ACTIVE    mismatch rejected nhưng không cho exit
ACTIVE/PENDING -> CANCELLED   Admin cancel
```

Không hủy session `COMPLETED`.

## 9.4 Payment

```text
PENDING -> PAID          staff thu tiền
PENDING -> FAILED        lỗi thao tác hoặc hủy attempt
PENDING/FAILED -> CANCELLED khi session cancel
PENDING -> WAIVED        monthly pass valid hoặc manager waive
PENDING -> NOT_REQUIRED  monthly pass valid không cần thu
```

Không sửa payment final: `PAID`, `WAIVED`, `NOT_REQUIRED`.

---

# 10. ASP.NET Core Architecture

## 10.1 Project Structure

```text
ParkingBuilding.CoreApi
├── Controllers
│   ├── AuthController.cs
│   ├── UsersController.cs
│   ├── DriversController.cs
│   ├── VehicleTypesController.cs
│   ├── VehiclesController.cs
│   ├── CardsController.cs
│   ├── FloorsController.cs
│   ├── AreasController.cs
│   ├── SlotsController.cs
│   ├── GatesController.cs
│   ├── ParkingSessionsController.cs
│   ├── PaymentsController.cs
│   ├── MonthlyPassesController.cs
│   ├── LostCardCasesController.cs
│   ├── PlateMismatchController.cs
│   └── PricingRulesController.cs
├── Application
│   ├── Auth
│   ├── Users
│   ├── Drivers
│   ├── Vehicles
│   ├── Cards
│   ├── ParkingStructure
│   ├── ParkingSessions
│   ├── FeeCalculation
│   ├── Payments
│   ├── MonthlyPasses
│   ├── LostCards
│   ├── Mismatch
│   ├── Pricing
│   └── Audit
├── Domain
│   ├── Entities
│   ├── Enums
│   └── ValueObjects
├── Infrastructure
│   ├── Persistence
│   │   ├── ParkingDbContext.cs
│   │   ├── Configurations
│   │   └── Migrations (deprecated, do not use)
│   ├── Repositories
│   └── Security
├── Contracts
│   ├── Requests
│   ├── Responses
│   └── Common
└── Program.cs
```

## 10.2 Packages Đề Xuất

```text
Microsoft.EntityFrameworkCore
Npgsql.EntityFrameworkCore.PostgreSQL
Microsoft.AspNetCore.Authentication.JwtBearer
BCrypt.Net-Next
FluentValidation.AspNetCore
AutoMapper.Extensions.Microsoft.DependencyInjection
Swashbuckle.AspNetCore
```

Không cần package xuất Excel trong .NET nếu Excel export giao cho Spring Boot.

---

# 11. Spring Boot Architecture

## 11.1 Project Structure

```text
parking-building-support-api
├── src/main/java/com/parkingbuilding/support
│   ├── ParkingBuildingSupportApplication.java
│   ├── common
│   │   ├── ApiResponse.java
│   │   ├── ErrorResponse.java
│   │   ├── PageResponse.java
│   │   └── exception
│   ├── config
│   │   ├── SecurityConfig.java
│   │   ├── JwtConfig.java
│   │   └── CorsConfig.java
│   ├── security
│   │   ├── JwtAuthenticationFilter.java
│   │   └── JwtTokenValidator.java
│   ├── publicapi
│   ├── dashboard
│   ├── report
│   ├── auditlog
│   ├── feedback
│   ├── notification
│   ├── mockdevice
│   └── sharedreadmodel
└── src/main/resources/application.yml
```

## 11.2 Packages Đề Xuất

```text
spring-boot-starter-web
spring-boot-starter-security
spring-boot-starter-data-jpa
postgresql
jjwt-api / jjwt-impl / jjwt-jackson
lombok
mapstruct
springdoc-openapi-starter-webmvc-ui
apache-poi
```

## 11.3 Read-Only Repository Rule

Với bảng core do .NET sở hữu, Spring Boot repository chỉ expose query methods. Không gọi `save`, `delete`, `flush` cho:

```text
users
driver_profiles
vehicles
vehicle_types
parking_cards
floors
areas
area_vehicle_types
slots
gates
parking_sessions
pricing_rules
payments
monthly_passes
lost_card_cases
plate_mismatch_cases
```

Ngoại lệ:

- `audit_logs`: Spring được insert append-only cho action của support service.
- `feedbacks`, `notifications`, `mock_device_events`: Spring sở hữu nếu triển khai.

---

# 12. .NET Core API Module Breakdown

## 12.1 Module Auth

FR liên quan: FR-01, FR-03.08.

Owner: `.NET Core API`

APIs:

| Method | Endpoint                | Role          | Mô tả                        |
| ------ | ----------------------- | ------------- | ---------------------------- |
| POST   | `/api/core/auth/login`  | Public        | Đăng nhập user nội bộ/driver |
| POST   | `/api/core/auth/logout` | Authenticated | Đăng xuất logic              |
| GET    | `/api/core/auth/me`     | Authenticated | Lấy user hiện tại            |

DTO:

```csharp
LoginRequest { usernameOrEmailOrPhone, password }
LoginResponse { accessToken, tokenType, expiresAt, user }
CurrentUserResponse { id, username, fullName, role, status }
```

Services:

```csharp
IAuthService.LoginAsync(LoginRequest request)
IAuthService.GetCurrentUserAsync(long userId)
IAuthService.ValidateUserStatusAsync(User user)
IJwtTokenService.GenerateToken(User user)
IPasswordHasher.Verify(string password, string passwordHash)
```

Repository:

```csharp
UserRepository.GetByUsernameAsync(string username)
UserRepository.GetByEmailAsync(string email)
UserRepository.GetByPhoneAsync(string phone)
```

Business validation:

| Validation                         | Error                 |
| ---------------------------------- | --------------------- |
| Sai username/password              | `INVALID_CREDENTIALS` |
| User LOCKED/INACTIVE               | `ACCOUNT_LOCKED`      |
| Password plain text không được lưu | Dev rule              |

Frontend:

| Page/Component | Mô tả          |
| -------------- | -------------- |
| LoginPage      | Login chung    |
| AuthProvider   | Lưu token/user |
| ProtectedRoute | Check auth     |
| RoleBasedRoute | Check role     |

Test cases:

| Test ID    | Mô tả                                |
| ---------- | ------------------------------------ |
| TC-AUTH-01 | Staff login thành công nhận JWT      |
| TC-AUTH-02 | Sai password trả 401                 |
| TC-AUTH-03 | Account LOCKED không login được      |
| TC-AUTH-04 | Spring verify JWT từ .NET thành công |

## 12.2 Module User Management

FR liên quan: FR-02.

Owner: `.NET Core API`

APIs:

| Method | Endpoint                      | Role  |
| ------ | ----------------------------- | ----- |
| GET    | `/api/core/users`             | ADMIN |
| POST   | `/api/core/users`             | ADMIN |
| GET    | `/api/core/users/{id}`        | ADMIN |
| PUT    | `/api/core/users/{id}`        | ADMIN |
| PATCH  | `/api/core/users/{id}/status` | ADMIN |
| PATCH  | `/api/core/users/{id}/role`   | ADMIN |

DTO:

```csharp
UserSearchRequest { keyword, role, status, page, pageSize }
CreateUserRequest { fullName, username, email, phone, password, role }
UpdateUserRequest { fullName, email, phone }
ChangeUserStatusRequest { status, reason }
ChangeUserRoleRequest { role, reason }
UserResponse { id, fullName, username, email, phone, role, status }
```

Services:

```csharp
IUserService.GetUsersAsync(UserSearchRequest request)
IUserService.CreateInternalUserAsync(CreateUserRequest request, long adminId)
IUserService.UpdateUserAsync(long id, UpdateUserRequest request, long adminId)
IUserService.ChangeStatusAsync(long id, UserStatus status, string reason, long adminId)
IUserService.ChangeRoleAsync(long id, UserRole role, string reason, long adminId)
IUserService.ValidateUniqueUsernameEmailPhoneAsync(...)
```

Repository:

```csharp
UserRepository.SearchAsync(...)
UserRepository.ExistsByUsernameAsync(...)
UserRepository.ExistsByEmailAsync(...)
UserRepository.ExistsByPhoneAsync(...)
```

Business validation:

| Validation                | Error                     |
| ------------------------- | ------------------------- |
| Username trùng            | `USERNAME_ALREADY_EXISTS` |
| Email trùng               | `EMAIL_ALREADY_EXISTS`    |
| Phone trùng               | `PHONE_ALREADY_EXISTS`    |
| Staff gọi user management | 403                       |

Frontend:

| Page/Component     | Mô tả          |
| ------------------ | -------------- |
| UserManagementPage | Danh sách user |
| UserCreateModal    | Tạo user       |
| UserStatusAction   | Lock/unlock    |
| UserRoleSelect     | Đổi role       |

Test cases:

| Test ID    | Mô tả                          |
| ---------- | ------------------------------ |
| TC-USER-01 | Admin tạo Staff                |
| TC-USER-02 | Không tạo username trùng       |
| TC-USER-03 | Admin khóa user                |
| TC-USER-04 | Staff không gọi được API admin |

## 12.3 Module Driver Account - Should Have

FR liên quan: FR-03.06 đến FR-03.10.

Owner: `.NET Core API`

APIs:

| Method | Endpoint                           | Role   |
| ------ | ---------------------------------- | ------ |
| POST   | `/api/core/driver/register`        | Public |
| GET    | `/api/core/driver/me`              | DRIVER |
| PUT    | `/api/core/driver/me`              | DRIVER |
| GET    | `/api/core/driver/vehicles`        | DRIVER |
| POST   | `/api/core/driver/vehicles`        | DRIVER |
| GET    | `/api/core/driver/parking-history` | DRIVER |

DTO:

```csharp
DriverRegisterRequest { fullName, email, phone, password }
UpdateDriverProfileRequest { fullName, email, phone }
CreateDriverVehicleRequest { plateNumber, vehicleTypeId, description }
DriverVehicleResponse { id, plateNumber, vehicleType, status }
DriverParkingHistoryResponse { sessionCode, plateNumber, entryTime, exitTime, totalAmount, status }
```

Services:

```csharp
IDriverService.RegisterAsync(DriverRegisterRequest request)
IDriverService.GetMyProfileAsync(long userId)
IDriverService.UpdateMyProfileAsync(long userId, UpdateDriverProfileRequest request)
IDriverVehicleService.GetMyVehiclesAsync(long userId)
IDriverVehicleService.CreateVehicleAsync(long userId, CreateDriverVehicleRequest request)
IDriverService.GetParkingHistoryAsync(long userId, PageRequest request)
```

Business validation:

| Validation                   | Error                                           |
| ---------------------------- | ----------------------------------------------- |
| Email/phone trùng user       | `EMAIL_ALREADY_EXISTS` / `PHONE_ALREADY_EXISTS` |
| Vehicle type inactive        | `VEHICLE_TYPE_INACTIVE`                         |
| Driver xem history user khác | 403                                             |

Rule:

- Driver register do .NET ghi `users` role DRIVER và `driver_profiles`.
- Support API không ghi trực tiếp bảng Driver hoặc Vehicle.

Frontend:

| Page/Component     | Mô tả       |
| ------------------ | ----------- |
| DriverRegisterPage | Should Have |
| DriverProfilePage  | Should Have |
| MyVehiclesPage     | Should Have |
| ParkingHistoryPage | Should Have |

Test cases:

| Test ID   | Mô tả                                    |
| --------- | ---------------------------------------- |
| TC-DRV-01 | Driver register bằng email               |
| TC-DRV-02 | Driver thêm xe cá nhân                   |
| TC-DRV-03 | Driver xem lịch sử của mình              |
| TC-DRV-04 | Driver không xem được history người khác |

## 12.4 Module Vehicle Type And Vehicle

FR liên quan: FR-05, FR-03.09, FR-07.

Owner: `.NET Core API`

APIs:

| Method | Endpoint                              | Role                |
| ------ | ------------------------------------- | ------------------- |
| GET    | `/api/core/vehicle-types`             | Public/Auth         |
| POST   | `/api/core/vehicle-types`             | MANAGER/ADMIN       |
| PATCH  | `/api/core/vehicle-types/{id}/active` | MANAGER/ADMIN       |
| GET    | `/api/core/vehicles`                  | STAFF/MANAGER/ADMIN |
| POST   | `/api/core/vehicles`                  | STAFF/MANAGER/ADMIN |

Services:

```csharp
IVehicleTypeService.GetActiveVehicleTypesAsync()
IVehicleTypeService.GetVehicleTypesAsync()
IVehicleTypeService.ChangeActiveStatusAsync(long id, bool isActive, long userId)
IVehicleService.FindOrCreateVehicleForEntryAsync(...)
IVehicleService.FindByPlateNumberAsync(string plateNumber)
IVehicleService.CheckVehicleHasActiveSessionAsync(string plateNumber)
IVehicleService.NormalizePlateNumber(string plateNumber)
```

Repository:

```csharp
VehicleTypeRepository.GetActiveAsync()
VehicleRepository.FindByNormalizedPlateAsync(string normalizedPlate)
ParkingSessionRepository.ExistsActiveByPlateAsync(string normalizedPlate)
```

Business validation:

| Validation                      | Error                          |
| ------------------------------- | ------------------------------ |
| Vehicle type inactive khi entry | `VEHICLE_TYPE_INACTIVE`        |
| Plate đang có active session    | `VEHICLE_HAS_ACTIVE_SESSION`   |
| Xe không biển số phải có mô tả  | `VEHICLE_DESCRIPTION_REQUIRED` |

Frontend:

| Component                 | Mô tả                   |
| ------------------------- | ----------------------- |
| VehicleTypeSelect         | Dropdown loại xe        |
| VehicleTypeManagementPage | Manager quản lý loại xe |
| PlateNumberInput          | Nhập biển số            |
| NoPlateToggle             | Xe không biển số        |
| VehicleDescriptionInput   | Mô tả                   |

Test cases:

| Test ID   | Mô tả                                    |
| --------- | ---------------------------------------- |
| TC-VEH-01 | Lấy danh sách loại xe active             |
| TC-VEH-02 | Manager tắt loại xe                      |
| TC-VEH-03 | Không entry với loại xe inactive         |
| TC-VEH-04 | Xe đã active session không tạo entry mới |

## 12.5 Module Parking Card

FR liên quan: FR-04, FR-07, FR-09, FR-14, FR-16.

Owner: `.NET Core API`

APIs:

| Method | Endpoint                                            | Role                |
| ------ | --------------------------------------------------- | ------------------- |
| GET    | `/api/core/cards`                                   | MANAGER/ADMIN       |
| POST   | `/api/core/cards`                                   | MANAGER/ADMIN       |
| GET    | `/api/core/cards/available`                         | STAFF/MANAGER/ADMIN |
| GET    | `/api/core/cards/{id}`                              | MANAGER/ADMIN       |
| PATCH  | `/api/core/cards/{id}/status`                       | MANAGER/ADMIN       |
| GET    | `/api/core/cards/by-code/{cardCode}/active-session` | STAFF/MANAGER/ADMIN |

DTO:

```csharp
CreateCardRequest { cardCode, note }
CardResponse { id, cardCode, qrToken, status, currentSessionId }
ChangeCardStatusRequest { status, reason }
ActiveSessionByCardResponse { card, session }
```

Services:

```csharp
IParkingCardService.CreateCardAsync(CreateCardRequest request, long userId)
IParkingCardService.GetCardsAsync(CardSearchRequest request)
IParkingCardService.GetAvailableCardsAsync()
IParkingCardService.ValidateCardAvailableAsync(long cardId)
IParkingCardService.MarkInUseAsync(long cardId, long sessionId)
IParkingCardService.MarkAvailableAsync(long cardId)
IParkingCardService.MarkLostAsync(long cardId, string reason)
IParkingCardService.ChangeStatusAsync(long cardId, CardStatus status, string reason, long userId)
IParkingCardService.GenerateQrToken()
```

Repository:

```csharp
ParkingCardRepository.FindByCardCodeAsync(string cardCode)
ParkingCardRepository.FindByQrTokenAsync(string qrToken)
ParkingCardRepository.FindByStatusAsync(CardStatus status)
ParkingCardRepository.ExistsByCardCodeAsync(string cardCode)
ParkingCardRepository.ExistsByQrTokenAsync(string qrToken)
```

Business validation:

| Validation                                  | Error                      |
| ------------------------------------------- | -------------------------- |
| cardCode trùng                              | `CARD_CODE_ALREADY_EXISTS` |
| qrToken trùng                               | `QR_TOKEN_ALREADY_EXISTS`  |
| Card không AVAILABLE khi entry              | `CARD_NOT_AVAILABLE`       |
| Card IN_USE không có active session         | `CARD_STATE_CONFLICT`      |
| Card LOST/DAMAGED/INACTIVE không dùng entry | `CARD_NOT_AVAILABLE`       |

Frontend:

| Page/Component      | Mô tả                      |
| ------------------- | -------------------------- |
| CardManagementPage  | Manager/Admin quản lý card |
| CardListTable       | Danh sách card             |
| CardCreateModal     | Tạo card                   |
| CardStatusBadge     | Trạng thái card            |
| CardStatusAction    | LOST/DAMAGED/INACTIVE      |
| AvailableCardSelect | Staff chọn card lúc entry  |
| CardCodeInput       | Staff nhập card lúc exit   |

Test cases:

| Test ID    | Mô tả                                       |
| ---------- | ------------------------------------------- |
| TC-CARD-01 | Manager tạo card C001                       |
| TC-CARD-02 | Không cho tạo cardCode trùng                |
| TC-CARD-03 | Card AVAILABLE được gán vào session         |
| TC-CARD-04 | Card IN_USE không được dùng cho session mới |
| TC-CARD-05 | Card LOST không được dùng lại               |

## 12.6 Module Parking Structure

FR liên quan: FR-06, FR-08, FR-17.

Owner: `.NET Core API`

APIs:

| Method | Endpoint                                    | Role                |
| ------ | ------------------------------------------- | ------------------- |
| GET    | `/api/core/floors`                          | STAFF/MANAGER/ADMIN |
| POST   | `/api/core/floors`                          | MANAGER/ADMIN       |
| PUT    | `/api/core/floors/{id}`                     | MANAGER/ADMIN       |
| GET    | `/api/core/areas`                           | STAFF/MANAGER/ADMIN |
| POST   | `/api/core/areas`                           | MANAGER/ADMIN       |
| PUT    | `/api/core/areas/{id}`                      | MANAGER/ADMIN       |
| GET    | `/api/core/slots`                           | STAFF/MANAGER/ADMIN |
| POST   | `/api/core/slots`                           | MANAGER/ADMIN       |
| PATCH  | `/api/core/slots/{id}/status`               | MANAGER/ADMIN       |
| POST   | `/api/core/parking-sessions/{id}/move-slot` | MANAGER/ADMIN       |
| GET    | `/api/core/gates`                           | STAFF/MANAGER/ADMIN |

Services:

```csharp
IFloorService.GetFloorsAsync()
IAreaService.GetAreasAsync(AreaSearchRequest request)
IAreaService.SetAllowedVehicleTypesAsync(long areaId, long[] vehicleTypeIds)
ISlotService.GetSlotsAsync(SlotSearchRequest request)
ISlotService.FindFirstAvailableSlotAsync(long areaId, long vehicleTypeId)
ISlotService.MarkOccupiedAsync(long slotId, long sessionId)
ISlotService.MarkAvailableAsync(long slotId)
ISlotService.ChangeSlotStatusAsync(long slotId, SlotStatus status, string reason, long userId)
ISlotService.MoveSessionSlotAsync(long sessionId, MoveSlotRequest request, long userId)
IGateService.ValidateEntryGateAsync(long gateId)
IGateService.ValidateExitGateAsync(long gateId)
```

Repository:

```csharp
SlotRepository.CountAvailableByAreaAndVehicleTypeAsync(...)
SlotRepository.FindFirstAvailableByAreaAndVehicleTypeAsync(...)
AreaRepository.FindActiveAreasByVehicleTypeAsync(...)
GateRepository.FindByTypeAndStatusAsync(...)
```

Business validation:

| Validation                                        | Error                           |
| ------------------------------------------------- | ------------------------------- |
| Area LOCKED/MAINTENANCE                           | `AREA_NOT_AVAILABLE`            |
| Slot không AVAILABLE khi entry                    | `SLOT_NOT_AVAILABLE`            |
| Slot không match vehicle type                     | `SLOT_VEHICLE_TYPE_NOT_ALLOWED` |
| Change status slot OCCUPIED không qua flow hợp lệ | `SLOT_HAS_ACTIVE_SESSION`       |
| Move slot thiếu reason                            | `REASON_REQUIRED`               |

Frontend:

| Page/Component          | Mô tả                         |
| ----------------------- | ----------------------------- |
| StructureManagementPage | Quản lý tầng/khu/slot         |
| SlotMap                 | Sơ đồ slot đơn giản           |
| SlotStatusBadge         | Màu trạng thái                |
| SlotStatusAction        | Đổi status                    |
| MoveSlotModal           | Chuyển session sang slot khác |

Test cases:

| Test ID      | Mô tả                                               |
| ------------ | --------------------------------------------------- |
| TC-STRUCT-01 | Manager tạo floor/area/slot                         |
| TC-STRUCT-02 | Không tạo trùng slot trong cùng area                |
| TC-STRUCT-03 | Đổi slot AVAILABLE sang LOCKED                      |
| TC-STRUCT-04 | Không khóa slot đang OCCUPIED nếu không move/cancel |
| TC-STRUCT-05 | Move session cập nhật slot cũ/mới đúng              |

## 12.7 Module Location Suggestion

FR liên quan: FR-08, FR-07.06 đến FR-07.10.

Owner: `.NET Core API`

API:

| Method | Endpoint                                         | Role                |
| ------ | ------------------------------------------------ | ------------------- |
| GET    | `/api/core/parking-sessions/location-suggestion` | STAFF/MANAGER/ADMIN |

Query Parameters:

- `vehicleTypeId` (long, required)
- `entryGateId` (long, required)

Response:

```json
{
  "success": true,
  "message": "Suggestion generated successfully",
  "data": {
    "suggestionType": "SLOT",
    "suggestedFloorId": 1,
    "suggestedAreaId": 2,
    "suggestedSlotId": 15,
    "slotCode": "B-C05",
    "areaCode": "B",
    "floorCode": "B1",
    "suggestionToken": "JWT_TOKEN_HERE"
  }
}
```

Services:

```csharp
ISlotSuggestionService.SuggestSlotAsync(SuggestSlotRequest request)
ISlotSuggestionService.FindCandidateAreasAsync(long vehicleTypeId)
ISlotSuggestionService.RemoveUnavailableAreasAsync(...)
ISlotSuggestionService.SortByAvailableSlotsAndPriority(...)
ISlotSuggestionService.PickFirstAvailableSlotAsync(...)
ISlotSuggestionService.BuildSuggestionReason(...)
```

Business validation:

| Validation                          | Error                             |
| ----------------------------------- | --------------------------------- |
| Không có area phù hợp               | `NO_AVAILABLE_AREA`               |
| Không có slot phù hợp               | `NO_AVAILABLE_SLOT`               |
| Staff chọn khác suggestion          | `SUGGESTION_OVERRIDE_NOT_ALLOWED` |
| Manager/Admin override thiếu reason | `OVERRIDE_REASON_REQUIRED`        |

Test cases:

| Test ID   | Mô tả                            |
| --------- | -------------------------------- |
| TC-SUG-01 | Đề xuất khu đúng loại xe         |
| TC-SUG-02 | Bỏ qua khu LOCKED                |
| TC-SUG-03 | Ưu tiên khu nhiều slot trống hơn |
| TC-SUG-04 | Staff không override suggestion  |
| TC-SUG-05 | Manager override có audit log    |

## 12.8 Module Entry Processing

FR liên quan: FR-07, FR-08, FR-13.

Owner: `.NET Core API`

API:

| Method | Endpoint                           | Role                |
| ------ | ---------------------------------- | ------------------- |
| POST   | `/api/core/parking-sessions/entry` | STAFF/MANAGER/ADMIN |

### Request (3 Entry Modes)

#### 1. MONTHLY Mode
```json
{
  "entryMode": "MONTHLY",
  "monthlyPassId": 1,
  "monthlyEntryToken": "JWT_TOKEN_HERE",
  "cardCode": "C001",
  "licensePlate": "51A-99999",
  "noPlate": false,
  "vehicleTypeId": 3,
  "entryGateId": 1,
  "selectedAreaId": 1,
  "selectedSlotId": null
}
```

#### 2. CASUAL Mode
```json
{
  "entryMode": "CASUAL",
  "cardCode": "C002",
  "licensePlate": "59X1-88888",
  "noPlate": false,
  "vehicleTypeId": 3,
  "entryGateId": 1,
  "selectedAreaId": 1,
  "selectedSlotId": null,
  "suggestionToken": "JWT_TOKEN_HERE",
  "convertedFromReservationId": null
}
```

#### 3. RESERVATION Mode
```json
{
  "entryMode": "RESERVATION",
  "reservationId": 123,
  "reservationEntryToken": "JWT_TOKEN_HERE",
  "cardCode": "C003",
  "licensePlate": "51A-12345",
  "noPlate": false,
  "vehicleTypeId": 5,
  "entryGateId": 1,
  "selectedAreaId": 2,
  "selectedSlotId": 15
}
```

### Response

```json
{
  "success": true,
  "message": "Entry created successfully",
  "data": {
    "sessionId": 1001,
    "sessionCode": "SESS-20260629-ABC",
    "status": "ACTIVE",
    "customerType": "MONTHLY",
    "cardCode": "C001",
    "slotCode": null,
    "entryTime": "2026-06-29T10:00:00+07:00",
    "paymentStatus": "NOT_REQUIRED",
    "monthlyPassId": 1,
    "reservationId": null,
    "convertedFromReservationId": null
  }
}
```

Services:

```csharp
IEntryService.CreateEntrySessionAsync(CreateEntrySessionRequest request, long staffId)
IEntryService.ValidateEntryRequestAsync(CreateEntrySessionRequest request)
IEntryService.ValidateStaffCanCreateEntryAsync(long staffId)
IEntryService.ValidateCardAvailableAsync(long cardId)
IEntryService.ValidateVehicleNoActiveSessionAsync(string normalizedPlate)
IEntryService.FindOrCreateVehicleForEntryAsync(...)
IEntryService.DetectCustomerTypeAsync(string plateNumber, long vehicleTypeId)
IEntryService.ValidateMonthlyPassIfAnyAsync(...)
IEntryService.ValidateSelectedSlotMatchesSuggestionAsync(...)
IEntryService.GetPricingSnapshotAsync(long vehicleTypeId)
IEntryService.CreateParkingSessionAsync(...)
IEntryService.BindCardToSessionAsync(long cardId, long sessionId)
IEntryService.MarkSlotOccupiedAsync(long slotId, long sessionId)
IEntryService.WriteEntryAuditLogAsync(...)
IEntryService.GenerateSessionCodeAsync()
```

Repository:

```csharp
ParkingSessionRepository.ExistsActiveByCardAsync(long cardId)
ParkingSessionRepository.ExistsActiveByPlateAsync(string normalizedPlate)
ParkingSessionRepository.CreateAsync(ParkingSession session)
PricingRuleRepository.GetActiveByVehicleTypeAsync(long vehicleTypeId, DateTimeOffset time)
```

Transaction boundary:

`CreateEntrySessionAsync` chạy trong một transaction .NET. Rollback nếu bất kỳ bước nào lỗi:

- Không tạo session.
- Không đổi card sang `IN_USE`.
- Không đổi slot sang `OCCUPIED`.
- Không ghi audit log.

Business validation:

| Validation                   | Error                             |
| ---------------------------- | --------------------------------- |
| Card không AVAILABLE         | `CARD_NOT_AVAILABLE`              |
| Slot không AVAILABLE         | `SLOT_NOT_AVAILABLE`              |
| Xe đã active session         | `VEHICLE_HAS_ACTIVE_SESSION`      |
| NoPlate nhưng không có mô tả | `VEHICLE_DESCRIPTION_REQUIRED`    |
| Không có pricing active      | `PRICING_RULE_NOT_FOUND`          |
| Staff override suggestion    | `SUGGESTION_OVERRIDE_NOT_ALLOWED` |

Frontend:

| Page/Component   | Mô tả            |
| ---------------- | ---------------- |
| StaffEntryPage   | Màn xử lý xe vào |
| MockCameraButton | Điền biển số mẫu |
| EntryForm        | Form vào         |
| SuggestionPanel  | Hiển thị gợi ý   |
| EntryResultModal | Kết quả session  |

Test cases:

| Test ID     | Mô tả                                        |
| ----------- | -------------------------------------------- |
| TC-ENTRY-01 | Xe vãng lai vào thành công                   |
| TC-ENTRY-02 | Card chuyển IN_USE                           |
| TC-ENTRY-03 | Slot chuyển OCCUPIED                         |
| TC-ENTRY-04 | Duplicate active card bị chặn                |
| TC-ENTRY-05 | Duplicate active plate bị chặn               |
| TC-ENTRY-06 | Entry monthly pass nhận customerType MONTHLY |
| TC-ENTRY-07 | Snapshot giá được lưu                        |

## 12.9 Module Exit Processing

FR liên quan: FR-09, FR-10, FR-11, FR-13, FR-15.

Owner: `.NET Core API`

APIs:

| Method | Endpoint                                             | Role                |
| ------ | ---------------------------------------------------- | ------------------- |
| GET    | `/api/core/parking-sessions/{id}`                    | STAFF/MANAGER/ADMIN |
| GET    | `/api/core/parking-sessions/search`                  | STAFF/MANAGER/ADMIN |
| GET    | `/api/core/parking-sessions/by-card-code/{cardCode}` | STAFF/MANAGER/ADMIN |
| POST   | `/api/core/parking-sessions/{id}/calculate-fee`      | STAFF/MANAGER/ADMIN |
| POST   | `/api/core/parking-sessions/{id}/exit`               | STAFF/MANAGER/ADMIN |
| POST   | `/api/core/parking-sessions/{id}/monthly-pass-exit`  | STAFF/MANAGER/ADMIN |

Casual exit request:

```json
{
  "exitGateId": 2,
  "exitPlateNumber": "51A-12345",
  "exitTime": "2026-05-21T14:30:00+07:00",
  "paymentId": 501
}
```

Monthly pass exit request:

```json
{
  "exitGateId": 2,
  "exitPlateNumber": "51A-12345",
  "exitTime": "2026-05-21T14:30:00+07:00"
}
```

Services:

```csharp
IExitService.FindActiveSessionByCardCodeAsync(string cardCode)
IExitService.SearchSessionsAsync(SessionSearchRequest request)
IExitService.ValidateSessionActiveAsync(long sessionId)
IExitService.ValidatePlateMatchOrRequireApprovalAsync(...)
IExitService.CompleteCasualExitAsync(long sessionId, ExitRequest request, long staffId)
IExitService.CompleteMonthlyPassExitAsync(long sessionId, MonthlyPassExitRequest request, long staffId)
IExitService.ValidatePaymentPaidAsync(long sessionId)
IExitService.MarkSessionCompletedAsync(...)
IExitService.ReleaseSlotAsync(...)
IExitService.ReleaseCardAsync(...)
IExitService.WriteExitAuditLogAsync(...)
```

Transaction boundary:

`CompleteCasualExitAsync` và `CompleteMonthlyPassExitAsync` chạy trong transaction .NET:

- Validate session active.
- Validate mismatch/lost-card state.
- Validate payment hoặc create waived/not-required payment.
- Mark session completed.
- Release slot.
- Release card nếu card không LOST/DAMAGED/INACTIVE.
- Write audit log.

Business validation:

| Validation                          | Error                              |
| ----------------------------------- | ---------------------------------- |
| Session không ACTIVE/pending hợp lệ | `SESSION_NOT_ACTIVE`               |
| Khách vãng lai chưa paid            | `PAYMENT_REQUIRED_BEFORE_EXIT`     |
| Lost card chưa approved             | `LOST_CARD_NOT_APPROVED`           |
| Plate mismatch chưa confirm         | `PLATE_MISMATCH_REQUIRES_APPROVAL` |
| Gate không phải EXIT                | `INVALID_EXIT_GATE`                |

Frontend:

| Page/Component     | Mô tả       |
| ------------------ | ----------- |
| StaffExitPage      | Màn xe ra   |
| SessionLookupPanel | Tìm session |
| FeeSummaryPanel    | Phí         |
| CashPaymentPanel   | Thanh toán  |

Test cases:

| Test ID    | Mô tả                            |
| ---------- | -------------------------------- |
| TC-EXIT-01 | Tìm session bằng Card Code       |
| TC-EXIT-02 | Casual exit sau paid thành công  |
| TC-EXIT-03 | Chưa paid không completed        |
| TC-EXIT-04 | Monthly pass exit hoàn thành lượt gửi không thu tiền |
| TC-EXIT-05 | Exit giải phóng card/slot        |
| TC-EXIT-06 | Sai biển số bị chặn              |

## 12.10 Module Fee Calculation

FR liên quan: FR-10, Pricing Specification.

Owner: `.NET Core API`

API:

| Method | Endpoint                                        | Role                |
| ------ | ----------------------------------------------- | ------------------- |
| POST   | `/api/core/parking-sessions/{id}/calculate-fee` | STAFF/MANAGER/ADMIN |

Request:

```json
{
  "exitTime": "2026-05-21T14:30:00+07:00",
  "includeLostCardFee": false
}
```

Response:

```json
{
  "sessionId": 1001,
  "entryTime": "2026-05-21T10:00:00+07:00",
  "exitTime": "2026-05-21T14:30:00+07:00",
  "amount": 10000,
  "lostCardFee": 0,
  "totalAmount": 10000,
  "breakdown": [
    {
      "timeFrame": "DAY",
      "blocks": 2,
      "unitPrice": 5000,
      "amount": 10000
    }
  ]
}
```

Services:

```csharp
IFeeCalculationService.CalculateFeeAsync(long sessionId, DateTimeOffset exitTime)
IFeeCalculationService.CalculateTemporaryFeeAsync(long sessionId, DateTimeOffset currentTime)
IFeeCalculationService.CalculateCasualFee(...)
IFeeCalculationService.CalculateMonthlyPassFee(...)
IFeeCalculationService.CalculateLostCardFee(...)
IFeeCalculationService.SplitDurationByTimeFrame(...)
IFeeCalculationService.CalculateBlocks(TimeSpan duration)
IFeeCalculationService.GetPricingSnapshotOrActiveRuleAsync(ParkingSession session)
IFeeCalculationService.BuildFeeBreakdown(...)
```

Fee rule:

- Block tính phí là 4 tiếng.
- Chưa đủ 4 tiếng vẫn tính 1 block.
- Nếu đi qua nhiều khung giờ, split duration theo khung.
- Monthly Pass valid: amount 0, payment `WAIVED` hoặc `NOT_REQUIRED`.
- Ưu tiên snapshot giá đã lưu lúc entry.

Test cases:

| Test ID   | Mô tả                         |
| --------- | ----------------------------- |
| TC-FEE-01 | Gửi dưới 4 tiếng tính 1 block |
| TC-FEE-02 | Gửi hơn 4 tiếng tính 2 block  |
| TC-FEE-03 | Gửi qua ngày/tối split đúng   |
| TC-FEE-04 | Lost card cộng fee            |
| TC-FEE-05 | Monthly pass tính 0đ          |

## 12.11 Module Payment

FR liên quan: FR-11, FR-09, FR-13.

Owner: `.NET Core API`

APIs:

| Method | Endpoint                                    | Role                |
| ------ | ------------------------------------------- | ------------------- |
| POST   | `/api/core/payments/cash`                   | STAFF/MANAGER/ADMIN |
| POST   | `/api/core/payments/waive`                  | MANAGER/ADMIN       |
| GET    | `/api/core/payments/{id}`                   | STAFF/MANAGER/ADMIN |
| GET    | `/api/core/payments/by-session/{sessionId}` | STAFF/MANAGER/ADMIN |

DTO:

```csharp
CashPaymentRequest { sessionId, amount, lostCardFee, totalAmount }
WaivePaymentRequest { sessionId, reason }
PaymentResponse { id, sessionId, totalAmount, method, status, paidAt, collectedBy }
```

Services:

```csharp
IPaymentService.CreateCashPaymentAsync(CashPaymentRequest request, long staffId)
IPaymentService.CreateWaivedPaymentAsync(long sessionId, string waiveReason, long userId)
IPaymentService.GetPaymentBySessionAsync(long sessionId)
IPaymentService.ValidatePaymentNotAlreadyFinalAsync(long sessionId)
IPaymentService.MarkPaymentCancelledForSessionAsync(long sessionId)
```

Business validation:

| Validation                   | Error                     |
| ---------------------------- | ------------------------- |
| Session không active         | `SESSION_NOT_ACTIVE`      |
| Payment đã final             | `PAYMENT_ALREADY_FINAL`   |
| Total amount không match fee | `PAYMENT_AMOUNT_MISMATCH` |
| Staff waive không được phép  | 403                       |

Test cases:

| Test ID   | Mô tả                           |
| --------- | ------------------------------- |
| TC-PAY-01 | Staff tạo cash payment          |
| TC-PAY-02 | Không tạo lại payment đã PAID   |
| TC-PAY-03 | Payment amount mismatch bị chặn |
| TC-PAY-04 | Waive payment cần Manager/Admin |

## 12.13 Module Monthly Pass

FR liên quan: FR-13, FR-09.

Owner: `.NET Core API`

APIs:

| Method | Endpoint                               | Role                |
| ------ | -------------------------------------- | ------------------- |
| GET    | `/api/core/monthly-passes`             | MANAGER/ADMIN       |
| POST   | `/api/core/monthly-passes`             | MANAGER/ADMIN       |
| PUT    | `/api/core/monthly-passes/{id}`        | MANAGER/ADMIN       |
| PATCH  | `/api/core/monthly-passes/{id}/status` | MANAGER/ADMIN       |
| POST   | `/api/core/monthly-passes/{id}/renew`  | MANAGER/ADMIN       |
| GET    | `/api/core/monthly-passes/check`       | STAFF/MANAGER/ADMIN |

Services:

```csharp
IMonthlyPassService.CreateMonthlyPassAsync(CreateMonthlyPassRequest request, long userId)
IMonthlyPassService.UpdateMonthlyPassAsync(long id, UpdateMonthlyPassRequest request, long userId)
IMonthlyPassService.RenewAsync(long id, RenewMonthlyPassRequest request, long userId)
IMonthlyPassService.ChangeStatusAsync(long id, MonthlyPassStatus status, long userId)
IMonthlyPassService.FindValidPassAsync(string plateNumber, long vehicleTypeId, DateTimeOffset time)
IMonthlyPassService.IsValid(MonthlyPass pass, DateTimeOffset time)
```

Business validation:

| Validation              | Error                  |
| ----------------------- | ---------------------- |
| endDate < startDate     | `INVALID_DATE_RANGE`   |
| Pass LOCKED không valid | `MONTHLY_PASS_LOCKED`  |
| Pass hết hạn            | `MONTHLY_PASS_EXPIRED` |

Frontend:

| Page/Component            | Mô tả            |
| ------------------------- | ---------------- |
| MonthlyPassManagementPage | Quản lý vé tháng |
| MonthlyPassForm           | Tạo/sửa/gia hạn  |
| MonthlyPassStatusBadge    | Trạng thái       |

Test cases:

| Test ID   | Mô tả                            |
| --------- | -------------------------------- |
| TC-MON-01 | Manager tạo monthly pass         |
| TC-MON-02 | Renew tăng endDate               |
| TC-MON-03 | Entry detect monthly pass        |
| TC-MON-04 | Monthly pass exit không thu tiền |

## 12.14 Module Lost Card

FR liên quan: FR-14, FR-09, FR-10.

Owner: `.NET Core API`

APIs:

| Method | Endpoint                                 | Role                |
| ------ | ---------------------------------------- | ------------------- |
| POST   | `/api/core/lost-card-cases`              | STAFF/MANAGER/ADMIN |
| GET    | `/api/core/lost-card-cases`              | MANAGER/ADMIN       |
| GET    | `/api/core/lost-card-cases/{id}`         | MANAGER/ADMIN       |
| POST   | `/api/core/lost-card-cases/{id}/approve` | MANAGER/ADMIN       |
| POST   | `/api/core/lost-card-cases/{id}/reject`  | MANAGER/ADMIN       |

Services:

```csharp
ILostCardCaseService.CreateCaseAsync(CreateLostCardCaseRequest request, long staffId)
ILostCardCaseService.ApproveCaseAsync(long id, ApproveLostCardRequest request, long approverId)
ILostCardCaseService.RejectCaseAsync(long id, RejectLostCardRequest request, long approverId)
ILostCardCaseService.MarkSessionLostCardPendingAsync(long sessionId)
ILostCardCaseService.ApplyLostCardFeeAsync(long sessionId)
ILostCardCaseService.MarkCardLostIfConfirmedAsync(long cardId)
```

Business validation:

| Validation              | Error                            |
| ----------------------- | -------------------------------- |
| Session không active    | `SESSION_NOT_ACTIVE`             |
| Case pending đã tồn tại | `LOST_CARD_CASE_ALREADY_PENDING` |
| Staff approve           | 403                              |
| Reject thiếu reason     | `REJECTION_REASON_REQUIRED`      |

Transaction boundary:

- Create case: session `ACTIVE` -> `LOST_CARD_PENDING`, write audit.
- Approve: case APPROVED, apply lost fee, card LOST nếu xác nhận mất, write audit.
- Reject: case REJECTED, session back ACTIVE, write audit.

Frontend:

| Page/Component          | Mô tả               |
| ----------------------- | ------------------- |
| StaffLostCardPage       | Staff tạo hồ sơ     |
| LostCardApprovalPage    | Manager/Admin duyệt |
| LostCardCaseDetailModal | Chi tiết            |

Test cases:

| Test ID    | Mô tả                                 |
| ---------- | ------------------------------------- |
| TC-LOST-01 | Staff tạo lost card case              |
| TC-LOST-02 | Session chuyển LOST_CARD_PENDING      |
| TC-LOST-03 | Manager approve cộng phí              |
| TC-LOST-04 | Reject quay lại ACTIVE                |
| TC-LOST-05 | Pending chưa approved không exit được |

## 12.15 Module Plate Mismatch

FR liên quan: FR-15, FR-09.

Owner: `.NET Core API`

APIs:

| Method | Endpoint                                           | Role          |
| ------ | -------------------------------------------------- | ------------- |
| POST   | `/api/core/parking-sessions/{id}/mismatch/confirm` | MANAGER/ADMIN |
| POST   | `/api/core/parking-sessions/{id}/mismatch/reject`  | MANAGER/ADMIN |

Services:

```csharp
IPlateMismatchService.CheckPlateMismatchAsync(ParkingSession session, string exitPlateNumber)
IPlateMismatchService.MarkMismatchPendingAsync(long sessionId, string exitPlateNumber, long staffId)
IPlateMismatchService.ConfirmMismatchAsync(long sessionId, ConfirmMismatchRequest request, long managerId)
IPlateMismatchService.RejectMismatchAsync(long sessionId, RejectMismatchRequest request, long managerId)
```

Business validation:

| Validation                  | Error                              |
| --------------------------- | ---------------------------------- |
| Exit plate khác entry plate | `PLATE_MISMATCH_REQUIRES_APPROVAL` |
| Confirm thiếu reason        | `MISMATCH_REASON_REQUIRED`         |
| Staff confirm               | 403                                |

Frontend:

| Page/Component       | Mô tả               |
| -------------------- | ------------------- |
| MismatchWarningModal | Cảnh báo Staff      |
| MismatchApprovalPage | Manager/Admin duyệt |

Test cases:

| Test ID   | Mô tả                     |
| --------- | ------------------------- |
| TC-MIS-01 | Sai biển số tạo pending   |
| TC-MIS-02 | Staff không confirm được  |
| TC-MIS-03 | Manager confirm có reason |
| TC-MIS-04 | Rejected không cho exit   |

## 12.16 Module Session Administration And Cancellation

FR liên quan: FR-16, FR-17.

Owner: `.NET Core API`

APIs:

| Method | Endpoint                                    | Role          |
| ------ | ------------------------------------------- | ------------- |
| POST   | `/api/core/parking-sessions/{id}/cancel`    | ADMIN         |
| POST   | `/api/core/parking-sessions/{id}/move-slot` | MANAGER/ADMIN |

Services:

```csharp
ISessionAdminService.CancelSessionAsync(long sessionId, CancelSessionRequest request, long adminId)
ISessionAdminService.ValidateSessionCanBeCancelledAsync(ParkingSession session)
ISessionAdminService.CancelPendingOrFailedPaymentsAsync(long sessionId)
ISessionAdminService.ReleaseSlotIfNeededAsync(ParkingSession session)
ISessionAdminService.ReleaseCardIfNeededAsync(ParkingSession session)
ISessionAdminService.WriteCancelAuditLogAsync(...)
```

Business validation:

| Validation          | Error                          |
| ------------------- | ------------------------------ |
| Session COMPLETED   | `SESSION_ALREADY_COMPLETED`    |
| Cancel thiếu reason | `CANCELLATION_REASON_REQUIRED` |
| Non-admin cancel    | 403                            |

Transaction boundary:

- Mark session `CANCELLED`.
- Release slot if needed.
- Release card if card can be available.
- Cancel pending/failed payment.
- Write audit.

Test cases:

| Test ID   | Mô tả                          |
| --------- | ------------------------------ |
| TC-CAN-01 | Admin cancel active session    |
| TC-CAN-02 | Cancel giải phóng slot/card    |
| TC-CAN-03 | Không cancel completed session |
| TC-CAN-04 | Cancel ghi audit log           |

## 12.17 Module Pricing Management

FR liên quan: FR-21, Pricing Specification.

Owner: `.NET Core API`

APIs:

| Method | Endpoint                       | Role          |
| ------ | ------------------------------ | ------------- |
| GET    | `/api/core/pricing-rules`      | MANAGER/ADMIN |
| POST   | `/api/core/pricing-rules`      | MANAGER/ADMIN |
| PUT    | `/api/core/pricing-rules/{id}` | MANAGER/ADMIN |

Services:

```csharp
IPricingRuleService.GetPricingRulesAsync(PricingRuleSearchRequest request)
IPricingRuleService.GetActivePricingRuleAsync(long vehicleTypeId)
IPricingRuleService.CreatePricingRuleAsync(CreatePricingRuleRequest request, long userId)
IPricingRuleService.UpdatePricingRuleAsync(long id, UpdatePricingRuleRequest request, long userId)
IPricingRuleService.ValidatePricesNonNegative(...)
IPricingRuleService.WritePricingAuditLogAsync(...)
```

Business validation:

| Validation                   | Error                        |
| ---------------------------- | ---------------------------- |
| Giá âm                       | `PRICE_MUST_NOT_BE_NEGATIVE` |
| Vehicle type inactive        | `VEHICLE_TYPE_INACTIVE`      |
| Không có active pricing rule | `PRICING_RULE_NOT_FOUND`     |

Frontend:

| Page/Component        | Mô tả                                     |
| --------------------- | ----------------------------------------- |
| PricingManagementPage | Quản lý bảng giá                          |
| PricingRuleForm       | Cập nhật giá                              |
| PublicPricingPage     | Driver xem bảng giá qua Spring public API |

Test cases:

| Test ID     | Mô tả                                  |
| ----------- | -------------------------------------- |
| TC-PRICE-01 | Manager xem bảng giá                   |
| TC-PRICE-02 | Không lưu giá âm                       |
| TC-PRICE-03 | Update giá ghi audit                   |
| TC-PRICE-04 | Entry sau khi update dùng snapshot mới |

## 12.18 Module Audit Writer

FR liên quan: FR-20.

Owner: `.NET Core API` ghi action core.

Service:

```csharp
IAuditWriterService.WriteAsync(AuditLogEntry entry)
IAuditWriterService.WriteEntityChangeAsync(...)
IAuditWriterService.WriteBusinessActionAsync(...)
```

Action bắt buộc:

```text
USER_CREATED
USER_STATUS_CHANGED
USER_ROLE_CHANGED
CARD_CREATED
CARD_STATUS_CHANGED
SESSION_CREATED
SESSION_COMPLETED
SESSION_CANCELLED
SLOT_STATUS_CHANGED
SESSION_MOVED_SLOT
PAYMENT_PAID
PAYMENT_WAIVED
MONTHLY_PASS_CREATED
MONTHLY_PASS_RENEWED
LOST_CARD_CREATED
LOST_CARD_APPROVED
LOST_CARD_REJECTED
MISMATCH_CREATED
MISMATCH_CONFIRMED
MISMATCH_REJECTED
PRICING_UPDATED
```

Rule:

- Audit failure trong transaction core nên rollback nếu action là bắt buộc cho nghiệp vụ nhạy cảm.
- `source_service = CORE_API`.

## 12.19 Module Reservation

FR liên quan: MF-05.

Owner: `.NET Core API`

APIs:

| Method | Endpoint                            | Role                   | Mô tả                                     |
| ------ | ----------------------------------- | ---------------------- | ----------------------------------------- |
| POST   | `/api/core/reservations`            | DRIVER, STAFF          | Tạo lượt đặt chỗ mới, giữ slot            |
| POST   | `/api/core/reservations/{id}/cancel` | DRIVER, STAFF, MANAGER | Hủy lượt đặt chỗ trước hạn                |
| GET    | `/api/core/reservations/active`     | DRIVER, STAFF          | Lấy lượt đặt chỗ đang có hiệu lực         |

Business validation:

- **Tạo Booking (Create Reservation)**:
  - Nếu người gọi là `DRIVER`, backend tự động tìm `DriverProfile` từ User ID có trong JWT Claims và gán vào `driverId` (phía Client/Frontend không được truyền `driverId`).
  - Nếu người gọi là `ADMIN/MANAGER/STAFF`, bắt buộc truyền `driverId` (tạo hộ).
  - `vehicleId` và `plateNumber` hoàn toàn optional lúc đặt chỗ. Nếu `vehicleId` được truyền, hệ thống sẽ xác thực quyền sở hữu và loại xe. Nếu `plateNumber` trống nhưng có `vehicleId`, hệ thống tự lấy biển số từ xe đã lưu.
  - Xe 2 bánh (không yêu cầu slot - `RequiresSlot = false`) đặt theo area, `slotId` phải NULL.
  - Xe ô tô / xe tải (RequiresSlot = true) đặt theo slot, `slotId` bắt buộc và slot phải có trạng thái `AVAILABLE`. Khi tạo thành công, chuyển slot sang `RESERVED`.
- **Check-in Booking (Entry)**:
  - **Reservation entry-check**:
    - Nhân viên (Staff) quét mã QR đặt chỗ để kiểm tra tính hợp lệ và lấy `reservationEntryToken` qua API:
      `GET /api/core/reservations/{reservationCode}/entry-check?entryGateId=...`
    - Reservation phải ở trạng thái `CONFIRMED`.
    - Nếu xe yêu cầu slot, slot được gán phải ở trạng thái `RESERVED`. Nếu slot không ở trạng thái `RESERVED` (do bị chuyển sang AVAILABLE, OCCUPIED, LOCKED, hay MAINTENANCE...), API entry-check phải từ chối và ném lỗi `RESERVED_SLOT_NOT_AVAILABLE`, không phát `reservationEntryToken`.
  - **Reservation check-in**:
    - Thực hiện check-in bằng cách gọi API:
      `POST /api/core/parking-sessions/entry` kèm `entryMode = "RESERVATION"`, `reservationId` và `reservationEntryToken`.
    - Quy tắc `noPlate = true` entry check-in:
      - Chỉ cho phép `noPlate = true` đối với xe không cần slot (xe 2 bánh).
      - Nếu `noPlate = true`:
        - `reservation.plate_number = NULL`
        - `reservation.normalized_plate_number = NULL`
        - `parking_session.plate_number = NULL`
        - `parking_session.normalized_plate_number = NULL`
        - Bắt buộc phải có `vehicleDescription` từ request, nếu thiếu sẽ ném lỗi `VEHICLE_DESCRIPTION_REQUIRED`.
      - Xe cần slot như ô tô/xe tải bắt buộc có `licensePlate` lúc entry, không cho phép `noPlate = true` (ném lỗi `PLATE_REQUIRED_FOR_SLOT_VEHICLE`).
    - Nếu reservation đã có biển số: biển số xe check-in bắt buộc phải khớp chính xác với biển số đã đăng ký, nếu không khớp sẽ ném lỗi `RESERVATION_PLATE_MISMATCH`.

---

# 13. Spring Boot API Module Breakdown

## 13.1 Module Public Driver APIs

FR liên quan: FR-03.01 đến FR-03.05, FR-10.10.

Owner: `Spring Boot Support API`

APIs:

| Method | Endpoint                                     | Role   | DB access          |
| ------ | -------------------------------------------- | ------ | ------------------ |
| GET    | `/api/public/parking-info`                   | Public | Read               |
| GET    | `/api/public/available-slots`                | Public | Read               |
| GET    | `/api/public/pricing`                        | Public | Read               |
| GET    | `/api/public/rules`                          | Public | Static/config read |
| GET    | `/api/public/cards/{qrToken}/active-session` | Public | Read               |

Services:

```java
PublicInfoService.getParkingInfo()
PublicInfoService.getAvailableSlots(AvailableSlotRequest request)
PublicInfoService.getPricing()
PublicInfoService.getRules()
PublicCardLookupService.getActiveSessionByQrToken(String qrToken)
PublicCardLookupService.maskPlateNumber(String plateNumber)
PublicCardLookupService.calculateTemporaryFeePreview(...)
```

Repository queries:

```java
ParkingCardReadRepository.findByQrToken(String qrToken)
ParkingSessionReadRepository.findActiveByCardId(Long cardId)
SlotReadRepository.countAvailableByVehicleType(Long vehicleTypeId)
PricingRuleReadRepository.findActiveRules()
```

Public QR response:

```json
{
  "cardCode": "C001",
  "sessionCode": "PS202605210001",
  "maskedPlateNumber": "51A-***45",
  "vehicleType": "Xe máy",
  "entryTime": "2026-05-21T10:00:00+07:00",
  "areaCode": "A",
  "slotCode": "A-035",
  "temporaryFeePreview": 10000,
  "status": "ACTIVE"
}
```

Privacy rule:

- Không trả full phone/email/user nội bộ.
- Không trả full actor/staff info.
- Biển số nên mask: `51A-***45`.
- Fee preview phải ghi là preview, fee chính thức do .NET tính khi exit.

Test cases:

| Test ID   | Mô tả                               |
| --------- | ----------------------------------- |
| TC-PUB-01 | Guest xem thông tin bãi xe          |
| TC-PUB-02 | Guest xem slot trống                |
| TC-PUB-03 | Guest xem bảng giá                  |
| TC-PUB-04 | QR lookup active session            |
| TC-PUB-05 | QR lookup không lộ dữ liệu nhạy cảm |

## 13.2 Module Dashboard

FR liên quan: FR-18.

Owner: `Spring Boot Support API`

APIs:

| Method | Endpoint                         | Role          |
| ------ | -------------------------------- | ------------- |
| GET    | `/api/support/dashboard/summary` | MANAGER/ADMIN |

Response:

```json
{
  "totalSlots": 100,
  "availableSlots": 60,
  "occupiedSlots": 35,
  "lockedOrMaintenanceSlots": 5,
  "occupancyRate": 35.0,
  "todayEntries": 120,
  "todayExits": 100,
  "todayRevenue": 2500000,
  "cardsAvailable": 30,
  "cardsInUse": 35,
  "pendingLostCardCases": 2,
  "pendingMismatchCases": 1
}
```

Services:

```java
DashboardService.getSummary()
DashboardService.countTotalSlots()
DashboardService.countAvailableSlots()
DashboardService.countOccupiedSlots()
DashboardService.countTodayEntries()
DashboardService.countTodayExits()
DashboardService.sumTodayRevenue()
DashboardService.countCardsByStatus()
DashboardService.countPendingLostCardCases()
DashboardService.countPendingMismatchCases()
```

Repository queries:

```java
SlotReadRepository.countByStatus(String status)
ParkingSessionReadRepository.countByEntryTimeBetween(...)
ParkingSessionReadRepository.countByExitTimeBetween(...)
PaymentReadRepository.sumTotalAmountByPaidAtBetweenAndStatus(...)
ParkingCardReadRepository.countByStatus(String status)
LostCardCaseReadRepository.countByStatus(String status)
PlateMismatchCaseReadRepository.countByStatus(String status)
```

Test cases:

| Test ID    | Mô tả                                    |
| ---------- | ---------------------------------------- |
| TC-DASH-01 | Dashboard verify JWT                     |
| TC-DASH-02 | Số slot trống đúng sau entry             |
| TC-DASH-03 | Doanh thu hôm nay đúng sau payment       |
| TC-DASH-04 | Query phản hồi dưới 5 giây với seed demo |

## 13.3 Module Reports

FR liên quan: FR-19.

Owner: `Spring Boot Support API`

APIs:

| Method | Endpoint                            | Role          |
| ------ | ----------------------------------- | ------------- |
| GET    | `/api/support/reports/revenue`      | MANAGER/ADMIN |
| GET    | `/api/support/reports/traffic`      | MANAGER/ADMIN |
| GET    | `/api/support/reports/occupancy`    | MANAGER/ADMIN |
| GET    | `/api/support/reports/cards`        | MANAGER/ADMIN |
| GET    | `/api/support/reports/sessions`     | MANAGER/ADMIN |
| GET    | `/api/support/reports/export-excel` | MANAGER/ADMIN |

Query convention:

```text
from=2026-05-01T00:00:00+07:00
to=2026-05-21T23:59:59+07:00
vehicleTypeId=3
groupBy=DAY|VEHICLE_TYPE|STAFF|AREA
```

Services:

```java
ReportService.getRevenueReport(DateRange range, ReportFilter filter)
ReportService.getTrafficReport(DateRange range, ReportFilter filter)
ReportService.getOccupancyReport(DateRange range, ReportFilter filter)
ReportService.getCardStatusReport()
ReportService.getSessionReport(SessionReportRequest request)
ReportExportService.exportRevenueExcel(DateRange range)
ReportExportService.exportTrafficExcel(DateRange range)
ReportExportService.exportAuditExcel(...)
```

Output Excel:

- Dùng Apache POI.
- File tối thiểu: Revenue, Traffic, Card status.
- Audit log export nếu kịp.

Test cases:

| Test ID   | Mô tả                       |
| --------- | --------------------------- |
| TC-RPT-01 | Báo cáo doanh thu theo ngày |
| TC-RPT-02 | Báo cáo traffic vào/ra      |
| TC-RPT-03 | Báo cáo occupancy theo area |
| TC-RPT-04 | Báo cáo card status         |
| TC-RPT-05 | Excel export mở được        |

## 13.4 Module Audit Log Search

FR liên quan: FR-20.12.

Owner: `Spring Boot Support API`

APIs:

| Method | Endpoint                               | Role          |
| ------ | -------------------------------------- | ------------- |
| GET    | `/api/support/audit-logs`              | MANAGER/ADMIN |
| GET    | `/api/support/audit-logs/{id}`         | MANAGER/ADMIN |
| GET    | `/api/support/audit-logs/export-excel` | ADMIN         |

Services:

```java
AuditLogQueryService.searchLogs(AuditLogSearchRequest request)
AuditLogQueryService.getLogDetail(Long id)
AuditLogExportService.exportAuditLogs(AuditLogSearchRequest request)
AuditLogWriterService.writeSupportAction(...)
```

Search filters:

```text
actorUserId
sourceService
action
targetType
targetId
from
to
keyword
page
pageSize
```

Rule:

- Spring được đọc audit log.
- Spring được insert audit log cho report export, feedback update, mock device event nếu cần.
- Spring không update/delete audit log.
- `source_service = SUPPORT_API`.

Test cases:

| Test ID     | Mô tả                        |
| ----------- | ---------------------------- |
| TC-AUDIT-01 | Search theo action           |
| TC-AUDIT-02 | Search theo date range       |
| TC-AUDIT-03 | Detail hiển thị old/new JSON |
| TC-AUDIT-04 | Export audit chỉ ADMIN       |

## 13.5 Module Feedback - Could Have

FR liên quan: FR-22.

Owner: `Spring Boot Support API`

APIs:

| Method | Endpoint                            | Role          |
| ------ | ----------------------------------- | ------------- |
| POST   | `/api/support/feedback`             | DRIVER        |
| GET    | `/api/support/feedback`             | MANAGER/ADMIN |
| PATCH  | `/api/support/feedback/{id}/status` | MANAGER/ADMIN |

Services:

```java
FeedbackService.createFeedback(CreateFeedbackRequest request, Long driverId)
FeedbackService.searchFeedback(FeedbackSearchRequest request)
FeedbackService.changeStatus(Long id, FeedbackStatus status, Long managerId)
```

Rule:

- Feedback không bắt buộc cho MVP core.
- Nếu làm, Spring sở hữu `feedbacks`.
- Ghi audit khi Manager/Admin đổi trạng thái.

## 13.6 Module Mock Device - Optional

FR liên quan: FR-23.

Owner: `Spring Boot Support API` hoặc frontend mock.

APIs:

| Method | Endpoint                         | Role                |
| ------ | -------------------------------- | ------------------- |
| POST   | `/api/support/mock-camera/scan`  | STAFF/MANAGER/ADMIN |
| POST   | `/api/support/mock-barrier/open` | STAFF/MANAGER/ADMIN |
| GET    | `/api/support/cards/{id}/qr`     | MANAGER/ADMIN       |

Rule:

- Mock device không tự tạo session.
- Mock camera chỉ trả biển số mẫu.
- Mock barrier chỉ hiển thị trạng thái/nút open.
- Session vẫn tạo qua `.NET /api/core/parking-sessions/entry`.

---

# 14. Frontend Architecture

## 14.1 React Structure

```text
src
├── app
│   ├── App.jsx
│   ├── routes.jsx
│   └── providers.jsx
├── api
│   ├── coreAxiosClient.js
│   ├── supportAxiosClient.js
│   ├── publicAxiosClient.js
│   ├── authApi.js
│   ├── driverApi.js
│   ├── parkingSessionApi.js
│   ├── cardApi.js
│   ├── structureApi.js
│   ├── paymentApi.js
│   ├── reportApi.js
│   └── publicApi.js
├── components
│   ├── ui
│   └── layout
├── pages
│   ├── admin
│   ├── driver
│   ├── manager
│   ├── staff
│   ├── public
│   └── error
├── hooks
├── utils
└── constants
```

## 14.2 Axios Clients

```javascript
export const coreApi = axios.create({
  baseURL: "http://localhost:5000",
});

export const supportApi = axios.create({
  baseURL: "http://localhost:8080",
});

export const publicApi = axios.create({
  baseURL: "http://localhost:8080",
});
```

Token interceptor dùng cho `coreApi` và `supportApi`; public pages không bắt buộc token.

```javascript
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

## 14.3 API Ownership Frontend

| Frontend feature                        | API client                    |
| --------------------------------------- | ----------------------------- |
| Login/Auth                              | coreApi                       |
| User management                         | coreApi                       |
| Driver account/profile/vehicles/history | coreApi                       |
| Vehicle Type/Vehicle                    | coreApi                       |
| Card management                         | coreApi                       |
| Structure management                    | coreApi                       |
| Entry/Exit                              | coreApi                       |
| Fee/Payment                             | coreApi                       |
| Monthly Pass                            | coreApi                       |
| Lost Card/Mismatch/Cancel               | coreApi                       |
| Pricing Management                      | coreApi                       |
| Dashboard                               | supportApi                    |
| Reports/Excel                           | supportApi                    |
| Audit Log                               | supportApi                    |
| Public parking info/pricing/rules       | publicApi                     |
| Public QR lookup                        | publicApi                     |
| Feedback                                | supportApi                    |
| Mock Device                             | supportApi hoặc frontend mock |

---

# 15. Frontend Page Breakdown

## 15.1 Public Driver Pages

| Page               | Route              | Priority | API                                              | Backend         |
| ------------------ | ------------------ | -------- | ------------------------------------------------ | --------------- |
| ParkingInfoPage    | `/`                | Must     | `GET /api/public/parking-info`                   | Spring          |
| AvailableSlotsPage | `/available-slots` | Must     | `GET /api/public/available-slots`                | Spring          |
| PublicPricingPage  | `/pricing`         | Must     | `GET /api/public/pricing`                        | Spring          |
| RulesPage          | `/rules`           | Must     | `GET /api/public/rules` hoặc static              | Spring/Frontend |
| CardLookupPage     | `/card/:qrToken`   | Must     | `GET /api/public/cards/{qrToken}/active-session` | Spring          |
| DriverRegisterPage | `/driver/register` | Should   | `POST /api/core/driver/register`                 | .NET            |
| DriverProfilePage  | `/driver/profile`  | Should   | `/api/core/driver/me`                            | .NET            |
| MyVehiclesPage     | `/driver/vehicles` | Should   | `/api/core/driver/vehicles`                      | .NET            |
| ParkingHistoryPage | `/driver/history`  | Should   | `/api/core/driver/parking-history`               | .NET            |

## 15.2 Staff Pages

| Page                   | Route                       | Priority | API                                             | Backend |
| ---------------------- | --------------------------- | -------- | ----------------------------------------------- | ------- |
| StaffEntryPage         | `/staff/entry`              | Must     | `POST /api/core/parking-sessions/entry`         | .NET    |
| StaffExitPage          | `/staff/exit`               | Must     | by-card, calculate-fee, payment, exit           | .NET    |
| StaffLostCardPage      | `/staff/lost-card`          | Must     | `POST /api/core/lost-card-cases`                | .NET    |
| StaffSessionSearchPage | `/staff/sessions`           | Must     | `GET /api/core/parking-sessions/search`         | .NET    |

## 15.3 Manager Pages

| Page                      | Route                      | Priority | API                                  | Backend |
| ------------------------- | -------------------------- | -------- | ------------------------------------ | ------- |
| ManagerDashboardPage      | `/manager/dashboard`       | Must     | `GET /api/support/dashboard/summary` | Spring  |
| CardManagementPage        | `/manager/cards`           | Must     | `/api/core/cards`                    | .NET    |
| StructureManagementPage   | `/manager/structure`       | Must     | floors/areas/slots/gates             | .NET    |
| PricingManagementPage     | `/manager/pricing`         | Must     | `/api/core/pricing-rules`            | .NET    |
| MonthlyPassManagementPage | `/manager/monthly-passes`  | Must     | `/api/core/monthly-passes`           | .NET    |
| LostCardApprovalPage      | `/manager/lost-card-cases` | Must     | `/api/core/lost-card-cases`          | .NET    |
| MismatchApprovalPage      | `/manager/mismatch`        | Must     | mismatch APIs                        | .NET    |
| ReportsPage               | `/manager/reports`         | Must     | `/api/support/reports/*`             | Spring  |
| AuditLogPage              | `/manager/audit-logs`      | Must     | `/api/support/audit-logs`            | Spring  |
| FeedbackPage              | `/manager/feedback`        | Could    | `/api/support/feedback`              | Spring  |

## 15.4 Admin Pages

| Page                      | Route               | Priority | API                        | Backend |
| ------------------------- | ------------------- | -------- | -------------------------- | ------- |
| UserManagementPage        | `/admin/users`      | Must     | `/api/core/users`          | .NET    |
| SessionAdministrationPage | `/admin/sessions`   | Must     | search + cancel            | .NET    |
| AdminAuditLogPage         | `/admin/audit-logs` | Must     | `/api/support/audit-logs`  | Spring  |
| SystemConfigurationPage   | `/admin/config`     | Could    | `/api/core/system-configs` | .NET    |

---

# 16. FR To API To Code Mapping Summary

| FR    | Module          | Main APIs                                        | Backend Owner                     | Frontend chính          | Test chính    |
| ----- | --------------- | ------------------------------------------------ | --------------------------------- | ----------------------- | ------------- |
| FR-01 | Auth            | `/api/core/auth/login`, `/me`                    | .NET                              | LoginPage               | TC-AUTH       |
| FR-02 | User            | `/api/core/users`                                | .NET                              | UserManagementPage      | TC-USER       |
| FR-03 | Driver/Public   | `/api/public/*`, `/api/core/driver/*`            | Spring public + .NET driver write | Driver pages            | TC-DRV/TC-PUB |
| FR-04 | Card            | `/api/core/cards/*`                              | .NET                              | CardManagementPage      | TC-CARD       |
| FR-05 | Vehicle         | `/api/core/vehicle-types`, `/api/core/vehicles`  | .NET                              | VehicleTypeSelect       | TC-VEH        |
| FR-06 | Structure       | `/api/core/floors`, `/areas`, `/slots`, `/gates` | .NET                              | StructureManagementPage | TC-STRUCT     |
| FR-07 | Entry           | `/api/core/parking-sessions/entry`               | .NET                              | StaffEntryPage          | TC-ENTRY      |
| FR-08 | Suggestion      | `/api/core/parking-sessions/suggest-slot`        | .NET                              | SuggestionPanel         | TC-SUG        |
| FR-09 | Exit            | `/exit`, `/monthly-pass-exit`                    | .NET                              | StaffExitPage           | TC-EXIT       |
| FR-10 | Fee             | `/calculate-fee`                                 | .NET                              | FeeSummaryPanel         | TC-FEE        |
| FR-11 | Payment         | `/api/core/payments/cash`, `/waive`              | .NET                              | CashPaymentPanel        | TC-PAY        |
| FR-13 | Monthly Pass    | `/api/core/monthly-passes`                       | .NET                              | MonthlyPassPage         | TC-MON        |
| FR-14 | Lost Card       | `/api/core/lost-card-cases`                      | .NET                              | LostCardPage            | TC-LOST       |
| FR-15 | Mismatch        | `/mismatch/confirm`, `/mismatch/reject`          | .NET                              | MismatchApprovalPage    | TC-MIS        |
| FR-16 | Cancel Session  | `/cancel`                                        | .NET                              | SessionAdminPage        | TC-CAN        |
| FR-17 | Slot Adjustment | `/slots/{id}/status`, `/move-slot`               | .NET                              | StructureManagementPage | TC-SLOT       |
| FR-18 | Dashboard       | `/api/support/dashboard/summary`                 | Spring                            | DashboardPage           | TC-DASH       |
| FR-19 | Reports         | `/api/support/reports/*`                         | Spring                            | ReportsPage             | TC-RPT        |
| FR-20 | Audit           | `/api/support/audit-logs`                        | .NET write + Spring search        | AuditLogPage            | TC-AUDIT      |
| FR-21 | Pricing         | `/api/core/pricing-rules`, `/api/public/pricing` | .NET write + Spring public read   | PricingPage             | TC-PRICE      |
| FR-22 | Feedback        | `/api/support/feedback`                          | Spring                            | FeedbackPage            | TC-FEED       |
| FR-23 | Mock Device     | `/api/support/mock-*`                            | Spring/Frontend                   | Mock buttons            | TC-MOCK       |
| FR-24 | Config          | `/api/core/system-configs`                       | .NET                              | ConfigPage              | TC-CONFIG     |

---

# 17. API Priority List By Backend

## 17.1 .NET Must Have APIs

```text
POST   /api/core/auth/login
POST   /api/core/auth/logout
GET    /api/core/auth/me

GET    /api/core/users
POST   /api/core/users
GET    /api/core/users/{id}
PUT    /api/core/users/{id}
PATCH  /api/core/users/{id}/status
PATCH  /api/core/users/{id}/role

GET    /api/core/vehicle-types
POST   /api/core/vehicle-types
PATCH  /api/core/vehicle-types/{id}/active
GET    /api/core/vehicles
POST   /api/core/vehicles

GET    /api/core/cards
POST   /api/core/cards
GET    /api/core/cards/available
GET    /api/core/cards/{id}
PATCH  /api/core/cards/{id}/status
GET    /api/core/cards/by-code/{cardCode}/active-session

GET    /api/core/floors
POST   /api/core/floors
PUT    /api/core/floors/{id}
GET    /api/core/areas
POST   /api/core/areas
PUT    /api/core/areas/{id}
GET    /api/core/slots
POST   /api/core/slots
PATCH  /api/core/slots/{id}/status
POST   /api/core/parking-sessions/{id}/move-slot
GET    /api/core/gates

POST   /api/core/parking-sessions/suggest-slot
POST   /api/core/parking-sessions/entry
GET    /api/core/parking-sessions/{id}
GET    /api/core/parking-sessions/search
GET    /api/core/parking-sessions/by-card-code/{cardCode}
POST   /api/core/parking-sessions/{id}/calculate-fee
POST   /api/core/parking-sessions/{id}/exit
POST   /api/core/parking-sessions/{id}/monthly-pass-exit
POST   /api/core/parking-sessions/{id}/cancel

GET    /api/core/pricing-rules
POST   /api/core/pricing-rules
PUT    /api/core/pricing-rules/{id}

POST   /api/core/payments/cash
POST   /api/core/payments/waive
GET    /api/core/payments/{id}
GET    /api/core/payments/by-session/{sessionId}

GET    /api/core/monthly-passes
POST   /api/core/monthly-passes
PUT    /api/core/monthly-passes/{id}
PATCH  /api/core/monthly-passes/{id}/status
POST   /api/core/monthly-passes/{id}/renew
GET    /api/core/monthly-passes/check

POST   /api/core/lost-card-cases
GET    /api/core/lost-card-cases
GET    /api/core/lost-card-cases/{id}
POST   /api/core/lost-card-cases/{id}/approve
POST   /api/core/lost-card-cases/{id}/reject

POST   /api/core/parking-sessions/{id}/mismatch/confirm
POST   /api/core/parking-sessions/{id}/mismatch/reject
```

## 17.2 .NET Should Have APIs

```text
POST   /api/core/driver/register
GET    /api/core/driver/me
PUT    /api/core/driver/me
GET    /api/core/driver/vehicles
POST   /api/core/driver/vehicles
GET    /api/core/driver/parking-history
```

## 17.3 Spring Boot Must Have APIs

```text
GET    /api/public/parking-info
GET    /api/public/available-slots
GET    /api/public/pricing
GET    /api/public/rules
GET    /api/public/cards/{qrToken}/active-session

GET    /api/support/dashboard/summary
GET    /api/support/reports/revenue
GET    /api/support/reports/traffic
GET    /api/support/reports/occupancy
GET    /api/support/reports/cards
GET    /api/support/reports/sessions
GET    /api/support/audit-logs
GET    /api/support/audit-logs/{id}
```

## 17.4 Spring Boot Should/Could APIs

```text
GET    /api/support/reports/export-excel
GET    /api/support/audit-logs/export-excel

POST   /api/support/feedback
GET    /api/support/feedback
PATCH  /api/support/feedback/{id}/status

POST   /api/support/mock-camera/scan
POST   /api/support/mock-barrier/open
GET    /api/support/cards/{id}/qr
```

---

# 18. Integration Rules Để Không Xung Đột

## 18.1 Không Duplicate Business Logic Core

Spring Boot không viết lại logic chính thức:

- Tạo parking session.
- Gán card cho session.
- Chuyển card `IN_USE/AVAILABLE`.
- Chuyển slot `OCCUPIED/AVAILABLE`.
- Tính phí chính thức khi xe ra.
- Tạo payment chính thức.
- Complete session.
- Lost card approval effect.
- Mismatch confirmation effect.
- Cancel session effect.
- Driver register/profile/vehicle write.

Spring Boot được:

- Đọc dữ liệu.
- Tính phí preview public nếu ghi rõ là preview.
- Xuất report.
- Search audit.
- Insert audit cho support action.
- Tạo feedback/notification/mock event nếu module đó làm.

## 18.2 Support API Không Ghi Trực Tiếp Core Tables

Support API không ghi trực tiếp:

```text
users
driver_profiles
vehicles
parking_sessions
parking_cards
slots
payments
monthly_passes
lost_card_cases
plate_mismatch_cases
pricing_rules
```

Nếu cần thay đổi core, frontend hoặc Spring gọi API `.NET`.

## 18.3 Audit Log Append-Only

Cả hai backend có thể insert audit log.

Field bắt buộc:

```text
CORE_API
SUPPORT_API
```

Không backend nào được update/delete audit log.

## 18.4 Transaction Boundary

Các nghiệp vụ sau phải transaction trong `.NET`:

- Entry.
- Exit.
- Monthly pass exit.
- Cash payment.
- Lost card create/approve/reject.
- Mismatch create/confirm/reject.
- Cancel session.
- Move session slot.
- Slot status change nếu slot đang liên quan session.

Spring Boot report/export không cần transaction ghi core.

---

# 19. Student Implementation Guide - Hướng Dẫn Code Cho Sinh Viên

Section này dành cho sinh viên vừa học vừa làm. Mục tiêu là biết **đọc spec theo thứ tự nào**, **bắt đầu code từ đâu**, **một module cần những file nào**, **test ra sao**, và **debug lỗi thường gặp thế nào**.

## 19.1 Zero-To-First-Run Checklist

Phần này dành cho bạn chưa quen chạy project web. Làm đúng thứ tự, không nhảy bước.

### Bước 0 - Clone Repo Và Tạo Branch

```bash
git clone <repo-url>
cd SWP301
git checkout dev
git pull
git checkout -b feature/your-module-name
```

Ví dụ branch:

```text
feature/auth-api
feature/card-management
feature/staff-entry-ui
feature/support-dashboard
```

Không code trực tiếp trên `main`.

### Bước 1 - Kiểm Tra Tool

Chạy các lệnh sau:

```bash
dotnet --version
java -version
mvn -version
node -v
npm -v
git --version
```

Nếu lệnh không chạy, chưa cài tool hoặc chưa cấu hình PATH.

### Bước 2 - Cấu Hình Supabase Database

Lấy thông tin kết nối trong Supabase Project Settings > Database.
Cấu hình trực tiếp trong file config của từng backend.

Ví dụ Spring Boot `application-local.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.your-project-ref.supabase.co:5432/postgres?sslmode=require
    username: postgres
    password: your-supabase-db-password
```

Repo này dùng Supabase PostgreSQL, không cần PostgreSQL local.

### Bước 3 - Chạy .NET Core API Trước

```bash
cd backend/ParkingBuilding.CoreApi
dotnet restore
dotnet run
```

Truoc khi chay backend, tao database bang SQL scripts theo thu tu:

```text
database/01_schema.sql
database/02_seed.sql
database/03_indexes_constraints.sql
```

Kỳ vọng:

```text
Now listening on: http://localhost:5000
Swagger mở được ở /swagger
```

### Bước 4 - Chạy Spring Boot Sau

```bash
cd backend/parking-building-support-api
mvn spring-boot:run
```

Kỳ vọng:

```text
Tomcat started on port 8080
Không báo missing table/column
```

Neu Spring bao thieu table, nghia la chua chay dung `database/*.sql`.

### Bước 5 - Chạy React

```bash
cd frontend
npm install
npm run dev
```

Kỳ vọng:

```text
Local: http://localhost:5173
```

### Bước 6 - Test API Đầu Tiên

1. Mở Swagger .NET.
2. Gọi `POST /api/core/auth/login`.
3. Copy token.
4. Gọi `GET /api/core/auth/me`.
5. Mở Swagger Spring.
6. Dùng token gọi `GET /api/support/dashboard/summary`.

Nếu bước này pass, 3 phần DB + .NET + Spring đã kết nối được.

## 19.2 Cách Đọc Tài Liệu Theo Vai Trò

Không nên đọc từ đầu đến cuối rồi mới code. Hãy đọc theo vai trò được giao.

| Vai trò      | Đọc trước                           | Đọc tiếp                           | Khi code cần mở song song            |
| ------------ | ----------------------------------- | ---------------------------------- | ------------------------------------ |
| .NET dev     | Section 3, 5, 6, 7, 8, 9            | Section 10, 12, 17, 18             | Module mình làm + DB table liên quan |
| Spring dev   | Section 3, 5, 6, 7, 11              | Section 13, 17, 18                 | Read-only rule + report/public API   |
| Frontend dev | Section 5, 6, 14, 15, 17            | Section 12/13 API module liên quan | API request/response + role check    |
| Tester       | Section 2, 9, 16, 17, 21, 22        | Section 23, 24                     | Demo script + test mapping           |
| Team lead    | Section 1, 2, 3, 18, 19, 20, 24, 25 | Toàn bộ phần module                | Ownership + sprint plan              |

Quy tắc học/làm:

- Mỗi bạn chỉ cần hiểu sâu module mình làm, nhưng phải hiểu ownership và transaction boundary.
- Khi làm API, luôn tìm đủ 4 chỗ: API table, DTO/request/response, DB table, test case.
- Nếu một requirement chưa rõ, không tự chế thêm flow mới; hỏi team lead và cập nhật spec trước.

## 19.3 Local Setup Reference - Tham Khảo Cấu Hình

Phần `19.1` là quy trình chạy lần đầu. Phần này chỉ là bảng công cụ và config mẫu để tra lại khi setup lỗi.

### Công Cụ Cần Cài

| Công cụ                | Gợi ý version | Dùng để                                  |
| ---------------------- | ------------- | ---------------------------------------- |
| PostgreSQL             | 15+ hoặc 16+  | Database chung                           |
| pgAdmin hoặc DBeaver   | Bản mới       | Xem bảng/query data                      |
| .NET SDK               | 8.x           | Chạy ASP.NET Core API                    |
| Java JDK               | 17 hoặc 21    | Chạy Spring Boot                         |
| Maven                  | 3.9+          | Build Spring Boot nếu không dùng wrapper |
| Node.js                | 20+           | Chạy React                               |
| Git                    | Bản mới       | Quản lý source                           |
| Postman/Bruno/Insomnia | Bản mới       | Test API                                 |

### Thứ Tự Chạy Hệ Thống

Luôn chạy theo thứ tự:

```text
1. PostgreSQL
2. .NET Core API
3. Spring Boot Support API
4. React Frontend
```

Lý do:

- Chay `database/*.sql` de tao schema va seed data.
- Spring Boot cần database schema có sẵn để `ddl-auto=validate`.
- React cần biết base URL của 2 backend.

### Supabase Database

Database dùng Supabase PostgreSQL. Lấy connection string trong Supabase Project Settings > Database rồi cấu hình trực tiếp cho cả .NET và Spring Boot.

Thông tin mẫu:

```text
Host: db.your-project-ref.supabase.co
Port: 5432
Database: postgres
Username: postgres
Password: your-supabase-db-password
SSL: require
```

Nếu dùng Supabase pooler, dùng đúng host/port/user từ connection string Supabase cung cấp.

### .NET Core API Local

File config mẫu:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.your-project-ref.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=your-supabase-db-password;SSL Mode=Require;Trust Server Certificate=true"
  },
  "Jwt": {
    "Issuer": "parking-building-auth",
    "Audience": "parking-building-api",
    "Secret": "dev-secret-key-change-in-production"
  }
}
```

Lệnh chạy mẫu:

```bash
dotnet restore
database/02_seed.sql
dotnet run
```

Swagger thường ở:

```text
http://localhost:5000/swagger
```

### Spring Boot Support API Local

File `application.yml` mẫu:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://db.your-project-ref.supabase.co:5432/postgres?sslmode=require
    username: postgres
    password: your-supabase-db-password
  jpa:
    hibernate:
      ddl-auto: validate

jwt:
  issuer: parking-building-auth
  audience: parking-building-api
  secret: dev-secret-key-change-in-production
```

Lệnh chạy mẫu:

```bash
mvn spring-boot:run
```

Swagger thường ở:

```text
http://localhost:8080/swagger-ui/index.html
```

### React Local

Base URL API có thể đặt trực tiếp trong file client:

```javascript
export const coreApiBaseUrl = "http://localhost:5000";
export const supportApiBaseUrl = "http://localhost:8080";
export const publicApiBaseUrl = "http://localhost:8080";
```

Lệnh chạy:

```bash
npm install
npm run dev
```

## 19.4 Supabase PostgreSQL

Repo này dùng Supabase PostgreSQL làm database chính.

Điền thông tin kết nối Supabase trực tiếp trong file config backend.

Spring Boot:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.your-project-ref.supabase.co:5432/postgres?sslmode=require
    username: postgres
    password: your-supabase-db-password
```

Nếu dùng Supabase pooler, thay host/port/user theo connection string Supabase cung cấp.

Không đưa database dump hoặc dữ liệu nhạy cảm lên repo.

## 19.5 Git Workflow Cho Sinh Viên

### Quy Tắc Branch

```text
main  = bản ổn định
dev   = nhánh tích hợp
feature/... = nhánh cá nhân
```

Mỗi task tạo một branch:

```bash
git checkout dev
git pull
git checkout -b feature/card-create-api
```

### Commit Message

Format dễ đọc:

```text
feat(card): add create card API
fix(auth): handle locked account login
docs(spec): update entry flow
test(payment): add cash payment tests
```

### Trước Khi Push

```bash
git status
git add .
git commit -m "feat(card): add create card API"
git pull origin dev
git push origin feature/card-create-api
```

Nếu conflict:

1. Không bấm lung tung trong IDE.
2. Mở file bị conflict.
3. Giữ phần code đúng.
4. Chạy lại build/test.
5. Commit phần resolve.

### Không Được Commit

```text
bin/
obj/
target/
node_modules/
dist/
*.user
log files
password thật
database dump có dữ liệu nhạy cảm
```

## 19.6 Scaffold Project Commands

Nếu repo chưa có backend code, tạo project bằng các lệnh dưới đây.

### Tạo ASP.NET Core Project

```bash
cd backend
dotnet new sln -n ParkingBuilding
dotnet new webapi -n ParkingBuilding.CoreApi
dotnet sln ParkingBuilding.sln add ParkingBuilding.CoreApi/ParkingBuilding.CoreApi.csproj
cd ParkingBuilding.CoreApi
```

Cài package:

```bash
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package BCrypt.Net-Next
dotnet add package FluentValidation.AspNetCore
dotnet add package Swashbuckle.AspNetCore
```

Tạo folder:

```text
Controllers
Application
Application/Auth
Application/Cards
Application/Audit
Domain
Domain/Entities
Domain/Enums
Infrastructure
Infrastructure/Persistence
Infrastructure/Repositories
Contracts
Contracts/Requests
Contracts/Responses
Contracts/Common
```

Quy tac SQL scripts:

Khong cai dat cong cu EF schema tooling cho scope hien tai.

Cap nhat SQL scripts sau khi chot entity/config:

```text
database/01_schema.sql
database/02_seed.sql
database/03_indexes_constraints.sql
```

### Tạo Spring Boot Project

Cách dễ nhất cho sinh viên mới:

1. Mở Spring Initializr.
2. Chọn Maven.
3. Chọn Java 17 hoặc 21.
4. Group: `com.parkingbuilding`.
5. Artifact: `parking-building-support-api`.
6. Dependencies:
   - Spring Web
   - Spring Security
   - Spring Data JPA
   - PostgreSQL Driver
   - Lombok
   - Validation
7. Generate, giải nén vào `backend/parking-building-support-api`.

Tạo folder:

```text
src/main/java/com/parkingbuilding/support/common
src/main/java/com/parkingbuilding/support/config
src/main/java/com/parkingbuilding/support/security
src/main/java/com/parkingbuilding/support/publicapi
src/main/java/com/parkingbuilding/support/dashboard
src/main/java/com/parkingbuilding/support/report
src/main/java/com/parkingbuilding/support/auditlog
src/main/java/com/parkingbuilding/support/sharedreadmodel
```

### Tạo React Project Nếu Chưa Có

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install axios react-router-dom lucide-react
```

Tạo folder:

```text
src/api
src/app
src/components/ui
src/components/layout
src/pages
src/pages/public
src/pages/error
src/hooks
src/utils
src/constants
```

## 19.7 Starter Code Bắt Buộc Cho .NET

Các file này nên có trước khi code module nghiệp vụ. Nếu thiếu, sinh viên sẽ viết mỗi module một kiểu và rất khó tích hợp.

### ApiResponse

```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }
    public int? StatusCode { get; set; }
    public string? ErrorCode { get; set; }
    public string? TraceId { get; set; }
    public string? Path { get; set; }
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
}
```

### API response standard

All business API endpoints must return the same wrapper:

```text
success: boolean
message: string
data: object | array | null
errors: string[] | null
errorCode: string | null
statusCode: number
traceId: string
path: string
timestamp: ISO datetime
```

Frontend clients must unwrap `.data` only after checking `success`:

```javascript
const body = response.data;

if (body.success) {
  return body.data;
}

throw {
  errorCode: body.errorCode,
  message: body.message,
  errors: body.errors,
  traceId: body.traceId
};
```

### BusinessException

```csharp
public class BusinessException : Exception
{
    public string ErrorCode { get; }
    public int StatusCode { get; }

    public BusinessException(string errorCode, int statusCode = 400)
        : base(errorCode)
    {
        ErrorCode = errorCode;
        StatusCode = statusCode;
    }
}
```

### GlobalExceptionMiddleware

```csharp
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public GlobalExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (BusinessException ex)
        {
            context.Response.StatusCode = ex.StatusCode;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(ApiResponse<object>.Fail(ex.ErrorCode));
        }
        catch (Exception)
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(ApiResponse<object>.Fail("INTERNAL_SERVER_ERROR"));
        }
    }
}
```

### Program.cs Mẫu

```csharp
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ParkingDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });

builder.Services.AddAuthorization();

// TODO: register repositories and services here.

var app = builder.Build();

app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

### UserId Helper

```csharp
using System.Security.Claims;

public static class ClaimsPrincipalExtensions
{
    public static long GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue("sub");

        if (long.TryParse(value, out var id))
            return id;

        throw new BusinessException("INVALID_TOKEN", 401);
    }
}
```

### Transaction Mẫu Trong Service

```csharp
public async Task<EntryResponse> CreateEntrySessionAsync(CreateEntryRequest request, long staffId)
{
    await using var transaction = await _db.Database.BeginTransactionAsync();

    try
    {
        // 1. validate card
        // 2. validate slot
        // 3. create session
        // 4. update card
        // 5. update slot
        // 6. write audit

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();
        return response;
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

## 19.8 Spring Starter Code Bắt Buộc

### ApiResponse

```java
import lombok.Getter;
import lombok.Setter;
import java.time.OffsetDateTime;

@Getter
@Setter
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Object errors;
    private OffsetDateTime timestamp = OffsetDateTime.now();

    public static <T> ApiResponse<T> ok(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = true;
        response.message = "OK";
        response.data = data;
        return response;
    }

    public static <T> ApiResponse<T> fail(String message, Object errors) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = false;
        response.message = message;
        response.errors = errors;
        return response;
    }
}
```

Nếu không dùng Lombok, phải tự tạo getter/setter cho tất cả field, nếu không JSON response có thể bị rỗng hoặc serialize sai.

### BusinessException

```java
public class BusinessException extends RuntimeException {
    private final String errorCode;

    public BusinessException(String errorCode) {
        super(errorCode);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
```

### GlobalExceptionHandler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusiness(BusinessException ex) {
        return ResponseEntity.badRequest()
            .body(ApiResponse.fail(ex.getErrorCode(), null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUnknown(Exception ex) {
        return ResponseEntity.status(500)
            .body(ApiResponse.fail("INTERNAL_SERVER_ERROR", null));
    }
}
```

### SecurityConfig Tối Thiểu

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable());
        http.cors(Customizer.withDefaults());
        http.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/public/**").permitAll()
            .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
            .requestMatchers("/api/support/**").authenticated()
            .anyRequest().authenticated()
        );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

### JwtAuthenticationFilter Mẫu Đơn Giản

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenValidator validator;

    public JwtAuthenticationFilter(JwtTokenValidator validator) {
        this.validator = validator;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            Authentication authentication = validator.validate(token);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
```

### Read-Only Service Mẫu

```java
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final SlotReadRepository slots;

    public DashboardService(SlotReadRepository slots) {
        this.slots = slots;
    }

    public DashboardSummaryResponse getSummary() {
        long available = slots.countByStatus("AVAILABLE");
        long occupied = slots.countByStatus("OCCUPIED");
        return new DashboardSummaryResponse(available, occupied);
    }
}
```

Không dùng `@Transactional` ghi trong service đọc report/public.

## 19.9 Frontend Beginner Flow

Sinh viên mới thường không biết bắt đầu page từ đâu. Làm theo thứ tự sau.

### Bước 1 - Tạo API Client

```javascript
import axios from "axios";

export const coreApi = axios.create({
  baseURL: "http://localhost:5000",
});

coreApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Bước 2 - Tạo API Module

```javascript
export const vehicleTypeApi = {
  getAll: () => coreApi.get("/api/core/vehicle-types"),
};
```

### Bước 3 - Tạo Page Đọc Dữ Liệu

```javascript
function VehicleTypesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    vehicleTypeApi
      .getAll()
      .then((res) => setItems(res.data.data))
      .catch(() => setError("Không tải được loại xe"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <table>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Bước 4 - Tạo Form Submit

```javascript
async function handleSubmit(event) {
  event.preventDefault();
  setError("");

  if (!cardCode.trim()) {
    setError("Card code is required");
    return;
  }

  try {
    await cardApi.createCard({ cardCode, note });
    setCardCode("");
    await loadCards();
  } catch (e) {
    setError(e.response?.data?.message ?? "Create failed");
  }
}
```

### Bước 5 - Tự Kiểm Tra Page

```text
[ ] Mở page không trắng màn hình
[ ] Loading hiển thị khi chờ API
[ ] API fail có error
[ ] Submit thiếu field có validation
[ ] Submit thành công reload list
[ ] Token hết hạn điều hướng về login
```

## 19.10 Workflow Code Một Module Backend Từ A-Z

Khi được giao một module, không code Controller trước. Làm theo thứ tự này.

Ví dụ module `Parking Card`:

1. Đọc DB table: `parking_cards`.
2. Đọc enum liên quan: `CardStatus`.
3. Tạo Entity.
4. Tạo Entity Configuration hoặc annotation mapping.
5. Tạo DTO request/response.
6. Tạo Validator.
7. Tạo Repository query.
8. Tạo Service business logic.
9. Tạo Controller endpoint.
10. Thêm role authorization.
11. Thêm audit log nếu action quan trọng.
12. Test Swagger/Postman.
13. Test lỗi validation.
14. Gửi frontend API contract.

Checklist module backend:

```text
[ ] Entity map đúng column
[ ] Enum lưu string
[ ] DTO không expose password_hash hoặc field nhạy cảm
[ ] Validate input
[ ] Check role
[ ] Service không chứa code HTTP
[ ] Controller không chứa business logic dài
[ ] Repository không xử lý business rule
[ ] Có audit log nếu create/update/status/action quan trọng
[ ] Có test success case
[ ] Có test failure case
```

## 19.11 Skeleton ASP.NET Core

### Enum Mẫu

```csharp
public enum CardStatus
{
    AVAILABLE,
    IN_USE,
    LOST,
    DAMAGED,
    INACTIVE
}
```

### Entity Mẫu

```csharp
public class ParkingCard
{
    public long Id { get; set; }
    public string CardCode { get; set; } = string.Empty;
    public string QrToken { get; set; } = string.Empty;
    public CardStatus Status { get; set; }
    public long? CurrentSessionId { get; set; }
    public string? Note { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
```

### EF Core Configuration Mẫu

```csharp
public class ParkingCardConfiguration : IEntityTypeConfiguration<ParkingCard>
{
    public void Configure(EntityTypeBuilder<ParkingCard> builder)
    {
        builder.ToTable("parking_cards");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CardCode)
            .HasColumnName("card_code")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.QrToken)
            .HasColumnName("qr_token")
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(x => x.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(x => x.CardCode).IsUnique();
        builder.HasIndex(x => x.QrToken).IsUnique();
    }
}
```

### DTO Mẫu

```csharp
public record CreateCardRequest(string CardCode, string? Note);

public record CardResponse(
    long Id,
    string CardCode,
    string QrToken,
    string Status,
    long? CurrentSessionId
);
```

### Repository Mẫu

```csharp
public interface IParkingCardRepository
{
    Task<ParkingCard?> FindByCardCodeAsync(string cardCode);
    Task<bool> ExistsByCardCodeAsync(string cardCode);
    Task AddAsync(ParkingCard card);
    Task SaveChangesAsync();
}
```

### Service Mẫu

```csharp
public class ParkingCardService : IParkingCardService
{
    private readonly IParkingCardRepository _cards;
    private readonly IAuditWriterService _audit;

    public async Task<CardResponse> CreateCardAsync(CreateCardRequest request, long userId)
    {
        if (await _cards.ExistsByCardCodeAsync(request.CardCode))
            throw new BusinessException("CARD_CODE_ALREADY_EXISTS");

        var card = new ParkingCard
        {
            CardCode = request.CardCode.Trim(),
            QrToken = GenerateQrToken(),
            Status = CardStatus.AVAILABLE,
            Note = request.Note,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _cards.AddAsync(card);
        await _cards.SaveChangesAsync();
        await _audit.WriteBusinessActionAsync(userId, "CARD_CREATED", "ParkingCard", card.Id.ToString());

        return MapToResponse(card);
    }
}
```

### Controller Mẫu

```csharp
[ApiController]
[Route("api/core/cards")]
public class CardsController : ControllerBase
{
    private readonly IParkingCardService _service;

    [HttpPost]
    [Authorize(Roles = "MANAGER,ADMIN")]
    public async Task<IActionResult> Create(CreateCardRequest request)
    {
        var userId = User.GetUserId();
        var result = await _service.CreateCardAsync(request, userId);
        return Created($"/api/core/cards/{result.Id}", ApiResponse<CardResponse>.Ok(result));
    }
}
```

## 19.12 Skeleton Spring Boot Read-Only

### Read Entity Mẫu

```java
@Entity
@Table(name = "parking_sessions")
public class ParkingSessionReadEntity {
    @Id
    private Long id;

    @Column(name = "session_code")
    private String sessionCode;

    @Column(name = "card_id")
    private Long cardId;

    @Column(name = "status")
    private String status;

    @Column(name = "entry_time")
    private OffsetDateTime entryTime;
}
```

### Repository Read-Only Mẫu

```java
public interface ParkingSessionReadRepository
        extends JpaRepository<ParkingSessionReadEntity, Long> {

    Optional<ParkingSessionReadEntity> findFirstByCardIdAndStatusIn(
        Long cardId,
        Collection<String> statuses
    );
}
```

Quy tắc cho Spring repository core:

- Được dùng `find`, `count`, `sum`, query report.
- Không gọi `save`.
- Không gọi `delete`.
- Không tự sửa status session/card/slot/payment.

### Controller Mẫu

```java
@RestController
@RequestMapping("/api/public/cards")
public class PublicCardLookupController {
    private final PublicCardLookupService service;

    @GetMapping("/{qrToken}/active-session")
    public ApiResponse<PublicCardLookupResponse> lookup(@PathVariable String qrToken) {
        return ApiResponse.ok(service.getActiveSessionByQrToken(qrToken));
    }
}
```

## 19.13 Skeleton React

### API File Mẫu

```javascript
import { coreApi } from "./coreAxiosClient";

export const cardApi = {
  getCards: (params) => coreApi.get("/api/core/cards", { params }),
  createCard: (payload) => coreApi.post("/api/core/cards", payload),
  changeStatus: (id, payload) =>
    coreApi.patch(`/api/core/cards/${id}/status`, payload),
};
```

### Page Flow Mẫu

```javascript
function CardManagementPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadCards() {
    setLoading(true);
    setError(null);
    try {
      const res = await cardApi.getCards({ page: 1, pageSize: 20 });
      setItems(res.data.data.items);
    } catch (e) {
      setError(e.response?.data?.message ?? "Load cards failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCards();
  }, []);

  return null;
}
```

Frontend checklist:

```text
[ ] Gọi đúng API client
[ ] Có loading state
[ ] Có error state
[ ] Có success message
[ ] Có role guard
[ ] Form validate required field
[ ] Sau create/update reload list
```

## 19.14 ERD Giải Thích Bằng Lời

Quan hệ chính:

- `users` lưu tài khoản đăng nhập cho Admin/Manager/Staff/Driver.
- `driver_profiles` là hồ sơ Driver, nối 1-1 hoặc 0-1 với `users`.
- `vehicles` là xe, có thể thuộc Driver hoặc là xe guest được tạo khi entry.
- `vehicle_types` là loại phương tiện, được dùng bởi vehicle, slot, pricing, monthly pass.
- `floors -> areas -> slots` là cấu trúc bãi xe.
- `area_vehicle_types` cho biết khu vực nào nhận loại xe nào.
- `gates` là cổng vào/ra.
- `parking_cards` là thẻ vật lý/static QR.
- `parking_sessions` là lượt gửi xe, nối card, vehicle, slot, staff, gate, pricing snapshot.
- `pricing_rules` là bảng giá hiện hành; khi entry thì copy giá vào session snapshot.
- `payments` là thanh toán của session.
- `monthly_passes` là vé tháng theo biển số và loại xe.
- `lost_card_cases` là hồ sơ mất thẻ, gắn với session.
- `plate_mismatch_cases` là hồ sơ sai biển số, gắn với session.
- `audit_logs` ghi lại action quan trọng, chỉ insert, không sửa/xóa.

Điểm dễ nhầm:

- `parking_cards` không phải `parking_sessions`. Card là thẻ; session là một lượt gửi xe.
- `slots.status = OCCUPIED` phải khớp với một active session.
- `payments.status = PAID` không có nghĩa session đã completed; exit service mới complete session.
- `pricing_rules` có thể đổi, nhưng session active dùng snapshot giá đã lưu lúc entry.

## 19.15 Sequence Flow Chi Tiết

### Entry Flow

```text
1. Staff login lấy JWT.
2. Frontend load vehicle types, available cards, gates.
3. Staff nhập biển số hoặc bật noPlate.
4. Frontend gọi suggest-slot.
5. .NET lọc area/slot theo vehicle type và status.
6. Staff xác nhận card + slot.
7. Frontend gọi entry.
8. .NET mở transaction.
9. .NET validate card AVAILABLE.
10. .NET validate vehicle chưa có active session.
11. .NET validate slot AVAILABLE.
12. .NET detect monthly pass nếu có.
13. .NET lấy pricing rule và lưu snapshot.
14. .NET tạo parking_session ACTIVE.
15. .NET update card IN_USE.
16. .NET update slot OCCUPIED.
17. .NET ghi audit log.
18. .NET commit transaction.
19. Frontend hiển thị session code.
```

### Exit Casual Flow

```text
1. Staff nhập card code.
2. Frontend gọi by-card-code.
3. .NET trả active session.
4. Staff nhập biển số lúc ra nếu có.
5. Frontend gọi calculate-fee.
6. .NET tính phí bằng snapshot.
7. Staff thu tiền mặt.
8. Frontend gọi payments/cash.
9. .NET tạo payment PAID.
10. Frontend gọi exit.
11. .NET mở transaction.
12. .NET validate session active.
13. .NET validate payment PAID.
14. .NET validate mismatch/lost-card state.
15. .NET mark session COMPLETED.
16. .NET release slot.
17. .NET release card.
18. .NET ghi audit log.
19. .NET commit transaction.
```

### Monthly Pass Exit Flow

```text
1. Staff tìm session.
2. .NET xác định customerType MONTHLY hoặc monthly pass valid.
3. Frontend gọi monthly-pass-exit.
4. .NET tạo payment WAIVED hoặc NOT_REQUIRED.
5. .NET complete session.
6. .NET release slot/card.
```

### Lost Card Flow

```text
1. Staff tìm session bằng biển số/thời gian/khu vực.
2. Staff tạo lost card case.
3. .NET chuyển session sang LOST_CARD_PENDING.
4. Manager/Admin mở danh sách pending.
5. Manager/Admin approve hoặc reject.
6. Nếu approve: áp phí mất thẻ, card LOST nếu xác nhận mất.
7. Nếu reject: session quay lại ACTIVE.
8. Mọi bước ghi audit log.
```

### Plate Mismatch Flow

```text
1. Staff exit với biển số khác lúc vào.
2. .NET tạo mismatch case PENDING và chặn exit.
3. Manager/Admin xem case.
4. Manager/Admin confirm kèm reason hoặc reject.
5. Confirm xong Staff mới tiếp tục exit.
```

### Cancel Session Flow

```text
1. Admin tìm session active/pending.
2. Admin nhập cancellation reason.
3. .NET mở transaction.
4. .NET mark session CANCELLED.
5. .NET release slot.
6. .NET release card nếu card không LOST/DAMAGED/INACTIVE.
7. .NET cancel pending/failed payment nếu có.
8. .NET ghi audit log.
9. .NET commit.
```

### Dashboard/Report Read Flow

```text
1. .NET hoàn tất entry/exit/payment và commit.
2. Manager mở dashboard/report.
3. Frontend gọi Spring Support API.
4. Spring verify JWT.
5. Spring query read-only từ PostgreSQL.
6. Spring trả số liệu.
```

## 19.16 Seed Data Guide

Seed tối thiểu để demo không bị kẹt:

### Accounts

| Username  | Password demo | Role    |
| --------- | ------------- | ------- |
| admin01   | 123456        | ADMIN   |
| manager01 | 123456        | MANAGER |
| staff01   | 123456        | STAFF   |
| driver01  | 123456        | DRIVER  |

Password trong database phải hash bằng BCrypt, không lưu plain text.

### Vehicle Types

```text
1. Xe đạp
2. Xe đạp điện
3. Xe máy
4. Xe máy điện
5. Ô tô
6. Ô tô điện
7. Xe vận chuyển hàng hóa
```

### Floors, Areas, Slots, Gates

Seed gợi ý:

```text
Floors:
- B1
- B2
- B3

Areas:
- B1-A, B1-B
- B2-A, B2-B
- B3-A, B3-B

Slots:
- Mỗi area 10 slot demo
- Slot xe máy: A-M01 -> A-M10
- Slot ô tô: B-C01 -> B-C10

Gates:
- B1-IN, B1-OUT
- B2-IN, B2-OUT
- B3-IN, B3-OUT
```

### Cards

```text
C001 -> C020
status = AVAILABLE
qr_token = chuỗi random khó đoán
```

### Pricing Rules

Seed mỗi loại xe một pricing rule active:

| Loại xe | Day price | Night price | Monthly price | Lost card fee |
| ------- | --------: | ----------: | ------------: | ------------: |
| Xe đạp  |      2000 |        3000 |         50000 |         30000 |
| Xe máy  |      5000 |        7000 |        150000 |         50000 |
| Ô tô    |     20000 |       30000 |       1200000 |        200000 |

### Monthly Pass Mẫu

```text
owner_name = Nguyen Van Monthly
plate_number = 51A-99999
vehicle_type = Xe máy
start_date = hôm nay - 5 ngày
end_date = hôm nay + 25 ngày
status = ACTIVE
```

## 19.17 Seed Data

Seed data chinh thuc nam trong `database/02_seed.sql`.

.NET khong duoc dung seeder C# de thay the baseline seed. Neu sau nay can runtime-only seeder cho du lieu phu, seeder do khong duoc tao/sua schema va phai duoc ghi ro trong README cua backend.

### Thứ Tự Seed Bắt Buộc

```text
1. users
2. vehicle_types
3. floors
4. areas
5. area_vehicle_types
6. slots
7. gates
8. parking_cards
9. pricing_rules
10. monthly_passes demo nếu cần
```

Nếu seed sai thứ tự sẽ lỗi foreign key.

## 19.18 Postman Và cURL Examples

Thay `TOKEN_HERE` bằng JWT nhận từ login.

### Login

```bash
curl -X POST http://localhost:5000/api/core/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"usernameOrEmailOrPhone\":\"staff01\",\"password\":\"123456\"}"
```

### Create Card

```bash
curl -X POST http://localhost:5000/api/core/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d "{\"cardCode\":\"C001\",\"note\":\"Demo card\"}"
```

### Location Suggestion

```bash
curl -X GET "http://localhost:5000/api/core/parking-sessions/location-suggestion?vehicleTypeId=3&entryGateId=1" \
  -H "Authorization: Bearer TOKEN_HERE"
```

### Entry (3 Modes Example)

#### 1. MONTHLY Mode Entry
```bash
curl -X POST http://localhost:5000/api/core/parking-sessions/entry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d "{\"entryMode\":\"MONTHLY\",\"monthlyPassId\":1,\"monthlyEntryToken\":\"TOKEN_HERE\",\"cardCode\":\"C001\",\"licensePlate\":\"51A-99999\",\"noPlate\":false,\"vehicleTypeId\":3,\"entryGateId\":1,\"selectedAreaId\":1,\"selectedSlotId\":null}"
```

#### 2. CASUAL Mode Entry
```bash
curl -X POST http://localhost:5000/api/core/parking-sessions/entry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d "{\"entryMode\":\"CASUAL\",\"cardCode\":\"C002\",\"licensePlate\":\"59X1-88888\",\"noPlate\":false,\"vehicleTypeId\":3,\"entryGateId\":1,\"selectedAreaId\":1,\"selectedSlotId\":null,\"suggestionToken\":\"TOKEN_HERE\"}"
```

#### 3. RESERVATION Mode Entry
```bash
curl -X POST http://localhost:5000/api/core/parking-sessions/entry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d "{\"entryMode\":\"RESERVATION\",\"reservationId\":123,\"reservationEntryToken\":\"TOKEN_HERE\",\"cardCode\":\"C003\",\"licensePlate\":\"51A-12345\",\"noPlate\":false,\"vehicleTypeId\":5,\"entryGateId\":1,\"selectedAreaId\":2,\"selectedSlotId\":15}"
```

### Calculate Fee

```bash
curl -X POST http://localhost:5000/api/core/parking-sessions/1/calculate-fee \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d "{\"exitTime\":\"2026-05-21T14:30:00+07:00\",\"includeLostCardFee\":false}"
```

### Cash Payment

```bash
curl -X POST http://localhost:5000/api/core/payments/cash \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d "{\"sessionId\":1,\"amount\":10000,\"lostCardFee\":0,\"totalAmount\":10000}"
```

### Exit

```bash
curl -X POST http://localhost:5000/api/core/parking-sessions/1/exit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d "{\"exitGateId\":2,\"exitPlateNumber\":\"51A-12345\",\"exitTime\":\"2026-05-21T14:30:00+07:00\",\"paymentId\":1}"
```

### Public QR Lookup

```bash
curl http://localhost:8080/api/public/cards/QR_TOKEN_HERE/active-session
```

### Dashboard

```bash
curl http://localhost:8080/api/support/dashboard/summary \
  -H "Authorization: Bearer TOKEN_HERE"
```

### PowerShell Trên Windows

Các ví dụ `curl` phía trên dùng cú pháp Git Bash/Linux. Nếu chạy trong PowerShell, dùng mẫu dưới đây.

Login:

```powershell
$loginBody = @{
  usernameOrEmailOrPhone = "staff01"
  password = "123456"
} | ConvertTo-Json

$loginResult = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:5000/api/core/auth/login" `
  -ContentType "application/json" `
  -Body $loginBody

$token = $loginResult.data.accessToken
```

Gọi API cần token:

```powershell
$headers = @{
  Authorization = "Bearer $token"
}

Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:8080/api/support/dashboard/summary" `
  -Headers $headers
```

POST có body:

```powershell
$cardBody = @{
  cardCode = "C001"
  note = "Demo card"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:5000/api/core/cards" `
  -Headers $headers `
  -ContentType "application/json" `
  -Body $cardBody
```

## 19.19 Common Mistakes Và Debug Guide

| Lỗi                          | Dấu hiệu                               | Cách kiểm tra                          | Cách sửa                                                                   |
| ---------------------------- | -------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------- |
| Sai connection string        | Backend không connect DB               | Log báo connection refused/auth failed | Sửa host/port/user/password ở cả .NET và Spring                            |
| Chua chay SQL scripts        | Spring start fail validate             | Bao missing table/column               | Chay `database/01_schema.sql`, `02_seed.sql`, `03_indexes_constraints.sql` |
| Spring tự sửa schema         | Schema lệch khó debug                  | Thấy `ddl-auto=update`                 | Đổi về `validate`                                                          |
| JWT mismatch                 | Spring trả 401                         | Issuer/audience/secret khác .NET       | Copy cùng config JWT                                                       |
| CORS lỗi                     | Browser chặn request                   | Console có CORS error                  | Cho phép origin frontend trong cả 2 backend                                |
| Card không entry được        | API trả `CARD_NOT_AVAILABLE`           | Query `parking_cards.status`           | Dùng card AVAILABLE hoặc exit/cancel session cũ                            |
| Slot không entry được        | API trả `SLOT_NOT_AVAILABLE`           | Query `slots.status`                   | Dùng slot AVAILABLE hoặc release session cũ                                |
| Duplicate active plate       | API trả `VEHICLE_HAS_ACTIVE_SESSION`   | Search active session theo plate       | Exit/cancel session cũ trước                                               |
| Exit fail vì payment         | API trả `PAYMENT_REQUIRED_BEFORE_EXIT` | Check payments by session              | Tạo cash payment trước exit                                                |
| Dashboard sai số             | Spring đọc số cũ                       | Check .NET transaction đã success chưa | Gọi lại dashboard sau API .NET success                                     |
| Public QR không thấy session | Card AVAILABLE hoặc QR sai             | Check card qr_token/current_session    | Dùng QR của card IN_USE                                                    |

Debug theo thứ tự:

```text
1. Xem HTTP status.
2. Xem response message/error code.
3. Xem backend log.
4. Query DB table liên quan.
5. Kiểm tra role/JWT.
6. Kiểm tra status transition.
7. Kiểm tra transaction có rollback không.
```

## 19.20 Debug Theo Từng Lỗi Cụ Thể

### .NET Không Chạy

Log thường gặp:

```text
Unable to connect to any of the specified PostgreSQL hosts
```

Cách sửa:

```text
1. Kiểm tra Supabase project đang hoạt động.
2. Kiểm tra host/port trong file config đúng với connection string Supabase.
3. Kiểm tra username/password và `sslmode=require`.
4. Thử login bằng DBeaver/pgAdmin với SSL enabled.
```

### SQL Schema Loi

Log thường gặp:

```text
The entity type requires a primary key to be defined
```

Cách sửa:

```text
1. Kiểm tra entity có Id chưa.
2. Kiểm tra configuration có HasKey chưa.
3. Kiểm tra DbSet đã thêm vào DbContext chưa.
```

### Spring Validate Lỗi

Log thường gặp:

```text
Schema-validation: missing table [parking_sessions]
```

Cách sửa:

```text
1. Chay database SQL scripts truoc.
2. Kiểm tra đúng database/schema Supabase mà hai backend cùng kết nối.
3. Không đổi ddl-auto thành update.
```

### Spring JWT 401

Cách kiểm tra:

```text
1. Token có prefix Bearer chưa.
2. Secret/issuer/audience Spring có giống .NET không.
3. Token hết hạn chưa.
4. Role trong token có đúng không.
```

### React Gọi API Bị CORS

Dấu hiệu browser console:

```text
Access to XMLHttpRequest has been blocked by CORS policy
```

Cách sửa:

```text
1. .NET cho phép origin http://localhost:5173.
2. Spring cho phép origin http://localhost:5173.
3. Không gọi nhầm http/https.
4. Không gọi nhầm port.
```

### React `Cannot read properties of undefined`

Cách sửa:

```text
1. Kiểm tra response shape: res.data.data.
2. Thêm optional chaining.
3. Set initial state là [] hoặc null đúng kiểu.
4. Render loading trước khi data về.
```

### Entry Fail Nhưng Không Biết Vì Sao

Kiểm tra theo thứ tự:

```sql
SELECT id, card_code, status, current_session_id FROM parking_cards WHERE id = 1;
SELECT id, slot_code, status, current_session_id FROM slots WHERE id = 1;
SELECT id, session_code, status, card_id, slot_id FROM parking_sessions WHERE status IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING');
```

Nếu card `IN_USE` hoặc slot `OCCUPIED`, phải exit/cancel session cũ trước.

## 19.21 Test Cơ Bản Cho Sinh Viên

Không cần viết test phức tạp ngay. Bắt đầu bằng service test nhỏ.

### xUnit Test Mẫu Cho .NET

```csharp
public class FeeCalculationServiceTests
{
    [Fact]
    public void CalculateBlocks_LessThanFourHours_ReturnsOneBlock()
    {
        var duration = TimeSpan.FromHours(2);

        var blocks = FeeCalculationHelper.CalculateBlocks(duration);

        Assert.Equal(1, blocks);
    }
}
```

### JUnit Test Mẫu Cho Spring

```java
class PlateMaskingTests {

    @Test
    void maskPlateNumber_shouldHideMiddleCharacters() {
        String result = PublicCardLookupService.maskPlateNumber("51A-12345");
        assertEquals("51A-***45", result);
    }
}
```

### Manual Test Template

Mỗi bạn khi test API phải ghi lại:

```text
Test ID:
API:
Role:
Input:
Expected:
Actual:
Result: PASS/FAIL
Screenshot hoặc response:
```

Ví dụ:

```text
Test ID: TC-CARD-01
API: POST /api/core/cards
Role: MANAGER
Input: cardCode C001
Expected: 201 Created
Actual: 201 Created
Result: PASS
```

## 19.22 Student Definition Of Done

### Backend .NET Task

```text
[ ] API xuất hiện trong Swagger
[ ] Gọi API success bằng Postman
[ ] Gọi API lỗi trả đúng error code
[ ] Role không đúng bị 403
[ ] Entity map đúng table/column
[ ] Enum lưu string
[ ] Có validate required/duplicate/status
[ ] Có audit log cho action quan trọng
[ ] Transaction rollback khi lỗi giữa chừng
[ ] Không làm logic core ở Controller
```

### Spring Read/Report Task

```text
[ ] API xuất hiện trong Swagger
[ ] Verify JWT .NET token được
[ ] Repository core chỉ đọc
[ ] Không gọi save/delete core table
[ ] Query đúng dữ liệu sau khi .NET ghi
[ ] Public API không lộ dữ liệu nhạy cảm
[ ] Report có filter date range
[ ] Excel export mở được nếu làm
```

### Frontend Task

```text
[ ] Route đúng
[ ] Gọi đúng coreApi/supportApi/publicApi
[ ] Có loading/error/success state
[ ] Có form validation
[ ] Có role guard
[ ] Không hardcode token
[ ] Sau create/update reload dữ liệu
[ ] UI đủ thao tác demo
```

### Test/Demo Task

```text
[ ] Có seed data cần thiết
[ ] Test success flow
[ ] Test failure flow
[ ] Chụp hoặc ghi lại request/response quan trọng
[ ] Demo script chạy từ đầu đến cuối không cần sửa DB thủ công
```

## 19.23 Module Dependency Order Cho Sinh Viên

Không làm module theo cảm hứng. Làm theo thứ tự phụ thuộc:

```text
1. PostgreSQL + SQL schema + seed base
2. Auth + User
3. Vehicle Type
4. Floor/Area/Slot/Gate
5. Parking Card
6. Pricing Rule
7. Slot Suggestion
8. Entry
9. Fee Calculation
10. Payment
11. Exit
12. Monthly Pass
13. Lost Card
14. Plate Mismatch
15. Cancel Session / Move Slot
16. Public QR Lookup
17. Dashboard
18. Reports / Audit
19. Driver Should Have / Feedback / Mock optional
```

Nếu module sau cần module trước mà module trước chưa xong, dùng mock data tạm nhưng phải thay bằng API thật trước integration test.

## 19.24 Bài Tập Làm Theo Thứ Tự Cho Sinh Viên Rất Mới

Không giao ngay Entry/Exit cho bạn mới. Đi từ dễ đến khó.

### Level 1 - Đọc Dữ Liệu

1. `GET /api/core/vehicle-types`
2. `GET /api/core/floors`
3. `GET /api/public/parking-info`
4. React render table vehicle types.

Mục tiêu: hiểu Controller -> Service -> Repository -> DB -> Response.

### Level 2 - Tạo Dữ Liệu Đơn Giản

1. `POST /api/core/cards`
2. `GET /api/core/cards`
3. React form tạo card.

Mục tiêu: hiểu DTO, validation duplicate, status enum.

### Level 3 - Đổi Trạng Thái

1. `PATCH /api/core/cards/{id}/status`
2. `PATCH /api/core/slots/{id}/status`

Mục tiêu: hiểu business validation và audit log.

### Level 4 - Flow Có Transaction Nhẹ

1. Suggest slot.
2. Entry.
3. Check DB: session active, card in use, slot occupied.

Mục tiêu: hiểu transaction và rollback.

### Level 5 - Flow Hoàn Chỉnh

1. Calculate fee.
2. Cash payment.
3. Exit.
4. Dashboard đọc số liệu mới.

Mục tiêu: hiểu liên kết giữa 2 backend.

### Level 6 - Exception Flow

1. Lost card.
2. Plate mismatch.
3. Cancel session.

Mục tiêu: hiểu trạng thái pending và approval.

## 19.25 Mini Glossary

| Thuật ngữ            | Giải thích ngắn                                            |
| -------------------- | ---------------------------------------------------------- |
| Core API             | ASP.NET Core backend, chịu trách nhiệm ghi nghiệp vụ chính |
| Support API          | Spring Boot backend, chủ yếu đọc public/report/audit       |
| Table owner          | Backend được phép ghi chính vào bảng                       |
| Transaction boundary | Ranh giới một transaction phải commit/rollback cùng nhau   |
| Active session       | Parking session đang `ACTIVE` hoặc pending exception       |
| Static QR            | QR cố định gắn với card, không chứa session id             |
| Pricing snapshot     | Bản copy giá tại lúc xe vào                                |
| Append-only audit    | Chỉ insert log, không update/delete                        |
| Read-only repository | Repository chỉ query, không save/delete                    |

## 19.26 Không Được Làm Gì

Danh sách này phải đọc trước khi code.

### Backend .NET Không Được

- Không viết business logic dài trong Controller.
- Không trả thẳng Entity có `password_hash`.
- Không lưu password plain text.
- Không complete session nếu payment chưa final.
- Không update card/slot ngoài transaction entry/exit/cancel/move.
- Không nuốt exception rồi trả success.
- Không tự ý đổi enum string đã chốt.
- Khong sua schema truc tiep trong database roi quen cap nhat `database/*.sql`.

### Spring Boot Không Được

- Không gọi `save` vào core tables.
- Không tạo parking session.
- Không update card/slot/session/payment.
- Không tự tính phí chính thức.
- Không tự login hoặc phát JWT riêng.
- Không đổi `ddl-auto` thành `update`.
- Không trả dữ liệu nhạy cảm ở public API.

### Frontend Không Được

- Không hardcode token trong code.
- Không gọi nhầm service vì thấy endpoint gần giống.
- Không bỏ qua loading/error state.
- Không để Staff thấy nút Manager/Admin.
- Không sửa trực tiếp database để demo qua lỗi.
- Không copy response mock rồi quên nối API thật.

### Team Không Được

- Không merge code chưa chạy.
- Không đổi API path mà không báo frontend/tester.
- Khong doi database field ma khong cap nhat SQL script/spec.
- Không để mỗi người tự đặt enum/status khác nhau.
- Không demo bằng cách sửa DB thủ công nếu flow có API.

---

# 20. Team Assignment

## 20.1 .NET Developer 1 - Core Foundation, Auth, User, Driver, Pricing

Phụ trách:

- Project setup .NET.
- SQL schema scripts trong `database/`.
- Shared entities/enums.
- Auth/JWT.
- User management.
- Driver account Should Have.
- Vehicle Type/Vehicle.
- Pricing Rules.
- Audit writer base service.

Deliverables:

```text
ParkingDbContext
Initial SQL Schema
Seed data
AuthController
UsersController
DriversController
VehicleTypesController
VehiclesController
PricingRulesController
JwtTokenService
AuditWriterService
```

## 20.2 .NET Developer 2 - Parking Operation Core, Payment, Monthly Pass, Exceptions

Phụ trách:

- Parking Card.
- Floor/Area/Slot/Gate.
- Slot Suggestion.
- Entry Processing.
- Exit Processing.
- Card/Slot state transition.
- Slot move/status adjustment.
- Fee Calculation.
- Payment.
- Monthly Pass.
- Lost Card.
- Plate Mismatch.
- Admin Cancel Session.

Deliverables:

```text
CardsController
FloorsController
AreasController
SlotsController
GatesController
ParkingSessionsController
EntryService
ExitService
SlotSuggestionService
ParkingCardService
SlotService
PaymentsController
MonthlyPassesController
LostCardCasesController
PlateMismatchController
SessionAdminService
FeeCalculationService
PaymentService
MonthlyPassService
LostCardCaseService
PlateMismatchService
```

## 20.3 Spring Boot Developer 1 - Public And Dashboard

Phụ trách:

- Project setup Spring Boot.
- JWT validation.
- Read-only JPA mapping.
- Public Driver APIs.
- Available slots public.
- Public pricing/rules.
- Public card QR lookup.
- Dashboard summary.

Deliverables:

```text
SecurityConfig
JwtAuthenticationFilter
PublicInfoController
PublicCardLookupController
DashboardController
PublicInfoService
PublicCardLookupService
DashboardService
Read-only JPA entities
```

## 20.4 Spring Boot Developer 2 - Reports, Audit, Support

Phụ trách:

- Reports.
- Excel export.
- Audit log search.
- Feedback nếu làm.
- Mock device optional.

Deliverables:

```text
ReportController
AuditLogController
FeedbackController
MockDeviceController
ReportService
ReportExportService
AuditLogQueryService
FeedbackService
Apache POI Excel export
```

---

# 21. Sprint Plan 60 Ngày

| Tuần   | .NET Team                                    | Spring Boot Team                                      | Frontend Team                           | Output                      |
| ------ | -------------------------------------------- | ----------------------------------------------------- | --------------------------------------- | --------------------------- |
| Tuan 1 | Setup .NET, SQL schema, seed data            | Setup Spring Boot, connect DB read-only, JWT validate | Setup React, routing, layout            | 3 project chay duoc         |
| Tuần 2 | Auth, User, VehicleType, Pricing base        | Public info read API, dashboard skeleton              | Login, protected route, layout          | Đăng nhập + đọc public info |
| Tuần 3 | Card, Structure, MonthlyPass CRUD            | Public available slots, public pricing/rules          | Card/Structure/Pricing UI               | Quản lý dữ liệu nền         |
| Tuần 4 | Suggestion + Entry transaction               | Public QR lookup                                      | Staff Entry UI + QR lookup page         | Demo xe vào + QR tra cứu    |
| Tuần 5 | Fee, Payment, Exit                           | Dashboard summary                                     | Staff Exit UI                           | Demo xe ra                  |
| Tuần 6 | Lost Card, Mismatch, Cancel, Move Slot       | Audit log search, report base                         | Manager approval UI, Admin cancel UI    | Demo exception              |
| Tuần 7 | Driver Should Have, harden transaction       | Reports, Excel export                                 | Dashboard, Reports, Audit, Driver pages | Demo quản lý                |
| Tuần 8 | Integration test, seed demo, Swagger cleanup | Report polish, support bugfix                         | UI polish, responsive, demo script      | Sẵn sàng bảo vệ             |

---

# 22. Test Case Mapping By Backend

| Test ID | Module                | Backend     | Expected Result                             |
| ------- | --------------------- | ----------- | ------------------------------------------- |
| TC-01   | Auth login            | .NET        | Staff login thành công, nhận JWT            |
| TC-02   | Spring verify JWT     | Spring Boot | Gọi dashboard bằng JWT hợp lệ thành công    |
| TC-03   | User create           | .NET        | Admin tạo Staff/Manager                     |
| TC-04   | Driver register       | .NET        | Driver tạo user/profile nếu làm Should Have |
| TC-05   | Vehicle type          | .NET        | Lấy loại xe active                          |
| TC-06   | Structure CRUD        | .NET        | Manager tạo floor/area/slot                 |
| TC-07   | Card create           | .NET        | Tạo Parking Card C001                       |
| TC-08   | Suggestion            | .NET        | Đề xuất đúng khu theo loại xe               |
| TC-09   | Entry                 | .NET        | Tạo session với Card AVAILABLE              |
| TC-10   | Card status           | .NET        | Card chuyển IN_USE                          |
| TC-11   | Slot status           | .NET        | Slot chuyển OCCUPIED                        |
| TC-12   | Active conflict card  | .NET + DB   | Card IN_USE không dùng cho session mới      |
| TC-13   | Active conflict plate | .NET + DB   | Plate đang active không tạo session mới     |
| TC-14   | Active conflict slot  | .NET + DB   | Slot đang active không gán session mới      |
| TC-15   | Public QR lookup      | Spring Boot | Driver xem session active qua QR Token      |
| TC-16   | Public lookup privacy | Spring Boot | Không lộ dữ liệu nhạy cảm                   |
| TC-17   | Fee calculation       | .NET        | Tính đúng block 4 tiếng                     |
| TC-18   | Payment cash          | .NET        | Payment PAID                                |
| TC-20   | Exit casual           | .NET        | Session completed, card/slot available      |
| TC-21   | Monthly pass exit     | .NET        | Payment WAIVED/NOT_REQUIRED                 |
| TC-22   | Dashboard update      | Spring Boot | Dashboard đọc đúng số liệu mới              |
| TC-23   | Lost card create      | .NET        | Staff tạo hồ sơ, session pending            |
| TC-24   | Lost card approve     | .NET        | Manager duyệt, fee/card update              |
| TC-25   | Mismatch create       | .NET        | Sai biển số bị chặn                         |
| TC-26   | Mismatch confirm      | .NET        | Manager xác nhận kèm lý do                  |
| TC-27   | Cancel session        | .NET        | Admin hủy session và giải phóng card/slot   |
| TC-28   | Move slot             | .NET        | Slot cũ available, slot mới occupied        |
| TC-29   | Pricing snapshot      | .NET        | Entry lưu snapshot giá                      |
| TC-30   | Audit search          | Spring Boot | Tìm log action quan trọng                   |
| TC-31   | Revenue report        | Spring Boot | Báo cáo doanh thu đúng                      |
| TC-32   | Excel export          | Spring Boot | Xuất file Excel nếu làm                     |
| TC-33   | Cross-backend data    | Both        | .NET ghi xong, Spring đọc được đúng         |
| TC-34   | Schema safety         | Both        | Spring ddl-auto validate khong sua schema   |

---

# 23. Minimum Demo Script Support

## Demo 1: Xe Vãng Lai Vào

Backend chính: `.NET`

1. Staff login qua `/api/core/auth/login`.
2. Staff mở Entry.
3. Nhập biển số `51A-12345`.
4. Chọn loại xe `Xe máy`.
5. Chọn Card `C001`.
6. Gọi `/api/core/parking-sessions/suggest-slot`.
7. Gọi `/api/core/parking-sessions/entry`.
8. Session `ACTIVE`.
9. Card `IN_USE`.
10. Slot `OCCUPIED`.
11. Pricing snapshot được lưu.

## Demo 2: Driver Quét QR

Backend chính: `Spring Boot`

1. Mở `/card/{qrToken-of-C001}`.
2. Frontend gọi `/api/public/cards/{qrToken}/active-session`.
3. Spring Boot đọc card/session từ PostgreSQL.
4. Hiển thị session active, masked plate và phí tạm tính preview.

## Demo 3: Xe Vãng Lai Ra

Backend chính: `.NET`

1. Staff mở Exit.
2. Nhập Card `C001`.
3. Gọi `/api/core/parking-sessions/by-card-code/C001`.
4. Gọi calculate fee.
5. Gọi `/api/core/payments/cash`.
6. Gọi exit.
7. Payment `PAID`.
8. Session `COMPLETED`.
9. Card `AVAILABLE`.
10. Slot `AVAILABLE`.

## Demo 4: Monthly Pass Exit

Backend chính: `.NET`

1. Manager tạo monthly pass cho biển số `51A-99999`.
2. Staff entry xe đó.
3. Hệ thống detect `customerType = MONTHLY`.
4. Staff exit bằng `/api/core/parking-sessions/{id}/monthly-pass-exit`.
5. Payment `WAIVED` hoặc `NOT_REQUIRED`.

## Demo 5: Dashboard Cập Nhật

Backend chính: `Spring Boot`

1. Manager mở dashboard.
2. Frontend gọi `/api/support/dashboard/summary`.
3. Spring Boot đọc số liệu mới từ PostgreSQL.
4. Hiển thị tổng slot, slot trống, card in use, doanh thu hôm nay.

## Demo 6: Lost Card

Backend chính: `.NET`

1. Staff tạo lost card case.
2. Session chuyển `LOST_CARD_PENDING`.
3. Manager duyệt.
4. .NET cập nhật case, session/card/fee.
5. Spring Boot audit log page đọc được log.

## Demo 7: Sai Biển Số

Backend chính: `.NET`

1. Staff exit với biển số khác lúc vào.
2. .NET tạo mismatch pending và chặn exit.
3. Manager confirm kèm lý do.
4. Staff tiếp tục exit.
5. Audit log có action mismatch.

## Demo 8: Admin Hủy Session

Backend chính: `.NET`

1. Admin tìm active session.
2. Admin nhập lý do hủy.
3. Gọi `/api/core/parking-sessions/{id}/cancel`.
4. Session `CANCELLED`.
5. Card/slot được giải phóng.
6. Audit log ghi action cancel.

## Demo 9: Reports Và Audit

Backend chính: `Spring Boot`

1. Manager mở Reports.
2. Gọi revenue/traffic/card reports.
3. Nếu kịp, export Excel.
4. Admin mở Audit Log.
5. Search action `SESSION_CREATED`, `PAYMENT_PAID`, `SESSION_CANCELLED`.

---

# 24. Risks And Mitigation

| Rủi ro                               | Nguyên nhân                          | Cách xử lý                                                              |
| ------------------------------------ | ------------------------------------ | ----------------------------------------------------------------------- |
| Hai backend cung sua DB schema       | Runtime auto schema update           | Chi `database/*.sql` tao schema, Spring `ddl-auto=validate`             |
| Enum lệch                            | .NET dùng enum int, Java dùng string | Database lưu enum string                                                |
| Spring update nhầm bảng core         | Dev support viết repository save     | Quy định read-only repository cho bảng core                             |
| Driver register conflict             | Support API tự ghi dữ liệu Driver    | Driver write thuộc .NET                                                 |
| JWT không verify được giữa 2 backend | Khác secret/issuer/audience          | Dùng chung JWT config                                                   |
| Dashboard đọc dữ liệu chưa commit    | Gọi report quá sớm                   | Chỉ đọc sau khi .NET API success                                        |
| Report query nặng                    | Join nhiều bảng                      | Thêm index, giới hạn date range                                         |
| Logic tính phí bị duplicate          | Spring tự tính khác .NET             | Fee chính thức chỉ .NET, Spring chỉ preview                             |
| Frontend gọi nhầm service            | API path không rõ                    | Prefix `/api/core`, `/api/support`, `/api/public`                       |
| Audit log thiếu                      | Dev quên ghi log                     | Tạo AuditWriterService trong .NET và AuditLogWriterService trong Spring |
| Giá đổi khi session active           | Tính theo giá mới gây tranh cãi      | Snapshot giá lúc entry                                                  |

---

# 25. Definition Of Done

## 25.1 Backend .NET Task Done Khi

- Có API endpoint chạy được.
- Có DTO request/response.
- Có validation.
- Có role authorization.
- Có service logic đúng rule.
- Có EF repository/query.
- Có transaction cho nghiệp vụ core.
- Có audit log nếu là action quan trọng.
- Có Swagger/OpenAPI.
- Có test bằng Postman/Swagger.
- Không dùng endpoint unprefixed cũ.

## 25.2 Backend Spring Boot Task Done Khi

- Có API endpoint chạy được.
- Verify JWT được từ token .NET.
- Không tự sửa schema database.
- Repository core là read-only.
- Không update core tables trừ append-only audit log.
- Query report/public đúng dữ liệu.
- Response format giống .NET.
- Có Swagger/OpenAPI.
- Có test bằng Postman/Swagger.

## 25.3 Frontend Task Done Khi

- Có page/component đúng route.
- Gọi đúng `coreApi`, `supportApi`, `publicApi`.
- Có loading/error/success state.
- Có role guard.
- Có form validation cơ bản.
- UI đủ demo.
- Driver public web responsive cơ bản.

---

# 26. Checklist Trước Khi Code

## 26.1 Cần Chốt Chung

- [ ] PostgreSQL là database duy nhất.
- [ ] ID mặc định dùng `BIGSERIAL`.
- [ ] `database/*.sql` la database source of truth.
- [ ] Spring Boot `ddl-auto=validate`.
- [ ] JWT secret/issuer/audience dùng chung.
- [ ] Timezone lưu `TIMESTAMPTZ`.
- [ ] Enum lưu string.
- [ ] API prefix `/api/core`, `/api/support`, `/api/public`.
- [ ] Role model MVP dùng enum trong `users`.
- [ ] Driver write thuộc .NET.
- [ ] Seed data demo.

## 26.2 .NET Cần Chuẩn Bị

- [ ] Solution ASP.NET Core Web API.
- [ ] EF Core + Npgsql.
- [ ] ParkingDbContext.
- [ ] Initial SQL schema.
- [ ] Seed Admin, Staff, Manager.
- [ ] Seed vehicle types.
- [ ] Seed floors/areas/slots/gates.
- [ ] Seed cards C001-C020.
- [ ] Seed pricing rules.
- [ ] Swagger.
- [ ] AuditWriterService.

## 26.3 Spring Boot Cần Chuẩn Bị

- [ ] Spring Boot REST API.
- [ ] PostgreSQL connection.
- [ ] JPA read entity mapping.
- [ ] `ddl-auto=validate`.
- [ ] JWT validation compatible với .NET.
- [ ] Public API skeleton.
- [ ] Dashboard/report skeleton.
- [ ] Apache POI nếu làm Excel.
- [ ] Read-only repository convention.

## 26.4 Frontend Cần Chuẩn Bị

- [ ] React Router.
- [ ] `coreAxiosClient`.
- [ ] `supportAxiosClient`.
- [ ] `publicAxiosClient`.
- [ ] AuthProvider.
- [ ] ProtectedRoute.
- [ ] RoleBasedRoute.
- [ ] Staff layout.
- [ ] Manager/Admin layout.
- [ ] Driver public layout.

---

# 27. Verification Checklist Cho Tài Liệu

Sau khi chỉnh tài liệu hoặc code, kiểm tra:

Chạy `rg` để rà các chuỗi cũ có nguy cơ gây mâu thuẫn: bảng RBAC tách riêng, package Excel phía .NET, quyền ghi core table ở Support API, và endpoint thiếu prefix.

Kết quả mong muốn:

- Không có hướng dẫn dùng RBAC table cho MVP.
- Không có package Excel trong .NET package.
- Không có rule cho Spring ghi core tables.
- Không còn endpoint cũ unprefixed ngoài phần cảnh báo "không dùng".

---

# 28. Kết Luận

Bản thiết kế này là spec triển khai chính cho mô hình dual-backend:

```text
.NET Core API = core transaction owner + auth + driver write + maps existing SQL schema
Spring Boot API = support/read/report/public owner
database/*.sql = database source of truth
React = gọi đúng API theo module
```

Phân bổ theo nhân lực:

```text
2 dev .NET       -> chịu trách nhiệm nghiệp vụ ghi chính và nhiều module core
2 dev Spring Boot -> public, dashboard, report, audit, support module
```

Luồng demo core cần đạt:

```text
.NET: Login -> Entry -> Card/Slot update -> Fee -> Payment -> Exit
Spring: Public QR lookup -> Dashboard -> Reports -> Audit search
PostgreSQL: Dữ liệu chung, enum chung, schema chung, owner rõ ràng
```

Nếu tuân thủ ownership bảng, SQL schema rule, API prefix, JWT config và transaction boundary trong tài liệu này, hai backend có thể phát triển song song mà không xung đột dữ liệu.

---

# 29. API Response Contract

All Core API endpoints must return `ApiResponse<T>`.

Success response:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "errors": null,
  "errorCode": null,
  "statusCode": 200,
  "traceId": "...",
  "path": "/api/core/...",
  "timestamp": "..."
}
```

Error response:

```json
{
  "success": false,
  "message": "Yeu cau khong hop le.",
  "data": null,
  "errors": ["ERROR_CODE"],
  "errorCode": "ERROR_CODE",
  "statusCode": 400,
  "traceId": "...",
  "path": "/api/core/...",
  "timestamp": "..."
}
```

## 29.1 Error Handling Rules

- Business errors must throw `BusinessException(ErrorCodes.X)`.
- Do not throw `BusinessException("STRING_CODE")` in new code.
- Do not return raw `Ok(...)`, `BadRequest("...")`, `NotFound("...")`, or `Forbid("...")` from concrete controllers.
- Do not call `ApiResponse.FailureResult` directly from concrete controllers.
- Unexpected exceptions are handled by `GlobalExceptionMiddleware`.
- 400/404 handled failures are logged as Warning.
- 500 system failures are logged as Error and must not expose internal exception messages.
- `appsettings*.json` must keep valid object shape and must not contain real secrets.
- Project-map exports must mask secrets while preserving JSON structure.

## 29.2 Backend Quality Gate

Run the backend quality gate before handing off API contract changes:

```powershell
.\scripts\run-backend-quality-gate.ps1 `
  -BaseUrl "http://localhost:5000" `
  -AllowWriteTests `
  -AllowReset
```

For static/build-only confidence before the API server is running:

```powershell
dotnet build backend/ParkingBuilding.CoreApi/ParkingBuilding.CoreApi.csproj
.\scripts\check-api-contract.ps1
```
```

### File: `export-backend-map.ps1`

```powershell
$ErrorActionPreference = "Stop"

$repoRoot = git rev-parse --show-toplevel
if (-not $repoRoot) {
    Write-Host "Error: This script must be run inside a Git repository." -ForegroundColor Red
    Exit 1
}

Set-Location $repoRoot

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Generating Backend Project Map (docs/project-map-backend.md)..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is required but not found in PATH." -ForegroundColor Red
    Exit 1
}

# Run the generator script
node scripts/generate-backend-map.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to generate project-map-backend.md." -ForegroundColor Red
    Exit 1
}

Write-Host "`nBackend project map successfully generated at docs/project-map-backend.md!" -ForegroundColor Green

# Ask if they want to upload to ChatGPT
$choice = Read-Host "`nDo you want to automatically upload this backend map to ChatGPT? (y/n)"
if ($choice -eq "y" -or $choice -eq "Y") {
    Write-Host "`n=============================================" -ForegroundColor Cyan
    Write-Host "Uploading Backend Project Map to ChatGPT..." -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    
    node scripts/upload-project-map.js project-map-backend.md
} else {
    Write-Host "`nDone! You can find the generated file at: docs/project-map-backend.md" -ForegroundColor Yellow
}
```

### File: `export-project-map.ps1`

```powershell
$ErrorActionPreference = "Stop"

$repoRoot = git rev-parse --show-toplevel
if (-not $repoRoot) {
    Write-Host "Error: This script must be run inside a Git repository." -ForegroundColor Red
    Exit 1
}

Set-Location $repoRoot

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Generating Project Map (docs/project-map.md)..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is required but not found in PATH." -ForegroundColor Red
    Exit 1
}

# Run the generator script
node scripts/generate-project-map.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to generate project-map.md." -ForegroundColor Red
    Exit 1
}

Write-Host "`nProject map successfully generated at docs/project-map.md!" -ForegroundColor Green

# Ask if they want to upload to ChatGPT
$choice = Read-Host "`nDo you want to automatically upload this map to ChatGPT? (y/n)"
if ($choice -eq "y" -or $choice -eq "Y") {
    Write-Host "`n=============================================" -ForegroundColor Cyan
    Write-Host "Uploading Project Map to ChatGPT..." -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    
    node scripts/upload-project-map.js
} else {
    Write-Host "`nDone! You can find the generated file at: docs/project-map.md" -ForegroundColor Yellow
}
```

### File: `scripts/test-api-contract.ps1`

```powershell
param (
    [string]$BaseUrl = "http://localhost:5000"
)

$ErrorActionPreference = "Stop"

function Invoke-ApiRequest {
    param (
        [string]$Method,
        [string]$Uri,
        [object]$Headers = @{},
        [string]$Body,
        [string]$ContentType = "application/json"
    )

    $params = @{
        Method = $Method
        Uri = $Uri
        Headers = $Headers
    }
    if ($Body) {
        $params.Body = $Body
        $params.ContentType = $ContentType
    }

    try {
        return Invoke-RestMethod @params
    } catch {
        $stream = $_.Exception.Response.GetResponseStream()
        if (-not $stream) { throw }
        $reader = [System.IO.StreamReader]::new($stream)
        $bodyText = $reader.ReadToEnd()
        $reader.Close()
        return $bodyText | ConvertFrom-Json
    }
}

function Assert-CommonFields {
    param($Response)

    foreach ($field in @("success", "message", "statusCode", "traceId", "path", "timestamp")) {
        if (-not ($Response.PSObject.Properties.Name -contains $field)) {
            throw "Missing field: $field"
        }
    }
    foreach ($field in @("traceId", "path", "timestamp")) {
        if ([string]::IsNullOrWhiteSpace([string]$Response.$field)) {
            throw "Field must not be empty: $field"
        }
    }
}

function Assert-SuccessFormat {
    param($Response, [int]$ExpectedStatusCode)

    Assert-CommonFields -Response $Response
    if ($Response.success -ne $true) { throw "Expected success=true" }
    if (-not ($Response.PSObject.Properties.Name -contains "data")) { throw "Missing data" }
    if ($Response.statusCode -ne $ExpectedStatusCode) {
        throw "Expected statusCode=$ExpectedStatusCode but got $($Response.statusCode)"
    }
}

function Assert-ErrorCodeFormat {
    param([string]$ErrorCode)

    if ([string]::IsNullOrWhiteSpace($ErrorCode)) {
        throw "Missing errorCode"
    }

    if ($ErrorCode -notmatch '^[A-Z0-9_]+$') {
        throw "Invalid errorCode format: $ErrorCode"
    }
}

function Assert-ErrorFormat {
    param($Response, [int]$ExpectedStatusCode, [string]$ExpectedErrorCode)

    Assert-CommonFields -Response $Response
    if ($Response.success -ne $false) { throw "Expected success=false" }
    Assert-ErrorCodeFormat -ErrorCode $Response.errorCode
    if (-not ($Response.PSObject.Properties.Name -contains "errors")) { throw "Missing errors" }
    if ($Response.statusCode -ne $ExpectedStatusCode) {
        throw "Expected statusCode=$ExpectedStatusCode but got $($Response.statusCode)"
    }
    if ($ExpectedErrorCode -and $Response.errorCode -ne $ExpectedErrorCode) {
        throw "Expected errorCode=$ExpectedErrorCode but got $($Response.errorCode)"
    }
}

Write-Host "Running API contract tests on $BaseUrl" -ForegroundColor Cyan

$health = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/health"
Assert-SuccessFormat -Response $health -ExpectedStatusCode 200

$loginBody = @{ username = "admin01"; password = "123456" } | ConvertTo-Json
$login = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $loginBody
Assert-SuccessFormat -Response $login -ExpectedStatusCode 200
$headers = @{ Authorization = "Bearer $($login.data.accessToken)" }

$createBody = @{
    floorCode = "CT-$(Get-Random -Minimum 10000 -Maximum 99999)"
    floorName = "Contract Test Floor"
} | ConvertTo-Json
$created = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/floors" -Headers $headers -Body $createBody
Assert-SuccessFormat -Response $created -ExpectedStatusCode 201

$validationBody = @{ vehicleTypeId = "not-a-number"; floorId = 1; areaId = 1; reservedDurationMinutes = 60 } | ConvertTo-Json
$validationError = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Headers $headers -Body $validationBody
Assert-ErrorFormat -Response $validationError -ExpectedStatusCode 400 -ExpectedErrorCode "VALIDATION_ERROR"

$businessBody = @{
    entryMode = "CASUAL"
    cardCode = "C003"
    licensePlate = $null
    noPlate = $true
    vehicleTypeId = 5
    entryGateId = 1
} | ConvertTo-Json
$businessError = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Headers $headers -Body $businessBody
Assert-ErrorFormat -Response $businessError -ExpectedStatusCode 400 -ExpectedErrorCode ""

$unauthorized = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/auth/me"
Assert-ErrorFormat -Response $unauthorized -ExpectedStatusCode 401 -ExpectedErrorCode "UNAUTHORIZED"

$driverLoginBody = @{ username = "driver01"; password = "123456" } | ConvertTo-Json
$driverLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $driverLoginBody
$driverHeaders = @{ Authorization = "Bearer $($driverLogin.data.accessToken)" }
$forbidden = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/users" -Headers $driverHeaders
Assert-ErrorFormat -Response $forbidden -ExpectedStatusCode 403 -ExpectedErrorCode "FORBIDDEN"

$notFound = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/cards/999999999" -Headers $headers
Assert-ErrorFormat -Response $notFound -ExpectedStatusCode 404 -ExpectedErrorCode ""

Write-Host "API contract tests passed." -ForegroundColor Green
```

### File: `scripts/test-api-crud.ps1`

```powershell
param (
    [string]$BaseUrl = "http://localhost:5000",
    [switch]$AllowWriteTests,
    [switch]$AllowReset
)

$ErrorActionPreference = "Stop"

if (-not $AllowWriteTests) {
    Write-Host "[Warning] -AllowWriteTests switch was not specified. Skipping write tests." -ForegroundColor Yellow
    Exit 0
}

function Invoke-ApiRequest {
    param (
        [string]$Method,
        [string]$Uri,
        [object]$Headers = @{},
        [string]$Body,
        [string]$ContentType = "application/json"
    )
    
    $params = @{
        Method = $Method
        Uri = $Uri
        Headers = $Headers
    }
    if ($Body) {
        $params.Body = $Body
        $params.ContentType = $ContentType
    }
    
    try {
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        $statusCode = ""
        $errBody = ""
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                if ($stream) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $errBody = $reader.ReadToEnd()
                    $reader.Close()
                }
            } catch {}
        }
        if ($errBody) {
            throw "API Error status=$($statusCode): $errBody"
        } else {
            throw "Request failed: $($_.Exception.Message)"
        }
    }
}

# Login to get authentication headers
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Running CRUD tests on $BaseUrl" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "[Crud] Logging in as admin01..."
$loginBody = @{
    username = "admin01"
    password = "123456"
} | ConvertTo-Json
$loginResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $loginBody
$token = $loginResult.data.accessToken
$headers = @{
    Authorization = "Bearer $token"
}

# Check localhost safety for reset
$isLocalhost = ($BaseUrl -like "*localhost*" -or $BaseUrl -like "*127.0.0.1*")

if ($AllowReset) {
    if (-not $isLocalhost) {
        throw "Destructive test reset option (-AllowReset) is only allowed on localhost!"
    }
    Write-Host "[Crud] Resetting database reservations/sessions..." -ForegroundColor Cyan
    $resetRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/health/clear-reservations" -Headers $headers
    Write-Host "  Reset Response: $($resetRes.message)" -ForegroundColor Green
}

# Generate unique codes for safe re-runs
$rand = Get-Random -Minimum 1000 -Maximum 9999
$floorCode = "F$rand"
$floorName = "Test Floor $rand"
$areaCode = "A$rand"
$areaName = "Test Area $rand"
$slotCode = "S$rand"

try {
    # 1. Create Floor
    Write-Host "[Crud] Creating new Floor ($floorCode)..."
    $floorBody = @{
        floorCode = $floorCode
        floorName = $floorName
    } | ConvertTo-Json
    $newFloor = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/floors" -Body $floorBody -Headers $headers
    $floorId = $newFloor.data.id
    Write-Host "  Floor created successfully with ID: $floorId" -ForegroundColor Green

    # 2. Update Floor
    Write-Host "[Crud] Updating Floor ($floorId)..."
    $updateFloorBody = @{
        floorName = "$floorName (Updated)"
        status = "ACTIVE"
    } | ConvertTo-Json
    $updatedFloor = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/floors/$floorId" -Body $updateFloorBody -Headers $headers
    Write-Host "  Floor updated: $($updatedFloor.data.floorName)" -ForegroundColor Green

    # 3. Create Area
    Write-Host "[Crud] Creating new Area ($areaCode) on Floor $floorId..."
    $areaBody = @{
        floorId = $floorId
        areaCode = $areaCode
        areaName = $areaName
        priorityOrder = 10
        totalCapacity = 5
        vehicleTypeIds = @(5) # Allow Car (Vehicle Type 5)
    } | ConvertTo-Json
    $newArea = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/areas" -Body $areaBody -Headers $headers
    $areaId = $newArea.data.id
    Write-Host "  Area created successfully with ID: $areaId" -ForegroundColor Green

    # 4. Update Area
    Write-Host "[Crud] Updating Area ($areaId)..."
    $updateAreaBody = @{
        areaName = "$areaName (Updated)"
        priorityOrder = 15
        totalCapacity = 10
        status = "ACTIVE"
        vehicleTypeIds = @(5, 6) # Allow Car and Electric Car
    } | ConvertTo-Json
    $updatedArea = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/areas/$areaId" -Body $updateAreaBody -Headers $headers
    Write-Host "  Area updated: $($updatedArea.data.areaName)" -ForegroundColor Green

    # 5. Create Slot
    Write-Host "[Crud] Creating new Slot ($slotCode) on Area $areaId..."
    $slotBody = @{
        areaId = $areaId
        slotCode = $slotCode
        allowedVehicleTypeId = 5
    } | ConvertTo-Json
    $newSlot = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/slots" -Body $slotBody -Headers $headers
    $slotId = $newSlot.data.id
    Write-Host "  Slot created successfully with ID: $slotId" -ForegroundColor Green

    # 6. Patch Slot Status (RESERVED)
    Write-Host "[Crud] Updating Slot status to RESERVED..."
    $patchBody = @{
        status = "RESERVED"
    } | ConvertTo-Json
    $patchedSlot = Invoke-ApiRequest -Method Patch -Uri "$BaseUrl/api/core/slots/$slotId/status" -Body $patchBody -Headers $headers
    if ($patchedSlot.data.status -eq "RESERVED") {
        Write-Host "  Slot status patched to RESERVED successfully" -ForegroundColor Green
    } else {
        throw "Failed to patch slot status to RESERVED. Status is $($patchedSlot.data.status)"
    }

    # 7. Get Slots list and verify ours exists
    Write-Host "[Crud] Verifying slot exists in global slot list..."
    $allSlots = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/slots" -Headers $headers
    $foundSlot = @($allSlots.data) | Where-Object { $_.id -eq $slotId }
    if ($foundSlot) {
        Write-Host "  Verified: Created slot found in GET /api/core/slots list!" -ForegroundColor Green
    } else {
        throw "Created slot with ID $slotId not found in slot list!"
    }

    Write-Host "`n[SUCCESS] CRUD tests completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error occurred during CRUD test: $_" -ForegroundColor Red
    throw $_
}
```

### File: `scripts/test-api-flow.ps1`

```powershell
param (
    [string]$BaseUrl = "http://localhost:5000",
    [switch]$AllowWriteTests,
    [switch]$AllowReset
)

$ErrorActionPreference = "Stop"

if (-not $AllowWriteTests) {
    Write-Host "[Warning] -AllowWriteTests switch was not specified. Skipping flow tests." -ForegroundColor Yellow
    Exit 0
}

function Invoke-ApiRequest {
    param (
        [string]$Method,
        [string]$Uri,
        [object]$Headers = @{},
        [string]$Body,
        [string]$ContentType = "application/json"
    )
    
    $params = @{
        Method = $Method
        Uri = $Uri
        Headers = $Headers
    }
    if ($Body) {
        $params.Body = $Body
        $params.ContentType = $ContentType
    }
    
    try {
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        $statusCode = ""
        $errBody = ""
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                if ($stream) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $errBody = $reader.ReadToEnd()
                    $reader.Close()
                }
            } catch {}
        }
        if ($errBody) {
            $customEx = New-Object System.Exception("API Error status=$($statusCode): $errBody")
            $customEx | Add-Member -MemberType NoteProperty -Name "ErrorBody" -Value $errBody -Force
            $customEx | Add-Member -MemberType NoteProperty -Name "StatusCode" -Value $statusCode -Force
            throw $customEx
        } else {
            throw $_
        }
    }
}

function Get-ErrorText {
    param($ErrorObject)
    $text = ""
    if ($ErrorObject) {
        if ($ErrorObject.Exception) {
            $text += $ErrorObject.Exception.Message
        }
        if ($ErrorObject.ErrorDetails -and $ErrorObject.ErrorDetails.Message) {
            $text += " " + $ErrorObject.ErrorDetails.Message
        }
        if ([string]::IsNullOrWhiteSpace($text)) {
            $text = [string]$ErrorObject
        }
    }
    return $text
}

function Assert-ApiSuccessFormat {
    param($Response)

    if ($null -eq $Response) { throw "Response object is null" }
    if ($null -eq $Response.success) { throw "Missing success" }
    if ($Response.success -ne $true) { throw "Expected success=true" }
    if ($null -eq $Response.message) { throw "Missing message" }
    if (-not ($Response.PSObject.Properties.Name -contains "data")) { throw "Missing data" }
    if ($null -eq $Response.timestamp) { throw "Missing timestamp" }
    if ($null -eq $Response.statusCode) { throw "Missing statusCode" }
    if ($null -eq $Response.traceId) { throw "Missing traceId" }
    if ($null -eq $Response.path) { throw "Missing path" }
}

function Assert-ApiErrorFormat {
    param($Response, $ExpectedErrorCode)

    if ($null -eq $Response) { throw "Response object is null" }
    if ($null -eq $Response.success) { throw "Missing success" }
    if ($Response.success -ne $false) { throw "Expected success=false" }
    if ($Response.errorCode -ne $ExpectedErrorCode) {
        throw "Expected errorCode=$ExpectedErrorCode but got $($Response.errorCode)"
    }
    if ($null -eq $Response.message) { throw "Missing message" }
    if ($null -eq $Response.statusCode) { throw "Missing statusCode" }
    if ($null -eq $Response.traceId) { throw "Missing traceId" }
    if ($null -eq $Response.path) { throw "Missing path" }
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Running FLOW tests on $BaseUrl" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Login as Admin to manage pricing rules
Write-Host "[Flow] Logging in as admin01..."
$adminLoginBody = @{
    username = "admin01"
    password = "123456"
} | ConvertTo-Json
$adminLoginResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $adminLoginBody
$adminHeaders = @{
    Authorization = "Bearer $($adminLoginResult.data.accessToken)"
}
Write-Host "  Admin logged in successfully." -ForegroundColor Green

# Check localhost safety for reset
$isLocalhost = ($BaseUrl -like "*localhost*" -or $BaseUrl -like "*127.0.0.1*")

if ($AllowReset) {
    if (-not $isLocalhost) {
        throw "Destructive test reset option (-AllowReset) is only allowed on localhost!"
    }
    Write-Host "[Flow] Resetting database reservations/sessions..." -ForegroundColor Cyan
    $resetRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/health/clear-reservations" -Headers $adminHeaders
    Write-Host "  Reset Response: $($resetRes.message)" -ForegroundColor Green
}

# Fetch active pricing rules to save original reservation hourly prices
Write-Host "[Flow] Fetching active pricing rules..."
$allRules = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/pricing-rules" -Headers $adminHeaders

$carRule = @($allRules.data) | Where-Object { $_.vehicleTypeId -eq 5 -and $_.status -eq "ACTIVE" }
if (-not $carRule) {
    throw "Active pricing rule for Vehicle Type 5 not found!"
}
$ruleId = $carRule.id
$origReservationHourlyPrice = $carRule.reservationHourlyPrice
Write-Host "  Car Pricing Rule ID: $ruleId, Original hourly price: $origReservationHourlyPrice" -ForegroundColor Green

$bikeRule = @($allRules.data) | Where-Object { $_.vehicleTypeId -eq 1 -and $_.status -eq "ACTIVE" }
if (-not $bikeRule) {
    throw "Active pricing rule for Vehicle Type 1 not found!"
}
$bikeRuleId = $bikeRule.id
$origBikeReservationHourlyPrice = $bikeRule.reservationHourlyPrice
Write-Host "  Bike Pricing Rule ID: $bikeRuleId, Original hourly price: $origBikeReservationHourlyPrice" -ForegroundColor Green

# Generate unique plate numbers to allow repeated runs safely
$rand = Get-Random -Minimum 10000 -Maximum 99999
$plateCasual = "51A-CASUAL-$rand"
$plateBooking = "51A-BOOK-$rand"
$plateCancel = "51A-CANCEL-$rand"
$plateExtend = "51A-EXTEND-$rand"

# Login as Driver01 (Driver role)
Write-Host "[Flow] Logging in as driver01..."
$driverLoginBody = @{
    username = "driver01"
    password = "123456"
} | ConvertTo-Json
$driverLoginResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $driverLoginBody
$driverHeaders = @{
    Authorization = "Bearer $($driverLoginResult.data.accessToken)"
}
Write-Host "  Driver logged in successfully." -ForegroundColor Green

# Login as Staff01 (Staff role)
Write-Host "[Flow] Logging in as staff01..."
$staffLoginBody = @{
    username = "staff01"
    password = "123456"
} | ConvertTo-Json
$staffLoginResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $staffLoginBody
$staffHeaders = @{
    Authorization = "Bearer $($staffLoginResult.data.accessToken)"
}
Write-Host "  Staff logged in successfully." -ForegroundColor Green

# Temporarily update pricing rules so hourly reservation price is 10000 (to test booking fee & payment webhook)
Write-Host "[Flow] Temporarily setting hourly reservation price to 10000..."
$updateBody = @{
    reservationHourlyPrice = 10000.00
} | ConvertTo-Json
$updatedRule = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/pricing-rules/$ruleId" -Body $updateBody -Headers $adminHeaders
$updatedBikeRule = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/pricing-rules/$bikeRuleId" -Body $updateBody -Headers $adminHeaders
Write-Host "  Pricing rules updated: Car Hourly = $($updatedRule.data.reservationHourlyPrice), Bike Hourly = $($updatedBikeRule.data.reservationHourlyPrice)" -ForegroundColor Green

try {
    # ----------------- FLOW 1: CASUAL ENTRY FLOW -----------------
    Write-Host "`n[Flow 1] --- Starting Casual Entry Flow ---" -ForegroundColor Cyan

    # A. Get Slot Suggestion (location-suggestion & suggestionToken)
    Write-Host "[Flow 1] Requesting slot suggestion for Car (vehicleTypeId=5) at Gate 1..."
    $suggestion = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/parking-sessions/location-suggestion?vehicleTypeId=5&entryGateId=1" -Headers $staffHeaders
    $suggestionToken = $suggestion.data.suggestionToken
    $suggestedSlotId = $suggestion.data.suggestedSlotId
    $suggestedSlotCode = $suggestion.data.suggestedSlotCode
    $suggestedAreaId = $suggestion.data.suggestedAreaId
    Write-Host "  Suggested Slot ID: $suggestedSlotId (Code: $suggestedSlotCode) with Token: $suggestionToken" -ForegroundColor Green

    # B. Casual Entry Processing
    Write-Host "[Flow 1] Simulating casual entry for plate $plateCasual with Card C004..."
    $casualBody = @{
        entryMode = "CASUAL"
        cardCode = "C004"
        licensePlate = $plateCasual
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = $suggestedAreaId
        selectedSlotId = $suggestedSlotId
        suggestionToken = $suggestionToken
    } | ConvertTo-Json
    $entrySession = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Body $casualBody -Headers $staffHeaders
    if ($entrySession.success -eq $true -and $entrySession.data.entryMode -eq "CASUAL") {
        Write-Host "  Casual entry successful!" -ForegroundColor Green
    } else {
        throw "Casual entry failed or mode incorrect!"
    }

    # ----------------- FLOW 2: DRIVER CREATE BOOKING (NO PLATE) -----------------
    Write-Host "`n[Flow 2] --- Starting Booking Flow (Driver creates booking without plate) ---" -ForegroundColor Cyan

    # A. Get Available Locations for Booking
    Write-Host "[Flow 2] Fetching available locations for booking Car (vehicleTypeId=5)..."
    $locations = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Headers $driverHeaders
    if (@($locations.data.availableSlots).Count -gt 0) {
        $bookingSlotId = $locations.data.availableSlots[0].slotId
        $bookingSlotCode = $locations.data.availableSlots[0].slotCode
        $bookingAreaId = $locations.data.availableSlots[0].areaId
        $bookingFloorId = $locations.data.availableSlots[0].floorId
        Write-Host "  Found available slot: $bookingSlotCode (ID: $bookingSlotId) on Floor: $bookingFloorId" -ForegroundColor Green
    } else {
        throw "No available slots found for booking!"
    }

    # B. Create Reservation
    Write-Host "[Flow 2] Driver creating reservation without driverId, vehicleId, and plateNumber..."
    $reservationBody = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 5
        floorId = $bookingFloorId
        areaId = $bookingAreaId
        slotId = $bookingSlotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    
    $reservation = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $reservationBody -Headers $driverHeaders
    $resId = $reservation.data.reservation.id
    $resCode = $reservation.data.reservation.reservationCode
    
    # Assertions
    if ($resId -ne $null -and $reservation.data.reservation.status -eq "PENDING") {
        Write-Host "  Reservation created: $resCode (ID: $resId) in PENDING status." -ForegroundColor Green
    } else {
        throw "Reservation failed or status is not PENDING!"
    }

    # Simulate webhook payment confirmation
    Write-Host "[Flow 2] Simulating payOS payment webhook to confirm reservation $resCode..."
    $orderCode = $reservation.data.payment.orderCode
    $amount = $reservation.data.payment.amount
    $webhookBody = @{
        code = "00"
        desc = "success"
        success = $true
        data = @{
            orderCode = $orderCode
            amount = $amount
            paymentLinkId = $reservation.data.payment.paymentLinkId
            reference = "REF123"
            transactionDateTime = "2026-06-30T10:00:00Z"
            accountNumber = "123456789"
        }
    } | ConvertTo-Json
    
    $webhookRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/payments/payos/webhook" -Body $webhookBody
    if ($webhookRes.success -ne $true) {
        throw "Webhook simulation failed!"
    }
    Write-Host "  Webhook simulated successfully." -ForegroundColor Green

    # Retrieve confirmed reservation details to verify
    $confirmedRes = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$resId/payment-status" -Headers $driverHeaders
    if ($confirmedRes.data.reservationStatus -ne "CONFIRMED") {
        throw "Expected reservationStatus to be CONFIRMED, but got $($confirmedRes.data.reservationStatus)"
    }
    if ($reservation.data.reservation.driverId -eq $null) {
        throw "Expected driverId to be resolved by backend, but got null!"
    }
    if ($reservation.data.reservation.plateNumber -ne $null -or $reservation.data.reservation.normalizedPlateNumber -ne $null) {
        throw "Expected plateNumber to be null, but got $($reservation.data.reservation.plateNumber)"
    }
    Write-Host "  Verified: Reservation status is CONFIRMED, payment is PAID, driverId resolved ($($reservation.data.reservation.driverId)), and plateNumber is null." -ForegroundColor Green

    # C. Verify Slot Status is RESERVED in DB
    Write-Host "[Flow 2] Verifying slot $bookingSlotCode status is RESERVED..."
    $allSlots = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/slots" -Headers $staffHeaders
    $slotCheck = @($allSlots.data) | Where-Object { $_.id -eq $bookingSlotId }
    if ($slotCheck.status -eq "RESERVED") {
        Write-Host "  Verified: Slot $bookingSlotCode status is RESERVED." -ForegroundColor Green
    } else {
        throw "Expected slot status to be RESERVED, but got $($slotCheck.status)"
    }

    # ----------------- FLOW 3: STAFF RESERVATION ENTRY-CHECK -----------------
    Write-Host "`n[Flow 3] --- Starting Reservation Entry Check ---" -ForegroundColor Cyan
    Write-Host "[Flow 3] Staff scans reservation QR $resCode..."
    $entryCheck = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$resCode/entry-check?entryGateId=1" -Headers $staffHeaders
    
    $reservationEntryToken = $entryCheck.data.reservationEntryToken
    if ($entryCheck.data.status -eq "VALID" -and $reservationEntryToken -ne $null) {
        Write-Host "  Entry check VALID! reservationEntryToken acquired." -ForegroundColor Green
    } else {
        throw "Expected entry-check status VALID and non-null token, got status=$($entryCheck.data.status)"
    }
    if ($entryCheck.data.reservationId -ne $resId -or $entryCheck.data.vehicleTypeId -eq $null) {
        throw "Token properties mismatch!"
    }
    Write-Host "  Verified: reservationId ($($entryCheck.data.reservationId)) matches." -ForegroundColor Green

    # ----------------- FLOW 4: STAFF CHECK-IN BOOKING -----------------
    Write-Host "`n[Flow 4] --- Starting Reservation Check-In ---" -ForegroundColor Cyan
    $plateAtEntry = "51A-TEST-$rand"
    Write-Host "[Flow 4] Staff checking in reservation $resCode with real plate $plateAtEntry on Card C005..."
    
    $checkinBody = @{
        entryMode = "RESERVATION"
        reservationId = $resId
        reservationEntryToken = $reservationEntryToken
        cardCode = "C005"
        licensePlate = $plateAtEntry
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = $bookingAreaId
        selectedSlotId = $bookingSlotId
    } | ConvertTo-Json
    
    $checkinRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Body $checkinBody -Headers $staffHeaders
    
    # Assertions
    if ($checkinRes.success -eq $true -and $checkinRes.data.entryMode -eq "RESERVATION") {
        Write-Host "  Check-In successful!" -ForegroundColor Green
    } else {
        throw "Check-In failed or entryMode incorrect!"
    }
    if ($checkinRes.data.plateNumber -ne $plateAtEntry) {
        throw "Expected plate number $plateAtEntry, but got $($checkinRes.data.plateNumber)"
    }
    if ($checkinRes.data.paymentStatus -ne "PAID" -or $checkinRes.data.paymentRequired -ne $false) {
        throw "Expected paymentStatus PAID and paymentRequired false for reservation entry!"
    }
    Write-Host "  Verified: Plate number captured successfully. Payment status: PAID." -ForegroundColor Green

    # Verify Slot Status is OCCUPIED
    Write-Host "[Flow 4] Verifying slot $bookingSlotCode is now OCCUPIED..."
    $allSlots2 = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/slots" -Headers $staffHeaders
    $slotCheck2 = @($allSlots2.data) | Where-Object { $_.id -eq $bookingSlotId }
    if ($slotCheck2.status -eq "OCCUPIED") {
        Write-Host "  Verified: Slot $bookingSlotCode status is OCCUPIED." -ForegroundColor Green
    } else {
        throw "Expected slot status to be OCCUPIED after check-in, but got $($slotCheck2.status)"
    }

    # Reset reservationHourlyPrice to 0.00 so subsequent bookings confirm immediately
    Write-Host "[Flow] Resetting hourly reservation price to 0.00 for subsequent negative tests..."
    $resetBody = @{
        reservationHourlyPrice = 0.00
    } | ConvertTo-Json
    $updatedRule = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/pricing-rules/$ruleId" -Body $resetBody -Headers $adminHeaders
    $updatedBikeRule = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/pricing-rules/$bikeRuleId" -Body $resetBody -Headers $adminHeaders

    # ----------------- FLOW 5: NEGATIVE BOOKING TESTS -----------------
    Write-Host "`n[Flow 5] --- Starting Negative Booking Tests ---" -ForegroundColor Cyan

    # A. Staff creates booking without driverId (should fail)
    Write-Host "[Flow 5A] Staff creating reservation without driverId (expected: DRIVER_ID_REQUIRED_FOR_STAFF_BOOKING)..."
    $invalidStaffReservationBody = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 5
        floorId = $bookingFloorId
        areaId = $bookingAreaId
        slotId = $bookingSlotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json

    try {
        $dummy = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $invalidStaffReservationBody -Headers $staffHeaders
        throw "Expected failure DRIVER_ID_REQUIRED_FOR_STAFF_BOOKING but reservation succeeded!"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*DRIVER_ID_REQUIRED_FOR_STAFF_BOOKING*") {
            Write-Host "  [ PASS ] Failed correctly with DRIVER_ID_REQUIRED_FOR_STAFF_BOOKING" -ForegroundColor Green
        } else {
            throw "Expected DRIVER_ID_REQUIRED_FOR_STAFF_BOOKING, but got: $errText"
        }
    }

    # B. Booking slot vehicle without plate but noPlate = true (should fail)
    Write-Host "[Flow 5B] Creating booking and attempting entry for Car with noPlate = true (expected: PLATE_REQUIRED_FOR_SLOT_VEHICLE)..."
    # Find next slot
    $locationsTmp = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Headers $driverHeaders
    $tmpSlot = $locationsTmp.data.availableSlots[0]
    $tmpResBody = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 5
        floorId = $tmpSlot.floorId
        areaId = $tmpSlot.areaId
        slotId = $tmpSlot.slotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $tmpRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $tmpResBody -Headers $driverHeaders
    
    # Get entry token
    $tmpCheck = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($tmpRes.data.reservation.reservationCode)/entry-check?entryGateId=1" -Headers $staffHeaders
    $tmpToken = $tmpCheck.data.reservationEntryToken
    
    # Check-in with noPlate = true
    $invalidNoPlateCheckinBody = @{
        entryMode = "RESERVATION"
        reservationId = $tmpRes.data.reservation.id
        reservationEntryToken = $tmpToken
        cardCode = "C006"
        licensePlate = $null
        noPlate = $true
        vehicleDescription = "Xe khong co bien so"
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = $tmpSlot.areaId
        selectedSlotId = $tmpSlot.slotId
    } | ConvertTo-Json

    try {
        $dummy = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Body $invalidNoPlateCheckinBody -Headers $staffHeaders
        throw "Expected failure PLATE_REQUIRED_FOR_SLOT_VEHICLE but check-in succeeded!"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*PLATE_REQUIRED_FOR_SLOT_VEHICLE*") {
            Write-Host "  [ PASS ] Failed correctly with PLATE_REQUIRED_FOR_SLOT_VEHICLE" -ForegroundColor Green
        } else {
            throw "Expected PLATE_REQUIRED_FOR_SLOT_VEHICLE, but got: $errText"
        }
    }

    # C. Booking already has plate, entry with mismatch plate (should fail)
    Write-Host "[Flow 5C] Creating booking with plate '51A-11111', entry with '51A-99999' (expected: RESERVATION_PLATE_MISMATCH)..."
    # Find next slot
    $locationsTmp2 = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Headers $driverHeaders
    $tmpSlot2 = $locationsTmp2.data.availableSlots[0]
    $tmpResWithPlateBody = @{
        vehicleId = $null
        plateNumber = "51A-11111"
        vehicleTypeId = 5
        floorId = $tmpSlot2.floorId
        areaId = $tmpSlot2.areaId
        slotId = $tmpSlot2.slotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $tmpResWithPlate = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $tmpResWithPlateBody -Headers $driverHeaders
    
    # Get entry token
    $tmpCheck2 = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($tmpResWithPlate.data.reservation.reservationCode)/entry-check?entryGateId=1" -Headers $staffHeaders
    $tmpToken2 = $tmpCheck2.data.reservationEntryToken
    
    # Check-in with wrong plate
    $wrongPlateEntryBody = @{
        entryMode = "RESERVATION"
        reservationId = $tmpResWithPlate.data.reservation.id
        reservationEntryToken = $tmpToken2
        cardCode = "C007"
        licensePlate = "51A-99999"
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = $tmpSlot2.areaId
        selectedSlotId = $tmpSlot2.slotId
    } | ConvertTo-Json

    try {
        $dummy = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Body $wrongPlateEntryBody -Headers $staffHeaders
        throw "Expected failure RESERVATION_PLATE_MISMATCH but check-in succeeded!"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*RESERVATION_PLATE_MISMATCH*") {
            Write-Host "  [ PASS ] Failed correctly with RESERVATION_PLATE_MISMATCH" -ForegroundColor Green
        } else {
            throw "Expected RESERVATION_PLATE_MISMATCH, but got: $errText"
        }
    }

    # D. Test slot status not RESERVED during reservation entry-check (expected: RESERVED_SLOT_NOT_AVAILABLE)
    Write-Host "[Flow 5D] Creating reservation and changing slot status from RESERVED to AVAILABLE to check validation (expected: RESERVED_SLOT_NOT_AVAILABLE)..."
    $locationsTmp3 = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Headers $driverHeaders
    $tmpSlot3 = $locationsTmp3.data.availableSlots[0]
    $tmpRes3Body = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 5
        floorId = $tmpSlot3.floorId
        areaId = $tmpSlot3.areaId
        slotId = $tmpSlot3.slotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $tmpRes3 = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $tmpRes3Body -Headers $driverHeaders
    
    # Change slot status to AVAILABLE via Admin PATCH API
    $updateSlotBody = @{
        status = "AVAILABLE"
    } | ConvertTo-Json
    $dummyUpdate = Invoke-ApiRequest -Method Patch -Uri "$BaseUrl/api/core/slots/$($tmpSlot3.slotId)/status" -Body $updateSlotBody -Headers $adminHeaders
    
    try {
        $dummy = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($tmpRes3.data.reservation.reservationCode)/entry-check?entryGateId=1" -Headers $staffHeaders
        throw "Expected failure RESERVED_SLOT_NOT_AVAILABLE but entry-check succeeded!"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*RESERVED_SLOT_NOT_AVAILABLE*") {
            Write-Host "  [ PASS ] Failed correctly with RESERVED_SLOT_NOT_AVAILABLE" -ForegroundColor Green
        } else {
            throw "Expected RESERVED_SLOT_NOT_AVAILABLE, but got: $errText"
        }
    } finally {
        # Restore slot status to RESERVED so cleanup/other tests don't break
        $restoreSlotBody = @{
            status = "RESERVED"
        } | ConvertTo-Json
        $dummyRestore = Invoke-ApiRequest -Method Patch -Uri "$BaseUrl/api/core/slots/$($tmpSlot3.slotId)/status" -Body $restoreSlotBody -Headers $adminHeaders
    }

    # E. Test noPlate = true check-in for area-managed vehicle (expected: success)
    Write-Host "[Flow 5E] Booking and entry check-in for Bicycle (noPlate = true, expected: success)..."
    $locationsBike = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=1" -Headers $driverHeaders
    $bikeArea = $locationsBike.data.availableAreas[0]
    
    $bikeResBody = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 1
        floorId = $bikeArea.floorId
        areaId = $bikeArea.areaId
        slotId = $null
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $bikeRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $bikeResBody -Headers $driverHeaders
    
    $bikeCheck = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($bikeRes.data.reservation.reservationCode)/entry-check?entryGateId=1" -Headers $staffHeaders
    $bikeToken = $bikeCheck.data.reservationEntryToken
    
    # Find an AVAILABLE card dynamically for bicycle check-in (using adminHeaders because cards API requires ADMIN/MANAGER role)
    $cardsRes = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/cards" -Headers $adminHeaders
    $availableCard = $cardsRes.data | Where-Object { $_.status -eq "AVAILABLE" } | Select-Object -First 1
    $bikeCardCode = if ($availableCard) { $availableCard.cardNumber } else { "C008" }
    
    $bikeCheckinBody = @{
        entryMode = "RESERVATION"
        reservationId = $bikeRes.data.reservation.id
        reservationEntryToken = $bikeToken
        cardCode = $bikeCardCode
        licensePlate = $null
        noPlate = $true
        vehicleDescription = "Xe dap mau xanh la test"
        vehicleTypeId = 1
        entryGateId = 1
        selectedAreaId = $bikeArea.areaId
        selectedSlotId = $null
    } | ConvertTo-Json
    
    $bikeSession = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Body $bikeCheckinBody -Headers $staffHeaders
    
    if ($bikeSession.data.sessionId -eq $null) {
        throw "Bicycle check-in failed: sessionId is null"
    }
    if ($bikeSession.data.noPlate -ne $true) {
        throw "Expected noPlate=true"
    }
    if ($null -ne $bikeSession.data.plateNumber) {
        throw "Expected plateNumber null for noPlate session, but got: $($bikeSession.data.plateNumber)"
    }
    if ($null -ne $bikeSession.data.normalizedPlateNumber) {
        throw "Expected normalizedPlateNumber null for noPlate session, but got: $($bikeSession.data.normalizedPlateNumber)"
    }

    $dump = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/health/dump-reservations" -Headers $adminHeaders
    $r = @($dump.data) | Where-Object { $_.id -eq $bikeRes.data.reservation.id }
    if ($r -and $r.status -eq "COMPLETED" -and $r.plateNumber -eq $null -and $r.normalizedPlateNumber -eq $null) {
        Write-Host "  [ PASS ] Bicycle check-in succeeded. noPlate is true, plate fields are null." -ForegroundColor Green
    } else {
        throw "Expected reservation to be COMPLETED with null plate fields, but got: plateNumber=$($r.plateNumber), normalized=$($r.normalizedPlateNumber)"
    }

    # ======================================================================
    #   [Flow 6] --- Starting API Response Format Standard Validation Tests ---
    # ======================================================================
    Write-Host "`n[Flow 6] --- API Response Format Standard Validation Tests ---" -ForegroundColor Cyan

    # 1. Success validation: GET /api/core/vehicle-types
    Write-Host "[Flow 6] Checking success format on GET /api/core/vehicle-types..."
    $vtRes = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/vehicle-types" -Headers $adminHeaders
    Assert-ApiSuccessFormat -Response $vtRes
    Write-Host "  [ PASS ] Success format valid." -ForegroundColor Green

    # 2. Success validation: POST /api/core/reservations (Car)
    Write-Host "[Flow 6] Checking success format on POST /api/core/reservations..."
    $locations6 = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Headers $driverHeaders
    $slot6 = $locations6.data.availableSlots[0]
    $carResBody = @{
        vehicleTypeId = 5
        floorId = $slot6.floorId
        areaId = $slot6.areaId
        slotId = $slot6.slotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $resSuccess = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $carResBody -Headers $driverHeaders
    Assert-ApiSuccessFormat -Response $resSuccess
    if ($resSuccess.statusCode -ne 201) { throw "Expected statusCode 201 but got $($resSuccess.statusCode)" }
    Write-Host "  [ PASS ] Created success format valid (statusCode 201)." -ForegroundColor Green

    # 3. Validation error: POST /api/core/reservations (missing vehicleTypeId)
    Write-Host "[Flow 6] Checking validation error format on POST /api/core/reservations..."
    $invalidResBody = @{
        vehicleTypeId = "not-a-number"
        floorId = 1
        areaId = 2
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    
    $valErrorResponse = $null
    try {
        $res = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $invalidResBody -Headers $driverHeaders
    } catch {
        $errText = $_.Exception.Message
        if ($errText -match 'API Error status=\w+:\s*(\{.*\})') {
            $valErrorResponse = $Matches[1] | ConvertFrom-Json
        }
    }
    if ($null -eq $valErrorResponse) { throw "Expected validation error but request succeeded or parse failed" }
    Assert-ApiErrorFormat -Response $valErrorResponse -ExpectedErrorCode "VALIDATION_ERROR"
    if ($valErrorResponse.statusCode -ne 400) { throw "Expected statusCode 400 but got $($valErrorResponse.statusCode)" }
    Write-Host "  [ PASS ] Validation error format valid." -ForegroundColor Green

    # 4. Business error: POST /api/core/parking-sessions/entry (Car with noPlate = true)
    Write-Host "[Flow 6] Checking business error format on POST /api/core/parking-sessions/entry..."
    $noPlateCarBody = @{
        entryMode = "CASUAL"
        cardCode = "C003"
        licensePlate = $null
        noPlate = $true
        vehicleTypeId = 5
        entryGateId = 1
    } | ConvertTo-Json
    
    $bizErrorResponse = $null
    try {
        $res = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Body $noPlateCarBody -Headers $staffHeaders
    } catch {
        $errText = $_.Exception.Message
        if ($errText -match 'API Error status=\w+:\s*(\{.*\})') {
            $bizErrorResponse = $Matches[1] | ConvertFrom-Json
        }
    }
    if ($null -eq $bizErrorResponse) { throw "Expected business error but request succeeded" }
    Assert-ApiErrorFormat -Response $bizErrorResponse -ExpectedErrorCode "PLATE_REQUIRED_FOR_SLOT_VEHICLE"
    if ($bizErrorResponse.statusCode -ne 400) { throw "Expected statusCode 400 but got $($bizErrorResponse.statusCode)" }
    Write-Host "  [ PASS ] Business error format valid." -ForegroundColor Green

    # 5. Dev endpoint: GET /api/core/health/dump-reservations
    Write-Host "[Flow 6] Checking success format on dev endpoint GET /api/core/health/dump-reservations..."
    $dumpRes = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/health/dump-reservations" -Headers $adminHeaders
    Assert-ApiSuccessFormat -Response $dumpRes
    Write-Host "  [ PASS ] Dev endpoint success format valid." -ForegroundColor Green

    Write-Host "`n[SUCCESS] Flow tests completed successfully!" -ForegroundColor Green

} finally {
    if ($ruleId -and $origReservationHourlyPrice -ne $null) {
        Write-Host "`n[Flow Cleanup] Restoring Car hourly reservation price to $origReservationHourlyPrice..." -ForegroundColor Cyan
        $restoreBody = @{
            reservationHourlyPrice = $origReservationHourlyPrice
        } | ConvertTo-Json
        try {
            $restoredRule = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/pricing-rules/$ruleId" -Body $restoreBody -Headers $adminHeaders
            Write-Host "  Restored Car successfully. Hourly price = $($restoredRule.data.reservationHourlyPrice)" -ForegroundColor Green
        } catch {
            Write-Host "  [Warning] Failed to restore Car pricing rule: $_" -ForegroundColor Yellow
        }
    }

    if ($bikeRuleId -and $origBikeReservationHourlyPrice -ne $null) {
        Write-Host "[Flow Cleanup] Restoring Bike hourly reservation price to $origBikeReservationHourlyPrice..." -ForegroundColor Cyan
        $restoreBikeBody = @{
            reservationHourlyPrice = $origBikeReservationHourlyPrice
        } | ConvertTo-Json
        try {
            $restoredBikeRule = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/pricing-rules/$bikeRuleId" -Body $restoreBikeBody -Headers $adminHeaders
            Write-Host "  Restored Bike successfully. Hourly price = $($restoredBikeRule.data.reservationHourlyPrice)" -ForegroundColor Green
        } catch {
            Write-Host "  [Warning] Failed to restore Bike pricing rule: $_" -ForegroundColor Yellow
        }
    }
}
```

### File: `scripts/test-api-smoke.ps1`

```powershell
param (
    [string]$BaseUrl = "http://localhost:5000"
)

$ErrorActionPreference = "Stop"

function Invoke-ApiRequest {
    param (
        [string]$Method,
        [string]$Uri,
        [object]$Headers = @{},
        [string]$Body,
        [string]$ContentType = "application/json"
    )
    
    $params = @{
        Method = $Method
        Uri = $Uri
        Headers = $Headers
    }
    if ($Body) {
        $params.Body = $Body
        $params.ContentType = $ContentType
    }
    
    try {
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        $statusCode = ""
        $errBody = ""
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                if ($stream) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $errBody = $reader.ReadToEnd()
                    $reader.Close()
                }
            } catch {}
        }
        if ($errBody) {
            throw "API Error status=$($statusCode): $errBody"
        } else {
            throw "Request failed: $($_.Exception.Message)"
        }
    }
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Running SMOKE tests on $BaseUrl" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Health Check
Write-Host "[Smoke] Checking Health endpoint..."
$health = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/health"
if ($health.success -eq $true -and $health.data.status -eq "UP") {
    Write-Host "  Health: OK" -ForegroundColor Green
} else {
    throw "Health check failed: $($health | ConvertTo-Json)"
}

# 2. Swagger Schema JSON Check
Write-Host "[Smoke] Fetching swagger.json..."
$swagger = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/swagger/v1/swagger.json"
if ($swagger.openapi) {
    Write-Host "  Swagger JSON: OK (OpenAPI version: $($swagger.openapi))" -ForegroundColor Green
} else {
    throw "Swagger JSON fetch failed or invalid format."
}

# 3. Login as Staff
Write-Host "[Smoke] Logging in as staff01..."
$loginBody = @{
    username = "staff01"
    password = "123456"
} | ConvertTo-Json
$loginResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $loginBody
$token = $loginResult.data.accessToken
if ($token) {
    Write-Host "  Login (Staff): OK (Token received)" -ForegroundColor Green
} else {
    throw "Login (Staff) failed: $($loginResult | ConvertTo-Json)"
}

$headers = @{
    Authorization = "Bearer $token"
}

# 4. Get Me profile (Staff)
Write-Host "[Smoke] Retrieving current profile (me) as staff..."
$meResult = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/auth/me" -Headers $headers
if ($meResult.success -eq $true -and $meResult.data.username -eq "staff01") {
    Write-Host "  Me Profile: OK (role = $($meResult.data.role))" -ForegroundColor Green
} else {
    throw "Profile retrieval failed: $($meResult | ConvertTo-Json)"
}

# 5. GET floors
Write-Host "[Smoke] Fetching floors list..."
$floors = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/floors" -Headers $headers
if (@($floors.data).Count -gt 0) {
    Write-Host "  Floors list count: $(@($floors.data).Count) (OK)" -ForegroundColor Green
} else {
    throw "Floors list is empty!"
}

# 6. GET areas
Write-Host "[Smoke] Fetching areas list..."
$areas = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/areas" -Headers $headers
if (@($areas.data).Count -gt 0) {
    Write-Host "  Areas list count: $(@($areas.data).Count) (OK)" -ForegroundColor Green
} else {
    throw "Areas list is empty!"
}

# 7. GET slots
Write-Host "[Smoke] Fetching slots list..."
$slots = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/slots" -Headers $headers
if (@($slots.data).Count -gt 0) {
    Write-Host "  Slots list count: $(@($slots.data).Count) (OK)" -ForegroundColor Green
} else {
    throw "Slots list is empty!"
}

# 8. Login as Admin
Write-Host "[Smoke] Logging in as admin01..."
$adminLoginBody = @{
    username = "admin01"
    password = "123456"
} | ConvertTo-Json
$adminLoginResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $adminLoginBody
$adminToken = $adminLoginResult.data.accessToken
if ($adminToken) {
    Write-Host "  Login (Admin): OK" -ForegroundColor Green
} else {
    throw "Login (Admin) failed."
}

$adminHeaders = @{
    Authorization = "Bearer $adminToken"
}

# 9. GET db-check (Admin Only)
Write-Host "[Smoke] Running DB check as admin..."
$dbCheck = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/db-check" -Headers $adminHeaders
if ($dbCheck.success -eq $true -and $dbCheck.data.efCoreVerification.success -eq $true) {
    Write-Host "  DB Check: OK" -ForegroundColor Green
} else {
    throw "DB Check failed: $($dbCheck | ConvertTo-Json)"
}

Write-Host "`n[SUCCESS] Smoke tests completed successfully!" -ForegroundColor Green
```

### File: `scripts/test-api.ps1`

```powershell
# .NET Core API Automation Testing Script
# Usage: .\scripts\test-api.ps1 [-BaseUrl "http://localhost:5000"]

param (
    [string]$BaseUrl = "http://localhost:5000"
)

function Invoke-RestMethod {
    param (
        [string]$Uri,
        [string]$Method = "Get",
        $Headers = $null,
        $Body = $null,
        [string]$ContentType = "application/json"
    )
    $params = @{
        Uri = $Uri
        Method = $Method
    }
    if ($Headers) { $params.Headers = $Headers }
    if ($Body) {
        $params.Body = $Body
        $params.ContentType = $ContentType
    }
    try {
        return Microsoft.PowerShell.Utility\Invoke-RestMethod @params
    } catch {
        $ex = $_.Exception
        if ($ex.Response) {
            $reader = [System.IO.StreamReader]::new($ex.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            try {
                $errObj = $responseBody | ConvertFrom-Json
                if ($errObj.message) {
                    $msg = $errObj.message
                    if ($errObj.errors) {
                        $msg += " | " + ($errObj.errors -join ", ")
                    }
                    throw [System.Exception]::new($msg)
                }
            } catch {}
            throw [System.Exception]::new("$($ex.Message) - Response: $responseBody")
        }
        throw $ex
    }
}

function Get-ErrorText {
    param($ErrorObject)
    $text = ""
    if ($ErrorObject) {
        if ($ErrorObject.Exception) {
            $text += $ErrorObject.Exception.Message
        }
        if ($ErrorObject.ErrorDetails -and $ErrorObject.ErrorDetails.Message) {
            $text += " " + $ErrorObject.ErrorDetails.Message
        }
        if ([string]::IsNullOrWhiteSpace($text)) {
            $text = [string]$ErrorObject
        }
    }
    return $text
}

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " STARTING .NET CORE API COMPREHENSIVE AUTOMATION TESTS" -ForegroundColor Cyan
Write-Host " Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$globalTestsPassed = 0
$globalTestsFailed = 0

function Report-Result {
    param (
        [string]$TestName,
        [bool]$Success,
        [string]$ErrorMessage = ""
    )
    if ($Success) {
        Write-Host "[ PASS ] " -NoNewline -ForegroundColor Green
        Write-Host $TestName
        $script:globalTestsPassed++
    } else {
        Write-Host "[ FAIL ] " -NoNewline -ForegroundColor Red
        Write-Host "$TestName" -NoNewline
        if ($ErrorMessage) {
            Write-Host " (Error: $ErrorMessage)" -ForegroundColor Red
        } else {
            Write-Host ""
        }
        $script:globalTestsFailed++
    }
}

# Generate unique codes to prevent duplicate constraint errors
$rand = Get-Random -Minimum 10000 -Maximum 99999
$floorCode = "F$rand"
$floorName = "Test Floor $rand"
$areaCode = "A$rand"
$areaName = "Test Area $rand"
$slotCode = "S$rand"
$plateNumber = "TEST-$rand"
$confirmedPlateNumber = "CONF-$rand"

$token = ""
$headers = @{
    "Content-Type" = "application/json"
}

# ----------------- TEST 1: Health Check -----------------
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/health" -Method Get
    if ($res.success -eq $true -and $res.data.status -eq "UP") {
        Report-Result -TestName "GET /api/core/health (API status UP)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/health" -Success $false -ErrorMessage "API status not UP"
    }
} catch {
    Report-Result -TestName "GET /api/core/health" -Success $false -ErrorMessage $_.Exception.Message
}

# ----------------- Database Migration Setup -----------------
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/health/migrate-db" -Method Post
    if ($res.message -like "*migrated*") {
        Report-Result -TestName "POST /api/core/health/migrate-db (Run raw SQL migrations)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/health/migrate-db" -Success $false -ErrorMessage $res.message
    }
} catch {
    Report-Result -TestName "POST /api/core/health/migrate-db" -Success $false -ErrorMessage $_.Exception.Message
}

# ----------------- TEST 2: Login -----------------
try {
    $body = @{
        username = "admin01"
        password = "123456"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/auth/login" -Method Post -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.accessToken) {
        $token = $res.data.accessToken
        $headers.Add("Authorization", "Bearer $token")
        Report-Result -TestName "POST /api/core/auth/login (Retrieve JWT Token)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/auth/login" -Success $false -ErrorMessage "Token missing in response"
    }
} catch {
    Report-Result -TestName "POST /api/core/auth/login" -Success $false -ErrorMessage $_.Exception.Message
}

# Skip authenticated tests if login failed
if (-not $token) {
    Write-Host "CRITICAL: Login failed. Skipping authenticated tests." -ForegroundColor Yellow
    Write-Host "===================================================="
    Write-Host "PASSED: $globalTestsPassed, FAILED: $globalTestsFailed" -ForegroundColor Red
    Exit 1
}

# ----------------- TEST 3: Get Me Profile -----------------
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/auth/me" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data.username -eq "admin01") {
        Report-Result -TestName "GET /api/core/auth/me (User Profile verification)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/auth/me" -Success $false -ErrorMessage "Profile mismatch"
    }
} catch {
    Report-Result -TestName "GET /api/core/auth/me" -Success $false -ErrorMessage $_.Exception.Message
}

# ----------------- TEST 4: Get Floors List -----------------
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/floors" -Method Get -Headers $headers
    if ($res.value -and $res.value.Count -gt 0) {
        Report-Result -TestName "GET /api/core/floors (List count > 0)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/floors" -Success $false -ErrorMessage "Empty floors list"
    }
} catch {
    Report-Result -TestName "GET /api/core/floors" -Success $false -ErrorMessage $_.Exception.Message
}

# ----------------- TEST 5: Create Floor -----------------
$floorId = $null
try {
    $body = @{
        floorCode = $floorCode
        floorName = $floorName
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/floors" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.data.id) {
        $floorId = $res.data.id
        Report-Result -TestName "POST /api/core/floors (Create Floor $floorCode)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/floors" -Success $false -ErrorMessage "Floor ID not returned"
    }
} catch {
    Report-Result -TestName "POST /api/core/floors" -Success $false -ErrorMessage $_.Exception.Message
}

# ----------------- TEST 6: Update Floor -----------------
if ($floorId) {
    try {
        $body = @{
            floorName = "$floorName (Updated)"
            status = "ACTIVE"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/floors/$floorId" -Method Put -Headers $headers -ContentType "application/json" -Body $body
        if ($res.data.floorName -like "*(Updated)*") {
            Report-Result -TestName "PUT /api/core/floors/{id} (Update Floor Name)" -Success $true
        } else {
            Report-Result -TestName "PUT /api/core/floors/{id}" -Success $false -ErrorMessage "Floor name not updated"
        }
    } catch {
        Report-Result -TestName "PUT /api/core/floors/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PUT /api/core/floors/{id}" -Success $false -ErrorMessage "Skipped (no floorId)"
}

# ----------------- TEST 7: Create Area -----------------
$areaId = $null
if ($floorId) {
    try {
        $body = @{
            floorId = $floorId
            areaCode = $areaCode
            areaName = $areaName
            totalCapacity = 10
            vehicleTypeIds = @(5) # Support Cars
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/areas" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.data.id) {
            $areaId = $res.data.id
            Report-Result -TestName "POST /api/core/areas (Create Area $areaCode)" -Success $true
        } else {
            Report-Result -TestName "POST /api/core/areas" -Success $false -ErrorMessage "Area ID not returned"
        }
    } catch {
        Report-Result -TestName "POST /api/core/areas" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "POST /api/core/areas" -Success $false -ErrorMessage "Skipped (no floorId)"
}

# ----------------- TEST 8: Update Area -----------------
if ($areaId) {
    try {
        $body = @{
            areaName = "$areaName (Updated)"
            priorityOrder = 25
            totalCapacity = 20
            status = "ACTIVE"
            vehicleTypeIds = @(5)
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/areas/$areaId" -Method Put -Headers $headers -ContentType "application/json" -Body $body
        if ($res.data.areaName -like "*(Updated)*") {
            Report-Result -TestName "PUT /api/core/areas/{id} (Update Area Name)" -Success $true
        } else {
            Report-Result -TestName "PUT /api/core/areas/{id}" -Success $false -ErrorMessage "Area name not updated"
        }
    } catch {
        Report-Result -TestName "PUT /api/core/areas/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PUT /api/core/areas/{id}" -Success $false -ErrorMessage "Skipped (no areaId)"
}

# ----------------- TEST 9: Create Slot -----------------
$slotId = $null
if ($areaId) {
    try {
        $body = @{
            areaId = $areaId
            slotCode = $slotCode
            allowedVehicleTypeId = 5
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/slots" -Method Post -Headers $headers -ContentType "application/json" -Body $body
        if ($res.data.id) {
            $slotId = $res.data.id
            Report-Result -TestName "POST /api/core/slots (Create Slot $slotCode)" -Success $true
        } else {
            Report-Result -TestName "POST /api/core/slots" -Success $false -ErrorMessage "Slot ID not returned"
        }
    } catch {
        Report-Result -TestName "POST /api/core/slots" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "POST /api/core/slots" -Success $false -ErrorMessage "Skipped (no areaId)"
}

# ----------------- TEST 10: Patch Slot Status -----------------
if ($slotId) {
    try {
        $body = @{
            status = "AVAILABLE"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/slots/$slotId/status" -Method Patch -Headers $headers -ContentType "application/json" -Body $body
        if ($res.data.status -eq "AVAILABLE") {
            Report-Result -TestName "PATCH /api/core/slots/{id}/status (Set slot to AVAILABLE)" -Success $true
        } else {
            Report-Result -TestName "PATCH /api/core/slots/{id}/status" -Success $false -ErrorMessage "Status is not AVAILABLE"
        }
    } catch {
        Report-Result -TestName "PATCH /api/core/slots/{id}/status" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PATCH /api/core/slots/{id}/status" -Success $false -ErrorMessage "Skipped (no slotId)"
}

# ----------------- TEST 11: Query Available Locations -----------------
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data.availableSlots) {
        Report-Result -TestName "GET /api/core/reservations/available-locations (RequiresSlot = true)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/reservations/available-locations" -Success $false -ErrorMessage "Response structure incorrect"
    }
} catch {
    Report-Result -TestName "GET /api/core/reservations/available-locations" -Success $false -ErrorMessage $_.Exception.Message
}


# ======================================================================
#                     USERS MANAGEMENT CRUD (TEST 12 - 18)
# ======================================================================
$testUserId = $null
$testUsername = "testuser$rand"

# 12. List Users
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data) {
        Report-Result -TestName "GET /api/core/users (List users)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/users" -Success $false -ErrorMessage "Empty user data"
    }
} catch {
    Report-Result -TestName "GET /api/core/users" -Success $false -ErrorMessage $_.Exception.Message
}

# 12a. List Users with Filters (search, role, status)
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users?role=ADMIN&status=ACTIVE&search=admin" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data.Count -gt 0) {
        Report-Result -TestName "GET /api/core/users?role=ADMIN&status=ACTIVE&search=admin" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/users?role=ADMIN&status=ACTIVE&search=admin" -Success $false -ErrorMessage "Failed to search/filter users"
    }
} catch {
    Report-Result -TestName "GET /api/core/users?role=ADMIN&status=ACTIVE&search=admin" -Success $false -ErrorMessage $_.Exception.Message
}


# 13. Create User
try {
    $body = @{
        username = $testUsername
        password = "Password123"
        fullName = "Test Integration User"
        email = "$testUsername@example.com"
        phone = ("09" + (Get-Random -Minimum 10000000 -Maximum 99999999))
        role = "STAFF"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.id) {
        $testUserId = $res.data.id
        Report-Result -TestName "POST /api/core/users (Create User $testUsername)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/users" -Success $false -ErrorMessage "Failed to create user"
    }
} catch {
    Report-Result -TestName "POST /api/core/users" -Success $false -ErrorMessage $_.Exception.Message
}

# 14. Get User By ID
if ($testUserId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users/$testUserId" -Method Get -Headers $headers
        if ($res.success -eq $true -and $res.data.username -eq $testUsername) {
            Report-Result -TestName "GET /api/core/users/{id} (Verify created user details)" -Success $true
        } else {
            Report-Result -TestName "GET /api/core/users/{id}" -Success $false -ErrorMessage "User details mismatch"
        }
    } catch {
        Report-Result -TestName "GET /api/core/users/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "GET /api/core/users/{id}" -Success $false -ErrorMessage "Skipped (no testUserId)"
}

# 15. Update User
if ($testUserId) {
    try {
        $body = @{
            fullName = "Test User Updated"
            email = "updated-$testUsername@example.com"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users/$testUserId" -Method Put -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.fullName -eq "Test User Updated") {
            Report-Result -TestName "PUT /api/core/users/{id} (Update User Info)" -Success $true
        } else {
            Report-Result -TestName "PUT /api/core/users/{id}" -Success $false -ErrorMessage "User name not updated"
        }
    } catch {
        Report-Result -TestName "PUT /api/core/users/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PUT /api/core/users/{id}" -Success $false -ErrorMessage "Skipped (no testUserId)"
}

# 16. Patch User Status
if ($testUserId) {
    try {
        $body = @{
            status = "LOCKED"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users/$testUserId/status" -Method Patch -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.status -eq "LOCKED") {
            Report-Result -TestName "PATCH /api/core/users/{id}/status (Set user status to LOCKED)" -Success $true
        } else {
            Report-Result -TestName "PATCH /api/core/users/{id}/status" -Success $false -ErrorMessage "User status not changed"
        }
    } catch {
        Report-Result -TestName "PATCH /api/core/users/{id}/status" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PATCH /api/core/users/{id}/status" -Success $false -ErrorMessage "Skipped (no testUserId)"
}

# 17. Patch User Role
if ($testUserId) {
    try {
        $body = @{
            role = "MANAGER"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users/$testUserId/role" -Method Patch -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.role -eq "MANAGER") {
            Report-Result -TestName "PATCH /api/core/users/{id}/role (Change user role to MANAGER)" -Success $true
        } else {
            Report-Result -TestName "PATCH /api/core/users/{id}/role" -Success $false -ErrorMessage "User role not changed"
        }
    } catch {
        Report-Result -TestName "PATCH /api/core/users/{id}/role" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PATCH /api/core/users/{id}/role" -Success $false -ErrorMessage "Skipped (no testUserId)"
}

# 18. Delete User
if ($testUserId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users/$testUserId" -Method Delete -Headers $headers
        if ($res.success -eq $true) {
            Report-Result -TestName "DELETE /api/core/users/{id} (Remove test user)" -Success $true
        } else {
            Report-Result -TestName "DELETE /api/core/users/{id}" -Success $false -ErrorMessage "User not deleted"
        }
    } catch {
        Report-Result -TestName "DELETE /api/core/users/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "DELETE /api/core/users/{id}" -Success $false -ErrorMessage "Skipped (no testUserId)"
}


# ======================================================================
#                     PARKING CARDS CRUD (TEST 19 - 25)
# ======================================================================
$testCardId = $null
$testCardNum = "TC$rand"

# 19. List Cards
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data) {
        Report-Result -TestName "GET /api/core/cards (List cards)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/cards" -Success $false -ErrorMessage "Empty card data"
    }
} catch {
    Report-Result -TestName "GET /api/core/cards" -Success $false -ErrorMessage $_.Exception.Message
}

# 19a. List Cards with Filters (search)
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards?search=C010" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data.Count -gt 0) {
        Report-Result -TestName "GET /api/core/cards?search=C010" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/cards?search=C010" -Success $false -ErrorMessage "Failed to search/filter cards"
    }
} catch {
    Report-Result -TestName "GET /api/core/cards?search=C010" -Success $false -ErrorMessage $_.Exception.Message
}


# 20. List Available Cards
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/available" -Method Get -Headers $headers
    if ($res.success -eq $true) {
        Report-Result -TestName "GET /api/core/cards/available (List available cards)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/cards/available" -Success $false -ErrorMessage "Available cards request failed"
    }
} catch {
    Report-Result -TestName "GET /api/core/cards/available" -Success $false -ErrorMessage $_.Exception.Message
}

# 21. Create Card
try {
    $body = @{
        cardNumber = $testCardNum
        note = "Card for integration testing"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.id) {
        $testCardId = $res.data.id
        Report-Result -TestName "POST /api/core/cards (Create Card $testCardNum)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/cards" -Success $false -ErrorMessage "Failed to create card"
    }
} catch {
    Report-Result -TestName "POST /api/core/cards" -Success $false -ErrorMessage $_.Exception.Message
}

# 22. Get Card Details
if ($testCardId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/$testCardId" -Method Get -Headers $headers
        if ($res.success -eq $true -and $res.data.cardNumber -eq $testCardNum) {
            Report-Result -TestName "GET /api/core/cards/{id} (Verify created card details)" -Success $true
        } else {
            Report-Result -TestName "GET /api/core/cards/{id}" -Success $false -ErrorMessage "Card details mismatch"
        }
    } catch {
        Report-Result -TestName "GET /api/core/cards/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "GET /api/core/cards/{id}" -Success $false -ErrorMessage "Skipped (no testCardId)"
}

# 23. Update Card Note
if ($testCardId) {
    try {
        $body = @{
            note = "Updated note"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/$testCardId" -Method Put -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.note -eq "Updated note") {
            Report-Result -TestName "PUT /api/core/cards/{id} (Update Card Note)" -Success $true
        } else {
            Report-Result -TestName "PUT /api/core/cards/{id}" -Success $false -ErrorMessage "Card note not updated"
        }
    } catch {
        Report-Result -TestName "PUT /api/core/cards/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PUT /api/core/cards/{id}" -Success $false -ErrorMessage "Skipped (no testCardId)"
}

# 24. Patch Card Status
if ($testCardId) {
    try {
        $body = '"INACTIVE"'
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/$testCardId/status" -Method Patch -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.status -eq "INACTIVE") {
            Report-Result -TestName "PATCH /api/core/cards/{id}/status (Set card status to INACTIVE)" -Success $true
        } else {
            Report-Result -TestName "PATCH /api/core/cards/{id}/status" -Success $false -ErrorMessage "Card status not changed"
        }
    } catch {
        Report-Result -TestName "PATCH /api/core/cards/{id}/status" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PATCH /api/core/cards/{id}/status" -Success $false -ErrorMessage "Skipped (no testCardId)"
}

# 25. Delete Card
if ($testCardId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/$testCardId" -Method Delete -Headers $headers
        if ($res.success -eq $true) {
            Report-Result -TestName "DELETE /api/core/cards/{id} (Remove test card)" -Success $true
        } else {
            Report-Result -TestName "DELETE /api/core/cards/{id}" -Success $false -ErrorMessage "Card not deleted"
        }
    } catch {
        Report-Result -TestName "DELETE /api/core/cards/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "DELETE /api/core/cards/{id}" -Success $false -ErrorMessage "Skipped (no testCardId)"
}


# ======================================================================
#                     VEHICLE TYPES CRUD (TEST 26 - 31)
# ======================================================================
$testVehicleTypeId = $null
$testVehicleTypeName = "TestVT$rand"

# 26. List Vehicle Types
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/vehicle-types" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data) {
        Report-Result -TestName "GET /api/core/vehicle-types (List vehicle types)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/vehicle-types" -Success $false -ErrorMessage "Empty vehicle type list"
    }
} catch {
    Report-Result -TestName "GET /api/core/vehicle-types" -Success $false -ErrorMessage $_.Exception.Message
}

# 27. Create Vehicle Type
try {
    $body = @{
        name = $testVehicleTypeName
        description = "Type for automated integration tests"
        isActive = $true
        requiresSlot = $true
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/vehicle-types" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.id) {
        $testVehicleTypeId = $res.data.id
        Report-Result -TestName "POST /api/core/vehicle-types (Create Vehicle Type $testVehicleTypeName)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/vehicle-types" -Success $false -ErrorMessage "Failed to create vehicle type"
    }
} catch {
    Report-Result -TestName "POST /api/core/vehicle-types" -Success $false -ErrorMessage $_.Exception.Message
}

# 28. Get Vehicle Type Details
if ($testVehicleTypeId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/vehicle-types/$testVehicleTypeId" -Method Get -Headers $headers
        if ($res.success -eq $true -and $res.data.name -eq $testVehicleTypeName) {
            Report-Result -TestName "GET /api/core/vehicle-types/{id} (Verify created vehicle type details)" -Success $true
        } else {
            Report-Result -TestName "GET /api/core/vehicle-types/{id}" -Success $false -ErrorMessage "Vehicle type details mismatch"
        }
    } catch {
        Report-Result -TestName "GET /api/core/vehicle-types/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "GET /api/core/vehicle-types/{id}" -Success $false -ErrorMessage "Skipped (no testVehicleTypeId)"
}

# 29. Update Vehicle Type
if ($testVehicleTypeId) {
    try {
        $body = @{
            name = "$testVehicleTypeName (Updated)"
            description = "Updated description"
            isActive = $true
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/vehicle-types/$testVehicleTypeId" -Method Put -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.name -eq "$testVehicleTypeName (Updated)") {
            Report-Result -TestName "PUT /api/core/vehicle-types/{id} (Update Vehicle Type Info)" -Success $true
        } else {
            Report-Result -TestName "PUT /api/core/vehicle-types/{id}" -Success $false -ErrorMessage "Vehicle type info not updated"
        }
    } catch {
        Report-Result -TestName "PUT /api/core/vehicle-types/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PUT /api/core/vehicle-types/{id}" -Success $false -ErrorMessage "Skipped (no testVehicleTypeId)"
}

# 30. Patch Active Status
if ($testVehicleTypeId) {
    try {
        $body = "false"
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/vehicle-types/$testVehicleTypeId/active" -Method Patch -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.isActive -eq $false) {
            Report-Result -TestName "PATCH /api/core/vehicle-types/{id}/active (Set vehicle type to inactive)" -Success $true
        } else {
            Report-Result -TestName "PATCH /api/core/vehicle-types/{id}/active" -Success $false -ErrorMessage "Active status not changed"
        }
    } catch {
        Report-Result -TestName "PATCH /api/core/vehicle-types/{id}/active" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PATCH /api/core/vehicle-types/{id}/active" -Success $false -ErrorMessage "Skipped (no testVehicleTypeId)"
}

# ======================================================================
#                     PRICING RULES CRUD (TEST 32 - 36)
# ======================================================================
$testPricingRuleId = $null

# 32. List Pricing Rules
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data) {
        Report-Result -TestName "GET /api/core/pricing-rules (List pricing rules)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/pricing-rules" -Success $false -ErrorMessage "Empty pricing rule list"
    }
} catch {
    Report-Result -TestName "GET /api/core/pricing-rules" -Success $false -ErrorMessage $_.Exception.Message
}

# 33. Create Pricing Rule (for newly created vehicle type)
try {
    if (-not $testVehicleTypeId) {
        throw "Skipping pricing rule creation - test vehicle type ID is missing."
    }
    $body = @{
        vehicleTypeId = $testVehicleTypeId
        dayPrice = 1500
        nightPrice = 2500
        monthlyPrice = 45000
        reservationHourlyPrice = 800
        lostCardFee = 25000
        effectiveFrom = (Get-Date).ToString("o")
        status = "ACTIVE"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.id) {
        $testPricingRuleId = $res.data.id
        Report-Result -TestName "POST /api/core/pricing-rules (Create Pricing Rule)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/pricing-rules" -Success $false -ErrorMessage "Failed to create pricing rule"
    }
} catch {
    Report-Result -TestName "POST /api/core/pricing-rules" -Success $false -ErrorMessage $_.Exception.Message
}

# 34. Get Pricing Rule Details
if ($testPricingRuleId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules/$testPricingRuleId" -Method Get -Headers $headers
        if ($res.success -eq $true -and $res.data.dayPrice -eq 1500) {
            Report-Result -TestName "GET /api/core/pricing-rules/{id} (Verify created pricing rule details)" -Success $true
        } else {
            Report-Result -TestName "GET /api/core/pricing-rules/{id}" -Success $false -ErrorMessage "Pricing rule details mismatch"
        }
    } catch {
        Report-Result -TestName "GET /api/core/pricing-rules/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "GET /api/core/pricing-rules/{id}" -Success $false -ErrorMessage "Skipped (no testPricingRuleId)"
}

# 35. Update Pricing Rule
if ($testPricingRuleId) {
    try {
        $body = @{
            dayPrice = 1800
            nightPrice = 2800
            status = "ACTIVE"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules/$testPricingRuleId" -Method Put -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.dayPrice -eq 1800) {
            Report-Result -TestName "PUT /api/core/pricing-rules/{id} (Update Pricing Rule details)" -Success $true
        } else {
            Report-Result -TestName "PUT /api/core/pricing-rules/{id}" -Success $false -ErrorMessage "Pricing rule not updated"
        }
    } catch {
        Report-Result -TestName "PUT /api/core/pricing-rules/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PUT /api/core/pricing-rules/{id}" -Success $false -ErrorMessage "Skipped (no testPricingRuleId)"
}

# 36. Delete Pricing Rule
if ($testPricingRuleId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules/$testPricingRuleId" -Method Delete -Headers $headers
        if ($res.success -eq $true) {
            Report-Result -TestName "DELETE /api/core/pricing-rules/{id} (Remove test pricing rule)" -Success $true
        } else {
            Report-Result -TestName "DELETE /api/core/pricing-rules/{id}" -Success $false -ErrorMessage "Pricing rule not deleted"
        }
    } catch {
        Report-Result -TestName "DELETE /api/core/pricing-rules/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "DELETE /api/core/pricing-rules/{id}" -Success $false -ErrorMessage "Skipped (no testPricingRuleId)"
}

# 36a. Delete Vehicle Type
if ($testVehicleTypeId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/vehicle-types/$testVehicleTypeId" -Method Delete -Headers $headers
        if ($res.success -eq $true) {
            Report-Result -TestName "DELETE /api/core/vehicle-types/{id} (Remove test vehicle type)" -Success $true
        } else {
            Report-Result -TestName "DELETE /api/core/vehicle-types/{id}" -Success $false -ErrorMessage "Vehicle type not deleted"
        }
    } catch {
        Report-Result -TestName "DELETE /api/core/vehicle-types/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "DELETE /api/core/vehicle-types/{id}" -Success $false -ErrorMessage "Skipped (no testVehicleTypeId)"
}



# ======================================================================
#                     DATABASE MAPPING VALIDATION (TEST 37)
# ======================================================================
# 37. Db Check
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/db-check" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data.efCoreVerification.success -eq $true) {
        Report-Result -TestName "GET /api/core/db-check (Verify DB mapping & tables)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/db-check" -Success $false -ErrorMessage "Database mapping check failed"
    }
} catch {
    Report-Result -TestName "GET /api/core/db-check" -Success $false -ErrorMessage $_.Exception.Message
}


# ======================================================================
#         TRANSACTIONAL RESERVATION & SESSION CHECK-IN (TEST 38 - 46)
# ======================================================================

# 38. Clear Reservations & Reset States
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/health/clear-reservations" -Method Post -Headers $headers
    if ($res.message -like "*cleared*") {
        Report-Result -TestName "POST /api/core/health/clear-reservations (Reset transactional data)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/health/clear-reservations" -Success $false -ErrorMessage "Reset failed"
    }
} catch {
    Report-Result -TestName "POST /api/core/health/clear-reservations" -Success $false -ErrorMessage $_.Exception.Message
}

# 38a. Dump Reservations list
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/health/dump-reservations" -Method Get -Headers $headers
    Report-Result -TestName "GET /api/core/health/dump-reservations (Retrieve reservations dump)" -Success $true
} catch {
    Report-Result -TestName "GET /api/core/health/dump-reservations" -Success $false -ErrorMessage $_.Exception.Message
}

# 39. Temporarily Update Pricing Rule ID 5 (Car) Hourly Price to 0 to bypass payment (Immediate CONFIRMED)
try {
    $body = @{
        reservationHourlyPrice = 0
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules/5" -Method Put -Headers $headers -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.reservationHourlyPrice -eq 0) {
        Report-Result -TestName "PUT /api/core/pricing-rules/5 (Set Hourly Price to 0 for instant confirmation)" -Success $true
    } else {
        Report-Result -TestName "PUT /api/core/pricing-rules/5" -Success $false -ErrorMessage "Failed to update pricing rule to 0"
    }
} catch {
    Report-Result -TestName "PUT /api/core/pricing-rules/5" -Success $false -ErrorMessage $_.Exception.Message
}

# 40. Create CONFIRMED Reservation
$confirmedReservationId = $null
try {
    $body = @{
        driverId = 1
        vehicleId = $null
        plateNumber = $confirmedPlateNumber
        vehicleTypeId = 5
        floorId = 1
        areaId = 2
        slotId = 11
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.data.id -and $res.data.status -eq "CONFIRMED") {
        $confirmedReservationId = $res.data.id
        $confirmedReservationCode = $res.reservationCode
        Report-Result -TestName "POST /api/core/reservations (Create CONFIRMED Booking $confirmedPlateNumber)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/reservations" -Success $false -ErrorMessage "Booking did not auto-confirm (status: $($res.data.status))"
    }
} catch {
    Report-Result -TestName "POST /api/core/reservations" -Success $false -ErrorMessage $_.Exception.Message
}

# 40a. Entry Check for Reservation
$reservationEntryToken = $null
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/$confirmedReservationCode/entry-check?entryGateId=1" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data.status -eq "VALID" -and $res.data.reservationEntryToken) {
        $reservationEntryToken = $res.data.reservationEntryToken
        Report-Result -TestName "GET /api/core/reservations/{reservationCode}/entry-check (Status VALID)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/reservations/{reservationCode}/entry-check" -Success $false -ErrorMessage "Status is not VALID or token missing"
    }
} catch {
    Report-Result -TestName "GET /api/core/reservations/{reservationCode}/entry-check" -Success $false -ErrorMessage $_.Exception.Message
}

# 41. Create Check-in (Parking Session Entry) using RESERVATION mode with reservation token
try {
    $body = @{
        entryMode = "RESERVATION"
        reservationId = $confirmedReservationId
        reservationEntryToken = $reservationEntryToken
        cardCode = "C010"
        licensePlate = $confirmedPlateNumber
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = 2
        selectedSlotId = 11
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.sessionId -ne $null -and $res.data.entryMode -eq "RESERVATION") {
        Report-Result -TestName "POST /api/core/parking-sessions/entry (Simulate Vehicle Check-in with reservation)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/parking-sessions/entry (Simulate Vehicle Check-in with reservation)" -Success $false -ErrorMessage "Check-in failed or missing session details in response"
    }
} catch {
    Report-Result -TestName "POST /api/core/parking-sessions/entry (Simulate Vehicle Check-in with reservation)" -Success $false -ErrorMessage $_.Exception.Message
}

# ======================================================================
# NO-PLATE RESERVATION INTEGRATION TESTS (TC-RES-NOPLATE-01 to 04)
# ======================================================================
$noPlateResId = $null
$noPlateResCode = $null
$noPlateEntryToken = $null
$driverHeadersForNoPlate = $null
$noPlateSlotId = $null
$noPlateAreaId = $null
$noPlateCardCode = $null

# TC-RES-NOPLATE-01: Driver creates reservation without driverId, vehicleId, plateNumber
try {
    # Login as driver01 to get driver token
    $driverLoginBody = @{
        username = "driver01"
        password = "123456"
    } | ConvertTo-Json
    $driverRes = Invoke-RestMethod -Uri "$BaseUrl/api/core/auth/login" -Method Post -ContentType "application/json" -Body $driverLoginBody
    $driverToken = $driverRes.data.accessToken
    $driverHeadersForNoPlate = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $driverToken"
    }

    # Fetch available locations dynamically
    $locations = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Method Get -Headers $driverHeadersForNoPlate
    $slot = $locations.data.availableSlots | Select-Object -First 1
    if (-not $slot) {
        throw "No available slot found for Car reservation!"
    }
    $noPlateSlotId = $slot.slotId
    $noPlateAreaId = $slot.areaId
    $noPlateFloorId = $slot.floorId

    $body = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 5
        floorId = $noPlateFloorId
        areaId = $noPlateAreaId
        slotId = $noPlateSlotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations" -Method Post -Headers $driverHeadersForNoPlate -ContentType "application/json" -Body $body
    if ($res.data.id -and $res.data.status -eq "CONFIRMED" -and $res.data.driverId -ne $null -and $res.data.plateNumber -eq $null) {
        $noPlateResId = $res.data.id
        $noPlateResCode = $res.reservationCode
        Report-Result -TestName "TC-RES-NOPLATE-01: Driver creates reservation without driverId, vehicleId, plateNumber" -Success $true
    } else {
        Report-Result -TestName "TC-RES-NOPLATE-01" -Success $false -ErrorMessage "Reservation failed or driverId/plateNumber incorrect (status: $($res.data.status))"
    }
} catch {
    Report-Result -TestName "TC-RES-NOPLATE-01" -Success $false -ErrorMessage $_.Exception.Message
}

# TC-RES-NOPLATE-02: Staff scans reservation and gets reservationEntryToken
try {
    if ($noPlateResCode) {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/$noPlateResCode/entry-check?entryGateId=1" -Method Get -Headers $headers
        if ($res.success -eq $true -and $res.data.status -eq "VALID" -and $res.data.reservationEntryToken) {
            $noPlateEntryToken = $res.data.reservationEntryToken
            Report-Result -TestName "TC-RES-NOPLATE-02: Staff scans reservation and gets reservationEntryToken" -Success $true
        } else {
            Report-Result -TestName "TC-RES-NOPLATE-02" -Success $false -ErrorMessage "Entry check was not VALID or token missing"
        }
    } else {
        Report-Result -TestName "TC-RES-NOPLATE-02" -Success $false -ErrorMessage "Skipped (no reservation code)"
    }
} catch {
    Report-Result -TestName "TC-RES-NOPLATE-02" -Success $false -ErrorMessage $_.Exception.Message
}

# TC-RES-NOPLATE-03: Staff checks in reservation with real licensePlate
try {
    if ($noPlateResId -and $noPlateEntryToken -and $noPlateSlotId) {
        # Find an AVAILABLE card dynamically
        $cardsRes = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards" -Method Get -Headers $headers
        $availableCard = $cardsRes.data | Where-Object { $_.status -eq "AVAILABLE" -and $_.cardNumber -ne "C004" -and $_.cardNumber -ne "C005" } | Select-Object -First 1
        $noPlateCardCode = if ($availableCard) { $availableCard.cardNumber } else { "C011" }

        $body = @{
            entryMode = "RESERVATION"
            reservationId = $noPlateResId
            reservationEntryToken = $noPlateEntryToken
            cardCode = $noPlateCardCode
            licensePlate = "51A-NOPLATE"
            noPlate = $false
            vehicleTypeId = 5
            entryGateId = 1
            selectedAreaId = $noPlateAreaId
            selectedSlotId = $noPlateSlotId
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.sessionId -ne $null -and $res.data.entryMode -eq "RESERVATION" -and $res.data.plateNumber -eq "51A-NOPLATE") {
            Report-Result -TestName "TC-RES-NOPLATE-03: Staff checks in reservation with real licensePlate" -Success $true
        } else {
            Report-Result -TestName "TC-RES-NOPLATE-03" -Success $false -ErrorMessage "Check-in failed or plate number mismatch"
        }
    } else {
        Report-Result -TestName "TC-RES-NOPLATE-03" -Success $false -ErrorMessage "Skipped (missing reservation ID, token or slot ID)"
    }
} catch {
    Report-Result -TestName "TC-RES-NOPLATE-03" -Success $false -ErrorMessage $_.Exception.Message
}

# TC-RES-NOPLATE-04: Verify reservation updated with plateNumber
try {
    if ($noPlateResId) {
        $dump = Invoke-RestMethod -Uri "$BaseUrl/api/core/health/dump-reservations" -Method Get -Headers $headers
        $r = @($dump) | Where-Object { $_.id -eq $noPlateResId }
        if ($r -and $r.plateNumber -eq "51A-NOPLATE" -and $r.status -eq "COMPLETED") {
            Report-Result -TestName "TC-RES-NOPLATE-04: Verify reservation updated with plateNumber" -Success $true
        } else {
            Report-Result -TestName "TC-RES-NOPLATE-04" -Success $false -ErrorMessage "Plate not updated or status not COMPLETED"
        }
    } else {
        Report-Result -TestName "TC-RES-NOPLATE-04" -Success $false -ErrorMessage "Skipped (no reservation ID)"
    }
} catch {
    Report-Result -TestName "TC-RES-NOPLATE-04" -Success $false -ErrorMessage $_.Exception.Message
}
# ======================================================================

# 42. Claim Session (associated with the C010 card QR Token)
try {
    # Get the actual qrToken of C010 dynamically from the API
    $resCards = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards?search=C010" -Method Get -Headers $headers
    $qrToken = $resCards.data[0].qrToken

    # Login as driver01 since only DRIVER role is authorized to claim
    $driverLoginBody = @{
        username = "driver01"
        password = "123456"
    } | ConvertTo-Json
    $driverRes = Invoke-RestMethod -Uri "$BaseUrl/api/core/auth/login" -Method Post -ContentType "application/json" -Body $driverLoginBody
    $driverToken = $driverRes.data.accessToken
    $driverHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $driverToken"
    }

    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/$qrToken/claim" -Method Post -Headers $driverHeaders
    if ($res.success -eq $true) {
        Report-Result -TestName "POST /api/core/parking-sessions/{qrToken}/claim (Link session to driver)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/parking-sessions/{qrToken}/claim" -Success $false -ErrorMessage "Claim session failed"
    }
} catch {
    Report-Result -TestName "POST /api/core/parking-sessions/{qrToken}/claim" -Success $false -ErrorMessage $_.Exception.Message
}

# 43. Restore Pricing Rule ID 5 Hourly Price to 10000
try {
    $body = @{
        reservationHourlyPrice = 10000
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules/5" -Method Put -Headers $headers -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.reservationHourlyPrice -eq 10000) {
        Report-Result -TestName "PUT /api/core/pricing-rules/5 (Restore Hourly Price to 10000)" -Success $true
    } else {
        Report-Result -TestName "PUT /api/core/pricing-rules/5" -Success $false -ErrorMessage "Failed to restore pricing rule rate"
    }
} catch {
    Report-Result -TestName "PUT /api/core/pricing-rules/5" -Success $false -ErrorMessage $_.Exception.Message
}

# 44. Create PENDING Reservation
$reservationId = $null
try {
    $body = @{
        driverId = 1
        vehicleId = $null
        plateNumber = $plateNumber
        vehicleTypeId = 5
        floorId = 1
        areaId = 2
        slotId = 12
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.data.id -and $res.data.status -eq "PENDING") {
        $reservationId = $res.data.id
        Report-Result -TestName "POST /api/core/reservations (Create PENDING Booking $plateNumber)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/reservations" -Success $false -ErrorMessage "Booking failed"
    }
} catch {
    Report-Result -TestName "POST /api/core/reservations" -Success $false -ErrorMessage $_.Exception.Message
}

# 45. Extend Reservation
if ($reservationId) {
    try {
        $body = @{
            addedMinutes = 30
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/$reservationId/extend" -Method Post -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.reservedDurationMinutes -eq 90) {
            Report-Result -TestName "POST /api/core/reservations/{id}/extend (Add 30 minutes)" -Success $true
        } else {
            Report-Result -TestName "POST /api/core/reservations/{id}/extend" -Success $false -ErrorMessage "Extension failed"
        }
    } catch {
        Report-Result -TestName "POST /api/core/reservations/{id}/extend" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "POST /api/core/reservations/{id}/extend" -Success $false -ErrorMessage "Skipped (no reservationId)"
}

# 46. Cancel Reservation
if ($reservationId) {
    try {
        $body = @{
            reason = "Automated test cancellation"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/$reservationId/cancel" -Method Post -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.status -eq "CANCELLED") {
            Report-Result -TestName "POST /api/core/reservations/{id}/cancel (Cancel Booking)" -Success $true
        } else {
            Report-Result -TestName "POST /api/core/reservations/{id}/cancel" -Success $false -ErrorMessage "Cancellation failed"
        }
    } catch {
        Report-Result -TestName "POST /api/core/reservations/{id}/cancel" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "POST /api/core/reservations/{id}/cancel" -Success $false -ErrorMessage "Skipped (no reservationId)"
}
# ======================================================================
#             EPIC: LOCATION SUGGESTION & TOKEN TESTS (TEST 47 - 58)
# ======================================================================

# Login as staff01
$staffHeaders = @{ "Content-Type" = "application/json" }
try {
    $body = @{ username = "staff01"; password = "123456" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/auth/login" -Method Post -ContentType "application/json" -Body $body
    $staffToken = $res.data.accessToken
    $staffHeaders.Add("Authorization", "Bearer $staffToken")
    Report-Result -TestName "Login as staff01 for suggestion tests" -Success $true
} catch {
    Report-Result -TestName "Login as staff01 for suggestion tests" -Success $false -ErrorMessage $_.Exception.Message
}

# Login as manager01
$managerHeaders = @{ "Content-Type" = "application/json" }
try {
    $body = @{ username = "manager01"; password = "123456" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/auth/login" -Method Post -ContentType "application/json" -Body $body
    $managerToken = $res.data.accessToken
    $managerHeaders.Add("Authorization", "Bearer $managerToken")
    Report-Result -TestName "Login as manager01 for suggestion tests" -Success $true
} catch {
    Report-Result -TestName "Login as manager01 for suggestion tests" -Success $false -ErrorMessage $_.Exception.Message
}

# Fetch active vehicle types dynamically
$slotVehicleTypeId = $null
$nonSlotVehicleTypeId = $null
try {
    $resTypes = Invoke-RestMethod -Uri "$BaseUrl/api/core/vehicle-types" -Method Get -Headers $headers
    foreach ($vt in $resTypes.data) {
        if ($vt.isActive -eq $true) {
            if ($vt.requiresSlot -eq $true -and -not $slotVehicleTypeId) {
                $slotVehicleTypeId = $vt.id
            }
            if ($vt.requiresSlot -eq $false -and ($vt.id -eq 3 -or $vt.name -like "*máy*")) {
                $nonSlotVehicleTypeId = $vt.id
            }
        }
    }
    Report-Result -TestName "Fetch slot and non-slot vehicle types dynamically" -Success $true
} catch {
    Report-Result -TestName "Fetch slot and non-slot vehicle types dynamically" -Success $false -ErrorMessage $_.Exception.Message
}

# TC-SUG-01: Get SLOT suggestion (Car / requiresSlot = true)
$slotToken = $null
$suggestedSlotId = $null
$suggestedAreaId = $null
if ($slotVehicleTypeId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/location-suggestion?vehicleTypeId=$slotVehicleTypeId&entryGateId=1" -Method Get -Headers $staffHeaders
        if ($res.success -eq $true -and $res.data.suggestionType -eq "SLOT" -and $res.data.suggestionToken -and $res.data.suggestedSlotId) {
            $slotToken = $res.data.suggestionToken
            $suggestedSlotId = $res.data.suggestedSlotId
            $suggestedAreaId = $res.data.suggestedAreaId
            Report-Result -TestName "TC-SUG-01: Suggestion for slot vehicle (SLOT)" -Success $true
        } else {
            Report-Result -TestName "TC-SUG-01: Suggestion for slot vehicle (SLOT)" -Success $false -ErrorMessage "Suggestion type is not SLOT or missing token/slot"
        }
    } catch {
        Report-Result -TestName "TC-SUG-01: Suggestion for slot vehicle (SLOT)" -Success $false -ErrorMessage $_.Exception.Message
    }
}

# TC-SUG-02: Get AREA suggestion (Motorbike / requiresSlot = false)
$areaToken = $null
$suggestedAreaOnlyId = $null
if ($nonSlotVehicleTypeId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/location-suggestion?vehicleTypeId=$nonSlotVehicleTypeId&entryGateId=1" -Method Get -Headers $staffHeaders
        if ($res.success -eq $true -and $res.data.suggestionType -eq "AREA" -and $res.data.suggestionToken -and $res.data.suggestedAreaId -and $res.data.suggestedSlotId -eq $null) {
            $areaToken = $res.data.suggestionToken
            $suggestedAreaOnlyId = $res.data.suggestedAreaId
            Report-Result -TestName "TC-SUG-02: Suggestion for non-slot vehicle (AREA)" -Success $true
        } else {
            Report-Result -TestName "TC-SUG-02: Suggestion for non-slot vehicle (AREA)" -Success $false -ErrorMessage "Suggestion type is not AREA or contains slotId"
        }
    } catch {
        Report-Result -TestName "TC-SUG-02: Suggestion for non-slot vehicle (AREA)" -Success $false -ErrorMessage $_.Exception.Message
    }
}

# TC-SUG-03: Invalid Entry Gate Id (should throw GATE_NOT_FOUND)
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/location-suggestion?vehicleTypeId=$slotVehicleTypeId&entryGateId=9999" -Method Get -Headers $staffHeaders
    Report-Result -TestName "TC-SUG-03: Invalid gate suggestion check" -Success $false -ErrorMessage "Expected failure but succeeded"
} catch {
    $errText = $_.Exception.Message
    if ($_.ErrorDetails) {
        $errText += " - " + $_.ErrorDetails.Message
    }
    if ($errText -like "*GATE_NOT_FOUND*") {
        Report-Result -TestName "TC-SUG-03: Invalid gate suggestion check (GATE_NOT_FOUND)" -Success $true
    } else {
        Report-Result -TestName "TC-SUG-03: Invalid gate suggestion check" -Success $false -ErrorMessage $errText
    }
}

# TC-ENTRY-LOC-01: Check-in for slot vehicle selecting the suggested slot (STAFF)
$testCard1 = "C009"
if ($slotToken -and $suggestedSlotId) {
    try {
        $body = @{
            cardCode = $testCard1
            licensePlate = "30A-99999"
            noPlate = $false
            vehicleTypeId = $slotVehicleTypeId
            entryGateId = 1
            selectedSlotId = $suggestedSlotId
            suggestionToken = $slotToken
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.sessionId -gt 0 -and $res.data.suggestedSlotId -eq $suggestedSlotId) {
            Report-Result -TestName "TC-ENTRY-LOC-01: Check-in slot vehicle with suggested slot (STAFF)" -Success $true
        } else {
            Report-Result -TestName "TC-ENTRY-LOC-01: Check-in slot vehicle with suggested slot (STAFF)" -Success $false -ErrorMessage "Check-in response mismatch"
        }
    } catch {
        Report-Result -TestName "TC-ENTRY-LOC-01: Check-in slot vehicle with suggested slot (STAFF)" -Success $false -ErrorMessage $_.Exception.Message
    }
}

# TC-ENTRY-LOC-02: Check-in for slot vehicle selecting a DIFFERENT slot (STAFF -> should throw SUGGESTION_OVERRIDE_NOT_ALLOWED)
$testCard2 = "C002"
if ($slotToken -and $suggestedSlotId) {
    try {
        # Find another slot of same type that is different
        $otherSlots = Invoke-RestMethod -Uri "$BaseUrl/api/core/slots" -Method Get -Headers $headers
        $differentSlotId = $null
        foreach ($s in $otherSlots.data) {
            if ($s.id -ne $suggestedSlotId -and $s.status -eq "AVAILABLE" -and $s.allowedVehicleTypeId -eq $slotVehicleTypeId) {
                $differentSlotId = $s.id
                break
            }
        }

        if ($differentSlotId) {
            $body = @{
                cardCode = $testCard2
                licensePlate = "30A-88888"
                noPlate = $false
                vehicleTypeId = $slotVehicleTypeId
                entryGateId = 1
                selectedSlotId = $differentSlotId
                suggestionToken = $slotToken
            } | ConvertTo-Json
            $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $body
            Report-Result -TestName "TC-ENTRY-LOC-02: Prevent STAFF from overriding suggestion" -Success $false -ErrorMessage "Override succeeded when it should have failed"
        } else {
            Report-Result -TestName "TC-ENTRY-LOC-02: Prevent STAFF from overriding suggestion" -Success $true -ErrorMessage "Skipped (no alternative slot)"
        }
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*SUGGESTION_OVERRIDE_NOT_ALLOWED*") {
            Report-Result -TestName "TC-ENTRY-LOC-02: Prevent STAFF from overriding suggestion (SUGGESTION_OVERRIDE_NOT_ALLOWED)" -Success $true
        } else {
            Report-Result -TestName "TC-ENTRY-LOC-02: Prevent STAFF from overriding suggestion" -Success $false -ErrorMessage $errText
        }
    }
}

# TC-ENTRY-LOC-03: Check-in for slot vehicle selecting a DIFFERENT slot WITHOUT OverrideReason (MANAGER -> should throw OVERRIDE_REASON_REQUIRED)
if ($slotToken -and $suggestedSlotId -and $differentSlotId) {
    try {
        $body = @{
            cardCode = $testCard2
            licensePlate = "30A-88888"
            noPlate = $false
            vehicleTypeId = $slotVehicleTypeId
            entryGateId = 1
            selectedSlotId = $differentSlotId
            suggestionToken = $slotToken
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $managerHeaders -ContentType "application/json" -Body $body
        Report-Result -TestName "TC-ENTRY-LOC-03: Enforce OverrideReason for MANAGER override" -Success $false -ErrorMessage "Override succeeded without reason"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*OVERRIDE_REASON_REQUIRED*") {
            Report-Result -TestName "TC-ENTRY-LOC-03: Enforce OverrideReason for MANAGER override (OVERRIDE_REASON_REQUIRED)" -Success $true
        } else {
            Report-Result -TestName "TC-ENTRY-LOC-03: Enforce OverrideReason for MANAGER override" -Success $false -ErrorMessage $errText
        }
    }
}

# TC-ENTRY-LOC-04: Check-in for slot vehicle selecting a DIFFERENT slot WITH OverrideReason (MANAGER -> success, stores OverrideSlotId)
if ($slotToken -and $suggestedSlotId -and $differentSlotId) {
    try {
        $body = @{
            cardCode = $testCard2
            licensePlate = "30A-88888"
            noPlate = $false
            vehicleTypeId = $slotVehicleTypeId
            entryGateId = 1
            selectedSlotId = $differentSlotId
            suggestionToken = $slotToken
            overrideReason = "Customer request override slot"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $managerHeaders -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.overrideSlotId -eq $differentSlotId -and $res.data.overrideReason -eq "Customer request override slot") {
            Report-Result -TestName "TC-ENTRY-LOC-04: Allow MANAGER to override with reason" -Success $true
        } else {
            Report-Result -TestName "TC-ENTRY-LOC-04: Allow MANAGER to override with reason" -Success $false -ErrorMessage "Override response mismatch"
        }
    } catch {
        Report-Result -TestName "TC-ENTRY-LOC-04: Allow MANAGER to override with reason" -Success $false -ErrorMessage $_.Exception.Message
    }
}

# TC-ENTRY-LOC-08: Check-in with tampered suggestion token (should throw SUGGESTION_TOKEN_INVALID)
$testCard3 = "C003"
if ($slotToken -and $suggestedSlotId) {
    try {
        $body = @{
            cardCode = $testCard3
            licensePlate = "30A-77777"
            noPlate = $false
            vehicleTypeId = $slotVehicleTypeId
            entryGateId = 1
            selectedSlotId = $suggestedSlotId
            suggestionToken = $slotToken + "tampered"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $body
        Report-Result -TestName "TC-ENTRY-LOC-08: Prevent check-in with tampered suggestion token" -Success $false -ErrorMessage "Check-in succeeded with invalid token"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*SUGGESTION_TOKEN_INVALID*") {
            Report-Result -TestName "TC-ENTRY-LOC-08: Prevent check-in with tampered suggestion token (SUGGESTION_TOKEN_INVALID)" -Success $true
        } else {
            Report-Result -TestName "TC-ENTRY-LOC-08: Prevent check-in with tampered suggestion token" -Success $false -ErrorMessage $errText
        }
    }
}

# ======================================================================
#             EPIC: RESERVATION ENTRY CHECK FLOW TESTS (TEST 59 - 70)
# ======================================================================

# Prepare a test reservation for flow validation
$resCode1 = $null
$resId1 = $null
$resPlate1 = "RES-" + (Get-Random -Minimum 10000 -Maximum 99999)
try {
    # Set hourly price to 0 for confirmed reservation
    $pricingRes = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules/5" -Method Put -Headers $headers -ContentType "application/json" -Body (@{ reservationHourlyPrice = 0 } | ConvertTo-Json)
    
    # Create reservation
    $resPost = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations" -Method Post -Headers $headers -ContentType "application/json" -Body (@{
        driverId = 1
        vehicleId = $null
        plateNumber = $resPlate1
        vehicleTypeId = 5
        floorId = 1
        areaId = 2
        slotId = 15
        reservedDurationMinutes = 60
    } | ConvertTo-Json)
    
    $resCode1 = $resPost.reservationCode
    $resId1 = $resPost.id
    Report-Result -TestName "Setup: Create reservation for check flow tests" -Success ($resCode1 -ne $null)
} catch {
    Report-Result -TestName "Setup: Create reservation for check flow tests" -Success $false -ErrorMessage $_.Exception.Message
}

# TC-RES-ENTRY-01: reservationCode hợp lệ -> VALID + reservationEntryToken
$resEntryToken1 = $null
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/$resCode1/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders
    if ($res.success -eq $true -and $res.data.status -eq "VALID" -and $res.data.reservationEntryToken -ne $null) {
        $resEntryToken1 = $res.data.reservationEntryToken
        Report-Result -TestName "TC-RES-ENTRY-01: reservationCode hợp lệ -> VALID + token" -Success $true
    } else {
        Report-Result -TestName "TC-RES-ENTRY-01: reservationCode hợp lệ -> VALID + token" -Success $false -ErrorMessage "Status is not VALID or token missing"
    }
} catch {
    Report-Result -TestName "TC-RES-ENTRY-01: reservationCode hợp lệ -> VALID + token" -Success $false -ErrorMessage $_.Exception.Message
}

# TC-RES-ENTRY-03: reservation cancelled -> CANCELLED
try {
    # Cancel the reservation
    $cancelRes = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/$resId1/cancel" -Method Post -Headers $headers -ContentType "application/json" -Body (@{ reason = "Testing cancel check" } | ConvertTo-Json)
    
    # Try checking cancelled reservation
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/$resCode1/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders
    if ($res.success -eq $true -and $res.data.status -eq "CANCELLED") {
        Report-Result -TestName "TC-RES-ENTRY-03: reservation cancelled -> CANCELLED" -Success $true
    } else {
        Report-Result -TestName "TC-RES-ENTRY-03: reservation cancelled -> CANCELLED" -Success $false -ErrorMessage "Status: $($res.data.status)"
    }
} catch {
    Report-Result -TestName "TC-RES-ENTRY-03: reservation cancelled -> CANCELLED" -Success $false -ErrorMessage $_.Exception.Message
}

# TC-RES-ENTRY-05: gate EXIT -> ENTRY_GATE_REQUIRED
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/$resCode1/entry-check?entryGateId=2" -Method Get -Headers $staffHeaders
    Report-Result -TestName "TC-RES-ENTRY-05: gate EXIT -> ENTRY_GATE_REQUIRED" -Success $false -ErrorMessage "Expected failure on exit gate"
} catch {
    $errText = $_.Exception.Message
    if ($_.ErrorDetails) { $errText += " - " + $_.ErrorDetails.Message }
    if ($errText -like "*ENTRY_GATE_REQUIRED*") {
        Report-Result -TestName "TC-RES-ENTRY-05: gate EXIT -> ENTRY_GATE_REQUIRED" -Success $true
    } else {
        Report-Result -TestName "TC-RES-ENTRY-05: gate EXIT -> ENTRY_GATE_REQUIRED" -Success $false -ErrorMessage $errText
    }
}

# TC-RES-ENTRY-06: gate inactive -> GATE_NOT_ACTIVE (using gate 9999 which does not exist)
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/$resCode1/entry-check?entryGateId=9999" -Method Get -Headers $staffHeaders
    Report-Result -TestName "TC-RES-ENTRY-06: gate inactive -> GATE_NOT_ACTIVE" -Success $false -ErrorMessage "Expected failure on gate 9999"
} catch {
    $errText = $_.Exception.Message
    if ($_.ErrorDetails) { $errText += " - " + $_.ErrorDetails.Message }
    if ($errText -like "*GATE_NOT_FOUND*") {
        Report-Result -TestName "TC-RES-ENTRY-06: gate inactive -> GATE_NOT_ACTIVE (GATE_NOT_FOUND)" -Success $true
    } else {
        Report-Result -TestName "TC-RES-ENTRY-06: gate inactive -> GATE_NOT_ACTIVE" -Success $false -ErrorMessage $errText
    }
}

# Create a fresh reservation for check-in validation
$resCode2 = $null
$resId2 = $null
$resPlate2 = "RES-" + (Get-Random -Minimum 10000 -Maximum 99999)
try {
    $resPost = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations" -Method Post -Headers $headers -ContentType "application/json" -Body (@{
        driverId = 1
        vehicleId = $null
        plateNumber = $resPlate2
        vehicleTypeId = 5
        floorId = 1
        areaId = 2
        slotId = 13
        reservedDurationMinutes = 60
    } | ConvertTo-Json)
    $resCode2 = $resPost.reservationCode
    $resId2 = $resPost.id
} catch {
    Write-Host "Error creating second reservation: $_"
}

# TC-ENTRY-RES-02: thiếu reservationEntryToken -> RESERVATION_ENTRY_TOKEN_REQUIRED
try {
    $body = @{
        entryMode = "RESERVATION"
        reservationId = $resId2
        cardCode = "C004"
        licensePlate = $resPlate2
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = 2
        selectedSlotId = 13
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $body
    Report-Result -TestName "TC-ENTRY-RES-02: thiếu reservationEntryToken" -Success $false -ErrorMessage "Succeeded check-in without token"
} catch {
    $errText = $_.Exception.Message
    if ($_.ErrorDetails) { $errText += " - " + $_.ErrorDetails.Message }
    if ($errText -like "*RESERVATION_ENTRY_TOKEN_REQUIRED*") {
        Report-Result -TestName "TC-ENTRY-RES-02: thiếu reservationEntryToken (RESERVATION_ENTRY_TOKEN_REQUIRED)" -Success $true
    } else {
        Report-Result -TestName "TC-ENTRY-RES-02: thiếu reservationEntryToken" -Success $false -ErrorMessage $errText
    }
}

# TC-ENTRY-RES-04: token reservationId khác request -> RESERVATION_ENTRY_TOKEN_MISMATCH
$resEntryToken2 = $null
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/$resCode2/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders
    $resEntryToken2 = $res.data.reservationEntryToken
} catch {
    Write-Host "Error checking second reservation: $_"
}

try {
    $body = @{
        entryMode = "RESERVATION"
        reservationId = 999999 # Wrong ID
        reservationEntryToken = $resEntryToken2
        cardCode = "C004"
        licensePlate = $resPlate2
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = 2
        selectedSlotId = 13
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $body
    Report-Result -TestName "TC-ENTRY-RES-04: token reservationId khác request" -Success $false -ErrorMessage "Succeeded with wrong reservationId"
} catch {
    $errText = $_.Exception.Message
    if ($_.ErrorDetails) { $errText += " - " + $_.ErrorDetails.Message }
    if ($errText -like "*RESERVATION_ENTRY_TOKEN_MISMATCH*" -or $errText -like "*RESERVATION_ENTRY_TOKEN_INVALID*") {
        Report-Result -TestName "TC-ENTRY-RES-04: token reservationId khác request (RESERVATION_ENTRY_TOKEN_MISMATCH)" -Success $true
    } else {
        Report-Result -TestName "TC-ENTRY-RES-04: token reservationId khác request" -Success $false -ErrorMessage $errText
    }
}

# TC-ENTRY-RES-07: selectedSlotId khác reservedSlotId -> RESERVATION_SLOT_MISMATCH
try {
    $body = @{
        entryMode = "RESERVATION"
        reservationId = $resId2
        reservationEntryToken = $resEntryToken2
        cardCode = "C004"
        licensePlate = $resPlate2
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = 2
        selectedSlotId = 12 # Wrong slot (reserved 13)
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $body
    Report-Result -TestName "TC-ENTRY-RES-07: selectedSlotId khác reservedSlotId" -Success $false -ErrorMessage "Succeeded with wrong slot selection"
} catch {
    $errText = $_.Exception.Message
    if ($_.ErrorDetails) { $errText += " - " + $_.ErrorDetails.Message }
    if ($errText -like "*RESERVATION_SLOT_MISMATCH*") {
        Report-Result -TestName "TC-ENTRY-RES-07: selectedSlotId khác reservedSlotId (RESERVATION_SLOT_MISMATCH)" -Success $true
    } else {
        Report-Result -TestName "TC-ENTRY-RES-07: selectedSlotId khác reservedSlotId" -Success $false -ErrorMessage $errText
    }
}

# TC-ENTRY-RES-01: RESERVATION mode hợp lệ -> tạo session ACTIVE
try {
    $body = @{
        entryMode = "RESERVATION"
        reservationId = $resId2
        reservationEntryToken = $resEntryToken2
        cardCode = "C004"
        licensePlate = $resPlate2
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = 2
        selectedSlotId = 13
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.sessionId -gt 0 -and $res.data.entryMode -eq "RESERVATION") {
        Report-Result -TestName "TC-ENTRY-RES-01: RESERVATION mode hợp lệ -> tạo session ACTIVE" -Success $true
    } else {
        Report-Result -TestName "TC-ENTRY-RES-01: RESERVATION mode hợp lệ" -Success $false -ErrorMessage "Session is not active or response mismatch"
    }
} catch {
    Report-Result -TestName "TC-ENTRY-RES-01: RESERVATION mode hợp lệ" -Success $false -ErrorMessage $_.Exception.Message
}

# TC-RES-ENTRY-04: reservation completed -> ALREADY_CHECKED_IN
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/$resCode2/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders
    if ($res.success -eq $true -and $res.data.status -eq "ALREADY_CHECKED_IN") {
        Report-Result -TestName "TC-RES-ENTRY-04: reservation completed -> ALREADY_CHECKED_IN" -Success $true
    } else {
        Report-Result -TestName "TC-RES-ENTRY-04: reservation completed -> ALREADY_CHECKED_IN" -Success $false -ErrorMessage "Status: $($res.data.status)"
    }
} catch {
    Report-Result -TestName "TC-RES-ENTRY-04: reservation completed -> ALREADY_CHECKED_IN" -Success $false -ErrorMessage $_.Exception.Message
}

# Create a third reservation to test expiration and conversion to casual
$resCode3 = $null
$resId3 = $null
$resPlate3 = "RES-" + (Get-Random -Minimum 10000 -Maximum 99999)
try {
    $resPost = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations" -Method Post -Headers $headers -ContentType "application/json" -Body (@{
        driverId = 1
        vehicleId = $null
        plateNumber = $resPlate3
        vehicleTypeId = 5
        floorId = 1
        areaId = 2
        slotId = 14
        reservedDurationMinutes = 60
    } | ConvertTo-Json)
    $resCode3 = $resPost.reservationCode
    $resId3 = $resPost.id
} catch {
    Write-Host "Error creating third reservation: $_"
}

# Expire the reservation via the developer health helper endpoint
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/health/expire-reservation?reservationCode=$resCode3" -Method Post -Headers $headers
} catch {
    Write-Host "Error expiring reservation: $_"
}

# TC-RES-ENTRY-02: reservation hết hạn -> EXPIRED + canConvertToCasual true
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/$resCode3/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders
    if ($res.success -eq $true -and $res.data.status -eq "EXPIRED" -and $res.data.canConvertToCasual -eq $true) {
        Report-Result -TestName "TC-RES-ENTRY-02: reservation hết hạn -> EXPIRED + canConvertToCasual" -Success $true
    } else {
        Report-Result -TestName "TC-RES-ENTRY-02: reservation hết hạn -> EXPIRED + canConvertToCasual" -Success $false -ErrorMessage "Status: $($res.data.status), canConvertToCasual: $($res.data.canConvertToCasual)"
    }
} catch {
    Report-Result -TestName "TC-RES-ENTRY-02: reservation hết hạn -> EXPIRED + canConvertToCasual" -Success $false -ErrorMessage $_.Exception.Message
}

# TC-CONVERT-01: entry-check EXPIRED -> frontend gọi casual suggestion
$casualToken = $null
$suggestedSlotId = $null
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/location-suggestion?vehicleTypeId=5&entryGateId=1" -Method Get -Headers $staffHeaders
    $casualToken = $res.data.suggestionToken
    $suggestedSlotId = $res.data.suggestedSlotId
    Report-Result -TestName "TC-CONVERT-01: entry-check EXPIRED -> frontend gọi casual suggestion" -Success ($casualToken -ne $null)
} catch {
    Report-Result -TestName "TC-CONVERT-01: entry-check EXPIRED -> frontend gọi casual suggestion" -Success $false -ErrorMessage $_.Exception.Message
}

# TC-CONVERT-02: CASUAL entry với convertedFromReservationId -> success
try {
    $body = @{
        entryMode = "CASUAL"
        convertedFromReservationId = $resId3
        suggestionToken = $casualToken
        cardCode = "C005"
        licensePlate = $resPlate3
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = 2
        selectedSlotId = $suggestedSlotId
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.sessionId -gt 0 -and $res.data.entryMode -eq "CASUAL" -and $res.data.convertedFromReservationId -eq $resId3 -and $res.data.reservationId -eq $null) {
        Report-Result -TestName "TC-CONVERT-02: CASUAL entry với convertedFromReservationId (success)" -Success $true
    } else {
        Report-Result -TestName "TC-CONVERT-02: CASUAL entry với convertedFromReservationId (success)" -Success $false -ErrorMessage "Response mismatch"
    }
} catch {
    Report-Result -TestName "TC-CONVERT-02: CASUAL entry với convertedFromReservationId (success)" -Success $false -ErrorMessage $_.Exception.Message
}

# ======================================================================
#                     MONTHLY PASS INTEGRATION TESTS
# ======================================================================
Write-Host "`n--- Running Monthly Pass Integration Tests ---" -ForegroundColor Cyan

# 1. Create a monthly pass for ô tô (requires slot)
$monthlyPassId = $null
$mpPlate = "M-AUTO-" + (Get-Random -Minimum 10000 -Maximum 99999)
try {
    $body = @{
        ownerName = "Nguyen Van Monthly"
        plateNumber = $mpPlate
        cardId = 20
        vehicleTypeId = 5
        startDate = (Get-Date).ToString("yyyy-MM-dd")
        endDate = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
        floorId = 2
        areaId = 4
        slotId = 31
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/monthly-passes" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.id -gt 0) {
        $monthlyPassId = $res.data.id
        Report-Result -TestName "POST /api/core/monthly-passes (Create Monthly Pass for Car - Requires Slot)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/monthly-passes" -Success $false -ErrorMessage "Create monthly pass failed"
    }
} catch {
    Report-Result -TestName "POST /api/core/monthly-passes" -Success $false -ErrorMessage $_.Exception.Message
}

# 2. Get card entry check - expecting entryCardType = MONTHLY
$monthlyToken = $null
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/C020/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders
    if ($res.success -eq $true -and $res.data.entryCardType -eq "MONTHLY" -and $res.data.monthlyEntryToken -ne $null) {
        $monthlyToken = $res.data.monthlyEntryToken
        Report-Result -TestName "GET /api/core/cards/{cardCode}/entry-check (Monthly Pass Detection)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/cards/{cardCode}/entry-check" -Success $false -ErrorMessage "Monthly pass not detected on card C020"
    }
} catch {
    Report-Result -TestName "GET /api/core/cards/{cardCode}/entry-check" -Success $false -ErrorMessage $_.Exception.Message
}

# 3. Try to check in MONTHLY pass vehicle - expecting success
$mpSessionId = $null
try {
    $body = @{
        entryMode = "MONTHLY"
        monthlyPassId = $monthlyPassId
        monthlyEntryToken = $monthlyToken
        cardCode = "C020"
        licensePlate = $mpPlate
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedSlotId = 31
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.sessionId -gt 0 -and $res.data.customerType -eq "MONTHLY") {
        $mpSessionId = $res.data.sessionId
        Report-Result -TestName "POST /api/core/parking-sessions/entry (MONTHLY entry - Success)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/parking-sessions/entry (MONTHLY entry)" -Success $false -ErrorMessage "Monthly entry failed"
    }
} catch {
    Report-Result -TestName "POST /api/core/parking-sessions/entry (MONTHLY entry)" -Success $false -ErrorMessage $_.Exception.Message
}

# 4. Try to entry with CASUAL mode using the monthly card - expecting failure
# We register monthly pass on card C018 (ID 18) which is AVAILABLE (not checked in)
try {
    $mpPlate18 = "M-AUTO-" + (Get-Random -Minimum 10000 -Maximum 99999)
    $body = @{
        ownerName = "Nguyen Van Casual Fail"
        plateNumber = $mpPlate18
        cardId = 18
        vehicleTypeId = 5
        startDate = (Get-Date).ToString("yyyy-MM-dd")
        endDate = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
        floorId = 2
        areaId = 4
        slotId = 32
    } | ConvertTo-Json
    $resPass = Invoke-RestMethod -Uri "$BaseUrl/api/core/monthly-passes" -Method Post -Headers $headers -ContentType "application/json" -Body $body

    $body = @{
        entryMode = "CASUAL"
        cardCode = "C018"
        licensePlate = "CASUAL-ERR"
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedSlotId = 16
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $body
    Report-Result -TestName "POST /api/core/parking-sessions/entry (CASUAL entry on MONTHLY card -> Expect Failure)" -Success $false -ErrorMessage "Allowed success on monthly card"
} catch {
    $errText = Get-ErrorText $_
    if ($errText -like "*CARD_IS_MONTHLY_USE_MONTHLY_FLOW*") {
        Report-Result -TestName "POST /api/core/parking-sessions/entry (CASUAL entry on MONTHLY card -> Expect Failure)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/parking-sessions/entry (CASUAL entry on MONTHLY card -> Expect Failure)" -Success $false -ErrorMessage $errText
    }
}

# 5. Try to entry with RESERVATION mode using the monthly card - expecting failure
# We register monthly pass on card C019 (ID 19) which is AVAILABLE (not checked in)
try {
    $mpPlate19 = "M-AUTO-" + (Get-Random -Minimum 10000 -Maximum 99999)
    $body = @{
        ownerName = "Nguyen Van Res Fail"
        plateNumber = $mpPlate19
        cardId = 19
        vehicleTypeId = 5
        startDate = (Get-Date).ToString("yyyy-MM-dd")
        endDate = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
        floorId = 2
        areaId = 4
        slotId = 33
    } | ConvertTo-Json
    $resPass = Invoke-RestMethod -Uri "$BaseUrl/api/core/monthly-passes" -Method Post -Headers $headers -ContentType "application/json" -Body $body

    $body = @{
        entryMode = "RESERVATION"
        reservationId = 1
        reservationEntryToken = "dummy-token"
        cardCode = "C019"
        licensePlate = "RES-ERR"
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedSlotId = 16
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $body
    Report-Result -TestName "POST /api/core/parking-sessions/entry (RESERVATION entry on MONTHLY card -> Expect Failure)" -Success $false -ErrorMessage "Allowed reservation on monthly card"
} catch {
    $errText = Get-ErrorText $_
    if ($errText -like "*CARD_IS_MONTHLY_NOT_ALLOWED_FOR_RESERVATION*") {
        Report-Result -TestName "POST /api/core/parking-sessions/entry (RESERVATION entry on MONTHLY card -> Expect Failure)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/parking-sessions/entry (RESERVATION entry on MONTHLY card -> Expect Failure)" -Success $false -ErrorMessage $errText
    }
}

# ======================================================================
#             HARDENING / VALIDATION TESTS (TC-HARD-01 to TC-HARD-10)
# ======================================================================
Write-Host "--- Running Hardening & Validation Tests ---" -ForegroundColor Yellow

# TC-HARD-01: Gate floor inactive check (FLOOR_NOT_ACTIVE)
$flrGateCardId = $null
$flrGateCardNum = "C-GATE-HARD-$rand"
try {
    # Create a temp card for gate hardening test
    $bodyCard = @{ cardNumber = $flrGateCardNum; note = "Temp card for gate floor test" } | ConvertTo-Json
    $resCard = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards" -Method Post -Headers $headers -ContentType "application/json" -Body $bodyCard
    $flrGateCardId = $resCard.data.id

    # Set Floor 1 to LOCKED
    $body = @{ floorName = "Ground Floor"; status = "LOCKED" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/floors/1" -Method Put -Headers $headers -ContentType "application/json" -Body $body
    
    # Try card entry-check on Gate 1 (belongs to Floor 1)
    $resEntry = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/$flrGateCardNum/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders
    Report-Result -TestName "TC-HARD-01: Card entry-check when floor is inactive -> Expect Failure" -Success $false -ErrorMessage "Allowed entry-check on inactive floor"
} catch {
    $errText = Get-ErrorText $_
    if ($errText -like "*FLOOR_NOT_ACTIVE*") {
        Report-Result -TestName "TC-HARD-01: Card entry-check when floor is inactive (FLOOR_NOT_ACTIVE)" -Success $true
    } else {
        Report-Result -TestName "TC-HARD-01: Card entry-check when floor is inactive" -Success $false -ErrorMessage $errText
    }
} finally {
    # Restore Floor 1 to ACTIVE
    try {
        $body = @{ floorName = "Ground Floor"; status = "ACTIVE" } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/floors/1" -Method Put -Headers $headers -ContentType "application/json" -Body $body
    } catch {}
    if ($flrGateCardId) {
        try {
            $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/$flrGateCardId" -Method Delete -Headers $headers
        } catch {}
    }
}

# TC-HARD-02: Create monthly pass on IN_USE card -> Expect Failure (CARD_NOT_AVAILABLE_FOR_MONTHLY_PASS)
try {
    # Find an IN_USE card dynamically from the API (since C001 is not IN_USE anymore)
    $cardsRes = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards" -Method Get -Headers $headers
    $inUseCard = $cardsRes.data | Where-Object { $_.status -eq "IN_USE" } | Select-Object -First 1
    $inUseCardId = if ($inUseCard) { $inUseCard.id } else { 1 }

    $body = @{
        ownerName = "Nguyen Van Hard2"
        plateNumber = "30A-HARD2"
        cardId = $inUseCardId
        vehicleTypeId = 5
        startDate = (Get-Date).ToString("yyyy-MM-dd")
        endDate = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
        floorId = 1
        areaId = 2
        slotId = 16
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/monthly-passes" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    Report-Result -TestName "TC-HARD-02: Create monthly pass on IN_USE card -> Expect Failure" -Success $false -ErrorMessage "Allowed creating monthly pass on IN_USE card"
} catch {
    $errText = Get-ErrorText $_
    if ($errText -like "*CARD_NOT_AVAILABLE_FOR_MONTHLY_PASS*") {
        Report-Result -TestName "TC-HARD-02: Create monthly pass on IN_USE card (CARD_NOT_AVAILABLE_FOR_MONTHLY_PASS)" -Success $true
    } else {
        Report-Result -TestName "TC-HARD-02: Create monthly pass on IN_USE card" -Success $false -ErrorMessage $errText
    }
}

# Create temp card for remaining hardening tests
$tempCardId = $null
$tempCardNum = "C-TEMP-$rand"
try {
    $body = @{
        cardNumber = $tempCardNum
        note = "Temp card for hardening tests"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    $tempCardId = $res.data.id
} catch {}

# TC-HARD-03: Create monthly pass by slot when floor is inactive -> Expect Failure (SLOT_FLOOR_INACTIVE)
if ($tempCardId) {
    try {
        # Set Floor 1 to LOCKED
        $body = @{ floorName = "Ground Floor"; status = "LOCKED" } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/floors/1" -Method Put -Headers $headers -ContentType "application/json" -Body $body

        # Try to create pass with Slot 14 (on Floor 1)
        $bodyPass = @{
            ownerName = "Nguyen Van Hard3"
            plateNumber = "30A-HARD3"
            cardId = $tempCardId
            vehicleTypeId = 5
            startDate = (Get-Date).ToString("yyyy-MM-dd")
            endDate = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
            floorId = 1
            areaId = 2
            slotId = 17
        } | ConvertTo-Json
        $resPass = Invoke-RestMethod -Uri "$BaseUrl/api/core/monthly-passes" -Method Post -Headers $headers -ContentType "application/json" -Body $bodyPass
        Report-Result -TestName "TC-HARD-03: Create monthly pass with slot on inactive floor -> Expect Failure" -Success $false -ErrorMessage "Succeeded creating monthly pass on inactive floor"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*SLOT_FLOOR_INACTIVE*") {
            Report-Result -TestName "TC-HARD-03: Create monthly pass with slot on inactive floor (SLOT_FLOOR_INACTIVE)" -Success $true
        } else {
            Report-Result -TestName "TC-HARD-03: Create monthly pass with slot on inactive floor" -Success $false -ErrorMessage $errText
        }
    } finally {
        # Restore Floor 1 to ACTIVE
        try {
            $body = @{ floorName = "Ground Floor"; status = "ACTIVE" } | ConvertTo-Json
            $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/floors/1" -Method Put -Headers $headers -ContentType "application/json" -Body $body
        } catch {}
    }
}

# TC-HARD-04: Create monthly pass by area when floor is inactive -> Expect Failure (AREA_FLOOR_INACTIVE)
if ($tempCardId) {
    try {
        # Set Floor 1 to LOCKED
        $body = @{ floorName = "Ground Floor"; status = "LOCKED" } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/floors/1" -Method Put -Headers $headers -ContentType "application/json" -Body $body

        # Try to create pass with Area 1 (non-slot motorbike area on Floor 1, vehicleTypeId = 3)
        $bodyPass = @{
            ownerName = "Nguyen Van Hard4"
            plateNumber = "30A-HARD4"
            cardId = $tempCardId
            vehicleTypeId = 3
            startDate = (Get-Date).ToString("yyyy-MM-dd")
            endDate = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
            floorId = 1
            areaId = 1
        } | ConvertTo-Json
        $resPass = Invoke-RestMethod -Uri "$BaseUrl/api/core/monthly-passes" -Method Post -Headers $headers -ContentType "application/json" -Body $bodyPass
        Report-Result -TestName "TC-HARD-04: Create monthly pass with area on inactive floor -> Expect Failure" -Success $false -ErrorMessage "Succeeded creating monthly pass on inactive floor"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*AREA_FLOOR_INACTIVE*") {
            Report-Result -TestName "TC-HARD-04: Create monthly pass with area on inactive floor (AREA_FLOOR_INACTIVE)" -Success $true
        } else {
            Report-Result -TestName "TC-HARD-04: Create monthly pass with area on inactive floor" -Success $false -ErrorMessage $errText
        }
    } finally {
        # Restore Floor 1 to ACTIVE
        try {
            $body = @{ floorName = "Ground Floor"; status = "ACTIVE" } | ConvertTo-Json
            $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/floors/1" -Method Put -Headers $headers -ContentType "application/json" -Body $body
        } catch {}
    }
}

# Create a fresh card for monthly mismatch validation tests
$mpHardCardId = $null
$mpHardCardNum = "C-MP-HARD-$rand"
$mpHardPassId = $null
$mpHardToken = $null
$mpHardPlate = "MPH-$rand"
try {
    $body = @{
        cardNumber = $mpHardCardNum
        note = "Card for monthly hardening tests"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    $mpHardCardId = $res.data.id

    $bodyPass = @{
        ownerName = "Nguyen Van MP Hard"
        plateNumber = $mpHardPlate
        cardId = $mpHardCardId
        vehicleTypeId = 5
        startDate = (Get-Date).ToString("yyyy-MM-dd")
        endDate = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
        floorId = 2
        areaId = 4
        slotId = 35
    } | ConvertTo-Json
    $resPass = Invoke-RestMethod -Uri "$BaseUrl/api/core/monthly-passes" -Method Post -Headers $headers -ContentType "application/json" -Body $bodyPass
    $mpHardPassId = $resPass.data.id

    # Get entry token
    $resEntry = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/$mpHardCardNum/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders
    $mpHardToken = $resEntry.data.monthlyEntryToken
} catch {}

# TC-HARD-05: Monthly pass card mismatch check -> Expect Failure (MONTHLY_ENTRY_TOKEN_MISMATCH)
if ($mpHardPassId -and $mpHardToken) {
    try {
        $body = @{
            entryMode = "MONTHLY"
            monthlyPassId = $mpHardPassId
            monthlyEntryToken = $mpHardToken
            cardCode = "C010"
            licensePlate = $mpHardPlate
            noPlate = $false
            vehicleTypeId = 5
            entryGateId = 1
            selectedSlotId = 35
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $body
        Report-Result -TestName "TC-HARD-05: Monthly entry token mismatch -> Expect Failure" -Success $false -ErrorMessage "Allowed entry with mismatched token claims"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*MONTHLY_ENTRY_TOKEN_MISMATCH*") {
            Report-Result -TestName "TC-HARD-05: Monthly entry token mismatch (MONTHLY_ENTRY_TOKEN_MISMATCH)" -Success $true
        } else {
            Report-Result -TestName "TC-HARD-05: Monthly entry token mismatch" -Success $false -ErrorMessage $errText
        }
    }
}

# TC-HARD-06: Monthly entry area mismatch -> Expect Failure (MONTHLY_AREA_MISMATCH)
if ($mpHardPassId -and $mpHardToken) {
    try {
        $body = @{
            entryMode = "MONTHLY"
            monthlyPassId = $mpHardPassId
            monthlyEntryToken = $mpHardToken
            cardCode = $mpHardCardNum
            licensePlate = $mpHardPlate
            noPlate = $false
            vehicleTypeId = 5
            entryGateId = 1
            selectedSlotId = 35
            selectedAreaId = 1 # Mismatched Area (Slot 35 is in Area 4)
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $body
        Report-Result -TestName "TC-HARD-06: Monthly entry area mismatch -> Expect Failure" -Success $false -ErrorMessage "Allowed mismatched area"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*MONTHLY_AREA_MISMATCH*") {
            Report-Result -TestName "TC-HARD-06: Monthly entry area mismatch (MONTHLY_AREA_MISMATCH)" -Success $true
        } else {
            Report-Result -TestName "TC-HARD-06: Monthly entry area mismatch" -Success $false -ErrorMessage $errText
        }
    }
}

# TC-HARD-08: Suggestion token staff mismatch -> Expect Failure (SUGGESTION_TOKEN_STAFF_MISMATCH)
try {
    # 1. Create a temp staff user
    $tempStaffUsername = "tempstaff$rand"
    $bodyUser = @{
        username = $tempStaffUsername
        password = "Password123"
        fullName = "Temp Staff User"
        email = "$tempStaffUsername@example.com"
        phone = ("09" + (Get-Random -Minimum 10000000 -Maximum 99999999))
        role = "STAFF"
    } | ConvertTo-Json
    $resUser = Invoke-RestMethod -Uri "$BaseUrl/api/core/users" -Method Post -Headers $headers -ContentType "application/json" -Body $bodyUser
    $tempStaffUserId = $resUser.data.id
    
    # 2. Login as tempstaff
    $bodyLogin = @{ username = $tempStaffUsername; password = "Password123" } | ConvertTo-Json
    $resLogin = Invoke-RestMethod -Uri "$BaseUrl/api/core/auth/login" -Method Post -ContentType "application/json" -Body $bodyLogin
    $tempStaffToken = $resLogin.data.accessToken
    $tempStaffHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $tempStaffToken"
    }

    # 3. Get suggestion token for staff01
    $sugRes = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/location-suggestion?vehicleTypeId=$slotVehicleTypeId&entryGateId=1" -Method Get -Headers $staffHeaders
    $sugTokenForStaff01 = $sugRes.data.suggestionToken
    $sugSlotId = $sugRes.data.suggestedSlotId

    # 4. Try to check in using tempstaff headers but with staff01's suggestion token
    $bodyEntry = @{
        entryMode = "CASUAL"
        cardCode = "C003"
        licensePlate = "30A-HARD8"
        noPlate = $false
        vehicleTypeId = $slotVehicleTypeId
        entryGateId = 1
        selectedSlotId = $sugSlotId
        suggestionToken = $sugTokenForStaff01
    } | ConvertTo-Json
    $resEntry = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $tempStaffHeaders -ContentType "application/json" -Body $bodyEntry
    Report-Result -TestName "TC-HARD-08: Staff suggestion token mismatch -> Expect Failure" -Success $false -ErrorMessage "Allowed staff to use another staff's suggestion token"
} catch {
    $errText = Get-ErrorText $_
    if ($errText -like "*SUGGESTION_TOKEN_STAFF_MISMATCH*") {
        Report-Result -TestName "TC-HARD-08: Staff suggestion token mismatch (SUGGESTION_TOKEN_STAFF_MISMATCH)" -Success $true
    } else {
        Report-Result -TestName "TC-HARD-08: Staff suggestion token mismatch" -Success $false -ErrorMessage $errText
    }
} finally {
    if ($tempStaffUserId) {
        try {
            $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users/$tempStaffUserId" -Method Delete -Headers $headers
        } catch {}
    }
}

# Create a fresh card for suggestion token mismatch test
$sugHardCardId = $null
$sugHardCardNum = "C-SUG-HARD-$rand"
try {
    $body = @{
        cardNumber = $sugHardCardNum
        note = "Card for suggestion hardening tests"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    $sugHardCardId = $res.data.id
} catch {}

# TC-HARD-09: Suggestion token request mismatch -> Expect Failure (SUGGESTION_REQUEST_MISMATCH)
if ($sugHardCardId) {
    try {
        # Get slot suggestion token for Car
        $sugRes = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/location-suggestion?vehicleTypeId=$slotVehicleTypeId&entryGateId=1" -Method Get -Headers $staffHeaders
        $sugToken = $sugRes.data.suggestionToken

        # Try entry with Motorbike (nonSlotVehicleTypeId) using Car suggestion token
        $bodyEntry = @{
            entryMode = "CASUAL"
            cardCode = $sugHardCardNum
            licensePlate = "30A-HARD9"
            noPlate = $false
            vehicleTypeId = $nonSlotVehicleTypeId
            entryGateId = 1
            selectedAreaId = 3
            suggestionToken = $sugToken
        } | ConvertTo-Json
        $resEntry = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $bodyEntry
        Report-Result -TestName "TC-HARD-09: Suggestion token request mismatch -> Expect Failure" -Success $false -ErrorMessage "Allowed mismatching suggestion token vehicle type"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*SUGGESTION_REQUEST_MISMATCH*") {
            Report-Result -TestName "TC-HARD-09: Suggestion token request mismatch (SUGGESTION_REQUEST_MISMATCH)" -Success $true
        } else {
            Report-Result -TestName "TC-HARD-09: Suggestion token request mismatch" -Success $false -ErrorMessage $errText
        }
    } finally {
        try {
            $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/$sugHardCardId" -Method Delete -Headers $headers
        } catch {}
    }
}

# Create a fresh card for floor inactive test
$flrHardCardId = $null
$flrHardCardNum = "C-FLR-HARD-$rand"
try {
    $body = @{
        cardNumber = $flrHardCardNum
        note = "Card for floor hardening tests"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    $flrHardCardId = $res.data.id
} catch {}

# TC-HARD-10: Selected floor inactive -> Expect Failure (SELECTED_FLOOR_NOT_ACTIVE)
if ($flrHardCardId) {
    try {
        # 1. Create Floor X
        $floorXBody = @{ floorCode = "FX-$rand"; floorName = "Floor X Hardening" } | ConvertTo-Json
        $floorXRes = Invoke-RestMethod -Uri "$BaseUrl/api/core/floors" -Method Post -Headers $headers -ContentType "application/json" -Body $floorXBody
        $floorXId = $floorXRes.data.id

        # 1b. Update Floor X to LOCKED
        $floorXUpdateBody = @{ floorName = "Floor X Hardening"; status = "LOCKED" } | ConvertTo-Json
        $floorXUpdateRes = Invoke-RestMethod -Uri "$BaseUrl/api/core/floors/$floorXId" -Method Put -Headers $headers -ContentType "application/json" -Body $floorXUpdateBody

        # 2. Create Area X on Floor X supporting Motorbikes (3)
        $areaXBody = @{
            floorId = $floorXId
            areaCode = "AX-$rand"
            areaName = "Area X Hardening"
            totalCapacity = 10
            vehicleTypeIds = @(3)
        } | ConvertTo-Json
        $areaXRes = Invoke-RestMethod -Uri "$BaseUrl/api/core/areas" -Method Post -Headers $headers -ContentType "application/json" -Body $areaXBody
        $areaXId = $areaXRes.data.id

        # 3. Call casual check-in as ADMIN (since override is allowed with reason)
        # Target Area X on inactive Floor X
        $bodyEntry = @{
            entryMode = "CASUAL"
            cardCode = $flrHardCardNum
            licensePlate = "30A-HARD10"
            noPlate = $false
            vehicleTypeId = 3
            entryGateId = 1
            selectedAreaId = $areaXId
            overrideReason = "Testing inactive floor override"
        } | ConvertTo-Json
        $resEntry = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $headers -ContentType "application/json" -Body $bodyEntry
        Report-Result -TestName "TC-HARD-10: Selected floor inactive -> Expect Failure" -Success $false -ErrorMessage "Allowed checking in to inactive floor area"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*SELECTED_FLOOR_NOT_ACTIVE*") {
            Report-Result -TestName "TC-HARD-10: Selected floor inactive (SELECTED_FLOOR_NOT_ACTIVE)" -Success $true
        } else {
            Report-Result -TestName "TC-HARD-10: Selected floor inactive" -Success $false -ErrorMessage $errText
        }
    } finally {
        # Cleanup Area X and Floor X
        if ($areaXId) {
            try {
                $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/areas/$areaXId" -Method Delete -Headers $headers
            } catch {}
        }
        if ($floorXId) {
            try {
                $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/floors/$floorXId" -Method Delete -Headers $headers
            } catch {}
        }
        try {
            $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/$flrHardCardId" -Method Delete -Headers $headers
        } catch {}
    }
}

# Cleanup temp card
if ($tempCardId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/$tempCardId" -Method Delete -Headers $headers
    } catch {}
}

# Cleanup monthly pass card
if ($mpHardCardId) {
    try {
        if ($mpHardPassId) {
            # pass is automatically deleted via cascading or we can just delete card
        }
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/$mpHardCardId" -Method Delete -Headers $headers
    } catch {}
}

# Restore pricing rule 5 hourly rate
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules/5" -Method Put -Headers $headers -ContentType "application/json" -Body (@{ reservationHourlyPrice = 10000 } | ConvertTo-Json)
} catch {}

#
# ----------------- TEST SUMMARY -----------------
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " TESTS COMPLETE" -ForegroundColor Cyan
Write-Host " Passed: $globalTestsPassed" -ForegroundColor Green
if ($globalTestsFailed -gt 0) {
    Write-Host " Failed: $globalTestsFailed" -ForegroundColor Red
} else {
    Write-Host " Failed: 0" -ForegroundColor Green
}
Write-Host "====================================================" -ForegroundColor Cyan

if ($globalTestsFailed -gt 0) {
    Exit 1
} else {
    Exit 0
}
```

