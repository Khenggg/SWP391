-- Cleanup test session data so entry flow tests can be re-run
-- WARNING: This resets ALL sessions, cards, slots and area occupancy

BEGIN;

-- 1. Delete notifications
DELETE FROM notifications;

-- 2. Delete payment attempts
DELETE FROM payment_attempts;

-- 3. Delete payments
DELETE FROM payments;

-- 4. Delete session images
DELETE FROM parking_session_images;

-- 5. Delete sessions
DELETE FROM parking_sessions;

-- 6. Delete extensions
DELETE FROM reservation_extensions;

-- 7. Delete reservations
DELETE FROM reservations;

-- 8. Delete monthly passes (only test passes)
DELETE FROM monthly_passes
WHERE id >= 1000
   OR plate_number LIKE 'TEST-%'
   OR plate_number LIKE 'TMP-%'
   OR plate_number LIKE 'AUTO-%'
   OR plate_number LIKE '%AUTO-%';

-- 9. Release cards
UPDATE parking_cards
SET status = 'AVAILABLE',
    current_session_id = NULL,
    updated_at = now();

-- 10. Release slots
UPDATE slots
SET status = 'AVAILABLE',
    current_session_id = NULL,
    updated_at = now();

-- 11. Reset area occupancy counters
UPDATE areas
SET current_real_occupancy = 0,
    current_booked_slots = 0,
    updated_at = now();

COMMIT;
