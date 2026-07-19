using System;

namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public class ReservationEntryCheckResponse
    {
        public string Status { get; set; } = null!;
        // VALID, EXPIRED, CANCELLED, ALREADY_CHECKED_IN, NOT_FOUND, NOT_CONFIRMED

        public long? ReservationId { get; set; }
        public string? ReservationCode { get; set; }

        public string? ReservationEntryToken { get; set; }

        public bool CanConvertToCasual { get; set; }

        public long? VehicleTypeId { get; set; }
        public bool RequiresSlot { get; set; }

        public string? PlateNumber { get; set; }
        public string? NormalizedPlateNumber { get; set; }
        public bool PlateRequiredAtEntry { get; set; }

        public long? ReservedFloorId { get; set; }
        public string? ReservedFloorCode { get; set; }

        public long? ReservedAreaId { get; set; }
        public string? ReservedAreaCode { get; set; }

        public long? ReservedSlotId { get; set; }
        public string? ReservedSlotCode { get; set; }

        public DateTimeOffset? ExpiresAt { get; set; }
    }
}
