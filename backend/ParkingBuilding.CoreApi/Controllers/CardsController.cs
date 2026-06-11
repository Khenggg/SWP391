using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Contracts.Requests;
using ParkingBuilding.CoreApi.Contracts.Responses;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Domain.Enums;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Authorize]
    [Route("api/core/cards")]
    public class CardsController : BaseApiController
    {
        private readonly ParkingDbContext _context;
        private readonly IAuditWriterService _auditWriterService;

        public CardsController(ParkingDbContext context, IAuditWriterService auditWriterService)
        {
            _context = context;
            _auditWriterService = auditWriterService;
        }

        /// <summary>
        /// Retrieve parking cards (paginated, supports search on cardCode and status filters).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCards(
            [FromQuery] string? search,
            [FromQuery] ParkingCardStatus? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var query = _context.ParkingCards.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(c => c.CardCode.ToLower().Contains(s));
            }

            if (status.HasValue)
            {
                query = query.Where(c => c.Status == status.Value);
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(c => c.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new CardDto
                {
                    Id = c.Id,
                    CardCode = c.CardCode,
                    QrToken = c.QrToken,
                    Status = c.Status.ToString(),
                    CurrentSessionId = c.CurrentSessionId,
                    Note = c.Note,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();

            var pagedResponse = new PagedResponse<CardDto>(items, totalCount, page, pageSize);
            return Success(pagedResponse, "Parking cards retrieved successfully.");
        }

        /// <summary>
        /// Retrieve details of a specific parking card by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCardById([FromRoute] long id)
        {
            var card = await _context.ParkingCards.FirstOrDefaultAsync(c => c.Id == id);
            if (card == null)
            {
                return StatusCodeResponse(404, "Card not found", $"No parking card with ID {id} was found.");
            }

            return Success(ToCardDto(card), "Parking card details retrieved successfully.");
        }

        /// <summary>
        /// Create a new parking card (Admin/Manager only).
        /// </summary>
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpPost]
        public async Task<IActionResult> CreateCard([FromBody] CreateCardRequest request)
        {
            if (request == null)
            {
                return Fail("Creation failed", "Request payload cannot be empty.");
            }

            // Check duplicate CardCode
            var cardCodeExists = await _context.ParkingCards
                .AnyAsync(c => c.CardCode.ToLower() == request.CardCode.Trim().ToLower());
            if (cardCodeExists)
            {
                return Fail("Card code already exists", $"The card code '{request.CardCode}' is already taken.");
            }

            // Default status to AVAILABLE if not specified
            var status = request.Status ?? ParkingCardStatus.AVAILABLE;

            // Validate status constraint on creation
            if (status == ParkingCardStatus.IN_USE)
            {
                return Fail("Status validation failed", "A new card cannot be created with status IN_USE because it has no active session.");
            }

            // Generate or validate QrToken
            string qrToken;
            if (!string.IsNullOrWhiteSpace(request.QrToken))
            {
                qrToken = request.QrToken.Trim();
                var qrTokenExists = await _context.ParkingCards
                    .AnyAsync(c => c.QrToken.ToLower() == qrToken.ToLower());
                if (qrTokenExists)
                {
                    return Fail("QR Token already exists", $"The QR Token '{request.QrToken}' is already taken.");
                }
            }
            else
            {
                bool qrExists;
                do
                {
                    qrToken = $"QR-{request.CardCode.Trim().ToUpper()}-{Guid.NewGuid().ToString("N").ToUpper()}";
                    qrExists = await _context.ParkingCards.AnyAsync(c => c.QrToken == qrToken);
                } while (qrExists);
            }

            var actorUserId = GetCurrentUserId();

            var newCard = new ParkingCard
            {
                CardCode = request.CardCode.Trim(),
                QrToken = qrToken,
                Status = status,
                CurrentSessionId = null,
                Note = request.Note?.Trim(),
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.ParkingCards.Add(newCard);
            await _context.SaveChangesAsync();

            var dto = ToCardDto(newCard);
            var serializedValue = System.Text.Json.JsonSerializer.Serialize(dto);

            await _auditWriterService.WriteAuditLogAsync(
                action: "CARD_CREATED",
                targetType: "parking_cards",
                targetId: newCard.Id.ToString(),
                actorUserId: actorUserId,
                newValue: serializedValue,
                reason: $"Parking card '{newCard.CardCode}' created by Admin/Manager."
            );

            return Success(dto, "Parking card created successfully.");
        }

        /// <summary>
        /// Update details of a parking card (Admin/Manager only).
        /// </summary>
        [Authorize(Roles = "ADMIN,MANAGER")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCard([FromRoute] long id, [FromBody] UpdateCardRequest request)
        {
            if (request == null)
            {
                return Fail("Update failed", "Request payload cannot be empty.");
            }

            var card = await _context.ParkingCards.FirstOrDefaultAsync(c => c.Id == id);
            if (card == null)
            {
                return StatusCodeResponse(404, "Card not found", $"No parking card with ID {id} was found.");
            }

            // Check duplicate CardCode excluding current ID
            var cardCodeExists = await _context.ParkingCards
                .AnyAsync(c => c.Id != id && c.CardCode.ToLower() == request.CardCode.Trim().ToLower());
            if (cardCodeExists)
            {
                return Fail("Card code already exists", $"The card code '{request.CardCode}' is already taken.");
            }

            var targetStatus = request.Status ?? ParkingCardStatus.AVAILABLE;

            // Validate status changes against session check constraints
            if (targetStatus == ParkingCardStatus.IN_USE && card.CurrentSessionId == null)
            {
                return Fail("Status validation failed", "Card status cannot be set to IN_USE without a current session ID.");
            }

            if ((targetStatus == ParkingCardStatus.AVAILABLE || targetStatus == ParkingCardStatus.DAMAGED || targetStatus == ParkingCardStatus.INACTIVE) 
                && card.CurrentSessionId != null)
            {
                return Fail("Status validation failed", $"Card status cannot be set to {targetStatus} because it is currently associated with an active session (Session ID {card.CurrentSessionId}).");
            }

            var actorUserId = GetCurrentUserId();
            var oldDto = ToCardDto(card);
            var serializedOld = System.Text.Json.JsonSerializer.Serialize(oldDto);

            card.CardCode = request.CardCode.Trim();
            card.Status = targetStatus;
            card.Note = request.Note?.Trim();
            card.UpdatedAt = DateTimeOffset.UtcNow;

            _context.ParkingCards.Update(card);
            await _context.SaveChangesAsync();

            var newDto = ToCardDto(card);
            var serializedNew = System.Text.Json.JsonSerializer.Serialize(newDto);

            await _auditWriterService.WriteAuditLogAsync(
                action: "CARD_UPDATED",
                targetType: "parking_cards",
                targetId: card.Id.ToString(),
                actorUserId: actorUserId,
                oldValue: serializedOld,
                newValue: serializedNew,
                reason: $"Parking card details updated by Admin/Manager."
            );

            return Success(newDto, "Parking card details updated successfully.");
        }

        private long? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (long.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            return null;
        }

        private static CardDto ToCardDto(ParkingCard c)
        {
            return new CardDto
            {
                Id = c.Id,
                CardCode = c.CardCode,
                QrToken = c.QrToken,
                Status = c.Status.ToString(),
                CurrentSessionId = c.CurrentSessionId,
                Note = c.Note,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            };
        }
    }
}
