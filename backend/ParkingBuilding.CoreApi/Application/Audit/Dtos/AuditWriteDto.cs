namespace ParkingBuilding.CoreApi.Application.Audit.Dtos
{
    public class AuditWriteDto
    {
        public long? ActorUserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string TargetType { get; set; } = string.Empty;
        public string TargetId { get; set; } = string.Empty;
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string? Reason { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}
