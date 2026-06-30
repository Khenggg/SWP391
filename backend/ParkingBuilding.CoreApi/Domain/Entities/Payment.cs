using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class Payment
    {
        public long Id { get; set; }
        public long? SessionId { get; set; }
        public virtual ParkingSession? ParkingSession { get; set; }
        public long? ReservationId { get; set; }
        public virtual Reservation? Reservation { get; set; }
        public long? MonthlyPassId { get; set; }
        public virtual MonthlyPass? MonthlyPass { get; set; }
        public decimal Amount { get; set; }
        public decimal LostCardFee { get; set; }
        public decimal TotalAmount { get; set; }
        public string Purpose { get; set; } = "PARKING_FEE";
        public string Method { get; set; } = "CASH";
        public string Status { get; set; } = "PENDING";
        public string? Provider { get; set; }
        public string? ProviderTransactionId { get; set; }
        public string? PaymentUrl { get; set; }
        public DateTimeOffset? ExpiredAt { get; set; }
        public string? GatewayPayload { get; set; }
        public long? PaidByUserId { get; set; }
        public virtual User? PaidByUser { get; set; }
        public decimal ReceivedAmount { get; set; }
        public DateTimeOffset? FeeCalculatedAt { get; set; }
        public DateTimeOffset? PaymentValidUntil { get; set; }
        public DateTimeOffset? PaidAt { get; set; }
        public long? CollectedBy { get; set; }
        public virtual User? CollectedByUser { get; set; }
        public string? WaiveReason { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
