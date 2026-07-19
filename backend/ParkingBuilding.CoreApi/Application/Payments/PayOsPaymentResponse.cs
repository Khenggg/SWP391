namespace ParkingBuilding.CoreApi.Application.Payments;

public class PayOsPaymentResponse
{
    public long PaymentId { get; set; }
    public long? ReservationId { get; set; }
    public long? SessionId { get; set; }
    public long OrderCode { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = "PENDING";
    public string Provider { get; set; } = "PAYOS";
    public string? PaymentLinkId { get; set; }
    public string? CheckoutUrl { get; set; }
    public string? QrCode { get; set; }
    public string? AccountNumber { get; set; }
    public string? Description { get; set; }
    public DateTimeOffset? ExpiredAt { get; set; }
    public bool IsLocalPlaceholder { get; set; }
}
