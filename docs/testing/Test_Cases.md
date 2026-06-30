# Test Cases

File này dùng để theo dõi test thủ công và test tự động cho MVP/demo.

## Nhóm Test P0

- Auth login thành công/thất bại.
- JWT do `.NET` phát hành được Spring verify.
- Database tạo từ `database/01_schema.sql`, `02_seed.sql`, `03_indexes_constraints.sql`.
- Spring giữ `ddl-auto=validate` và không tự sửa schema.
- Vehicle type, card, slot, gate, pricing có dữ liệu hợp lệ.
- Entry transaction tạo session, cập nhật card/slot và ghi audit log.
- Chặn duplicate card, duplicate plate và slot không hợp lệ.
- Fee/payment/exit/receipt chạy hết luồng và giải phóng card/slot.

## Nhóm Test P1

- Public QR lookup không lộ dữ liệu nhạy cảm.
- Monthly pass exit không thu tiền hoặc payment waived/not required.
- Lost card create/approve/reject.
- Plate mismatch pending/confirm/reject.
- Cancel session giải phóng trạng thái đúng.
- Dashboard/report đọc đúng dữ liệu sau khi `.NET` ghi.
- Audit log search tìm được action quan trọng.

## Nhóm Test P2

- Excel export nếu còn thời gian.
- UI polish/responsive.
- Biểu đồ nâng cao.

## Cách Ghi Test Case

```text
TC-XX - Tên test
Module:
Backend/UI:
Precondition:
Steps:
Expected result:
Status:
```

---

## Chi tiết Test Cases Sprint 3 (Entry Flow)

### TC-ENTRY-01 - Casual Vehicle Entry Success (Car - Slot-managed)
- **Module**: Entry Processing (F032, F035, F036)
- **Backend/UI**: Backend Core API
- **Precondition**:
  - Parking Card ID `2` exists with status `AVAILABLE` and `current_session_id` is `null`.
  - Slot ID `11` exists with status `AVAILABLE`, allowing vehicle type `5` (Ô tô / Car).
  - Pricing rule for vehicle type `5` is `ACTIVE` and effective.
  - Plate number `51A-11111` has no active session.
- **Steps**:
  1. Call `POST /api/core/parking-sessions/entry` with:
     ```json
     {
       "entryGateId": 1,
       "plateNumber": "51A-11111",
       "noPlate": false,
       "vehicleDescription": null,
       "vehicleTypeId": 5,
       "cardId": 2,
       "selectedAreaId": 2,
       "selectedSlotId": 11,
       "overrideReason": null
     }
     ```
- **Expected result**:
  - Response returns `200 OK` with `success: true` and session details.
  - Parking Card ID `2` status changes to `IN_USE` and `current_session_id` is updated.
  - Slot ID `11` status changes to `OCCUPIED` and `current_session_id` is updated.
  - Area ID `2` real occupancy increments by 1.
  - Session contains flat pricing snapshot matching the active pricing rule.
  - `customer_type` is set to `'CASUAL'`, `payment_required` is `true`, and `payment_status` is `'PENDING'`.
  - An audit log with action `SESSION_CREATED` is added to the `audit_logs` table.
- **Status**: Ready

### TC-ENTRY-01B - Casual Vehicle Entry Success (Motorbike - Area-managed)
- **Module**: Entry Processing (F032, F035, F036)
- **Backend/UI**: Backend Core API
- **Precondition**:
  - Parking Card ID `3` exists with status `AVAILABLE` and `current_session_id` is `null`.
  - Vehicle type `3` (Xe máy / Motorbike) is area-managed (does not require slot, `requires_slot` = `false`).
  - Pricing rule for vehicle type `3` is `ACTIVE` and effective.
  - Plate number `59X-22222` has no active session.
- **Steps**:
  1. Call `POST /api/core/parking-sessions/entry` with:
     ```json
     {
       "entryGateId": 1,
       "plateNumber": "59X-22222",
       "noPlate": false,
       "vehicleDescription": null,
       "vehicleTypeId": 3,
       "cardId": 3,
       "selectedAreaId": 1,
       "selectedSlotId": null,
       "overrideReason": null
     }
     ```
- **Expected result**:
  - Response returns `200 OK` with `success: true` and session details.
  - Parking Card ID `3` status changes to `IN_USE` and `current_session_id` is updated.
  - Slot ID is `null` in the session.
  - Area ID `1` real occupancy increments by 1.
  - Session contains flat pricing snapshot matching the active pricing rule.
  - `customer_type` is set to `'CASUAL'`, `payment_required` is `true`, and `payment_status` is `'PENDING'`.
  - An audit log with action `SESSION_CREATED` is added to the `audit_logs` table.
- **Status**: Ready

### TC-ENTRY-02 - Monthly Pass Entry Success (Motorbike - Area-managed)
- **Module**: Entry Processing (F032, F035, F036)
- **Backend/UI**: Backend Core API
- **Precondition**:
  - Parking Card ID `1` exists with status `AVAILABLE` and `current_session_id` is `null`.
  - Plate number `51A-99999` has an active monthly pass (`status = 'ACTIVE'`, matching vehicle type `3` (Xe máy), valid dates).
  - Pricing rule for vehicle type `3` is `ACTIVE` and effective.
- **Steps**:
  1. Call `POST /api/core/parking-sessions/entry` with:
     ```json
     {
       "entryGateId": 1,
       "plateNumber": "51A-99999",
       "noPlate": false,
       "vehicleDescription": null,
       "vehicleTypeId": 3,
       "cardId": 1,
       "selectedAreaId": 1,
       "selectedSlotId": null,
       "overrideReason": null
     }
     ```
- **Expected result**:
  - Response returns `200 OK` with `success: true` and session details.
  - Session `customer_type` is set to `'MONTHLY'`, `payment_required` is `false`, and `payment_status` is `'NOT_REQUIRED'`.
  - Session contains `monthly_pass_id` pointing to the matching monthly pass ID `1`.
  - Parking Card ID `1` status is updated correctly to `IN_USE`.
  - Slot ID is `null`.
  - Audit log is written.
- **Status**: Ready

### TC-ENTRY-03 - Entry Blocked - Card Not Available
- **Module**: Entry Processing (F032)
- **Backend/UI**: Backend Core API
- **Precondition**:
  - Parking Card ID `3` exists with status `IN_USE` (or `LOST`, `DAMAGED`, `INACTIVE`).
- **Steps**:
  1. Call `POST /api/core/parking-sessions/entry` with card ID `3`.
- **Expected result**:
  - Response returns `400 Bad Request` with `success: false` and error code `CARD_NOT_AVAILABLE` in the errors list.
  - No database state is modified (transaction rollbacked).
- **Status**: Ready

### TC-ENTRY-04 - Entry Blocked - Slot Not Available
- **Module**: Entry Processing (F032)
- **Backend/UI**: Backend Core API
- **Precondition**:
  - Slot ID `3` status is `OCCUPIED` (or `LOCKED`, `MAINTENANCE`), OR allows vehicle type `4` (Motorbike) while request is for vehicle type `3` (Car).
- **Steps**:
  1. Call `POST /api/core/parking-sessions/entry` with slot ID `3` and vehicleTypeId `3`.
- **Expected result**:
  - Response returns `400 Bad Request` with `success: false` and error code `SLOT_NOT_AVAILABLE` in the errors list.
  - No database state is modified (transaction rollbacked).
- **Status**: Ready

### TC-ENTRY-05 - Entry Blocked - Vehicle Has Active Session
- **Module**: Entry Processing (F032)
- **Backend/UI**: Backend Core API
- **Precondition**:
  - Plate number `51A-11111` already has an active session in the database (`status = 'ACTIVE'`).
- **Steps**:
  1. Call `POST /api/core/parking-sessions/entry` with plate number `51A-11111`.
- **Expected result**:
  - Response returns `400 Bad Request` with `success: false` and error code `VEHICLE_HAS_ACTIVE_SESSION` in the errors list.
- **Status**: Ready

### TC-ENTRY-06 - Entry Blocked - Vehicle Description Required
- **Module**: Entry Processing (F032)
- **Backend/UI**: Backend Core API
- **Precondition**: None.
- **Steps**:
  1. Call `POST /api/core/parking-sessions/entry` with `noPlate = true` and `vehicleDescription = null` (or empty string).
- **Expected result**:
  - Response returns `400 Bad Request` with `success: false` and error code `VEHICLE_DESCRIPTION_REQUIRED` in the errors list.
- **Status**: Ready

### TC-ENTRY-07 - Entry Blocked - Pricing Rule Not Found
- **Module**: Entry Processing (F032)
- **Backend/UI**: Backend Core API
- **Precondition**:
  - No active pricing rule exists in the database for vehicle type `7` (Freight Truck).
- **Steps**:
  1. Call `POST /api/core/parking-sessions/entry` with vehicleTypeId `7`.
- **Expected result**:
  - Response returns `400 Bad Request` with `success: false` and error code `PRICING_RULE_NOT_FOUND` in the errors list.
- **Status**: Ready

---

## Chi tiết Test Cases Sprint 4 (Booking/Reservation)

### TC-BOOKING-01 - Suggest Available Locations - Car (Slot-managed)
- **Module**: Booking/Reservation (F078)
- **Backend/UI**: Backend Core API
- **Precondition**:
  - Active Pricing Rule exists for vehicle type `5` (Car).
  - Slot ID `12` is `AVAILABLE`, allowing vehicle type `5`.
  - No active reservation (`PENDING` or `CONFIRMED`) holds Slot ID `12`.
- **Steps**:
  1. Call `GET /api/core/reservations/available-locations?vehicleTypeId=5`.
- **Expected result**:
  - Response returns `200 OK` with details.
  - `requiresSlot` is `true`.
  - `availableSlots` list contains Slot ID `12`.
- **Status**: Ready

### TC-BOOKING-02 - Suggest Available Locations - Motorbike (Area-managed)
- **Module**: Booking/Reservation (F078)
- **Backend/UI**: Backend Core API
- **Precondition**:
  - Active Pricing Rule exists for vehicle type `3` (Motorbike).
  - Area ID `1` supports vehicle type `3`.
  - Area ID `1` has vacancy: `current_real_occupancy + current_booked_slots < total_capacity`.
- **Steps**:
  1. Call `GET /api/core/reservations/available-locations?vehicleTypeId=3`.
- **Expected result**:
  - Response returns `200 OK` with details.
  - `requiresSlot` is `false`.
  - `availableAreas` list contains Area ID `1` with a positive `availableCapacity`.
- **Status**: Ready

### TC-BOOKING-03 - Create Reservation Success - Car
- **Module**: Booking/Reservation (F079, F080)
- **Backend/UI**: Backend Core API
- **Precondition**:
  - Active Pricing Rule exists for vehicle type `5` (Car).
  - Slot ID `12` is `AVAILABLE`.
  - License plate `51A-22222` has no active pending reservation.
- **Steps**:
  1. Call `POST /api/core/reservations` with:
     ```json
     {
       "driverId": null,
       "vehicleId": null,
       "plateNumber": "51A-22222",
       "vehicleTypeId": 5,
       "floorId": 1,
       "areaId": 1,
       "slotId": 12,
       "reservedDurationMinutes": 60
     }
     ```
- **Expected result**:
  - Response returns `201 Created` with reservation details.
  - Reservation `status` is `CONFIRMED` (if fee is 0 or waived) or `PENDING` (requiring payment).
  - Slot ID `12` status is updated to `RESERVED` in database.
  - Area `current_booked_slots` increments by 1.
- **Status**: Ready

### TC-BOOKING-04 - Create Reservation Success - Motorbike
- **Module**: Booking/Reservation (F079, F080)
- **Backend/UI**: Backend Core API
- **Precondition**:
  - Active Pricing Rule exists for vehicle type `3` (Motorbike).
  - Area ID `1` has available capacity.
  - License plate `59X-33333` has no active pending reservation.
- **Steps**:
  1. Call `POST /api/core/reservations` with:
     ```json
     {
       "driverId": null,
       "vehicleId": null,
       "plateNumber": "59X-33333",
       "vehicleTypeId": 3,
       "floorId": 1,
       "areaId": 1,
       "slotId": null,
       "reservedDurationMinutes": 120
     }
     ```
- **Expected result**:
  - Response returns `201 Created` with reservation details.
  - `slotId` in response is `null`.
  - Area `current_booked_slots` increments by 1.
- **Status**: Ready

### TC-BOOKING-05 - Extend Reservation Success
- **Module**: Booking/Reservation (F081)
- **Backend/UI**: Backend Core API
- **Precondition**:
  - Reservation ID `1` exists with status `CONFIRMED` or `PENDING`.
- **Steps**:
  1. Call `POST /api/core/reservations/1/extend` with:
     ```json
     {
       "addedMinutes": 30
     }
     ```
- **Expected result**:
  - Response returns `200 OK` with updated reservation.
  - `expiresAt` is extended by 30 minutes.
  - `bookingAmount` increases by the calculated extension fee.
  - A new entry is added to the `reservation_extensions` table.
- **Status**: Ready

### TC-BOOKING-06 - Cancel Reservation Success
- **Module**: Booking/Reservation (F082)
- **Backend/UI**: Backend Core API
- **Precondition**:
  - Reservation ID `1` exists with status `CONFIRMED` on Slot ID `12` and Area ID `1`.
- **Steps**:
  1. Call `POST /api/core/reservations/1/cancel` with:
     ```json
     {
       "reason": "Changed my plans"
     }
     ```
- **Expected result**:
  - Response returns `200 OK` with reservation details.
  - Reservation `status` changes to `CANCELLED`.
  - Slot ID `12` status reverts to `AVAILABLE`.
  - Area `current_booked_slots` decrements by 1.
- **Status**: Ready

### TC-BOOKING-07 - Check-in Entry Integration - Car
- **Module**: Booking/Reservation Check-in (F083)
- **Backend/UI**: Backend Core API
- **Precondition**:
  - Reservation ID `1` exists in `CONFIRMED` status for plate `51A-22222` with Slot ID `12` and Area ID `1`.
  - Parking Card code `C002` is `AVAILABLE`.
- **Steps**:
  1. Call `POST /api/core/parking-sessions/entry` with:
     ```json
     {
       "cardCode": "C002",
       "licensePlate": "51A-22222",
       "noPlate": false,
       "vehicleTypeId": 5,
       "entryGateId": 1,
       "selectedSlotId": 12
     }
     ```
- **Expected result**:
  - Response returns `200 OK` with session details.
  - Reservation ID `1` status updates to `COMPLETED`, `checkedInAt` is populated.
  - Slot ID `12` status updates from `RESERVED` to `OCCUPIED`, `currentSessionId` links to the new session.
  - Area `current_booked_slots` decrements by 1, and `current_real_occupancy` increments by 1.
  - Session links to `reservation_id` = `1`, with `customer_type` = `'CASUAL'`, `payment_required` = `false`, and `payment_status` = `'PAID'`.
- **Status**: Ready

### TC-BOOKING-08 - Check-in Entry Integration - Motorbike
- **Module**: Booking/Reservation Check-in (F083)
- **Backend/UI**: Backend Core API
- **Precondition**:
  - Reservation ID `2` exists in `CONFIRMED` status for plate `59X-33333` with Area ID `1`.
  - Parking Card code `C003` is `AVAILABLE`.
- **Steps**:
  1. Call `POST /api/core/parking-sessions/entry` with:
     ```json
     {
       "cardCode": "C003",
       "licensePlate": "59X-33333",
       "noPlate": false,
       "vehicleTypeId": 3,
       "entryGateId": 1,
       "selectedSlotId": null
     }
     ```
- **Expected result**:
  - Response returns `200 OK` with session details.
  - Reservation ID `2` status updates to `COMPLETED`.
  - Session links to `reservation_id` = `2`, `slotId` is `null`.
  - Area `current_booked_slots` decrements by 1, and `current_real_occupancy` increments by 1.
- **Status**: Ready

### TC-BOOKING-09 - Auto-expiration (Background Worker)
- **Module**: Booking/Reservation (F082)
- **Backend/UI**: Backend Core API (Background Service)
- **Precondition**:
  - Reservation ID `3` exists with status `CONFIRMED` on Slot ID `12` and Area ID `1`.
  - `expiresAt` is in the past.
- **Steps**:
  1. Wait for `ReservationExpiryWorker` to run (runs once every minute).
- **Expected result**:
  - Reservation `status` changes to `EXPIRED`.
  - Slot ID `12` status reverts to `AVAILABLE`.
  - Area `current_booked_slots` decrements by 1.
  - Audit log is recorded for the expiration.
- **Status**: Ready


