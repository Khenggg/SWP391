using System;
using System.Collections.Generic;

namespace ParkingBuilding.CoreApi.Domain.Entities
{
    public class DriverProfile
    {
        public long Id { get; set; }
        public long? UserId { get; set; } // Khớp với BIGINT REFERENCES users(id)
        public virtual User User { get; set; }

        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Status { get; set; } // 'ACTIVE', 'LOCKED', 'INACTIVE'
        public string DriverType { get; set; } // 'RESIDENT', 'VISITOR'
        public string ApartmentNumber { get; set; }
        public string CccdNumber { get; set; }
        public string CccdImageUrl { get; set; }
        public bool ResidentVerified { get; set; }
        public DateTimeOffset? ResidentVerifiedAt { get; set; }
        public long? ResidentVerifiedBy { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }

        public virtual ICollection<ParkingSession> ParkingSessions { get; set; } = new List<ParkingSession>();
    }
}