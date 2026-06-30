namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;

public class CreateEntryRequest
{
    public string EntryMode { get; set; } = "CASUAL";
    // CASUAL, MONTHLY, RESERVATION

    public long? MonthlyPassId { get; set; }
    public string? MonthlyEntryToken { get; set; }

    public long? ReservationId { get; set; }
    public string? ReservationEntryToken { get; set; }
    public long? ConvertedFromReservationId { get; set; }
    public string CardCode { get; set; } = null!;
    public string? LicensePlate { get; set; }
    public bool NoPlate { get; set; }
    public string? VehicleDescription { get; set; }
    public long VehicleTypeId { get; set; }
    public long EntryGateId { get; set; }
    public long? SelectedSlotId { get; set; }
    public long? SelectedAreaId { get; set; }
    public string? SuggestionToken { get; set; }
    public string? OverrideReason { get; set; }

    public string? EntryPlateImageUrl { get; set; }
    public string? EntryVehicleImageUrl { get; set; }
    public string? DetectedPlateNumber { get; set; }
    public string? DetectedNormalizedPlateNumber { get; set; }
    public decimal? OcrConfidence { get; set; }
}