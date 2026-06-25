using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Application.Audit;

namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public class ReservationService
    {
        private readonly ParkingDbContext _context;
        private readonly IAuditWriterService _auditWriter;

        public ReservationService(ParkingDbContext context, IAuditWriterService auditWriter)
        {
            _context = context;
            _auditWriter = auditWriter;
        }

        // ================= F078: SEARCH & SUGGEST LOCATIONS =================
        public async Task<AvailableLocationsResponse> GetAvailableLocationsAsync(long vehicleTypeId)
        {
            var vehicleType = await _context.VehicleTypes.FindAsync(vehicleTypeId);
            if (vehicleType == null)
                throw new KeyNotFoundException($"Vehicle type with ID {vehicleTypeId} not found.");

            // Get active pricing rule for the vehicle type
            var pricingRule = await _context.PricingRules
                .FirstOrDefaultAsync(pr => pr.VehicleTypeId == vehicleTypeId && pr.Status == "ACTIVE" && pr.EffectiveFrom <= DateTimeOffset.UtcNow);

            var hourlyPrice = pricingRule?.ReservationHourlyPrice ?? 0m;

            var response = new AvailableLocationsResponse
            {
                VehicleTypeId = vehicleTypeId,
                RequiresSlot = vehicleType.RequiresSlot,
                ReservationHourlyPrice = hourlyPrice
            };

            if (vehicleType.RequiresSlot)
            {
                // For Cars (RequiresSlot = true): Find AVAILABLE slots and filter out those with active reservations
                var activeReservationSlotIds = await _context.Reservations
                    .Where(r => r.Status == "PENDING" || r.Status == "CONFIRMED")
                    .Where(r => r.SlotId != null)
                    .Select(r => r.SlotId!.Value)
                    .ToListAsync();

                var slots = await _context.Slots
                    .Include(s => s.Area)
                    .ThenInclude(a => a.Floor)
                    .Where(s => s.AllowedVehicleTypeId == vehicleTypeId && s.Status == "AVAILABLE" && !activeReservationSlotIds.Contains(s.Id))
                    .ToListAsync();

                response.AvailableSlots = slots.Select(s => new AvailableSlotDto
                {
                    SlotId = s.Id,
                    SlotCode = s.SlotCode,
                    AreaId = s.AreaId,
                    AreaCode = s.Area.AreaCode,
                    AreaName = s.Area.AreaName,
                    FloorId = s.Area.FloorId,
                    FloorCode = s.Area.Floor.FloorCode,
                    FloorName = s.Area.Floor.FloorName
                }).ToList();
            }
            else
            {
                // For Motorbikes (RequiresSlot = false): Find Areas supporting this vehicle type with capacity
                var areas = await _context.Areas
                    .Include(a => a.Floor)
                    .Include(a => a.AreaVehicleTypes)
                    .Where(a => a.Status == "ACTIVE" && a.AreaVehicleTypes.Any(av => av.VehicleTypeId == vehicleTypeId))
                    .ToListAsync();

                response.AvailableAreas = areas
                    .Where(a => a.CurrentRealOccupancy + a.CurrentBookedSlots < a.TotalCapacity)
                    .Select(a => new AvailableAreaDto
                    {
                        AreaId = a.Id,
                        AreaCode = a.AreaCode,
                        AreaName = a.AreaName,
                        FloorId = a.FloorId,
                        FloorCode = a.Floor.FloorCode,
                        FloorName = a.Floor.FloorName,
                        AvailableCapacity = a.TotalCapacity - (a.CurrentRealOccupancy + a.CurrentBookedSlots),
                        TotalCapacity = a.TotalCapacity
                    }).ToList();
            }

            return response;
        }

        // ================= F079 & F080: CREATE RESERVATION =================
        public async Task<ReservationResponseDto> CreateReservationAsync(CreateReservationRequest request, long? userId)
        {
            if (string.IsNullOrWhiteSpace(request.PlateNumber))
                throw new ArgumentException("Plate number is required.");

            if (request.ReservedDurationMinutes <= 0)
                throw new ArgumentException("Reserved duration must be greater than 0.");

            var vehicleType = await _context.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null)
                throw new KeyNotFoundException($"Vehicle type with ID {request.VehicleTypeId} not found.");

            // Find active pricing rule
            var pricingRule = await _context.PricingRules
                .FirstOrDefaultAsync(pr => pr.VehicleTypeId == request.VehicleTypeId && pr.Status == "ACTIVE" && pr.EffectiveFrom <= DateTimeOffset.UtcNow);
            if (pricingRule == null)
                throw new InvalidOperationException("No active pricing rule found for this vehicle type.");

            var normalizedPlate = NormalizePlate(request.PlateNumber);

            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // Check duplicate pending reservations by plate
                    var hasPendingPlate = await _context.Reservations
                        .AnyAsync(r => r.NormalizedPlateNumber == normalizedPlate && r.Status == "PENDING");
                    if (hasPendingPlate)
                        throw new InvalidOperationException("This plate number already has a pending reservation.");

                    // Check duplicate pending reservations by vehicle ID if provided
                    if (request.VehicleId.HasValue)
                    {
                        var hasPendingVehicle = await _context.Reservations
                            .AnyAsync(r => r.VehicleId == request.VehicleId.Value && r.Status == "PENDING");
                        if (hasPendingVehicle)
                            throw new InvalidOperationException("This vehicle already has a pending reservation.");
                    }

                    // Check duplicate pending reservations for slot if requires slot
                    if (vehicleType.RequiresSlot)
                    {
                        if (!request.SlotId.HasValue)
                            throw new ArgumentException("SlotId is required for this vehicle type.");

                        var hasPendingSlot = await _context.Reservations
                            .AnyAsync(r => r.SlotId == request.SlotId.Value && r.Status == "PENDING");
                        if (hasPendingSlot)
                            throw new InvalidOperationException("This slot already has a pending reservation.");
                    }

                    Floor floor = await _context.Floors.FindAsync(request.FloorId);
                    if (floor == null)
                        throw new KeyNotFoundException("Floor not found.");

                    Area area = await _context.Areas
                        .Include(a => a.AreaVehicleTypes)
                        .FirstOrDefaultAsync(a => a.Id == request.AreaId);
                    if (area == null)
                        throw new KeyNotFoundException("Area not found.");

                    if (area.FloorId != request.FloorId)
                        throw new ArgumentException("Selected area does not belong to the selected floor.");

                    if (!area.AreaVehicleTypes.Any(av => av.VehicleTypeId == request.VehicleTypeId))
                        throw new ArgumentException("Selected area does not support this vehicle type.");

                    Slot? slot = null;
                    if (vehicleType.RequiresSlot)
                    {
                        slot = await _context.Slots.FindAsync(request.SlotId!.Value);
                        if (slot == null)
                            throw new KeyNotFoundException("Slot not found.");

                        if (slot.AreaId != request.AreaId)
                            throw new ArgumentException("Selected slot does not belong to the selected area.");

                        if (slot.AllowedVehicleTypeId != request.VehicleTypeId)
                            throw new ArgumentException("Selected slot does not allow this vehicle type.");

                        if (slot.Status != "AVAILABLE")
                            throw new InvalidOperationException("Selected slot is not available.");
                    }
                    else
                    {
                        if (request.SlotId.HasValue)
                            throw new ArgumentException("SlotId must be null for this vehicle type.");

                        // Area capacity check
                        if (area.CurrentRealOccupancy + area.CurrentBookedSlots >= area.TotalCapacity)
                            throw new InvalidOperationException("Selected area is full.");
                    }

                    // Calculate booking amount
                    var hourlyPrice = pricingRule.ReservationHourlyPrice;
                    var durationHours = (decimal)request.ReservedDurationMinutes / 60m;
                    var bookingAmount = hourlyPrice * durationHours;

                    // Generate unique reservation code
                    var dateStr = DateTimeOffset.UtcNow.ToString("yyyyMMdd");
                    var countToday = await _context.Reservations
                        .CountAsync(r => r.ReservationCode.StartsWith($"RES-{dateStr}-"));
                    var sequence = (countToday + 1).ToString("D4");
                    var reservationCode = $"RES-{dateStr}-{sequence}";

                    var now = DateTimeOffset.UtcNow;
                    var expiresAt = now.AddMinutes(request.ReservedDurationMinutes);

                    // If booking amount is 0, payment status is NOT_REQUIRED and status is CONFIRMED immediately
                    var paymentStatus = bookingAmount == 0m ? "NOT_REQUIRED" : "PENDING";
                    var status = bookingAmount == 0m ? "CONFIRMED" : "PENDING";

                    var reservation = new Reservation
                    {
                        ReservationCode = reservationCode,
                        DriverId = request.DriverId,
                        VehicleId = request.VehicleId,
                        PlateNumber = request.PlateNumber.Trim(),
                        NormalizedPlateNumber = normalizedPlate,
                        VehicleTypeId = request.VehicleTypeId,
                        FloorId = request.FloorId,
                        AreaId = request.AreaId,
                        SlotId = request.SlotId,
                        PricingRuleId = pricingRule.Id,
                        SnapshotReservationHourlyPrice = hourlyPrice,
                        ReservedDurationMinutes = request.ReservedDurationMinutes,
                        BookingAmount = bookingAmount,
                        PaymentStatus = paymentStatus,
                        ReservedAt = now,
                        ExpiresAt = expiresAt,
                        Status = status,
                        CreatedBy = userId,
                        CreatedAt = now,
                        UpdatedAt = now
                    };

                    _context.Reservations.Add(reservation);
                    await _context.SaveChangesAsync();

                    // Update slot and area occupancy
                    if (vehicleType.RequiresSlot && slot != null)
                    {
                        slot.Status = "RESERVED";
                    }
                    area.CurrentBookedSlots += 1;
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    // Audit Log
                    await _auditWriter.WriteAuditLogAsync(
                        action: "RESERVATION_CREATED",
                        targetType: "Reservation",
                        targetId: reservation.Id.ToString(),
                        actorUserId: userId,
                        newValue: $"Code: {reservationCode}, Plate: {normalizedPlate}, SlotId: {reservation.SlotId}, AreaId: {reservation.AreaId}"
                    );

                    return MapToResponseDto(reservation);
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        // ================= F081: EXTEND RESERVATION =================
        public async Task<ReservationResponseDto> ExtendReservationAsync(long id, ExtendReservationRequest request, long? userId)
        {
            if (request.AddedMinutes <= 0)
                throw new ArgumentException("Added minutes must be greater than 0.");

            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var reservation = await _context.Reservations
                        .Include(r => r.Area)
                        .FirstOrDefaultAsync(r => r.Id == id);

                    if (reservation == null)
                        throw new KeyNotFoundException($"Reservation with ID {id} not found.");

                    if (reservation.Status != "PENDING" && reservation.Status != "CONFIRMED")
                        throw new InvalidOperationException("Only reservations in PENDING or CONFIRMED status can be extended.");

                    // Find active pricing rule to check extension price
                    var pricingRule = await _context.PricingRules
                        .FirstOrDefaultAsync(pr => pr.VehicleTypeId == reservation.VehicleTypeId && pr.Status == "ACTIVE" && pr.EffectiveFrom <= DateTimeOffset.UtcNow);
                    
                    var hourlyPrice = pricingRule?.ReservationHourlyPrice ?? reservation.SnapshotReservationHourlyPrice;
                    var extensionAmount = hourlyPrice * ((decimal)request.AddedMinutes / 60m);

                    var oldExpires = reservation.ExpiresAt;
                    var newExpires = oldExpires.AddMinutes(request.AddedMinutes);

                    var extension = new ReservationExtension
                    {
                        ReservationId = reservation.Id,
                        OldExpiresAt = oldExpires,
                        NewExpiresAt = newExpires,
                        AddedMinutes = request.AddedMinutes,
                        PricingRuleId = pricingRule?.Id ?? reservation.PricingRuleId,
                        SnapshotReservationHourlyPrice = hourlyPrice,
                        Amount = extensionAmount,
                        RequestedBy = userId,
                        CreatedAt = DateTimeOffset.UtcNow,
                        UpdatedAt = DateTimeOffset.UtcNow
                    };

                    _context.ReservationExtensions.Add(extension);

                    // Update reservation
                    reservation.ExpiresAt = newExpires;
                    reservation.BookingAmount += extensionAmount;
                    reservation.ReservedDurationMinutes += request.AddedMinutes;
                    reservation.UpdatedAt = DateTimeOffset.UtcNow;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    // Audit Log
                    await _auditWriter.WriteAuditLogAsync(
                        action: "RESERVATION_EXTENDED",
                        targetType: "Reservation",
                        targetId: reservation.Id.ToString(),
                        actorUserId: userId,
                        newValue: $"New Expires At: {newExpires:yyyy-MM-dd HH:mm:ss}, Added Minutes: {request.AddedMinutes}, Extension Amount: {extensionAmount}"
                    );

                    return MapToResponseDto(reservation);
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        // ================= F082: CANCEL RESERVATION =================
        public async Task<ReservationResponseDto> CancelReservationAsync(long id, CancelReservationRequest request, long? userId)
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var reservation = await _context.Reservations
                        .Include(r => r.Area)
                        .Include(r => r.Slot)
                        .FirstOrDefaultAsync(r => r.Id == id);

                    if (reservation == null)
                        throw new KeyNotFoundException($"Reservation with ID {id} not found.");

                    if (reservation.Status != "PENDING" && reservation.Status != "CONFIRMED")
                        throw new InvalidOperationException("Only reservations in PENDING or CONFIRMED status can be cancelled.");

                    var oldValue = $"Status: {reservation.Status}";

                    // Update Reservation
                    reservation.Status = "CANCELLED";
                    reservation.CancelledAt = DateTimeOffset.UtcNow;
                    reservation.CancelledBy = userId;
                    reservation.CancellationReason = request.Reason?.Trim();
                    reservation.UpdatedAt = DateTimeOffset.UtcNow;

                    // Release slot and capacity
                    if (reservation.SlotId.HasValue && reservation.Slot != null)
                    {
                        reservation.Slot.Status = "AVAILABLE";
                    }

                    if (reservation.Area.CurrentBookedSlots > 0)
                    {
                        reservation.Area.CurrentBookedSlots -= 1;
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    // Audit Log
                    await _auditWriter.WriteAuditLogAsync(
                        action: "RESERVATION_CANCELLED",
                        targetType: "Reservation",
                        targetId: reservation.Id.ToString(),
                        actorUserId: userId,
                        oldValue: oldValue,
                        newValue: "Status: CANCELLED",
                        reason: request.Reason
                    );

                    return MapToResponseDto(reservation);
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        // ================= BACKGROUND WORKER: EXPIRE RESERVATIONS =================
        public async Task<int> ExpireReservationsAsync()
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                var expiredList = await _context.Reservations
                    .Include(r => r.Area)
                    .Include(r => r.Slot)
                    .Where(r => (r.Status == "PENDING" || r.Status == "CONFIRMED") && r.ExpiresAt < DateTimeOffset.UtcNow)
                    .ToListAsync();

                if (!expiredList.Any()) return 0;

                int count = 0;
                foreach (var reservation in expiredList)
                {
                    using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        var oldValue = $"Status: {reservation.Status}";

                        reservation.Status = "EXPIRED";
                        reservation.UpdatedAt = DateTimeOffset.UtcNow;

                        // Release slot and capacity
                        if (reservation.SlotId.HasValue && reservation.Slot != null)
                        {
                            reservation.Slot.Status = "AVAILABLE";
                        }

                        if (reservation.Area.CurrentBookedSlots > 0)
                        {
                            reservation.Area.CurrentBookedSlots -= 1;
                        }

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();

                        count++;

                        // Audit Log
                        await _auditWriter.WriteAuditLogAsync(
                            action: "RESERVATION_EXPIRED",
                            targetType: "Reservation",
                            targetId: reservation.Id.ToString(),
                            oldValue: oldValue,
                            newValue: "Status: EXPIRED",
                            reason: "Reservation hold duration expired without check-in."
                        );
                    }
                    catch (Exception)
                    {
                        await transaction.RollbackAsync();
                        // Log error and continue to other expired bookings to prevent blocking the worker
                    }
                }

                return count;
            });
        }

        // ================= HELPERS = null =================
        private string NormalizePlate(string plate)
        {
            if (string.IsNullOrWhiteSpace(plate)) return string.Empty;
            return plate.Trim().Replace("-", "").Replace(".", "").Replace(" ", "").ToUpper();
        }

        private ReservationResponseDto MapToResponseDto(Reservation r)
        {
            return new ReservationResponseDto
            {
                Id = r.Id,
                ReservationCode = r.ReservationCode,
                DriverId = r.DriverId,
                VehicleId = r.VehicleId,
                PlateNumber = r.PlateNumber,
                NormalizedPlateNumber = r.NormalizedPlateNumber,
                VehicleTypeId = r.VehicleTypeId,
                FloorId = r.FloorId,
                AreaId = r.AreaId,
                SlotId = r.SlotId,
                PricingRuleId = r.PricingRuleId,
                SnapshotReservationHourlyPrice = r.SnapshotReservationHourlyPrice,
                ReservedDurationMinutes = r.ReservedDurationMinutes,
                BookingAmount = r.BookingAmount,
                PaymentStatus = r.PaymentStatus,
                ReservedAt = r.ReservedAt,
                ExpiresAt = r.ExpiresAt,
                CheckedInAt = r.CheckedInAt,
                CheckedInBy = r.CheckedInBy,
                CancelledAt = r.CancelledAt,
                Status = r.Status,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            };
        }
    }

    // ================= DTO CLASSES =================
    public class AvailableLocationsResponse
    {
        public long VehicleTypeId { get; set; }
        public bool RequiresSlot { get; set; }
        public decimal ReservationHourlyPrice { get; set; }
        public List<AvailableSlotDto> AvailableSlots { get; set; } = new();
        public List<AvailableAreaDto> AvailableAreas { get; set; } = new();
    }

    public class AvailableSlotDto
    {
        public long SlotId { get; set; }
        public string SlotCode { get; set; } = null!;
        public long AreaId { get; set; }
        public string AreaCode { get; set; } = null!;
        public string AreaName { get; set; } = null!;
        public long FloorId { get; set; }
        public string FloorCode { get; set; } = null!;
        public string FloorName { get; set; } = null!;
    }

    public class AvailableAreaDto
    {
        public long AreaId { get; set; }
        public string AreaCode { get; set; } = null!;
        public string AreaName { get; set; } = null!;
        public long FloorId { get; set; }
        public string FloorCode { get; set; } = null!;
        public string FloorName { get; set; } = null!;
        public int AvailableCapacity { get; set; }
        public int TotalCapacity { get; set; }
    }

    public class CreateReservationRequest
    {
        public long? DriverId { get; set; }
        public long? VehicleId { get; set; }
        public string PlateNumber { get; set; } = string.Empty;
        public long VehicleTypeId { get; set; }
        public long FloorId { get; set; }
        public long AreaId { get; set; }
        public long? SlotId { get; set; }
        public int ReservedDurationMinutes { get; set; }
    }

    public class ExtendReservationRequest
    {
        public int AddedMinutes { get; set; }
    }

    public class CancelReservationRequest
    {
        public string? Reason { get; set; }
    }

    public class ReservationResponseDto
    {
        public long Id { get; set; }
        public string ReservationCode { get; set; } = string.Empty;
        public long? DriverId { get; set; }
        public long? VehicleId { get; set; }
        public string PlateNumber { get; set; } = string.Empty;
        public string NormalizedPlateNumber { get; set; } = string.Empty;
        public long VehicleTypeId { get; set; }
        public long FloorId { get; set; }
        public long AreaId { get; set; }
        public long? SlotId { get; set; }
        public long? PricingRuleId { get; set; }
        public decimal SnapshotReservationHourlyPrice { get; set; }
        public int ReservedDurationMinutes { get; set; }
        public decimal BookingAmount { get; set; }
        public string PaymentStatus { get; set; } = "PENDING";
        public DateTimeOffset ReservedAt { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
        public DateTimeOffset? CheckedInAt { get; set; }
        public long? CheckedInBy { get; set; }
        public DateTimeOffset? CancelledAt { get; set; }
        public string Status { get; set; } = "PENDING";
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }
}
