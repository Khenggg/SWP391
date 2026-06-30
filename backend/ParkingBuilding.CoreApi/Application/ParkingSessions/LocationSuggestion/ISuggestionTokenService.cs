namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public interface ISuggestionTokenService
    {
        string CreateToken(LocationSuggestionPayload payload);
        LocationSuggestionPayload VerifyToken(string token);
    }
}
