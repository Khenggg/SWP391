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

                if (session.Area == null)
                {
                    throw new BusinessException(ErrorCodes.AreaNotFound);
                }

                var vehicleType = await _context.VehicleTypes
                    .FirstOrDefaultAsync(vt => vt.Id == session.VehicleTypeId);
                if (vehicleType == null)
                {
                    throw new BusinessException(ErrorCodes.VehicleTypeNotFound);
                }

                var oldArea = session.Area;
                var now = DateTimeOffset.UtcNow;

                if (vehicleType.RequiresSlot)
                {
                    if (!request.TargetSlotId.HasValue)
                    {
                        throw new BusinessException(ErrorCodes.SelectedSlotRequired);
                    }

                    if (!session.SlotId.HasValue || session.Slot == null)
                    {
                        throw new BusinessException(ErrorCodes.SlotRequired);
                    }

                    if (session.SlotId.Value == request.TargetSlotId.Value)
                    {
                        throw new BusinessException(ErrorCodes.SessionMoveTargetUnchanged);
                    }

                    var newSlot = await _context.Slots
                        .Include(s => s.Area)
                            .ThenInclude(a => a.Floor)
                        .Include(s => s.Area)
                            .ThenInclude(a => a.AreaVehicleTypes)
                        .FirstOrDefaultAsync(s => s.Id == request.TargetSlotId.Value);

                    if (newSlot == null)
                    {
                        throw new BusinessException(ErrorCodes.SlotNotFound);
                    }

                    if (newSlot.Status != "AVAILABLE" || newSlot.CurrentSessionId.HasValue)
                    {
                        throw new BusinessException(ErrorCodes.SlotNotAvailable);
                    }

                    if (newSlot.AllowedVehicleTypeId != session.VehicleTypeId)
                    {
                        throw new BusinessException(ErrorCodes.SlotVehicleTypeMismatch);
                    }

                    if (newSlot.Area.Status != "ACTIVE")
                    {
                        throw new BusinessException(ErrorCodes.SelectedAreaNotActive);
                    }

                    if (newSlot.Area.Floor == null || newSlot.Area.Floor.Status != "ACTIVE")
                    {
                        throw new BusinessException(ErrorCodes.SelectedFloorNotActive);
                    }

                    if (!newSlot.Area.AreaVehicleTypes.Any(av => av.VehicleTypeId == session.VehicleTypeId))
                    {
                        throw new BusinessException(ErrorCodes.AreaVehicleTypeMismatch);
                    }

                    if (oldArea.Id != newSlot.AreaId &&
                        newSlot.Area.CurrentRealOccupancy + newSlot.Area.CurrentBookedSlots >= newSlot.Area.TotalCapacity)
                    {
                        throw new BusinessException(ErrorCodes.SelectedAreaFull);
                    }

                    var oldSlot = session.Slot;
                    oldSlot.CurrentSessionId = null;
                    oldSlot.Status = "AVAILABLE";
                    oldSlot.UpdatedAt = now;

                    newSlot.CurrentSessionId = session.Id;
                    newSlot.Status = "OCCUPIED";
                    newSlot.UpdatedAt = now;

                    session.SlotId = newSlot.Id;
                    session.AreaId = newSlot.AreaId;
                    session.FloorId = newSlot.Area.FloorId;
                    session.UpdatedAt = now;

                    if (oldArea.Id != newSlot.AreaId)
                    {
                        oldArea.CurrentRealOccupancy = Math.Max(0, oldArea.CurrentRealOccupancy - 1);
                        oldArea.UpdatedAt = now;

                        newSlot.Area.CurrentRealOccupancy++;
                        newSlot.Area.UpdatedAt = now;
                    }

                    await _auditWriterService.WriteAuditLogAsync(
                        action: "MOVE_SESSION_SLOT",
                        targetType: "ParkingSession",
                        targetId: session.Id.ToString(),
                        actorUserId: adminId,
                        oldValue: oldSlot.SlotCode,
                        newValue: newSlot.SlotCode,
                        reason: request.Reason
                    );
                }
                else
                {
                    if (request.TargetSlotId.HasValue)
                    {
                        throw new BusinessException(ErrorCodes.SlotMustBeNullForAreaManagedVehicle);
                    }

                    if (!request.TargetAreaId.HasValue)
                    {
                        throw new BusinessException(ErrorCodes.SelectedAreaRequired);
                    }

                    if (oldArea.Id == request.TargetAreaId.Value)
                    {
                        throw new BusinessException(ErrorCodes.SessionMoveTargetUnchanged);
                    }

                    var newArea = await _context.Areas
                        .Include(a => a.Floor)
                        .Include(a => a.AreaVehicleTypes)
                        .FirstOrDefaultAsync(a => a.Id == request.TargetAreaId.Value);

                    if (newArea == null)
                    {
                        throw new BusinessException(ErrorCodes.AreaNotFound);
                    }

                    if (newArea.Status != "ACTIVE")
                    {
                        throw new BusinessException(ErrorCodes.SelectedAreaNotActive);
                    }

                    if (newArea.Floor == null || newArea.Floor.Status != "ACTIVE")
                    {
                        throw new BusinessException(ErrorCodes.SelectedFloorNotActive);
                    }

                    if (!newArea.AreaVehicleTypes.Any(av => av.VehicleTypeId == session.VehicleTypeId))
                    {
                        throw new BusinessException(ErrorCodes.AreaVehicleTypeMismatch);
                    }

                    if (newArea.CurrentRealOccupancy + newArea.CurrentBookedSlots >= newArea.TotalCapacity)
                    {
                        throw new BusinessException(ErrorCodes.SelectedAreaFull);
                    }

                    if (session.SlotId.HasValue || session.Slot != null)
                    {
                        throw new BusinessException(ErrorCodes.SlotMustBeNullForAreaManagedVehicle);
                    }

                    oldArea.CurrentRealOccupancy = Math.Max(0, oldArea.CurrentRealOccupancy - 1);
                    oldArea.UpdatedAt = now;

                    newArea.CurrentRealOccupancy++;
                    newArea.UpdatedAt = now;

                    session.FloorId = newArea.FloorId;
                    session.AreaId = newArea.Id;
                    session.SlotId = null;
                    session.UpdatedAt = now;

                    await _auditWriterService.WriteAuditLogAsync(
                        action: "MOVE_SESSION_AREA",
                        targetType: "ParkingSession",
                        targetId: session.Id.ToString(),
                        actorUserId: adminId,
                        oldValue: oldArea.AreaCode,
                        newValue: newArea.AreaCode,
                        reason: request.Reason
                    );
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
                    join f in _context.Floors on s.FloorId equals f.Id into fGroup
                    from f in fGroup.DefaultIfEmpty()
                    join sl in _context.Slots on s.SlotId equals sl.Id into slGroup
                    from sl in slGroup.DefaultIfEmpty()
                    select new { s, c, vt, eg, xg, f, a, sl };

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
            NoPlate = x.s.NoPlate,
            CustomerType = x.s.CustomerType,
            Status = x.s.Status,
            EntryTime = x.s.EntryTime,
            FloorId = x.s.FloorId,
            FloorCode = x.f != null ? x.f.FloorCode : null,
            AreaId = x.s.AreaId,
            AreaCode = x.a?.AreaCode,
            SlotId = x.s.SlotId,
            SlotCode = x.sl?.SlotCode,
            CardCode = x.c?.CardNumber,
            VehicleTypeId = x.s.VehicleTypeId,
            VehicleTypeName = x.vt?.Name,
            RequiresSlot = x.vt != null && x.vt.RequiresSlot,
            EntryGateCode = x.eg?.GateCode,
            ExitGateCode = x.xg?.GateCode,
            EntryStaffId = x.s.EntryStaffId,
            ExitStaffId = x.s.ExitStaffId,
            SnapshotDayPrice = x.s.SnapshotDayPrice,
            SnapshotNightPrice = x.s.SnapshotNightPrice,
            SnapshotMonthlyPrice = x.s.SnapshotMonthlyPrice,
            SnapshotLostCardFee = x.s.SnapshotLostCardFee,
            PaymentStatus = x.s.PaymentStatus,
            ExitTime = x.s.ExitTime,
            VehicleDescription = x.s.VehicleDescription,
            PaymentRequired = x.s.PaymentRequired,
            SuggestedSlotId = x.s.SuggestedSlotId,
            OverrideSlotId = x.s.OverrideSlotId,
            OverrideReason = x.s.OverrideReason,
            CancellationReason = x.s.CancellationReason
        }).ToList();
    }
}
