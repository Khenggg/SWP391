using System;
using System.Threading.Tasks;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.Notifications
{
    public interface INotificationWriterService
    {
        Task<Notification> CreateNotificationAsync(
            long userId,
            string title,
            string content,
            string type = "SYSTEM",
            string priority = "NORMAL",
            long? reservationId = null,
            long? monthlyPassId = null,
            long? paymentId = null,
            long? parkingSessionId = null);
    }

    public class NotificationWriterService : INotificationWriterService
    {
        private readonly ParkingDbContext _context;

        public NotificationWriterService(ParkingDbContext context)
        {
            _context = context;
        }

        public async Task<Notification> CreateNotificationAsync(
            long userId,
            string title,
            string content,
            string type = "SYSTEM",
            string priority = "NORMAL",
            long? reservationId = null,
            long? monthlyPassId = null,
            long? paymentId = null,
            long? parkingSessionId = null)
        {
            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Content = content,
                Type = type,
                Priority = priority,
                ReservationId = reservationId,
                MonthlyPassId = monthlyPassId,
                PaymentId = paymentId,
                ParkingSessionId = parkingSessionId,
                IsRead = false,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return notification;
        }
    }
}
