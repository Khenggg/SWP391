using System;
using System.Collections.Concurrent;

namespace ParkingBuilding.CoreApi.Application.Authentication;

public class InMemoryLoginRateLimiter : ILoginRateLimiter
{
    private const int MaxFailures = 5;
    private static readonly TimeSpan Window = TimeSpan.FromMinutes(15);
    private readonly ConcurrentDictionary<string, FailureWindow> _windows = new();

    public bool TryAllow(string username, string? ipAddress)
    {
        var window = _windows.GetOrAdd(CreateKey(username, ipAddress), _ => new FailureWindow());
        lock (window)
        {
            ResetIfExpired(window);
            return window.FailedAttempts < MaxFailures;
        }
    }

    public void RegisterFailure(string username, string? ipAddress)
    {
        var window = _windows.GetOrAdd(CreateKey(username, ipAddress), _ => new FailureWindow());
        lock (window)
        {
            ResetIfExpired(window);
            window.FailedAttempts++;
        }
    }

    public void Reset(string username, string? ipAddress)
    {
        _windows.TryRemove(CreateKey(username, ipAddress), out _);
    }

    private static void ResetIfExpired(FailureWindow window)
    {
        if (DateTimeOffset.UtcNow - window.StartedAt >= Window)
        {
            window.StartedAt = DateTimeOffset.UtcNow;
            window.FailedAttempts = 0;
        }
    }

    private static string CreateKey(string username, string? ipAddress)
        => $"{username.Trim().ToLowerInvariant()}|{ipAddress ?? "unknown"}";

    private sealed class FailureWindow
    {
        public DateTimeOffset StartedAt { get; set; } = DateTimeOffset.UtcNow;
        public int FailedAttempts { get; set; }
    }
}
