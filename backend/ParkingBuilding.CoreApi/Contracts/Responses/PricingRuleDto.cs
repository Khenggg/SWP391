using System;

namespace ParkingBuilding.CoreApi.Contracts.Responses
{
    public class PricingRuleDto
    {
        public long Id { get; set; }
        public long VehicleTypeId { get; set; }
        public string VehicleTypeName { get; set; } = string.Empty;
        public decimal DayPrice { get; set; }
        public decimal NightPrice { get; set; }
        public decimal MonthlyPrice { get; set; }
        public decimal ReservationHourlyPrice { get; set; }
        public decimal LostCardFee { get; set; }
        public DateTimeOffset EffectiveFrom { get; set; }
        public string Status { get; set; } = string.Empty;
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }
}
