namespace ParkingBuilding.CoreApi.Application.Payments
{
    public class CreateOnlineExitPaymentRequest
    {
        public string? CardCode { get; set; }
        public long? SessionId { get; set; }
    }
}
