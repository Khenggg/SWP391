namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public interface IReservationEntryTokenService
    {
        string CreateToken(ReservationEntryTokenPayload payload);
        ReservationEntryTokenPayload VerifyToken(string token);
    }
}
