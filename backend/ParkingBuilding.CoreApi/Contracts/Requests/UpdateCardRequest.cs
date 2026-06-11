using System.ComponentModel.DataAnnotations;
using ParkingBuilding.CoreApi.Domain.Enums;

namespace ParkingBuilding.CoreApi.Contracts.Requests
{
    public class UpdateCardRequest
    {
        [Required(ErrorMessage = "CardCode is required.")]
        [StringLength(50, ErrorMessage = "CardCode cannot exceed 50 characters.")]
        public string CardCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Status is required.")]
        public ParkingCardStatus? Status { get; set; }

        public string? Note { get; set; }
    }
}
