using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Application.Audit.Dtos;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.Mismatch;

public class PlateMismatchService : IPlateMismatchService
{
    private readonly ParkingDbContext _context;
    private readonly IAuditWriterService _auditWriter;

    public PlateMismatchService(ParkingDbContext context, IAuditWriterService auditWriter)
    {
        _context = context;
        _auditWriter = auditWriter;
    }

    public async Task<PlateMismatchResponse> CreateMismatchAsync(CreatePlateMismatchRequest request, long staffId)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var session = await _context.ParkingSessions
                    .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.Status == "ACTIVE");

                if (session == null)
                    throw new BusinessException(ErrorCodes.SessionNotFound, StatusCodes.Status404NotFound);

                var existing = await _context.PlateMismatchCases
                    .FirstOrDefaultAsync(m => m.SessionId == request.SessionId
                                           && m.Status == "PENDING");

                if (existing != null)
                    throw new BusinessException(ErrorCodes.Conflict, StatusCodes.Status409Conflict);

                var mismatch = new PlateMismatchCase
                {
                    SessionId = request.SessionId,
                    EntryPlateNumber = session.PlateNumber,
                    ExitPlateNumber = request.ExitPlateNumber,
                    Reason = request.Reason,
                    Status = "PENDING",
                    CreatedBy = staffId,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                _context.PlateMismatchCases.Add(mismatch);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                {
                    Action = "PLATE_MISMATCH_CREATED",
                    TargetType = "PlateMismatchCase",
                    TargetId = mismatch.Id.ToString(),
                    ActorUserId = staffId,
                    NewValue = JsonSerializer.Serialize(mismatch),
                    Reason = $"Plate mismatch detected on session {request.SessionId}."
                });

                return MapToResponse(mismatch);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public async Task<PlateMismatchResponse> ProcessMismatchAsync(long caseId, ProcessPlateMismatchRequest request, long userId)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var mismatch = await _context.PlateMismatchCases
                    .FirstOrDefaultAsync(m => m.Id == caseId);

                if (mismatch == null)
                    throw new BusinessException(ErrorCodes.MismatchCaseNotFound, StatusCodes.Status404NotFound);

                if (mismatch.Status != "PENDING")
                    throw new BusinessException(ErrorCodes.MismatchCaseAlreadyProcessed, StatusCodes.Status409Conflict);

                var status = request.Status?.ToUpperInvariant();
                var oldVal = JsonSerializer.Serialize(mismatch);

                if (status == "CONFIRMED")
                {
                    mismatch.Status = "CONFIRMED";
                    mismatch.ConfirmedBy = userId;
                    mismatch.ConfirmedAt = DateTimeOffset.UtcNow;
                    mismatch.RejectionReason = request.RejectionReason; // Manager reason for approval
                }
                else if (status == "REJECTED")
                {
                    if (string.IsNullOrWhiteSpace(request.RejectionReason))
                        throw new BusinessException(ErrorCodes.MismatchRejectionReasonRequired, StatusCodes.Status400BadRequest);

                    mismatch.Status = "REJECTED";
                    mismatch.RejectionReason = request.RejectionReason;
                }
                else
                {
                    throw new BusinessException(ErrorCodes.InvalidStatus, StatusCodes.Status400BadRequest);
                }

                mismatch.UpdatedAt = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                {
                    Action = $"PLATE_MISMATCH_{status}",
                    TargetType = "PlateMismatchCase",
                    TargetId = mismatch.Id.ToString(),
                    ActorUserId = userId,
                    OldValue = oldVal,
                    NewValue = JsonSerializer.Serialize(mismatch),
                    Reason = $"Plate mismatch case {caseId} {status} by user {userId}."
                });

                return MapToResponse(mismatch);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public async Task<List<PlateMismatchResponse>> GetListAsync(string? status, int page, int pageSize)
    {
        var query = _context.PlateMismatchCases.AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(m => m.Status == status.ToUpperInvariant());

        var list = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return list.Select(MapToResponse).ToList();
    }

    public async Task<PlateMismatchResponse?> GetByIdAsync(long id)
    {
        var m = await _context.PlateMismatchCases
            .FirstOrDefaultAsync(x => x.Id == id);
        return m == null ? null : MapToResponse(m);
    }

    public async Task<PlateMismatchResponse?> GetBySessionIdAsync(long sessionId)
    {
        var m = await _context.PlateMismatchCases
            .Where(x => x.SessionId == sessionId)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync();
        return m == null ? null : MapToResponse(m);
    }

    private static PlateMismatchResponse MapToResponse(PlateMismatchCase m) => new()
    {
        Id = m.Id,
        SessionId = m.SessionId,
        EntryPlateNumber = m.EntryPlateNumber,
        ExitPlateNumber = m.ExitPlateNumber,
        Reason = m.Reason,
        Status = m.Status,
        CreatedBy = m.CreatedBy,
        ConfirmedBy = m.ConfirmedBy,
        ConfirmedAt = m.ConfirmedAt,
        RejectionReason = m.RejectionReason,
        CreatedAt = m.CreatedAt,
        UpdatedAt = m.UpdatedAt
    };
}
