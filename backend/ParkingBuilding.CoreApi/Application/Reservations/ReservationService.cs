using System;
using Microsoft.AspNetCore.Http;
using ParkingBuilding.CoreApi.Contracts.Common;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Application.Payments;
using Microsoft.Extensions.Options;

namespace ParkingBuilding.CoreApi.Application.Reservations
{
    public class ReservationService
    {
        private readonly ParkingDbContext _context;
        private readonly IAuditWriterService _auditWriter;
        private readonly IReservationEntryTokenService _tokenService;
        private readonly IPayOsPaymentService _payOsPaymentService;
        private readonly ReservationBookingOptions _bookingOptions;

        public ReservationService(
            ParkingDbContext context,
            IAuditWriterService auditWriter,
            IReservationEntryTokenService tokenService,
            IPayOsPaymentService payOsPaymentService,
            IOptions<ReservationBookingOptions> bookingOptions)
        {
            _context = context;
            _auditWriter = auditWriter;
            _tokenService = tokenService;
            _payOsPaymentService = payOsPaymentService;
            _bookingOptions = bookingOptions.Value;
        }

        // ================= F078: SEARCH & SUGGEST LOCATIONS =================
        public async Task<AvailableLocationsResponse> GetAvailableLocationsAsync(long vehicleTypeId)
        {
            var vehicleType = await _context.VehicleTypes.FindAsync(vehicleTypeId);
            if (vehicleType == null)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound, StatusCodes.Status404NotFound);

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
        private async Task<long> ResolveDriverIdAsync(
            CreateReservationRequest request,
            long actorUserId,
            string actorRole)
        {
            if (actorRole == "DRIVER")
            {
                var profile = await _context.DriverProfiles
                    .FirstOrDefaultAsync(d => d.UserId == actorUserId);

                if (profile == null)
                    throw new BusinessException(ErrorCodes.DriverProfileNotFound);

                return profile.Id;
            }

            if (!request.DriverId.HasValue)
                throw new BusinessException(ErrorCodes.DriverIdRequiredForStaffBooking);

            var driverExists = await _context.DriverProfiles
                .AnyAsync(d => d.Id == request.DriverId.Value);

            if (!driverExists)
                throw new BusinessException(ErrorCodes.DriverProfileNotFound);

            return request.DriverId.Value;
        }

        public async Task<CreateReservationResponseDto> CreateReservationAsync(
            CreateReservationRequest request,
            long actorUserId,
            string actorRole)
        {
            if (request.ReservedDurationMinutes <= 0)
                throw new BusinessException(ErrorCodes.ReservationDurationInvalid);

            if (request.ReservedDurationMinutes % 60 != 0)
                throw new BusinessException(ErrorCodes.ReservationDurationMustBeWholeHours);

            var reservedHours = request.ReservedDurationMinutes / 60;

            var vehicleType = await _context.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound, StatusCodes.Status404NotFound);

            // Find active pricing rule
            var pricingRule = await _context.PricingRules
                .FirstOrDefaultAsync(pr => pr.VehicleTypeId == request.VehicleTypeId && pr.Status == "ACTIVE" && pr.EffectiveFrom <= DateTimeOffset.UtcNow);
            if (pricingRule == null)
                throw new BusinessException(ErrorCodes.PricingRuleNotFound, StatusCodes.Status404NotFound);

            if (reservedHours > pricingRule.MaxReservationHours)
                throw new BusinessException(ErrorCodes.ReservationDurationExceedsLimit);

            // Calculate booking amount
            var hourlyPrice = pricingRule.ReservationHourlyPrice;
            if (hourlyPrice <= 0m && !_bookingOptions.AllowZeroBookingFee)
                throw new BusinessException(ErrorCodes.ReservationPricingNotConfigured);

            if (hourlyPrice != decimal.Truncate(hourlyPrice))
                throw new BusinessException(ErrorCodes.ReservationHourlyPriceMustBeInteger);

            var bookingAmount = hourlyPrice * reservedHours;

            if (bookingAmount != decimal.Truncate(bookingAmount))
                throw new BusinessException(ErrorCodes.ReservationBookingAmountMustBeInteger);

            if (bookingAmount <= 0m && !_bookingOptions.AllowZeroBookingFee)
                throw new BusinessException(ErrorCodes.ReservationBookingFeeRequired);

            Reservation reservation = null!;
            Payment? payment = null;

            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    long resolvedDriverId = await ResolveDriverIdAsync(request, actorUserId, actorRole);

                    // Check vehicle if provided
                    if (request.VehicleId.HasValue)
                    {
                        var vehicle = await _context.Vehicles
                            .FirstOrDefaultAsync(v => v.Id == request.VehicleId.Value);

                        if (vehicle == null)
                            throw new BusinessException(ErrorCodes.VehicleNotFound);

                        if (vehicle.DriverId != resolvedDriverId)
                            throw new BusinessException(ErrorCodes.VehicleNotBelongToDriver);

                        if (vehicle.VehicleTypeId != request.VehicleTypeId)
                            throw new BusinessException(ErrorCodes.VehicleTypeMismatch);
                    }

                    // Resolve plate number
                    string? plateNumber = request.PlateNumber;
                    if (string.IsNullOrWhiteSpace(plateNumber) && request.VehicleId.HasValue)
                    {
                        var vehicle = await _context.Vehicles.FindAsync(request.VehicleId.Value);
                        plateNumber = vehicle?.PlateNumber;
                    }

                    string? normalizedPlate = null;
                    if (!string.IsNullOrWhiteSpace(plateNumber))
                    {
                        plateNumber = plateNumber.Trim();
                        normalizedPlate = NormalizePlate(plateNumber);
                    }

                    // Check duplicate pending/confirmed reservations by plate if plate is provided
                    if (!string.IsNullOrWhiteSpace(normalizedPlate))
                    {
                        var activePlateReservationExists = await _context.Reservations
                            .AnyAsync(r => r.NormalizedPlateNumber == normalizedPlate &&
                                           r.VehicleTypeId == request.VehicleTypeId &&
                                           (r.Status == "PENDING" || r.Status == "CONFIRMED"));
                        if (activePlateReservationExists)
                            throw new BusinessException(ErrorCodes.PlateAlreadyHasActiveReservation);
                    }

                    // Check duplicate pending/confirmed reservations by vehicle ID if provided
                    if (request.VehicleId.HasValue)
                    {
                        var hasPendingVehicle = await _context.Reservations
                            .AnyAsync(r => r.VehicleId == request.VehicleId.Value && (r.Status == "PENDING" || r.Status == "CONFIRMED"));
                        if (hasPendingVehicle)
                            throw new BusinessException(ErrorCodes.VehicleAlreadyHasActiveReservation);
                    }

                    // Check duplicate pending/confirmed reservations for slot if requires slot
                    if (vehicleType.RequiresSlot)
                    {
                        if (!request.SlotId.HasValue)
                            throw new BusinessException(ErrorCodes.SlotRequired);

                        var hasPendingSlot = await _context.Reservations
                            .AnyAsync(r => r.SlotId == request.SlotId.Value && (r.Status == "PENDING" || r.Status == "CONFIRMED"));
                        if (hasPendingSlot)
                            throw new BusinessException(ErrorCodes.ReservationSlotAlreadyReserved);
                    }

                    var floor = await _context.Floors.FindAsync(request.FloorId);
                    if (floor == null)
                        throw new BusinessException(ErrorCodes.FloorNotFound, StatusCodes.Status404NotFound);

                    // Concurrency lock: Select Area FOR UPDATE
                    var area = await _context.Areas
                        .FromSqlRaw("SELECT * FROM areas WHERE id = {0} FOR UPDATE", request.AreaId)
                        .FirstOrDefaultAsync();
                    if (area == null)
                        throw new BusinessException(ErrorCodes.AreaNotFound, StatusCodes.Status404NotFound);

                    await _context.Entry(area).Collection(a => a.AreaVehicleTypes).LoadAsync();

                    if (area.FloorId != request.FloorId)
                        throw new BusinessException(ErrorCodes.AreaFloorMismatch);

                    if (area.Status != "ACTIVE")
                        throw new BusinessException(ErrorCodes.SelectedAreaNotActive);

                    if (!area.AreaVehicleTypes.Any(av => av.VehicleTypeId == request.VehicleTypeId))
                        throw new BusinessException(ErrorCodes.AreaVehicleTypeMismatch);

                    Slot? slot = null;
                    if (vehicleType.RequiresSlot)
                    {
                        // Concurrency lock: Select Slot FOR UPDATE
                        slot = await _context.Slots
                            .FromSqlRaw("SELECT * FROM slots WHERE id = {0} FOR UPDATE", request.SlotId!.Value)
                            .FirstOrDefaultAsync();
                        if (slot == null)
                            throw new BusinessException(ErrorCodes.SlotNotFound, StatusCodes.Status404NotFound);

                        if (slot.AreaId != request.AreaId)
                            throw new BusinessException(ErrorCodes.SlotAreaMismatch);

                        if (slot.AllowedVehicleTypeId != request.VehicleTypeId)
                            throw new BusinessException(ErrorCodes.SlotNotAllowedForVehicleType);

                        if (slot.Status != "AVAILABLE")
                            throw new BusinessException(ErrorCodes.ReservationSlotAlreadyReserved);
                    }
                    else
                    {
                        if (request.SlotId.HasValue)
                            throw new BusinessException(ErrorCodes.SlotMustBeNullForAreaManagedVehicle);

                        // Area capacity check
                        if (area.CurrentRealOccupancy + area.CurrentBookedSlots >= area.TotalCapacity)
                            throw new BusinessException(ErrorCodes.ReservationAreaFull);
                    }

                    var reservationCode = GenerateReservationCode();

                    var now = DateTimeOffset.UtcNow;
                    var expiresAt = now.AddMinutes(request.ReservedDurationMinutes);
                    var paymentDeadline = now.AddMinutes(_bookingOptions.PaymentDeadlineMinutes);

                    // Setup statuses
                    var paymentStatus = bookingAmount == 0m ? "NOT_REQUIRED" : "PENDING";
                    var status = bookingAmount == 0m ? "CONFIRMED" : "PENDING";
                    var confirmedAt = bookingAmount == 0m ? (DateTimeOffset?)now : null;

                    reservation = new Reservation
                    {
                        ReservationCode = reservationCode,
                        DriverId = resolvedDriverId,
                        VehicleId = request.VehicleId,
                        PlateNumber = plateNumber,
                        NormalizedPlateNumber = normalizedPlate,
                        VehicleTypeId = request.VehicleTypeId,
                        FloorId = request.FloorId,
                        AreaId = request.AreaId,
                        SlotId = request.SlotId,
                        PricingRuleId = pricingRule.Id,
                        SnapshotReservationHourlyPrice = hourlyPrice,
                        ReservedDurationMinutes = reservedHours * 60,
                        BookingAmount = bookingAmount,
                        PaymentStatus = paymentStatus,
                        ReservedAt = now,
                        ExpiresAt = expiresAt,
                        PaymentDeadline = paymentDeadline,
                        ConfirmedAt = confirmedAt,
                        Status = status,
                        CreatedBy = actorUserId,
                        CreatedAt = now,
                        UpdatedAt = now
                    };

                    _context.Reservations.Add(reservation);
                    await _context.SaveChangesAsync();

                    if (bookingAmount > 0m)
                    {
                        payment = new Payment
                        {
                            ReservationId = reservation.Id,
                            Amount = bookingAmount,
                            LostCardFee = 0m,
                            TotalAmount = bookingAmount,
                            Purpose = "RESERVATION_FEE",
                            Method = "BANK_TRANSFER",
                            Status = "PENDING",
                            Provider = "PAYOS",
                            ReceivedAmount = 0m,
                            FeeCalculatedAt = now,
                            PaymentValidUntil = paymentDeadline,
                            ExpiredAt = paymentDeadline,
                            CreatedAt = now,
                            UpdatedAt = now
                        };

                        _context.Payments.Add(payment);
                        await _context.SaveChangesAsync();
                    }

                    // Update slot and area occupancy immediately
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
                        actorUserId: actorUserId,
                        newValue: $"Code: {reservationCode}, Plate: {normalizedPlate}, SlotId: {reservation.SlotId}, AreaId: {reservation.AreaId}"
                    );
                }
                catch (Exception)
                {
                    try { await transaction.RollbackAsync(); } catch {}
                    throw;
                }
            });

            PayOsPaymentResponse? paymentResponse = null;
            if (bookingAmount > 0m && payment != null)
            {
                try
                {
                    paymentResponse = await _payOsPaymentService.CreateReservationPaymentLinkAsync(payment, reservation);
                }
                catch (Exception ex)
                {
                    // Step C: Open a new transaction, cancel payment + reservation and release slot/area lock
                    var recoverStrategy = _context.Database.CreateExecutionStrategy();
                    await recoverStrategy.ExecuteAsync(async () =>
                    {
                        using var recoverTransaction = await _context.Database.BeginTransactionAsync();
                        try
                        {
                            var resToCancel = await _context.Reservations
                                .Include(r => r.Slot)
                                .Include(r => r.Area)
                                .FirstOrDefaultAsync(r => r.Id == reservation.Id);

                            if (resToCancel != null)
                            {
                                var previousStatus = resToCancel.Status;
                                resToCancel.Status = "CANCELLED";
                                resToCancel.PaymentStatus = "FAILED";
                                resToCancel.UpdatedAt = DateTimeOffset.UtcNow;
                                resToCancel.CancelledAt = DateTimeOffset.UtcNow;
                                resToCancel.CancellationReason = "PayOS payment link creation failed.";

                                ReleaseReservationHold(resToCancel, previousStatus);
                            }

                            var payToCancel = await _context.Payments.FindAsync(payment.Id);
                            if (payToCancel != null)
                            {
                                payToCancel.Status = "FAILED";
                                payToCancel.UpdatedAt = DateTimeOffset.UtcNow;
                            }

                            await _context.SaveChangesAsync();
                            await recoverTransaction.CommitAsync();

                            // Audit Log
                            await _auditWriter.WriteAuditLogAsync(
                                action: "PAYOS_CREATE_LINK_FAILED",
                                targetType: "Reservation",
                                targetId: reservation.Id.ToString(),
                                actorUserId: actorUserId,
                                newValue: $"Reservation status set to CANCELLED due to PayOS link failure. Error: {ex.Message}"
                            );
                        }
                        catch
                        {
                            try { await recoverTransaction.RollbackAsync(); } catch {}
                        }
                    });

                    throw new BusinessException(ErrorCodes.PayOsCreateLinkFailed);
                }
            }

            var resDto = new ReservationDto
            {
                Id = reservation.Id,
                ReservationCode = reservation.ReservationCode,
                Status = reservation.Status,
                PaymentStatus = reservation.PaymentStatus,
                BookingAmount = reservation.BookingAmount,
                PaymentDeadline = reservation.PaymentDeadline,
                ExpiresAt = reservation.ExpiresAt,
                DriverId = reservation.DriverId,
                VehicleId = reservation.VehicleId,
                PlateNumber = reservation.PlateNumber,
                NormalizedPlateNumber = reservation.NormalizedPlateNumber,
                VehicleTypeId = reservation.VehicleTypeId,
                FloorId = reservation.FloorId,
                AreaId = reservation.AreaId,
                SlotId = reservation.SlotId
            };

            return new CreateReservationResponseDto
            {
                Reservation = resDto,
                Payment = paymentResponse
            };
        }

        // ================= F081: EXTEND RESERVATION =================
        public async Task<ReservationResponseDto> ExtendReservationAsync(long id, ExtendReservationRequest request, long? userId)
        {
            if (request.AddedMinutes <= 0)
                throw new BusinessException(ErrorCodes.ReservationExtensionMinutesInvalid);

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
                        throw new BusinessException(ErrorCodes.ReservationNotFound, StatusCodes.Status404NotFound);

                    if (reservation.Status != "PENDING" && reservation.Status != "CONFIRMED")
                        throw new BusinessException(ErrorCodes.ReservationNotExtendable);

                    // Find active pricing rule to check extension price
                    var pricingRule = await _context.PricingRules
                        .FirstOrDefaultAsync(pr => pr.VehicleTypeId == reservation.VehicleTypeId && pr.Status == "ACTIVE" && pr.EffectiveFrom <= DateTimeOffset.UtcNow);
                    
                    var hourlyPrice = pricingRule?.ReservationHourlyPrice ?? reservation.SnapshotReservationHourlyPrice;
                    var extensionAmount = hourlyPrice * ((decimal)request.AddedMinutes / 60m);

                    var oldExpires = reservation.ExpiresAt;
                    var newExpires = oldExpires.AddMinutes(request.AddedMinutes);

                    Payment? payment = null;

                    if (extensionAmount > 0m)
                    {
                        var now = DateTimeOffset.UtcNow;
                        var paymentDeadline = now.AddMinutes(_bookingOptions.PaymentDeadlineMinutes);

                        payment = new Payment
                        {
                            ReservationId = reservation.Id,
                            Amount = extensionAmount,
                            LostCardFee = 0m,
                            TotalAmount = extensionAmount,
                            Purpose = "RESERVATION_EXTENSION",
                            Method = "BANK_TRANSFER",
                            Status = "PENDING",
                            Provider = "PAYOS",
                            ReceivedAmount = 0m,
                            FeeCalculatedAt = now,
                            PaymentValidUntil = paymentDeadline,
                            ExpiredAt = paymentDeadline,
                            CreatedAt = now,
                            UpdatedAt = now
                        };

                        _context.Payments.Add(payment);
                        await _context.SaveChangesAsync();

                        reservation.PaymentStatus = "PENDING";
                        reservation.UpdatedAt = now;
                        await _context.SaveChangesAsync();
                    }

                    var extension = new ReservationExtension
                    {
                        ReservationId = reservation.Id,
                        OldExpiresAt = oldExpires,
                        NewExpiresAt = newExpires,
                        AddedMinutes = request.AddedMinutes,
                        PricingRuleId = pricingRule?.Id ?? reservation.PricingRuleId,
                        SnapshotReservationHourlyPrice = hourlyPrice,
                        Amount = extensionAmount,
                        PaymentId = payment?.Id, // Link to payment!
                        RequestedBy = userId,
                        CreatedAt = DateTimeOffset.UtcNow,
                        UpdatedAt = DateTimeOffset.UtcNow
                    };

                    _context.ReservationExtensions.Add(extension);

                    // If extension is free (extensionAmount == 0), update reservation directly!
                    if (extensionAmount == 0m)
                    {
                        reservation.ExpiresAt = newExpires;
                        reservation.ReservedDurationMinutes += request.AddedMinutes;
                        reservation.UpdatedAt = DateTimeOffset.UtcNow;
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    PayOsPaymentResponse? paymentResponse = null;
                    if (extensionAmount > 0m && payment != null)
                    {
                        try
                        {
                            paymentResponse = await _payOsPaymentService.CreateReservationPaymentLinkAsync(payment, reservation);
                        }
                        catch (Exception)
                        {
                            // If payment link creation fails, roll back extension
                            var recoverStrategy = _context.Database.CreateExecutionStrategy();
                            await recoverStrategy.ExecuteAsync(async () =>
                            {
                                using var recoverTransaction = await _context.Database.BeginTransactionAsync();
                                try
                                {
                                    var extToCancel = await _context.ReservationExtensions.FirstOrDefaultAsync(re => re.PaymentId == payment.Id);
                                    if (extToCancel != null)
                                    {
                                        _context.ReservationExtensions.Remove(extToCancel);
                                    }

                                    var payToCancel = await _context.Payments.FindAsync(payment.Id);
                                    if (payToCancel != null)
                                    {
                                        payToCancel.Status = "FAILED";
                                        payToCancel.UpdatedAt = DateTimeOffset.UtcNow;
                                    }

                                    var resToRestore = await _context.Reservations.FindAsync(reservation.Id);
                                    if (resToRestore != null)
                                    {
                                        resToRestore.PaymentStatus = "PAID"; // restore previous status
                                        resToRestore.UpdatedAt = DateTimeOffset.UtcNow;
                                    }

                                    await _context.SaveChangesAsync();
                                    await recoverTransaction.CommitAsync();
                                }
                                catch
                                {
                                    try { await recoverTransaction.RollbackAsync(); } catch {}
                                }
                            });

                            throw new BusinessException(ErrorCodes.PayOsCreateLinkFailed);
                        }
                    }

                    // Audit Log
                    await _auditWriter.WriteAuditLogAsync(
                        action: "RESERVATION_EXTENSION_REQUESTED",
                        targetType: "Reservation",
                        targetId: reservation.Id.ToString(),
                        actorUserId: userId,
                        newValue: $"New Expires At: {newExpires:yyyy-MM-dd HH:mm:ss}, Added Minutes: {request.AddedMinutes}, Extension Amount: {extensionAmount}, PaymentId: {payment?.Id}"
                    );

                    var response = MapToResponseDto(reservation);
                    response.Payment = paymentResponse;
                    return response;
                }
                catch (Exception)
                {
                    try { await transaction.RollbackAsync(); } catch {}
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
                var reservation = await _context.Reservations
                    .Include(r => r.Area)
                    .Include(r => r.Slot)
                    .Include(r => r.Extensions)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (reservation == null)
                    throw new BusinessException(ErrorCodes.ReservationNotFound, StatusCodes.Status404NotFound);

                if (reservation.Status != "PENDING" && reservation.Status != "CONFIRMED")
                    throw new BusinessException(ErrorCodes.ReservationNotCancellable);

                if (reservation.CheckedInAt != null || reservation.Status == "COMPLETED")
                    throw new BusinessException(ErrorCodes.ReservationNotCancellable);

                var oldValue = $"Status: {reservation.Status}, PaymentStatus: {reservation.PaymentStatus}";
                var previousReservationStatus = reservation.Status;
                var pendingPayments = new List<Payment>();
                var providerCancellations = new List<PayOsProviderCancellation>();

                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    try
                    {
                        // Update Reservation
                        reservation.Status = "CANCELLED";
                        reservation.CancelledAt = DateTimeOffset.UtcNow;
                        reservation.CancelledBy = userId;
                        reservation.CancellationReason = request.Reason?.Trim();
                        reservation.UpdatedAt = DateTimeOffset.UtcNow;

                        if (reservation.PaymentStatus == "PENDING")
                        {
                            reservation.PaymentStatus = "CANCELLED";

                            pendingPayments = await _context.Payments
                                .Where(p => p.ReservationId == reservation.Id && p.Status == "PENDING")
                                .ToListAsync();

                            providerCancellations = pendingPayments
                                .Where(p => p.Provider == "PAYOS")
                                .Select(p => new PayOsProviderCancellation(p.ProviderTransactionId, p.GatewayPayload))
                                .ToList();

                            foreach (var payment in pendingPayments)
                            {
                                payment.Status = "CANCELLED";
                                payment.UpdatedAt = DateTimeOffset.UtcNow;
                            }
                        }

                        ReleaseReservationHold(reservation, previousReservationStatus);

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                    }
                    catch (Exception)
                    {
                        try { await transaction.RollbackAsync(); } catch {}
                        throw;
                    }
                }

                // Call payOS cancel link best-effort AFTER commit
                foreach (var cancellation in providerCancellations)
                {
                    try
                    {
                        await _payOsPaymentService.CancelProviderPaymentLinkAsync(
                            cancellation.ProviderTransactionId,
                            cancellation.GatewayPayload,
                            "Reservation cancelled.");
                    }
                    catch
                    {
                        // Best effort
                    }
                }

                // Audit Log
                await _auditWriter.WriteAuditLogAsync(
                    action: "RESERVATION_CANCELLED",
                    targetType: "Reservation",
                    targetId: reservation.Id.ToString(),
                    actorUserId: userId,
                    oldValue: oldValue,
                    newValue: $"Status: CANCELLED, PaymentStatus: {reservation.PaymentStatus}",
                    reason: request.Reason
                );

                return MapToResponseDto(reservation);
            });
        }

        public async Task<ReservationPaymentStatusResponse> GetPaymentStatusAsync(long reservationId)
        {
            var reservation = await _context.Reservations
                .FirstOrDefaultAsync(r => r.Id == reservationId);

            if (reservation == null)
            {
                throw new BusinessException(ErrorCodes.ReservationNotFound, StatusCodes.Status404NotFound);
            }

            var payment = await _context.Payments
                .Where(p => p.ReservationId == reservationId)
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefaultAsync();

            if (payment != null
                && payment.Provider == "PAYOS"
                && payment.Status != "PAID")
            {
                payment = await _context.Payments
                    .Include(p => p.Reservation)
                    .Where(p => p.Id == payment.Id)
                    .FirstOrDefaultAsync();

                if (payment != null)
                {
                    var reconciled = await _payOsPaymentService.TryReconcileReservationPaymentAsync(payment);
                    if (reconciled)
                    {
                        reservation = payment.Reservation ?? reservation;
                    }
                }
            }

            var now = DateTimeOffset.UtcNow;
            var deadline = reservation.PaymentDeadline ?? payment?.ExpiredAt;
            var remainingSeconds = 0;
            var isExpired = false;

            if (deadline.HasValue)
            {
                remainingSeconds = Math.Max(0, (int)(deadline.Value - now).TotalSeconds);
                isExpired = now > deadline.Value || reservation.Status == "EXPIRED";
            }
            else
            {
                isExpired = reservation.Status == "EXPIRED";
            }

            string? qrCode = null;
            if (payment?.GatewayPayload != null)
            {
                try
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(payment.GatewayPayload);
                    if (doc.RootElement.TryGetProperty("qrCode", out var qrProp))
                    {
                        qrCode = qrProp.GetString();
                    }
                }
                catch
                {
                    // Ignore parse error
                }
            }

            return new ReservationPaymentStatusResponse
            {
                ReservationId = reservation.Id,
                ReservationCode = reservation.ReservationCode,
                ReservationStatus = reservation.Status,
                PaymentStatus = reservation.PaymentStatus,
                BookingAmount = reservation.BookingAmount,
                PaymentId = payment?.Id,
                Provider = payment?.Provider,
                ProviderTransactionId = payment?.ProviderTransactionId,
                CheckoutUrl = payment?.Status == "PENDING" ? payment?.PaymentUrl : null,
                QrCode = payment?.Status == "PENDING" ? qrCode : null,
                PaymentExpiredAt = payment?.ExpiredAt,
                PaidAt = payment?.PaidAt,
                PaymentDeadline = reservation.PaymentDeadline,
                RemainingSeconds = remainingSeconds,
                IsExpired = isExpired
            };
        }

        // ================= BACKGROUND WORKER: EXPIRE RESERVATIONS =================
        public async Task<int> ExpireReservationsAsync()
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                var now = DateTimeOffset.UtcNow;

                // Case 1: Pending payment expired
                var case1List = await _context.Reservations
                    .Include(r => r.Area)
                    .Include(r => r.Slot)
                    .Where(r => r.Status == "PENDING" && r.PaymentStatus == "PENDING" && r.PaymentDeadline != null && r.PaymentDeadline < now)
                    .ToListAsync();

                // Case 2: Confirmed reservation expired before check-in
                var case2List = await _context.Reservations
                    .Include(r => r.Area)
                    .Include(r => r.Slot)
                    .Where(r => r.Status == "CONFIRMED" && r.ExpiresAt < now && r.CheckedInAt == null)
                    .ToListAsync();

                int count = 0;

                // Process Case 1
                foreach (var reservation in case1List)
                {
                    var pendingPayments = new List<Payment>();
                    var providerCancellations = new List<PayOsProviderCancellation>();
                    var oldValue = $"Status: {reservation.Status}, PaymentStatus: {reservation.PaymentStatus}";
                    var previousReservationStatus = reservation.Status;

                    using (var transaction = await _context.Database.BeginTransactionAsync())
                    {
                        try
                        {
                            reservation.Status = "EXPIRED";
                            reservation.PaymentStatus = "CANCELLED";
                            reservation.UpdatedAt = now;

                            pendingPayments = await _context.Payments
                                .Where(p => p.ReservationId == reservation.Id && p.Status == "PENDING")
                                .ToListAsync();

                            providerCancellations = pendingPayments
                                .Where(p => p.Provider == "PAYOS")
                                .Select(p => new PayOsProviderCancellation(p.ProviderTransactionId, p.GatewayPayload))
                                .ToList();

                            foreach (var payment in pendingPayments)
                            {
                                payment.Status = "CANCELLED";
                                payment.UpdatedAt = now;
                            }

                            ReleaseReservationHold(reservation, previousReservationStatus);

                            await _context.SaveChangesAsync();
                            await transaction.CommitAsync();
                        }
                        catch (Exception)
                        {
                            try { await transaction.RollbackAsync(); } catch {}
                            continue;
                        }
                    }

                    // Best effort payOS cancel after DB commit
                    foreach (var cancellation in providerCancellations)
                    {
                        try
                        {
                            await _payOsPaymentService.CancelProviderPaymentLinkAsync(
                                cancellation.ProviderTransactionId,
                                cancellation.GatewayPayload,
                                "Reservation hold duration expired without payment.");
                        }
                        catch
                        {
                            // Best-effort
                        }
                    }

                    count++;

                    // Audit Log
                    await _auditWriter.WriteAuditLogAsync(
                        action: "RESERVATION_PAYMENT_DEADLINE_EXPIRED",
                        targetType: "Reservation",
                        targetId: reservation.Id.ToString(),
                        oldValue: oldValue,
                        newValue: "Status: EXPIRED, PaymentStatus: CANCELLED",
                        reason: "Payment deadline expired before payment was completed."
                    );
                }

                // Process Case 2
                foreach (var reservation in case2List)
                {
                    var oldValue = $"Status: {reservation.Status}";
                    var previousReservationStatus = reservation.Status;

                    using (var transaction = await _context.Database.BeginTransactionAsync())
                    {
                        try
                        {
                            reservation.Status = "EXPIRED";
                            reservation.UpdatedAt = now;

                            ReleaseReservationHold(reservation, previousReservationStatus);

                            await _context.SaveChangesAsync();
                            await transaction.CommitAsync();
                        }
                        catch (Exception)
                        {
                            try { await transaction.RollbackAsync(); } catch {}
                            continue;
                        }
                    }

                    count++;

                    // Audit Log
                    await _auditWriter.WriteAuditLogAsync(
                        action: "RESERVATION_EXPIRED_BEFORE_CHECKIN",
                        targetType: "Reservation",
                        targetId: reservation.Id.ToString(),
                        oldValue: oldValue,
                        newValue: "Status: EXPIRED",
                        reason: "Reservation expired before driver checked in."
                    );
                }

                return count;
            });
        }

        private async Task ExpireReservationFromEntryCheckAsync(
            Reservation reservation,
            DateTimeOffset now,
            long staffId)
        {
            if (reservation.Status == "EXPIRED")
                return;

            if (reservation.Status != "PENDING" && reservation.Status != "CONFIRMED")
                return;

            var oldValue = $"Status: {reservation.Status}, PaymentStatus: {reservation.PaymentStatus}";
            var previousReservationStatus = reservation.Status;
            var providerCancellations = new List<PayOsProviderCancellation>();

            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    try
                    {
                        reservation.Status = "EXPIRED";
                        reservation.UpdatedAt = now;

                        if (reservation.PaymentStatus == "PENDING")
                        {
                            reservation.PaymentStatus = "CANCELLED";

                            var pendingPayments = await _context.Payments
                                .Where(p => p.ReservationId == reservation.Id && p.Status == "PENDING")
                                .ToListAsync();

                            providerCancellations = pendingPayments
                                .Where(p => p.Provider == "PAYOS")
                                .Select(p => new PayOsProviderCancellation(p.ProviderTransactionId, p.GatewayPayload))
                                .ToList();

                            foreach (var payment in pendingPayments)
                            {
                                payment.Status = "CANCELLED";
                                payment.UpdatedAt = now;
                            }
                        }

                        ReleaseReservationHold(reservation, previousReservationStatus);

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                    }
                    catch
                    {
                        try { await transaction.RollbackAsync(); } catch {}
                        throw;
                    }
                }
            });

            foreach (var cancellation in providerCancellations)
            {
                try
                {
                    await _payOsPaymentService.CancelProviderPaymentLinkAsync(
                        cancellation.ProviderTransactionId,
                        cancellation.GatewayPayload,
                        "Reservation expired before driver checked in.");
                }
                catch
                {
                    // Best-effort provider cancellation after local state is committed.
                }
            }

            await _auditWriter.WriteAuditLogAsync(
                action: "RESERVATION_EXPIRED_ON_ENTRY_CHECK",
                targetType: "Reservation",
                targetId: reservation.Id.ToString(),
                actorUserId: staffId,
                oldValue: oldValue,
                newValue: $"Status: EXPIRED, PaymentStatus: {reservation.PaymentStatus}",
                reason: "Reservation was expired when staff checked it for entry.");
        }

        // ================= HELPERS = null =================
        public async Task<int> SendExpiringNotificationsAsync()
        {
            var now = DateTimeOffset.UtcNow;
            var warningTime = now.AddMinutes(15);

            // Find confirmed active reservations that expire in the next 15 minutes,
            // haven't checked in, and haven't had a warning sent.
            var reservations = await _context.Reservations
                .Include(r => r.Driver)
                .Where(r => r.Status == "CONFIRMED" && r.CheckedInAt == null && r.ExpiresAt > now && r.ExpiresAt <= warningTime)
                .ToListAsync();

            int count = 0;
            foreach (var r in reservations)
            {
                // Check if already warned
                var alreadyWarned = await _context.AuditLogs
                    .AnyAsync(l => l.TargetType == "Reservation" && l.TargetId == r.Id.ToString() && l.Action == "RESERVATION_EXPIRING_WARNING");

                if (!alreadyWarned)
                {
                    // Write warning to audit log as simulated notification
                    await _auditWriter.WriteAuditLogAsync(
                        action: "RESERVATION_EXPIRING_WARNING",
                        targetType: "Reservation",
                        targetId: r.Id.ToString(),
                        actorUserId: r.CreatedBy,
                        newValue: $"Driver: {r.Driver?.FullName}, Code: {r.ReservationCode}, Plate: {r.PlateNumber}, Expires: {r.ExpiresAt:HH:mm:ss}"
                    );
                    count++;
                }
            }

            return count;
        }

        private static string GenerateReservationCode()
            => $"RES-{DateTimeOffset.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";

        private static void ReleaseReservationHold(Reservation reservation, string previousStatus)
        {
            if (previousStatus != "PENDING" && previousStatus != "CONFIRMED")
                return;

            if (reservation.CheckedInAt != null || reservation.Status == "COMPLETED")
                return;

            if (reservation.SlotId.HasValue && reservation.Slot != null && reservation.Slot.Status == "RESERVED")
            {
                reservation.Slot.Status = "AVAILABLE";
            }

            if (reservation.Area != null && reservation.Area.CurrentBookedSlots > 0)
            {
                reservation.Area.CurrentBookedSlots -= 1;
            }
        }

        private sealed record PayOsProviderCancellation(string? ProviderTransactionId, string? GatewayPayload);

        private string? NormalizePlate(string? plate)
        {
            if (string.IsNullOrWhiteSpace(plate)) return null;
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
                PaymentDeadline = r.PaymentDeadline,
                ConfirmedAt = r.ConfirmedAt,
                CheckedInAt = r.CheckedInAt,
                CheckedInBy = r.CheckedInBy,
                CancelledAt = r.CancelledAt,
                Status = r.Status,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            };
        }

        public async Task<ReservationEntryCheckResponse> CheckReservationForEntryAsync(
            string reservationCode,
            long entryGateId,
            long staffId)
        {
            // 1. Validate entry gate
            var gate = await _context.Gates
                .Include(g => g.Floor)
                .FirstOrDefaultAsync(g => g.Id == entryGateId);

            if (gate == null)
                throw new BusinessException(ErrorCodes.GateNotFound, StatusCodes.Status404NotFound);

            if (gate.GateType != "ENTRY")
                throw new BusinessException(ErrorCodes.EntryGateRequired);

            if (gate.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.GateNotActive);

            if (gate.Floor == null || gate.Floor.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.FloorNotActive);

            // 2. Find reservation
            var reservation = await _context.Reservations
                .Include(r => r.Floor)
                .Include(r => r.Area)
                .Include(r => r.Slot)
                .FirstOrDefaultAsync(r => r.ReservationCode == reservationCode);

            if (reservation == null)
            {
                return new ReservationEntryCheckResponse
                {
                    Status = "NOT_FOUND"
                };
            }

            var vehicleType = await _context.VehicleTypes.FindAsync(reservation.VehicleTypeId);
            var requiresSlot = vehicleType?.RequiresSlot ?? false;

            var response = new ReservationEntryCheckResponse
            {
                ReservationId = reservation.Id,
                ReservationCode = reservation.ReservationCode,
                VehicleTypeId = reservation.VehicleTypeId,
                PlateNumber = reservation.PlateNumber,
                NormalizedPlateNumber = reservation.NormalizedPlateNumber,
                ExpiresAt = reservation.ExpiresAt,
                RequiresSlot = requiresSlot,
                PlateRequiredAtEntry = !string.IsNullOrWhiteSpace(reservation.NormalizedPlateNumber) || requiresSlot
            };

            var now = DateTimeOffset.UtcNow;
            var paymentIsSettled = reservation.BookingAmount <= 0m
                || reservation.PaymentStatus == "PAID"
                || reservation.PaymentStatus == "NOT_REQUIRED";
            var paymentDeadlineExpired = !paymentIsSettled
                && reservation.PaymentDeadline.HasValue
                && reservation.PaymentDeadline.Value < now;

            if (reservation.Status == "CANCELLED")
            {
                response.Status = "CANCELLED";
                return response;
            }

            if (reservation.Status == "COMPLETED" || reservation.CheckedInAt != null)
            {
                response.Status = "ALREADY_CHECKED_IN";
                return response;
            }

            if (reservation.Status == "EXPIRED" || paymentDeadlineExpired || reservation.ExpiresAt < now)
            {
                await ExpireReservationFromEntryCheckAsync(reservation, now, staffId);
                response.Status = "EXPIRED";
                response.CanConvertToCasual = true;
                response.ReservationEntryToken = null;
                return response;
            }

            if (reservation.Status == "PENDING" || (reservation.BookingAmount > 0m && reservation.PaymentStatus == "PENDING"))
            {
                response.Status = "PAYMENT_PENDING";
                return response;
            }

            if (reservation.Status != "CONFIRMED" || (reservation.BookingAmount > 0m && reservation.PaymentStatus != "PAID" && reservation.PaymentStatus != "NOT_REQUIRED"))
            {
                response.Status = "PAYMENT_PENDING";
                return response;
            }

            // Check Floor & Area status
            if (reservation.Floor == null || reservation.Floor.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.ReservedFloorInactive);

            if (reservation.Area == null || reservation.Area.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.ReservedAreaInactive);

            if (response.RequiresSlot)
            {
                if (reservation.Slot == null)
                    throw new BusinessException(ErrorCodes.ReservedSlotNotFound);
                if (reservation.Slot.Status != "RESERVED")
                {
                    throw new BusinessException(ErrorCodes.ReservedSlotNotAvailable);
                }

                response.ReservedSlotId = reservation.Slot.Id;
                response.ReservedSlotCode = reservation.Slot.SlotCode;
            }

            response.ReservedFloorId = reservation.Floor.Id;
            response.ReservedFloorCode = reservation.Floor.FloorCode;
            response.ReservedAreaId = reservation.Area.Id;
            response.ReservedAreaCode = reservation.Area.AreaCode;

            // Generate token
            var tokenPayload = new ReservationEntryTokenPayload
            {
                ReservationId = reservation.Id,
                ReservationCode = reservation.ReservationCode,
                VehicleTypeId = reservation.VehicleTypeId,
                EntryGateId = entryGateId,
                ReservedFloorId = reservation.FloorId,
                ReservedAreaId = reservation.AreaId,
                ReservedSlotId = reservation.SlotId,
                IssuedToStaffId = staffId,
                IssuedAt = now,
                ExpiresAt = now.AddSeconds(120) // Token expires in 120 seconds
            };

            response.ReservationEntryToken = _tokenService.CreateToken(tokenPayload);
            response.Status = "VALID";

            return response;
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
        public string? PlateNumber { get; set; }
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

    public class ReservationPaymentStatusResponse
    {
        public long ReservationId { get; set; }
        public string ReservationCode { get; set; } = string.Empty;
        public string ReservationStatus { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public decimal BookingAmount { get; set; }
        public long? PaymentId { get; set; }
        public string? Provider { get; set; }
        public string? ProviderTransactionId { get; set; }
        public string? CheckoutUrl { get; set; }
        public string? QrCode { get; set; }
        public DateTimeOffset? PaymentExpiredAt { get; set; }
        public DateTimeOffset? PaidAt { get; set; }
        public DateTimeOffset? PaymentDeadline { get; set; }
        public int RemainingSeconds { get; set; }
        public bool IsExpired { get; set; }
    }

    public class ReservationResponseDto
    {
        public long Id { get; set; }
        public string ReservationCode { get; set; } = string.Empty;
        public long? DriverId { get; set; }
        public long? VehicleId { get; set; }
        public string? PlateNumber { get; set; }
        public string? NormalizedPlateNumber { get; set; }
        public long VehicleTypeId { get; set; }
        public long FloorId { get; set; }
        public long AreaId { get; set; }
        public long? SlotId { get; set; }
        public long? PricingRuleId { get; set; }
        public decimal SnapshotReservationHourlyPrice { get; set; }
        public int ReservedDurationMinutes { get; set; }
        public decimal BookingAmount { get; set; }
        public string PaymentStatus { get; set; } = "PENDING";
        public PayOsPaymentResponse? Payment { get; set; }
        public DateTimeOffset ReservedAt { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
        public DateTimeOffset? PaymentDeadline { get; set; }
        public DateTimeOffset? ConfirmedAt { get; set; }
        public DateTimeOffset? CheckedInAt { get; set; }
        public long? CheckedInBy { get; set; }
        public DateTimeOffset? CancelledAt { get; set; }
        public string Status { get; set; } = "PENDING";
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }

    public class ReservationDto
    {
        public long Id { get; set; }
        public string ReservationCode { get; set; } = string.Empty;
        public string Status { get; set; } = "PENDING";
        public string PaymentStatus { get; set; } = "PENDING";
        public decimal BookingAmount { get; set; }
        public DateTimeOffset? PaymentDeadline { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
        public long? DriverId { get; set; }
        public long? VehicleId { get; set; }
        public string? PlateNumber { get; set; }
        public string? NormalizedPlateNumber { get; set; }
        public long VehicleTypeId { get; set; }
        public long FloorId { get; set; }
        public long AreaId { get; set; }
        public long? SlotId { get; set; }
    }

    public class CreateReservationResponseDto
    {
        public ReservationDto Reservation { get; set; } = null!;
        public PayOsPaymentResponse? Payment { get; set; }
    }
}
