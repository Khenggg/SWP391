using System.Text.RegularExpressions;

namespace ParkingBuilding.CoreApi.Contracts.Common;

public static class UsernamePolicy
{
    public const int MinLength = 6;
    public const int MaxLength = 30;

    private static readonly Regex FormatPattern = new(
        @"^(?=.{6,30}$)(?!.*[_-]{2})[A-Za-z][A-Za-z0-9_-]*[A-Za-z0-9]$",
        RegexOptions.CultureInvariant);

    public static string Normalize(string? username)
        => username?.Trim().ToLowerInvariant() ?? string.Empty;

    public static bool IsValid(string? username)
        => !string.IsNullOrEmpty(username) && FormatPattern.IsMatch(username);

    public const string ValidationMessage =
        "Username must be 6-30 characters, start with a letter, use only letters, numbers, '_' or '-', and not contain consecutive or leading/trailing separators.";
}
