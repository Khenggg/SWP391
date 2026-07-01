using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Contracts.Common;

namespace ParkingBuilding.CoreApi.Application.Mismatches;

public class MismatchService : IMismatchService
{
    private readonly ParkingDbContext _context;

    public MismatchService(ParkingDbContext context)
    {
        _context = context;
    }

    public async Task<PlateMismatchCase> CreateMismatchCaseAsync(long sessionId, string entryPlate, string exitPlate, long staffId, string reason)
    {
        var mismatchCase = new PlateMismatchCase
        {
            SessionId = sessionId,
            EntryPlateNumber = entryPlate,
            ExitPlateNumber = exitPlate,
            Reason = reason,
            Status = "PENDING",
            CreatedBy = staffId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _context.PlateMismatchCases.Add(mismatchCase);
        await _context.SaveChangesAsync();
        return mismatchCase;
    }

    public async Task ResolveMismatchCaseAsync(long caseId, bool isConfirmed, long managerId, string? reason)
    {
        var mismatchCase = await _context.PlateMismatchCases.FindAsync(caseId);
        if (mismatchCase == null)
        {
            throw new BusinessException("MISMATCH_CASE_NOT_FOUND", StatusCodes.Status404NotFound);
        }

        if (mismatchCase.Status != "PENDING")
        {
            throw new BusinessException("CASE_ALREADY_PROCESSED");
        }

        mismatchCase.Status = isConfirmed ? "CONFIRMED" : "REJECTED";
        mismatchCase.ConfirmedBy = managerId;
        mismatchCase.ConfirmedAt = DateTimeOffset.UtcNow;
        mismatchCase.RejectionReason = isConfirmed ? null : reason;
        mismatchCase.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();
    }
}