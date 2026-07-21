using System.Threading.Tasks;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Application.Payments
{
    public interface IPaymentService
    {
        Task<Payment> CreateCashPaymentAsync(CashPaymentRequest request, long staffId);
        Task<Payment> CreateWaivedPaymentAsync(long sessionId, string waiveReason, long actorId, string actorRole);
        Task<Payment?> GetPaymentBySessionAsync(long sessionId);
    }

    public class CashPaymentRequest
    {
        public long SessionId { get; set; }
        public long? ExitGateId { get; set; }
    }

    public class WaivePaymentRequest
    {
        public long SessionId { get; set; }
        public string WaiveReason { get; set; } = string.Empty;
    }
}
