using ParkingBuilding.CoreApi.Domain.Enums;

namespace ParkingBuilding.CoreApi.Application.LostCards;

public class ProcessLostCardRequest
{
    public LostCardCaseStatus Action { get; set; } // APPROVED hoặc REJECTED
    public string? RejectionReason { get; set; } // Bắt buộc nếu Action là REJECTED
}