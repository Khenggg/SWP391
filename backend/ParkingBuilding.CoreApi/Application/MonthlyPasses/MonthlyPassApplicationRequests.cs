using System;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public record SubmitApplicationRequest(
        long VehicleId,
        DateTime StartDate
    );

    public record UpdateApplicationRequest(
        long VehicleId,
        DateTime StartDate
    );

    public record ReviewApplicationRequest(
        string Status,
        string? Reason
    );

    public record ConfirmPaymentRequest(
        string PaymentMethod,
        string ReferenceNo
    );

    public record AssignRfidRequest(
        string RfidCardCode
    );

    public class MonthlyPassApplicationResponse
    {
        public long Id { get; set; }
        public long DriverId { get; set; }
        public long VehicleId { get; set; }
        public string VehiclePlateNumber { get; set; } = null!;
        public string VehicleTypeName { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public decimal Price { get; set; }
        public string Status { get; set; } = null!;
        public string? RejectionReason { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PaymentReferenceNo { get; set; }
        public long? AssignedCardId { get; set; }
        public string? AssignedCardCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
