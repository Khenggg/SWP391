using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using ParkingBuilding.CoreApi.Contracts.Common;

namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Exit
{
    public class FeeCalculationService : IFeeCalculationService
    {
        private readonly ParkingDbContext _context;

        public FeeCalculationService(ParkingDbContext context)
        {
            _context = context;
        }

        public async Task<FeeCalculationResult> CalculateFeeAsync(long sessionId, DateTimeOffset exitTime, bool includeLostCardFee = false)
        {
            var session = await _context.ParkingSessions
                .Include(s => s.PricingRule)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null)
            {
                throw new BusinessException(ErrorCodes.SessionNotFound);
            }

            var result = new FeeCalculationResult
            {
                SessionId = session.Id,
                EntryTime = session.EntryTime,
                ExitTime = exitTime
            };

            // If monthly pass, fee is 0
            if (session.CustomerType == "MONTHLY")
            {
                result.Amount = 0m;
                result.LostCardFee = 0m;
                result.TotalAmount = 0m;
                result.Breakdown.Add(new FeeBreakdownItem
                {
                    TimeFrame = "MONTHLY_PASS",
                    Blocks = 0,
                    UnitPrice = 0m,
                    Amount = 0m
                });
                return result;
            }

            // Get pricing snapshot or active rule
            var pricing = await GetPricingSnapshotOrActiveRuleAsync(session);

            // Calculate active duration
            var startTime = session.BillableStartTime;
            if (exitTime <= startTime)
            {
                result.Amount = 0m;
                result.LostCardFee = 0m;
                result.TotalAmount = 0m;
                result.Breakdown.Add(new FeeBreakdownItem
                {
                    TimeFrame = "DAY",
                    Blocks = 0,
                    UnitPrice = pricing.DayPrice,
                    Amount = 0m
                });
                return result;
            }

            // Split duration into Day and Night timeframes
            var (dayDuration, nightDuration) = SplitDurationByTimeFrame(startTime, exitTime);

            int dayBlocks = CalculateBlocks(dayDuration);
            int nightBlocks = CalculateBlocks(nightDuration);

            decimal dayAmount = dayBlocks * pricing.DayPrice;
            decimal nightAmount = nightBlocks * pricing.NightPrice;

            result.Amount = dayAmount + nightAmount;

            if (dayBlocks > 0)
            {
                result.Breakdown.Add(new FeeBreakdownItem
                {
                    TimeFrame = "DAY",
                    Blocks = dayBlocks,
                    UnitPrice = pricing.DayPrice,
                    Amount = dayAmount
                });
            }

            if (nightBlocks > 0)
            {
                result.Breakdown.Add(new FeeBreakdownItem
                {
                    TimeFrame = "NIGHT",
                    Blocks = nightBlocks,
                    UnitPrice = pricing.NightPrice,
                    Amount = nightAmount
                });
            }

            // Handle lost card fee
            if (includeLostCardFee)
            {
                result.LostCardFee = pricing.LostCardFee;
            }
            else
            {
                result.LostCardFee = 0m;
            }

            result.TotalAmount = result.Amount + result.LostCardFee;

            return result;
        }

        public async Task<FeeCalculationResult> CalculateTemporaryFeeAsync(long sessionId, DateTimeOffset currentTime)
        {
            return await CalculateFeeAsync(sessionId, currentTime, false);
        }

        public async Task<PricingRule> GetPricingSnapshotOrActiveRuleAsync(ParkingSession session)
        {
            // If snapshot prices are already set, use them
            if (session.SnapshotDayPrice > 0 || session.SnapshotNightPrice > 0)
            {
                return new PricingRule
                {
                    Id = session.PricingRuleId ?? 0,
                    VehicleTypeId = session.VehicleTypeId,
                    DayPrice = session.SnapshotDayPrice,
                    NightPrice = session.SnapshotNightPrice,
                    LostCardFee = session.SnapshotLostCardFee,
                    Status = "ACTIVE"
                };
            }

            // If session has PricingRule mapped, return it
            if (session.PricingRule != null)
            {
                return session.PricingRule;
            }

            if (session.PricingRuleId.HasValue)
            {
                var pr = await _context.PricingRules.FindAsync(session.PricingRuleId.Value);
                if (pr != null) return pr;
            }

            // Fallback: active pricing rule for vehicle type
            var activeRule = await _context.PricingRules
                .Where(p => p.VehicleTypeId == session.VehicleTypeId && p.Status == "ACTIVE" && p.EffectiveFrom <= DateTimeOffset.UtcNow)
                .OrderByDescending(p => p.EffectiveFrom)
                .FirstOrDefaultAsync();

            if (activeRule == null)
            {
                throw new BusinessException(ErrorCodes.PricingRuleNotFound);
            }

            return activeRule;
        }

        public static (TimeSpan DayDuration, TimeSpan NightDuration) SplitDurationByTimeFrame(DateTimeOffset start, DateTimeOffset end)
        {
            if (start >= end)
                return (TimeSpan.Zero, TimeSpan.Zero);

            TimeSpan dayDuration = TimeSpan.Zero;
            TimeSpan nightDuration = TimeSpan.Zero;

            // Vietnam Time zone (UTC+7)
            var offset = TimeSpan.FromHours(7);
            DateTimeOffset current = start.ToOffset(offset);
            DateTimeOffset target = end.ToOffset(offset);

            DateTime currentDate = current.Date;
            DateTime targetDate = target.Date;

            for (DateTime d = currentDate; d <= targetDate; d = d.AddDays(1))
            {
                // Day timeframe for date d: [d + 06:00, d + 22:00]
                DateTimeOffset dayStart = new DateTimeOffset(d.AddHours(6), offset);
                DateTimeOffset dayEnd = new DateTimeOffset(d.AddHours(22), offset);

                // Night timeframe part 1: [d + 00:00, d + 06:00]
                DateTimeOffset nightStart1 = new DateTimeOffset(d, offset);
                DateTimeOffset nightEnd1 = new DateTimeOffset(d.AddHours(6), offset);

                // Night timeframe part 2: [d + 22:00, d + 24:00]
                DateTimeOffset nightStart2 = new DateTimeOffset(d.AddHours(22), offset);
                DateTimeOffset nightEnd2 = new DateTimeOffset(d.AddDays(1), offset);

                // Intersection of [current, target] with Day [dayStart, dayEnd]
                dayDuration += GetIntersection(current, target, dayStart, dayEnd);

                // Intersection with Night part 1
                nightDuration += GetIntersection(current, target, nightStart1, nightEnd1);

                // Intersection with Night part 2
                nightDuration += GetIntersection(current, target, nightStart2, nightEnd2);
            }

            return (dayDuration, nightDuration);
        }

        private static TimeSpan GetIntersection(DateTimeOffset startA, DateTimeOffset endA, DateTimeOffset startB, DateTimeOffset endB)
        {
            DateTimeOffset maxStart = startA > startB ? startA : startB;
            DateTimeOffset minEnd = endA < endB ? endA : endB;

            if (maxStart < minEnd)
            {
                return minEnd - maxStart;
            }
            return TimeSpan.Zero;
        }

        private static int CalculateBlocks(TimeSpan duration)
        {
            if (duration <= TimeSpan.Zero)
                return 0;

            double hours = duration.TotalHours;
            return (int)Math.Ceiling(hours / 4.0);
        }
    }
}
