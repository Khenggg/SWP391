using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Application.Audit.Dtos;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Application.Storage;

using ParkingBuilding.CoreApi.Application.Notifications;

namespace ParkingBuilding.CoreApi.Application.Mismatch;

public class PlateMismatchService : IPlateMismatchService
{
    private readonly ParkingDbContext _context;
    private readonly IAuditWriterService _auditWriter;
    private readonly IParkingSessionImageStorageService _imageStorageService;
    private readonly INotificationWriterService _notificationWriter;

    public PlateMismatchService(
        ParkingDbContext context, 
        IAuditWriterService auditWriter,
        IParkingSessionImageStorageService imageStorageService,
        INotificationWriterService notificationWriter)
    {
        _context = context;
        _auditWriter = auditWriter;
        _imageStorageService = imageStorageService;
        _notificationWriter = notificationWriter;
    }

    public async Task<PlateMismatchResponse> CreateMismatchAsync(CreatePlateMismatchRequest request, long staffId)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var session = await _context.ParkingSessions
                    .Include(s => s.ParkingCard)
                    .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.Status == "ACTIVE");

                if (session == null)
                    throw new BusinessException(ErrorCodes.SessionNotFound, StatusCodes.Status404NotFound);

                var normalizedEntry = NormalizePlate(session.PlateNumber);
                var normalizedExit = NormalizePlate(request.ExitPlateNumber);

                if (string.IsNullOrEmpty(normalizedExit))
                    throw new BusinessException(ErrorCodes.LicensePlateRequired, StatusCodes.Status400BadRequest);

                if (normalizedEntry == normalizedExit)
                    throw new BusinessException(ErrorCodes.InvalidRequest, StatusCodes.Status400BadRequest);

                var existing = await _context.PlateMismatchCases
                    .AnyAsync(m => m.SessionId == request.SessionId && m.Status == "PENDING");

                if (existing)
                    throw new BusinessException(ErrorCodes.Conflict, StatusCodes.Status409Conflict);

                var mismatch = new PlateMismatchCase
                {
                    SessionId = request.SessionId,
                    EntryPlateNumber = session.PlateNumber,
                    ExitPlateNumber = request.ExitPlateNumber.Trim(),
                    Reason = request.Reason?.Trim(),
                    Status = "PENDING",
                    CreatedBy = staffId,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                _context.PlateMismatchCases.Add(mismatch);

                var existingPlateImage = await _context.ParkingSessionImages
                    .FirstOrDefaultAsync(i => i.SessionId == session.Id && i.ImageType == "EXIT_PLATE");

                if (!string.IsNullOrWhiteSpace(request.ExitPlateImageUrl))
                {
                    var processedPlateUrl = await _imageStorageService.StoreAsync(request.ExitPlateImageUrl, session.Id, "exit", "plate");
                    if (existingPlateImage != null)
                    {
                        existingPlateImage.ImageUrl = processedPlateUrl;
                        existingPlateImage.DetectedPlateNumber = request.ExitPlateNumber.Trim();
                        existingPlateImage.DetectedNormalizedPlateNumber = normalizedExit;
                        existingPlateImage.Confidence = request.OcrConfidence.HasValue ? (decimal)request.OcrConfidence.Value : null;
                        existingPlateImage.IsPrimary = true;
                        existingPlateImage.CapturedAt = DateTimeOffset.UtcNow;
                        existingPlateImage.UpdatedAt = DateTimeOffset.UtcNow;
                    }
                    else
                    {
                        _context.ParkingSessionImages.Add(new ParkingSessionImage
                        {
                            SessionId = session.Id,
                            ImageType = "EXIT_PLATE",
                            ImageUrl = processedPlateUrl,
                            DetectedPlateNumber = request.ExitPlateNumber.Trim(),
                            DetectedNormalizedPlateNumber = normalizedExit,
                            Confidence = request.OcrConfidence.HasValue ? (decimal)request.OcrConfidence.Value : null,
                            IsPrimary = true,
                            CapturedAt = DateTimeOffset.UtcNow,
                            CreatedAt = DateTimeOffset.UtcNow,
                            UpdatedAt = DateTimeOffset.UtcNow
                        });
                    }
                }

                var existingVehicleImage = await _context.ParkingSessionImages
                    .FirstOrDefaultAsync(i => i.SessionId == session.Id && i.ImageType == "EXIT_VEHICLE");

                if (!string.IsNullOrWhiteSpace(request.ExitVehicleImageUrl))
                {
                    var processedVehicleUrl = await _imageStorageService.StoreAsync(request.ExitVehicleImageUrl, session.Id, "exit", "vehicle");
                    if (existingVehicleImage != null)
                    {
                        existingVehicleImage.ImageUrl = processedVehicleUrl;
                        existingVehicleImage.CapturedAt = DateTimeOffset.UtcNow;
                        existingVehicleImage.UpdatedAt = DateTimeOffset.UtcNow;
                    }
                    else
                    {
                        _context.ParkingSessionImages.Add(new ParkingSessionImage
                        {
                            SessionId = session.Id,
                            ImageType = "EXIT_VEHICLE",
                            ImageUrl = processedVehicleUrl,
                            IsPrimary = false,
                            CapturedAt = DateTimeOffset.UtcNow,
                            CreatedAt = DateTimeOffset.UtcNow,
                            UpdatedAt = DateTimeOffset.UtcNow
                        });
                    }
                }

                var jsonOptions = new JsonSerializerOptions { ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles };

                await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                {
                    Action = "PLATE_MISMATCH_CREATED",
                    TargetType = "PlateMismatchCase",
                    TargetId = mismatch.Id.ToString(),
                    ActorUserId = staffId,
                    NewValue = JsonSerializer.Serialize(mismatch, jsonOptions),
                    Reason = $"Plate mismatch detected on session {request.SessionId}."
                });

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return (await GetByIdAsync(mismatch.Id))!;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public async Task<PlateMismatchResponse> ProcessMismatchAsync(long caseId, ProcessPlateMismatchRequest request, long userId)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var mismatch = await _context.PlateMismatchCases
                    .FirstOrDefaultAsync(m => m.Id == caseId);

                if (mismatch == null)
                    throw new BusinessException(ErrorCodes.MismatchCaseNotFound, StatusCodes.Status404NotFound);

                if (mismatch.Status != "PENDING")
                    throw new BusinessException(ErrorCodes.MismatchCaseAlreadyProcessed, StatusCodes.Status409Conflict);

                var status = request.Status?.ToUpperInvariant();
                var jsonOptions = new JsonSerializerOptions { ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles };
                var oldVal = JsonSerializer.Serialize(mismatch, jsonOptions);

                if (status == "CONFIRMED")
                {
                    mismatch.Status = "CONFIRMED";
                    mismatch.ConfirmedBy = userId;
                    mismatch.ConfirmedAt = DateTimeOffset.UtcNow;
                    mismatch.RejectionReason = request.Reason?.Trim();
                }
                else if (status == "REJECTED")
                {
                    var rejectionReason = request.RejectionReason ?? request.Reason;
                    if (string.IsNullOrWhiteSpace(rejectionReason))
                        throw new BusinessException(ErrorCodes.MismatchRejectionReasonRequired, StatusCodes.Status400BadRequest);

                    mismatch.Status = "REJECTED";
                    mismatch.RejectionReason = rejectionReason.Trim();
                    mismatch.ConfirmedBy = userId;
                    mismatch.ConfirmedAt = DateTimeOffset.UtcNow;
                }
                else
                {
                    throw new BusinessException(ErrorCodes.InvalidStatus, StatusCodes.Status400BadRequest);
                }

                await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                {
                    Action = $"PLATE_MISMATCH_{status}",
                    TargetType = "PlateMismatchCase",
                    TargetId = mismatch.Id.ToString(),
                    ActorUserId = userId,
                    OldValue = oldVal,
                    NewValue = JsonSerializer.Serialize(mismatch, jsonOptions),
                    Reason = $"Plate mismatch case {caseId} {status} by user {userId}."
                });

                mismatch.UpdatedAt = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Create notification for driver if session is linked to driver/user
                var session = await _context.ParkingSessions.FirstOrDefaultAsync(s => s.Id == mismatch.SessionId);
                if (session != null)
                {
                    long? targetUserId = session.ClaimedByUserId;
                    if (!targetUserId.HasValue && session.DriverId.HasValue)
                    {
                        var driver = await _context.DriverProfiles.FindAsync(session.DriverId.Value);
                        targetUserId = driver?.UserId;
                    }
                    if (targetUserId.HasValue)
                    {
                        var title = status == "CONFIRMED" ? "Hồ sơ sai lệch biển số đã được duyệt" : "Hồ sơ sai lệch biển số bị từ chối";
                        var content = status == "CONFIRMED"
                            ? $"Hồ sơ sai lệch biển số cho phiên đỗ {session.SessionCode} đã được phê duyệt."
                            : $"Hồ sơ sai lệch biển số cho phiên đỗ {session.SessionCode} đã bị từ chối.";

                        await _notificationWriter.CreateNotificationAsync(
                            userId: targetUserId.Value,
                            title: title,
                            content: content,
                            type: "SYSTEM",
                            priority: "HIGH",
                            parkingSessionId: session.Id);
                    }
                }

                return (await GetByIdAsync(mismatch.Id))!;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public async Task<PlateMismatchResponse> ProcessPendingMismatchBySessionAsync(
        long sessionId,
        ProcessPlateMismatchRequest request,
        long userId)
    {
        var caseId = await _context.PlateMismatchCases
            .Where(m => m.SessionId == sessionId && m.Status == "PENDING")
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => m.Id)
            .FirstOrDefaultAsync();

        if (caseId == 0)
            throw new BusinessException(ErrorCodes.MismatchCaseNotFound, StatusCodes.Status404NotFound);

        return await ProcessMismatchAsync(caseId, request, userId);
    }

    public async Task<List<PlateMismatchResponse>> GetListAsync(string? status, int page, int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = MismatchQuery();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(m => m.Status == status.ToUpperInvariant());

        var list = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return await MapToResponsesAsync(list);
    }

    public async Task<PlateMismatchResponse?> GetByIdAsync(long id)
    {
        var m = await MismatchQuery()
            .FirstOrDefaultAsync(x => x.Id == id);
        return m == null ? null : (await MapToResponsesAsync(new List<PlateMismatchCase> { m }))[0];
    }

    public async Task<PlateMismatchResponse?> GetBySessionIdAsync(long sessionId)
    {
        var m = await MismatchQuery()
            .Where(x => x.SessionId == sessionId)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync();
        return m == null ? null : (await MapToResponsesAsync(new List<PlateMismatchCase> { m }))[0];
    }

    private IQueryable<PlateMismatchCase> MismatchQuery() => _context.PlateMismatchCases
        .Include(m => m.ParkingSession)
            .ThenInclude(s => s.ParkingCard)
        .Include(m => m.CreatedByUser)
        .Include(m => m.ConfirmedByUser)
        .AsNoTracking();

    private async Task<List<PlateMismatchResponse>> MapToResponsesAsync(List<PlateMismatchCase> mismatches)
    {
        var sessionIds = mismatches.Select(m => m.SessionId).Distinct().ToList();
        var images = await _context.ParkingSessionImages
            .AsNoTracking()
            .Where(image => sessionIds.Contains(image.SessionId))
            .OrderByDescending(image => image.CapturedAt)
            .ToListAsync();

        return mismatches.Select(m =>
        {
            var sessionImages = images.Where(image => image.SessionId == m.SessionId).ToList();
            var entryPlateImage = sessionImages.FirstOrDefault(image => image.ImageType == "ENTRY_PLATE");
            var entryVehicleImage = sessionImages.FirstOrDefault(image => image.ImageType == "ENTRY_VEHICLE");
            var exitPlateImage = sessionImages.FirstOrDefault(image => image.ImageType == "EXIT_PLATE");
            var exitVehicleImage = sessionImages.FirstOrDefault(image => image.ImageType == "EXIT_VEHICLE");

            return new PlateMismatchResponse
            {
                Id = m.Id,
                CaseCode = $"MM-{m.Id:D6}",
                SessionId = m.SessionId,
                SessionCode = m.ParkingSession?.SessionCode,
                CardCode = m.ParkingSession?.ParkingCard?.CardNumber,
                EntryTime = m.ParkingSession?.EntryTime,
                EntryPlateNumber = m.EntryPlateNumber,
                ExitPlateNumber = m.ExitPlateNumber,
                EntryPlateImageUrl = entryPlateImage?.ImageUrl,
                EntryVehicleImageUrl = entryVehicleImage?.ImageUrl,
                ExitPlateImageUrl = exitPlateImage?.ImageUrl,
                ExitVehicleImageUrl = exitVehicleImage?.ImageUrl,
                OcrConfidence = exitPlateImage?.Confidence,
                Reason = m.Reason,
                Status = m.Status,
                CreatedBy = m.CreatedBy,
                ReporterName = m.CreatedByUser?.FullName,
                ConfirmedBy = m.ConfirmedBy,
                ConfirmedAt = m.ConfirmedAt,
                DecidedBy = m.ConfirmedByUser?.FullName,
                DecidedAt = m.ConfirmedAt,
                DecisionReason = m.RejectionReason,
                RejectionReason = m.RejectionReason,
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt
            };
        }).ToList();
    }

    private static string NormalizePlate(string? plate) => plate?
        .Trim()
        .Replace("-", "")
        .Replace(".", "")
        .Replace(" ", "")
        .ToUpperInvariant() ?? string.Empty;
}
