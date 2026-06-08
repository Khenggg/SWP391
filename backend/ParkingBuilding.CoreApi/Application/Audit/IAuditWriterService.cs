using System.Threading.Tasks;
using ParkingBuilding.CoreApi.Application.Audit.Dtos;

namespace ParkingBuilding.CoreApi.Application.Audit
{
    public interface IAuditWriterService
    {
        Task WriteAuditLogAsync(AuditWriteDto dto);

        Task WriteAuditLogAsync(
            string action,
            string targetType,
            string targetId,
            long? actorUserId = null,
            string? oldValue = null,
            string? newValue = null,
            string? reason = null,
            string? ipAddress = null,
            string? userAgent = null);
    }
}
