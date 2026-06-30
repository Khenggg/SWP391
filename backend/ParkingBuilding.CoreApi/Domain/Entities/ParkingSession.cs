using System;
using System.ComponentModel.DataAnnotations.Schema; // Thêm dòng này để dùng Table Attribute

namespace ParkingBuilding.CoreApi.Domain.Entities;

[Table("parking_sessions")] // Ép cứng EF Core map đúng vào bảng viết thường dưới DB
public class ParkingSession
{
    public long Id { get; set; }
    public string SessionCode { get; set; } = null!;
    public long CardId { get; set; }
    public virtual ParkingCard ParkingCard { get; set; } = null!;
    public long? DriverId { get; set; }
    public virtual DriverProfile? Driver { get; set; }
    public long? VehicleId { get; set; }
    public string? PlateNumber { get; set; }
    public string? NormalizedPlateNumber { get; set; }
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
    public long? ReservationId { get; set; }
    public virtual Reservation? Reservation { get; set; }

    public PricingRule? PricingRule { get; set; }

    // Thêm vào class ParkingSession
    public long? PricingRuleId { get; set; }
    public decimal SnapshotDayPrice { get; set; }
    public decimal SnapshotNightPrice { get; set; }
    public decimal SnapshotMonthlyPrice { get; set; }
    public decimal SnapshotLostCardFee { get; set; }
    public string CustomerType { get; set; } = "CASUAL"; // "CASUAL" hoặc "MONTHLY"

    public long? SuggestedAreaId { get; set; }
    public long? SuggestedSlotId { get; set; }
    public long? OverrideAreaId { get; set; }
    public long? OverrideSlotId { get; set; }
    public long? OverrideBy { get; set; }
    public DateTimeOffset? OverrideAt { get; set; }
    public string? OverrideReason { get; set; }

    public long? ClaimedByUserId { get; set; }
    public virtual User? ClaimedByUser { get; set; }
    public DateTimeOffset? ClaimedAt { get; set; }
    public string? ClaimMethod { get; set; }

    public long? MonthlyPassId { get; set; }

    public long? ExitGateId { get; set; }
    public long? ExitStaffId { get; set; }
    public DateTimeOffset? ExitTime { get; set; }

    public long? PlateCorrectedBy { get; set; }
    public DateTimeOffset? PlateCorrectedAt { get; set; }

    public string? CancellationReason { get; set; }

    // Đổi từ DateTime sang DateTimeOffset cho đồng bộ
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public virtual ICollection<ParkingSessionImage> ParkingSessionImages { get; set; } = new List<ParkingSessionImage>();

    public virtual Slot? Slot { get; set; }
    public virtual Area? Area { get; set; }
}