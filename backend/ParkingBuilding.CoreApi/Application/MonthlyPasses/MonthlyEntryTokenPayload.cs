using System;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public class MonthlyEntryTokenPayload
    {
        public long MonthlyPassId { get; set; }
        public long CardId { get; set; }
        public string CardCode { get; set; } = null!;

        public long VehicleTypeId { get; set; }
        public long EntryGateId { get; set; }

        public long FixedFloorId { get; set; }
        public long FixedAreaId { get; set; }
        public long? FixedSlotId { get; set; }

        public long IssuedToStaffId { get; set; }

        public DateTimeOffset IssuedAt { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
    }
}
