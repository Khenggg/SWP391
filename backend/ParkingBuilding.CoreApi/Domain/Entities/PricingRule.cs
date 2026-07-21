using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class PricingRule
    {
        public long Id { get; set; }
        public long VehicleTypeId { get; set; }
        public decimal DayPrice { get; set; }
        public decimal NightPrice { get; set; }
        public decimal MonthlyPrice { get; set; }
        public decimal ReservationHourlyPrice { get; set; }
        public int MaxReservationHours { get; set; } = 24;
        public decimal LostCardFee { get; set; }
        public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, INACTIVE
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public VehicleType? VehicleType { get; set; }
    }
}
