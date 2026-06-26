using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public enum CardStatus
    {
        AVAILABLE,
        IN_USE,
        LOST,
        DAMAGED,
        INACTIVE
    }

    public class ParkingCard
    {
        public long Id { get; set; }
        [Column("card_code")] // 2. ÉP EF CORE MAP VÀO CỘT WRITE_CODE DƯỚI DB
        public string CardNumber { get; set; } = string.Empty; // physical card code (mapped to card_code)
        public string QrToken { get; set; } = string.Empty;    // QR token identifier
        public CardStatus Status { get; set; } = CardStatus.AVAILABLE;
        public long? CurrentSessionId { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}


