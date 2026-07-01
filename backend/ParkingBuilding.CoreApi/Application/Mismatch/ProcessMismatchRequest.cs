namespace ParkingBuilding.CoreApi.Application.Mismatches.Dtos;

public class ProcessMismatchRequest
{
    public bool IsConfirmed { get; set; } // true: Duyệt, false: Từ chối
    public string? Reason { get; set; }   // Lý do (nếu có)
}