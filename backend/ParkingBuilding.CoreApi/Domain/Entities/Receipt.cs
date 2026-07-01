using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class Receipt
    {
        public long Id { get; set; }
        public string ReceiptCode { get; set; } = string.Empty;
        public long? SessionId { get; set; }
        public virtual ParkingSession? ParkingSession { get; set; }
        public long? PaymentId { get; set; }
        public virtual Payment? Payment { get; set; }
        public string CardCode { get; set; } = string.Empty;
        public string? PlateNumber { get; set; }
        public string VehicleTypeName { get; set; } = string.Empty;
        public DateTimeOffset? EntryTime { get; set; }
        public DateTimeOffset? ExitTime { get; set; }
        public decimal Amount { get; set; }
        public decimal LostCardFee { get; set; }
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = "CASH";
        public int PrintedCount { get; set; }
        public long? CreatedBy { get; set; }
        public virtual User? CreatedByUser { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
