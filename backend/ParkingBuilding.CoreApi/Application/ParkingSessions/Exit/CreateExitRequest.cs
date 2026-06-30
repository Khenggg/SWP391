namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Exit;

public class CreateExitRequest
{
    public string CardCode { get; set; } = null!;

    // Đã chuyển sang long để khớp hoàn toàn với kiểu BIGINT của exit_gate_id trong DB
    public long ExitGateId { get; set; }

    // Dữ liệu hình ảnh và OCR lúc ra để map vào bảng parking_session_images ('EXIT_PLATE', 'EXIT_VEHICLE')
    public string? ExitPlateImageUrl { get; set; }
    public string? ExitVehicleImageUrl { get; set; }
    public string? DetectedPlateNumber { get; set; }
    public double? OcrConfidence { get; set; }
}