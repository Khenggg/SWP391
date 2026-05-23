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
CREATE INDEX IF NOT EXISTS ix_cards_status ON parking_cards(status);
CREATE INDEX IF NOT EXISTS ix_cards_current_session ON parking_cards(current_session_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_floors_code ON floors(floor_code);
CREATE INDEX IF NOT EXISTS ix_floors_status ON floors(status);

CREATE UNIQUE INDEX IF NOT EXISTS ux_areas_floor_code ON areas(floor_id, area_code);
CREATE INDEX IF NOT EXISTS ix_areas_status ON areas(status);
CREATE INDEX IF NOT EXISTS ix_areas_priority ON areas(priority_order);

CREATE INDEX IF NOT EXISTS ix_area_vehicle_types_vehicle_type ON area_vehicle_types(vehicle_type_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_slots_area_code ON slots(area_id, slot_code);
CREATE INDEX IF NOT EXISTS ix_slots_status ON slots(status);
CREATE INDEX IF NOT EXISTS ix_slots_vehicle_type ON slots(allowed_vehicle_type_id);
CREATE INDEX IF NOT EXISTS ix_slots_current_session ON slots(current_session_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_gates_floor_code ON gates(floor_id, gate_code);
CREATE INDEX IF NOT EXISTS ix_gates_type ON gates(gate_type);
CREATE INDEX IF NOT EXISTS ix_gates_status ON gates(status);

CREATE INDEX IF NOT EXISTS ix_pricing_rules_vehicle_type ON pricing_rules(vehicle_type_id);
CREATE INDEX IF NOT EXISTS ix_pricing_rules_status ON pricing_rules(status);
CREATE INDEX IF NOT EXISTS ix_pricing_rules_effective_from ON pricing_rules(effective_from);

CREATE INDEX IF NOT EXISTS ix_monthly_pass_plate ON monthly_passes(normalized_plate_number);
CREATE INDEX IF NOT EXISTS ix_monthly_pass_status ON monthly_passes(status);
CREATE INDEX IF NOT EXISTS ix_monthly_pass_dates ON monthly_passes(start_date, end_date);

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

CREATE UNIQUE INDEX IF NOT EXISTS ux_receipts_code ON receipts(receipt_code);
CREATE INDEX IF NOT EXISTS ix_receipts_session ON receipts(session_id);
CREATE INDEX IF NOT EXISTS ix_receipts_payment ON receipts(payment_id);

CREATE INDEX IF NOT EXISTS ix_lost_card_cases_session ON lost_card_cases(session_id);
CREATE INDEX IF NOT EXISTS ix_lost_card_cases_status ON lost_card_cases(status);

CREATE INDEX IF NOT EXISTS ix_plate_mismatch_cases_session ON plate_mismatch_cases(session_id);
CREATE INDEX IF NOT EXISTS ix_plate_mismatch_cases_status ON plate_mismatch_cases(status);

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
END $$;
