using Microsoft.AspNetCore.Mvc.Testing;

namespace ParkingBuilding.CoreApi.Tests.Smoke;

public class HealthEndpointsTests
{
    [Fact(Skip = "Scaffold only - can bo sung WebApplicationFactory bootstrap sau.")]
    public async Task Health_endpoint_should_return_success()
    {
        await Task.CompletedTask;
    }
}
