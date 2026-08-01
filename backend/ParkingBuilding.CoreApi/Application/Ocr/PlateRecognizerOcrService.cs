using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ParkingBuilding.CoreApi.Application.Ocr;

public sealed class PlateRecognizerOcrService : IPlateOcrService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PlateRecognizerOcrService> _logger;

    public PlateRecognizerOcrService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<PlateRecognizerOcrService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<PlateOcrResult> RecognizePlateAsync(byte[] imageBytes, string contentType, CancellationToken ct = default)
    {
        var apiToken = _configuration["PLATE_RECOGNIZER_API_TOKEN"]
            ?? _configuration["LATE_RECOGNIZER_API_TOKEN"];

        if (string.IsNullOrWhiteSpace(apiToken))
        {
            _logger.LogWarning("Plate Recognizer API Token is not configured.");
            return PlateOcrResult.Failed("API token missing");
        }

        if (imageBytes == null || imageBytes.Length == 0)
        {
            return PlateOcrResult.Failed("Empty image data");
        }

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.platerecognizer.com/v1/plate-reader/");
            request.Headers.Authorization = new AuthenticationHeaderValue("Token", apiToken.Trim());

            using var content = new MultipartFormDataContent();
            var byteArrayContent = new ByteArrayContent(imageBytes);
            byteArrayContent.Headers.ContentType = new MediaTypeHeaderValue(string.IsNullOrWhiteSpace(contentType) ? "image/jpeg" : contentType);
            
            content.Add(byteArrayContent, "upload", "plate.jpg");
            content.Add(new StringContent("vn"), "regions");

            request.Content = content;

            using var response = await _httpClient.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("Plate Recognizer API returned non-success status code {StatusCode}: {ErrorBody}", response.StatusCode, errorBody);
                return PlateOcrResult.Failed($"API status {response.StatusCode}");
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(json);
            
            if (!doc.RootElement.TryGetProperty("results", out var resultsElement)
                || resultsElement.ValueKind != JsonValueKind.Array
                || resultsElement.GetArrayLength() == 0)
            {
                _logger.LogInformation("Plate Recognizer did not detect any license plate in image.");
                return PlateOcrResult.Failed("No plate detected");
            }

            // Pick the result with highest dscore (confidence)
            JsonElement bestResult = default;
            double maxScore = -1;

            foreach (var item in resultsElement.EnumerateArray())
            {
                double score = item.TryGetProperty("dscore", out var scoreElem) ? scoreElem.GetDouble() : 0;
                if (score > maxScore)
                {
                    maxScore = score;
                    bestResult = item;
                }
            }

            if (maxScore < 0 || bestResult.ValueKind == JsonValueKind.Undefined)
            {
                bestResult = resultsElement[0];
            }

            string rawPlate = bestResult.TryGetProperty("plate", out var plateElem) ? (plateElem.GetString() ?? "").Trim().ToUpperInvariant() : "";
            double dscore = bestResult.TryGetProperty("dscore", out var dsElem) ? dsElem.GetDouble() : 0;
            decimal confidence = Math.Round((decimal)(dscore * 100), 2);

            if (string.IsNullOrWhiteSpace(rawPlate))
            {
                return PlateOcrResult.Failed("Empty plate detected");
            }

            string normalizedPlate = NormalizePlate(rawPlate);

            _logger.LogInformation("Plate Recognizer detected plate: {RawPlate} (Normalized: {NormalizedPlate}, Confidence: {Confidence}%)",
                rawPlate, normalizedPlate, confidence);

            return PlateOcrResult.Succeeded(rawPlate, normalizedPlate, confidence);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Plate Recognizer API.");
            return PlateOcrResult.Failed(ex.Message);
        }
    }

    private static string NormalizePlate(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return "";
        return new string(value.Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant();
    }
}
