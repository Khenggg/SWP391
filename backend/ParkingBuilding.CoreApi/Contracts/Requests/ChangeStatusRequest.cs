using System.ComponentModel.DataAnnotations;
using ParkingBuilding.CoreApi.Domain.Enums;

namespace ParkingBuilding.CoreApi.Contracts.Requests
{
    public class ChangeStatusRequest
    {
        [Required(ErrorMessage = "Status is required.")]
        public UserStatus Status { get; set; }
    }
}
