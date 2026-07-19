using System;
using System.Threading.Tasks;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Application.Payments
{
    public interface IPaymentService
    {
        Task<Payment> CreateCashPaymentAsync(CashPaymentRequest request, long staffId);
        Task<Payment> CreateWaivedPaymentAsync(long sessionId, string waiveReason, long managerId);
        Task<Payment?> GetPaymentBySessionAsync(long sessionId);
    }

    public class CashPaymentRequest
    {
        public long SessionId { get; set; }
        public decimal Amount { get; set; }
        public decimal LostCardFee { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class WaivePaymentRequest
    {
        public long SessionId { get; set; }
        public string WaiveReason { get; set; } = string.Empty;
    }
}
