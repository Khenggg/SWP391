using System;

namespace ParkingBuilding.CoreApi.Domain.Entities;

public class ParkingSession
{
    public long Id { get; set; }
    public string SessionCode { get; set; } = null!;
    public long CardId { get; set; }
    public long? DriverId { get; set; }
    public long? VehicleId { get; set; }
    public string? PlateNumber { get; set; }
    public bool NoPlate { get; set; }
    public string? VehicleDescription { get; set; }
    public long VehicleTypeId { get; set; }
    public long EntryGateId { get; set; }
    public long EntryStaffId { get; set; }
    public DateTimeOffset EntryTime { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset BillableStartTime { get; set; } = DateTimeOffset.UtcNow;
    public string Status { get; set; } = "ACTIVE";
    public bool PaymentRequired { get; set; } = true;
    public string PaymentStatus { get; set; } = "PENDING";
    public long FloorId { get; set; }
    public long AreaId { get; set; }
    public long? SlotId { get; set; }

    // Đổi từ DateTime sang DateTimeOffset cho đồng bộ
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}