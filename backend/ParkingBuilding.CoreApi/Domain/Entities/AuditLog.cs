using System;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class AuditLog
    {
        public long Id { get; set; }
        public long? ActorUserId { get; set; }
        public string SourceService { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string TargetType { get; set; } = string.Empty;
        public string TargetId { get; set; } = string.Empty;
        public string? OldValue { get; set; } // JSONB stored as string
        public string? NewValue { get; set; } // JSONB stored as string
        public string? Reason { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        // Navigation property
        public User? ActorUser { get; set; }
    }
}
