using System;
using System.Text;

namespace ParkingBuilding.CoreApi.Infrastructure.Security;

public static class JwtSecretValidator
{
    public const int MinimumKeySizeInBytes = 32;
    public const string ConfigurationPlaceholder = "__SET_BY_ENV_OR_USER_SECRETS__";

    public static byte[] GetValidatedKeyBytes(string? secret)
    {
        if (string.IsNullOrWhiteSpace(secret)
            || string.Equals(secret, ConfigurationPlaceholder, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                "JWT Secret is not configured. Set JWT_SECRET or Jwt:Secret before starting the API.");
        }

        var keyBytes = Encoding.UTF8.GetBytes(secret);
        if (keyBytes.Length < MinimumKeySizeInBytes)
        {
            throw new InvalidOperationException(
                $"JWT Secret must be at least {MinimumKeySizeInBytes} bytes (256 bits) for HS256.");
        }

        return keyBytes;
    }
}
