using System;
using System.ComponentModel.DataAnnotations;
using ParkingBuilding.CoreApi.Domain.Enums;

namespace ParkingBuilding.CoreApi.Contracts.Requests
{
    public class CreatePricingRuleRequest
    {
        [Required(ErrorMessage = "VehicleTypeId is required.")]
        public long? VehicleTypeId { get; set; }

        [Required(ErrorMessage = "DayPrice is required.")]
        [Range(0.00, (double)decimal.MaxValue, ErrorMessage = "DayPrice must be greater than or equal to 0.")]
        public decimal? DayPrice { get; set; }

        [Required(ErrorMessage = "NightPrice is required.")]
        [Range(0.00, (double)decimal.MaxValue, ErrorMessage = "NightPrice must be greater than or equal to 0.")]
        public decimal? NightPrice { get; set; }

        [Required(ErrorMessage = "MonthlyPrice is required.")]
        [Range(0.00, (double)decimal.MaxValue, ErrorMessage = "MonthlyPrice must be greater than or equal to 0.")]
        public decimal? MonthlyPrice { get; set; }

        [Range(0.00, (double)decimal.MaxValue, ErrorMessage = "ReservationHourlyPrice must be greater than or equal to 0.")]
        public decimal ReservationHourlyPrice { get; set; } = 0;

        [Range(0.00, (double)decimal.MaxValue, ErrorMessage = "LostCardFee must be greater than or equal to 0.")]
        public decimal LostCardFee { get; set; } = 0;

        public DateTimeOffset? EffectiveFrom { get; set; }

        public PricingRuleStatus Status { get; set; } = PricingRuleStatus.ACTIVE;
    }
}
