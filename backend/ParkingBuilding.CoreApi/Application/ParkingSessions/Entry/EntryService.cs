using System;
using Microsoft.AspNetCore.Http;
using ParkingBuilding.CoreApi.Contracts.Common;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Application.Audit.Dtos;
using ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion;
using ParkingBuilding.CoreApi.Application.ParkingSessions.Exit;
using ParkingBuilding.CoreApi.Application.Reservations;
using System.IO;
using Microsoft.Extensions.Options;
using ParkingBuilding.CoreApi.Application.MonthlyPasses;
using ParkingBuilding.CoreApi.Application.Storage;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Entry
{
    public class EntryService : IEntryService
    {
        private readonly ParkingDbContext _dbContext;
        private readonly IAuditWriterService _auditWriter;
        private readonly ILocationSuggestionService _suggestionService;
        private readonly ISuggestionTokenService _tokenService;
        private readonly IReservationEntryTokenService _resTokenService;
        private readonly IMonthlyPassService _monthlyPassService;
        private readonly IMonthlyEntryTokenService _monthlyTokenService;
        private readonly IStorageService _storageService;
        private readonly SupabaseStorageOptions _storageOptions;
        private readonly IFeeCalculationService _feeCalculationService;

        public EntryService(
            ParkingDbContext dbContext,
            IAuditWriterService auditWriter,
            ILocationSuggestionService suggestionService,
            ISuggestionTokenService tokenService,
            IReservationEntryTokenService resTokenService,
            IMonthlyPassService monthlyPassService,
            IMonthlyEntryTokenService monthlyTokenService,
            IStorageService storageService,
            IOptions<SupabaseStorageOptions> storageOptions,
            IFeeCalculationService feeCalculationService)
        {
            _dbContext = dbContext;
            _auditWriter = auditWriter;
            _suggestionService = suggestionService;
            _tokenService = tokenService;
            _resTokenService = resTokenService;
            _monthlyPassService = monthlyPassService;
            _monthlyTokenService = monthlyTokenService;
            _storageService = storageService;
            _storageOptions = storageOptions.Value;
            _feeCalculationService = feeCalculationService;
        }

        public async Task<CreateEntryResponse> CreateEntryAsync(CreateEntryRequest request, long staffId, string role)
        {
            var strategy = _dbContext.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _dbContext.Database.BeginTransactionAsync();
                try
                {
                    // 1. Validation đầu vào (F032)
                    await ValidateEntryRequest(request);

                    CreateEntryResponse response;
                    switch (request.EntryMode?.ToUpperInvariant())
                    {
                        case "MONTHLY":
                            response = await CreateMonthlyEntryAsync(request, staffId, role);
                            break;
                        case "CASUAL":
                            response = await CreateCasualEntryAsync(request, staffId, role);
                            break;
                        case "RESERVATION":
                            response = await CreateReservationEntryAsync(request, staffId, role);
                            break;
                        default:
                            throw new BusinessException(ErrorCodes.EntryModeInvalid);
                    }

                    await transaction.CommitAsync();
                    return response;
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        private async Task<CreateEntryResponse> CreateMonthlyEntryAsync(CreateEntryRequest request, long staffId, string role)
        {
            if (!request.MonthlyPassId.HasValue)
                throw new BusinessException(ErrorCodes.MonthlyPassIdRequired);
            if (string.IsNullOrWhiteSpace(request.MonthlyEntryToken))
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenRequired);

            var tokenPayload = _monthlyTokenService.VerifyToken(request.MonthlyEntryToken);

            if (tokenPayload.MonthlyPassId != request.MonthlyPassId.Value ||
                tokenPayload.CardCode != request.CardCode ||
                tokenPayload.VehicleTypeId != request.VehicleTypeId ||
                tokenPayload.EntryGateId != request.EntryGateId)
            {
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenMismatch);
            }

            if (role == "STAFF" && tokenPayload.IssuedToStaffId != staffId)
            {
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenMismatch);
            }

            var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);
            if (card == null) throw new BusinessException(ErrorCodes.CardNotFound);
            if (card.Status != CardStatus.AVAILABLE) throw new BusinessException(ErrorCodes.CardNotAvailable);

            if (tokenPayload.CardId != card.Id)
            {
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenMismatch);
            }

            var monthlyPass = await _dbContext.MonthlyPasses
                .Include(p => p.Floor)
                .Include(p => p.Area)
                .Include(p => p.Slot).ThenInclude(s => s!.Area)
                .FirstOrDefaultAsync(p => p.Id == request.MonthlyPassId!.Value);

            if (monthlyPass == null)
                throw new BusinessException(ErrorCodes.MonthlyPassNotFound, StatusCodes.Status404NotFound);

            if (monthlyPass.CardId != card.Id)
            {
                throw new BusinessException(ErrorCodes.MonthlyCardMismatch);
            }

            if (monthlyPass.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.MonthlyPassExpired);

            var today = DateTime.UtcNow.Date;
            if (monthlyPass.StartDate.Date > today || monthlyPass.EndDate.Date < today)
                throw new BusinessException(ErrorCodes.MonthlyPassExpired);

            var normalizedPlate = NormalizePlate(request.LicensePlate);
            if (monthlyPass.NormalizedPlateNumber != normalizedPlate)
                throw new BusinessException(ErrorCodes.MonthlyPlateMismatch);

            if (monthlyPass.VehicleTypeId != request.VehicleTypeId)
                throw new BusinessException(ErrorCodes.MonthlyVehicleTypeMismatch);

            // Task 4: DB re-check fixed floor/area/slot active status
            if (monthlyPass.Floor == null || monthlyPass.Floor.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.MonthlyFloorInactive);

            if (monthlyPass.Area != null && monthlyPass.Area.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.MonthlyAreaInactive);

            // Task 5: Verify token payload matches DB entities
            if (tokenPayload.FixedFloorId != monthlyPass.FloorId)
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenMismatch);

            if (tokenPayload.FixedAreaId != monthlyPass.AreaId)
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenMismatch);

            if (tokenPayload.FixedSlotId != monthlyPass.SlotId)
                throw new BusinessException(ErrorCodes.MonthlyEntryTokenMismatch);

            var gate = await _dbContext.Gates.Include(g => g.Floor).FirstOrDefaultAsync(g => g.Id == request.EntryGateId);
            if (gate == null) throw new BusinessException(ErrorCodes.GateNotFound);
            if (gate.GateType != "ENTRY" || gate.Status != "ACTIVE") throw new BusinessException(ErrorCodes.GateNotActive);
            if (gate.Floor == null || gate.Floor.Status != "ACTIVE") throw new BusinessException(ErrorCodes.FloorNotActive);

            var vehicleType = await _dbContext.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null) throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            if (vehicleType.RequiresSlot)
            {
                if (request.SelectedSlotId != monthlyPass.SlotId)
                    throw new BusinessException(ErrorCodes.MonthlySlotMismatch);

                if (monthlyPass.Slot == null)
                    throw new BusinessException(ErrorCodes.MonthlySlotNotAvailable);

                if (monthlyPass.Slot.AreaId != monthlyPass.AreaId)
                {
                    throw new BusinessException(ErrorCodes.MonthlyFixedLocationMismatch);
                }

                if (request.SelectedAreaId.HasValue &&
                    request.SelectedAreaId.Value != monthlyPass.Slot.AreaId)
                {
                    throw new BusinessException(ErrorCodes.MonthlyAreaMismatch);
                }

                if (monthlyPass.Slot.AllowedVehicleTypeId != request.VehicleTypeId)
                {
                    throw new BusinessException(ErrorCodes.MonthlySlotVehicleTypeMismatch);
                }

                if (monthlyPass.Slot.Status != "AVAILABLE")
                {
                    throw new BusinessException(ErrorCodes.MonthlySlotNotAvailable);
                }
            }
            else
            {
                if (request.SelectedAreaId != monthlyPass.AreaId)
                    throw new BusinessException(ErrorCodes.MonthlyAreaMismatch);
                if (request.SelectedSlotId.HasValue)
                    throw new BusinessException(ErrorCodes.MonthlySlotMismatch);

                if (monthlyPass.Area == null || monthlyPass.Area.Status != "ACTIVE")
                    throw new BusinessException(ErrorCodes.MonthlyAreaNotAvailable);

                if (monthlyPass.Area.CurrentRealOccupancy + monthlyPass.Area.CurrentBookedSlots >= monthlyPass.Area.TotalCapacity)
                {
                    throw new BusinessException(ErrorCodes.SelectedAreaFull);
                }
            }

            var pricing = await _dbContext.PricingRules
                .FirstOrDefaultAsync(p => p.VehicleTypeId == request.VehicleTypeId && p.Status == "ACTIVE" && p.EffectiveFrom <= DateTimeOffset.UtcNow);
            if (pricing == null) throw new BusinessException(ErrorCodes.PricingRuleNotFound);

            long resolvedAreaId = vehicleType.RequiresSlot
                ? monthlyPass.Slot!.AreaId
                : monthlyPass.AreaId!.Value;

            long resolvedFloorId = vehicleType.RequiresSlot
                ? monthlyPass.Slot!.Area.FloorId
                : monthlyPass.FloorId!.Value;

            var newSession = new ParkingSession
            {
                SessionCode = $"SESS-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                CardId = card.Id,
                PlateNumber = request.LicensePlate,
                NormalizedPlateNumber = normalizedPlate,
                NoPlate = request.NoPlate,
                VehicleDescription = request.VehicleDescription,
                VehicleTypeId = request.VehicleTypeId,
                EntryGateId = request.EntryGateId,
                SlotId = monthlyPass.SlotId,
                AreaId = resolvedAreaId,
                FloorId = resolvedFloorId,
                EntryStaffId = staffId,
                EntryTime = DateTimeOffset.UtcNow,
                BillableStartTime = DateTimeOffset.UtcNow,
                Status = "ACTIVE",
                PricingRuleId = pricing.Id,
                SnapshotDayPrice = pricing.DayPrice,
                SnapshotNightPrice = pricing.NightPrice,
                SnapshotMonthlyPrice = pricing.MonthlyPrice,
                SnapshotLostCardFee = pricing.LostCardFee,
                CustomerType = "MONTHLY",
                PaymentRequired = false,
                PaymentStatus = "NOT_REQUIRED",
                MonthlyPassId = monthlyPass.Id
            };

            _dbContext.ParkingSessions.Add(newSession);
            await _dbContext.SaveChangesAsync();

            if (vehicleType.RequiresSlot)
            {
                monthlyPass.Slot!.Status = "OCCUPIED";
                monthlyPass.Slot.CurrentSessionId = newSession.Id;
                monthlyPass.Slot.Area.CurrentRealOccupancy += 1;
            }
            else
            {
                monthlyPass.Area!.CurrentRealOccupancy += 1;
            }

            card.Status = CardStatus.IN_USE;
            card.CurrentSessionId = newSession.Id;
            await _dbContext.SaveChangesAsync();

            await SaveImagesAsync(request, newSession.Id);

            await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
            {
                Action = "SESSION_CREATED",
                TargetType = "ParkingSession",
                TargetId = newSession.SessionCode,
                Reason = $"Xe tháng {request.LicensePlate} vào bãi thành công.",
                ActorUserId = staffId
            });

            return MapSessionToResponse(newSession, card, request);
        }

        private async Task<CreateEntryResponse> CreateCasualEntryAsync(CreateEntryRequest request, long staffId, string role)
        {
            var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);
            if (card == null) throw new BusinessException(ErrorCodes.CardNotFound);
            if (card.Status != CardStatus.AVAILABLE) throw new BusinessException(ErrorCodes.CardNotAvailable);

            var hasActivePass = await _dbContext.MonthlyPasses
                .AnyAsync(m => m.CardId == card.Id && m.Status == "ACTIVE");
            if (hasActivePass)
                throw new BusinessException(ErrorCodes.CardIsMonthlyUseMonthlyFlow);

            var gate = await _dbContext.Gates.Include(g => g.Floor).FirstOrDefaultAsync(g => g.Id == request.EntryGateId);
            if (gate == null) throw new BusinessException(ErrorCodes.GateNotFound);

            var vehicleType = await _dbContext.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null) throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            var pricing = await _dbContext.PricingRules
                .FirstOrDefaultAsync(p => p.VehicleTypeId == request.VehicleTypeId && p.Status == "ACTIVE" && p.EffectiveFrom <= DateTimeOffset.UtcNow);
            if (pricing == null) throw new BusinessException(ErrorCodes.PricingRuleNotFound);

            var normalizedPlate = NormalizePlate(request.LicensePlate);

            LocationSuggestionPayload? suggestionPayload = null;
            if (!string.IsNullOrWhiteSpace(request.SuggestionToken))
            {
                suggestionPayload = _tokenService.VerifyToken(request.SuggestionToken);

                if (suggestionPayload.VehicleTypeId != request.VehicleTypeId ||
                    suggestionPayload.EntryGateId != request.EntryGateId)
                {
                    throw new BusinessException(ErrorCodes.SuggestionRequestMismatch);
                }

                if (role == "STAFF" && suggestionPayload.IssuedToStaffId != staffId)
                {
                    throw new BusinessException(ErrorCodes.SuggestionTokenStaffMismatch);
                }

                if (suggestionPayload.ExpiresAt <= DateTimeOffset.UtcNow)
                {
                    throw new BusinessException(ErrorCodes.SuggestionTokenExpired);
                }

                var expectedSuggestionType = vehicleType.RequiresSlot ? "SLOT" : "AREA";
                if (suggestionPayload.SuggestionType != expectedSuggestionType)
                {
                    throw new BusinessException(ErrorCodes.SuggestionTypeMismatch);
                }
            }
            else
            {
                if (role == "STAFF")
                {
                    throw new BusinessException(ErrorCodes.SuggestionTokenRequired);
                }

                if (string.IsNullOrWhiteSpace(request.OverrideReason))
                {
                    throw new BusinessException(ErrorCodes.OverrideReasonRequired);
                }
            }

            ParkingSession newSession;

            if (vehicleType.RequiresSlot)
            {
                if (!request.SelectedSlotId.HasValue)
                    throw new BusinessException(ErrorCodes.SelectedSlotRequired);

                var slot = await _dbContext.Slots.Include(s => s.Area).ThenInclude(a => a.Floor).FirstOrDefaultAsync(s => s.Id == request.SelectedSlotId.Value);
                if (slot == null) throw new BusinessException(ErrorCodes.SlotNotFound);

                if (slot.Status != "AVAILABLE" ||
                    slot.AllowedVehicleTypeId != request.VehicleTypeId ||
                    slot.Area.Status != "ACTIVE" ||
                    slot.Area.Floor.Status != "ACTIVE" ||
                    slot.Area.FloorId != gate.FloorId)
                {
                    throw new BusinessException(ErrorCodes.SelectedSlotNotAvailable);
                }

                bool isOverride = suggestionPayload == null || request.SelectedSlotId.Value != suggestionPayload.SuggestedSlotId;

                if (isOverride)
                {
                    if (role == "STAFF")
                    {
                        throw new BusinessException(ErrorCodes.SuggestionOverrideNotAllowed);
                    }

                    if (string.IsNullOrWhiteSpace(request.OverrideReason))
                    {
                        throw new BusinessException(ErrorCodes.OverrideReasonRequired);
                    }
                }

                newSession = new ParkingSession
                {
                    SessionCode = $"SESS-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                    CardId = card.Id,
                    PlateNumber = request.NoPlate ? null : request.LicensePlate,
                    NormalizedPlateNumber = request.NoPlate ? null : normalizedPlate,
                    NoPlate = request.NoPlate,
                    VehicleDescription = request.VehicleDescription,
                    VehicleTypeId = request.VehicleTypeId,
                    EntryGateId = request.EntryGateId,
                    SlotId = slot.Id,
                    AreaId = slot.AreaId,
                    FloorId = slot.Area.FloorId,
                    EntryStaffId = staffId,
                    EntryTime = DateTimeOffset.UtcNow,
                    BillableStartTime = DateTimeOffset.UtcNow,
                    Status = "ACTIVE",
                    PricingRuleId = pricing.Id,
                    SnapshotDayPrice = pricing.DayPrice,
                    SnapshotNightPrice = pricing.NightPrice,
                    SnapshotMonthlyPrice = pricing.MonthlyPrice,
                    SnapshotLostCardFee = pricing.LostCardFee,
                    CustomerType = "CASUAL",
                    PaymentRequired = true,
                    PaymentStatus = "PENDING",
                    SuggestedAreaId = suggestionPayload?.SuggestedAreaId ?? slot.AreaId,
                    SuggestedSlotId = suggestionPayload?.SuggestedSlotId ?? slot.Id,
                    OverrideAreaId = isOverride ? slot.AreaId : null,
                    OverrideSlotId = isOverride ? slot.Id : null,
                    OverrideBy = isOverride ? staffId : null,
                    OverrideAt = isOverride ? DateTimeOffset.UtcNow : null,
                    OverrideReason = isOverride ? request.OverrideReason : null
                };

                _dbContext.ParkingSessions.Add(newSession);
                await _dbContext.SaveChangesAsync();

                slot.Status = "OCCUPIED";
                slot.CurrentSessionId = newSession.Id;
                slot.Area.CurrentRealOccupancy += 1;
                await _dbContext.SaveChangesAsync();
            }
            else
            {
                if (!request.SelectedAreaId.HasValue)
                    throw new BusinessException(ErrorCodes.SelectedAreaRequired);

                if (request.SelectedSlotId.HasValue)
                    throw new BusinessException(ErrorCodes.SlotMustBeNullForAreaManagedVehicle);

                var area = await _dbContext.Areas
                    .Include(a => a.Floor)
                    .Include(a => a.AreaVehicleTypes)
                    .FirstOrDefaultAsync(a => a.Id == request.SelectedAreaId.Value);

                if (area == null) throw new BusinessException(ErrorCodes.AreaNotFound);

                if (area.Floor == null || area.Floor.Status != "ACTIVE")
                {
                    throw new BusinessException(ErrorCodes.SelectedFloorNotActive);
                }

                if (area.Status != "ACTIVE" ||
                    !area.AreaVehicleTypes.Any(av => av.VehicleTypeId == request.VehicleTypeId))
                {
                    throw new BusinessException(ErrorCodes.SelectedAreaNotActive);
                }

                if (area.CurrentRealOccupancy + area.CurrentBookedSlots >= area.TotalCapacity)
                {
                    throw new BusinessException(ErrorCodes.SelectedAreaFull);
                }

                var isFloorOverride = area.FloorId != gate.FloorId;
                bool isOverride = suggestionPayload == null || request.SelectedAreaId.Value != suggestionPayload.SuggestedAreaId || isFloorOverride;

                if (isOverride)
                {
                    if (role == "STAFF")
                    {
                        throw new BusinessException(ErrorCodes.SuggestionOverrideNotAllowed);
                    }

                    if (string.IsNullOrWhiteSpace(request.OverrideReason))
                    {
                        throw new BusinessException(ErrorCodes.OverrideReasonRequired);
                    }
                }

                newSession = new ParkingSession
                {
                    SessionCode = $"SESS-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                    CardId = card.Id,
                    PlateNumber = request.NoPlate ? null : request.LicensePlate,
                    NormalizedPlateNumber = request.NoPlate ? null : normalizedPlate,
                    NoPlate = request.NoPlate,
                    VehicleDescription = request.VehicleDescription,
                    VehicleTypeId = request.VehicleTypeId,
                    EntryGateId = request.EntryGateId,
                    SlotId = null,
                    AreaId = area.Id,
                    FloorId = area.FloorId,
                    EntryStaffId = staffId,
                    EntryTime = DateTimeOffset.UtcNow,
                    BillableStartTime = DateTimeOffset.UtcNow,
                    Status = "ACTIVE",
                    PricingRuleId = pricing.Id,
                    SnapshotDayPrice = pricing.DayPrice,
                    SnapshotNightPrice = pricing.NightPrice,
                    SnapshotMonthlyPrice = pricing.MonthlyPrice,
                    SnapshotLostCardFee = pricing.LostCardFee,
                    CustomerType = "CASUAL",
                    PaymentRequired = true,
                    PaymentStatus = "PENDING",
                    SuggestedAreaId = suggestionPayload?.SuggestedAreaId ?? area.Id,
                    SuggestedSlotId = null,
                    OverrideAreaId = isOverride ? area.Id : null,
                    OverrideSlotId = null,
                    OverrideBy = isOverride ? staffId : null,
                    OverrideAt = isOverride ? DateTimeOffset.UtcNow : null,
                    OverrideReason = isOverride ? request.OverrideReason : null
                };

                _dbContext.ParkingSessions.Add(newSession);
                await _dbContext.SaveChangesAsync();

                area.CurrentRealOccupancy += 1;
                await _dbContext.SaveChangesAsync();
            }

            card.Status = CardStatus.IN_USE;
            card.CurrentSessionId = newSession.Id;
            await _dbContext.SaveChangesAsync();

            await SaveImagesAsync(request, newSession.Id);

            if (request.ConvertedFromReservationId.HasValue)
            {
                await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                {
                    Action = "RESERVATION_CONVERTED_TO_CASUAL_ENTRY",
                    TargetType = "Reservation",
                    TargetId = request.ConvertedFromReservationId.Value.ToString(),
                    Reason = $"Đặt chỗ hết hạn, chuyển đổi sang đỗ vãng lai.",
                    ActorUserId = staffId
                });
            }

            await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
            {
                Action = "SESSION_CREATED",
                TargetType = "ParkingSession",
                TargetId = newSession.SessionCode,
                Reason = $"Xe vãng lai {request.LicensePlate} vào bãi thành công.",
                ActorUserId = staffId
            });

            return MapSessionToResponse(newSession, card, request);
        }

        private async Task<CreateEntryResponse> CreateReservationEntryAsync(CreateEntryRequest request, long staffId, string role)
        {
            var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);
            if (card == null) throw new BusinessException(ErrorCodes.CardNotFound);
            if (card.Status != CardStatus.AVAILABLE) throw new BusinessException(ErrorCodes.CardNotAvailable);

            var hasActivePass = await _dbContext.MonthlyPasses
                .AnyAsync(m => m.CardId == card.Id && m.Status == "ACTIVE");
            if (hasActivePass)
                throw new BusinessException(ErrorCodes.CardIsMonthlyNotAllowedForReservation);

            if (!request.ReservationId.HasValue)
                throw new BusinessException(ErrorCodes.ReservationIdRequired);
            if (string.IsNullOrWhiteSpace(request.ReservationEntryToken))
                throw new BusinessException(ErrorCodes.ReservationEntryTokenRequired);

            var tokenPayload = _resTokenService.VerifyToken(request.ReservationEntryToken);

            if (tokenPayload.ReservationId != request.ReservationId.Value ||
                tokenPayload.EntryGateId != request.EntryGateId ||
                tokenPayload.VehicleTypeId != request.VehicleTypeId)
            {
                throw new BusinessException(ErrorCodes.ReservationEntryTokenMismatch);
            }

            if (role == "STAFF" && tokenPayload.IssuedToStaffId != staffId)
            {
                throw new BusinessException(ErrorCodes.ReservationEntryTokenMismatch);
            }

            var vehicleType = await _dbContext.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null) throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            var pricing = await _dbContext.PricingRules
                .FirstOrDefaultAsync(p => p.VehicleTypeId == request.VehicleTypeId && p.Status == "ACTIVE" && p.EffectiveFrom <= DateTimeOffset.UtcNow);
            if (pricing == null) throw new BusinessException(ErrorCodes.PricingRuleNotFound);

            var activeReservation = await _dbContext.Reservations
                .Include(r => r.Floor)
                .Include(r => r.Area)
                .Include(r => r.Slot)
                .FirstOrDefaultAsync(r => r.Id == request.ReservationId.Value);

            if (activeReservation == null)
                throw new BusinessException(ErrorCodes.ReservationNotFound, StatusCodes.Status404NotFound);

            if (activeReservation.Status == "CANCELLED")
                throw new BusinessException(ErrorCodes.ReservationCancelled);

            if (activeReservation.Status == "COMPLETED" || activeReservation.CheckedInAt != null)
                throw new BusinessException(ErrorCodes.ReservationAlreadyCheckedIn);

            if (activeReservation.Status != "CONFIRMED")
                throw new BusinessException(ErrorCodes.ReservationNotConfirmed);

            var now = DateTimeOffset.UtcNow;

            if (activeReservation.ExpiresAt < now)
                throw new BusinessException(ErrorCodes.ReservationExpired);

            if (activeReservation.BookingAmount > 0m && activeReservation.PaymentStatus != "PAID")
                throw new BusinessException(ErrorCodes.PaymentPending);

            // Task 6: Verify VehicleTypeId against reservation
            if (activeReservation.VehicleTypeId != request.VehicleTypeId)
                throw new BusinessException(ErrorCodes.ReservationVehicleTypeMismatch);

            var normalizedPlate = NormalizePlate(request.LicensePlate);

            if (!string.IsNullOrWhiteSpace(activeReservation.NormalizedPlateNumber))
            {
                if (activeReservation.NormalizedPlateNumber != normalizedPlate)
                {
                    throw new BusinessException(ErrorCodes.ReservationPlateMismatch);
                }
            }
            else
            {
                if (request.NoPlate)
                {
                    if (vehicleType.RequiresSlot)
                    {
                        throw new BusinessException(ErrorCodes.PlateRequiredForSlotVehicle);
                    }

                    if (string.IsNullOrWhiteSpace(request.VehicleDescription))
                    {
                        throw new BusinessException(ErrorCodes.VehicleDescriptionRequired);
                    }

                    activeReservation.PlateNumber = null;
                    activeReservation.NormalizedPlateNumber = null;
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(request.LicensePlate))
                    {
                        throw new BusinessException(ErrorCodes.EntryPlateRequired);
                    }

                    activeReservation.PlateNumber = request.LicensePlate.Trim();
                    activeReservation.NormalizedPlateNumber = normalizedPlate;
                }
            }

            if (request.SelectedAreaId != activeReservation.AreaId)
                throw new BusinessException(ErrorCodes.ReservationAreaMismatch);

            // Task 7: Verify token-vs-DB location matching
            if (tokenPayload.ReservedFloorId != activeReservation.FloorId)
                throw new BusinessException(ErrorCodes.ReservationEntryTokenMismatch);

            if (tokenPayload.ReservedAreaId != activeReservation.AreaId)
                throw new BusinessException(ErrorCodes.ReservationEntryTokenMismatch);

            if (tokenPayload.ReservedSlotId != activeReservation.SlotId)
                throw new BusinessException(ErrorCodes.ReservationEntryTokenMismatch);

            if (vehicleType.RequiresSlot)
            {
                if (request.SelectedSlotId != activeReservation.SlotId)
                    throw new BusinessException(ErrorCodes.ReservationSlotMismatch);

                if (activeReservation.Slot == null)
                    throw new BusinessException(ErrorCodes.ReservedSlotNotFound);

                if (activeReservation.Slot.Status != "RESERVED")
                {
                    throw new BusinessException(ErrorCodes.ReservedSlotNotAvailable);
                }
            }
            else
            {
                if (request.SelectedSlotId != null)
                    throw new BusinessException(ErrorCodes.ReservationSlotMismatch);

                if (activeReservation.Area.CurrentRealOccupancy >= activeReservation.Area.TotalCapacity)
                {
                    throw new BusinessException(ErrorCodes.SelectedAreaFull);
                }
            }

            if (activeReservation.Floor == null || activeReservation.Floor.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.ReservedFloorInactive);

            if (activeReservation.Area == null || activeReservation.Area.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.ReservedAreaInactive);

            var newSession = new ParkingSession
            {
                SessionCode = $"SESS-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                CardId = card.Id,
                PlateNumber = request.NoPlate ? null : request.LicensePlate,
                NormalizedPlateNumber = request.NoPlate ? null : normalizedPlate,
                NoPlate = request.NoPlate,
                VehicleDescription = request.VehicleDescription,
                VehicleTypeId = request.VehicleTypeId,
                EntryGateId = request.EntryGateId,
                SlotId = activeReservation.SlotId,
                AreaId = activeReservation.AreaId,
                FloorId = activeReservation.FloorId,
                ReservationId = activeReservation.Id,
                EntryStaffId = staffId,
                EntryTime = now,
                BillableStartTime = activeReservation.ExpiresAt,
                Status = "ACTIVE",
                PricingRuleId = pricing.Id,
                SnapshotDayPrice = pricing.DayPrice,
                SnapshotNightPrice = pricing.NightPrice,
                SnapshotMonthlyPrice = pricing.MonthlyPrice,
                SnapshotLostCardFee = pricing.LostCardFee,
                CustomerType = "CASUAL",
                PaymentRequired = true,
                PaymentStatus = "PENDING"
            };

            _dbContext.ParkingSessions.Add(newSession);
            await _dbContext.SaveChangesAsync();

            activeReservation.Status = "COMPLETED";
            activeReservation.CheckedInAt = now;
            activeReservation.CheckedInBy = staffId;
            activeReservation.UpdatedAt = now;

            if (vehicleType.RequiresSlot && activeReservation.SlotId.HasValue)
            {
                var slot = await _dbContext.Slots.FindAsync(activeReservation.SlotId.Value);
                if (slot != null)
                {
                    slot.Status = "OCCUPIED";
                    slot.CurrentSessionId = newSession.Id;
                }
            }

            if (activeReservation.Area.CurrentBookedSlots > 0)
            {
                activeReservation.Area.CurrentBookedSlots -= 1;
            }
            activeReservation.Area.CurrentRealOccupancy += 1;

            card.Status = CardStatus.IN_USE;
            card.CurrentSessionId = newSession.Id;
            await _dbContext.SaveChangesAsync();

            await SaveImagesAsync(request, newSession.Id);

            await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
            {
                Action = "RESERVATION_CHECKED_IN",
                TargetType = "Reservation",
                TargetId = activeReservation.Id.ToString(),
                Reason = $"Check-in thành công cho đặt chỗ {activeReservation.ReservationCode}.",
                ActorUserId = staffId
            });

            await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
            {
                Action = "SESSION_CREATED",
                TargetType = "ParkingSession",
                TargetId = newSession.SessionCode,
                Reason = $"Xe booking {request.LicensePlate} vào bãi thành công.",
                ActorUserId = staffId
            });

            return MapSessionToResponse(newSession, card, request);
        }

        private async Task SaveImagesAsync(CreateEntryRequest request, long sessionId)
        {
            if (!string.IsNullOrWhiteSpace(request.EntryPlateImageUrl))
            {
                var processedUrl = await ProcessImageUrlAsync(request.EntryPlateImageUrl, "entry", "plate", sessionId);
                _dbContext.ParkingSessionImages.Add(new ParkingSessionImage
                {
                    SessionId = sessionId,
                    ImageType = "ENTRY_PLATE",
                    ImageUrl = processedUrl,
                    DetectedPlateNumber = request.DetectedPlateNumber,
                    DetectedNormalizedPlateNumber = request.DetectedNormalizedPlateNumber ?? (string.IsNullOrWhiteSpace(request.DetectedPlateNumber) ? null : NormalizePlate(request.DetectedPlateNumber)),
                    Confidence = request.OcrConfidence,
                    IsPrimary = true,
                    CapturedAt = DateTimeOffset.UtcNow
                });
            }

            if (!string.IsNullOrWhiteSpace(request.EntryVehicleImageUrl))
            {
                var processedUrl = await ProcessImageUrlAsync(request.EntryVehicleImageUrl, "entry", "vehicle", sessionId);
                _dbContext.ParkingSessionImages.Add(new ParkingSessionImage
                {
                    SessionId = sessionId,
                    ImageType = "ENTRY_VEHICLE",
                    ImageUrl = processedUrl,
                    DetectedPlateNumber = null,
                    DetectedNormalizedPlateNumber = null,
                    Confidence = null,
                    IsPrimary = false,
                    CapturedAt = DateTimeOffset.UtcNow
                });
            }

            await _dbContext.SaveChangesAsync();
        }

        private async Task<string> ProcessImageUrlAsync(string inputUrl, string folder, string fileNamePrefix, long sessionId)
        {
            if (string.IsNullOrWhiteSpace(inputUrl)) return string.Empty;

            if (inputUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    var commaIndex = inputUrl.IndexOf(',');
                    if (commaIndex > 0)
                    {
                        var header = inputUrl[..commaIndex];
                        var base64Data = inputUrl[(commaIndex + 1)..];
                        var mimeType = "image/jpeg";
                        var extension = ".jpg";

                        if (header.Contains("image/png", StringComparison.OrdinalIgnoreCase))
                        {
                            mimeType = "image/png";
                            extension = ".png";
                        }
                        else if (header.Contains("image/webp", StringComparison.OrdinalIgnoreCase))
                        {
                            mimeType = "image/webp";
                            extension = ".webp";
                        }

                        var bytes = Convert.FromBase64String(base64Data);
                        using var stream = new MemoryStream(bytes);
                        var storagePath = $"sessions/{sessionId}/{folder}/{fileNamePrefix}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString("N")[..6]}{extension}";

                        await _storageService.UploadAsync(stream, storagePath, mimeType);
                        if (!string.IsNullOrWhiteSpace(_storageOptions?.Url) && !string.IsNullOrWhiteSpace(_storageOptions?.Bucket))
                        {
                            var baseUrl = _storageOptions.Url.TrimEnd('/');
                            return $"{baseUrl}/storage/v1/object/public/{_storageOptions.Bucket}/{storagePath}";
                        }

                        return await _storageService.CreateSignedUrlAsync(storagePath);
                    }
                }
                catch
                {
                    // Fallback to safely truncated string if Supabase Upload fails or is not configured
                }
            }

            return inputUrl.Length > 500 ? inputUrl[..500] : inputUrl;
        }

        private CreateEntryResponse MapSessionToResponse(ParkingSession newSession, ParkingCard card, CreateEntryRequest request)
        {
            return new CreateEntryResponse
            {
                SessionId = newSession.Id,
                SessionCode = newSession.SessionCode,
                Status = newSession.Status,
                EntryMode = request.EntryMode,
                ConvertedFromReservationId = request.ConvertedFromReservationId,
                CardId = card.Id,
                CardCode = card.CardNumber,
                PlateNumber = newSession.PlateNumber,
                NormalizedPlateNumber = newSession.NormalizedPlateNumber,
                NoPlate = newSession.NoPlate,
                VehicleDescription = newSession.VehicleDescription,
                VehicleTypeId = newSession.VehicleTypeId,
                EntryGateId = newSession.EntryGateId,
                EntryStaffId = newSession.EntryStaffId,
                EntryTime = newSession.EntryTime,
                BillableStartTime = newSession.BillableStartTime,
                FloorId = newSession.FloorId,
                AreaId = newSession.AreaId,
                SlotId = newSession.SlotId,
                CustomerType = newSession.CustomerType,
                PaymentRequired = newSession.PaymentRequired,
                PaymentStatus = newSession.PaymentStatus,
                ReservationId = newSession.ReservationId,
                MonthlyPassId = newSession.MonthlyPassId,
                SuggestedAreaId = newSession.SuggestedAreaId,
                SuggestedSlotId = newSession.SuggestedSlotId,
                OverrideAreaId = newSession.OverrideAreaId,
                OverrideSlotId = newSession.OverrideSlotId,
                OverrideReason = newSession.OverrideReason
            };
        }

        public async Task<ClaimSessionResponse> ClaimSessionAsync(string userIdString, string qrToken)
        {
            if (!long.TryParse(userIdString, out var userId))
                throw new BusinessException(ErrorCodes.AuthUserIdInvalid);

            if (string.IsNullOrWhiteSpace(qrToken))
                throw new BusinessException(ErrorCodes.QrTokenRequired);

            var cleanToken = qrToken.Trim();

            var strategy = _dbContext.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _dbContext.Database.BeginTransactionAsync();

                try
                {
                    var user = await _dbContext.Users
                        .FirstOrDefaultAsync(u => u.Id == userId);

                    if (user == null)
                        throw new BusinessException(ErrorCodes.UserNotFound);

                    if (user.Role != Domain.Enums.UserRole.DRIVER)
                        throw new BusinessException(ErrorCodes.DriverRequired);

                    if (user.Status != Domain.Enums.UserStatus.ACTIVE)
                        throw new BusinessException(ErrorCodes.UserNotActive);

                    var driverProfile = await _dbContext.DriverProfiles
                        .FirstOrDefaultAsync(d => d.UserId == userId);

                    if (driverProfile == null)
                        throw new BusinessException(ErrorCodes.DriverProfileNotFound);

                    var card = await _dbContext.ParkingCards
                        .FirstOrDefaultAsync(c => c.QrToken == cleanToken ||
                                                  c.CardNumber.ToLower() == cleanToken.ToLower() ||
                                                  c.Id.ToString() == cleanToken);

                    if (card == null)
                        throw new BusinessException(ErrorCodes.CardQrNotFound, StatusCodes.Status404NotFound);

                    if (card.CurrentSessionId == null)
                        throw new BusinessException(ErrorCodes.CardHasNoActiveSession, StatusCodes.Status400BadRequest);

                    var session = await _dbContext.ParkingSessions
                        .Include(s => s.ParkingCard)
                        .Include(s => s.Area)
                        .Include(s => s.Slot)
                        .Include(s => s.ParkingSessionImages)
                        .FirstOrDefaultAsync(s =>
                            s.Id == card.CurrentSessionId.Value &&
                            s.Status == "ACTIVE");

                    if (session == null)
                        throw new BusinessException(ErrorCodes.SessionNotFound, StatusCodes.Status404NotFound);

                    // Security check: If already claimed by another user, block access!
                    if (session.ClaimedByUserId.HasValue && session.ClaimedByUserId.Value != userId)
                    {
                        throw new BusinessException(ErrorCodes.SessionAlreadyClaimed, StatusCodes.Status400BadRequest);
                    }

                    // If not claimed yet, claim it for this user
                    if (!session.ClaimedByUserId.HasValue)
                    {
                        session.DriverId = driverProfile.Id;
                        session.ClaimedByUserId = userId;
                        session.ClaimedAt = DateTimeOffset.UtcNow;
                        session.ClaimMethod = "CARD_QR";

                        await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
                        {
                            Action = "SESSION_CLAIMED",
                            TargetType = "ParkingSession",
                            TargetId = session.SessionCode,
                            ActorUserId = userId,
                            NewValue = System.Text.Json.JsonSerializer.Serialize(new
                            {
                                sessionId = session.Id,
                                sessionCode = session.SessionCode,
                                driverProfileId = driverProfile.Id,
                                claimedByUserId = userId,
                                claimMethod = "CARD_QR"
                            }),
                            Reason = "Driver claimed active parking session by card QR."
                        });

                        await _dbContext.SaveChangesAsync();
                    }

                    await transaction.CommitAsync();

                    return await BuildClaimSessionResponseAsync(session);
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        public async Task<List<ClaimSessionResponse>> GetMyActiveClaimedSessionsAsync(string userIdString)
        {
            if (!long.TryParse(userIdString, out var userId))
                throw new BusinessException(ErrorCodes.AuthUserIdInvalid);

            var activeSessions = await _dbContext.ParkingSessions
                .Include(s => s.ParkingCard)
                .Include(s => s.Area)
                .Include(s => s.Slot)
                .Include(s => s.ParkingSessionImages)
                .Where(s => s.ClaimedByUserId == userId && s.Status == "ACTIVE")
                .OrderByDescending(s => s.EntryTime)
                .ToListAsync();

            var list = new List<ClaimSessionResponse>();
            foreach (var session in activeSessions)
            {
                list.Add(await BuildClaimSessionResponseAsync(session));
            }

            return list;
        }

        private async Task<ClaimSessionResponse> BuildClaimSessionResponseAsync(ParkingSession session)
        {
            var feeResult = await _feeCalculationService.CalculateFeeAsync(session.Id, DateTimeOffset.UtcNow, false);
            var primaryImage = session.ParkingSessionImages
                .FirstOrDefault(img => img.ImageType == "ENTRY_PLATE" || img.IsPrimary)?.ImageUrl
                ?? session.ParkingSessionImages.FirstOrDefault()?.ImageUrl;

            var vehicleType = await _dbContext.VehicleTypes.FindAsync(session.VehicleTypeId);
            var floor = await _dbContext.Floors.FindAsync(session.FloorId);

            var duration = DateTimeOffset.UtcNow - session.EntryTime;

            return new ClaimSessionResponse
            {
                SessionId = session.Id,
                SessionCode = session.SessionCode,
                CardCode = session.ParkingCard?.CardNumber ?? string.Empty,
                QrToken = session.ParkingCard?.QrToken ?? string.Empty,
                PlateNumber = session.PlateNumber,
                VehicleDescription = session.VehicleDescription,
                VehicleTypeId = session.VehicleTypeId,
                VehicleTypeName = vehicleType?.Name ?? string.Empty,
                EntryTime = session.EntryTime,
                FloorId = session.FloorId,
                FloorCode = floor?.FloorCode ?? string.Empty,
                FloorName = floor?.FloorName ?? string.Empty,
                AreaId = session.AreaId,
                AreaCode = session.Area?.AreaCode ?? string.Empty,
                AreaName = session.Area?.AreaName ?? string.Empty,
                SlotId = session.SlotId,
                SlotCode = session.Slot?.SlotCode,
                Status = session.Status,
                PaymentStatus = session.PaymentStatus,
                PaymentRequired = session.PaymentRequired,
                FeeAmount = feeResult.TotalAmount,
                DurationHours = Math.Round(duration.TotalHours, 1),
                ClaimedByUserId = session.ClaimedByUserId,
                ClaimedAt = session.ClaimedAt,
                ClaimMethod = session.ClaimMethod,
                PrimaryImageUrl = primaryImage
            };
        }

        private async Task ValidateEntryRequest(CreateEntryRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CardCode))
                throw new BusinessException(ErrorCodes.CardCodeRequired);

            if (request.VehicleTypeId <= 0)
                throw new BusinessException(ErrorCodes.VehicleTypeRequired);

            if (request.EntryGateId <= 0)
                throw new BusinessException(ErrorCodes.EntryGateRequired);

            if (!request.NoPlate && string.IsNullOrWhiteSpace(request.LicensePlate))
                throw new BusinessException(ErrorCodes.LicensePlateRequired);

            var card = await _dbContext.ParkingCards.FirstOrDefaultAsync(c => c.CardNumber == request.CardCode);
            if (card == null || card.Status != CardStatus.AVAILABLE)
                throw new BusinessException(ErrorCodes.CardNotAvailable);

            var vehicleType = await _dbContext.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            if (request.NoPlate)
            {
                if (vehicleType.RequiresSlot)
                    throw new BusinessException(ErrorCodes.PlateRequiredForSlotVehicle);

                if (string.IsNullOrWhiteSpace(request.VehicleDescription))
                    throw new BusinessException(ErrorCodes.VehicleDescriptionRequired);
            }

            // Validate Gate status & Floor status
            var gate = await _dbContext.Gates.Include(g => g.Floor).FirstOrDefaultAsync(g => g.Id == request.EntryGateId);
            if (gate == null)
                throw new BusinessException(ErrorCodes.GateNotFound);

            if (gate.GateType != "ENTRY")
                throw new BusinessException(ErrorCodes.EntryGateRequired);

            if (gate.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.GateNotActive);

            if (gate.Floor == null || gate.Floor.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.FloorNotActive);

            if (!request.NoPlate)
            {
                var normalizedPlate = NormalizePlate(request.LicensePlate);
                if (!string.IsNullOrWhiteSpace(normalizedPlate))
                {
                    bool hasActive = await _dbContext.ParkingSessions.AnyAsync(s => s.NormalizedPlateNumber == normalizedPlate && s.Status == "ACTIVE");
                    if (hasActive) throw new BusinessException(ErrorCodes.VehicleAlreadyInParking);
                }
            }
        }

        private static string NormalizePlate(string? plate)
        {
            return plate?
                .Trim()
                .Replace("-", "")
                .Replace(".", "")
                .Replace(" ", "")
                .ToUpperInvariant() ?? "";
        }
    }
}
