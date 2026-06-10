# Parking Database Guide

File này dùng để đọc nhanh database khi xem cùng ERD trong `database/erd.dbml` hoặc `database/erd.mmd`. ERD cho thấy quan hệ bảng; tài liệu này giải thích các ý nghiệp vụ dễ hiểu nhầm.

## Ý Chính

- `parking_sessions` là trung tâm vận hành gửi xe: mỗi lượt xe vào bãi tạo một session.
- `vehicles` không đại diện cho mọi xe từng vào bãi. Bảng này chỉ lưu xe đã đăng ký/quản lý, ví dụ xe cư dân hoặc xe dùng cho vé tháng.
- Xe vãng lai, hoặc cư dân đi xe chưa đăng ký vé tháng, được lưu bằng snapshot biển số/loại xe trên `parking_sessions`.
- App user xem xe đang đỗ/phí bằng cách quét QR trên `parking_cards`, sau đó claim session đang active.

## Nhóm Bảng

| Nhóm | Bảng | Vai trò |
| --- | --- | --- |
| Người dùng | `users`, `driver_profiles` | Tài khoản hệ thống và hồ sơ tài xế/cư dân/vãng lai |
| Xe | `vehicle_types`, `vehicles` | Loại xe và xe đã đăng ký/quản lý |
| Bãi xe | `floors`, `areas`, `slots`, `gates`, `area_vehicle_types` | Tầng, khu, ô đỗ, cổng, loại xe được phép vào khu |
| Thẻ và lượt gửi | `parking_cards`, `parking_sessions`, `parking_session_images` | Thẻ QR, phiên gửi xe, ảnh OCR/xe |
| Đặt chỗ | `reservations`, `reservation_extensions` | Đặt chỗ, gia hạn đặt chỗ |
| Vé tháng | `monthly_passes` | Vé tháng theo biển số/loại xe/thẻ |
| Thanh toán | `payments`, `payment_attempts`, `receipts` | Phí gửi xe, VietQR/payment attempts, biên lai |
| Xử lý sự cố | `lost_card_cases`, `lost_card_refunds`, `plate_mismatch_cases`, `audit_logs` | Mất thẻ, hoàn phí, lệch biển số, audit |

## Field Guide Theo Bảng

Phần này không liệt kê lại mọi `id`, `created_at`, `updated_at` vì chúng có nghĩa chuẩn: khóa chính và audit thời gian tạo/cập nhật. Các field dưới đây là field cần hiểu khi đọc ERD hoặc viết API.

### `users`

Tài khoản đăng nhập hệ thống cho admin/manager/staff/driver app.

| Field | Ý nghĩa |
| --- | --- |
| `username`, `password_hash` | Thông tin đăng nhập. Password luôn lưu dạng hash. |
| `email`, `phone` | Thông tin liên hệ; unique nếu có giá trị. |
| `role` | Phân quyền cấp tài khoản: `ADMIN`, `MANAGER`, `STAFF`, `DRIVER`. |
| `status` | Trạng thái tài khoản: active, locked, inactive. |
| `last_login_at` | Lần đăng nhập gần nhất, phục vụ quản trị/audit. |

### `driver_profiles`

Hồ sơ người gửi xe. Một `user` role `DRIVER` có thể có một profile; cũng có thể có profile chưa gắn account nếu được tạo bởi staff.

| Field | Ý nghĩa |
| --- | --- |
| `user_id` | Link tới tài khoản app nếu người này có account. Nullable để hỗ trợ hồ sơ do staff tạo. |
| `driver_type` | `VISITOR` hoặc `RESIDENT`. Visitor không được tạo xe trong `vehicles`. |
| `apartment_number`, `cccd_number`, `cccd_image_url` | Thông tin xác minh cư dân. Bắt buộc tối thiểu căn hộ và CCCD khi là `RESIDENT`. |
| `resident_verified`, `resident_verified_at`, `resident_verified_by` | Trạng thái và audit xác minh cư dân. |
| `status` | Khóa/mở hồ sơ tài xế. |

### `vehicle_types`

Danh mục loại xe và cách bãi quản lý chỗ đỗ cho loại xe đó.

| Field | Ý nghĩa |
| --- | --- |
| `name` | Tên loại xe, ví dụ xe máy, ô tô, xe đạp điện. |
| `is_active` | Có còn dùng trong hệ thống không. |
| `requires_slot` | `true` nếu loại xe cần ô đỗ cụ thể trong `slots`; `false` nếu chỉ quản lý theo khu `areas`. |

### `vehicles`

Chỉ lưu xe đã đăng ký/quản lý, không lưu xe vãng lai thông thường.

| Field | Ý nghĩa |
| --- | --- |
| `driver_id` | Chủ xe. Nếu có, phải là `driver_profiles.driver_type = RESIDENT`. |
| `plate_number` | Biển số hiển thị cho người dùng. |
| `normalized_plate_number` | Biển số đã chuẩn hóa để tìm kiếm/so khớp, ví dụ bỏ dấu gạch/khoảng trắng. |
| `vehicle_type_id` | Loại xe để kiểm tra khu/slot/pricing. |
| `status` | Xe còn hoạt động hay đã inactive. |

### `floors`, `areas`, `slots`, `gates`

Cấu trúc vật lý của bãi xe.

| Bảng/Field | Ý nghĩa |
| --- | --- |
| `floors.floor_code`, `floor_name` | Mã/tên tầng, ví dụ B1, B2. |
| `areas.floor_id` | Khu thuộc tầng nào. |
| `areas.area_code`, `area_name` | Mã/tên khu trong tầng. Unique theo `floor_id`. |
| `areas.priority_order` | Thứ tự ưu tiên khi gợi ý khu đỗ. |
| `areas.total_capacity` | Sức chứa tổng của khu. |
| `areas.current_real_occupancy` | Số xe đang thực sự đỗ. |
| `areas.current_booked_slots` | Số chỗ đang được giữ bởi reservation. |
| `area_vehicle_types` | Bảng nối cho biết khu nào cho phép loại xe nào. |
| `slots.area_id` | Ô đỗ thuộc khu nào. |
| `slots.slot_code` | Mã ô đỗ, unique trong khu. |
| `slots.allowed_vehicle_type_id` | Loại xe được phép dùng ô này. |
| `slots.current_session_id` | Session đang chiếm ô. Chỉ có khi `status = OCCUPIED`. |
| `gates.floor_id`, `gate_type` | Cổng thuộc tầng nào và là cổng vào hay cổng ra. |
| `status` | Trạng thái tầng/khu/cổng/ô: active, locked, maintenance... |

### `pricing_rules`

Bảng giá theo loại xe. Session/payment nên snapshot giá tại thời điểm giao dịch để không bị ảnh hưởng khi đổi bảng giá sau này.

| Field | Ý nghĩa |
| --- | --- |
| `vehicle_type_id` | Loại xe áp dụng giá. Chỉ có một rule active cho mỗi loại xe. |
| `day_price`, `night_price` | Giá gửi theo khung ngày/đêm. |
| `monthly_price` | Giá vé tháng. |
| `reservation_hourly_price` | Giá đặt chỗ/gia hạn theo giờ. |
| `lost_card_fee` | Phí mất thẻ mặc định. |
| `effective_from` | Thời điểm rule bắt đầu hiệu lực. |
| `status` | `ACTIVE` hoặc `INACTIVE`. |
| `created_by`, `updated_by` | Nhân sự tạo/cập nhật bảng giá. |

### `monthly_passes`

Vé tháng theo biển số, loại xe và thẻ. Có thể gắn với cư dân, nhưng vẫn snapshot thông tin chủ xe để giữ lịch sử.

| Field | Ý nghĩa |
| --- | --- |
| `driver_id` | Chủ vé nếu có hồ sơ trong hệ thống. Nullable để hỗ trợ vé tạo từ thông tin snapshot. |
| `card_id` | Thẻ dùng cho vé tháng. Một thẻ chỉ có một vé tháng active. |
| `owner_name`, `phone` | Snapshot chủ vé. |
| `plate_number`, `normalized_plate_number` | Biển số hiển thị và biển số chuẩn hóa. |
| `vehicle_type_id` | Loại xe của vé tháng. |
| `start_date`, `end_date` | Khoảng hiệu lực. |
| `status` | `ACTIVE`, `EXPIRED`, `LOCKED`. |
| `created_by` | Nhân sự tạo vé. |

### `reservations`

Đặt chỗ trước từ app. Reservation có thể tạo bởi visitor hoặc resident, nhưng xe đặt chỗ vẫn lưu snapshot biển số.

| Field | Ý nghĩa |
| --- | --- |
| `reservation_code` | Mã đặt chỗ để tra cứu/QR/check-in. |
| `driver_id` | Người đặt nếu đã có profile. |
| `vehicle_id` | Xe đã đăng ký nếu reservation dùng xe managed. Nullable với xe vãng lai. |
| `plate_number`, `normalized_plate_number` | Biển số snapshot của lượt đặt. |
| `floor_id`, `area_id`, `slot_id` | Vị trí được giữ. `slot_id` nullable nếu loại xe chỉ quản lý theo khu. |
| `pricing_rule_id` | Bảng giá dùng để tính phí đặt chỗ. |
| `snapshot_reservation_hourly_price` | Giá đặt chỗ được snapshot tại thời điểm tạo. |
| `reserved_duration_minutes`, `booking_amount` | Thời lượng và tiền đặt chỗ. |
| `payment_status` | Trạng thái thanh toán tiền đặt chỗ. |
| `reserved_at`, `expires_at` | Thời điểm đặt và hết hạn giữ chỗ. |
| `checked_in_at`, `checked_in_by` | Audit khi staff xác nhận xe vào từ reservation. |
| `cancelled_at`, `cancelled_by`, `cancellation_reason` | Audit hủy đặt chỗ. |
| `status` | `PENDING`, `COMPLETED`, `CANCELLED`, `EXPIRED`. |

### `parking_cards`

Thẻ vật lý/QR phát cho xe khi vào bãi.

| Field | Ý nghĩa |
| --- | --- |
| `card_code` | Mã thẻ in/hiển thị cho staff. |
| `qr_token` | Token QR để driver app quét claim session. |
| `status` | `AVAILABLE`, `IN_USE`, `LOST`, `DAMAGED`, `INACTIVE`. |
| `current_session_id` | Session đang dùng thẻ. Có giá trị khi thẻ đang `IN_USE`; được release sau checkout. |
| `note` | Ghi chú vận hành cho thẻ. |

### `parking_sessions`

Bảng quan trọng nhất. Mỗi dòng là một lượt gửi xe thực tế.

| Field | Ý nghĩa |
| --- | --- |
| `session_code` | Mã lượt gửi xe để tra cứu. |
| `card_id` | Thẻ đang gắn với lượt gửi. Một thẻ chỉ có một active session. |
| `driver_id` | Người gửi xe nếu đã xác định/claim được. Nullable lúc staff vừa check-in xe vãng lai. |
| `vehicle_id` | Xe registered/managed nếu có. Xe vãng lai thường để null. |
| `plate_number`, `normalized_plate_number` | Snapshot biển số của lượt gửi. Đây là nguồn chính cho xe vãng lai. |
| `no_plate`, `vehicle_description` | Dùng khi không có biển số; bắt buộc mô tả xe nếu `no_plate = true`. |
| `vehicle_type_id` | Loại xe của session để tính giá và kiểm tra khu/slot. |
| `customer_type` | `CASUAL` hoặc `MONTHLY`. Cư dân đi xe chưa có vé tháng vẫn có thể là `CASUAL`. |
| `claimed_by_user_id`, `claimed_at`, `claim_method` | User app đã claim session bằng QR thẻ hoặc staff assign. Đã claim thì không đổi sang user khác. |
| `monthly_pass_id` | Vé tháng áp dụng nếu session là xe vé tháng. |
| `reservation_id` | Reservation gốc nếu xe check-in từ đặt chỗ. Unique nếu có. |
| `floor_id`, `area_id`, `slot_id` | Vị trí xe đang đỗ. `slot_id` nullable với loại xe quản lý theo khu. |
| `entry_gate_id`, `exit_gate_id` | Cổng vào/cổng ra. `exit_gate_id` chỉ có khi checkout. |
| `entry_staff_id`, `exit_staff_id` | Nhân sự xử lý vào/ra. |
| `entry_time`, `exit_time` | Thời điểm vào/ra. `exit_time` null khi xe còn trong bãi. |
| `billable_start_time` | Thời điểm bắt đầu tính phí; có thể khác `entry_time` nếu đi từ reservation. |
| `status` | `ACTIVE`, `COMPLETED`, `CANCELLED`, `LOST_CARD_PENDING`, `MISMATCH_PENDING`. |
| `payment_required`, `payment_status` | Có cần thanh toán không và trạng thái thanh toán của session. |
| `pricing_rule_id` | Rule dùng để tính phí session. |
| `snapshot_day_price`, `snapshot_night_price`, `snapshot_monthly_price`, `snapshot_lost_card_fee` | Giá snapshot để giữ lịch sử dù bảng giá thay đổi. |
| `suggested_area_id`, `suggested_slot_id` | Khu/ô hệ thống gợi ý. |
| `override_area_id`, `override_slot_id`, `override_by`, `override_at`, `override_reason` | Audit khi staff chọn vị trí khác gợi ý. |
| `plate_corrected_by`, `plate_corrected_at` | Audit khi staff sửa biển số OCR. |
| `cancellation_reason` | Lý do hủy session nếu có. |

### `parking_session_images`

Metadata ảnh cho một session. File ảnh thật nằm ở storage, database chỉ lưu URL và OCR metadata.

| Field | Ý nghĩa |
| --- | --- |
| `session_id` | Session chứa ảnh. |
| `image_type` | `ENTRY_PLATE`, `ENTRY_VEHICLE`, `EXIT_PLATE`, `EXIT_VEHICLE`. |
| `image_url`, `thumbnail_url` | URL ảnh gốc và thumbnail. |
| `detected_plate_number`, `detected_normalized_plate_number` | Biển số OCR nhận diện được. |
| `confidence` | Độ tin cậy OCR từ 0 đến 100. |
| `is_primary` | Ảnh chính cho từng loại ảnh trong session. |
| `captured_at` | Thời điểm chụp ảnh. |

### `payments`

Giao dịch/phí cần thu. Một session có thể có nhiều payment cycle vì QR online có thể hết hạn.

| Field | Ý nghĩa |
| --- | --- |
| `session_id`, `reservation_id`, `monthly_pass_id` | Nguồn phát sinh payment. Tùy `purpose`, chỉ một nguồn phù hợp được dùng. |
| `amount`, `lost_card_fee`, `total_amount` | Tiền gửi xe, phí mất thẻ, tổng tiền. `total_amount = amount + lost_card_fee`. |
| `purpose` | Lý do thu tiền: parking fee, lost card fee, monthly renewal, reservation fee... |
| `method` | `CASH`, `BANK_TRANSFER`, `NONE`. |
| `status` | `PENDING`, `PAID`, `FAILED`, `CANCELLED`, `WAIVED`, `NOT_REQUIRED`. |
| `provider`, `provider_transaction_id` | Cổng thanh toán và mã giao dịch ngân hàng/provider. |
| `payment_url`, `expired_at`, `gateway_payload` | Thông tin checkout/QR online và raw payload provider. |
| `paid_by_user_id` | App user thực hiện thanh toán online. |
| `received_amount` | Số tiền thực nhận từ ngân hàng/provider để đối soát. |
| `fee_calculated_at` | Thời điểm tính phí. |
| `payment_valid_until` | Sau khi trả online, xe phải ra trước thời điểm này, ví dụ 15 phút. |
| `paid_at`, `collected_by`, `waive_reason` | Audit thanh toán/thu tiền/miễn phí. |

### `payment_attempts`

Mỗi lần tạo QR/VietQR cho một `payments` sẽ có một attempt riêng.

| Field | Ý nghĩa |
| --- | --- |
| `payment_id` | Payment gốc. |
| `provider` | Provider tạo QR, mặc định `VIETQR`. |
| `attempt_no` | Số thứ tự lần tạo QR trong cùng payment. |
| `amount`, `received_amount` | Số tiền yêu cầu và số tiền thực nhận. |
| `payment_url`, `qr_payload` | Link/payload QR trả cho app. |
| `provider_transaction_id` | Mã giao dịch provider nếu có. |
| `status` | `PENDING`, `PAID`, `EXPIRED`, `FAILED`, `CANCELLED`. |
| `requested_at`, `expired_at`, `paid_at` | Thời gian tạo QR, hết hạn, thanh toán. |
| `gateway_payload` | Raw provider data để debug/đối soát. |

### `reservation_extensions`

Lịch sử gia hạn reservation.

| Field | Ý nghĩa |
| --- | --- |
| `reservation_id` | Reservation được gia hạn. |
| `old_expires_at`, `new_expires_at` | Hạn cũ và hạn mới. |
| `added_minutes` | Số phút gia hạn thêm. |
| `pricing_rule_id`, `snapshot_reservation_hourly_price` | Giá dùng để tính tiền gia hạn. |
| `amount` | Số tiền gia hạn. |
| `payment_id` | Payment phát sinh cho gia hạn nếu có. |
| `requested_by` | User yêu cầu gia hạn. |

### `receipts`

Biên lai in/xuất cho khách. Nhiều field là snapshot để biên lai không đổi khi dữ liệu gốc thay đổi.

| Field | Ý nghĩa |
| --- | --- |
| `receipt_code` | Mã biên lai. |
| `session_id`, `payment_id` | Nguồn tạo biên lai. |
| `card_code`, `plate_number`, `vehicle_type_name`, `entry_time`, `exit_time` | Snapshot thông tin hiển thị trên biên lai. |
| `amount`, `lost_card_fee`, `total_amount` | Số tiền trên biên lai. |
| `payment_method` | Cách thanh toán được ghi nhận. |
| `printed_count` | Số lần in lại. |
| `created_by` | User/staff tạo biên lai. |

### `lost_card_cases`

Case xử lý mất thẻ trong lúc session chưa kết thúc.

| Field | Ý nghĩa |
| --- | --- |
| `session_id` | Session bị báo mất thẻ. |
| `card_id` | Thẻ bị mất nếu còn xác định được. |
| `reporter_name`, `phone` | Người báo mất thẻ. |
| `verification_note` | Ghi chú xác minh của staff. |
| `reason` | Lý do/mô tả sự việc. |
| `lost_card_fee` | Phí mất thẻ áp dụng. |
| `status` | `PENDING`, `APPROVED`, `REJECTED`. |
| `created_by`, `approved_by`, `approved_at`, `rejection_reason` | Audit xử lý case. |

### `lost_card_refunds`

Hoàn phí mất thẻ nếu sau đó tìm lại thẻ hoặc đủ điều kiện hoàn.

| Field | Ý nghĩa |
| --- | --- |
| `lost_card_case_id`, `session_id` | Case mất thẻ và session liên quan. |
| `recovered_card_id`, `replacement_card_id` | Thẻ tìm lại hoặc thẻ thay thế. |
| `refund_percent`, `refund_amount` | Tỷ lệ và số tiền hoàn. |
| `reason` | Lý do hoàn phí. |
| `status` | `PENDING`, `APPROVED`, `REJECTED`, `PAID`, `CANCELLED`. |
| `requested_at`, `approved_by`, `approved_at`, `rejected_reason`, `paid_at` | Audit quy trình hoàn. |
| `payment_id` | Payment dùng để chi/ghi nhận hoàn phí nếu có. |

### `plate_mismatch_cases`

Case khi biển số lúc ra không khớp biển số lúc vào/OCR.

| Field | Ý nghĩa |
| --- | --- |
| `session_id` | Session bị lệch biển số. |
| `entry_plate_number`, `exit_plate_number` | Biển số lúc vào và lúc ra. |
| `reason` | Lý do staff ghi nhận. |
| `status` | `PENDING`, `CONFIRMED`, `REJECTED`. |
| `created_by`, `confirmed_by`, `confirmed_at`, `rejection_reason` | Audit xử lý lệch biển số. |

### `audit_logs`

Log append-only cho các hành động nghiệp vụ quan trọng.

| Field | Ý nghĩa |
| --- | --- |
| `actor_user_id` | User thực hiện hành động nếu có. |
| `source_service` | Service ghi log: `CORE_API` hoặc `SUPPORT_API`. |
| `action` | Tên hành động nghiệp vụ. |
| `target_type`, `target_id` | Đối tượng bị tác động. |
| `old_value`, `new_value` | JSON snapshot trước/sau. |
| `reason` | Lý do thay đổi nếu cần. |

## Flow Và Ý Nghĩa Quan Hệ

Phần này nên đọc cùng ERD. Mỗi flow chỉ ra bảng nào phối hợp với bảng nào, vì sao có FK đó, và dữ liệu nào là dữ liệu gốc hay snapshot.

### 1. Staff Check-In Xe Vãng Lai

Mục tiêu: tạo một lượt gửi xe thực tế khi xe vào bãi, chưa cần biết app user là ai.

| Bước | Bảng liên quan | Ý nghĩa quan hệ |
| --- | --- | --- |
| Chọn thẻ | `parking_cards` -> `parking_sessions.card_id` | Mỗi session phải có một thẻ. Partial unique đảm bảo một thẻ không có hai active session. |
| Nhận diện xe | `vehicle_types` -> `parking_sessions.vehicle_type_id` | Loại xe quyết định khu được phép, có cần slot không, và bảng giá nào áp dụng. |
| Lưu biển số | `parking_sessions.plate_number`, `normalized_plate_number` | Đây là snapshot của lượt gửi; xe vãng lai không cần `vehicles.id`. |
| Chọn vị trí | `floors`, `areas`, `slots` -> `parking_sessions.floor_id/area_id/slot_id` | Session biết xe đang ở tầng/khu/ô nào. `slot_id` chỉ bắt buộc với loại xe `requires_slot = true`. |
| Ghi nhận cổng/nhân viên | `gates`, `users` -> `entry_gate_id`, `entry_staff_id` | Audit xe vào từ cổng nào và staff nào xử lý. |
| Snapshot giá | `pricing_rules` -> `parking_sessions.pricing_rule_id` và snapshot price fields | Session giữ giá tại thời điểm vào để sau này đổi bảng giá không làm lệch lịch sử. |

Kết quả chính:

- `parking_sessions.status = ACTIVE`.
- `parking_cards.status = IN_USE` và `parking_cards.current_session_id` trỏ về session active.
- `parking_sessions.driver_id`, `vehicle_id`, `claimed_by_user_id` có thể vẫn null.

### 2. App User Quét QR Trên Thẻ Để Claim Session

Mục tiêu: gắn lượt gửi xe đang active với đúng tài khoản app, để user xem vị trí xe, phí và thanh toán.

| Bước | Bảng liên quan | Ý nghĩa quan hệ |
| --- | --- | --- |
| Quét QR | `parking_cards.qr_token` | QR trên thẻ không đại diện cho xe; nó là cửa vào để tìm thẻ. |
| Tìm session active | `parking_cards.current_session_id` -> `parking_sessions.id` | Thẻ đang dùng sẽ trỏ tới đúng session hiện tại. Nếu thẻ đã checkout/release thì không còn session để claim. |
| Xác định user | `users` -> `driver_profiles.user_id` | User app phải có driver profile tương ứng. |
| Claim session | `driver_profiles.id` -> `parking_sessions.driver_id`; `users.id` -> `parking_sessions.claimed_by_user_id` | Session được gắn với profile tài xế và account đã claim. |
| Khóa claim | trigger trên `parking_sessions` | Khi đã claim, không được đổi `claimed_by_user_id`, `driver_id`, `claimed_at`, `claim_method` sang người khác. |

Kết quả chính:

- `parking_sessions.claim_method = CARD_QR`.
- User đã claim có thể query session theo `claimed_by_user_id` hoặc `driver_id`.
- Người khác nhặt được thẻ không claim được vì session đã có claim audit.
- Sau checkout, thẻ được release và lượt sau có thể claim lại cho session mới.

### 3. Cư Dân Dùng Xe Đã Đăng Ký Hoặc Vé Tháng

Mục tiêu: xử lý xe đã được quản lý trước trong hệ thống, thường dùng cho cư dân hoặc vé tháng.

| Bước | Bảng liên quan | Ý nghĩa quan hệ |
| --- | --- | --- |
| Hồ sơ cư dân | `users` - `driver_profiles` | Account driver có một hồ sơ; cư dân có `driver_type = RESIDENT`. |
| Xe đăng ký | `driver_profiles` -> `vehicles.driver_id` | Chỉ resident profile được sở hữu xe registered/managed. Visitor không tạo `vehicles`. |
| Vé tháng | `driver_profiles`/`parking_cards`/`vehicle_types` -> `monthly_passes` | Vé tháng gắn với chủ vé, thẻ, biển số snapshot, loại xe và thời hạn. |
| Check-in | `vehicles`/`monthly_passes` -> `parking_sessions.vehicle_id/monthly_pass_id` | Session link về xe/vé tháng nếu match được. |
| Không cần claim nếu đã xác định | `parking_sessions.driver_id` | Với xe/vé tháng đã xác định chủ, backend có thể gán driver ngay khi check-in. |

Điểm cần hiểu:

- `monthly_passes` vẫn lưu `owner_name`, `phone`, `plate_number` dạng snapshot để giữ lịch sử vé.
- `vehicles` là master data của xe registered; `parking_sessions` là lịch sử từng lượt vào/ra.
- Cư dân đi xe chưa đăng ký vé tháng thì quay về flow vãng lai: session lưu biển số snapshot và claim qua QR.

### 4. Đặt Chỗ Từ App Và Check-In Reservation

Mục tiêu: giữ trước một khu/ô đỗ và chuyển reservation thành session khi xe vào bãi.

| Bước | Bảng liên quan | Ý nghĩa quan hệ |
| --- | --- | --- |
| Tạo đặt chỗ | `driver_profiles` -> `reservations.driver_id` | Reservation thuộc về người đặt nếu họ có profile. |
| Lưu xe đặt chỗ | `reservations.vehicle_id` hoặc plate snapshot | Nếu xe registered thì có `vehicle_id`; nếu xe vãng lai thì chỉ dùng biển số snapshot. |
| Giữ vị trí | `floors`, `areas`, `slots` -> `reservations.floor_id/area_id/slot_id` | Reservation giữ khu/ô trước khi xe vào. Partial unique ngăn hai pending reservation giữ cùng slot. |
| Tính tiền đặt | `pricing_rules` -> `reservations.pricing_rule_id` và `snapshot_reservation_hourly_price` | Giá đặt chỗ được snapshot tại thời điểm booking. |
| Staff check-in | `users` -> `reservations.checked_in_by` | Audit staff xác nhận reservation tại cổng. |
| Tạo session | `reservations.id` -> `parking_sessions.reservation_id` | Một reservation chỉ sinh tối đa một session nhờ unique partial index. |

Kết quả chính:

- `reservations.status` chuyển từ `PENDING` sang `COMPLETED` khi xe check-in thành công.
- `parking_sessions.billable_start_time` có thể lấy từ `reservation.expires_at` nếu xe vào sớm và chỉ tính phí sau thời gian giữ chỗ.
- Payment đặt chỗ dùng `payments.reservation_id`, không dùng `payments.session_id`.

### 5. Gia Hạn Đặt Chỗ

Mục tiêu: lưu lịch sử mỗi lần user gia hạn reservation và payment phát sinh nếu có.

| Bước | Bảng liên quan | Ý nghĩa quan hệ |
| --- | --- | --- |
| Gia hạn | `reservations` -> `reservation_extensions.reservation_id` | Một reservation có thể có nhiều lần gia hạn. |
| Lưu hạn cũ/mới | `old_expires_at`, `new_expires_at`, `added_minutes` | Không ghi đè mất lịch sử; mỗi lần gia hạn có record riêng. |
| Tính phí | `pricing_rules` -> `reservation_extensions.pricing_rule_id` | Lưu rule và snapshot giá tại thời điểm gia hạn. |
| Thanh toán | `payments` -> `reservation_extensions.payment_id` | Nếu gia hạn có phí, payment link về extension/reservation. |
| Người yêu cầu | `users` -> `reservation_extensions.requested_by` | Audit user/staff yêu cầu gia hạn. |

### 6. Tính Phí Và Thanh Toán Online/Cash

Mục tiêu: tách số tiền phải thu (`payments`) khỏi từng lần tạo QR (`payment_attempts`) và khỏi biên lai (`receipts`).

| Bước | Bảng liên quan | Ý nghĩa quan hệ |
| --- | --- | --- |
| Tạo khoản thu | `parking_sessions`/`reservations`/`monthly_passes` -> `payments` | Payment có thể phát sinh từ session, reservation hoặc vé tháng tùy `purpose`. |
| Tính phí | `payments.amount`, `lost_card_fee`, `total_amount`, `fee_calculated_at` | Lưu kết quả tính phí tại một thời điểm cụ thể. |
| Thanh toán online | `payments` -> `payment_attempts.payment_id` | Một payment có thể có nhiều QR attempts vì QR hết hạn hoặc tạo lại. |
| Đối soát | `provider_transaction_id`, `received_amount`, `gateway_payload` | Dữ liệu ngân hàng/provider để reconcile. |
| Hiệu lực sau thanh toán | `payment_valid_until` | Sau khi trả online, xe phải ra trước thời hạn này; quá hạn có thể tính lại phí/tạo payment cycle mới. |
| In biên lai | `payments`/`parking_sessions` -> `receipts` | Receipt snapshot dữ liệu hiển thị, không phụ thuộc dữ liệu gốc sau này đổi. |

Điểm cần hiểu:

- `payments` không unique tuyệt đối theo `session_id` vì online payment có thể hết hạn sau khi đã trả nhưng xe chưa ra kịp.
- `payment_attempts` là log từng lần tạo QR, không phải mỗi attempt là một khoản thu mới.
- `receipts` là chứng từ/snapshot cuối, không phải bảng tính phí chính.

### 7. Check-Out Xe

Mục tiêu: kết thúc session, giải phóng thẻ/slot/khu và ghi nhận thanh toán/biên lai.

| Bước | Bảng liên quan | Ý nghĩa quan hệ |
| --- | --- | --- |
| Xác định session | `parking_cards.current_session_id` hoặc `parking_sessions.session_code` | Staff tìm session active đang cần checkout. |
| Xác nhận xe ra | `parking_session_images` và `plate_mismatch_cases` | Ảnh exit/OCR dùng để so biển số; lệch biển số tạo mismatch case. |
| Kiểm tra thanh toán | `payments` -> `parking_sessions.payment_status` | Session chỉ hoàn tất khi payment đạt trạng thái hợp lệ hoặc được waive/not required. |
| Ghi checkout | `parking_sessions.exit_gate_id`, `exit_staff_id`, `exit_time`, `status` | Audit xe ra khỏi bãi. |
| Release tài nguyên | `parking_cards.current_session_id`, `slots.current_session_id`, occupancy counters | Thẻ/slot/khu được trả lại cho lượt sau. |
| Tạo biên lai | `receipts.session_id/payment_id` | Lưu chứng từ cuối cùng cho lượt gửi. |

Kết quả chính:

- `parking_sessions.status = COMPLETED`.
- `parking_cards.status = AVAILABLE`, `current_session_id = NULL`.
- `slots.status = AVAILABLE`, `current_session_id = NULL` nếu session có slot.

### 8. Mất Thẻ Và Hoàn Phí Mất Thẻ

Mục tiêu: xử lý khi khách mất thẻ, thu phí mất thẻ, và có thể hoàn một phần nếu sau đó tìm lại thẻ.

| Bước | Bảng liên quan | Ý nghĩa quan hệ |
| --- | --- | --- |
| Báo mất thẻ | `parking_sessions` -> `lost_card_cases.session_id` | Case luôn bám vào session cụ thể. |
| Ghi thẻ mất | `parking_cards` -> `lost_card_cases.card_id` | Nếu xác định được thẻ, case link tới card. |
| Duyệt case | `users` -> `created_by/approved_by` | Audit staff tạo và duyệt/từ chối. |
| Thu phí | `payments.session_id`, `purpose = LOST_CARD_FEE` | Phí mất thẻ là payment gắn với session. |
| Hoàn phí | `lost_card_cases` -> `lost_card_refunds.lost_card_case_id` | Mỗi case có tối đa một refund record. |
| Ghi thẻ tìm lại/thay thế | `recovered_card_id`, `replacement_card_id` | Theo dõi thẻ cũ được tìm lại hoặc thẻ mới cấp thay. |

### 9. Lệch Biển Số Khi Ra

Mục tiêu: chặn checkout bình thường nếu biển số lúc ra khác biển số lúc vào, cần staff xác minh.

| Bước | Bảng liên quan | Ý nghĩa quan hệ |
| --- | --- | --- |
| OCR ảnh ra | `parking_session_images` | Lưu ảnh biển số/xe lúc ra và biển số OCR. |
| Tạo case lệch | `parking_sessions` -> `plate_mismatch_cases.session_id` | Case gắn với session đang có nghi vấn. |
| Xử lý case | `users` -> `created_by/confirmed_by` | Staff tạo case và người có quyền xác nhận/từ chối. |
| Cập nhật session | `parking_sessions.status = MISMATCH_PENDING` | Session tạm dừng checkout cho tới khi case được xử lý. |

### 10. Audit Và Truy Vết

Mục tiêu: lưu dấu các thao tác quan trọng không nên mất lịch sử.

| Bảng | Cách dùng |
| --- | --- |
| `audit_logs` | Log append-only cho thao tác nghiệp vụ quan trọng, có `old_value/new_value` JSON. |
| `parking_sessions.override_*` | Audit staff override khu/slot hệ thống gợi ý. |
| `parking_sessions.plate_corrected_*` | Audit staff sửa biển số OCR. |
| `reservations.checked_in_by/cancelled_by` | Audit staff check-in hoặc hủy đặt chỗ. |
| `payments.collected_by/paid_by_user_id` | Phân biệt staff thu tiền cash và app user thanh toán online. |

## Cách Đọc Quan Hệ Trên ERD

| Quan hệ | Cách hiểu nhanh |
| --- | --- |
| `users` - `driver_profiles` | Account app có tối đa một hồ sơ driver. Staff/admin cũng nằm trong `users` nhưng không nhất thiết có driver profile. |
| `driver_profiles` - `vehicles` | Một resident có thể có nhiều xe registered. Visitor không tạo xe ở bảng này. |
| `vehicle_types` - `areas/slots/pricing_rules` | Loại xe là trục chung để quyết định khu được phép, slot hợp lệ và giá áp dụng. |
| `parking_cards` - `parking_sessions` | `card_id` là lịch sử thẻ dùng trong session; `current_session_id` là con trỏ nhanh tới session active hiện tại. |
| `parking_sessions` - `vehicles` | Nullable vì nhiều session là xe vãng lai không có vehicle master. |
| `parking_sessions` - `driver_profiles/users` | `driver_id` là người gửi xe; `claimed_by_user_id` là account đã claim session qua app. |
| `reservations` - `parking_sessions` | Reservation là ý định giữ chỗ; session là lượt xe thực tế sau check-in. |
| `payments` - `payment_attempts` | Payment là khoản phải thu; attempt là từng lần tạo QR/checkout online. |
| `payments` - `receipts` | Payment là trạng thái tiền; receipt là chứng từ snapshot để in/xuất. |
| `lost_card_cases`/`plate_mismatch_cases` - `parking_sessions` | Case sự cố luôn bám vào một session cụ thể để không mất ngữ cảnh xe/thẻ/thời gian. |

## Rule Không Nên Bỏ Qua Khi Đọc ERD

- Visitor không tạo record trong `vehicles`.
- `vehicles.driver_id`, nếu có, phải là hồ sơ `RESIDENT`.
- Một thẻ đang `IN_USE` phải có `current_session_id`.
- Một active card chỉ có một active session nhờ partial unique index trên `parking_sessions.card_id`.
- Một session đã claim không được claim lại hoặc đổi sang user khác.
- Khi session được claim, `driver_id` phải thuộc đúng `claimed_by_user_id`.
- `parking_sessions.normalized_plate_number` là snapshot của lượt gửi, không bắt buộc phải có `vehicles.id`.
- `payments` không unique tuyệt đối theo session vì thanh toán online có thể hết hạn sau 15 phút và tạo payment cycle mới.
- `payment_attempts` lưu từng lần tạo QR/VietQR cho một payment.
- Một số rule nằm trong trigger/constraint của `03_indexes_constraints.sql`, DBML chỉ ghi lại bằng `Note` vì không biểu diễn được hết PostgreSQL trigger/partial index.

## File Và Thứ Tự Chạy

```text
database/
|-- 01_schema.sql                 # Core tables and base constraints
|-- 02_seed.sql                   # Demo users and master data
|-- 03_indexes_constraints.sql    # Indexes, partial unique indexes, late FKs, triggers
|-- erd.dbml                      # DBML ERD source
|-- erd.mmd                       # Mermaid ERD source
`-- manual-scripts/               # Optional local/debug helper SQL
```

Run order trên database sạch:

1. Run `database/01_schema.sql`.
2. Run `database/02_seed.sql`.
3. Run `database/03_indexes_constraints.sql`.
4. Start backend/frontend services.

## Quy Tắc Thay Đổi Schema

- Schema chính nằm trong `01_schema.sql` và `03_indexes_constraints.sql`.
- Seed/demo data nằm trong `02_seed.sql`.
- Khi đổi schema, cập nhật luôn `erd.dbml` và `erd.mmd` để ERD không lệch thực tế.
- Backend `.NET` và Spring entities phải map theo schema này, không tự tạo schema bằng migration/DDL auto.
