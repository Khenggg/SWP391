-- Parking Building Management System - MVP seed data
-- Run after 01_schema.sql. Demo passwords are "123456".
-- This file seeds baseline master/demo data only. Core transaction data
-- such as sessions, payments, receipts, lost-card cases and mismatch cases
-- should be created through APIs during flow tests.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (id, full_name, username, email, phone, password_hash, role, status)
VALUES
    (1, 'System Admin', 'admin01', 'admin01@example.local', '0900000001', crypt('123456', gen_salt('bf', 10)), 'ADMIN', 'ACTIVE'),
    (2, 'Demo Manager', 'manager01', 'manager01@example.local', '0900000002', crypt('123456', gen_salt('bf', 10)), 'MANAGER', 'ACTIVE'),
    (3, 'Demo Staff', 'staff01', 'staff01@example.local', '0900000003', crypt('123456', gen_salt('bf', 10)), 'STAFF', 'ACTIVE'),
    (4, 'Demo Driver', 'driver01', 'driver01@example.local', '0900000004', crypt('123456', gen_salt('bf', 10)), 'DRIVER', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO driver_profiles (id, user_id, full_name, phone, email, status, driver_type, apartment_number, cccd_number)
VALUES
    (1, 4, 'Demo Driver', '0900000004', 'driver01@example.local', 'ACTIVE', 'RESIDENT', 'A-0101', '012345678901'),
    (2, NULL, 'Other Driver', '0900000009', 'other@example.local', 'ACTIVE', 'RESIDENT', 'A-0102', '012345678902')
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    status = EXCLUDED.status,
    driver_type = EXCLUDED.driver_type,
    apartment_number = EXCLUDED.apartment_number,
    cccd_number = EXCLUDED.cccd_number,
    updated_at = now();

INSERT INTO vehicle_types (id, name, description, is_active, requires_slot)
VALUES
    (1, 'Xe đạp', 'Xe đạp tiêu chuẩn', true, false),
    (2, 'Xe đạp điện', 'Xe đạp điện hoặc xe điện nhẹ', true, false),
    (3, 'Xe máy', 'Xe máy tiêu chuẩn', true, false),
    (4, 'Xe máy điện', 'Xe máy điện', true, false),
    (5, 'Ô tô', 'Ô tô chở khách', true, true),
    (6, 'Ô tô điện', 'Ô tô điện chở khách', true, true),
    (7, 'Xe vận chuyển hàng hóa', 'Xe giao hàng hoặc xe chở hàng nhỏ', true, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    requires_slot = EXCLUDED.requires_slot,
    updated_at = now();

INSERT INTO vehicles (id, driver_id, plate_number, normalized_plate_number, vehicle_type_id, description, status)
VALUES
    (1, 1, '51A-99999', '51A99999', 3, 'Demo monthly pass motorbike', 'ACTIVE'),
    (2, 2, '29A-88888', '29A88888', 5, 'Other Driver Car', 'ACTIVE'),
    (3, 1, '29A-11111', '29A11111', 5, 'Driver owned car', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    driver_id = EXCLUDED.driver_id,
    plate_number = EXCLUDED.plate_number,
    normalized_plate_number = EXCLUDED.normalized_plate_number,
    vehicle_type_id = EXCLUDED.vehicle_type_id,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO floors (id, floor_code, floor_name, status)
VALUES
    (1, 'B1', 'Tầng hầm B1', 'ACTIVE'),
    (2, 'B2', 'Tầng hầm B2', 'ACTIVE'),
    (3, 'B3', 'Tầng hầm B3', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    floor_code = EXCLUDED.floor_code,
    floor_name = EXCLUDED.floor_name,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO areas (id, floor_id, area_code, area_name, priority_order, status, total_capacity)
VALUES
    (1, 1, 'A', 'B1 - Khu xe máy A', 10, 'ACTIVE', 150),
    (2, 1, 'B', 'B1 - Khu ô tô B', 20, 'ACTIVE', 10),
    (3, 2, 'A', 'B2 - Khu xe máy A', 30, 'ACTIVE', 150),
    (4, 2, 'B', 'B2 - Khu ô tô B', 40, 'ACTIVE', 10),
    (5, 3, 'A', 'B3 - Khu xe đạp A', 50, 'ACTIVE', 100)
ON CONFLICT (id) DO UPDATE SET
    floor_id = EXCLUDED.floor_id,
    area_code = EXCLUDED.area_code,
    area_name = EXCLUDED.area_name,
    priority_order = EXCLUDED.priority_order,
    status = EXCLUDED.status,
    total_capacity = EXCLUDED.total_capacity,
    updated_at = now();

INSERT INTO area_vehicle_types (area_id, vehicle_type_id)
VALUES
    (1, 3),
    (1, 4),
    (2, 5),
    (2, 6),
    (2, 7),
    (3, 3),
    (3, 4),
    (4, 5),
    (4, 6),
    (4, 7),
    (5, 1),
    (5, 2)
ON CONFLICT (area_id, vehicle_type_id) DO NOTHING;

INSERT INTO slots (id, area_id, slot_code, allowed_vehicle_type_id, status)
VALUES
    (11, 2, 'B-C01', 5, 'AVAILABLE'),
    (12, 2, 'B-C02', 5, 'AVAILABLE'),
    (13, 2, 'B-C03', 5, 'AVAILABLE'),
    (14, 2, 'B-C04', 5, 'AVAILABLE'),
    (15, 2, 'B-C05', 5, 'AVAILABLE'),
    (16, 2, 'B-C06', 5, 'AVAILABLE'),
    (17, 2, 'B-C07', 5, 'AVAILABLE'),
    (18, 2, 'B-EC01', 6, 'AVAILABLE'),
    (19, 2, 'B-EC02', 6, 'AVAILABLE'),
    (20, 2, 'B-D01', 7, 'AVAILABLE'),
    (31, 4, 'B-C01', 5, 'AVAILABLE'),
    (32, 4, 'B-C02', 5, 'AVAILABLE'),
    (33, 4, 'B-C03', 5, 'AVAILABLE'),
    (34, 4, 'B-C04', 5, 'AVAILABLE'),
    (35, 4, 'B-C05', 5, 'AVAILABLE'),
    (36, 4, 'B-C06', 5, 'AVAILABLE'),
    (37, 4, 'B-C07', 5, 'AVAILABLE'),
    (38, 4, 'B-EC01', 6, 'AVAILABLE'),
    (39, 4, 'B-EC02', 6, 'AVAILABLE'),
    (40, 4, 'B-D01', 7, 'AVAILABLE')
ON CONFLICT (id) DO UPDATE SET
    area_id = EXCLUDED.area_id,
    slot_code = EXCLUDED.slot_code,
    allowed_vehicle_type_id = EXCLUDED.allowed_vehicle_type_id,
    updated_at = now();

INSERT INTO gates (id, floor_id, gate_code, gate_type, status)
VALUES
    (1, 1, 'B1-IN', 'ENTRY', 'ACTIVE'),
    (2, 1, 'B1-OUT', 'EXIT', 'ACTIVE'),
    (3, 2, 'B2-IN', 'ENTRY', 'ACTIVE'),
    (4, 2, 'B2-OUT', 'EXIT', 'ACTIVE'),
    (5, 3, 'B3-IN', 'ENTRY', 'ACTIVE'),
    (6, 3, 'B3-OUT', 'EXIT', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    floor_id = EXCLUDED.floor_id,
    gate_code = EXCLUDED.gate_code,
    gate_type = EXCLUDED.gate_type,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO parking_cards (id, card_code, qr_token, status, note)
SELECT
    card_number,
    'C' || LPAD(card_number::TEXT, 3, '0'),
    'QR-C' || LPAD(card_number::TEXT, 3, '0') || '-DEMO-' || UPPER(SUBSTRING(MD5('parking-card-' || card_number::TEXT), 1, 16)),
    'AVAILABLE',
    'Demo card'
FROM generate_series(1, 20) AS card_number
ON CONFLICT (id) DO UPDATE SET
    card_code = EXCLUDED.card_code,
    qr_token = EXCLUDED.qr_token,
    note = EXCLUDED.note,
    updated_at = now();

INSERT INTO pricing_rules (
    id,
    vehicle_type_id,
    day_price,
    night_price,
    monthly_price,
    reservation_hourly_price,
    lost_card_fee,
    effective_from,
    status,
    created_by
)
VALUES
    (1, 1, 2000, 3000, 50000, 1000, 30000, '2026-01-01 00:00:00+07', 'ACTIVE', 2),
    (2, 2, 3000, 4000, 70000, 1000, 30000, '2026-01-01 00:00:00+07', 'ACTIVE', 2),
    (3, 3, 5000, 7000, 150000, 2000, 50000, '2026-01-01 00:00:00+07', 'ACTIVE', 2),
    (4, 4, 6000, 8000, 180000, 2000, 50000, '2026-01-01 00:00:00+07', 'ACTIVE', 2),
    (5, 5, 20000, 30000, 1200000, 10000, 200000, '2026-01-01 00:00:00+07', 'ACTIVE', 2),
    (6, 6, 25000, 35000, 1400000, 10000, 200000, '2026-01-01 00:00:00+07', 'ACTIVE', 2),
    (7, 7, 30000, 40000, 1500000, 12000, 250000, '2026-01-01 00:00:00+07', 'ACTIVE', 2)
ON CONFLICT (id) DO UPDATE SET
    vehicle_type_id = EXCLUDED.vehicle_type_id,
    day_price = EXCLUDED.day_price,
    night_price = EXCLUDED.night_price,
    monthly_price = EXCLUDED.monthly_price,
    reservation_hourly_price = EXCLUDED.reservation_hourly_price,
    lost_card_fee = EXCLUDED.lost_card_fee,
    effective_from = EXCLUDED.effective_from,
    status = EXCLUDED.status,
    created_by = EXCLUDED.created_by,
    updated_at = now();

INSERT INTO monthly_passes (
    id,
    driver_id,
    card_id,
    owner_name,
    phone,
    plate_number,
    normalized_plate_number,
    vehicle_type_id,
    floor_id,
    area_id,
    slot_id,
    start_date,
    end_date,
    status,
    created_by
)
VALUES
    (1, 1, 1, 'Nguyen Van Monthly', '0900000100', '51A-99999', '51A99999', 3, 1, 1, NULL, (CURRENT_DATE - INTERVAL '5 days')::DATE, (CURRENT_DATE + INTERVAL '25 days')::DATE, 'ACTIVE', 2)
ON CONFLICT (id) DO UPDATE SET
    driver_id = EXCLUDED.driver_id,
    card_id = EXCLUDED.card_id,
    owner_name = EXCLUDED.owner_name,
    phone = EXCLUDED.phone,
    plate_number = EXCLUDED.plate_number,
    normalized_plate_number = EXCLUDED.normalized_plate_number,
    vehicle_type_id = EXCLUDED.vehicle_type_id,
    floor_id = EXCLUDED.floor_id,
    area_id = EXCLUDED.area_id,
    slot_id = EXCLUDED.slot_id,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    status = EXCLUDED.status,
    created_by = EXCLUDED.created_by,
    updated_at = now();

INSERT INTO reservations (
    id,
    reservation_code,
    driver_id,
    vehicle_id,
    plate_number,
    normalized_plate_number,
    vehicle_type_id,
    floor_id,
    area_id,
    slot_id,
    reserved_duration_minutes,
    booking_amount,
    payment_status,
    reserved_at,
    expires_at,
    status,
    created_by
)
VALUES (
    1001,
    'RSV-NOPLATE-CAR-001',
    1,
    NULL,
    NULL,
    NULL,
    5, -- Ô tô
    1,
    2,
    12, -- Slot 12
    60,
    20000,
    'PAID',
    now(),
    now() + interval '60 minutes',
    'CONFIRMED',
    2
),
(
    1002,
    'RSV-NOPLATE-BIKE-001',
    1,
    NULL,
    NULL,
    NULL,
    3, -- Xe máy
    1,
    1,
    NULL,
    60,
    5000,
    'PAID',
    now(),
    now() + interval '60 minutes',
    'CONFIRMED',
    2
)
ON CONFLICT (id) DO UPDATE SET
    reservation_code = EXCLUDED.reservation_code,
    driver_id = EXCLUDED.driver_id,
    vehicle_id = EXCLUDED.vehicle_id,
    plate_number = EXCLUDED.plate_number,
    normalized_plate_number = EXCLUDED.normalized_plate_number,
    vehicle_type_id = EXCLUDED.vehicle_type_id,
    floor_id = EXCLUDED.floor_id,
    area_id = EXCLUDED.area_id,
    slot_id = EXCLUDED.slot_id,
    reserved_duration_minutes = EXCLUDED.reserved_duration_minutes,
    booking_amount = EXCLUDED.booking_amount,
    payment_status = EXCLUDED.payment_status,
    reserved_at = EXCLUDED.reserved_at,
    expires_at = EXCLUDED.expires_at,
    status = EXCLUDED.status,
    created_by = EXCLUDED.created_by,
    updated_at = now();

UPDATE slots
SET status = 'RESERVED'
WHERE id = 12;

SELECT setval('users_id_seq', COALESCE((SELECT max(id) FROM users), 1), (SELECT count(*) > 0 FROM users));
SELECT setval('driver_profiles_id_seq', COALESCE((SELECT max(id) FROM driver_profiles), 1), (SELECT count(*) > 0 FROM driver_profiles));
SELECT setval('vehicle_types_id_seq', COALESCE((SELECT max(id) FROM vehicle_types), 1), (SELECT count(*) > 0 FROM vehicle_types));
SELECT setval('vehicles_id_seq', COALESCE((SELECT max(id) FROM vehicles), 1), (SELECT count(*) > 0 FROM vehicles));
SELECT setval('parking_cards_id_seq', COALESCE((SELECT max(id) FROM parking_cards), 1), (SELECT count(*) > 0 FROM parking_cards));
SELECT setval('floors_id_seq', COALESCE((SELECT max(id) FROM floors), 1), (SELECT count(*) > 0 FROM floors));
SELECT setval('areas_id_seq', COALESCE((SELECT max(id) FROM areas), 1), (SELECT count(*) > 0 FROM areas));
SELECT setval('slots_id_seq', COALESCE((SELECT max(id) FROM slots), 1), (SELECT count(*) > 0 FROM slots));
SELECT setval('gates_id_seq', COALESCE((SELECT max(id) FROM gates), 1), (SELECT count(*) > 0 FROM gates));
SELECT setval('pricing_rules_id_seq', COALESCE((SELECT max(id) FROM pricing_rules), 1), (SELECT count(*) > 0 FROM pricing_rules));
SELECT setval('monthly_passes_id_seq', COALESCE((SELECT max(id) FROM monthly_passes), 1), (SELECT count(*) > 0 FROM monthly_passes));
SELECT setval('reservations_id_seq', COALESCE((SELECT max(id) FROM reservations), 1), (SELECT count(*) > 0 FROM reservations));
SELECT setval('parking_sessions_id_seq', COALESCE((SELECT max(id) FROM parking_sessions), 1), (SELECT count(*) > 0 FROM parking_sessions));
SELECT setval('parking_session_images_id_seq', COALESCE((SELECT max(id) FROM parking_session_images), 1), (SELECT count(*) > 0 FROM parking_session_images));
SELECT setval('payments_id_seq', COALESCE((SELECT max(id) FROM payments), 1), (SELECT count(*) > 0 FROM payments));
SELECT setval('reservation_extensions_id_seq', COALESCE((SELECT max(id) FROM reservation_extensions), 1), (SELECT count(*) > 0 FROM reservation_extensions));
SELECT setval('receipts_id_seq', COALESCE((SELECT max(id) FROM receipts), 1), (SELECT count(*) > 0 FROM receipts));
SELECT setval('lost_card_cases_id_seq', COALESCE((SELECT max(id) FROM lost_card_cases), 1), (SELECT count(*) > 0 FROM lost_card_cases));
SELECT setval('lost_card_refunds_id_seq', COALESCE((SELECT max(id) FROM lost_card_refunds), 1), (SELECT count(*) > 0 FROM lost_card_refunds));
SELECT setval('plate_mismatch_cases_id_seq', COALESCE((SELECT max(id) FROM plate_mismatch_cases), 1), (SELECT count(*) > 0 FROM plate_mismatch_cases));
SELECT setval('audit_logs_id_seq', COALESCE((SELECT max(id) FROM audit_logs), 1), (SELECT count(*) > 0 FROM audit_logs));
