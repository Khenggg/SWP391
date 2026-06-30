using System;

namespace ParkingBuilding.CoreApi.Application.FeeCalculation;

public interface IFeeCalculationService
{
    /// <summary>
    /// Tính toán phí đỗ xe dựa trên thời gian thực tế và cấu hình giá snapshot
    /// </summary>
    decimal CalculateFee(DateTimeOffset entryTime, DateTimeOffset exitTime, decimal dayPrice, decimal nightPrice);
}