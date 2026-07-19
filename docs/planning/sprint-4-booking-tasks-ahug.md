# 📋 Kế Hoạch & Danh Sách Task Booking (Sprint 4) - Ahug05 (Dev 1)

Tài liệu này chi tiết hóa toàn bộ các task thuộc phân hệ **Booking / Reservation** (thay thế cho phân hệ Exit Flow của Sprint 4 cũ) do lập trình viên **Ahug05 (Dev 1)** đảm nhiệm trên backend .NET Core API.

---

## ⚡ 1. TỔNG QUAN PHÂN HỆ BOOKING/RESERVATION
* **Mục tiêu:** Cung cấp tính năng tìm kiếm slot trống cho phép đặt chỗ trước, tạo lượt đặt chỗ mới cho xe ô tô, xử lý thanh toán/miễn trừ phí đặt chỗ, gia hạn, hủy/hết hạn đặt chỗ tự động và tích hợp luồng vào cổng (check-in) cho xe đã đặt chỗ.
* **Quy định nghiệp vụ (Business Rules - trích spec):**
  * Chỉ cho phép đặt chỗ trước đối với loại xe **Ô tô** (`requires_slot = true`) tại khu vực được chỉ định (Ví dụ: **Tầng B2** hoặc các khu vực cấu hình `management_type = 'AREA_AND_SLOT'`).
  * Slot được chọn để đặt chỗ bắt buộc phải có trạng thái ban đầu là `AVAILABLE`.
  * Sau khi đặt chỗ được xác nhận (`CONFIRMED`), slot đỗ xe liên quan phải tự động chuyển sang trạng thái `RESERVED`.
  * Thời gian giữ chỗ (hold time) mặc định là **15 phút** kể từ thời điểm đặt chỗ (`reserved_at`). Quá thời gian này mà không gia hạn hoặc không check-in, hệ thống hoặc worker tự động đánh dấu đặt chỗ là `EXPIRED` và giải phóng slot về trạng thái `AVAILABLE`.
  * Mỗi lượt đặt chỗ thành công phải ghi nhận audit log `RESERVATION_CREATED`.
  * Khi xe ô tô đi vào cổng, nếu nhận diện biển số trùng khớp với biển số của một booking đang có hiệu lực (`status = 'CONFIRMED'`), nhân viên cho phép vào cổng dưới dạng check-in đặt chỗ: cập nhật trạng thái đặt chỗ thành `COMPLETED`/`CHECKED_IN`, cập nhật slot đỗ xe từ `RESERVED` thành `OCCUPIED`.

---

## 📂 2. CẤU TRÚC DATABASE LIÊN QUAN (SỰ KHÁC BIỆT THỰC TẾ)

Theo [01_schema.sql](file:///d:/Ki5/SWP391/Project2/SWP391/database/01_schema.sql) và [03_indexes_constraints.sql](file:///d:/Ki5/SWP391/Project2/SWP391/database/03_indexes_constraints.sql):
* Bảng **`reservations`** lưu trữ lượt đặt chỗ của tài xế (`driver_id` liên kết `driver_profiles`), chứa các thông tin: `reservation_code`, `vehicle_id` (nullable), `plate_number`, `normalized_plate_number`, `vehicle_type_id`, `floor_id`, `area_id`, `slot_id`, `pricing_rule_id`, `snapshot_reservation_hourly_price`, `reserved_duration_minutes`, `booking_amount`, `payment_status` (`PENDING`, `PAID`, `FAILED`, `CANCELLED`, `WAIVED`, `NOT_REQUIRED`), `status` (`PENDING`, `COMPLETED`, `CANCELLED`, `EXPIRED`), `checked_in_at`, `checked_in_by`, v.v.
* Ràng buộc Unique Indexes bảo vệ slot và xe:
  * `ux_pending_reservation_by_slot`: Tại một thời điểm, một slot chỉ có tối đa 1 lượt đặt chỗ ở trạng thái `PENDING`.
  * `ux_pending_reservation_by_vehicle`: Một xe đã đăng ký chỉ được có tối đa 1 booking ở trạng thái `PENDING`.
  * `ux_pending_reservation_by_plate_type`: Một biển số xe chỉ có tối đa 1 booking `PENDING` cho cùng một loại xe.

---

## 🛠️ 3. CHI TIẾT CÁC TÁC VỤ PHÁT TRIỂN (ISSUES BREAKDOWN)

### 📌 Task 1: Map Domain Models & Entity Configurations (.NET EF Core)
* **Mô tả:** Tạo hoặc cập nhật C# Models và cấu hình Fluent API mapping cho bảng `reservations` và `reservation_extensions` trong dự án .NET.
* **Các file cần thay đổi:**
  * **[NEW]** `Domain/Entities/Reservation.cs`
  * **[NEW]** `Domain/Entities/ReservationExtension.cs`
  * **[NEW]** `Infrastructure/Persistence/Configurations/ReservationConfiguration.cs`
  * **[NEW]** `Infrastructure/Persistence/Configurations/ReservationExtensionConfiguration.cs`
  * **[MODIFY]** [ParkingDbContext.cs](file:///d:/Ki5/SWP391/Project2/SWP391/backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/ParkingDbContext.cs): Đăng ký `DbSet<Reservation>` và `DbSet<ReservationExtension>`.
* **Tiêu chuẩn nghiệm thu:**
  * Map chính xác tất cả các trường dữ liệu kiểu snake_case từ database sang CamelCase trong C#.
  * Cấu hình đúng các khóa ngoại (Foreign Keys) liên kết đến `DriverProfile`, `Vehicle`, `Slot`, `Floor`, `Area`, `PricingRule` và `User`.

---

### 📌 Task 2: F078 — Search & Suggest Reservation Slot (Tìm kiếm Slot trống cho phép đặt trước)
* **Mô tả:** Xây dựng API giúp tài xế tìm kiếm các slot đỗ xe trống khả dụng cho phép đặt trước trên các tầng đỗ xe quy định (ví dụ Tầng B2 quản lý theo ô và khu vực).
* **Endpoints:** `GET /api/core/reservations/available-slots`
* **Nghiệp vụ xử lý:**
  * Lọc danh sách slots theo `allowed_vehicle_type_id = 5` (Ô tô) hoặc các loại xe yêu cầu slot.
  * Chỉ hiển thị các slots thuộc Tầng đỗ xe cho phép đặt chỗ trước (Ví dụ: kiểm tra `floors.management_type = 'AREA_AND_SLOT'` hoặc lọc cứng tầng có cấu hình đặt trước).
  * Trạng thái slot phải là `AVAILABLE` (không có xe đỗ, không bị khóa hay bảo trì, và không có booking `PENDING` đang giữ chỗ).
* **Tiêu chuẩn nghiệm thu:**
  * Trả về danh sách slot đỗ xe trống kèm theo thông tin Tầng, Khu vực và phí đặt chỗ dự kiến từ Pricing Rule hiện hành.

---

### 📌 Task 3: F079 — Create Reservation & F080 — Pay/Waive Reservation Fee (Tạo đặt chỗ & Thanh toán giữ ô)
* **Mô tả:** Xây dựng API tiếp nhận yêu cầu đặt chỗ từ Tài xế (hoặc Staff đặt hộ) và xử lý thanh toán/miễn trừ phí đặt chỗ.
* **Endpoints:** `POST /api/core/reservations`
* **Nghiệp vụ xử lý (Phải chạy trong một Database Transaction):**
  * **Validation**:
    * Kiểm tra tài xế (`driver_id`) và phương tiện (`vehicle_id` hoặc biển số vãng lai).
    * Kiểm tra trùng lặp: Biển số hoặc xe đó không được có lượt đặt chỗ nào khác đang ở trạng thái `PENDING`.
    * Kiểm tra Slot đỗ xe: Slot được chọn bắt buộc phải thuộc tầng đỗ cho phép đặt chỗ trước và có trạng thái `AVAILABLE`.
  * **Pricing Snapshot**: Lấy giá đặt chỗ theo giờ (`reservation_hourly_price`) từ Pricing Rule đang có hiệu lực cho xe ô tô và lưu flat vào `snapshot_reservation_hourly_price` trong `reservations`.
  * **Tính toán số tiền (`booking_amount`)**: `snapshot_reservation_hourly_price` * (số giờ đặt chỗ dự kiến).
  * **Tạo đơn đặt chỗ (`reservations` record)**:
    * Sinh mã đặt chỗ duy nhất `reservation_code` (định dạng `RES-YYYYMMDD-NNNN`).
    * Thiết lập `reserved_at = DateTime.UtcNow` và `expires_at = reserved_at.AddMinutes(reserved_duration_minutes)`.
    * Nếu cần thanh toán trực tuyến: Thiết lập `payment_status = 'PENDING'`, `status = 'PENDING'`. Khi thanh toán thành công (hoặc miễn phí `payment_status = 'NOT_REQUIRED'`), cập nhật `status = 'CONFIRMED'`.
  * **Cập nhật trạng thái Slot**: Chuyển trạng thái slot đỗ xe sang `RESERVED` để ngăn các lượt đặt chỗ khác hoặc ngăn xe vãng lai đi vào chiếm chỗ.
  * **Ghi Audit Log**: Lưu log hành động `RESERVATION_CREATED`.
* **Tiêu chuẩn nghiệm thu:**
  * Trả về `201 Created` kèm theo thông tin chi tiết đặt chỗ và mã QR đặt chỗ.
  * Kiểm tra trong DB: Slot tương ứng phải chuyển sang trạng thái `RESERVED`.

---

### 📌 Task 4: F081 — Extend Reservation (Gia hạn thời gian đặt chỗ trước)
* **Mô tả:** Cho phép tài xế hoặc nhân viên thực hiện gia hạn thời gian giữ chỗ nếu họ đến trễ hơn dự kiến.
* **Endpoints:** `POST /api/core/reservations/{id}/extend`
* **Nghiệp vụ xử lý (Chạy trong Transaction):**
  * Kiểm tra lượt đặt chỗ tồn tại và đang ở trạng thái `PENDING` hoặc `CONFIRMED` (chưa check-in, chưa hủy hay hết hạn).
  * Tạo bản ghi mới trong bảng `reservation_extensions` lưu lịch sử gia hạn.
  * Tính phí gia hạn dựa trên snapshot giá gốc và thời gian gia hạn thêm.
  * Cập nhật thời gian hết hạn mới trong `reservations.expires_at`.
  * Tăng số lần gia hạn `extension_count = extension_count + 1`.
* **Tiêu chuẩn nghiệm thu:**
  * Thời gian hết hạn của booking được gia hạn thành công.

---

### 📌 Task 5: F082 — Cancel / Expire Reservation (Hủy hoặc Tự động Hết hạn đặt chỗ)
* **Mô tả:** Xử lý khi tài xế chủ động hủy đặt chỗ, hoặc hệ thống tự động quét hết hạn khi quá giờ giữ chỗ mà tài xế không tới.
* **Endpoints:**
  * Hủy đặt chỗ: `POST /api/core/reservations/{id}/cancel`
  * Quét hết hạn: Một service ngầm (Background Worker) quét định kỳ các lượt đặt chỗ quá giờ.
* **Nghiệp vụ xử lý (Chạy trong Transaction):**
  * Cập nhật trạng thái đặt chỗ sang `CANCELLED` hoặc `EXPIRED`.
  * Giải phóng slot đỗ xe: Cập nhật trạng thái slot liên quan từ `RESERVED` về lại `AVAILABLE`.
  * Ghi log audit tương ứng (`RESERVATION_CANCELLED` hoặc `RESERVATION_EXPIRED`).
* **Tiêu chuẩn nghiệm thu:**
  * Khi hủy/hết hạn thành công, slot được trả về trạng thái `AVAILABLE` ngay lập tức để người khác có thể sử dụng.

---

### 📌 Task 6: F083 — Process Reservation Check-in (Vào cổng bằng xe đã đặt chỗ)
* **Mô tả:** Tích hợp nghiệp vụ đặt chỗ vào luồng xử lý xe vào cổng (Entry Flow). Khi phát hiện xe vào cổng có đặt chỗ trước, tiến hành check-in thay vì tạo phiên vãng lai mới.
* **Endpoints (Tích hợp trong POST /api/core/parking-sessions/entry):**
  * Khi gọi API Entry, hệ thống kiểm tra biển số xe vào cổng xem có lượt đặt chỗ nào đang ở trạng thái `CONFIRMED` hay không.
  * Nếu có đặt chỗ hợp lệ:
    * Chuyển trạng thái đặt chỗ sang `COMPLETED` (hoặc `CHECKED_IN`), cập nhật `checked_in_at = DateTime.UtcNow` và ghi nhận nhân viên xác nhận (`checked_in_by`).
    * Tạo `parking_sessions` mới nhưng **liên kết với `reservation_id`** của đặt chỗ đó.
    * Đặt `customer_type = 'VISITOR'` hoặc `'RESERVATION'` tùy quy định, đặt trạng thái thanh toán đặt chỗ đã hoàn tất.
    * Cập nhật slot đỗ xe từ `RESERVED` sang `OCCUPIED`.
* **Tiêu chuẩn nghiệm thu:**
  * Xe đi vào slot đã đặt chỗ thành công. Trạng thái đặt chỗ chuyển sang `COMPLETED`, slot chuyển sang `OCCUPIED`.

---

## 🧪 4. KẾ HOẠCH VERIFICATION (KIỂM THỬ)

### Kiểm thử Tự động (Automated Tests)
* Chạy `dotnet build` đảm bảo không có lỗi biên dịch.
* Viết unit tests kiểm thử logic tính tiền đặt chỗ và logic quét tự động hết hạn lượt đặt chỗ.

### Kiểm thử Thủ công (Manual Tests)
1. **Tạo đặt chỗ thành công:** Gửi request tạo đặt chỗ cho xe ô tô, kiểm tra DB xem slot tương ứng đã đổi sang `RESERVED` chưa.
2. **Hủy đặt chỗ:** Thực hiện hủy lượt đặt chỗ vừa tạo, kiểm tra slot tương ứng phải quay lại trạng thái `AVAILABLE`.
3. **Xe vào cổng check-in:** Gửi request xe vào cổng với biển số xe đã đặt chỗ trước. Xác nhận phiên gửi xe được tạo có liên kết đúng `reservation_id`, slot chuyển từ `RESERVED` sang `OCCUPIED`.
