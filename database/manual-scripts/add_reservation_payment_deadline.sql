-- Phase 1: Add reservation payment deadline columns
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ NULL;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS ix_reservations_payment_deadline ON reservations(payment_deadline);
CREATE INDEX IF NOT EXISTS ix_reservations_confirmed_at ON reservations(confirmed_at);
