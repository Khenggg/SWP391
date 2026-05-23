-- Parking Building Management System - MVP seed data
-- Run after 01_schema.sql. Demo passwords are "123456".

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (id, full_name, username, email, phone, password_hash, role, status)
VALUES
    (1, 'System Admin', 'admin01', 'admin01@example.local', '0900000001', crypt('123456', gen_salt('bf', 10)), 'ADMIN', 'ACTIVE'),
    (2, 'Demo Manager', 'manager01', 'manager01@example.local', '0900000002', crypt('123456', gen_salt('bf', 10)), 'MANAGER', 'ACTIVE'),
    (3, 'Demo Staff', 'staff01', 'staff01@example.local', '0900000003', crypt('123456', gen_salt('bf', 10)), 'STAFF', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO vehicle_types (id, name, description, is_active)
VALUES
    (1, 'Bicycle', 'Standard bicycle', true),
    (2, 'Electric bicycle', 'Electric bicycle or light e-bike', true),
    (3, 'Motorbike', 'Standard motorbike', true),
    (4, 'Electric motorbike', 'Electric motorbike', true),
    (5, 'Car', 'Passenger car', true),
    (6, 'Electric car', 'Electric passenger car', true),
    (7, 'Delivery vehicle', 'Small delivery or cargo vehicle', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = now();

INSERT INTO floors (id, floor_code, floor_name, status)
VALUES
    (1, 'B1', 'Basement 1', 'ACTIVE'),
    (2, 'B2', 'Basement 2', 'ACTIVE'),
    (3, 'B3', 'Basement 3', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    floor_code = EXCLUDED.floor_code,
    floor_name = EXCLUDED.floor_name,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO areas (id, floor_id, area_code, area_name, priority_order, status)
VALUES
    (1, 1, 'A', 'B1 Motorbike Area A', 10, 'ACTIVE'),
    (2, 1, 'B', 'B1 Car Area B', 20, 'ACTIVE'),
    (3, 2, 'A', 'B2 Motorbike Area A', 30, 'ACTIVE'),
    (4, 2, 'B', 'B2 Car Area B', 40, 'ACTIVE'),
    (5, 3, 'A', 'B3 Bicycle Area A', 50, 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    floor_id = EXCLUDED.floor_id,
    area_code = EXCLUDED.area_code,
    area_name = EXCLUDED.area_name,
    priority_order = EXCLUDED.priority_order,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO area_vehicle_types (area_id, vehicle_type_id)
VALUES
    (1, 3),
    (1, 4),
    (2, 5),
    (2, 6),
    (3, 3),
    (3, 4),
    (4, 5),
    (4, 6),
    (5, 1),
    (5, 2)
ON CONFLICT (area_id, vehicle_type_id) DO NOTHING;

INSERT INTO slots (id, area_id, slot_code, allowed_vehicle_type_id, status)
VALUES
    (1, 1, 'A01', 3, 'AVAILABLE'),
    (2, 1, 'A02', 3, 'AVAILABLE'),
    (3, 1, 'A03', 4, 'AVAILABLE'),
    (4, 2, 'B01', 5, 'AVAILABLE'),
    (5, 2, 'B02', 6, 'AVAILABLE'),
    (6, 3, 'A01', 3, 'AVAILABLE'),
    (7, 3, 'A02', 4, 'AVAILABLE'),
    (8, 4, 'B01', 5, 'AVAILABLE'),
    (9, 4, 'B02', 6, 'AVAILABLE'),
    (10, 5, 'A01', 1, 'AVAILABLE'),
    (11, 5, 'A02', 2, 'AVAILABLE')
ON CONFLICT (id) DO UPDATE SET
    area_id = EXCLUDED.area_id,
    slot_code = EXCLUDED.slot_code,
    allowed_vehicle_type_id = EXCLUDED.allowed_vehicle_type_id,
    status = EXCLUDED.status,
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
VALUES
    (1, 'C001', 'QR-C001-DEMO-TOKEN', 'AVAILABLE', 'Demo card'),
    (2, 'C002', 'QR-C002-DEMO-TOKEN', 'AVAILABLE', 'Demo card'),
    (3, 'C003', 'QR-C003-DEMO-TOKEN', 'AVAILABLE', 'Demo card'),
    (4, 'C004', 'QR-C004-DEMO-TOKEN', 'AVAILABLE', 'Demo card'),
    (5, 'C005', 'QR-C005-DEMO-TOKEN', 'AVAILABLE', 'Demo card'),
    (6, 'C006', 'QR-C006-DEMO-TOKEN', 'AVAILABLE', 'Demo card'),
    (7, 'C007', 'QR-C007-DEMO-TOKEN', 'AVAILABLE', 'Demo card'),
    (8, 'C008', 'QR-C008-DEMO-TOKEN', 'AVAILABLE', 'Demo card'),
    (9, 'C009', 'QR-C009-DEMO-TOKEN', 'AVAILABLE', 'Demo card'),
    (10, 'C010', 'QR-C010-DEMO-TOKEN', 'AVAILABLE', 'Demo card')
ON CONFLICT (id) DO UPDATE SET
    card_code = EXCLUDED.card_code,
    qr_token = EXCLUDED.qr_token,
    status = EXCLUDED.status,
    note = EXCLUDED.note,
    updated_at = now();

INSERT INTO pricing_rules (
    id,
    vehicle_type_id,
    day_price,
    night_price,
    monthly_price,
    lost_card_fee,
    effective_from,
    status,
    created_by
)
VALUES
    (1, 1, 2000, 3000, 100000, 50000, '2026-01-01 00:00:00+00', 'ACTIVE', 2),
    (2, 2, 3000, 4000, 120000, 50000, '2026-01-01 00:00:00+00', 'ACTIVE', 2),
    (3, 3, 5000, 7000, 250000, 100000, '2026-01-01 00:00:00+00', 'ACTIVE', 2),
    (4, 4, 6000, 8000, 280000, 100000, '2026-01-01 00:00:00+00', 'ACTIVE', 2),
    (5, 5, 30000, 50000, 2500000, 500000, '2026-01-01 00:00:00+00', 'ACTIVE', 2),
    (6, 6, 35000, 55000, 2800000, 500000, '2026-01-01 00:00:00+00', 'ACTIVE', 2),
    (7, 7, 40000, 60000, 3000000, 500000, '2026-01-01 00:00:00+00', 'ACTIVE', 2)
ON CONFLICT (id) DO UPDATE SET
    vehicle_type_id = EXCLUDED.vehicle_type_id,
    day_price = EXCLUDED.day_price,
    night_price = EXCLUDED.night_price,
    monthly_price = EXCLUDED.monthly_price,
    lost_card_fee = EXCLUDED.lost_card_fee,
    effective_from = EXCLUDED.effective_from,
    status = EXCLUDED.status,
    created_by = EXCLUDED.created_by,
    updated_at = now();

INSERT INTO monthly_passes (
    id,
    owner_name,
    phone,
    plate_number,
    normalized_plate_number,
    vehicle_type_id,
    start_date,
    end_date,
    status,
    created_by
)
VALUES
    (1, 'Demo Monthly Customer', '0900000100', '59A-12345', '59A12345', 3, '2026-01-01', '2026-12-31', 'ACTIVE', 2)
ON CONFLICT (id) DO UPDATE SET
    owner_name = EXCLUDED.owner_name,
    phone = EXCLUDED.phone,
    plate_number = EXCLUDED.plate_number,
    normalized_plate_number = EXCLUDED.normalized_plate_number,
    vehicle_type_id = EXCLUDED.vehicle_type_id,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    status = EXCLUDED.status,
    created_by = EXCLUDED.created_by,
    updated_at = now();

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
