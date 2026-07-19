using System;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Admin;

public class SessionSearchResponse
{
    public long Id { get; set; }
    public string SessionCode { get; set; } = string.Empty;
    public string? PlateNumber { get; set; }
    public string CustomerType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset EntryTime { get; set; }
    public string? AreaCode { get; set; }
    public string? SlotCode { get; set; }
}
