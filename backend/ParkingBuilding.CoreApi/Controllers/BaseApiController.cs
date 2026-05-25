using Microsoft.AspNetCore.Mvc;

namespace ParkingBuilding.CoreApi.Controllers
{
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        // Giữ sạch lớp Base để các Controller con tự định nghĩa Route tường minh
    }
}