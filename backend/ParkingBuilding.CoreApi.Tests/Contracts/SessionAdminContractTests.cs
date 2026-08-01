using System.Text.Json;
using ParkingBuilding.CoreApi.Application.ParkingSessions.Admin;
using ParkingBuilding.CoreApi.Application.ParkingStructure.Slots;

namespace ParkingBuilding.CoreApi.Tests.Contracts;

public class SessionAdminContractTests
{
    private static readonly JsonSerializerOptions WebJsonOptions = new(JsonSerializerDefaults.Web);

    [Fact]
    public void Move_request_should_accept_an_area_target_without_a_slot_target()
    {
        var request = JsonSerializer.Deserialize<MoveSessionSlotRequest>(
            """{"targetAreaId":42,"reason":"Move area-managed vehicle"}""",
            WebJsonOptions);

        Assert.NotNull(request);
        Assert.Equal(42, request.TargetAreaId);
        Assert.Null(request.TargetSlotId);
    }

    [Fact]
    public void Session_search_response_should_expose_location_and_slot_requirement()
    {
        var response = new SessionSearchResponse
        {
            FloorId = 1,
            FloorCode = "B1",
            AreaId = 2,
            SlotId = null,
            VehicleTypeId = 3,
            RequiresSlot = false
        };

        Assert.Equal(1, response.FloorId);
        Assert.Equal("B1", response.FloorCode);
        Assert.Equal(2, response.AreaId);
        Assert.Null(response.SlotId);
        Assert.Equal(3, response.VehicleTypeId);
        Assert.False(response.RequiresSlot);
    }

    [Fact]
    public void Slot_response_should_expose_its_allowed_vehicle_type()
    {
        var response = new SlotResponse { AllowedVehicleTypeId = 3 };

        Assert.Equal(3, response.AllowedVehicleTypeId);
    }
}
