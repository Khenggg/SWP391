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
        if (string.IsNullOrWhiteSpace(path))
        {
            throw new BusinessException(ErrorCodes.InvalidRequest);
        }

        if (!_options.IsConfigured)
        {
            var localDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            var localPath = Path.Combine(localDir, path.Replace('/', Path.DirectorySeparatorChar));
            var fileDir = Path.GetDirectoryName(localPath);
            if (!string.IsNullOrEmpty(fileDir))
            {
                Directory.CreateDirectory(fileDir);
            }
            using (var fileStream = File.Create(localPath))
            {
                await stream.CopyToAsync(fileStream, ct);
            }
            return new StorageUploadResult
            {
                FilePath = path,
                SizeBytes = stream.CanSeek ? stream.Length : 0,
                ContentType = contentType
            };
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
        if (string.IsNullOrWhiteSpace(path))
        {
            throw new BusinessException(ErrorCodes.InvalidRequest);
        }

        if (!_options.IsConfigured)
        {
            return $"/uploads/{path.TrimStart('/')}";
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
        if (string.IsNullOrWhiteSpace(path))
        {
            return;
        }

        if (!_options.IsConfigured)
        {
            var localPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", path.Replace('/', Path.DirectorySeparatorChar));
            if (File.Exists(localPath)) File.Delete(localPath);
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
