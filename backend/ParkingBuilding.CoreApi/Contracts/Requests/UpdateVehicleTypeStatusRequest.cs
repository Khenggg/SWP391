using System.ComponentModel.DataAnnotations;

namespace ParkingBuilding.CoreApi.Contracts.Requests
{
    public class UpdateVehicleTypeStatusRequest
    {
        [Required(ErrorMessage = "IsActive is required.")]
        public bool? IsActive { get; set; }
    }
}
