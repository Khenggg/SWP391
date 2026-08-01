namespace ParkingBuilding.CoreApi.Application.Ocr;

public sealed class PlateOcrResult
{
    public bool Success { get; init; }
    public string OcrStatus { get; init; } = "NOT_REQUESTED";
    public string? DetectedPlateNumber { get; init; }
    public string? DetectedNormalizedPlateNumber { get; init; }
    public decimal? Confidence { get; init; }
    public string? Error { get; init; }

    public static PlateOcrResult NotRequested() => new() { Success = false, OcrStatus = "NOT_REQUESTED" };

    public static PlateOcrResult Failed(string error) => new()
    {
        Success = false,
        OcrStatus = "FAILED",
        Error = error
    };

    public static PlateOcrResult Succeeded(string rawPlate, string normalizedPlate, decimal confidence) => new()
    {
        Success = true,
        OcrStatus = "SUCCEEDED",
        DetectedPlateNumber = rawPlate,
        DetectedNormalizedPlateNumber = normalizedPlate,
        Confidence = confidence
    };
}
