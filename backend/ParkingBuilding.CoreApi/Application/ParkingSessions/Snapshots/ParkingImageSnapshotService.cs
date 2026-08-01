using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Application.Ocr;
using ParkingBuilding.CoreApi.Application.Storage;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Snapshots;

public sealed class ParkingImageSnapshotService : IParkingImageSnapshotService
{
    private static readonly HashSet<string> AllowedImageTypes = new(StringComparer.Ordinal)
    {
        "ENTRY_PLATE",
        "ENTRY_VEHICLE",
        "EXIT_PLATE",
        "EXIT_VEHICLE"
    };

    private readonly ParkingDbContext _context;
    private readonly IParkingSessionImageStorageService _imageStorageService;
    private readonly IStorageService _storageService;
    private readonly IPlateOcrService _ocrService;

    public ParkingImageSnapshotService(
        ParkingDbContext context,
        IParkingSessionImageStorageService imageStorageService,
        IStorageService storageService,
        IPlateOcrService ocrService)
    {
        _context = context;
        _imageStorageService = imageStorageService;
        _storageService = storageService;
        _ocrService = ocrService;
    }

    public async Task<ParkingImageSnapshotResponse> CreateAsync(
        CreateParkingImageSnapshotRequest request,
        long uploadedBy,
        CancellationToken ct = default)
    {
        var imageType = NormalizeImageType(request.ImageType);
        var isExitImage = imageType.StartsWith("EXIT_", StringComparison.Ordinal);

        if (isExitImage && !request.SessionId.HasValue)
        {
            throw new BusinessException(ErrorCodes.SnapshotSessionRequired);
        }

        if (request.SessionId.HasValue)
        {
            var isActiveSession = await _context.ParkingSessions
                .AsNoTracking()
                .AnyAsync(session => session.Id == request.SessionId.Value && session.Status == "ACTIVE", ct);

            if (!isActiveSession)
            {
                throw new BusinessException(ErrorCodes.SessionNotFound, StatusCodes.Status404NotFound);
            }
        }

        var now = DateTimeOffset.UtcNow;
        var snapshotToken = Guid.NewGuid();
        var stored = await _imageStorageService.StoreSnapshotAsync(
            request.ImageSource,
            snapshotToken,
            imageType,
            ct);

        bool isPlateImage = imageType.EndsWith("_PLATE", StringComparison.Ordinal);
        PlateOcrResult ocrResult = PlateOcrResult.NotRequested();

        if (isPlateImage)
        {
            var (contentType, bytes) = TryExtractImageBytes(request.ImageSource);
            if (bytes != null && bytes.Length > 0)
            {
                ocrResult = await _ocrService.RecognizePlateAsync(bytes, contentType, ct);
            }
        }

        var snapshot = new VehicleSnapshotUpload
        {
            SnapshotToken = snapshotToken,
            SessionId = request.SessionId,
            ImageType = imageType,
            ImageUrl = stored.ImageUrl,
            StoragePath = stored.StoragePath,
            MimeType = stored.MimeType,
            SizeBytes = stored.SizeBytes,
            UploadStatus = "UPLOADED",
            OcrStatus = isPlateImage ? (ocrResult.OcrStatus ?? "PENDING") : "NOT_REQUESTED",
            DetectedPlateNumber = ocrResult.DetectedPlateNumber,
            DetectedNormalizedPlateNumber = ocrResult.DetectedNormalizedPlateNumber,
            Confidence = ocrResult.Confidence,
            OcrError = ocrResult.Error,
            OcrProcessedAt = isPlateImage ? now : null,
            UploadedBy = uploadedBy,
            CapturedAt = request.CapturedAt ?? now,
            ExpiresAt = now.AddHours(24),
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.VehicleSnapshotUploads.Add(snapshot);

        try
        {
            await _context.SaveChangesAsync(ct);
        }
        catch
        {
            if (!string.IsNullOrWhiteSpace(stored.StoragePath))
            {
                try
                {
                    await _storageService.DeleteAsync(stored.StoragePath, ct);
                }
                catch
                {
                    // Preserve the database failure; orphan cleanup can retry later.
                }
            }

            throw;
        }

        return snapshot.ToResponse();
    }

    private static (string ContentType, byte[]? Bytes) TryExtractImageBytes(string source)
    {
        if (string.IsNullOrWhiteSpace(source) || !source.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
        {
            return ("image/jpeg", null);
        }

        var commaIndex = source.IndexOf(',');
        if (commaIndex <= "data:".Length)
        {
            return ("image/jpeg", null);
        }

        var metadata = source["data:".Length..commaIndex];
        var data = source[(commaIndex + 1)..];
        var segments = metadata.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var contentType = segments.Length > 0 ? segments[0].ToLowerInvariant() : "image/jpeg";
        var isBase64 = segments.Skip(1).Any(segment => string.Equals(segment, "base64", StringComparison.OrdinalIgnoreCase));

        try
        {
            var bytes = isBase64 ? Convert.FromBase64String(data) : System.Text.Encoding.UTF8.GetBytes(Uri.UnescapeDataString(data));
            return (contentType, bytes);
        }
        catch
        {
            return (contentType, null);
        }
    }

    public async Task<ParkingSessionImage> PromoteAsync(
        PromoteParkingImageSnapshotCommand command,
        CancellationToken ct = default)
    {
        var expectedImageType = NormalizeImageType(command.ExpectedImageType);
        var snapshot = await _context.VehicleSnapshotUploads
            .FirstOrDefaultAsync(upload => upload.Id == command.SnapshotId, ct);

        if (snapshot == null)
        {
            throw new BusinessException(ErrorCodes.SnapshotNotFound, StatusCodes.Status404NotFound);
        }

        if (!snapshot.SessionId.HasValue
            && snapshot.UploadedBy.HasValue
            && snapshot.UploadedBy.Value != command.ActorUserId)
        {
            throw new BusinessException(ErrorCodes.SnapshotOwnershipInvalid, StatusCodes.Status403Forbidden);
        }

        if (!string.Equals(snapshot.ImageType, expectedImageType, StringComparison.Ordinal))
        {
            throw new BusinessException(ErrorCodes.SnapshotTypeInvalid);
        }

        if (snapshot.SessionId.HasValue && snapshot.SessionId.Value != command.SessionId)
        {
            throw new BusinessException(ErrorCodes.SnapshotSessionMismatch, StatusCodes.Status409Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        if (snapshot.ExpiresAt.HasValue && snapshot.ExpiresAt.Value <= now)
        {
            throw new BusinessException(ErrorCodes.SnapshotExpired, StatusCodes.Status409Conflict);
        }

        if (snapshot.UploadStatus != "UPLOADED"
            && !(snapshot.UploadStatus == "ATTACHED" && snapshot.SessionId == command.SessionId))
        {
            throw new BusinessException(ErrorCodes.SnapshotStatusInvalid, StatusCodes.Status409Conflict);
        }

        var detectedPlate = snapshot.DetectedPlateNumber ?? NullIfWhiteSpace(command.DetectedPlateNumber);
        var normalizedPlate = snapshot.DetectedNormalizedPlateNumber
            ?? NullIfWhiteSpace(command.DetectedNormalizedPlateNumber)
            ?? NormalizePlate(detectedPlate);
        var confidence = snapshot.Confidence ?? command.Confidence;

        var finalized = await _context.ParkingSessionImages
            .FirstOrDefaultAsync(image => image.SessionId == command.SessionId
                && image.ImageType == expectedImageType
                && image.ImageUrl == snapshot.ImageUrl, ct);

        if (command.IsPrimary)
        {
            var otherPrimaries = await _context.ParkingSessionImages
                .Where(image => image.SessionId == command.SessionId
                    && image.ImageType == expectedImageType
                    && image.IsPrimary
                    && (finalized == null || image.Id != finalized.Id))
                .ToListAsync(ct);

            foreach (var otherPrimary in otherPrimaries)
            {
                otherPrimary.IsPrimary = false;
                otherPrimary.UpdatedAt = now;
            }
        }

        if (finalized == null)
        {
            finalized = new ParkingSessionImage
            {
                SessionId = command.SessionId,
                ImageType = expectedImageType,
                ImageUrl = snapshot.ImageUrl,
                ThumbnailUrl = null,
                CreatedAt = now
            };
            _context.ParkingSessionImages.Add(finalized);
        }

        finalized.DetectedPlateNumber = detectedPlate;
        finalized.DetectedNormalizedPlateNumber = normalizedPlate;
        finalized.Confidence = confidence;
        finalized.IsPrimary = command.IsPrimary;
        finalized.UploadedBy = snapshot.UploadedBy ?? command.ActorUserId;
        finalized.CapturedAt = snapshot.CapturedAt;
        finalized.UpdatedAt = now;

        snapshot.SessionId = command.SessionId;
        snapshot.UploadStatus = "ATTACHED";
        snapshot.AttachedAt ??= now;
        snapshot.ExpiresAt = null;
        snapshot.DetectedPlateNumber ??= detectedPlate;
        snapshot.DetectedNormalizedPlateNumber ??= normalizedPlate;
        snapshot.Confidence ??= confidence;
        snapshot.UpdatedAt = now;

        return finalized;
    }

    private static string NormalizeImageType(string? value)
    {
        var normalized = (value ?? string.Empty).Trim().ToUpperInvariant();
        if (!AllowedImageTypes.Contains(normalized))
        {
            throw new BusinessException(ErrorCodes.SnapshotTypeInvalid);
        }

        return normalized;
    }

    private static string? NormalizePlate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return new string(value.Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant();
    }

    private static string? NullIfWhiteSpace(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
