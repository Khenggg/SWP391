ALTER TABLE reservations DROP CONSTRAINT IF EXISTS ck_reservations_status;
ALTER TABLE reservations ADD CONSTRAINT ck_reservations_status CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'EXPIRED'));
