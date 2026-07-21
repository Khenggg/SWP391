using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public class ReservationExpiryWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<ReservationExpiryWorker> _logger;

        public ReservationExpiryWorker(IServiceScopeFactory scopeFactory, ILogger<ReservationExpiryWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Reservation Expiry Background Worker is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Wait for 1 minute before scanning
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

                    using var scope = _scopeFactory.CreateScope();
                    var reservationService = scope.ServiceProvider.GetRequiredService<ReservationService>();

                    _logger.LogDebug("Scanning for expired reservations...");
                    var expiredCount = await reservationService.ExpireReservationsAsync();
                    if (expiredCount > 0)
                    {
                        _logger.LogInformation("Successfully expired {Count} reservations.", expiredCount);
                    }

                    // Check for expiring warning notifications (15-min warning)
                    try
                    {
                        var warningCount = await reservationService.SendExpiringNotificationsAsync();
                        if (warningCount > 0)
                        {
                            _logger.LogInformation("Sent expiring warnings for {Count} reservations.", warningCount);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error scanning for expiring reservation notifications.");
                    }
                }
                catch (OperationCanceledException)
                {
                    // Worker is stopping, normal behavior
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while scanning for expired reservations.");
                }
            }

            _logger.LogInformation("Reservation Expiry Background Worker is stopping.");
        }
    }
}
