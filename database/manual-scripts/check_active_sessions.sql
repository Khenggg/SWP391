-- Check all active parking sessions with card, slot, area details
SELECT
    s.id,
    s.session_code,
    s.status,
    s.customer_type,
    s.payment_status,
    s.card_id,
    c.card_code,
    s.plate_number,
    s.normalized_plate_number,
    s.vehicle_type_id,
    s.floor_id,
    s.area_id,
    s.slot_id,
    s.monthly_pass_id,
    s.reservation_id,
    s.entry_time
FROM parking_sessions s
JOIN parking_cards c ON c.id = s.card_id
WHERE s.status IN ('ACTIVE', 'LOST_CARD_PENDING', 'MISMATCH_PENDING')
ORDER BY s.entry_time DESC;
