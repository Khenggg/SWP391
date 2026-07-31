using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Application.Audit.Dtos;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

using ParkingBuilding.CoreApi.Application.Notifications;

namespace ParkingBuilding.CoreApi.Application.LostCards;

public class LostCardService : ILostCardService
{
    private readonly ParkingDbContext _context;
    private readonly IAuditWriterService _auditWriter;
    private readonly INotificationWriterService _notificationWriter;

    public LostCardService(
        ParkingDbContext context,
        IAuditWriterService auditWriter,
        INotificationWriterService notificationWriter)
    {
        _context = context;
        _auditWriter = auditWriter;
        _notificationWriter = notificationWriter;
    }

    public async Task<LostCardCase> CreateLostCardCaseAsync(CreateLostCardRequest request, long staffId)
    {
        if (request.SessionId <= 0)
            throw new BusinessException(ErrorCodes.InvalidRequest, StatusCodes.Status400BadRequest);
        if (string.IsNullOrWhiteSpace(request.ReporterName))
            throw new BusinessException(ErrorCodes.InvalidRequest, StatusCodes.Status400BadRequest);
        if (string.IsNullOrWhiteSpace(request.Reason))
            throw new BusinessException(ErrorCodes.ReasonRequired, StatusCodes.Status400BadRequest);
        if (string.IsNullOrWhiteSpace(request.VerificationNote))
            throw new BusinessException(ErrorCodes.InvalidRequest, StatusCodes.Status400BadRequest);

        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var session = await _context.ParkingSessions
                    .Include(s => s.ParkingCard)
                    .FirstOrDefaultAsync(s => s.Id == request.SessionId);

                if (session == null)
                    throw new BusinessException(ErrorCodes.SessionNotFound, StatusCodes.Status404NotFound);

                if (session.ParkingCard == null)
                    throw new BusinessException(ErrorCodes.CardNotFound, StatusCodes.Status400BadRequest);

                if (session.Status != "ACTIVE")
                    throw new BusinessException("Chỉ có thể báo mất thẻ cho phiên gửi xe đang hoạt động (ACTIVE).", StatusCodes.Status400BadRequest);

                if (session.ParkingCard.Status != CardStatus.IN_USE
                    || session.ParkingCard.CurrentSessionId != session.Id)
                    throw new BusinessException(ErrorCodes.CardHasNoActiveSession, StatusCodes.Status409Conflict);

                var hasPendingCase = await _context.LostCardCases
                    .AnyAsync(lc => lc.SessionId == session.Id
                        && lc.Status == Domain.Enums.LostCardCaseStatus.Pending.ToString().ToUpperInvariant());

                if (hasPendingCase)
                    throw new BusinessException(ErrorCodes.LostCardPending, StatusCodes.Status409Conflict);

                var lostCardCase = new LostCardCase
                {
                    SessionId = request.SessionId,
                    CardId = session.ParkingCard.Id,
                    ReporterName = request.ReporterName.Trim(),
                    Phone = request.Phone?.Trim(),
                    Reason = request.Reason.Trim(),
                    VerificationNote = request.VerificationNote.Trim(),
                    LostCardFee = 0m,
                    Status = "PENDING",
                    CreatedBy = staffId,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                _context.LostCardCases.Add(lostCardCase);
                session.Status = "LOST_CARD_PENDING";

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Create Notification for Managers
                var managerUserIds = await _context.Users
                    .Where(u => u.Role == Domain.Enums.UserRole.MANAGER || u.Role == Domain.Enums.UserRole.ADMIN)
                    .Select(u => u.Id)
                    .ToListAsync();

                foreach (var mgrId in managerUserIds)
                {
                    await _notificationWriter.CreateNotificationAsync(
                        userId: mgrId,
                        title: "Yêu cầu duyệt báo mất thẻ mới",
                        content: $"Có hồ sơ báo mất thẻ mới cho phiên đỗ {session.SessionCode} (thẻ {session.ParkingCard?.CardNumber}) cần Quản lý phê duyệt.",
                        type: "SYSTEM",
                        priority: "HIGH",
                        parkingSessionId: session.Id);
                }

                await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                {
                    Action = "LOST_CARD_CREATED",
                    TargetType = "LostCardCase",
                    TargetId = lostCardCase.Id.ToString(),
                    ActorUserId = staffId,
                    NewValue = JsonSerializer.Serialize(lostCardCase),
                    Reason = $"Lost card case created for session {session.Id} by staff {staffId}."
                });

                return lostCardCase;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public async Task<LostCardCase> ProcessLostCardCaseAsync(long caseId, ProcessLostCardRequest request, long userId)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var lostCardCase = await _context.LostCardCases
                    .FromSqlRaw("SELECT * FROM lost_card_cases WHERE id = {0} FOR UPDATE", caseId)
                    .Include(lc => lc.ParkingCard)
                    .Include(lc => lc.ParkingSession)
                    .FirstOrDefaultAsync();

                if (lostCardCase == null)
                    throw new BusinessException(ErrorCodes.LostCardCaseNotFound, StatusCodes.Status404NotFound);

                if (lostCardCase.Status != "PENDING")
                    throw new BusinessException(ErrorCodes.LostCardCaseAlreadyProcessed, StatusCodes.Status409Conflict);

                var status = request.Status?.ToUpperInvariant();
                var oldVal = JsonSerializer.Serialize(lostCardCase);

                if (status == "APPROVED")
                {
                    if (lostCardCase.ParkingCard != null)
                    {
                        lostCardCase.ParkingCard.Status = CardStatus.LOST;
                        lostCardCase.ParkingCard.UpdatedAt = DateTime.UtcNow;
                    }

                    if (lostCardCase.ParkingSession != null)
                    {
                        lostCardCase.LostCardFee = lostCardCase.ParkingSession.SnapshotLostCardFee;

                        lostCardCase.ParkingSession.Status = "ACTIVE";
                        lostCardCase.ParkingSession.UpdatedAt = DateTimeOffset.UtcNow;
                    }

                    lostCardCase.Status = "APPROVED";
                    lostCardCase.ApprovedBy = userId;
                    lostCardCase.ApprovedAt = DateTimeOffset.UtcNow;
                    if (!string.IsNullOrWhiteSpace(request.RejectionReason))
                    {
                        lostCardCase.RejectionReason = request.RejectionReason;
                    }
                }
                else if (status == "REJECTED")
                {
                    if (string.IsNullOrWhiteSpace(request.RejectionReason))
                        throw new BusinessException(ErrorCodes.ReasonRequired, StatusCodes.Status400BadRequest);

                    if (lostCardCase.ParkingSession != null)
                    {
                        lostCardCase.ParkingSession.Status = "ACTIVE";
                        lostCardCase.ParkingSession.UpdatedAt = DateTimeOffset.UtcNow;
                    }

                    lostCardCase.Status = "REJECTED";
                    lostCardCase.RejectionReason = request.RejectionReason;
                }
                else
                {
                    throw new BusinessException(ErrorCodes.InvalidStatus, StatusCodes.Status400BadRequest);
                }

                lostCardCase.UpdatedAt = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Create notification for driver
                long? targetUserId = lostCardCase.ParkingSession?.ClaimedByUserId;
                if (!targetUserId.HasValue && lostCardCase.ParkingSession?.DriverId.HasValue == true)
                {
                    var driver = await _context.DriverProfiles.FindAsync(lostCardCase.ParkingSession.DriverId.Value);
                    targetUserId = driver?.UserId;
                }
                if (targetUserId.HasValue)
                {
                    var title = status == "APPROVED" ? "Hồ sơ báo mất thẻ đã được duyệt" : "Hồ sơ báo mất thẻ bị từ chối";
                    var content = status == "APPROVED"
                        ? $"Hồ sơ báo mất thẻ cho phiên đỗ {lostCardCase.ParkingSession?.SessionCode} đã được Quản lý duyệt."
                        : $"Hồ sơ báo mất thẻ cho phiên đỗ {lostCardCase.ParkingSession?.SessionCode} đã bị từ chối. Lý do: {request.RejectionReason}.";

                    await _notificationWriter.CreateNotificationAsync(
                        userId: targetUserId.Value,
                        title: title,
                        content: content,
                        type: "SYSTEM",
                        priority: "HIGH",
                        parkingSessionId: lostCardCase.SessionId);
                }

                await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                {
                    Action = $"LOST_CARD_{status}",
                    TargetType = "LostCardCase",
                    TargetId = lostCardCase.Id.ToString(),
                    ActorUserId = userId,
                    OldValue = oldVal,
                    NewValue = JsonSerializer.Serialize(lostCardCase),
                    Reason = !string.IsNullOrEmpty(request.RejectionReason)
                        ? request.RejectionReason
                        : $"Lost card case {caseId} {status} by user {userId}."
                });

                return lostCardCase;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }
    /// <summary>
    /// Lấy danh sách yêu cầu báo mất thẻ (Hỗ trợ phân trang và lọc)
    /// </summary>
    public async Task<(List<LostCardCase> Items, int TotalItems, int TotalPages)> GetListAsync(
        string? status, 
        string? keyword, 
        int page, 
        int pageSize)
    {
        var effectivePage = Math.Max(1, page);
            var effectivePageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.LostCardCases
            .Include(lc => lc.ParkingCard)
            .Include(lc => lc.ParkingSession)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            var upperStatus = status.ToUpperInvariant();
            query = query.Where(lc => lc.Status == upperStatus);
        }

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            query = query.Where(lc => lc.ReporterName.Contains(keyword)
                || (lc.Phone != null && lc.Phone.Contains(keyword)));
        }

        int totalItems = await query.CountAsync();
        int totalPages = (int)Math.Ceiling((double)totalItems / effectivePageSize);

        var items = await query
            .OrderByDescending(lc => lc.CreatedAt)
            .Skip((effectivePage - 1) * effectivePageSize)
            .Take(effectivePageSize)
            .ToListAsync();

        return (items, totalItems, totalPages);
    }

    /// <summary>
    /// Lấy thông tin chi tiết của 1 case báo mất thẻ
    /// </summary>
    public async Task<LostCardCase> GetDetailAsync(long caseId)
    {
        var lostCardCase = await _context.LostCardCases
            .Include(lc => lc.ParkingCard)
            .Include(lc => lc.ParkingSession)
            .AsNoTracking()
            .FirstOrDefaultAsync(lc => lc.Id == caseId);

        if (lostCardCase == null)
        {
            throw new BusinessException(ErrorCodes.LostCardCaseNotFound, StatusCodes.Status404NotFound);
        }

        return lostCardCase;
    }
}
