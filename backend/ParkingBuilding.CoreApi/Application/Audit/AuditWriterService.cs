using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using ParkingBuilding.CoreApi.Application.Audit.Dtos;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ParkingBuilding.CoreApi.Application.Audit
{
    public class AuditWriterService : IAuditWriterService
    {
        private readonly ParkingDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AuditWriterService> _logger;

        public AuditWriterService(
            ParkingDbContext context,
            IHttpContextAccessor httpContextAccessor,
            ILogger<AuditWriterService> logger)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task WriteAuditLogAsync(AuditWriteDto dto)
        {
            try
            {
                var auditLog = new AuditLog
                {
                    SourceService = "CORE_API",
                    Action = dto.Action ?? "UNKNOWN",
                    TargetType = dto.TargetType ?? "SYSTEM",
                    TargetId = dto.TargetId ?? "0",
                    OldValue = EnsureValidJson(dto.OldValue),
                    NewValue = EnsureValidJson(dto.NewValue),
                    CreatedAt = DateTimeOffset.UtcNow
                };

                var httpContext = _httpContextAccessor.HttpContext;

                long? resolvedActorUserId = dto.ActorUserId;
                string? resolvedIp = dto.IpAddress;
                string? resolvedUserAgent = dto.UserAgent;

                if (httpContext != null)
                {
                    // Resolve Client IP if not provided
                    if (string.IsNullOrWhiteSpace(resolvedIp))
                    {
                        resolvedIp = httpContext.Connection.RemoteIpAddress?.ToString();
                    }

                    // Resolve User Agent if not provided
                    if (string.IsNullOrWhiteSpace(resolvedUserAgent))
                    {
                        resolvedUserAgent = httpContext.Request.Headers["User-Agent"].ToString();
                    }

                    // Resolve Actor User ID if not provided
                    if (resolvedActorUserId == null && httpContext.User?.Identity?.IsAuthenticated == true)
                    {
                        var userIdClaim = httpContext.User.FindFirst("user_id")?.Value;
                        if (long.TryParse(userIdClaim, out var userId))
                        {
                            resolvedActorUserId = userId;
                        }
                    }
                }

                // Denormalize IP and User Agent into the 'reason' field since there are no separate columns
                var ipStr = !string.IsNullOrWhiteSpace(resolvedIp) ? resolvedIp : "Unknown";
                var uaStr = !string.IsNullOrWhiteSpace(resolvedUserAgent) ? resolvedUserAgent : "Unknown";
                var trackingPrefix = $"[IP: {ipStr}] [UA: {uaStr}]";

                var finalReason = string.IsNullOrWhiteSpace(dto.Reason)
                    ? trackingPrefix
                    : $"{trackingPrefix} - {dto.Reason}";

                // Truncate tracking + reason if too long for safety, though 'reason' is text (unlimited)
                auditLog.Reason = finalReason;
                auditLog.ActorUserId = resolvedActorUserId;

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to insert audit log for action '{Action}'", dto.Action);
                throw;
            }
        }

        private string? EnsureValidJson(string? value)
        {
            if (string.IsNullOrEmpty(value)) return null;
            var trimmed = value.Trim();
            if ((trimmed.StartsWith("{") && trimmed.EndsWith("}")) ||
                (trimmed.StartsWith("[") && trimmed.EndsWith("]")) ||
                (trimmed.StartsWith("\"") && trimmed.EndsWith("\"")) ||
                trimmed.Equals("null", StringComparison.OrdinalIgnoreCase) ||
                trimmed.Equals("true", StringComparison.OrdinalIgnoreCase) ||
                trimmed.Equals("false", StringComparison.OrdinalIgnoreCase) ||
                decimal.TryParse(trimmed, out _))
            {
                return trimmed;
            }
            return System.Text.Json.JsonSerializer.Serialize(value);
        }

        public Task WriteAuditLogAsync(
            string action,
            string targetType,
            string targetId,
            long? actorUserId = null,
            string? oldValue = null,
            string? newValue = null,
            string? reason = null,
            string? ipAddress = null,
            string? userAgent = null)
        {
            var dto = new AuditWriteDto
            {
                Action = action,
                TargetType = targetType,
                TargetId = targetId,
                ActorUserId = actorUserId,
                OldValue = oldValue,
                NewValue = newValue,
                Reason = reason,
                IpAddress = ipAddress,
                UserAgent = userAgent
            };

            return WriteAuditLogAsync(dto);
        }
    }
}
