using System;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Exit
{
    public class ExitResponse
    {
        public long SessionId { get; set; }
        public string SessionCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset ExitTime { get; set; }
        public decimal Amount { get; set; }
        public decimal LostCardFee { get; set; }
        public decimal TotalAmount { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public string? ReceiptCode { get; set; }
    }
}
