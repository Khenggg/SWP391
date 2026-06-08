using System;

namespace ParkingBuilding.CoreApi.Contracts.Responses
{
    public class HealthCheckResponse
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = "Core API is running";
        public HealthCheckData Data { get; set; } = new();
        public object? Errors { get; set; } = null;
        public string Timestamp { get; set; } = DateTimeOffset.Now.ToString("yyyy-MM-ddTHH:mm:sszzz");
    }

    public class HealthCheckData
    {
        public string Service { get; set; } = "ParkingBuilding.CoreApi";
        public string Status { get; set; } = "UP";
    }
}