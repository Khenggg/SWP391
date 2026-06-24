namespace ParkingBuilding.CoreApi.Application.ParkingSessions.Entry;

public class CreateEntryRequest
{
    public string CardCode { get; set; } = null!;
    public string LicensePlate { get; set; } = null!;
    public bool NoPlate { get; set; }
    public string? VehicleDescription { get; set; }
    public long VehicleTypeId { get; set; }
    public long EntryGateId { get; set; }
    public long? SelectedSlotId { get; set; }
    public string? OverrideReason { get; set; }
}