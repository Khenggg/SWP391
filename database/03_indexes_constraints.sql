-- Parking Building Management System - indexes and late constraints
-- Run after 01_schema.sql and 02_seed.sql.

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_username ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_users_role ON users(role);
CREATE INDEX IF NOT EXISTS ix_users_status ON users(status);

CREATE UNIQUE INDEX IF NOT EXISTS ux_driver_profiles_user_id ON driver_profiles(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_driver_profiles_phone ON driver_profiles(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_driver_profiles_email ON driver_profiles(email) WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_vehicle_types_name ON vehicle_types(name);
CREATE INDEX IF NOT EXISTS ix_vehicle_types_is_active ON vehicle_types(is_active);

CREATE INDEX IF NOT EXISTS ix_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS ix_vehicles_plate ON vehicles(normalized_plate_number);
CREATE INDEX IF NOT EXISTS ix_vehicles_type ON vehicles(vehicle_type_id);
CREATE INDEX IF NOT EXISTS ix_vehicles_status ON vehicles(status);

CREATE UNIQUE INDEX IF NOT EXISTS ux_cards_card_code ON parking_cards(card_code);
CREATE UNIQUE INDEX IF NOT EXISTS ux_cards_qr_token ON parking_cards(qr_token);
CREATE UNIQUE INDEX IF NOT EXISTS ux_cards_current_session ON parking_cards(current_session_id) WHERE current_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_cards_status ON parking_cards(status);
CREATE INDEX IF NOT EXISTS ix_cards_current_session ON parking_cards(current_session_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_floors_code ON floors(floor_code);
CREATE INDEX IF NOT EXISTS ix_floors_status ON floors(status);

CREATE UNIQUE INDEX IF NOT EXISTS ux_areas_floor_code ON areas(floor_id, area_code);
CREATE INDEX IF NOT EXISTS ix_areas_status ON areas(status);
CREATE INDEX IF NOT EXISTS ix_areas_priority ON areas(priority_order);

CREATE INDEX IF NOT EXISTS ix_area_vehicle_types_vehicle_type ON area_vehicle_types(vehicle_type_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_slots_area_code ON slots(area_id, slot_code);
CREATE UNIQUE INDEX IF NOT EXISTS ux_slots_current_session ON slots(current_session_id) WHERE current_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_slots_status ON slots(status);
CREATE INDEX IF NOT EXISTS ix_slots_vehicle_type ON slots(allowed_vehicle_type_id);
CREATE INDEX IF NOT EXISTS ix_slots_current_session ON slots(current_session_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_gates_floor_code ON gates(floor_id, gate_code);
CREATE INDEX IF NOT EXISTS ix_gates_type ON gates(gate_type);
CREATE INDEX IF NOT EXISTS ix_gates_status ON gates(status);

CREATE INDEX IF NOT EXISTS ix_pricing_rules_vehicle_type ON pricing_rules(vehicle_type_id);
CREATE INDEX IF NOT EXISTS ix_pricing_rules_status ON pricing_rules(status);
CREATE INDEX IF NOT EXISTS ix_pricing_rules_effective_from ON pricing_rules(effective_from);
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_pricing_rule_by_vehicle_type
ON pricing_rules(vehicle_type_id)
WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS ix_monthly_pass_plate ON monthly_passes(normalized_plate_number);
CREATE INDEX IF NOT EXISTS ix_monthly_pass_status ON monthly_passes(status);
CREATE INDEX IF NOT EXISTS ix_monthly_pass_dates ON monthly_passes(start_date, end_date);
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_monthly_pass_by_plate_type
ON monthly_passes(normalized_plate_number, vehicle_type_id)
WHERE status = 'ACTIVE';

CREATE UNIQUE INDEX IF NOT EXISTS ux_sessions_session_code ON parking_sessions(session_code);
CREATE INDEX IF NOT EXISTS ix_sessions_card_id ON parking_sessions(card_id);
CREATE INDEX IF NOT EXISTS ix_sessions_plate ON parking_sessions(normalized_plate_number);
CREATE INDEX IF NOT EXISTS ix_sessions_status ON parking_sessions(status);
CREATE INDEX IF NOT EXISTS ix_sessions_entry_time ON parking_sessions(entry_time);
CREATE INDEX IF NOT EXISTS ix_sessions_exit_time ON parking_sessions(exit_time);
CREATE INDEX IF NOT EXISTS ix_sessions_vehicle_type ON parking_sessions(vehicle_type_id);
CREATE INDEX IF NOT EXISTS ix_sessions_slot ON parking_sessions(slot_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_active_session_by_card
ON parking_sessions(card_id)
WHERE status IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING');

CREATE UNIQUE INDEX IF NOT EXISTS ux_active_session_by_plate
ON parking_sessions(normalized_plate_number)
WHERE normalized_plate_number IS NOT NULL
  AND status IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING');

CREATE UNIQUE INDEX IF NOT EXISTS ux_active_session_by_slot
ON parking_sessions(slot_id)
WHERE status IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING');

CREATE INDEX IF NOT EXISTS ix_payments_session ON payments(session_id);
CREATE INDEX IF NOT EXISTS ix_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS ix_payments_paid_at ON payments(paid_at);
CREATE UNIQUE INDEX IF NOT EXISTS ux_final_payment_by_session
ON payments(session_id)
WHERE status IN ('PAID', 'WAIVED', 'NOT_REQUIRED');

CREATE UNIQUE INDEX IF NOT EXISTS ux_receipts_code ON receipts(receipt_code);
CREATE UNIQUE INDEX IF NOT EXISTS ux_receipts_session ON receipts(session_id);
CREATE INDEX IF NOT EXISTS ix_receipts_session ON receipts(session_id);
CREATE INDEX IF NOT EXISTS ix_receipts_payment ON receipts(payment_id);

CREATE INDEX IF NOT EXISTS ix_lost_card_cases_session ON lost_card_cases(session_id);
CREATE INDEX IF NOT EXISTS ix_lost_card_cases_status ON lost_card_cases(status);
CREATE UNIQUE INDEX IF NOT EXISTS ux_pending_lost_card_case_by_session
ON lost_card_cases(session_id)
WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS ix_plate_mismatch_cases_session ON plate_mismatch_cases(session_id);
CREATE INDEX IF NOT EXISTS ix_plate_mismatch_cases_status ON plate_mismatch_cases(status);
CREATE UNIQUE INDEX IF NOT EXISTS ux_pending_plate_mismatch_case_by_session
ON plate_mismatch_cases(session_id)
WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS ix_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS ix_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS ix_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS ix_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS ix_audit_logs_source_service ON audit_logs(source_service);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_parking_cards_current_session'
    ) THEN
        ALTER TABLE parking_cards
            ADD CONSTRAINT fk_parking_cards_current_session
            FOREIGN KEY (current_session_id)
            REFERENCES parking_sessions(id)
            DEFERRABLE INITIALLY IMMEDIATE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_slots_current_session'
    ) THEN
        ALTER TABLE slots
            ADD CONSTRAINT fk_slots_current_session
            FOREIGN KEY (current_session_id)
            REFERENCES parking_sessions(id)
            DEFERRABLE INITIALLY IMMEDIATE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_parking_cards_current_session_status'
          AND conrelid = 'parking_cards'::regclass
    ) THEN
        ALTER TABLE parking_cards
            ADD CONSTRAINT ck_parking_cards_current_session_status
            CHECK (
                (status = 'IN_USE' AND current_session_id IS NOT NULL)
                OR status = 'LOST'
                OR (status IN ('AVAILABLE', 'DAMAGED', 'INACTIVE') AND current_session_id IS NULL)
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_slots_current_session_status'
          AND conrelid = 'slots'::regclass
    ) THEN
        ALTER TABLE slots
            ADD CONSTRAINT ck_slots_current_session_status
            CHECK (
                (status = 'OCCUPIED' AND current_session_id IS NOT NULL)
                OR (status IN ('AVAILABLE', 'LOCKED', 'MAINTENANCE') AND current_session_id IS NULL)
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_sessions_no_plate_description'
          AND conrelid = 'parking_sessions'::regclass
    ) THEN
        ALTER TABLE parking_sessions
            ADD CONSTRAINT ck_sessions_no_plate_description
            CHECK (no_plate = false OR NULLIF(BTRIM(vehicle_description), '') IS NOT NULL);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_sessions_exit_time'
          AND conrelid = 'parking_sessions'::regclass
    ) THEN
        ALTER TABLE parking_sessions
            ADD CONSTRAINT ck_sessions_exit_time
            CHECK (exit_time IS NULL OR exit_time >= entry_time);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_payments_total_amount'
          AND conrelid = 'payments'::regclass
    ) THEN
        ALTER TABLE payments
            ADD CONSTRAINT ck_payments_total_amount
            CHECK (total_amount = amount + lost_card_fee);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_receipts_total_amount'
          AND conrelid = 'receipts'::regclass
    ) THEN
        ALTER TABLE receipts
            ADD CONSTRAINT ck_receipts_total_amount
            CHECK (total_amount = amount + lost_card_fee);
    END IF;
END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_driver_profiles_set_updated_at
BEFORE UPDATE ON driver_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_vehicle_types_set_updated_at
BEFORE UPDATE ON vehicle_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_vehicles_set_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_parking_cards_set_updated_at
BEFORE UPDATE ON parking_cards
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_floors_set_updated_at
BEFORE UPDATE ON floors
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_areas_set_updated_at
BEFORE UPDATE ON areas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_slots_set_updated_at
BEFORE UPDATE ON slots
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_gates_set_updated_at
BEFORE UPDATE ON gates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_pricing_rules_set_updated_at
BEFORE UPDATE ON pricing_rules
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_monthly_passes_set_updated_at
BEFORE UPDATE ON monthly_passes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_parking_sessions_set_updated_at
BEFORE UPDATE ON parking_sessions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_payments_set_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_lost_card_cases_set_updated_at
BEFORE UPDATE ON lost_card_cases
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_plate_mismatch_cases_set_updated_at
BEFORE UPDATE ON plate_mismatch_cases
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION prevent_audit_logs_update_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_audit_logs_append_only
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_logs_update_delete();
