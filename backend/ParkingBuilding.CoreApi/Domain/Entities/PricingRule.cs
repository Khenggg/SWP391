using System;
using ParkingBuilding.CoreApi.Domain.Enums;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class PricingRule
    {
        public long Id { get; set; }
        
        public long VehicleTypeId { get; set; }
        public VehicleType? VehicleType { get; set; }
        
        public decimal DayPrice { get; set; }
        public decimal NightPrice { get; set; }
        public decimal MonthlyPrice { get; set; }
        public decimal ReservationHourlyPrice { get; set; }
        public decimal LostCardFee { get; set; }
        
        public DateTimeOffset EffectiveFrom { get; set; } = DateTimeOffset.UtcNow;
        public PricingRuleStatus Status { get; set; } = PricingRuleStatus.ACTIVE;
        
        public long CreatedBy { get; set; }
        public User? Creator { get; set; }
        
        public long? UpdatedBy { get; set; }
        public User? Updater { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
