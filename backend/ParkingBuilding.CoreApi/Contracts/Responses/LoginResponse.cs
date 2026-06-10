namespace ParkingBuilding.CoreApi.Contracts.Responses
{

    public class LoginResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string TokenType { get; set; } = "Bearer";
        public int ExpiresIn { get; set; }
        public UserDto User { get; set; } = null!;
    }
}
