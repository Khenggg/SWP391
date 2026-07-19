using Microsoft.AspNetCore.Http;

namespace ParkingBuilding.CoreApi.Application.LostCards.Documents;

public interface ILostCardDocumentService
{
    Task<LostCardDocumentResponse> UploadAsync(
        long caseId,
        IFormFile file,
        string documentType,
        string? note,
        long uploadedBy,
        CancellationToken ct = default);

    Task<IReadOnlyList<LostCardDocumentResponse>> UploadBatchAsync(
        long caseId,
        List<IFormFile> files,
        List<string> documentTypes,
        List<string?> notes,
        long uploadedBy,
        CancellationToken ct = default);

    Task<IReadOnlyList<LostCardDocumentResponse>> GetByCaseAsync(
        long caseId,
        CancellationToken ct = default);

    Task DeleteAsync(
        long caseId,
        long documentId,
        long actorUserId,
        CancellationToken ct = default);
}
