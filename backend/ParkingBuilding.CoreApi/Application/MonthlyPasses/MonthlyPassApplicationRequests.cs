using System;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public record SubmitApplicationRequest(
        string LicensePlate,
        string VehicleType,
        string Brand,
        string Color,
        string? Description,
        string CccdFrontImageUrl,
        string CccdBackImageUrl,
        string FaceImageUrl,
        string PlateImageUrl,
        string? Note,
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

    public class DriverVehicleStatusDto
    {
        public long Id { get; set; }
        public string LicensePlate { get; set; } = null!;
        public string VehicleTypeName { get; set; } = null!;
        public string Brand { get; set; } = null!;
        public string Color { get; set; } = null!;
        public string ApprovalStatus { get; set; } = null!;
        public string MonthlyPassStatus { get; set; } = null!; // ACTIVE, EXPIRED, NONE
        public DateTime? MonthlyPassEndDate { get; set; }
    }

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

        // Verification images & driver note
        public string? CccdFrontImageUrl { get; set; }
        public string? CccdBackImageUrl { get; set; }
        public string? FaceImageUrl { get; set; }
        public string? PlateImageUrl { get; set; }
        public string? Note { get; set; }

        // Driver details
        public string DriverFullName { get; set; } = null!;
        public string? DriverPhone { get; set; }
        public string? DriverEmail { get; set; }
        public string? DriverApartmentNumber { get; set; }
        public bool DriverResidentVerified { get; set; }

        // Driver's other registered vehicles
        public List<DriverVehicleStatusDto> DriverVehicles { get; set; } = new();
    }
}
