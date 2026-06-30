using System;

namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public class ReservationEntryTokenPayload
    {
        public long ReservationId { get; set; }
        public string ReservationCode { get; set; } = null!;

        public long VehicleTypeId { get; set; }
        public long EntryGateId { get; set; }

        public long ReservedFloorId { get; set; }
        public long ReservedAreaId { get; set; }
        public long? ReservedSlotId { get; set; }

        public long IssuedToStaffId { get; set; }

        public DateTimeOffset IssuedAt { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
    }
}
