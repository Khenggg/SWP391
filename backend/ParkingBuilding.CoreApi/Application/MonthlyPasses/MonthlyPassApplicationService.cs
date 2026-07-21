using System;
using System.Collections.Generic;
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

namespace ParkingBuilding.CoreApi.Application.MonthlyPasses
{
    public class MonthlyPassApplicationService
    {
        private readonly ParkingDbContext _context;
        private readonly IAuditWriterService _auditWriter;

        public MonthlyPassApplicationService(ParkingDbContext context, IAuditWriterService auditWriter)
        {
            _context = context;
            _auditWriter = auditWriter;
        }

        public async Task<MonthlyPassApplication> SubmitApplicationAsync(SubmitApplicationRequest request, long userId)
        {
            var driverProfile = await _context.DriverProfiles
                .FirstOrDefaultAsync(dp => dp.UserId == userId);
            if (driverProfile == null)
            {
                throw new BusinessException(ErrorCodes.DriverProfileNotFound, StatusCodes.Status404NotFound);
            }

            // 1. Tạo Vehicle PENDING trước
            var normalizedPlate = request.LicensePlate.Replace("-", "").Replace(".", "").Replace(" ", "").ToUpper();

            // Kiểm tra trùng biển số xe đang hoạt động
            var duplicate = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.NormalizedPlateNumber == normalizedPlate && v.Status == "ACTIVE");
            if (duplicate != null)
            {
                throw new BusinessException("LICENSE_PLATE_ALREADY_EXISTS", StatusCodes.Status400BadRequest);
            }

            var isCar = "CAR".Equals(request.VehicleType, StringComparison.OrdinalIgnoreCase);
            var vehicleTypeObj = await _context.VehicleTypes
                .FirstOrDefaultAsync(vt => vt.IsActive && vt.RequiresSlot == isCar);
            if (vehicleTypeObj == null)
            {
                throw new BusinessException("INVALID_VEHICLE_TYPE", StatusCodes.Status400BadRequest);
            }

            var vehicle = new Vehicle
            {
                DriverId = driverProfile.Id,
                PlateNumber = request.LicensePlate,
                NormalizedPlateNumber = normalizedPlate,
                VehicleTypeId = vehicleTypeObj.Id,
                Brand = request.Brand,
                Color = request.Color,
                ApprovalStatus = "PENDING",
                Description = request.Description,
                Status = "ACTIVE",
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            // 2. Tìm bảng giá
            var activeRule = await _context.PricingRules
                .Where(p => p.VehicleTypeId == vehicle.VehicleTypeId && p.Status == "ACTIVE")
                .OrderByDescending(p => p.EffectiveFrom)
                .FirstOrDefaultAsync();
            if (activeRule == null)
            {
                throw new BusinessException(ErrorCodes.PricingRuleNotFound, StatusCodes.Status404NotFound);
            }

            // 3. Tạo MonthlyPassApplication
            var application = new MonthlyPassApplication
            {
                DriverId = driverProfile.Id,
                VehicleId = vehicle.Id,
                StartDate = DateTime.SpecifyKind(request.StartDate.Date, DateTimeKind.Utc),
                Price = activeRule.MonthlyPrice,
                Status = "PENDING",
                CccdFrontImageUrl = request.CccdFrontImageUrl,
                CccdBackImageUrl = request.CccdBackImageUrl,
                FaceImageUrl = request.FaceImageUrl,
                PlateImageUrl = request.PlateImageUrl,
                Note = request.Note,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.MonthlyPassApplications.Add(application);
            await _context.SaveChangesAsync();

            await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
            {
                ActorUserId = userId,
                Action = "SUBMIT",
                TargetType = "MONTHLY_PASS_APPLICATION",
                TargetId = application.Id.ToString(),
                NewValue = JsonSerializer.Serialize(application)
            });

            return application;
        }

        public async Task<(List<MonthlyPassApplicationResponse> Items, int TotalItems, int TotalPages)> GetListAsync(
            string? keyword, string? status, int page, int pageSize, long userId, string role)
        {
            var query = _context.MonthlyPassApplications
                .Include(a => a.Vehicle)
                .ThenInclude(v => v.VehicleType)
                .Include(a => a.Driver)
                .Include(a => a.AssignedCard)
                .AsQueryable();

            if (role == "DRIVER")
            {
                var driverProfile = await _context.DriverProfiles
                    .FirstOrDefaultAsync(dp => dp.UserId == userId);
                if (driverProfile == null)
                {
                    throw new BusinessException(ErrorCodes.DriverProfileNotFound, StatusCodes.Status404NotFound);
                }
                query = query.Where(a => a.DriverId == driverProfile.Id);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(a => a.Status == status.ToUpperInvariant());
            }

            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(a => a.Vehicle.PlateNumber.Contains(keyword) || a.Driver.FullName.Contains(keyword));
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            var list = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var itemsResponse = list.Select(MapToResponse).ToList();

            return (itemsResponse, totalItems, totalPages);
        }

        public async Task<MonthlyPassApplicationResponse> GetDetailAsync(long id, long userId, string role)
        {
            var application = await _context.MonthlyPassApplications
                .Include(a => a.Vehicle)
                .ThenInclude(v => v.VehicleType)
                .Include(a => a.Driver)
                .Include(a => a.AssignedCard)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
            {
                throw new BusinessException(ErrorCodes.NotFound, StatusCodes.Status404NotFound);
            }

            if (role == "DRIVER")
            {
                var driverProfile = await _context.DriverProfiles
                    .FirstOrDefaultAsync(dp => dp.UserId == userId);
                if (driverProfile == null || application.DriverId != driverProfile.Id)
                {
                    throw new BusinessException(ErrorCodes.Forbidden, StatusCodes.Status403Forbidden);
                }
            }

            return MapToResponse(application);
        }

        public async Task<MonthlyPassApplicationResponse> UpdateApplicationAsync(long id, UpdateApplicationRequest request, long userId, string role)
        {
            var application = await _context.MonthlyPassApplications
                .Include(a => a.Vehicle)
                .ThenInclude(v => v.VehicleType)
                .Include(a => a.Driver)
                .Include(a => a.AssignedCard)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
            {
                throw new BusinessException(ErrorCodes.NotFound, StatusCodes.Status404NotFound);
            }

            if (role == "DRIVER")
            {
                var driverProfile = await _context.DriverProfiles
                    .FirstOrDefaultAsync(dp => dp.UserId == userId);
                if (driverProfile == null || application.DriverId != driverProfile.Id)
                {
                    throw new BusinessException(ErrorCodes.Forbidden, StatusCodes.Status403Forbidden);
                }

                if (application.Status != "DRAFT" && application.Status != "PENDING")
                {
                    throw new BusinessException("CAN_ONLY_MODIFY_DRAFT_OR_PENDING", StatusCodes.Status400BadRequest);
                }
            }

            var vehicle = await _context.Vehicles
                .Include(v => v.VehicleType)
                .FirstOrDefaultAsync(v => v.Id == request.VehicleId);
            if (vehicle == null)
            {
                throw new BusinessException(ErrorCodes.VehicleNotFound, StatusCodes.Status404NotFound);
            }

            if (vehicle.DriverId != application.DriverId)
            {
                throw new BusinessException(ErrorCodes.VehicleNotBelongToDriver, StatusCodes.Status400BadRequest);
            }

            if (vehicle.ApprovalStatus != "APPROVED")
            {
                throw new BusinessException("VEHICLE_NOT_APPROVED", StatusCodes.Status400BadRequest);
            }

            var oldVal = JsonSerializer.Serialize(application);

            application.VehicleId = vehicle.Id;
            application.StartDate = DateTime.SpecifyKind(request.StartDate.Date, DateTimeKind.Utc);

            // Recalculate price
            var activeRule = await _context.PricingRules
                .Where(p => p.VehicleTypeId == vehicle.VehicleTypeId && p.Status == "ACTIVE")
                .OrderByDescending(p => p.EffectiveFrom)
                .FirstOrDefaultAsync();
            if (activeRule != null)
            {
                application.Price = activeRule.MonthlyPrice;
            }

            application.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
            {
                ActorUserId = userId,
                Action = "UPDATE",
                TargetType = "MONTHLY_PASS_APPLICATION",
                TargetId = application.Id.ToString(),
                OldValue = oldVal,
                NewValue = JsonSerializer.Serialize(application)
            });

            return MapToResponse(application);
        }

        public async Task<MonthlyPassApplicationResponse> ReviewApplicationAsync(long id, ReviewApplicationRequest request, long userId)
        {
            var application = await _context.MonthlyPassApplications
                .Include(a => a.Vehicle)
                .ThenInclude(v => v.VehicleType)
                .Include(a => a.Driver)
                .Include(a => a.AssignedCard)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
            {
                throw new BusinessException(ErrorCodes.NotFound, StatusCodes.Status404NotFound);
            }

            if (application.Status != "PENDING")
            {
                throw new BusinessException("APPLICATION_NOT_PENDING", StatusCodes.Status400BadRequest);
            }

            var oldVal = JsonSerializer.Serialize(application);

            if (request.Status == "APPROVED_AWAITING_PAYMENT")
            {
                // Verify capacity
                var availableAreas = await _context.Areas
                    .Include(a => a.AreaVehicleTypes)
                    .Where(a => a.Status == "ACTIVE" && a.AreaVehicleTypes.Any(av => av.VehicleTypeId == application.Vehicle.VehicleTypeId))
                    .ToListAsync();
                bool hasCapacity = availableAreas.Any(a => a.CurrentRealOccupancy + a.CurrentBookedSlots < a.TotalCapacity);
                if (!hasCapacity)
                {
                    throw new BusinessException("NO_PARKING_CAPACITY", StatusCodes.Status400BadRequest);
                }

                application.Status = "APPROVED_AWAITING_PAYMENT";
                application.RejectionReason = request.Reason;

                if (application.Vehicle != null)
                {
                    application.Vehicle.ApprovalStatus = "APPROVED";
                    application.Vehicle.UpdatedAt = DateTimeOffset.UtcNow;
                }
            }
            else if (request.Status == "REJECTED")
            {
                if (string.IsNullOrEmpty(request.Reason))
                {
                    throw new BusinessException("REJECTION_REASON_REQUIRED", StatusCodes.Status400BadRequest);
                }
                application.Status = "REJECTED";
                application.RejectionReason = request.Reason;

                if (application.Vehicle != null)
                {
                    application.Vehicle.ApprovalStatus = "REJECTED";
                    application.Vehicle.UpdatedAt = DateTimeOffset.UtcNow;
                }
            }
            else
            {
                throw new BusinessException(ErrorCodes.InvalidStatus, StatusCodes.Status400BadRequest);
            }

            application.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
            {
                ActorUserId = userId,
                Action = "REVIEW",
                TargetType = "MONTHLY_PASS_APPLICATION",
                TargetId = application.Id.ToString(),
                OldValue = oldVal,
                NewValue = JsonSerializer.Serialize(application),
                Reason = request.Reason
            });

            return MapToResponse(application);
        }

        public async Task<MonthlyPassApplicationResponse> ConfirmPaymentAsync(long id, ConfirmPaymentRequest request, long userId)
        {
            var application = await _context.MonthlyPassApplications
                .Include(a => a.Vehicle)
                .ThenInclude(v => v.VehicleType)
                .Include(a => a.Driver)
                .Include(a => a.AssignedCard)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
            {
                throw new BusinessException(ErrorCodes.NotFound, StatusCodes.Status404NotFound);
            }

            if (application.Status != "APPROVED_AWAITING_PAYMENT")
            {
                throw new BusinessException("APPLICATION_NOT_AWAITING_PAYMENT", StatusCodes.Status400BadRequest);
            }

            var oldVal = JsonSerializer.Serialize(application);

            application.Status = "PAID";
            application.PaymentMethod = request.PaymentMethod;
            application.PaymentReferenceNo = request.ReferenceNo;
            application.UpdatedAt = DateTime.UtcNow;

            var payment = new Payment
            {
                MonthlyPassId = null,
                Amount = application.Price,
                TotalAmount = application.Price,
                Purpose = "MONTHLY_PASS_RENEWAL",
                Method = request.PaymentMethod,
                Status = "PAID",
                PaidAt = DateTime.UtcNow,
                CollectedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
            {
                ActorUserId = userId,
                Action = "PAYMENT_CONFIRM",
                TargetType = "MONTHLY_PASS_APPLICATION",
                TargetId = application.Id.ToString(),
                OldValue = oldVal,
                NewValue = JsonSerializer.Serialize(application)
            });

            return MapToResponse(application);
        }

        public async Task<MonthlyPassApplicationResponse> AssignRfidAsync(long id, AssignRfidRequest request, long userId)
        {
            var application = await _context.MonthlyPassApplications
                .Include(a => a.Vehicle)
                .ThenInclude(v => v.VehicleType)
                .Include(a => a.Driver)
                .Include(a => a.AssignedCard)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
            {
                throw new BusinessException(ErrorCodes.NotFound, StatusCodes.Status404NotFound);
            }

            if (application.Status != "PAID")
            {
                throw new BusinessException("APPLICATION_NOT_PAID", StatusCodes.Status400BadRequest);
            }

            var card = await _context.ParkingCards
                .FirstOrDefaultAsync(c => c.CardNumber == request.RfidCardCode);
            if (card == null)
            {
                throw new BusinessException(ErrorCodes.CardNotFound, StatusCodes.Status404NotFound);
            }

            if (card.Status != CardStatus.AVAILABLE)
            {
                throw new BusinessException(ErrorCodes.CardNotAvailable, StatusCodes.Status400BadRequest);
            }

            var cardAssigned = await _context.MonthlyPasses
                .AnyAsync(mp => mp.CardId == card.Id && mp.Status == "ACTIVE");
            if (cardAssigned)
            {
                throw new BusinessException("CARD_ALREADY_ASSIGNED", StatusCodes.Status400BadRequest);
            }

            var oldVal = JsonSerializer.Serialize(application);

            application.Status = "ACTIVE";
            application.AssignedCardId = card.Id;
            application.AssignedCard = card;
            application.UpdatedAt = DateTime.UtcNow;

            var monthlyPass = new MonthlyPass
            {
                DriverId = application.DriverId,
                CardId = card.Id,
                OwnerName = application.Driver.FullName,
                Phone = application.Driver.Phone,
                PlateNumber = application.Vehicle.PlateNumber,
                NormalizedPlateNumber = application.Vehicle.NormalizedPlateNumber ?? application.Vehicle.PlateNumber.Replace("-", "").ToUpperInvariant(),
                VehicleTypeId = application.Vehicle.VehicleTypeId,
                StartDate = DateTime.SpecifyKind(application.StartDate.Date, DateTimeKind.Utc),
                EndDate = DateTime.SpecifyKind(application.StartDate.Date.AddMonths(1), DateTimeKind.Utc),
                Status = "ACTIVE",
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.MonthlyPasses.Add(monthlyPass);
            await _context.SaveChangesAsync();

            // Link the payment to the created monthly pass
            var payment = await _context.Payments
                .Where(p => p.CollectedBy == userId && p.Amount == application.Price && p.Purpose == "MONTHLY_PASS_RENEWAL" && p.MonthlyPassId == null)
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefaultAsync();
            if (payment != null)
            {
                payment.MonthlyPassId = monthlyPass.Id;
                await _context.SaveChangesAsync();
            }

            await _auditWriter.WriteAuditLogAsync(new AuditWriteDto
            {
                ActorUserId = userId,
                Action = "ASSIGN_RFID",
                TargetType = "MONTHLY_PASS_APPLICATION",
                TargetId = application.Id.ToString(),
                OldValue = oldVal,
                NewValue = JsonSerializer.Serialize(application)
            });

            return MapToResponse(application);
        }

        public async Task<Payment> CreateOnlinePaymentAsync(long applicationId, long userId)
        {
            var application = await _context.MonthlyPassApplications
                .Include(a => a.Vehicle)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
                throw new BusinessException(ErrorCodes.NotFound, StatusCodes.Status404NotFound);

            if (application.Status != "APPROVED_AWAITING_PAYMENT")
                throw new BusinessException(ErrorCodes.InvalidRequest, StatusCodes.Status400BadRequest);

            var existing = await _context.Payments
                .Where(p => p.MonthlyPassApplicationId == applicationId
                         && p.Status == "PENDING"
                         && p.ExpiredAt > DateTimeOffset.UtcNow)
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefaultAsync();

            if (existing != null && !string.IsNullOrEmpty(existing.PaymentUrl))
                return existing;

            var payment = new Payment
            {
                MonthlyPassApplicationId = applicationId,
                Amount = application.Price,
                TotalAmount = application.Price,
                Purpose = "MONTHLY_PASS_RENEWAL",
                Method = "BANK_TRANSFER",
                Status = "PENDING",
                ExpiredAt = DateTimeOffset.UtcNow.AddMinutes(15),
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return payment;
        }
        private MonthlyPassApplicationResponse MapToResponse(MonthlyPassApplication application)
        {
            // Query other vehicles and passes for this driver
            var driverVehicles = _context.Vehicles
                .Include(v => v.VehicleType)
                .Where(v => v.DriverId == application.DriverId && v.Status == "ACTIVE")
                .ToList();

            var monthlyPasses = _context.MonthlyPasses
                .Where(mp => mp.DriverId == application.DriverId)
                .ToList();

            var driverVehicleStatuses = new List<DriverVehicleStatusDto>();
            foreach (var v in driverVehicles)
            {
                var pass = monthlyPasses
                    .Where(mp => mp.PlateNumber == v.PlateNumber)
                    .OrderByDescending(mp => mp.EndDate)
                    .FirstOrDefault();

                string passStatus = "NONE";
                DateTime? endDate = null;
                if (pass != null)
                {
                    endDate = pass.EndDate;
                    if (pass.Status == "ACTIVE" && pass.EndDate >= DateTime.UtcNow.Date)
                    {
                        passStatus = "ACTIVE";
                    }
                    else
                    {
                        passStatus = "EXPIRED";
                    }
                }

                driverVehicleStatuses.Add(new DriverVehicleStatusDto
                {
                    Id = v.Id,
                    LicensePlate = v.PlateNumber,
                    VehicleTypeName = v.VehicleType?.Name ?? "Unknown",
                    Brand = v.Brand ?? "—",
                    Color = v.Color ?? "—",
                    ApprovalStatus = v.ApprovalStatus ?? "PENDING",
                    MonthlyPassStatus = passStatus,
                    MonthlyPassEndDate = endDate
                });
            }

            return new MonthlyPassApplicationResponse
            {
                Id = application.Id,
                DriverId = application.DriverId,
                VehicleId = application.VehicleId,
                VehiclePlateNumber = application.Vehicle?.PlateNumber ?? "—",
                VehicleTypeName = application.Vehicle?.VehicleType?.Name ?? "Unknown",
                StartDate = application.StartDate,
                Price = application.Price,
                Status = application.Status,
                RejectionReason = application.RejectionReason,
                PaymentMethod = application.PaymentMethod,
                PaymentReferenceNo = application.PaymentReferenceNo,
                AssignedCardId = application.AssignedCardId,
                AssignedCardCode = application.AssignedCard?.CardNumber,
                CreatedAt = application.CreatedAt,
                UpdatedAt = application.UpdatedAt,

                CccdFrontImageUrl = application.CccdFrontImageUrl,
                CccdBackImageUrl = application.CccdBackImageUrl,
                FaceImageUrl = application.FaceImageUrl,
                PlateImageUrl = application.PlateImageUrl,
                Note = application.Note,

                DriverFullName = application.Driver?.FullName ?? "—",
                DriverPhone = application.Driver?.Phone ?? "—",
                DriverEmail = application.Driver?.Email ?? "—",
                DriverApartmentNumber = application.Driver?.ApartmentNumber ?? "—",
                DriverResidentVerified = application.Driver?.ResidentVerified ?? false,

                DriverVehicles = driverVehicleStatuses
            };
        }
    }
}
