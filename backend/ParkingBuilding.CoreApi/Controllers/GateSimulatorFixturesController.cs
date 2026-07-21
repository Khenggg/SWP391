using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Controllers;

/// <summary>
/// Supplies only currently usable records to the staff-only gate simulator.
/// It never creates, resets, or changes parking data.
/// </summary>
[Authorize(Roles = "STAFF,MANAGER,ADMIN")]
[Route("api/core/gate-simulator")]
public sealed class GateSimulatorFixturesController : BaseApiController
{
    private sealed record GateFixture(string GateCode);
    private sealed record ActiveSessionFixture(
        string CustomerType,
        long? ReservationId,
        DateTimeOffset BillableStartTime,
        string CardCode,
        string? PlateNumber);

    private readonly ParkingDbContext _context;

    public GateSimulatorFixturesController(ParkingDbContext context)
    {
        _context = context;
    }

    [HttpGet("fixtures")]
    public async Task<IActionResult> GetFixtures()
    {
        var now = DateTimeOffset.UtcNow;
        var today = now.UtcDateTime.Date;

        var entryGate = await _context.Gates.AsNoTracking()
            .Where(g => g.GateType == "ENTRY" && g.Status == "ACTIVE")
            .OrderBy(g => g.Id)
            .Select(g => new GateFixture(g.GateCode))
            .FirstOrDefaultAsync();

        var exitGate = await _context.Gates.AsNoTracking()
            .Where(g => g.GateType == "EXIT" && g.Status == "ACTIVE")
            .OrderBy(g => g.Id)
            .Select(g => new GateFixture(g.GateCode))
            .FirstOrDefaultAsync();

        var normalCard = await _context.ParkingCards.AsNoTracking()
            .Where(c => c.Status == CardStatus.AVAILABLE
                     && !c.CurrentSessionId.HasValue
                     && !_context.MonthlyPasses.Any(p => p.CardId == c.Id))
            .OrderBy(c => c.Id)
            .Select(c => new { c.CardNumber })
            .FirstOrDefaultAsync();

        var monthlyEntry = await (
                from pass in _context.MonthlyPasses.AsNoTracking()
                join card in _context.ParkingCards.AsNoTracking() on pass.CardId equals card.Id
                join floor in _context.Floors.AsNoTracking() on pass.FloorId equals floor.Id
                join area in _context.Areas.AsNoTracking() on pass.AreaId equals area.Id
                join vehicleType in _context.VehicleTypes.AsNoTracking() on pass.VehicleTypeId equals vehicleType.Id
                where pass.Status == "ACTIVE"
                   && pass.StartDate.Date <= today
                   && pass.EndDate.Date >= today
                   && card.Status == CardStatus.AVAILABLE
                   && !card.CurrentSessionId.HasValue
                   && floor.Status == "ACTIVE"
                   && area.Status == "ACTIVE"
                   && (!vehicleType.RequiresSlot
                       || (pass.SlotId.HasValue
                           && _context.Slots.Any(s => s.Id == pass.SlotId
                                                    && s.Status != "INACTIVE"
                                                    && s.Status != "LOCKED")))
                orderby pass.Id
                select new
                {
                    card.CardNumber,
                    pass.PlateNumber,
                    vehicleLabel = "Xe vé tháng"
                })
            .FirstOrDefaultAsync();

        var booking = await _context.Reservations.AsNoTracking()
            .Where(r => r.Status == "CONFIRMED"
                     && r.CheckedInAt == null
                     && r.ExpiresAt > now
                     && (r.BookingAmount <= 0m || r.PaymentStatus == "PAID"))
            .OrderBy(r => r.ExpiresAt)
            .Select(r => new
            {
                r.ReservationCode,
                r.PlateNumber,
                vehicleLabel = "Xe booking"
            })
            .FirstOrDefaultAsync();

        var activeSessions = await _context.ParkingSessions.AsNoTracking()
            .Where(s => s.Status == "ACTIVE")
            .OrderBy(s => s.EntryTime)
            .Select(s => new ActiveSessionFixture(
                s.CustomerType,
                s.ReservationId,
                s.BillableStartTime,
                s.ParkingCard.CardNumber,
                s.PlateNumber))
            .ToListAsync();

        object? BuildEntryFixture(
            string label,
            string? cardCode,
            string? plateNumber,
            string? bookingCode,
            string vehicleLabel)
        {
            if (entryGate == null || string.IsNullOrWhiteSpace(cardCode))
            {
                return null;
            }

            return new
            {
                label,
                gateType = "ENTRY",
                scanType = string.IsNullOrWhiteSpace(bookingCode) ? "CARD" : "BOOKING_QR",
                gateCode = entryGate.GateCode,
                cardCode,
                bookingId = bookingCode ?? string.Empty,
                qrToken = bookingCode ?? string.Empty,
                detectedPlate = plateNumber ?? string.Empty,
                vehicleLabel
            };
        }

        object? BuildExitFixture(string label, ActiveSessionFixture? session, string vehicleLabel)
        {
            var gateCode = exitGate?.GateCode;
            if (string.IsNullOrWhiteSpace(gateCode) || session == null)
            {
                return null;
            }

            return new
            {
                label,
                gateType = "EXIT",
                scanType = "CARD",
                gateCode,
                cardCode = session.CardCode,
                bookingId = string.Empty,
                qrToken = string.Empty,
                detectedPlate = session.PlateNumber ?? string.Empty,
                vehicleLabel
            };
        }

        var casualExit = activeSessions.FirstOrDefault(s =>
            s.CustomerType == "CASUAL" && !s.ReservationId.HasValue);
        var monthlyExit = activeSessions.FirstOrDefault(s => s.CustomerType == "MONTHLY");
        var bookingWithinTermExit = activeSessions.FirstOrDefault(s =>
            s.CustomerType == "CASUAL"
            && s.ReservationId.HasValue
            && s.BillableStartTime > now);
        var bookingOverdueExit = activeSessions.FirstOrDefault(s =>
            s.CustomerType == "CASUAL"
            && s.ReservationId.HasValue
            && s.BillableStartTime <= now);

        return Success(new
        {
            generatedAt = now,
            entry = new
            {
                casual = BuildEntryFixture(
                    "Vãng lai vào",
                    normalCard?.CardNumber,
                    null,
                    null,
                    "Xe vãng lai"),
                monthly = BuildEntryFixture(
                    "Vé tháng vào",
                    monthlyEntry?.CardNumber,
                    monthlyEntry?.PlateNumber,
                    null,
                    monthlyEntry?.vehicleLabel ?? "Xe vé tháng"),
                booking = BuildEntryFixture(
                    "Booking vào",
                    normalCard?.CardNumber,
                    booking?.PlateNumber,
                    booking?.ReservationCode,
                    booking?.vehicleLabel ?? "Xe booking")
            },
            exit = new
            {
                casual = BuildExitFixture("Vãng lai ra", casualExit, "Xe vãng lai ra"),
                monthly = BuildExitFixture("Vé tháng ra", monthlyExit, "Xe vé tháng ra"),
                bookingWithinTerm = BuildExitFixture("Booking còn hạn", bookingWithinTermExit, "Xe booking còn hạn"),
                bookingOverdue = BuildExitFixture("Booking quá hạn", bookingOverdueExit, "Xe booking quá hạn")
            }
        }, "Gate simulator fixtures loaded.");
    }
}
