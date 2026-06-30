using Microsoft.AspNetCore.Http;

namespace ParkingBuilding.CoreApi.Application.LostCards.Documents;

public class UploadLostCardDocumentsBatchRequest
{
    public List<IFormFile> Files { get; set; } = [];
    public List<string> DocumentTypes { get; set; } = [];
    public List<string?> Notes { get; set; } = [];
}
