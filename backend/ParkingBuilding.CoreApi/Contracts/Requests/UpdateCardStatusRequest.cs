using System.ComponentModel.DataAnnotations;
using ParkingBuilding.CoreApi.Domain.Enums;

namespace ParkingBuilding.CoreApi.Contracts.Requests
{
    public class UpdateCardStatusRequest
    {
        [Required(ErrorMessage = "Status is required.")]
        public ParkingCardStatus Status { get; set; }

        public string? Reason { get; set; }
    }
}
