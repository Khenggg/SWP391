using Microsoft.AspNetCore.Mvc;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using ParkingBuilding.CoreApi.Domain.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authorization;

namespace ParkingBuilding.CoreApi.Controllers
{
    [Route("api/core/health")] // Định nghĩa Route rõ ràng tại cấp Controller
    public class HealthController : BaseApiController
    {
        private readonly ParkingDbContext _context;
        private readonly IWebHostEnvironment _env;

        public HealthController(ParkingDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet] // Kích hoạt phương thức GET cho endpoint /api/core/health
        public IActionResult GetHealth()
        {
            var data = new
            {
                service = "ParkingBuilding.CoreApi",
                status = "UP"
            };
            return Success(data, "Core API is running");
        }

        // DEV ONLY: This endpoint is only for local integration testing.
        // Do not enable it in production/demo environment.
        [HttpGet("dump-reservations")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DumpReservations()
        {
            if (!_env.IsDevelopment())
            {
                return Failure(
                    message: "Endpoint chỉ được dùng trong môi trường development.",
                    errorCode: "DEVELOPMENT_ONLY_ENDPOINT",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden
                );
            }

            var list = await _context.Reservations
                .Select(r => new {
                    r.Id,
                    r.ReservationCode,
                    r.PlateNumber,
                    r.NormalizedPlateNumber,
                    r.SlotId,
                    r.AreaId,
                    r.Status,
                    r.PaymentStatus,
                    r.ExpiresAt
                })
                .ToListAsync();
            return Success(list, "Dump reservations successfully.");
        }

        // DEV ONLY: This endpoint is only for local integration testing.
        // Do not enable it in production/demo environment.
        [HttpGet("dump-session/{sessionId:long}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DumpSession(long sessionId)
        {
            if (!_env.IsDevelopment())
            {
                return Failure(
                    message: "Endpoint chi duoc dung trong moi truong development.",
                    errorCode: "DEVELOPMENT_ONLY_ENDPOINT",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden
                );
            }

            var session = await _context.ParkingSessions
                .Include(s => s.Reservation)
                .Include(s => s.ParkingSessionImages)
                .Where(s => s.Id == sessionId)
                .Select(s => new
                {
                    s.Id,
                    s.SessionCode,
                    s.Status,
                    s.CustomerType,
                    s.PaymentRequired,
                    s.PaymentStatus,
                    s.ReservationId,
                    ReservationStatus = s.Reservation != null ? s.Reservation.Status : null,
                    ReservationPaymentStatus = s.Reservation != null ? s.Reservation.PaymentStatus : null,
                    s.CardId,
                    s.PlateNumber,
                    s.NormalizedPlateNumber,
                    s.NoPlate,
                    s.VehicleTypeId,
                    s.EntryGateId,
                    s.EntryStaffId,
                    s.EntryTime,
                    s.BillableStartTime,
                    s.FloorId,
                    s.AreaId,
                    s.SlotId,
                    Images = s.ParkingSessionImages
                        .OrderBy(i => i.Id)
                        .Select(i => new
                        {
                            i.Id,
                            i.ImageType,
                            i.ImageUrl,
                            i.DetectedPlateNumber,
                            i.DetectedNormalizedPlateNumber,
                            i.Confidence,
                            i.IsPrimary,
                            i.CapturedAt
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (session == null)
            {
                return Failure(
                    message: "Session not found.",
                    errorCode: "SESSION_NOT_FOUND",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status404NotFound
                );
            }

            return Success(session, "Dump session successfully.");
        }

        // DEV ONLY: This endpoint is only for local integration testing.
        // Do not enable it in production/demo environment.
        [HttpPost("clear-reservations")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> ClearReservations()
        {
            if (!_env.IsDevelopment())
            {
                return Failure(
                    message: "Endpoint chỉ được dùng trong môi trường development.",
                    errorCode: "DEVELOPMENT_ONLY_ENDPOINT",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden
                );
            }

            // Delete notifications first to prevent foreign key issues on monthly passes
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM notifications");

            var slots = await _context.Slots.ToListAsync();
            foreach (var slot in slots)
            {
                slot.Status = "AVAILABLE";
                slot.CurrentSessionId = null;
            }

            var areas = await _context.Areas.ToListAsync();
            foreach (var area in areas)
            {
                area.CurrentBookedSlots = 0;
                area.CurrentRealOccupancy = 0;
            }

            var cards = await _context.ParkingCards.ToListAsync();
            foreach (var card in cards)
            {
                card.Status = CardStatus.AVAILABLE;
                card.CurrentSessionId = null;
            }

            await _context.SaveChangesAsync();

            try {
                var receipts = await _context.Receipts.ToListAsync();
                _context.Receipts.RemoveRange(receipts);
                await _context.SaveChangesAsync();
            } catch {}

            try {
                var sessionImages = await _context.ParkingSessionImages.ToListAsync();
                _context.ParkingSessionImages.RemoveRange(sessionImages);
                await _context.SaveChangesAsync();
            } catch {}

            try {
                var mismatchCases = await _context.PlateMismatchCases.ToListAsync();
                _context.PlateMismatchCases.RemoveRange(mismatchCases);
                await _context.SaveChangesAsync();
            } catch {}

            try {
                var lostCardDocs = await _context.LostCardCaseDocuments.ToListAsync();
                _context.LostCardCaseDocuments.RemoveRange(lostCardDocs);
                await _context.SaveChangesAsync();
            } catch {}

            try {
                var payments = await _context.Payments.ToListAsync();
                _context.Payments.RemoveRange(payments);
                await _context.SaveChangesAsync();
            } catch {}

            try {
                var sessions = await _context.ParkingSessions.ToListAsync();
                _context.ParkingSessions.RemoveRange(sessions);
                await _context.SaveChangesAsync();
            } catch {}

            try {
                var allPasses = await _context.MonthlyPasses.ToListAsync();
                _context.MonthlyPasses.RemoveRange(allPasses);
                await _context.SaveChangesAsync();
            } catch {}

            try {
                var allApps = await _context.MonthlyPassApplications.ToListAsync();
                _context.MonthlyPassApplications.RemoveRange(allApps);
                await _context.SaveChangesAsync();
            } catch {}

            try {
                var extensions = await _context.ReservationExtensions.ToListAsync();
                _context.ReservationExtensions.RemoveRange(extensions);
                await _context.SaveChangesAsync();
            } catch {}

            try {
                var reservations = await _context.Reservations.ToListAsync();
                _context.Reservations.RemoveRange(reservations);
                await _context.SaveChangesAsync();
            } catch {}

            try {
                var testMonthlyPasses = await _context.MonthlyPasses
                    .Where(m => m.Id >= 1000 ||
                                m.PlateNumber.StartsWith("TEST-") ||
                                m.PlateNumber.StartsWith("TMP-") ||
                                m.PlateNumber.StartsWith("AUTO-") ||
                                m.PlateNumber.Contains("AUTO"))
                    .ToListAsync();
                _context.MonthlyPasses.RemoveRange(testMonthlyPasses);
                await _context.SaveChangesAsync();
            } catch {}
            return Success(new { message = "All reservations, sessions, monthly passes, and audit logs cleared. Slots, areas, and cards reset successfully." }, "Clear reservations successfully.");
        }

        [HttpPost("migrate-db")]
        [AllowAnonymous]
        public async Task<IActionResult> MigrateDb()
        {
            if (!_env.IsDevelopment())
            {
                return Failure(
                    message: "Endpoint chỉ được dùng trong môi trường development.",
                    errorCode: "DEVELOPMENT_ONLY_ENDPOINT",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden
                );
            }

            await _context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE monthly_passes ADD COLUMN IF NOT EXISTS floor_id BIGINT REFERENCES floors(id);
                ALTER TABLE monthly_passes ADD COLUMN IF NOT EXISTS area_id BIGINT REFERENCES areas(id);
                ALTER TABLE monthly_passes ADD COLUMN IF NOT EXISTS slot_id BIGINT REFERENCES slots(id);

                CREATE INDEX IF NOT EXISTS ix_monthly_passes_floor_id ON monthly_passes(floor_id);
                CREATE INDEX IF NOT EXISTS ix_monthly_passes_area_id ON monthly_passes(area_id);
                CREATE INDEX IF NOT EXISTS ix_monthly_passes_slot_id ON monthly_passes(slot_id);

                DROP INDEX IF EXISTS ux_active_monthly_pass_slot;
                CREATE UNIQUE INDEX IF NOT EXISTS ux_active_monthly_pass_slot
                ON monthly_passes(slot_id)
                WHERE status = 'ACTIVE' AND slot_id IS NOT NULL;

                -- Allow reservations without plate number
                ALTER TABLE reservations ALTER COLUMN plate_number DROP NOT NULL;
                ALTER TABLE reservations ALTER COLUMN normalized_plate_number DROP NOT NULL;

                DROP INDEX IF EXISTS ux_pending_reservation_by_plate_type;
                DROP INDEX IF EXISTS ux_active_reservation_by_plate_type;

                CREATE UNIQUE INDEX IF NOT EXISTS ux_active_reservation_by_plate_type
                ON reservations(normalized_plate_number, vehicle_type_id)
                WHERE normalized_plate_number IS NOT NULL
                  AND status IN ('PENDING', 'CONFIRMED');

                -- Update check constraint
                ALTER TABLE reservations DROP CONSTRAINT IF EXISTS ck_reservations_plate_required;
                ALTER TABLE reservations ADD CONSTRAINT ck_reservations_plate_required CHECK (
                    (plate_number IS NULL AND normalized_plate_number IS NULL)
                    OR (NULLIF(BTRIM(plate_number), '') IS NOT NULL AND NULLIF(BTRIM(normalized_plate_number), '') IS NOT NULL)
                );

                -- Seed users (nếu chưa có)
                INSERT INTO users (id, full_name, username, email, phone, password_hash, role, status, created_at, updated_at)
                VALUES
                    (3, 'Driver User', 'driver01', 'driver01@parking.com', '0900000003', '$2a$11$Z.L401fM2jJjA2h9o4y2u.UqWp9v68z4Ww/Q75p5Q.Y1L0.86r28G', 'DRIVER', 'ACTIVE', now(), now()),
                    (4, 'Other Driver', 'driver02', 'driver02@parking.com', '0900000004', '$2a$11$Z.L401fM2jJjA2h9o4y2u.UqWp9v68z4Ww/Q75p5Q.Y1L0.86r28G', 'DRIVER', 'ACTIVE', now(), now())
                ON CONFLICT (id) DO NOTHING;

                -- Seed driver_profiles (nếu chưa có)
                INSERT INTO driver_profiles (id, user_id, full_name, phone, email, status, driver_type, apartment_number, cccd_number, created_at, updated_at)
                VALUES
                    (1, 3, 'Driver User', '0900000003', 'driver01@parking.com', 'ACTIVE', 'RESIDENT', 'A-101', '123456789012', now(), now()),
                    (2, 4, 'Other Driver', '0900000004', 'driver02@parking.com', 'ACTIVE', 'RESIDENT', 'B-202', '123456789013', now(), now())
                ON CONFLICT (id) DO NOTHING;

                -- Seed vehicles (nếu chưa có)
                INSERT INTO vehicles (id, driver_id, plate_number, normalized_plate_number, vehicle_type_id, description, status, created_at, updated_at)
                VALUES
                    (2, 2, '29A-88888', '29A88888', 5, 'Other Driver Car', 'ACTIVE', now(), now()),
                    (3, 1, '29A-11111', '29A11111', 5, 'Driver owned car', 'ACTIVE', now(), now())
                ON CONFLICT (id) DO NOTHING;

                -- Ensure driver_id is correctly mapped even if vehicles/profiles already existed
                UPDATE vehicles SET driver_id = 2 WHERE id = 2;
                UPDATE vehicles SET driver_id = 1 WHERE id = 3;

                -- Add reservation payment deadline columns
                ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ NULL;
                ALTER TABLE reservations ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ NULL;
                CREATE INDEX IF NOT EXISTS ix_reservations_payment_deadline ON reservations(payment_deadline);
                CREATE INDEX IF NOT EXISTS ix_reservations_confirmed_at ON reservations(confirmed_at);

                -- Create monthly_pass_applications table
                CREATE TABLE IF NOT EXISTS monthly_pass_applications (
                    id BIGSERIAL PRIMARY KEY,
                    driver_id BIGINT NOT NULL REFERENCES driver_profiles(id),
                    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id),
                    start_date DATE NOT NULL,
                    price NUMERIC(12,2) NOT NULL DEFAULT 0,
                    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
                    rejection_reason TEXT,
                    payment_method VARCHAR(30),
                    payment_reference_no VARCHAR(120),
                    assigned_card_id BIGINT REFERENCES parking_cards(id),
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    CONSTRAINT ck_monthly_pass_applications_status CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED_AWAITING_PAYMENT', 'PAID', 'ACTIVE', 'EXPIRED', 'REJECTED'))
                );

                -- Drop and recreate ck_payments_source check constraint to allow NULL monthly_pass_id for pending RFID
                ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payments_source;
                ALTER TABLE payments ADD CONSTRAINT ck_payments_source CHECK (
                    (
                        purpose = 'MONTHLY_PASS_RENEWAL'
                        AND session_id IS NULL
                        AND reservation_id IS NULL
                    )
                    OR (
                        purpose IN ('RESERVATION_FEE', 'RESERVATION_EXTENSION')
                        AND reservation_id IS NOT NULL
                        AND session_id IS NULL
                        AND monthly_pass_id IS NULL
                    )
                    OR (
                        purpose IN ('PARKING_FEE', 'LOST_CARD_FEE', 'LOST_CARD_REFUND')
                        AND session_id IS NOT NULL
                        AND reservation_id IS NULL
                        AND monthly_pass_id IS NULL
                    )
                );
            ");

            var constraints = new System.Collections.Generic.List<string>();
            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = @"
                    SELECT conname || ': ' || pg_get_constraintdef(oid)
                    FROM pg_constraint
                    WHERE conrelid = 'reservations'::regclass AND contype = 'c';";

                var wasOpen = _context.Database.GetDbConnection().State == System.Data.ConnectionState.Open;
                if (!wasOpen) await _context.Database.GetDbConnection().OpenAsync();
                try
                {
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            constraints.Add(reader.GetString(0));
                        }
                    }
                }
                finally
                {
                    if (!wasOpen) await _context.Database.GetDbConnection().CloseAsync();
                }
            }

            return Success(new { message = "Database migrated successfully.", constraints = constraints }, "Database migrated successfully.");
        }

        [HttpPost("expire-reservation")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> ExpireReservation([FromQuery] string reservationCode)
        {
            if (!_env.IsDevelopment())
            {
                return Failure(
                    message: "Endpoint chỉ được dùng trong môi trường development.",
                    errorCode: "DEVELOPMENT_ONLY_ENDPOINT",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden
                );
            }

            var reservation = await _context.Reservations.FirstOrDefaultAsync(r => r.ReservationCode == reservationCode);
            if (reservation == null)
            {
                return Failure(
                    message: "Reservation not found.",
                    errorCode: "RESERVATION_NOT_FOUND",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status404NotFound
                );
            }

            reservation.ReservedAt = DateTimeOffset.UtcNow.AddMinutes(-65);
            reservation.ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(-5);
            await _context.SaveChangesAsync();

            return Success(new { message = "Reservation expired successfully." }, "Reservation expired successfully.");
        }

        [HttpPost("expire-payment-deadline")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> ExpirePaymentDeadline([FromQuery] string reservationCode)
        {
            if (!_env.IsDevelopment())
            {
                return Failure(
                    message: "Endpoint chỉ được dùng trong môi trường development.",
                    errorCode: "DEVELOPMENT_ONLY_ENDPOINT",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden
                );
            }

            var reservation = await _context.Reservations.FirstOrDefaultAsync(r => r.ReservationCode == reservationCode);
            if (reservation == null)
            {
                return Failure(
                    message: "Reservation not found.",
                    errorCode: "RESERVATION_NOT_FOUND",
                    statusCode: Microsoft.AspNetCore.Http.StatusCodes.Status404NotFound
                );
            }

            reservation.PaymentDeadline = DateTimeOffset.UtcNow.AddMinutes(-5);
            await _context.SaveChangesAsync();

            return Success(new { message = "Payment deadline expired successfully." }, "Payment deadline expired successfully.");
        }
    }
}
