namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public class ReservationBookingOptions
    {
        public int PaymentDeadlineMinutes { get; set; } = 10;
        public bool AllowZeroBookingFee { get; set; } = false;
    }
}
