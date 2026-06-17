using System.ComponentModel.DataAnnotations;
using ParkingBuilding.CoreApi.Domain.Enums;

namespace ParkingBuilding.CoreApi.Contracts.Requests
{
    public class UpdatePricingRuleStatusRequest
    {
        [Required(ErrorMessage = "Status is required.")]
        public PricingRuleStatus Status { get; set; }

        public string? Reason { get; set; }
    }
}
