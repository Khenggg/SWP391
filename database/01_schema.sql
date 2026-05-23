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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_driver_profiles_status CHECK (status IN ('ACTIVE', 'LOCKED', 'INACTIVE'))
);

CREATE TABLE IF NOT EXISTS vehicle_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_areas_status CHECK (status IN ('ACTIVE', 'LOCKED', 'MAINTENANCE'))
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
    CONSTRAINT ck_slots_status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'LOCKED', 'MAINTENANCE')),
    CONSTRAINT ck_slots_current_session_status CHECK (
        (status = 'OCCUPIED' AND current_session_id IS NOT NULL)
        OR (status IN ('AVAILABLE', 'LOCKED', 'MAINTENANCE') AND current_session_id IS NULL)
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
        AND lost_card_fee >= 0
    )
);

CREATE TABLE IF NOT EXISTS monthly_passes (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT REFERENCES driver_profiles(id),
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
    monthly_pass_id BIGINT REFERENCES monthly_passes(id),
    floor_id BIGINT NOT NULL REFERENCES floors(id),
    area_id BIGINT NOT NULL REFERENCES areas(id),
    slot_id BIGINT NOT NULL REFERENCES slots(id),
    entry_gate_id BIGINT NOT NULL REFERENCES gates(id),
    exit_gate_id BIGINT REFERENCES gates(id),
    entry_staff_id BIGINT NOT NULL REFERENCES users(id),
    exit_staff_id BIGINT REFERENCES users(id),
    entry_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    exit_time TIMESTAMPTZ,
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
    override_reason TEXT,
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
    CONSTRAINT ck_sessions_exit_time CHECK (exit_time IS NULL OR exit_time >= entry_time)
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES parking_sessions(id),
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    lost_card_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    method VARCHAR(30) NOT NULL DEFAULT 'CASH',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    paid_at TIMESTAMPTZ,
    collected_by BIGINT REFERENCES users(id),
    waive_reason VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_payments_method CHECK (method IN ('CASH', 'NONE')),
    CONSTRAINT ck_payments_status CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'WAIVED', 'NOT_REQUIRED')),
    CONSTRAINT ck_payments_amounts CHECK (amount >= 0 AND lost_card_fee >= 0 AND total_amount >= 0),
    CONSTRAINT ck_payments_total_amount CHECK (total_amount = amount + lost_card_fee)
);

CREATE TABLE IF NOT EXISTS receipts (
    id BIGSERIAL PRIMARY KEY,
    receipt_code VARCHAR(50) NOT NULL,
    session_id BIGINT NOT NULL REFERENCES parking_sessions(id),
    payment_id BIGINT REFERENCES payments(id),
    card_code VARCHAR(50) NOT NULL,
    plate_number VARCHAR(30),
    vehicle_type_name VARCHAR(100) NOT NULL,
    entry_time TIMESTAMPTZ NOT NULL,
    exit_time TIMESTAMPTZ NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    lost_card_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH',
    printed_count INT NOT NULL DEFAULT 0,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_receipts_payment_method CHECK (payment_method IN ('CASH', 'NONE')),
    CONSTRAINT ck_receipts_amounts CHECK (amount >= 0 AND lost_card_fee >= 0 AND total_amount >= 0),
    CONSTRAINT ck_receipts_total_amount CHECK (total_amount = amount + lost_card_fee),
    CONSTRAINT ck_receipts_printed_count CHECK (printed_count >= 0)
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
