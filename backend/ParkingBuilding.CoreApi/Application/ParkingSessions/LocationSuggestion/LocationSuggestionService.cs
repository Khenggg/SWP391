using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Contracts.Common;
using Microsoft.Extensions.Configuration;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

            if (vehicleType.RequiresSlot)
            {
                var suggestedSlot = await _dbContext.Slots
                    .Include(s => s.Area)
                        .ThenInclude(a => a.Floor)
                    .Where(s =>
                        s.Status == "AVAILABLE" &&
                        s.AllowedVehicleTypeId == request.VehicleTypeId &&
                        s.Area.FloorId == gate.FloorId &&
                        s.Area.Status == "ACTIVE" &&
                        s.Area.Floor.Status == "ACTIVE" &&
                        s.Area.AreaVehicleTypes.Any(avt => avt.VehicleTypeId == request.VehicleTypeId))
                    .OrderBy(s => s.Area.PriorityOrder)
                    .ThenBy(s => s.Id)
                    .FirstOrDefaultAsync();

                if (suggestedSlot == null)
                    throw new BusinessException(ErrorCodes.NoAvailableLocation);

                // Get alternatives
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
                        s.Area.AreaVehicleTypes.Any(avt => avt.VehicleTypeId == request.VehicleTypeId))
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
                    EntryGateId = request.EntryGateId,
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

                // Filter in memory for capacity to handle simple operations safely
                var suggestedArea = areas.FirstOrDefault(a => a.CurrentRealOccupancy + a.CurrentBookedSlots < a.TotalCapacity);

                if (suggestedArea == null)
                    throw new BusinessException(ErrorCodes.NoAvailableLocation);

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
                    EntryGateId = request.EntryGateId,
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