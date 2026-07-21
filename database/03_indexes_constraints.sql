-- Parking Building Management System - indexes and late constraints
-- Run after 01_schema.sql and 02_seed.sql.

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_username ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_username_lower ON users (LOWER(username));
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email_lower ON users (LOWER(email)) WHERE email IS NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ck_users_username_format'
          AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT ck_users_username_format CHECK (
                char_length(username) BETWEEN 6 AND 30
                AND username ~ '^[A-Za-z][A-Za-z0-9_-]*[A-Za-z0-9]$'
                AND username !~ '[_-]{2}'
            );
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS ix_users_role ON users(role);
CREATE INDEX IF NOT EXISTS ix_users_status ON users(status);
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS ix_users_deleted_at ON users(deleted_at);

CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_by_ip VARCHAR(100),
    revoked_by_ip VARCHAR(100),
    revocation_reason VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(128) NOT NULL,
    token_family_id UUID NOT NULL REFERENCES auth_sessions(id) ON DELETE CASCADE,
    jwt_id VARCHAR(255),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    replaced_by_token_hash VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_ip VARCHAR(100),
    revoked_by_ip VARCHAR(100),
    revocation_reason VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS revoked_access_tokens (
    id UUID PRIMARY KEY,
    jwt_id VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reason VARCHAR(255)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS ix_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS ix_auth_sessions_revoked ON auth_sessions(revoked_at);
CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS ix_refresh_tokens_family ON refresh_tokens(token_family_id);
CREATE INDEX IF NOT EXISTS ix_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS ix_revoked_access_tokens_user ON revoked_access_tokens(user_id);
CREATE INDEX IF NOT EXISTS ix_revoked_access_tokens_expires ON revoked_access_tokens(expires_at);

ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE revoked_access_tokens ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS ux_driver_profiles_user_id ON driver_profiles(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_driver_profiles_phone ON driver_profiles(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_driver_profiles_email ON driver_profiles(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_driver_profiles_type ON driver_profiles(driver_type);

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
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_monthly_pass_by_card
ON monthly_passes(card_id)
WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS ix_monthly_passes_floor_id ON monthly_passes(floor_id);
CREATE INDEX IF NOT EXISTS ix_monthly_passes_area_id ON monthly_passes(area_id);
CREATE INDEX IF NOT EXISTS ix_monthly_passes_slot_id ON monthly_passes(slot_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_monthly_pass_slot
ON monthly_passes(slot_id)
WHERE status = 'ACTIVE' AND slot_id IS NOT NULL;

ALTER TABLE reservations ADD COLUMN IF NOT EXISTS checked_in_by BIGINT REFERENCES users(id);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ NULL;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_reservations_code ON reservations(reservation_code);
CREATE INDEX IF NOT EXISTS ix_reservations_driver ON reservations(driver_id);
CREATE INDEX IF NOT EXISTS ix_reservations_vehicle ON reservations(vehicle_id);
CREATE INDEX IF NOT EXISTS ix_reservations_plate ON reservations(normalized_plate_number);
CREATE INDEX IF NOT EXISTS ix_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS ix_reservations_slot ON reservations(slot_id);
CREATE INDEX IF NOT EXISTS ix_reservations_expires_at ON reservations(expires_at);
CREATE INDEX IF NOT EXISTS ix_reservations_pricing_rule ON reservations(pricing_rule_id);
CREATE INDEX IF NOT EXISTS ix_reservations_payment_status ON reservations(payment_status);
CREATE INDEX IF NOT EXISTS ix_reservations_checked_in_by ON reservations(checked_in_by);
CREATE INDEX IF NOT EXISTS ix_reservations_payment_deadline ON reservations(payment_deadline);
CREATE INDEX IF NOT EXISTS ix_reservations_confirmed_at ON reservations(confirmed_at);
DROP INDEX IF EXISTS ux_pending_reservation_by_slot;
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_reservation_by_slot
ON reservations(slot_id)
WHERE slot_id IS NOT NULL
  AND status IN ('PENDING', 'CONFIRMED');

DROP INDEX IF EXISTS ux_pending_reservation_by_vehicle;
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_reservation_by_vehicle
ON reservations(vehicle_id)
WHERE vehicle_id IS NOT NULL
  AND status IN ('PENDING', 'CONFIRMED');

DROP INDEX IF EXISTS ux_pending_reservation_by_plate_type;
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_reservation_by_plate_type
ON reservations(normalized_plate_number, vehicle_type_id)
WHERE normalized_plate_number IS NOT NULL
  AND status IN ('PENDING', 'CONFIRMED');

ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS billable_start_time TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS claimed_by_user_id BIGINT REFERENCES users(id);
ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS claim_method VARCHAR(30);
ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS override_by BIGINT REFERENCES users(id);
ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS override_at TIMESTAMPTZ;
ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS plate_corrected_by BIGINT REFERENCES users(id);
ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS plate_corrected_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS ux_sessions_session_code ON parking_sessions(session_code);
CREATE INDEX IF NOT EXISTS ix_sessions_card_id ON parking_sessions(card_id);
CREATE INDEX IF NOT EXISTS ix_sessions_plate ON parking_sessions(normalized_plate_number);
CREATE INDEX IF NOT EXISTS ix_sessions_status ON parking_sessions(status);
CREATE INDEX IF NOT EXISTS ix_sessions_entry_time ON parking_sessions(entry_time);
CREATE INDEX IF NOT EXISTS ix_sessions_exit_time ON parking_sessions(exit_time);
CREATE INDEX IF NOT EXISTS ix_sessions_vehicle_type ON parking_sessions(vehicle_type_id);
CREATE INDEX IF NOT EXISTS ix_sessions_slot ON parking_sessions(slot_id);
CREATE INDEX IF NOT EXISTS ix_sessions_reservation ON parking_sessions(reservation_id);
CREATE INDEX IF NOT EXISTS ix_sessions_billable_start_time ON parking_sessions(billable_start_time);
CREATE INDEX IF NOT EXISTS ix_sessions_claimed_by_user ON parking_sessions(claimed_by_user_id);
CREATE INDEX IF NOT EXISTS ix_sessions_claimed_at ON parking_sessions(claimed_at);
CREATE INDEX IF NOT EXISTS ix_sessions_override_by ON parking_sessions(override_by);
CREATE INDEX IF NOT EXISTS ix_sessions_plate_corrected_by ON parking_sessions(plate_corrected_by);
CREATE UNIQUE INDEX IF NOT EXISTS ux_sessions_reservation
ON parking_sessions(reservation_id)
WHERE reservation_id IS NOT NULL;

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

CREATE INDEX IF NOT EXISTS ix_session_images_session ON parking_session_images(session_id);
CREATE INDEX IF NOT EXISTS ix_session_images_session_type ON parking_session_images(session_id, image_type);
CREATE INDEX IF NOT EXISTS ix_session_images_plate ON parking_session_images(detected_normalized_plate_number)
WHERE detected_normalized_plate_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_session_images_captured_at ON parking_session_images(captured_at);
CREATE UNIQUE INDEX IF NOT EXISTS ux_session_images_primary_type
ON parking_session_images(session_id, image_type)
WHERE is_primary;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider_transaction_id VARCHAR(120);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_url VARCHAR(500);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_payload JSONB;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_by_user_id BIGINT REFERENCES users(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS received_amount NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS fee_calculated_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_valid_until TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS ix_payments_session ON payments(session_id);
CREATE INDEX IF NOT EXISTS ix_payments_reservation ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS ix_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS ix_payments_paid_at ON payments(paid_at);
CREATE INDEX IF NOT EXISTS ix_payments_monthly_pass ON payments(monthly_pass_id);
CREATE INDEX IF NOT EXISTS ix_payments_purpose ON payments(purpose);
CREATE INDEX IF NOT EXISTS ix_payments_provider ON payments(provider);
CREATE INDEX IF NOT EXISTS ix_payments_expired_at ON payments(expired_at);
CREATE INDEX IF NOT EXISTS ix_payments_paid_by_user ON payments(paid_by_user_id);
CREATE INDEX IF NOT EXISTS ix_payments_fee_calculated_at ON payments(fee_calculated_at);
CREATE INDEX IF NOT EXISTS ix_payments_valid_until ON payments(payment_valid_until);
CREATE UNIQUE INDEX IF NOT EXISTS ux_payments_provider_transaction
ON payments(provider, provider_transaction_id)
WHERE provider IS NOT NULL AND provider_transaction_id IS NOT NULL;
DROP INDEX IF EXISTS ux_final_payment_by_session;
DROP INDEX IF EXISTS ux_final_parking_payment_by_session;
CREATE INDEX IF NOT EXISTS ix_final_parking_payments_by_session
ON payments(session_id, purpose, status, paid_at)
WHERE purpose IN ('PARKING_FEE', 'LOST_CARD_FEE')
  AND status IN ('PAID', 'WAIVED', 'NOT_REQUIRED');

CREATE TABLE IF NOT EXISTS payment_attempts (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payments(id),
    provider VARCHAR(50) NOT NULL DEFAULT 'VIETQR',
    attempt_no INT NOT NULL DEFAULT 1,
    amount NUMERIC(12,2) NOT NULL,
    received_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_url VARCHAR(500),
    qr_payload TEXT,
    provider_transaction_id VARCHAR(120),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expired_at TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    gateway_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_payment_attempts_provider CHECK (NULLIF(BTRIM(provider), '') IS NOT NULL),
    CONSTRAINT ck_payment_attempts_attempt_no CHECK (attempt_no > 0),
    CONSTRAINT ck_payment_attempts_amounts CHECK (amount >= 0 AND received_amount >= 0),
    CONSTRAINT ck_payment_attempts_payment_url CHECK (payment_url IS NULL OR NULLIF(BTRIM(payment_url), '') IS NOT NULL),
    CONSTRAINT ck_payment_attempts_qr_payload CHECK (qr_payload IS NULL OR NULLIF(BTRIM(qr_payload), '') IS NOT NULL),
    CONSTRAINT ck_payment_attempts_provider_transaction CHECK (provider_transaction_id IS NULL OR NULLIF(BTRIM(provider_transaction_id), '') IS NOT NULL),
    CONSTRAINT ck_payment_attempts_status CHECK (status IN ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'CANCELLED')),
    CONSTRAINT ck_payment_attempts_expired_at CHECK (expired_at > requested_at),
    CONSTRAINT ck_payment_attempts_paid_at CHECK (paid_at IS NULL OR paid_at >= requested_at)
);

CREATE INDEX IF NOT EXISTS ix_payment_attempts_payment ON payment_attempts(payment_id);
CREATE INDEX IF NOT EXISTS ix_payment_attempts_status ON payment_attempts(status);
CREATE INDEX IF NOT EXISTS ix_payment_attempts_expired_at ON payment_attempts(expired_at);
CREATE UNIQUE INDEX IF NOT EXISTS ux_payment_attempts_payment_attempt_no
ON payment_attempts(payment_id, attempt_no);
CREATE UNIQUE INDEX IF NOT EXISTS ux_payment_attempts_provider_transaction
ON payment_attempts(provider, provider_transaction_id)
WHERE provider_transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_reservation_extensions_reservation ON reservation_extensions(reservation_id);
CREATE INDEX IF NOT EXISTS ix_reservation_extensions_payment ON reservation_extensions(payment_id);
CREATE INDEX IF NOT EXISTS ix_reservation_extensions_created_at ON reservation_extensions(created_at);

CREATE UNIQUE INDEX IF NOT EXISTS ux_receipts_code ON receipts(receipt_code);
CREATE UNIQUE INDEX IF NOT EXISTS ux_receipts_session ON receipts(session_id);
CREATE INDEX IF NOT EXISTS ix_receipts_session ON receipts(session_id);
CREATE INDEX IF NOT EXISTS ix_receipts_payment ON receipts(payment_id);

CREATE INDEX IF NOT EXISTS ix_lost_card_cases_session ON lost_card_cases(session_id);
CREATE INDEX IF NOT EXISTS ix_lost_card_cases_status ON lost_card_cases(status);
CREATE UNIQUE INDEX IF NOT EXISTS ux_pending_lost_card_case_by_session
ON lost_card_cases(session_id)
WHERE status = 'PENDING';

CREATE TABLE IF NOT EXISTS lost_card_case_documents (
    id BIGSERIAL PRIMARY KEY,
    lost_card_case_id BIGINT NOT NULL REFERENCES lost_card_cases(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    original_file_name VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    sha256_hash VARCHAR(100),
    note TEXT,
    is_sensitive BOOLEAN NOT NULL DEFAULT true,
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_lost_card_documents_case ON lost_card_case_documents(lost_card_case_id);
CREATE INDEX IF NOT EXISTS ix_lost_card_documents_type ON lost_card_case_documents(document_type);
CREATE INDEX IF NOT EXISTS ix_lost_card_documents_uploaded_at ON lost_card_case_documents(uploaded_at);
CREATE INDEX IF NOT EXISTS ix_lost_card_documents_active_case
ON lost_card_case_documents(lost_card_case_id)
WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_lost_card_documents_active_case_type
ON lost_card_case_documents(lost_card_case_id, document_type)
WHERE deleted_at IS NULL AND document_type <> 'OTHER';

CREATE INDEX IF NOT EXISTS ix_lost_card_refunds_case ON lost_card_refunds(lost_card_case_id);
CREATE INDEX IF NOT EXISTS ix_lost_card_refunds_session ON lost_card_refunds(session_id);
CREATE INDEX IF NOT EXISTS ix_lost_card_refunds_status ON lost_card_refunds(status);
CREATE INDEX IF NOT EXISTS ix_lost_card_refunds_payment ON lost_card_refunds(payment_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_lost_card_refund_by_case
ON lost_card_refunds(lost_card_case_id);

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
    ALTER TABLE areas DROP CONSTRAINT IF EXISTS ck_areas_total_capacity;
    ALTER TABLE areas
        ADD CONSTRAINT ck_areas_total_capacity
        CHECK (total_capacity >= 0);

    ALTER TABLE areas DROP CONSTRAINT IF EXISTS ck_areas_real_occupancy;
    ALTER TABLE areas
        ADD CONSTRAINT ck_areas_real_occupancy
        CHECK (current_real_occupancy >= 0);

    ALTER TABLE areas DROP CONSTRAINT IF EXISTS ck_areas_booked_slots;
    ALTER TABLE areas
        ADD CONSTRAINT ck_areas_booked_slots
        CHECK (current_booked_slots >= 0);

    ALTER TABLE areas DROP CONSTRAINT IF EXISTS ck_areas_occupancy_capacity;
    ALTER TABLE areas
        ADD CONSTRAINT ck_areas_occupancy_capacity
        CHECK (current_real_occupancy + current_booked_slots <= total_capacity);

    ALTER TABLE slots DROP CONSTRAINT IF EXISTS ck_slots_status;
    ALTER TABLE slots
        ADD CONSTRAINT ck_slots_status
        CHECK (status IN ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'LOCKED', 'MAINTENANCE'));

    ALTER TABLE slots DROP CONSTRAINT IF EXISTS ck_slots_current_session_status;
    ALTER TABLE slots
        ADD CONSTRAINT ck_slots_current_session_status
        CHECK (
            (status = 'OCCUPIED' AND current_session_id IS NOT NULL)
            OR (status IN ('AVAILABLE', 'RESERVED', 'LOCKED', 'MAINTENANCE') AND current_session_id IS NULL)
        );

    ALTER TABLE reservations ALTER COLUMN plate_number DROP NOT NULL;
    ALTER TABLE reservations ALTER COLUMN normalized_plate_number DROP NOT NULL;
    ALTER TABLE reservations DROP CONSTRAINT IF EXISTS ck_reservations_vehicle_identity;
    ALTER TABLE reservations DROP CONSTRAINT IF EXISTS ck_reservations_plate_required;
    ALTER TABLE reservations
        ADD CONSTRAINT ck_reservations_plate_required
        CHECK (
            (plate_number IS NULL AND normalized_plate_number IS NULL)
            OR (
                NULLIF(BTRIM(plate_number), '') IS NOT NULL
                AND NULLIF(BTRIM(normalized_plate_number), '') IS NOT NULL
            )
        );

    ALTER TABLE reservations DROP CONSTRAINT IF EXISTS ck_reservations_checked_in_by;
    ALTER TABLE reservations
        ADD CONSTRAINT ck_reservations_checked_in_by
        CHECK (
            (checked_in_at IS NULL AND checked_in_by IS NULL)
            OR (checked_in_at IS NOT NULL AND checked_in_by IS NOT NULL)
        );

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

    ALTER TABLE parking_sessions DROP CONSTRAINT IF EXISTS ck_sessions_billable_start_time;
    ALTER TABLE parking_sessions
        ADD CONSTRAINT ck_sessions_billable_start_time
        CHECK (billable_start_time >= entry_time);

    ALTER TABLE parking_sessions DROP CONSTRAINT IF EXISTS ck_sessions_claim_method;
    ALTER TABLE parking_sessions
        ADD CONSTRAINT ck_sessions_claim_method
        CHECK (claim_method IS NULL OR claim_method IN ('CARD_QR', 'STAFF_ASSIGN'));

    ALTER TABLE parking_sessions DROP CONSTRAINT IF EXISTS ck_sessions_claim_audit;
    ALTER TABLE parking_sessions
        ADD CONSTRAINT ck_sessions_claim_audit
        CHECK (
            (
                claimed_by_user_id IS NULL
                AND claimed_at IS NULL
                AND claim_method IS NULL
            )
            OR (
                driver_id IS NOT NULL
                AND claimed_by_user_id IS NOT NULL
                AND claimed_at IS NOT NULL
                AND claim_method IS NOT NULL
            )
        );

    ALTER TABLE parking_sessions DROP CONSTRAINT IF EXISTS ck_sessions_override_audit;
    ALTER TABLE parking_sessions
        ADD CONSTRAINT ck_sessions_override_audit
        CHECK (
            (
                override_area_id IS NULL
                AND override_slot_id IS NULL
                AND override_reason IS NULL
                AND override_by IS NULL
                AND override_at IS NULL
            )
            OR (override_by IS NOT NULL AND override_at IS NOT NULL)
        );

    ALTER TABLE parking_sessions DROP CONSTRAINT IF EXISTS ck_sessions_plate_correction_audit;
    ALTER TABLE parking_sessions
        ADD CONSTRAINT ck_sessions_plate_correction_audit
        CHECK (
            (plate_corrected_by IS NULL AND plate_corrected_at IS NULL)
            OR (plate_corrected_by IS NOT NULL AND plate_corrected_at IS NOT NULL)
        );

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_payments_total_amount'
          AND conrelid = 'payments'::regclass
    ) THEN
        ALTER TABLE payments
            ADD CONSTRAINT ck_payments_total_amount
            CHECK (total_amount = amount + lost_card_fee);
    END IF;

    ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payments_amounts;
    ALTER TABLE payments
        ADD CONSTRAINT ck_payments_amounts
        CHECK (amount >= 0 AND lost_card_fee >= 0 AND total_amount >= 0 AND received_amount >= 0);

    ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payments_valid_until;
    ALTER TABLE payments
        ADD CONSTRAINT ck_payments_valid_until
        CHECK (payment_valid_until IS NULL OR paid_at IS NULL OR payment_valid_until > paid_at);

    ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payments_method;
    ALTER TABLE payments
        ADD CONSTRAINT ck_payments_method
        CHECK (method IN ('CASH', 'BANK_TRANSFER', 'NONE'));

    ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payments_provider;
    ALTER TABLE payments
        ADD CONSTRAINT ck_payments_provider
        CHECK (provider IS NULL OR NULLIF(BTRIM(provider), '') IS NOT NULL);

    ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payments_provider_transaction;
    ALTER TABLE payments
        ADD CONSTRAINT ck_payments_provider_transaction
        CHECK (provider_transaction_id IS NULL OR NULLIF(BTRIM(provider_transaction_id), '') IS NOT NULL);

    ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payments_payment_url;
    ALTER TABLE payments
        ADD CONSTRAINT ck_payments_payment_url
        CHECK (payment_url IS NULL OR NULLIF(BTRIM(payment_url), '') IS NOT NULL);

    ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payments_online_method;
    ALTER TABLE payments
        ADD CONSTRAINT ck_payments_online_method
        CHECK (
            method = 'BANK_TRANSFER'
            OR (
                provider IS NULL
                AND provider_transaction_id IS NULL
                AND payment_url IS NULL
                AND expired_at IS NULL
                AND gateway_payload IS NULL
            )
        );

    ALTER TABLE lost_card_case_documents DROP CONSTRAINT IF EXISTS ck_lost_card_documents_type;
    ALTER TABLE lost_card_case_documents
        ADD CONSTRAINT ck_lost_card_documents_type
        CHECK (document_type IN (
            'CCCD_FRONT',
            'CCCD_BACK',
            'FACE_PHOTO',
            'VEHICLE_PHOTO',
            'LOSS_DECLARATION',
            'SIGNED_FORM',
            'OTHER'
        ));

    ALTER TABLE lost_card_case_documents DROP CONSTRAINT IF EXISTS ck_lost_card_documents_file_path;
    ALTER TABLE lost_card_case_documents
        ADD CONSTRAINT ck_lost_card_documents_file_path
        CHECK (NULLIF(BTRIM(file_path), '') IS NOT NULL);

    ALTER TABLE lost_card_case_documents DROP CONSTRAINT IF EXISTS ck_lost_card_documents_size;
    ALTER TABLE lost_card_case_documents
        ADD CONSTRAINT ck_lost_card_documents_size
        CHECK (size_bytes IS NULL OR size_bytes >= 0);

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_receipts_total_amount'
          AND conrelid = 'receipts'::regclass
    ) THEN
        ALTER TABLE receipts
            ADD CONSTRAINT ck_receipts_total_amount
            CHECK (total_amount = amount + lost_card_fee);
    END IF;

    ALTER TABLE receipts DROP CONSTRAINT IF EXISTS ck_receipts_payment_method;
    ALTER TABLE receipts
        ADD CONSTRAINT ck_receipts_payment_method
        CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'NONE'));
END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_vehicle_driver_type()
RETURNS TRIGGER AS $$
DECLARE
    profile_type varchar(30);
BEGIN
    IF NEW.driver_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT driver_type INTO profile_type
    FROM driver_profiles
    WHERE id = NEW.driver_id;

    IF profile_type IS NULL THEN
        RAISE EXCEPTION 'driver_id % does not exist', NEW.driver_id;
    END IF;

    IF profile_type <> 'RESIDENT' THEN
        RAISE EXCEPTION 'visitor driver profile % cannot own a registered vehicle', NEW.driver_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_reservation_slot_requirement()
RETURNS TRIGGER AS $$
DECLARE
    required_slot boolean;
    slot_area_id bigint;
    slot_vehicle_type_id bigint;
    area_floor_id bigint;
BEGIN
    SELECT requires_slot INTO required_slot
    FROM vehicle_types
    WHERE id = NEW.vehicle_type_id;

    IF required_slot IS NULL THEN
        RAISE EXCEPTION 'vehicle_type_id % does not exist', NEW.vehicle_type_id;
    END IF;

    SELECT floor_id INTO area_floor_id
    FROM areas
    WHERE id = NEW.area_id;

    IF area_floor_id IS NULL OR area_floor_id <> NEW.floor_id THEN
        RAISE EXCEPTION 'reservation area_id % does not belong to floor_id %', NEW.area_id, NEW.floor_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM area_vehicle_types
        WHERE area_id = NEW.area_id
          AND vehicle_type_id = NEW.vehicle_type_id
    ) THEN
        RAISE EXCEPTION 'vehicle_type_id % is not allowed in area_id %', NEW.vehicle_type_id, NEW.area_id;
    END IF;

    IF required_slot AND NEW.slot_id IS NULL THEN
        RAISE EXCEPTION 'slot_id is required for vehicle_type_id %', NEW.vehicle_type_id;
    END IF;

    IF NOT required_slot AND NEW.slot_id IS NOT NULL THEN
        RAISE EXCEPTION 'slot_id must be NULL for area-managed vehicle_type_id %', NEW.vehicle_type_id;
    END IF;

    IF NEW.slot_id IS NOT NULL THEN
        SELECT area_id, allowed_vehicle_type_id INTO slot_area_id, slot_vehicle_type_id
        FROM slots
        WHERE id = NEW.slot_id;

        IF slot_area_id IS NULL THEN
            RAISE EXCEPTION 'slot_id % does not exist', NEW.slot_id;
        END IF;

        IF slot_area_id <> NEW.area_id THEN
            RAISE EXCEPTION 'slot_id % does not belong to area_id %', NEW.slot_id, NEW.area_id;
        END IF;

        IF slot_vehicle_type_id <> NEW.vehicle_type_id THEN
            RAISE EXCEPTION 'slot_id % does not allow vehicle_type_id %', NEW.slot_id, NEW.vehicle_type_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_session_slot_requirement()
RETURNS TRIGGER AS $$
DECLARE
    required_slot boolean;
    slot_area_id bigint;
    slot_vehicle_type_id bigint;
    area_floor_id bigint;
BEGIN
    SELECT requires_slot INTO required_slot
    FROM vehicle_types
    WHERE id = NEW.vehicle_type_id;

    IF required_slot IS NULL THEN
        RAISE EXCEPTION 'vehicle_type_id % does not exist', NEW.vehicle_type_id;
    END IF;

    SELECT floor_id INTO area_floor_id
    FROM areas
    WHERE id = NEW.area_id;

    IF area_floor_id IS NULL OR area_floor_id <> NEW.floor_id THEN
        RAISE EXCEPTION 'session area_id % does not belong to floor_id %', NEW.area_id, NEW.floor_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM area_vehicle_types
        WHERE area_id = NEW.area_id
          AND vehicle_type_id = NEW.vehicle_type_id
    ) THEN
        RAISE EXCEPTION 'vehicle_type_id % is not allowed in area_id %', NEW.vehicle_type_id, NEW.area_id;
    END IF;

    IF required_slot AND NEW.slot_id IS NULL THEN
        RAISE EXCEPTION 'slot_id is required for vehicle_type_id %', NEW.vehicle_type_id;
    END IF;

    IF NOT required_slot AND NEW.slot_id IS NOT NULL THEN
        RAISE EXCEPTION 'slot_id must be NULL for area-managed vehicle_type_id %', NEW.vehicle_type_id;
    END IF;

    IF NEW.slot_id IS NOT NULL THEN
        SELECT area_id, allowed_vehicle_type_id INTO slot_area_id, slot_vehicle_type_id
        FROM slots
        WHERE id = NEW.slot_id;

        IF slot_area_id IS NULL THEN
            RAISE EXCEPTION 'slot_id % does not exist', NEW.slot_id;
        END IF;

        IF slot_area_id <> NEW.area_id THEN
            RAISE EXCEPTION 'slot_id % does not belong to area_id %', NEW.slot_id, NEW.area_id;
        END IF;

        IF slot_vehicle_type_id <> NEW.vehicle_type_id THEN
            RAISE EXCEPTION 'slot_id % does not allow vehicle_type_id %', NEW.slot_id, NEW.vehicle_type_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_session_claim_reassignment()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.claimed_by_user_id IS NOT NULL AND (
        NEW.claimed_by_user_id IS DISTINCT FROM OLD.claimed_by_user_id
        OR NEW.driver_id IS DISTINCT FROM OLD.driver_id
        OR NEW.claimed_at IS DISTINCT FROM OLD.claimed_at
        OR NEW.claim_method IS DISTINCT FROM OLD.claim_method
    ) THEN
        RAISE EXCEPTION 'parking session % has already been claimed', OLD.id;
    END IF;

    IF OLD.claimed_by_user_id IS NULL
       AND NEW.claimed_by_user_id IS NOT NULL
       AND (
           OLD.status NOT IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING')
           OR NEW.status NOT IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING')
       ) THEN
        RAISE EXCEPTION 'parking session % cannot be claimed while changing from status % to %', OLD.id, OLD.status, NEW.status;
    END IF;

    IF NEW.claimed_by_user_id IS NOT NULL
       AND NOT EXISTS (
           SELECT 1
           FROM driver_profiles
           WHERE id = NEW.driver_id
             AND user_id = NEW.claimed_by_user_id
       ) THEN
        RAISE EXCEPTION 'parking session % claim user does not own driver profile %', NEW.id, NEW.driver_id;
    END IF;

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

CREATE OR REPLACE TRIGGER trg_vehicles_validate_driver_type
BEFORE INSERT OR UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION validate_vehicle_driver_type();

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

CREATE OR REPLACE TRIGGER trg_reservations_set_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_reservations_validate_slot_requirement
BEFORE INSERT OR UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION validate_reservation_slot_requirement();

CREATE OR REPLACE TRIGGER trg_parking_sessions_set_updated_at
BEFORE UPDATE ON parking_sessions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_parking_sessions_validate_slot_requirement
BEFORE INSERT OR UPDATE ON parking_sessions
FOR EACH ROW EXECUTE FUNCTION validate_session_slot_requirement();

CREATE OR REPLACE TRIGGER trg_parking_sessions_prevent_claim_reassignment
BEFORE UPDATE ON parking_sessions
FOR EACH ROW EXECUTE FUNCTION prevent_session_claim_reassignment();

CREATE OR REPLACE TRIGGER trg_parking_session_images_set_updated_at
BEFORE UPDATE ON parking_session_images
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_payments_set_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_payment_attempts_set_updated_at
BEFORE UPDATE ON payment_attempts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_reservation_extensions_set_updated_at
BEFORE UPDATE ON reservation_extensions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_lost_card_cases_set_updated_at
BEFORE UPDATE ON lost_card_cases
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_lost_card_case_documents_set_updated_at
BEFORE UPDATE ON lost_card_case_documents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_lost_card_refunds_set_updated_at
BEFORE UPDATE ON lost_card_refunds
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
