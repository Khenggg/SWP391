using System.ComponentModel.DataAnnotations;

namespace ParkingBuilding.CoreApi.Contracts.Requests
{
    public class UpdateFloorRequest
    {
        [Required(ErrorMessage = "Floor name is required.")]
        [StringLength(100, ErrorMessage = "Floor name must be at most 100 characters.")]
        public string FloorName { get; set; } = string.Empty;

        [StringLength(30, ErrorMessage = "Status must be at most 30 characters.")]
        public string Status { get; set; } = "ACTIVE";
    }
}
