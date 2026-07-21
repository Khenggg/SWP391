using System.Text;
using Microsoft.Extensions.Options;
using ParkingBuilding.CoreApi.Contracts.Common;

namespace ParkingBuilding.CoreApi.Application.Storage;

public sealed class ParkingSessionImageStorageService : IParkingSessionImageStorageService
{
    private static readonly IReadOnlyDictionary<string, string> ExtensionsByMimeType =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["image/jpeg"] = ".jpg",
            ["image/png"] = ".png",
            ["image/webp"] = ".webp",
            ["image/svg+xml"] = ".svg"
        };

    private readonly IStorageService _storageService;
    private readonly SupabaseStorageOptions _options;

    public ParkingSessionImageStorageService(
        IStorageService storageService,
        IOptions<SupabaseStorageOptions> options)
    {
        _storageService = storageService;
        _options = options.Value;
    }

    public async Task<string> StoreAsync(
        string imageSource,
        long sessionId,
        string phase,
        string imageKind,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(imageSource))
        {
            throw new BusinessException(ErrorCodes.FileRequired);
        }

        var source = imageSource.Trim();
        if (!source.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
        {
            if (source.Length > 500
                || !Uri.TryCreate(source, UriKind.Absolute, out var uri)
                || (uri.Scheme != Uri.UriSchemeHttps && uri.Scheme != Uri.UriSchemeHttp))
            {
                throw new BusinessException(ErrorCodes.InvalidRequest);
            }

            return source;
        }

        if (!_options.IsConfigured)
        {
            throw new BusinessException(ErrorCodes.StorageConfigMissing);
        }

        var (contentType, bytes) = ParseDataUri(source);
        if (bytes.Length == 0)
        {
            throw new BusinessException(ErrorCodes.FileEmpty);
        }

        if (bytes.Length > _options.MaxFileSizeBytes)
        {
            throw new BusinessException(ErrorCodes.FileTooLarge);
        }

        if (!ExtensionsByMimeType.TryGetValue(contentType, out var extension))
        {
            throw new BusinessException(ErrorCodes.FileTypeNotAllowed);
        }

        var safePhase = NormalizePathSegment(phase);
        var safeKind = NormalizePathSegment(imageKind);
        var path = $"sessions/{sessionId}/{safePhase}/{safeKind}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString("N")[..6]}{extension}";

        await using var stream = new MemoryStream(bytes, writable: false);
        await _storageService.UploadAsync(stream, path, contentType, ct);

        return $"{_options.Url!.TrimEnd('/')}/storage/v1/object/public/{_options.Bucket}/{path}";
    }

    private static (string ContentType, byte[] Bytes) ParseDataUri(string source)
    {
        var commaIndex = source.IndexOf(',');
        if (commaIndex <= "data:".Length)
        {
            throw new BusinessException(ErrorCodes.InvalidRequest);
        }

        var metadata = source["data:".Length..commaIndex];
        var data = source[(commaIndex + 1)..];
        var segments = metadata.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var contentType = segments[0].ToLowerInvariant();
        var isBase64 = segments.Skip(1).Any(segment => string.Equals(segment, "base64", StringComparison.OrdinalIgnoreCase));

        if (!ExtensionsByMimeType.ContainsKey(contentType))
        {
            throw new BusinessException(ErrorCodes.FileTypeNotAllowed);
        }

        try
        {
            return isBase64
                ? (contentType, Convert.FromBase64String(data))
                : (contentType, Encoding.UTF8.GetBytes(Uri.UnescapeDataString(data)));
        }
        catch (FormatException)
        {
            throw new BusinessException(ErrorCodes.InvalidRequest);
        }
    }

    private static string NormalizePathSegment(string value)
    {
        var normalized = new string((value ?? string.Empty)
            .Where(character => char.IsAsciiLetterOrDigit(character) || character is '-' or '_')
            .ToArray());

        return string.IsNullOrWhiteSpace(normalized) ? "image" : normalized.ToLowerInvariant();
    }
}
