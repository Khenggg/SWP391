using System.ComponentModel.DataAnnotations;

namespace ParkingBuilding.CoreApi.Contracts.Requests
{
    public class CreateVehicleTypeRequest
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required(ErrorMessage = "RequiresSlot is required.")]
        public bool? RequiresSlot { get; set; }
    }
}
