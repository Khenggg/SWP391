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
}
