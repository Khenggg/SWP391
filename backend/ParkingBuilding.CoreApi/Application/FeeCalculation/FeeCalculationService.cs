using System;

namespace ParkingBuilding.CoreApi.Application.FeeCalculation;

public class FeeCalculationService : IFeeCalculationService
{
    private const int DayStartHour = 6;  // 06:00 sáng bắt đầu ca ngày
    private const int DayEndHour = 18;   // 18:00 chiều bắt đầu ca đêm

    public decimal CalculateFee(DateTimeOffset entryTime, DateTimeOffset exitTime, decimal dayPrice, decimal nightPrice)
    {
        if (exitTime <= entryTime) return 0m;

        decimal totalFee = 0m;

        // Chuẩn hóa thời gian về cùng múi giờ để tính ca chính xác (thường là +07:00 của Việt Nam)
        DateTimeOffset current = entryTime;

        bool chargedDayInCurrentTurn = false;
        bool chargedNightInCurrentTurn = false;

        // Vòng lặp chạy tiến theo từng giờ từ lúc vào đến lúc ra để bắt chính xác các mốc giao ca
        while (current < exitTime)
        {
            int hour = current.Hour;

            if (hour >= DayStartHour && hour < DayEndHour)
            {
                // Thuộc khung giờ ca ngày
                if (!chargedDayInCurrentTurn)
                {
                    totalFee += dayPrice;
                    chargedDayInCurrentTurn = true; // Đã thu tiền ca ngày này rồi
                    chargedNightInCurrentTurn = false; // Reset trạng thái ca đêm cho lượt tiếp theo nếu đỗ lâu
                }
            }
            else
            {
                // Thuộc khung giờ ca đêm
                if (!chargedNightInCurrentTurn)
                {
                    totalFee += nightPrice;
                    chargedNightInCurrentTurn = true; // Đã thu tiền ca đêm này rồi
                    chargedDayInCurrentTurn = false; // Reset trạng thái ca ngày cho lượt tiếp theo nếu đỗ lâu
                }
            }

            // Đặc biệt xử lý mốc giao ca để reset bộ đếm lượt khi đỗ xe dài ngày
            if (current.Hour == DayStartHour - 1 && current.AddHours(1).Hour == DayStartHour)
            {
                chargedDayInCurrentTurn = false;
            }
            if (current.Hour == DayEndHour - 1 && current.AddHours(1).Hour == DayEndHour)
            {
                chargedNightInCurrentTurn = false;
            }

            current = current.AddHours(1);
        }

        return Math.Round(totalFee, 2);
    }
}