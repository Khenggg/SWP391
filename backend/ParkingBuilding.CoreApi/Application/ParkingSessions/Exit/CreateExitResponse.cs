using System;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Exit;

public class CreateExitResponse
{
    public long SessionId { get; set; }
    public string SessionCode { get; set; } = null!;
    public string Status { get; set; } = null!; // ACTIVE, COMPLETED, MISMATCH_PENDING...

    public string CardCode { get; set; } = null!;
    public string? EntryPlateNumber { get; set; }
    public string? ExitPlateNumber { get; set; }

    public DateTimeOffset EntryTime { get; set; }
    public DateTimeOffset ExitTime { get; set; }

    // Thông tin phân loại khách hàng và tài chính khớp với bảng parking_sessions và payments
    public string CustomerType { get; set; } = null!; // CASUAL hoặc MONTHLY
    public decimal AmountDue { get; set; } // Khớp với NUMERIC(12,2) trong DB
    public string PaymentStatus { get; set; } = null!; // PENDING, PAID, NOT_REQUIRED...

    // Đánh dấu true nếu hệ thống nhận diện biển số vào và ra không trùng nhau
    public bool IsPlateMismatch { get; set; }
}