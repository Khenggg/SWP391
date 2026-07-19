using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Application.Audit;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Admin;

public class SessionAdminService : ISessionAdminService
{
    private readonly ParkingDbContext _context;
    private readonly IAuditWriterService _auditWriterService;

    public SessionAdminService(ParkingDbContext context, IAuditWriterService auditWriterService)
    {
        _context = context;
        _auditWriterService = auditWriterService;
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
    public async Task<bool> MoveSessionSlotAsync(long sessionId, MoveSessionSlotRequest request, long adminId)
    {
        var strategy = _context.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var session = await _context.ParkingSessions
                    .Include(s => s.Slot)
                    .Include(s => s.Area)
                    .FirstOrDefaultAsync(s => s.Id == sessionId);

                if (session == null)
                {
                    throw new BusinessException(ErrorCodes.SessionNotFound);
                }

                if (session.Status != "ACTIVE")
                {
                    throw new BusinessException(ErrorCodes.InvalidStatus);
                }

                if (!session.SlotId.HasValue || session.Slot == null || session.Area == null)
                {
                    throw new BusinessException(ErrorCodes.SlotRequired);
                }

                var oldSlot = session.Slot;
                var oldArea = session.Area;

                var newSlot = await _context.Slots
                    .Include(s => s.Area)
                    .FirstOrDefaultAsync(s => s.Id == request.TargetSlotId);

                if (newSlot == null)
                {
                    throw new BusinessException(ErrorCodes.SlotNotFound);
                }

                if (newSlot.Status != "AVAILABLE")
                {
                    throw new BusinessException(ErrorCodes.SlotNotAvailable);
                }

                if (newSlot.AllowedVehicleTypeId != session.VehicleTypeId)
                {
                    throw new BusinessException(ErrorCodes.SlotVehicleTypeMismatch);
                }

                // Update Old Slot
                oldSlot.CurrentSessionId = null;
                oldSlot.Status = "AVAILABLE";
                oldSlot.UpdatedAt = DateTimeOffset.UtcNow;

                // Update New Slot
                newSlot.CurrentSessionId = session.Id;
                newSlot.Status = "OCCUPIED";
                newSlot.UpdatedAt = DateTimeOffset.UtcNow;

                // Update Session
                session.SlotId = newSlot.Id;
                session.AreaId = newSlot.AreaId;
                session.FloorId = newSlot.Area.FloorId;
                session.UpdatedAt = DateTimeOffset.UtcNow;

                // Update Area Occupancy
                if (oldArea.Id != newSlot.AreaId)
                {
                    oldArea.CurrentRealOccupancy = Math.Max(0, oldArea.CurrentRealOccupancy - 1);
                    oldArea.UpdatedAt = DateTimeOffset.UtcNow;

                    newSlot.Area.CurrentRealOccupancy++;
                    newSlot.Area.UpdatedAt = DateTimeOffset.UtcNow;
                }

                // Write Audit Log
                await _auditWriterService.WriteAuditLogAsync(
                    action: "MOVE_SESSION_SLOT",
                    targetType: "ParkingSession",
                    targetId: session.Id.ToString(),
                    actorUserId: adminId,
                    oldValue: oldSlot.SlotCode,
                    newValue: newSlot.SlotCode,
                    reason: request.Reason
                );

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
