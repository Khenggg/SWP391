-- 1. Card status overview
SELECT
    c.id,
    c.card_code,
    c.status,
    c.current_session_id,
    s.session_code,
    s.status AS session_status
FROM parking_cards c
LEFT JOIN parking_sessions s ON s.id = c.current_session_id
ORDER BY c.id;

-- 2. Slot status overview
SELECT
    sl.id,
    sl.slot_code,
    sl.status,
    sl.current_session_id,
    a.area_code,
    f.floor_code
FROM slots sl
JOIN areas a ON a.id = sl.area_id
JOIN floors f ON f.id = a.floor_id
ORDER BY f.id, a.id, sl.id;

-- 3. Area occupancy overview
SELECT
    a.id,
    a.area_code,
    a.status,
    a.total_capacity,
    a.current_real_occupancy,
    a.current_booked_slots,
    (a.total_capacity - a.current_real_occupancy - a.current_booked_slots) AS remaining,
    f.floor_code
FROM areas a
JOIN floors f ON f.id = a.floor_id
ORDER BY f.id, a.id;
