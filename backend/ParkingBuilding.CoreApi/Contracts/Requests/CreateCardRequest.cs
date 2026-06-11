using System.ComponentModel.DataAnnotations;
using ParkingBuilding.CoreApi.Domain.Enums;

namespace ParkingBuilding.CoreApi.Contracts.Requests
{
    public class CreateCardRequest
    {
        [Required(ErrorMessage = "CardCode is required.")]
        [StringLength(50, ErrorMessage = "CardCode cannot exceed 50 characters.")]
        public string CardCode { get; set; } = string.Empty;

        [StringLength(120, ErrorMessage = "QrToken cannot exceed 120 characters.")]
        public string? QrToken { get; set; }

        public string? Note { get; set; }

        public ParkingCardStatus? Status { get; set; }
    }
}
