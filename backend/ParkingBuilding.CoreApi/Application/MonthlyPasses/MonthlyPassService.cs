using System;
using Microsoft.AspNetCore.Http;
using ParkingBuilding.CoreApi.Contracts.Common;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public class MonthlyPassService : IMonthlyPassService
    {
        private readonly ParkingDbContext _context;

        public MonthlyPassService(ParkingDbContext context)
        {
            _context = context;
        }

        public async Task<MonthlyPass> CreateMonthlyPassAsync(CreateMonthlyPassRequest request, long userId)
        {
            if (request.EndDate < request.StartDate)
                throw new BusinessException(ErrorCodes.InvalidDateRange);

            var normalizedPlate = NormalizePlate(request.PlateNumber);

            // Check card
            var card = await _context.ParkingCards.FindAsync(request.CardId);
            if (card == null)
                throw new BusinessException(ErrorCodes.CardNotFound);

            if (card.Status != CardStatus.AVAILABLE)
            {
                throw new BusinessException(ErrorCodes.CardNotAvailableForMonthlyPass);
            }

            // Check active card mapping
            var activeCardMappingExists = await _context.MonthlyPasses
                .AnyAsync(m => m.CardId == request.CardId && m.Status == "ACTIVE");
            if (activeCardMappingExists)
                throw new BusinessException(ErrorCodes.CardAlreadyMapped);

            // Check active plate type mapping
            var activePlateExists = await _context.MonthlyPasses
                .AnyAsync(m => m.NormalizedPlateNumber == normalizedPlate && m.VehicleTypeId == request.VehicleTypeId && m.Status == "ACTIVE");
            if (activePlateExists)
                throw new BusinessException(ErrorCodes.PlateAlreadyMapped);

            // Check vehicle type
            var vehicleType = await _context.VehicleTypes.FindAsync(request.VehicleTypeId);
            if (vehicleType == null)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            long? floorId = null;
            long? areaId = null;
            long? slotId = null;

            if (vehicleType.RequiresSlot)
            {
                if (!request.SlotId.HasValue)
                    throw new BusinessException(ErrorCodes.SlotRequired);

                var slot = await _context.Slots
                    .Include(s => s.Area)
                        .ThenInclude(a => a.Floor)
                    .FirstOrDefaultAsync(s => s.Id == request.SlotId.Value);

                if (slot == null)
                    throw new BusinessException(ErrorCodes.SlotNotFound);

                if (slot.Area == null || slot.Area.Status != "ACTIVE")
                {
                    throw new BusinessException(ErrorCodes.SlotAreaInactive);
                }

                if (slot.Area.Floor == null || slot.Area.Floor.Status != "ACTIVE")
                {
                    throw new BusinessException(ErrorCodes.SlotFloorInactive);
                }

                if (slot.AllowedVehicleTypeId != request.VehicleTypeId)
                    throw new BusinessException(ErrorCodes.SlotVehicleTypeMismatch);

                if (slot.Status != "AVAILABLE")
                    throw new BusinessException(ErrorCodes.SlotNotAvailable);

                // Check slot already mapped to active pass
                var activeSlotPassExists = await _context.MonthlyPasses
                    .AnyAsync(m => m.SlotId == request.SlotId.Value && m.Status == "ACTIVE");
                if (activeSlotPassExists)
                    throw new BusinessException(ErrorCodes.SlotAlreadyMapped);

                slotId = slot.Id;
                areaId = slot.AreaId;
                floorId = slot.Area.FloorId;
            }
            else
            {
                if (!request.AreaId.HasValue)
                    throw new BusinessException(ErrorCodes.AreaRequired);

                if (request.SlotId.HasValue)
                    throw new BusinessException(ErrorCodes.SlotNotAllowedForVehicleType);

                var area = await _context.Areas
                    .Include(a => a.Floor)
                    .FirstOrDefaultAsync(a => a.Id == request.AreaId.Value);

                if (area == null)
                    throw new BusinessException(ErrorCodes.AreaNotFound);

                if (area.Floor == null || area.Floor.Status != "ACTIVE")
                {
                    throw new BusinessException(ErrorCodes.AreaFloorInactive);
                }

                if (area.Status != "ACTIVE")
                    throw new BusinessException(ErrorCodes.AreaInactive);

                // Check vehicle type compatibility with area
                var supportsVehicle = await _context.Set<AreaVehicleType>()
                    .AnyAsync(av => av.AreaId == request.AreaId.Value && av.VehicleTypeId == request.VehicleTypeId);
                if (!supportsVehicle)
                    throw new BusinessException(ErrorCodes.AreaVehicleTypeMismatch);

                areaId = area.Id;
                floorId = area.FloorId;
            }

            var monthlyPass = new MonthlyPass
            {
                DriverId = request.DriverId,
                CardId = request.CardId,
                OwnerName = request.OwnerName.Trim(),
                Phone = request.Phone?.Trim(),
                PlateNumber = request.PlateNumber.Trim(),
                NormalizedPlateNumber = normalizedPlate,
                VehicleTypeId = request.VehicleTypeId,
                FloorId = floorId,
                AreaId = areaId,
                SlotId = slotId,
                StartDate = request.StartDate.Date,
                EndDate = request.EndDate.Date,
                Status = "ACTIVE",
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.MonthlyPasses.Add(monthlyPass);
            await _context.SaveChangesAsync();

            return monthlyPass;
        }

        public async Task<MonthlyPass> UpdateMonthlyPassAsync(long id, UpdateMonthlyPassRequest request, long userId)
        {
            var pass = await _context.MonthlyPasses.FindAsync(id);
            if (pass == null)
                throw new BusinessException(ErrorCodes.MonthlyPassNotFound, StatusCodes.Status404NotFound);

            var normalizedPlate = NormalizePlate(request.PlateNumber);

            // If active and plate/type changed, check constraints
            if (pass.Status == "ACTIVE" && (pass.NormalizedPlateNumber != normalizedPlate))
            {
                var activePlateExists = await _context.MonthlyPasses
                    .AnyAsync(m => m.Id != id && m.NormalizedPlateNumber == normalizedPlate && m.VehicleTypeId == pass.VehicleTypeId && m.Status == "ACTIVE");
                if (activePlateExists)
                    throw new BusinessException(ErrorCodes.PlateAlreadyMapped);
            }

            var vehicleType = await _context.VehicleTypes.FindAsync(pass.VehicleTypeId);
            if (vehicleType == null)
                throw new BusinessException(ErrorCodes.VehicleTypeNotFound);

            long? floorId = pass.FloorId;
            long? areaId = pass.AreaId;
            long? slotId = pass.SlotId;

            if (vehicleType.RequiresSlot)
            {
                if (!request.SlotId.HasValue)
                    throw new BusinessException(ErrorCodes.SlotRequired);

                if (pass.SlotId != request.SlotId.Value)
                {
                    var slot = await _context.Slots
                        .Include(s => s.Area)
                            .ThenInclude(a => a.Floor)
                        .FirstOrDefaultAsync(s => s.Id == request.SlotId.Value);

                    if (slot == null)
                        throw new BusinessException(ErrorCodes.SlotNotFound);

                    if (slot.Area == null || slot.Area.Status != "ACTIVE")
                    {
                        throw new BusinessException(ErrorCodes.SlotAreaInactive);
                    }

                    if (slot.Area.Floor == null || slot.Area.Floor.Status != "ACTIVE")
                    {
                        throw new BusinessException(ErrorCodes.SlotFloorInactive);
                    }

                    if (slot.AllowedVehicleTypeId != pass.VehicleTypeId)
                        throw new BusinessException(ErrorCodes.SlotVehicleTypeMismatch);

                    if (slot.Status != "AVAILABLE")
                        throw new BusinessException(ErrorCodes.SlotNotAvailable);

                    // Check slot mapping
                    var activeSlotPassExists = await _context.MonthlyPasses
                        .AnyAsync(m => m.Id != id && m.SlotId == request.SlotId.Value && m.Status == "ACTIVE");
                    if (activeSlotPassExists)
                        throw new BusinessException(ErrorCodes.SlotAlreadyMapped);

                    slotId = slot.Id;
                    areaId = slot.AreaId;
                    floorId = slot.Area.FloorId;
                }
            }
            else
            {
                if (!request.AreaId.HasValue)
                    throw new BusinessException(ErrorCodes.AreaRequired);

                if (request.SlotId.HasValue)
                    throw new BusinessException(ErrorCodes.SlotNotAllowedForVehicleType);

                if (pass.AreaId != request.AreaId.Value)
                {
                    var area = await _context.Areas
                        .Include(a => a.Floor)
                        .FirstOrDefaultAsync(a => a.Id == request.AreaId.Value);
                    if (area == null)
                        throw new BusinessException(ErrorCodes.AreaNotFound);

                    if (area.Floor == null || area.Floor.Status != "ACTIVE")
                    {
                        throw new BusinessException(ErrorCodes.AreaFloorInactive);
                    }

                    if (area.Status != "ACTIVE")
                        throw new BusinessException(ErrorCodes.AreaInactive);

                    var supportsVehicle = await _context.Set<AreaVehicleType>()
                        .AnyAsync(av => av.AreaId == request.AreaId.Value && av.VehicleTypeId == pass.VehicleTypeId);
                    if (!supportsVehicle)
                        throw new BusinessException(ErrorCodes.AreaVehicleTypeMismatch);

                    areaId = area.Id;
                    floorId = area.FloorId;
                }
                slotId = null;
            }

            pass.OwnerName = request.OwnerName.Trim();
            pass.Phone = request.Phone?.Trim();
            pass.PlateNumber = request.PlateNumber.Trim();
            pass.NormalizedPlateNumber = normalizedPlate;
            pass.FloorId = floorId;
            pass.AreaId = areaId;
            pass.SlotId = slotId;
            pass.UpdatedAt = DateTime.UtcNow;

            _context.MonthlyPasses.Update(pass);
            await _context.SaveChangesAsync();

            return pass;
        }

        public async Task<MonthlyPass> RenewAsync(long id, RenewMonthlyPassRequest request, long userId)
        {
            var pass = await _context.MonthlyPasses.FindAsync(id);
            if (pass == null)
                throw new BusinessException(ErrorCodes.MonthlyPassNotFound, StatusCodes.Status404NotFound);

            if (pass.Status == "LOCKED")
                throw new BusinessException(ErrorCodes.MonthlyPassLocked);

            var newEndDate = request.NewEndDate.Date;
            if (newEndDate < pass.StartDate || newEndDate < pass.EndDate)
                throw new BusinessException(ErrorCodes.InvalidDateRange);

            pass.EndDate = newEndDate;
            // If it was expired, renew sets it back to active
            if (pass.Status == "EXPIRED" || pass.EndDate >= DateTime.UtcNow.Date)
            {
                pass.Status = "ACTIVE";
            }
            pass.UpdatedAt = DateTime.UtcNow;

            _context.MonthlyPasses.Update(pass);
            await _context.SaveChangesAsync();

            return pass;
        }

        public async Task<MonthlyPass> ChangeStatusAsync(long id, string status, long userId)
        {
            var pass = await _context.MonthlyPasses.FindAsync(id);
            if (pass == null)
                throw new BusinessException(ErrorCodes.MonthlyPassNotFound, StatusCodes.Status404NotFound);

            var normalizedStatus = status.ToUpperInvariant();
            if (normalizedStatus != "ACTIVE" && normalizedStatus != "EXPIRED" && normalizedStatus != "LOCKED")
                throw new BusinessException(ErrorCodes.InvalidStatus);

            pass.Status = normalizedStatus;
            pass.UpdatedAt = DateTime.UtcNow;

            _context.MonthlyPasses.Update(pass);
            await _context.SaveChangesAsync();

            return pass;
        }

        public async Task<MonthlyPass?> FindValidPassAsync(string plateNumber, long vehicleTypeId, DateTimeOffset time)
        {
            var normalizedPlate = NormalizePlate(plateNumber);
            var checkDate = time.UtcDateTime.Date;

            // Load and check the active monthly pass
            var pass = await _context.MonthlyPasses
                .Include(p => p.Floor)
                .Include(p => p.Area)
                .Include(p => p.Slot)
                .FirstOrDefaultAsync(p => p.NormalizedPlateNumber == normalizedPlate &&
                                          p.VehicleTypeId == vehicleTypeId &&
                                          p.Status == "ACTIVE" &&
                                          p.StartDate <= checkDate &&
                                          p.EndDate >= checkDate);
            return pass;
        }

        public bool IsValid(MonthlyPass pass, DateTimeOffset time)
        {
            if (pass == null) return false;
            if (pass.Status == "LOCKED") throw new BusinessException(ErrorCodes.MonthlyPassLocked);

            var checkDate = time.UtcDateTime.Date;
            if (pass.Status == "EXPIRED" || checkDate < pass.StartDate || checkDate > pass.EndDate)
                throw new BusinessException(ErrorCodes.MonthlyPassExpired);

            return pass.Status == "ACTIVE";
        }

        private string NormalizePlate(string plate)
        {
            if (string.IsNullOrWhiteSpace(plate)) return string.Empty;
            return Regex.Replace(plate.ToUpperInvariant(), @"[^A-Z0-9]", "");
        }
    }
}
