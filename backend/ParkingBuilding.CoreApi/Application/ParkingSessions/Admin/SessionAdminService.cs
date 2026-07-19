using System;
using System.Collections.Generic;
using System.Linq;
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

    public async Task<List<SessionSearchResponse>> SearchSessionsAsync(string? keyword, long? vehicleTypeId, string? customerType, string? status, string? sessionCode)
    {
        var query = from s in _context.ParkingSessions
                    join c in _context.ParkingCards on s.CardId equals c.Id into cGroup
                    from c in cGroup.DefaultIfEmpty()
                    join vt in _context.VehicleTypes on s.VehicleTypeId equals vt.Id into vtGroup
                    from vt in vtGroup.DefaultIfEmpty()
                    join eg in _context.Gates on s.EntryGateId equals eg.Id into egGroup
                    from eg in egGroup.DefaultIfEmpty()
                    join xg in _context.Gates on s.ExitGateId equals xg.Id into xgGroup
                    from xg in xgGroup.DefaultIfEmpty()
                    join a in _context.Areas on s.AreaId equals a.Id into aGroup
                    from a in aGroup.DefaultIfEmpty()
                    join sl in _context.Slots on s.SlotId equals sl.Id into slGroup
                    from sl in slGroup.DefaultIfEmpty()
                    select new { s, c, vt, eg, xg, a, sl };

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var k = keyword.Trim().ToLower();
            query = query.Where(x => 
                (x.s.PlateNumber != null && x.s.PlateNumber.ToLower().Contains(k)) ||
                x.s.SessionCode.ToLower().Contains(k) ||
                (x.c != null && x.c.CardNumber.ToLower().Contains(k))
            );
        }

        if (vehicleTypeId.HasValue)
        {
            query = query.Where(x => x.s.VehicleTypeId == vehicleTypeId.Value);
        }

        if (!string.IsNullOrWhiteSpace(customerType))
        {
            var cleanType = customerType.Trim().ToUpper();
            query = query.Where(x => x.s.CustomerType == cleanType);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            var cleanStatus = status.Trim().ToUpper();
            query = query.Where(x => x.s.Status == cleanStatus);
        }

        if (!string.IsNullOrWhiteSpace(sessionCode))
        {
            var cleanCode = sessionCode.Trim().ToLower();
            query = query.Where(x => x.s.SessionCode.ToLower().Contains(cleanCode));
        }

        var results = await query.OrderByDescending(x => x.s.EntryTime).ToListAsync();

        return results.Select(x => new SessionSearchResponse
        {
            Id = x.s.Id,
            SessionCode = x.s.SessionCode,
            PlateNumber = x.s.PlateNumber,
            CustomerType = x.s.CustomerType,
            Status = x.s.Status,
            EntryTime = x.s.EntryTime,
            AreaCode = x.a?.AreaCode,
            SlotCode = x.sl?.SlotCode,
            CardCode = x.c?.CardNumber,
            VehicleTypeName = x.vt?.Name,
            EntryGateCode = x.eg?.GateCode,
            ExitGateCode = x.xg?.GateCode,
            SnapshotDayPrice = x.s.SnapshotDayPrice,
            SnapshotNightPrice = x.s.SnapshotNightPrice,
            SnapshotMonthlyPrice = x.s.SnapshotMonthlyPrice,
            SnapshotLostCardFee = x.s.SnapshotLostCardFee,
            PaymentStatus = x.s.PaymentStatus,
            ExitTime = x.s.ExitTime,
            VehicleDescription = x.s.VehicleDescription,
            PaymentRequired = x.s.PaymentRequired
        }).ToList();
    }
}
