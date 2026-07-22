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
        await EnsureLostCardCaseEditableAsync(caseId, ct);
        var validated = await ValidateAndReadFileAsync(caseId, file, documentType, note, ct);
        await EnsureDocumentTypeAvailableAsync(caseId, validated.DocumentType, ct);

        var uploadedPaths = new List<string>();
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
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
        });
    }

    public async Task<IReadOnlyList<LostCardDocumentResponse>> UploadBatchAsync(
        long caseId,
        List<IFormFile> files,
        List<string> documentTypes,
        List<string?> notes,
        long uploadedBy,
        CancellationToken ct = default)
    {
        await EnsureLostCardCaseEditableAsync(caseId, ct);
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
        var batchStrategy = _context.Database.CreateExecutionStrategy();
        return await batchStrategy.ExecuteAsync(async () =>
        {
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
        });
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
        await EnsureLostCardCaseEditableAsync(caseId, ct);

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

    private async Task EnsureLostCardCaseEditableAsync(long caseId, CancellationToken ct)
    {
        var status = await _context.LostCardCases
            .AsNoTracking()
            .Where(lostCardCase => lostCardCase.Id == caseId)
            .Select(lostCardCase => lostCardCase.Status)
            .FirstOrDefaultAsync(ct);

        if (status == null)
            throw new BusinessException(ErrorCodes.LostCardCaseNotFound, StatusCodes.Status404NotFound);
        if (status != "PENDING")
            throw new BusinessException(ErrorCodes.LostCardCaseAlreadyProcessed, StatusCodes.Status409Conflict);
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
