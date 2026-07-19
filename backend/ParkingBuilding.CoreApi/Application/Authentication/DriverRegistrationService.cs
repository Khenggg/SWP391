using System;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Contracts.Requests;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.Authentication;

public sealed class DriverRegistrationService : IDriverRegistrationService
{
    private readonly ParkingDbContext _context;

    public DriverRegistrationService(ParkingDbContext context)
    {
        _context = context;
    }

    public async Task<DriverRegistrationResult> RegisterAsync(RegisterRequest request, string? ipAddress)
    {
        var username = UsernamePolicy.Normalize(request.Username);
        var email = request.Email!.Trim().ToLowerInvariant();
        var phone = request.Phone!.Trim();
        var fullName = request.FullName!.Trim();
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password!);
        var now = DateTimeOffset.UtcNow;

        var strategy = _context.Database.CreateExecutionStrategy();

        try
        {
            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

                if (await _context.Users.AnyAsync(user => user.Username.ToLower() == username.ToLower()))
                {
                    throw new BusinessException(ErrorCodes.UsernameAlreadyExists, StatusCodes.Status409Conflict);
                }

                if (await _context.Users.AnyAsync(user => user.Email != null && user.Email.ToLower() == email))
                {
                    throw new BusinessException(ErrorCodes.EmailAlreadyExists, StatusCodes.Status409Conflict);
                }

                if (await _context.Users.AnyAsync(user => user.Phone == phone))
                {
                    throw new BusinessException(ErrorCodes.PhoneAlreadyExists, StatusCodes.Status409Conflict);
                }

                var user = new User
                {
                    FullName = fullName,
                    Username = username,
                    Email = email,
                    Phone = phone,
                    PasswordHash = passwordHash,
                    Role = Domain.Enums.UserRole.DRIVER,
                    Status = Domain.Enums.UserStatus.ACTIVE,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var driverProfile = new DriverProfile
                {
                    UserId = user.Id,
                    FullName = fullName,
                    Email = email,
                    Phone = phone,
                    Status = "ACTIVE",
                    DriverType = "VISITOR",
                    ResidentVerified = false,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                _context.DriverProfiles.Add(driverProfile);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new DriverRegistrationResult(
                    user.Id,
                    driverProfile.Id,
                    user.FullName,
                    user.Username,
                    user.Email!,
                    user.Phone!,
                    user.Role.ToString().ToUpperInvariant(),
                    user.Status.ToString().ToUpperInvariant(),
                    user.CreatedAt);
            });
        }
        catch (DriverRegistrationConflictException)
        {
            throw;
        }
        catch (BusinessException)
        {
            throw;
        }
        catch (DbUpdateException exception) when (TryGetDuplicateErrorCode(exception) is not null)
        {
            throw new DriverRegistrationConflictException(TryGetDuplicateErrorCode(exception)!);
        }
    }

    private static string? TryGetDuplicateErrorCode(DbUpdateException exception)
    {
        var postgresException = exception.InnerException as PostgresException;
        return postgresException?.ConstraintName switch
        {
            "ux_users_username_lower" or "ux_users_username" => ErrorCodes.UsernameAlreadyExists,
            "ux_users_email_lower" or "ux_users_email" => ErrorCodes.EmailAlreadyExists,
            "ux_users_phone" or "ux_driver_profiles_phone" => ErrorCodes.PhoneAlreadyExists,
            "ux_driver_profiles_email" => ErrorCodes.EmailAlreadyExists,
            _ => null
        };
    }
}
