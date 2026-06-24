using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ParkingBuilding.CoreApi.Domain.Entities;

[Table("monthly_passes")] // Ánh xạ đúng tên bảng trong SQL
public class MonthlyPass
{
    [Key]
    public long Id { get; set; }
    public long? DriverId { get; set; }
    public long CardId { get; set; }
    public string OwnerName { get; set; } = null!;
    public string? Phone { get; set; }
    public string PlateNumber { get; set; } = null!;
    public string NormalizedPlateNumber { get; set; } = null!;
    public long VehicleTypeId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public long CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}