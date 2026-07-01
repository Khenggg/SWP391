namespace ParkingBuilding.CoreApi.Application.Payments;

public class PayOsWebhookProcessResult
{
    public bool Success { get; set; }
    public bool Idempotent { get; set; }
    public string Message { get; set; } = string.Empty;
    public long? PaymentId { get; set; }
    public long? ReservationId { get; set; }
    public long? SessionId { get; set; }
    public long? OrderCode { get; set; }
    public string? PaymentStatus { get; set; }
    public string? ReservationStatus { get; set; }
}
