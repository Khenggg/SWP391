using System.ComponentModel.DataAnnotations;
using ParkingBuilding.CoreApi.Domain.Enums;

namespace ParkingBuilding.CoreApi.Contracts.Requests
{
    public class ChangeRoleRequest
    {
        [Required(ErrorMessage = "Role is required.")]
        public UserRole Role { get; set; }
    }
}
