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

namespace ParkingBuilding.CoreApi.Application.LostCards;

public class LostCardService : ILostCardService
{
    private readonly ParkingDbContext _context;
    private readonly IAuditWriterService _auditWriter;

    public LostCardService(ParkingDbContext context, IAuditWriterService auditWriter)
    {
        _context = context;
        _auditWriter = auditWriter;
    }

    public async Task<LostCardCase> CreateLostCardCaseAsync(CreateLostCardRequest request, long staffId)
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
                ReporterName = request.ReporterName,
                Phone = request.Phone,
                Reason = request.Reason,
                VerificationNote = request.VerificationNote,
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
                    .Include(lc => lc.ParkingCard)
                    .Include(lc => lc.ParkingSession)
                    .FirstOrDefaultAsync(lc => lc.Id == caseId);

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
                        var pricingRule = await _context.PricingRules
                            .Where(p => p.VehicleTypeId == lostCardCase.ParkingSession.VehicleTypeId
                                     && p.Status == "ACTIVE")
                            .OrderByDescending(p => p.EffectiveFrom)
                            .FirstOrDefaultAsync();

                        if (pricingRule != null)
                        {
                            lostCardCase.LostCardFee = pricingRule.LostCardFee;
                        }

                        lostCardCase.ParkingSession.Status = "ACTIVE";
                        lostCardCase.ParkingSession.UpdatedAt = DateTimeOffset.UtcNow;
                    }

                    lostCardCase.Status = "APPROVED";
                    lostCardCase.ApprovedBy = userId;
                    lostCardCase.ApprovedAt = DateTimeOffset.UtcNow;
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
        var effectivePageSize = pageSize > 0 ? pageSize : 20;

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
