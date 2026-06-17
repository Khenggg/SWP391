using System;
using System.ComponentModel.DataAnnotations;

namespace ParkingBuilding.CoreApi.Contracts.Requests
{
    public class UpdatePricingRuleRequest
    {
        [Required(ErrorMessage = "DayPrice is required.")]
        [Range(0.00, (double)decimal.MaxValue, ErrorMessage = "DayPrice must be greater than or equal to 0.")]
        public decimal? DayPrice { get; set; }

        [Required(ErrorMessage = "NightPrice is required.")]
        [Range(0.00, (double)decimal.MaxValue, ErrorMessage = "NightPrice must be greater than or equal to 0.")]
        public decimal? NightPrice { get; set; }

        [Required(ErrorMessage = "MonthlyPrice is required.")]
        [Range(0.00, (double)decimal.MaxValue, ErrorMessage = "MonthlyPrice must be greater than or equal to 0.")]
        public decimal? MonthlyPrice { get; set; }

        [Required(ErrorMessage = "ReservationHourlyPrice is required.")]
        [Range(0.00, (double)decimal.MaxValue, ErrorMessage = "ReservationHourlyPrice must be greater than or equal to 0.")]
        public decimal? ReservationHourlyPrice { get; set; }

        [Required(ErrorMessage = "LostCardFee is required.")]
        [Range(0.00, (double)decimal.MaxValue, ErrorMessage = "LostCardFee must be greater than or equal to 0.")]
        public decimal? LostCardFee { get; set; }

        [Required(ErrorMessage = "EffectiveFrom is required.")]
        public DateTimeOffset? EffectiveFrom { get; set; }
    }
}
