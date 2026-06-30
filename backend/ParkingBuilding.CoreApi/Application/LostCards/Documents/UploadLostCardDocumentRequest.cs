using Microsoft.AspNetCore.Http;

namespace ParkingBuilding.CoreApi.Application.LostCards.Documents;

public class UploadLostCardDocumentRequest
{
    public string DocumentType { get; set; } = string.Empty;
    public IFormFile File { get; set; } = null!;
    public string? Note { get; set; }
}
