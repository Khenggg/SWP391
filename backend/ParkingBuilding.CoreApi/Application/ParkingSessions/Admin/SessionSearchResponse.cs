using System;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Admin;

public class SessionSearchResponse
{
    public long Id { get; set; }
    public string SessionCode { get; set; } = string.Empty;
    public string? PlateNumber { get; set; }
    public bool NoPlate { get; set; }
    public string CustomerType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset EntryTime { get; set; }
    public long FloorId { get; set; }
    public string? FloorCode { get; set; }
    public long AreaId { get; set; }
    public string? AreaCode { get; set; }
    public long? SlotId { get; set; }
    public string? SlotCode { get; set; }

    // New fields added
    public string? CardCode { get; set; }
    public long VehicleTypeId { get; set; }
    public string? VehicleTypeName { get; set; }
    public bool RequiresSlot { get; set; }
    public string? EntryGateCode { get; set; }
    public string? ExitGateCode { get; set; }
    public long EntryStaffId { get; set; }
    public long? ExitStaffId { get; set; }
    public decimal SnapshotDayPrice { get; set; }
    public decimal SnapshotNightPrice { get; set; }
    public decimal SnapshotMonthlyPrice { get; set; }
    public decimal SnapshotLostCardFee { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTimeOffset? ExitTime { get; set; }
    public string? VehicleDescription { get; set; }
    public bool PaymentRequired { get; set; }
    public long? SuggestedSlotId { get; set; }
    public long? OverrideSlotId { get; set; }
    public string? OverrideReason { get; set; }
    public string? CancellationReason { get; set; }
}
