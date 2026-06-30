using System;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Entry
{
    public class CreateEntryResponse
    {
        public long SessionId { get; set; }
        public string SessionCode { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string EntryMode { get; set; } = null!;
        public long? ConvertedFromReservationId { get; set; }

        public string CardCode { get; set; } = null!;
        public long CardId { get; set; }

        public string? PlateNumber { get; set; }
        public string? NormalizedPlateNumber { get; set; }
        public bool NoPlate { get; set; }
        public string? VehicleDescription { get; set; }

        public long VehicleTypeId { get; set; }
        public long EntryGateId { get; set; }
        public long EntryStaffId { get; set; }
        public DateTimeOffset EntryTime { get; set; }
        public DateTimeOffset BillableStartTime { get; set; }

        public long FloorId { get; set; }
        public long AreaId { get; set; }
        public long? SlotId { get; set; }

        public string CustomerType { get; set; } = null!;
        public bool PaymentRequired { get; set; }
        public string PaymentStatus { get; set; } = null!;

        public long? ReservationId { get; set; }
        public long? MonthlyPassId { get; set; }

        public long? SuggestedAreaId { get; set; }
        public long? SuggestedSlotId { get; set; }
        public long? OverrideAreaId { get; set; }
        public long? OverrideSlotId { get; set; }
        public string? OverrideReason { get; set; }
    }
}
