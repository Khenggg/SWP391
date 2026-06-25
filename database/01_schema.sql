-- Parking Building Management System - MVP schema
-- Source of truth for PostgreSQL/Supabase database structure.
-- Run on an empty database before 02_seed.sql and 03_indexes_constraints.sql.

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_users_role CHECK (role IN ('ADMIN', 'MANAGER', 'STAFF', 'DRIVER')),
    CONSTRAINT ck_users_status CHECK (status IN ('ACTIVE', 'LOCKED', 'INACTIVE'))
);

CREATE TABLE IF NOT EXISTS driver_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    driver_type VARCHAR(30) NOT NULL DEFAULT 'VISITOR',
    apartment_number VARCHAR(50),
    cccd_number VARCHAR(50),
    cccd_image_url VARCHAR(500),
    resident_verified BOOLEAN NOT NULL DEFAULT false,
    resident_verified_at TIMESTAMPTZ,
    resident_verified_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_driver_profiles_status CHECK (status IN ('ACTIVE', 'LOCKED', 'INACTIVE')),
    CONSTRAINT ck_driver_profiles_type CHECK (driver_type IN ('RESIDENT', 'VISITOR')),
    CONSTRAINT ck_driver_profiles_resident_fields CHECK (
        driver_type != 'RESIDENT'
        OR (NULLIF(BTRIM(apartment_number), '') IS NOT NULL AND NULLIF(BTRIM(cccd_number), '') IS NOT NULL)
    ),
    CONSTRAINT ck_driver_profiles_verification CHECK (
        (resident_verified = false AND resident_verified_at IS NULL AND resident_verified_by IS NULL)
        OR (resident_verified = true AND driver_type = 'RESIDENT' AND resident_verified_at IS NOT NULL AND resident_verified_by IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS vehicle_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    requires_slot BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT REFERENCES driver_profiles(id),
    plate_number VARCHAR(30),
    normalized_plate_number VARCHAR(30),
    vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id),
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_vehicles_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE IF NOT EXISTS parking_cards (
    id BIGSERIAL PRIMARY KEY,
    card_code VARCHAR(50) NOT NULL,
    qr_token VARCHAR(120) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    current_session_id BIGINT,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_parking_cards_status CHECK (status IN ('AVAILABLE', 'IN_USE', 'LOST', 'DAMAGED', 'INACTIVE')),
    CONSTRAINT ck_parking_cards_current_session_status CHECK (
        (status = 'IN_USE' AND current_session_id IS NOT NULL)
        OR status = 'LOST'
        OR (status IN ('AVAILABLE', 'DAMAGED', 'INACTIVE') AND current_session_id IS NULL)
    )
);

CREATE TABLE IF NOT EXISTS floors (
    id BIGSERIAL PRIMARY KEY,
    floor_code VARCHAR(30) NOT NULL,
    floor_name VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_floors_status CHECK (status IN ('ACTIVE', 'LOCKED', 'MAINTENANCE'))
);

CREATE TABLE IF NOT EXISTS areas (
    id BIGSERIAL PRIMARY KEY,
    floor_id BIGINT NOT NULL REFERENCES floors(id),
    area_code VARCHAR(30) NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    priority_order INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    total_capacity INT NOT NULL DEFAULT 0,
    current_real_occupancy INT NOT NULL DEFAULT 0,
    current_booked_slots INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_areas_status CHECK (status IN ('ACTIVE', 'LOCKED', 'MAINTENANCE')),
    CONSTRAINT ck_areas_total_capacity CHECK (total_capacity >= 0),
    CONSTRAINT ck_areas_real_occupancy CHECK (current_real_occupancy >= 0),
    CONSTRAINT ck_areas_booked_slots CHECK (current_booked_slots >= 0),
    CONSTRAINT ck_areas_occupancy_capacity CHECK (current_real_occupancy + current_booked_slots <= total_capacity)
);

CREATE TABLE IF NOT EXISTS area_vehicle_types (
    area_id BIGINT NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id) ON DELETE CASCADE,
    PRIMARY KEY (area_id, vehicle_type_id)
);

CREATE TABLE IF NOT EXISTS slots (
    id BIGSERIAL PRIMARY KEY,
    area_id BIGINT NOT NULL REFERENCES areas(id),
    slot_code VARCHAR(50) NOT NULL,
    allowed_vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    current_session_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_slots_status CHECK (status IN ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'LOCKED', 'MAINTENANCE')),
    CONSTRAINT ck_slots_current_session_status CHECK (
        (status = 'OCCUPIED' AND current_session_id IS NOT NULL)
        OR (status IN ('AVAILABLE', 'RESERVED', 'LOCKED', 'MAINTENANCE') AND current_session_id IS NULL)
    )
);

CREATE TABLE IF NOT EXISTS gates (
    id BIGSERIAL PRIMARY KEY,
    floor_id BIGINT NOT NULL REFERENCES floors(id),
    gate_code VARCHAR(50) NOT NULL,
    gate_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_gates_type CHECK (gate_type IN ('ENTRY', 'EXIT')),
    CONSTRAINT ck_gates_status CHECK (status IN ('ACTIVE', 'LOCKED', 'MAINTENANCE'))
);

CREATE TABLE IF NOT EXISTS pricing_rules (
    id BIGSERIAL PRIMARY KEY,
    vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id),
    day_price NUMERIC(12,2) NOT NULL,
    night_price NUMERIC(12,2) NOT NULL,
    monthly_price NUMERIC(12,2) NOT NULL,
    reservation_hourly_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    lost_card_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_by BIGINT NOT NULL REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_pricing_rules_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT ck_pricing_rules_amounts CHECK (
        day_price >= 0
        AND night_price >= 0
        AND monthly_price >= 0
        AND reservation_hourly_price >= 0
        AND lost_card_fee >= 0
    )
);

CREATE TABLE IF NOT EXISTS monthly_passes (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT REFERENCES driver_profiles(id),
    card_id BIGINT NOT NULL REFERENCES parking_cards(id),
    owner_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    plate_number VARCHAR(30) NOT NULL,
    normalized_plate_number VARCHAR(30) NOT NULL,
    vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_monthly_passes_status CHECK (status IN ('ACTIVE', 'EXPIRED', 'LOCKED')),
    CONSTRAINT ck_monthly_passes_dates CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    reservation_code VARCHAR(50) NOT NULL,
    driver_id BIGINT REFERENCES driver_profiles(id),
    vehicle_id BIGINT REFERENCES vehicles(id),
    plate_number VARCHAR(30) NOT NULL,
    normalized_plate_number VARCHAR(30) NOT NULL,
    vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id),
    floor_id BIGINT NOT NULL REFERENCES floors(id),
    area_id BIGINT NOT NULL REFERENCES areas(id),
    slot_id BIGINT REFERENCES slots(id),
    pricing_rule_id BIGINT REFERENCES pricing_rules(id),
    snapshot_reservation_hourly_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    reserved_duration_minutes INT NOT NULL DEFAULT 0,
    booking_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    reserved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    checked_in_at TIMESTAMPTZ,
    checked_in_by BIGINT REFERENCES users(id),
    cancelled_at TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_by BIGINT REFERENCES users(id),
    cancelled_by BIGINT REFERENCES users(id),
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_reservations_status CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
    CONSTRAINT ck_reservations_payment_status CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'WAIVED', 'NOT_REQUIRED')),
    CONSTRAINT ck_reservations_booking_amounts CHECK (
        snapshot_reservation_hourly_price >= 0
        AND reserved_duration_minutes >= 0
        AND booking_amount >= 0
    ),
    CONSTRAINT ck_reservations_expires_at CHECK (expires_at > reserved_at),
    CONSTRAINT ck_reservations_checked_in_at CHECK (checked_in_at IS NULL OR checked_in_at >= reserved_at),
    CONSTRAINT ck_reservations_checked_in_by CHECK (
        (checked_in_at IS NULL AND checked_in_by IS NULL)
        OR (checked_in_at IS NOT NULL AND checked_in_by IS NOT NULL)
    ),
    CONSTRAINT ck_reservations_cancelled_at CHECK (cancelled_at IS NULL OR cancelled_at >= reserved_at),
    CONSTRAINT ck_reservations_plate_required CHECK (
        NULLIF(BTRIM(plate_number), '') IS NOT NULL
        AND NULLIF(BTRIM(normalized_plate_number), '') IS NOT NULL
    )
);

CREATE TABLE IF NOT EXISTS parking_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_code VARCHAR(50) NOT NULL,
    card_id BIGINT NOT NULL REFERENCES parking_cards(id),
    driver_id BIGINT REFERENCES driver_profiles(id),
    vehicle_id BIGINT REFERENCES vehicles(id),
    plate_number VARCHAR(30),
    normalized_plate_number VARCHAR(30),
    no_plate BOOLEAN NOT NULL DEFAULT false,
    vehicle_description TEXT,
    vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id),
    customer_type VARCHAR(30) NOT NULL DEFAULT 'CASUAL',
    claimed_by_user_id BIGINT REFERENCES users(id),
    claimed_at TIMESTAMPTZ,
    claim_method VARCHAR(30),
    monthly_pass_id BIGINT REFERENCES monthly_passes(id),
    reservation_id BIGINT REFERENCES reservations(id),
    floor_id BIGINT NOT NULL REFERENCES floors(id),
    area_id BIGINT NOT NULL REFERENCES areas(id),
    slot_id BIGINT REFERENCES slots(id),
    entry_gate_id BIGINT NOT NULL REFERENCES gates(id),
    exit_gate_id BIGINT REFERENCES gates(id),
    entry_staff_id BIGINT NOT NULL REFERENCES users(id),
    exit_staff_id BIGINT REFERENCES users(id),
    entry_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    exit_time TIMESTAMPTZ,
    billable_start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    payment_required BOOLEAN NOT NULL DEFAULT true,
    payment_status VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    pricing_rule_id BIGINT REFERENCES pricing_rules(id),
    snapshot_day_price NUMERIC(12,2),
    snapshot_night_price NUMERIC(12,2),
    snapshot_monthly_price NUMERIC(12,2),
    snapshot_lost_card_fee NUMERIC(12,2),
    suggested_area_id BIGINT REFERENCES areas(id),
    suggested_slot_id BIGINT REFERENCES slots(id),
    override_area_id BIGINT REFERENCES areas(id),
    override_slot_id BIGINT REFERENCES slots(id),
    override_by BIGINT REFERENCES users(id),
    override_at TIMESTAMPTZ,
    override_reason TEXT,
    plate_corrected_by BIGINT REFERENCES users(id),
    plate_corrected_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_sessions_customer_type CHECK (customer_type IN ('CASUAL', 'MONTHLY')),
    CONSTRAINT ck_sessions_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'LOST_CARD_PENDING', 'MISMATCH_PENDING')),
    CONSTRAINT ck_sessions_payment_status CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'WAIVED', 'NOT_REQUIRED')),
    CONSTRAINT ck_sessions_plate_or_no_plate CHECK (no_plate = true OR normalized_plate_number IS NOT NULL),
    CONSTRAINT ck_sessions_no_plate_description CHECK (
        no_plate = false OR NULLIF(BTRIM(vehicle_description), '') IS NOT NULL
    ),
    CONSTRAINT ck_sessions_claim_method CHECK (claim_method IS NULL OR claim_method IN ('CARD_QR', 'STAFF_ASSIGN')),
    CONSTRAINT ck_sessions_claim_audit CHECK (
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
    ),
    CONSTRAINT ck_sessions_billable_start_time CHECK (billable_start_time >= entry_time),
    CONSTRAINT ck_sessions_override_audit CHECK (
        (
            override_area_id IS NULL
            AND override_slot_id IS NULL
            AND override_reason IS NULL
            AND override_by IS NULL
            AND override_at IS NULL
        )
        OR (override_by IS NOT NULL AND override_at IS NOT NULL)
    ),
    CONSTRAINT ck_sessions_plate_correction_audit CHECK (
        (plate_corrected_by IS NULL AND plate_corrected_at IS NULL)
        OR (plate_corrected_by IS NOT NULL AND plate_corrected_at IS NOT NULL)
    ),
    CONSTRAINT ck_sessions_exit_time CHECK (exit_time IS NULL OR exit_time >= entry_time)
);

CREATE TABLE IF NOT EXISTS parking_session_images (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES parking_sessions(id),
    image_type VARCHAR(30) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    detected_plate_number VARCHAR(30),
    detected_normalized_plate_number VARCHAR(30),
    confidence NUMERIC(5,2),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_session_images_type CHECK (image_type IN ('ENTRY_PLATE', 'ENTRY_VEHICLE', 'EXIT_PLATE', 'EXIT_VEHICLE')),
    CONSTRAINT ck_session_images_image_url CHECK (NULLIF(BTRIM(image_url), '') IS NOT NULL),
    CONSTRAINT ck_session_images_thumbnail_url CHECK (thumbnail_url IS NULL OR NULLIF(BTRIM(thumbnail_url), '') IS NOT NULL),
    CONSTRAINT ck_session_images_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100))
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT REFERENCES parking_sessions(id),
    reservation_id BIGINT REFERENCES reservations(id),
    monthly_pass_id BIGINT REFERENCES monthly_passes(id),
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    lost_card_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    purpose VARCHAR(40) NOT NULL DEFAULT 'PARKING_FEE',
    method VARCHAR(30) NOT NULL DEFAULT 'CASH',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    provider VARCHAR(50),
    provider_transaction_id VARCHAR(120),
    payment_url VARCHAR(500),
    expired_at TIMESTAMPTZ,
    gateway_payload JSONB,
    paid_by_user_id BIGINT REFERENCES users(id),
    received_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    fee_calculated_at TIMESTAMPTZ,
    payment_valid_until TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    collected_by BIGINT REFERENCES users(id),
    waive_reason VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_payments_method CHECK (method IN ('CASH', 'BANK_TRANSFER', 'NONE')),
    CONSTRAINT ck_payments_status CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'WAIVED', 'NOT_REQUIRED')),
    CONSTRAINT ck_payments_provider CHECK (provider IS NULL OR NULLIF(BTRIM(provider), '') IS NOT NULL),
    CONSTRAINT ck_payments_provider_transaction CHECK (provider_transaction_id IS NULL OR NULLIF(BTRIM(provider_transaction_id), '') IS NOT NULL),
    CONSTRAINT ck_payments_payment_url CHECK (payment_url IS NULL OR NULLIF(BTRIM(payment_url), '') IS NOT NULL),
    CONSTRAINT ck_payments_online_method CHECK (
        method = 'BANK_TRANSFER'
        OR (
            provider IS NULL
            AND provider_transaction_id IS NULL
            AND payment_url IS NULL
            AND expired_at IS NULL
            AND gateway_payload IS NULL
        )
    ),
    CONSTRAINT ck_payments_amounts CHECK (amount >= 0 AND lost_card_fee >= 0 AND total_amount >= 0 AND received_amount >= 0),
    CONSTRAINT ck_payments_total_amount CHECK (total_amount = amount + lost_card_fee),
    CONSTRAINT ck_payments_valid_until CHECK (payment_valid_until IS NULL OR paid_at IS NULL OR payment_valid_until > paid_at),
    CONSTRAINT ck_payments_purpose CHECK (purpose IN (
        'PARKING_FEE',
        'LOST_CARD_FEE',
        'MONTHLY_PASS_RENEWAL',
        'RESERVATION_FEE',
        'RESERVATION_EXTENSION',
        'LOST_CARD_REFUND'
    )),
    CONSTRAINT ck_payments_source CHECK (
        (
            purpose = 'MONTHLY_PASS_RENEWAL'
            AND monthly_pass_id IS NOT NULL
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
    )
);

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

CREATE TABLE IF NOT EXISTS reservation_extensions (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES reservations(id),
    old_expires_at TIMESTAMPTZ NOT NULL,
    new_expires_at TIMESTAMPTZ NOT NULL,
    added_minutes INT NOT NULL,
    pricing_rule_id BIGINT REFERENCES pricing_rules(id),
    snapshot_reservation_hourly_price NUMERIC(12,2) NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_id BIGINT REFERENCES payments(id),
    requested_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_reservation_extensions_time CHECK (new_expires_at > old_expires_at),
    CONSTRAINT ck_reservation_extensions_amounts CHECK (
        added_minutes > 0
        AND snapshot_reservation_hourly_price >= 0
        AND amount >= 0
    )
);

CREATE TABLE IF NOT EXISTS receipts (
    id BIGSERIAL PRIMARY KEY,
    receipt_code VARCHAR(50) NOT NULL,
    session_id BIGINT REFERENCES parking_sessions(id),
    payment_id BIGINT REFERENCES payments(id),
    card_code VARCHAR(50) NOT NULL,
    plate_number VARCHAR(30),
    vehicle_type_name VARCHAR(100) NOT NULL,
    entry_time TIMESTAMPTZ,
    exit_time TIMESTAMPTZ,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    lost_card_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH',
    printed_count INT NOT NULL DEFAULT 0,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_receipts_payment_method CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'NONE')),
    CONSTRAINT ck_receipts_amounts CHECK (amount >= 0 AND lost_card_fee >= 0 AND total_amount >= 0),
    CONSTRAINT ck_receipts_total_amount CHECK (total_amount = amount + lost_card_fee),
    CONSTRAINT ck_receipts_printed_count CHECK (printed_count >= 0),
    CONSTRAINT ck_receipts_source CHECK (
        (session_id IS NOT NULL AND entry_time IS NOT NULL AND exit_time IS NOT NULL)
        OR (session_id IS NULL AND entry_time IS NULL AND exit_time IS NULL AND payment_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS lost_card_cases (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES parking_sessions(id),
    card_id BIGINT REFERENCES parking_cards(id),
    reporter_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    verification_note TEXT NOT NULL,
    reason TEXT NOT NULL,
    lost_card_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_by BIGINT NOT NULL REFERENCES users(id),
    approved_by BIGINT REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_lost_card_cases_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    CONSTRAINT ck_lost_card_cases_fee CHECK (lost_card_fee >= 0)
);

CREATE TABLE IF NOT EXISTS lost_card_refunds (
    id BIGSERIAL PRIMARY KEY,
    lost_card_case_id BIGINT NOT NULL REFERENCES lost_card_cases(id),
    session_id BIGINT NOT NULL REFERENCES parking_sessions(id),
    recovered_card_id BIGINT REFERENCES parking_cards(id),
    replacement_card_id BIGINT REFERENCES parking_cards(id),
    refund_percent NUMERIC(5,2) NOT NULL,
    refund_amount NUMERIC(12,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_by BIGINT REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejected_reason TEXT,
    paid_at TIMESTAMPTZ,
    payment_id BIGINT REFERENCES payments(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_lost_card_refunds_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED')),
    CONSTRAINT ck_lost_card_refunds_amounts CHECK (
        refund_percent >= 0
        AND refund_percent <= 100
        AND refund_amount >= 0
    ),
    CONSTRAINT ck_lost_card_refunds_reason CHECK (NULLIF(BTRIM(reason), '') IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS plate_mismatch_cases (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES parking_sessions(id),
    entry_plate_number VARCHAR(30),
    exit_plate_number VARCHAR(30) NOT NULL,
    reason TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_by BIGINT NOT NULL REFERENCES users(id),
    confirmed_by BIGINT REFERENCES users(id),
    confirmed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_plate_mismatch_cases_status CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id BIGINT REFERENCES users(id),
    source_service VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_audit_logs_source_service CHECK (source_service IN ('CORE_API', 'SUPPORT_API'))
);
