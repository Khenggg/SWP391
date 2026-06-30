using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Exit
{
    public interface IFeeCalculationService
    {
        Task<FeeCalculationResult> CalculateFeeAsync(long sessionId, DateTimeOffset exitTime, bool includeLostCardFee = false);
        Task<FeeCalculationResult> CalculateTemporaryFeeAsync(long sessionId, DateTimeOffset currentTime);
        Task<PricingRule> GetPricingSnapshotOrActiveRuleAsync(ParkingSession session);
    }

    public class FeeCalculationResult
    {
        public long SessionId { get; set; }
        public DateTimeOffset EntryTime { get; set; }
        public DateTimeOffset ExitTime { get; set; }
        public decimal Amount { get; set; }
        public decimal LostCardFee { get; set; }
        public decimal TotalAmount { get; set; }
        public List<FeeBreakdownItem> Breakdown { get; set; } = new();
    }

    public class FeeBreakdownItem
    {
        public string TimeFrame { get; set; } = string.Empty; // "DAY" or "NIGHT"
        public int Blocks { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Amount { get; set; }
    }
}
