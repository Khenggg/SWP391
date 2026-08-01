namespace ParkingBuilding.CoreApi.Application.Ocr;

public interface IPlateOcrService
{
    Task<PlateOcrResult> RecognizePlateAsync(byte[] imageBytes, string contentType, CancellationToken ct = default);
}
