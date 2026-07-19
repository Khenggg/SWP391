using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Contracts.Responses
{
    public class UserDto
    {
        public long Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public List<string> Roles { get; set; } = new();
        public string Status { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string TokenType { get; set; } = "Bearer";
        public int ExpiresIn { get; set; }
        public string RefreshToken { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
    }
}
