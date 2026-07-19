namespace ParkingBuilding.CoreApi.Application.Payments;

public class PayOsOptions
{
    public string? ClientId { get; set; }
    public string? ApiKey { get; set; }
    public string? ChecksumKey { get; set; }
    public string? ReturnUrl { get; set; }
    public string? CancelUrl { get; set; }
    public string? WebhookUrl { get; set; }
    public int RequestTimeoutMs { get; set; } = 7000;

    public bool IsConfigured =>
        !IsPlaceholder(ClientId)
        && !IsPlaceholder(ApiKey)
        && !IsPlaceholder(ChecksumKey)
        && !string.IsNullOrWhiteSpace(ReturnUrl)
        && !string.IsNullOrWhiteSpace(CancelUrl);

    private static bool IsPlaceholder(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            || value.StartsWith("__", StringComparison.Ordinal)
            || value.Contains("placeholder", StringComparison.OrdinalIgnoreCase);
    }
}
