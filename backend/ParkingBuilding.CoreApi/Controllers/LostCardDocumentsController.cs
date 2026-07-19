using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Application.LostCards.Documents;
using ParkingBuilding.CoreApi.Contracts.Common;
using System.Security.Claims;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize(Roles = "STAFF,MANAGER,ADMIN")]
    [Route("api/core/lost-cards")]
    public class LostCardDocumentsController : BaseApiController
    {
        private readonly ILostCardDocumentService _documentService;

        public LostCardDocumentsController(ILostCardDocumentService documentService)
        {
            _documentService = documentService;
        }

        [HttpPost("{caseId:long}/documents")]
        [RequestSizeLimit(10_485_760)]
        public async Task<IActionResult> Upload(
            long caseId,
            [FromForm] UploadLostCardDocumentRequest request,
            CancellationToken ct)
        {
            var actorUserId = GetCurrentUserIdOrThrow();
            var result = await _documentService.UploadAsync(
                caseId,
                request.File,
                request.DocumentType,
                request.Note,
                actorUserId,
                ct);

            return CreatedSuccess(result, "Upload lost card document successfully.");
        }

        [HttpPost("{caseId:long}/documents/batch")]
        [RequestSizeLimit(31_457_280)]
        public async Task<IActionResult> UploadBatch(
            long caseId,
            [FromForm] UploadLostCardDocumentsBatchRequest request,
            CancellationToken ct)
        {
            var actorUserId = GetCurrentUserIdOrThrow();
            var result = await _documentService.UploadBatchAsync(
                caseId,
                request.Files,
                request.DocumentTypes,
                request.Notes,
                actorUserId,
                ct);

            return CreatedSuccess(result, "Upload lost card documents successfully.");
        }

        [HttpGet("{caseId:long}/documents")]
        public async Task<IActionResult> GetByCase(long caseId, CancellationToken ct)
        {
            var result = await _documentService.GetByCaseAsync(caseId, ct);
            return Success(result, "Get lost card documents successfully.");
        }

        [Authorize(Roles = "MANAGER,ADMIN")]
        [HttpDelete("{caseId:long}/documents/{documentId:long}")]
        public async Task<IActionResult> Delete(
            long caseId,
            long documentId,
            CancellationToken ct)
        {
            var actorUserId = GetCurrentUserIdOrThrow();
            await _documentService.DeleteAsync(caseId, documentId, actorUserId, ct);
            return Success("Delete lost card document successfully.");
        }

        private long GetCurrentUserIdOrThrow()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdMissing);
            }

            if (!long.TryParse(userIdClaim, out var userId))
            {
                throw new BusinessException(ErrorCodes.AuthUserIdInvalid);
            }

            return userId;
        }
    }
}
