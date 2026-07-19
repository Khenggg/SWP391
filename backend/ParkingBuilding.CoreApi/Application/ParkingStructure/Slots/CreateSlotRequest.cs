public class CreateSlotRequest
{
    public long AreaId { get; set; }

    public string SlotCode { get; set; } = null!;

    public long AllowedVehicleTypeId { get; set; }
}