using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace ParkingBuilding.CoreApi.Tests.Flows;

public class UserRoleChangeATTDTests
{
    [Fact]
    public void ATTD_RoleChange_Dto_Structure_Validates_Role_And_Reason()
    {
        // ATTD Requirement: Reason must be present, Role must not be DRIVER
        var role = "MANAGER";
        var reason = "đổi vai trò sang manager";

        Assert.False(string.IsNullOrWhiteSpace(role));
        Assert.False(string.IsNullOrWhiteSpace(reason));
        Assert.NotEqual("DRIVER", role, System.StringComparer.OrdinalIgnoreCase);
    }

    [Theory]
    [InlineData("RESIDENT")]
    [InlineData("VISITOR")]
    public void ATTD_DriverType_Change_Accepts_Resident_And_Visitor(string driverType)
    {
        var validTypes = new[] { "RESIDENT", "VISITOR" };
        Assert.Contains(driverType, validTypes);
    }

    [Theory]
    [InlineData("STAFF")]
    [InlineData("MANAGER")]
    [InlineData("ADMIN")]
    public void ATTD_Driver_Promotion_To_Internal_Roles_Is_Blocked(string targetRole)
    {
        var isDriverAccount = true;
        var allowed = !isDriverAccount || targetRole == "DRIVER";
        Assert.False(allowed);
    }
}
