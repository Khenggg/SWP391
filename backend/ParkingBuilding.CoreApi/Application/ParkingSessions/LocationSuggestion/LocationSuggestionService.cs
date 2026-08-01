using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Contracts.Common;
using Microsoft.Extensions.Configuration;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.LocationSuggestion
{
    public class LocationSuggestionService : ILocationSuggestionService
    {
        private readonly ParkingDbContext _dbContext;
        private readonly ISuggestionTokenService _tokenService;
        private readonly IConfiguration _configuration;

        public LocationSuggestionService(ParkingDbContext dbContext, ISuggestionTokenService tokenService, IConfiguration configuration)
        {
            _dbContext = dbContext;
            _tokenService = tokenService;
            _configuration = configuration;
        }

        public async Task<LocationSuggestionResponse> SuggestLocationAsync(LocationSuggestionRequest request, long staffId, string role)
        {
            var gate = await _dbContext.Gates.Include(g => g.Floor).FirstOrDefaultAsync(g => g.Id == request.EntryGateId);
            if (gate == null)
                throw new BusinessException(ErrorCodes.GateNotFound);

            if (gate.GateType != "ENTRY")
                throw new BusinessException(ErrorCodes.EntryGateRequired);

            if (gate.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.GateNotActive);

            if (gate.Floor.Status != "ACTIVE")
                throw new BusinessException(ErrorCodes.FloorNotActive);

            var vehicleType = await _dbContext.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null || !vehicleType.IsActive)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            var expireSecondsStr = _configuration["SuggestionToken:ExpireSeconds"];
            if (!int.TryParse(expireSecondsStr, out var expireSeconds))
            {
                expireSeconds = 60;
            }
            var expiresAt = DateTimeOffset.UtcNow.AddSeconds(expireSeconds);

            var activeReservationSlotIds = await _dbContext.Reservations
                .Where(r => r.Status == "PENDING" || r.Status == "CONFIRMED")
                .Where(r => r.SlotId != null)
                .Select(r => r.SlotId!.Value)
                .ToListAsync();

            if (vehicleType.RequiresSlot)
            {
                // Find available slot on the requested gate's floor
                var suggestedSlot = await _dbContext.Slots
                    .Include(s => s.Area)
                        .ThenInclude(a => a.Floor)
                    .Where(s =>
                        s.Status == "AVAILABLE" &&
                        s.AllowedVehicleTypeId == request.VehicleTypeId &&
                        s.Area.FloorId == gate.FloorId &&
                        s.Area.Status == "ACTIVE" &&
                        s.Area.Floor.Status == "ACTIVE" &&
                        s.Area.AreaVehicleTypes.Any(avt => avt.VehicleTypeId == request.VehicleTypeId) &&
                        !activeReservationSlotIds.Contains(s.Id))
                    .OrderBy(s => s.Area.PriorityOrder)
                    .ThenBy(s => s.Id)
                    .FirstOrDefaultAsync();

                if (suggestedSlot == null)
                {
                    // Check if other floors have space to give actionable message
                    var otherSlot = await _dbContext.Slots
                        .Include(s => s.Area)
                            .ThenInclude(a => a.Floor)
                        .Where(s =>
                            s.Status == "AVAILABLE" &&
                            s.AllowedVehicleTypeId == request.VehicleTypeId &&
                            s.Area.FloorId != gate.FloorId &&
                            s.Area.Status == "ACTIVE" &&
                            s.Area.Floor.Status == "ACTIVE" &&
                            s.Area.AreaVehicleTypes.Any(avt => avt.VehicleTypeId == request.VehicleTypeId) &&
                            !activeReservationSlotIds.Contains(s.Id))
                        .OrderBy(s => s.Area.Floor.FloorCode)
                        .FirstOrDefaultAsync();

                    if (otherSlot != null)
                    {
                        throw new BusinessException($"Tầng '{gate.Floor.FloorCode}' ({gate.Floor.FloorName}) hiện đã hết Slot cho xe '{vehicleType.Name}'. Vui lòng điều hướng xe di chuyển sang Tầng '{otherSlot.Area.Floor.FloorCode}' ({otherSlot.Area.Floor.FloorName}) vẫn còn chỗ.", StatusCodes.Status400BadRequest);
                    }

                    throw new BusinessException($"Tất cả các tầng đều đã hết Slot trống cho xe '{vehicleType.Name}'.", StatusCodes.Status400BadRequest);
                }

                // Get alternatives on the same floor
                var alternatives = await _dbContext.Slots
                    .Include(s => s.Area)
                        .ThenInclude(a => a.Floor)
                    .Where(s =>
                        s.Id != suggestedSlot.Id &&
                        s.Status == "AVAILABLE" &&
                        s.AllowedVehicleTypeId == request.VehicleTypeId &&
                        s.Area.FloorId == gate.FloorId &&
                        s.Area.Status == "ACTIVE" &&
                        s.Area.Floor.Status == "ACTIVE" &&
                        s.Area.AreaVehicleTypes.Any(avt => avt.VehicleTypeId == request.VehicleTypeId) &&
                        !activeReservationSlotIds.Contains(s.Id))
                    .OrderBy(s => s.Area.PriorityOrder)
                    .ThenBy(s => s.Id)
                    .Take(5)
                    .Select(s => new LocationAlternativeResponse
                    {
                        FloorId = s.Area.FloorId,
                        FloorCode = s.Area.Floor.FloorCode,
                        AreaId = s.AreaId,
                        AreaCode = s.Area.AreaCode,
                        SlotId = s.Id,
                        SlotCode = s.SlotCode
                    })
                    .ToListAsync();

                var payload = new LocationSuggestionPayload
                {
                    SuggestionType = "SLOT",
                    VehicleTypeId = request.VehicleTypeId,
                    EntryGateId = gate.Id,
                    SuggestedFloorId = suggestedSlot.Area.FloorId,
                    SuggestedAreaId = suggestedSlot.AreaId,
                    SuggestedSlotId = suggestedSlot.Id,
                    IssuedToStaffId = staffId,
                    IssuedAt = DateTimeOffset.UtcNow,
                    ExpiresAt = expiresAt
                };

                var token = _tokenService.CreateToken(payload);

                return new LocationSuggestionResponse
                {
                    SuggestionType = "SLOT",
                    VehicleTypeId = request.VehicleTypeId,
                    EntryGateId = request.EntryGateId,
                    SuggestedEntryGateId = gate.Id,
                    SuggestedEntryGateCode = gate.GateCode,
                    IsFloorSwitched = false,
                    SuggestedFloorId = suggestedSlot.Area.FloorId,
                    SuggestedFloorCode = suggestedSlot.Area.Floor.FloorCode,
                    SuggestedAreaId = suggestedSlot.AreaId,
                    SuggestedAreaCode = suggestedSlot.Area.AreaCode,
                    SuggestedSlotId = suggestedSlot.Id,
                    SuggestedSlotCode = suggestedSlot.SlotCode,
                    SuggestionToken = token,
                    ExpiresAt = expiresAt,
                    Alternatives = alternatives
                };
            }
            else
            {
                // Find available area on gate's floor
                var areas = await _dbContext.Areas
                    .Include(a => a.Floor)
                    .Include(a => a.AreaVehicleTypes)
                    .Where(a =>
                        a.FloorId == gate.FloorId &&
                        a.Status == "ACTIVE" &&
                        a.Floor.Status == "ACTIVE" &&
                        a.AreaVehicleTypes.Any(av => av.VehicleTypeId == request.VehicleTypeId))
                    .OrderBy(a => a.PriorityOrder)
                    .ThenBy(a => a.Id)
                    .ToListAsync();

                var suggestedArea = areas.FirstOrDefault(a => a.CurrentRealOccupancy + a.CurrentBookedSlots < a.TotalCapacity);

                if (suggestedArea == null)
                {
                    // Check other floors
                    var otherArea = await _dbContext.Areas
                        .Include(a => a.Floor)
                        .Include(a => a.AreaVehicleTypes)
                        .Where(a =>
                            a.FloorId != gate.FloorId &&
                            a.Status == "ACTIVE" &&
                            a.Floor.Status == "ACTIVE" &&
                            a.AreaVehicleTypes.Any(av => av.VehicleTypeId == request.VehicleTypeId) &&
                            a.CurrentRealOccupancy + a.CurrentBookedSlots < a.TotalCapacity)
                        .OrderBy(a => a.Floor.FloorCode)
                        .FirstOrDefaultAsync();

                    if (otherArea != null)
                    {
                        throw new BusinessException($"Tầng '{gate.Floor.FloorCode}' ({gate.Floor.FloorName}) hiện đã hết chỗ đỗ cho xe '{vehicleType.Name}'. Vui lòng điều hướng xe di chuyển sang Tầng '{otherArea.Floor.FloorCode}' ({otherArea.Floor.FloorName}) vẫn còn chỗ.", StatusCodes.Status400BadRequest);
                    }

                    throw new BusinessException($"Tất cả các tầng đều đã hết chỗ đỗ cho xe '{vehicleType.Name}'.", StatusCodes.Status400BadRequest);
                }

                // Get alternatives
                var alternatives = areas
                    .Where(a => a.Id != suggestedArea.Id && a.CurrentRealOccupancy + a.CurrentBookedSlots < a.TotalCapacity)
                    .Take(5)
                    .Select(a => new LocationAlternativeResponse
                    {
                        FloorId = a.FloorId,
                        FloorCode = a.Floor.FloorCode,
                        AreaId = a.Id,
                        AreaCode = a.AreaCode,
                        SlotId = null,
                        SlotCode = null,
                        AvailableCapacity = a.TotalCapacity - (a.CurrentRealOccupancy + a.CurrentBookedSlots),
                        TotalCapacity = a.TotalCapacity
                    })
                    .ToList();

                var payload = new LocationSuggestionPayload
                {
                    SuggestionType = "AREA",
                    VehicleTypeId = request.VehicleTypeId,
                    EntryGateId = gate.Id,
                    SuggestedFloorId = suggestedArea.FloorId,
                    SuggestedAreaId = suggestedArea.Id,
                    SuggestedSlotId = null,
                    IssuedToStaffId = staffId,
                    IssuedAt = DateTimeOffset.UtcNow,
                    ExpiresAt = expiresAt
                };

                var token = _tokenService.CreateToken(payload);

                return new LocationSuggestionResponse
                {
                    SuggestionType = "AREA",
                    VehicleTypeId = request.VehicleTypeId,
                    EntryGateId = request.EntryGateId,
                    SuggestedEntryGateId = gate.Id,
                    SuggestedEntryGateCode = gate.GateCode,
                    IsFloorSwitched = false,
                    SuggestedFloorId = suggestedArea.FloorId,
                    SuggestedFloorCode = suggestedArea.Floor.FloorCode,
                    SuggestedAreaId = suggestedArea.Id,
                    SuggestedAreaCode = suggestedArea.AreaCode,
                    SuggestedSlotId = null,
                    SuggestedSlotCode = null,
                    AvailableCapacity = suggestedArea.TotalCapacity - (suggestedArea.CurrentRealOccupancy + suggestedArea.CurrentBookedSlots),
                    TotalCapacity = suggestedArea.TotalCapacity,
                    SuggestionToken = token,
                    ExpiresAt = expiresAt,
                    Alternatives = alternatives
                };
            }
        }
    }
}