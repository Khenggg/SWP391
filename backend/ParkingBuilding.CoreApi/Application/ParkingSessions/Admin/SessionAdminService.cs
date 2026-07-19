using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Admin;

public class SessionAdminService : ISessionAdminService
{
    private readonly ParkingDbContext _context;

    public SessionAdminService(ParkingDbContext context)
    {
        _context = context;
    }

    public async Task<bool> CancelActiveSessionAsync(long sessionId, CancelActiveSessionRequest request, long adminId)
    {
        var strategy = _context.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var session = await _context.ParkingSessions
                    .Include(s => s.ParkingCard)
                    .Include(s => s.Slot)
                    .Include(s => s.Area)
                    .FirstOrDefaultAsync(s => s.Id == sessionId);

                if (session == null)
                {
                    throw new BusinessException(ErrorCodes.SessionNotFound);
                }

                if (session.Status != "ACTIVE")
                {
                    throw new BusinessException(ErrorCodes.InvalidStatus); // Using InvalidStatus as defined in ErrorCodes
                }

                // Update Session
                session.Status = "CANCELLED";
                session.CancellationReason = string.IsNullOrWhiteSpace(request.Reason) ? "Cancelled by Admin" : request.Reason;
                // Optionally track the admin who did it in ExitStaffId or similar
                session.ExitStaffId = adminId;
                session.ExitTime = DateTimeOffset.UtcNow;
                session.UpdatedAt = DateTimeOffset.UtcNow;

                // Free Card
                if (session.ParkingCard != null)
                {
                    session.ParkingCard.CurrentSessionId = null;
                    session.ParkingCard.Status = CardStatus.AVAILABLE;
                    session.ParkingCard.UpdatedAt = DateTime.UtcNow;
                }

                // Free Slot & Area
                if (session.Slot != null)
                {
                    session.Slot.CurrentSessionId = null;
                    session.Slot.Status = "AVAILABLE";
                    session.Slot.UpdatedAt = DateTimeOffset.UtcNow;
                }

                if (session.Area != null)
                {
                    session.Area.CurrentRealOccupancy = Math.Max(0, session.Area.CurrentRealOccupancy - 1);
                    session.Area.UpdatedAt = DateTimeOffset.UtcNow;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }
}
