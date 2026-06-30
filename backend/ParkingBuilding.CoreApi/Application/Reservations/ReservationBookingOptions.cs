namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public class ReservationBookingOptions
    {
        public int PaymentDeadlineMinutes { get; set; } = 10;
        public int MaxReservationHours { get; set; } = 3;
        public bool AllowZeroBookingFee { get; set; } = false;
    }
}
