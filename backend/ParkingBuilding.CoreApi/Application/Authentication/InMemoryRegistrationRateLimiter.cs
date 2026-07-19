using System;
using System.Collections.Concurrent;

namespace ParkingBuilding.CoreApi.Application.Authentication;

public sealed class InMemoryRegistrationRateLimiter : IRegistrationRateLimiter
{
    private const int MaxAttempts = 5;
    private static readonly TimeSpan Window = TimeSpan.FromMinutes(1);
    private readonly ConcurrentDictionary<string, AttemptWindow> _windows = new();

    public bool TryAllow(string? ipAddress)
    {
        var key = string.IsNullOrWhiteSpace(ipAddress) ? "unknown" : ipAddress.Trim();
        var window = _windows.GetOrAdd(key, _ => new AttemptWindow());

        lock (window)
        {
            if (DateTimeOffset.UtcNow - window.StartedAt >= Window)
            {
                window.StartedAt = DateTimeOffset.UtcNow;
                window.Attempts = 0;
            }

            if (window.Attempts >= MaxAttempts)
            {
                return false;
            }

            window.Attempts++;
            return true;
        }
    }

    private sealed class AttemptWindow
    {
        public DateTimeOffset StartedAt { get; set; } = DateTimeOffset.UtcNow;
        public int Attempts { get; set; }
    }
}
