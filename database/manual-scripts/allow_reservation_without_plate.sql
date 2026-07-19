-- Manual SQL patch to allow reservations without plate number
-- Re-configures unique index to ignore NULL plate numbers

BEGIN;

-- 1. Drop NOT NULL constraint on plate columns in reservations
ALTER TABLE reservations ALTER COLUMN plate_number DROP NOT NULL;
ALTER TABLE reservations ALTER COLUMN normalized_plate_number DROP NOT NULL;

-- 2. Drop old pending/active reservation unique indexes for plate
DROP INDEX IF EXISTS ux_pending_reservation_by_plate_type;
DROP INDEX IF EXISTS ux_active_reservation_by_plate_type;

-- 3. Recreate unique index for active reservations with plate
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_reservation_by_plate_type
ON reservations(normalized_plate_number, vehicle_type_id)
WHERE normalized_plate_number IS NOT NULL
  AND status IN ('PENDING', 'CONFIRMED');

-- 4. Update check constraint
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS ck_reservations_plate_required;
ALTER TABLE reservations ADD CONSTRAINT ck_reservations_plate_required CHECK (
    (plate_number IS NULL AND normalized_plate_number IS NULL)
    OR (NULLIF(BTRIM(plate_number), '') IS NOT NULL AND NULLIF(BTRIM(normalized_plate_number), '') IS NOT NULL)
);

COMMIT;
