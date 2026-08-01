# 🥒 BỘ KỊCH BẢN KIỂM THỬ CHUẨN BDD (BEHAVIOR-DRIVEN DEVELOPMENT)
## HỆ THỐNG QUẢN LÝ BÃI XE THÔNG MINH (PARKING BUILDING SYSTEM)

> **Định dạng:** Gherkin / BDD (Given - When - Then)  
> **Tài liệu:** `Test_Case.md`

---

## 📌 GIAI ĐOẠN 1: KHI CSDL CHƯA CÓ DỮ LIỆU CẤU HÌNH MASTER (EMPTY MASTER DATA PHASE)

### Feature: 01. Đăng ký & Đăng nhập Tài khoản Ban đầu

```gherkin
  Scenario: 1.1 Đăng ký tài khoản Khách vãng lai mới thành công
    Given Người dùng chưa có tài khoản trên hệ thống
    And Người dùng đang ở màn hình Đăng ký tài khoản (/register)
    When Người dùng nhập Tên đăng nhập "visitor_test01"
    And Người dùng nhập Họ và tên "Nguyễn Văn Vãng Lai"
    And Người dùng nhập Email "visitor_test01@example.com"
    And Người dùng nhập Số điện thoại "0988111222"
    And Người dùng nhập Mật khẩu "123456" và Xác nhận mật khẩu "123456"
    And Nhấp nút "Đăng ký"
    Then Hệ thống tạo tài khoản mới thành công với vai trò "DRIVER" và loại "VISITOR"
    And Hiển thị thông báo "Đăng ký tài khoản thành công! Vui lòng đăng nhập."

  Scenario: 1.2 Đăng nhập bằng các tài khoản mặc định (Admin, Manager, Staff)
    Given CSDL đã có sẵn các tài khoản khởi tạo (admin01, manager01, staff01)
    When Người dùng truy cập trang Đăng nhập (/login)
    And Nhập Tên đăng nhập "staff01" và Mật khẩu "123456"
    And Nhấp nút "Đăng nhập"
    Then Hệ thống xác thực thành công và chuyển hướng đến trang Cổng vào Nhân viên (/staff/entry)
```

---

### Feature: 02. Cảnh báo lỗi Rõ ràng khi chưa CRUD Dữ liệu Cấu hình Master

```gherkin
  Scenario: 2.1 Staff vào màn hình Cổng vào khi chưa tạo Cổng (Gates)
    Given CSDL chưa có bất kỳ bản ghi Cổng vào/ra nào trong bảng "gates"
    And Nhân viên "staff01" đã đăng nhập và truy cập trang /staff/entry
    When Nhân viên quét mã thẻ "C001"
    Then Hệ thống hiển thị thông báo lỗi mờ/toast màu đỏ: "GATE_NOT_FOUND: Không tìm thấy thông tin Cổng vào. Vui lòng vào trang Quản lý Cấu trúc để tạo Cổng."
    And Nút "Cho xe vào" bị khóa không cho thao tác.

  Scenario: 2.2 Staff lấy gợi ý vị trí khi chưa tạo Khu vực/Ô đỗ (Areas/Slots)
    Given CSDL đã tạo Cổng vào nhưng chưa tạo Khu vực đỗ (Areas) hoặc Loại phương tiện (VehicleTypes)
    And Nhân viên đang ở trang Cổng vào (/staff/entry)
    When Nhân viên chọn loại xe "Ô tô" và nhấn "Lấy gợi ý vị trí"
    Then Hệ thống trả về lỗi: "NO_AVAILABLE_LOCATION: Chưa có vị trí đỗ trống hoặc chưa cấu hình Khu vực đỗ. Vui lòng kiểm tra lại Cấu trúc bãi xe."

  Scenario: 2.3 Lái xe vãng lai Đặt chỗ (Booking) khi chưa tạo Bảng giá (Pricing Rules)
    Given Lái xe vãng lai "visitor_test01" đã đăng nhập ứng dụng Lái xe
    And CSDL chưa có bản ghi Bảng giá dịch vụ đặt chỗ nào trong "pricing_rules"
    When Lái xe truy cập trang Đặt chỗ (/driver/reservations) và bấm "Đặt chỗ ngay"
    Then Hệ thống hiển thị lỗi: "PRICING_RULE_NOT_FOUND: Chưa cài đặt Bảng giá dịch vụ cho loại xe này. Vui lòng liên hệ Quản lý."

  Scenario: 2.4 Lái xe vãng lai Nộp đơn Vé tháng khi chưa cấu hình Khu vực Vé tháng
    Given Lái xe "visitor_test01" truy cập trang Đăng ký vé tháng (/driver/monthly-pass)
    When Lái xe chọn Tầng "B1" và loại xe "Xe máy" để đăng ký
    Then Hệ thống hiển thị cảnh báo: "MONTHLY_AREA_NOT_AVAILABLE: Hiện tại chưa có Khu vực hỗ trợ đăng ký Vé tháng cho loại xe này."
```

---

## 📌 GIAI ĐOẠN 2: THIẾT LẬP DỮ LIỆU CẤU HÌNH BỞI QUẢN LÝ (MANAGER MASTER DATA SETUP)

### Feature: 03. Manager Khởi tạo Cấu trúc Bãi xe & Bảng giá qua Giao diện Quản lý

```gherkin
  Scenario: 3.1 Manager tạo các Loại phương tiện (Vehicle Types)
    Given Quản lý "manager01" đã đăng nhập và ở trang Quản lý Cấu trúc (/manager/structure)
    When Manager bấm nút "+ Thêm loại xe"
    And Nhập Tên loại xe "Xe máy", Mô tả "Xe máy tiêu chuẩn", Tích chọn "Không phân chia slot" (requiresSlot = false)
    And Bấm "Lưu loại xe"
    And Tiếp tục tạo thêm loại xe "Ô tô" với Tích chọn "Có phân chia slot" (requiresSlot = true)
    Then Hệ thống lưu thành công 2 loại xe vào CSDL.

  Scenario: 3.2 Manager tạo Tầng hầm và Cổng Ra/Vào (Floors & Gates)
    Given Manager đang ở trang Quản lý Cấu trúc (/manager/structure)
    When Manager bấm "Thêm Tầng" -> Mã tầng "B1", Tên tầng "Tầng hầm B1" -> Bấm Lưu
    And Chuyển sang Tab "Quản lý Cổng"
    And Bấm "Thêm Cổng" -> Mã cổng "B1-IN", Loại cổng "ENTRY", Chọn Tầng "B1" -> Bấm Lưu
    And Bấm "Thêm Cổng" -> Mã cổng "B1-OUT", Loại cổng "EXIT", Chọn Tầng "B1" -> Bấm Lưu
    Then CSDL ghi nhận 1 Tầng hoạt động và 2 Cổng (1 Vào, 1 Ra).

  Scenario: 3.3 Manager tạo Khu vực đỗ và Cài đặt Độ ưu tiên (Areas & PriorityOrder)
    Given Manager ở màn hình Quản lý Cấu trúc
    When Manager bấm "Thêm Khu vực"
    And Nhập Mã khu vực "A", Tên khu vực "Khu A - Xe máy", Chọn Tầng "B1", Nhập Độ ưu tiên "Priority Order = 1", Sức chứa "100"
    And Tích chọn loại xe được phép đỗ là "Xe máy" -> Bấm Lưu
    And Tiếp tục tạo "Khu B - Ô tô", Chọn Tầng "B1", Nhập "Priority Order = 2", Sức chứa "20", Tích chọn "Ô tô" -> Bấm Lưu
    Then Hệ thống lưu 2 Khu vực với đầy đủ mối liên kết loại xe và độ ưu tiên.

  Scenario: 3.4 Manager thêm Thẻ gửi xe vật lý (Parking Cards)
    Given Manager ở trang Quản lý Thẻ (/manager/cards)
    When Manager bấm "Thêm Thẻ mới"
    And Nhập Mã thẻ "C001", Mã QR Token "QR-C001-DEMO" -> Bấm Lưu
    And Thao tác tương tự thêm các thẻ "C002", "C003", "C004", "C005"
    Then Danh sách có 5 thẻ gửi xe ở trạng thái "AVAILABLE".

  Scenario: 3.5 Manager Cấu hình Bảng giá Dịch vụ (Pricing Rules)
    Given Manager ở trang Quản lý Bảng giá (/manager/pricing)
    When Manager bấm "Thêm Bảng giá"
    And Chọn Loại xe "Xe máy": Giá ngày "5.000đ", Giá đêm "7.000đ", Phí vé tháng "150.000đ", Phí phạt mất thẻ "50.000đ" -> Bấm Lưu
    And Chọn Loại xe "Ô tô": Giá ngày "20.000đ", Giá đêm "30.000đ", Phí đặt chỗ "10.000đ/giờ", Phí mất thẻ "200.000đ" -> Bấm Lưu
    Then Bảng giá mới chuyển sang trạng thái "ACTIVE" áp dụng toàn bãi.
```

---

## 📌 GIAI ĐOẠN 3: VẬN HÀNH TOÀN BỘ CÁC LUỒNG HỆ THỐNG (FULL OPERATIONS FLOW)

### Feature: 04. Nâng cấp Tài khoản từ Lái xe Vãng lai sang Lái xe Cư dân

```gherkin
  Scenario: 4.1 Lái xe vãng lai gửi Yêu cầu Cập nhật Thông tin Cư dân
    Given Lái xe "visitor_test01" đang đăng nhập ở trang Hồ sơ cá nhân (/driver/profile)
    When Lái xe bấm "Cập nhật Hồ sơ Cư dân"
    And Nhập Số căn hộ "A-1204", Số CCCD "012345678999"
    And Tải lên ảnh mặt trước CCCD
    And Nhấp nút "Gửi yêu cầu xác minh"
    Then Hồ sơ chuyển sang trạng thái "PENDING_VERIFICATION".

  Scenario: 4.2 Manager duyệt Hồ sơ Cư dân
    Given Manager đang ở trang Quản lý Cư dân (/manager/residents)
    When Manager xem danh sách yêu cầu chờ duyệt
    And Bấm "Xem hồ sơ" của lái xe "visitor_test01"
    And Nhấp nút "Duyệt hồ sơ Cư dân"
    Then Loại tài khoản của "visitor_test01" chuyển từ "VISITOR" sang "RESIDENT"
    And Lái xe nhận được thông báo "Hồ sơ Cư dân của bạn đã được phê duyệt!".
```

---

### Feature: 05. Luồng Đăng ký, Phê duyệt & Sử dụng Vé Tháng (Monthly Pass Flow)

```gherkin
  Scenario: 5.1 Cư dân Đăng ký Vé tháng cho Xe máy
    Given Cư dân "visitor_test01" (đã là RESIDENT) truy cập trang Đăng ký Vé tháng (/driver/monthly-pass)
    When Cư dân chọn Phương tiện "Xe máy (51A-99999)"
    And Chọn Tầng "B1", Khu vực "Khu A - Xe máy"
    And Chọn Ngày bắt đầu là Hôm nay
    And Nhấp nút "Nộp đơn đăng ký vé tháng"
    Then Đơn đăng ký vé tháng được khởi tạo với trạng thái "PENDING_APPROVAL".

  Scenario: 5.2 Manager duyệt Vé tháng và Gán thẻ vật lý
    Given Manager ở trang Quản lý Đơn Vé tháng (/manager/monthly-passes)
    When Manager chọn đơn đăng ký của "visitor_test01"
    And Chọn thẻ vật lý "C001" để gán cho vé tháng
    And Nhấp nút "Duyệt & Kích hoạt Vé tháng"
    Then Vé tháng chuyển sang trạng thái "ACTIVE"
    And Thẻ "C001" chuyển sang trạng thái "ASSIGNED_MONTHLY".

  Scenario: 5.3 Staff quét thẻ Vé tháng tại Cổng vào
    Given Xe máy của cư dân tiến vào Cổng vào B1-IN
    And Nhân viên "staff01" ở màn hình /staff/entry (Chế độ Vé tháng)
    When Staff quét thẻ "C001"
    And Tải ảnh biển số xe vào "51A-99999"
    Then Hệ thống đối soát thành công 100% khớp biển số đăng ký
    And Nhấn "Cho xe vào" ➔ Tạo phiên thành công với CustomerType = "MONTHLY".
```

---

### Feature: 06. Luồng Đặt chỗ Trực tuyến (Online Booking / Reservation Flow)

```gherkin
  Scenario: 6.1 Lái xe Đặt chỗ đỗ Ô tô trước qua Web App
    Given Lái xe "visitor_test01" đăng nhập ứng dụng Lái xe
    When Lái xe vào trang Đặt chỗ (/driver/reservations)
    And Chọn Loại xe "Ô tô", Tầng "B1", Khu "Khu B - Ô tô"
    And Chọn Thời gian đỗ "2 giờ" (Phí cọc: 20.000đ)
    And Bấm "Xác nhận đặt chỗ & Thanh toán"
    And Quét mã QR PayOS để thanh toán 20.000đ
    Then Webhook PayOS báo thành công
    And Ô đỗ B-C01 chuyển sang trạng thái "RESERVED"
    And Lái xe nhận được mã QR Đặt chỗ "RSV-CAR-001".

  Scenario: 6.2 Staff check-in cho xe Đặt chỗ tại Cổng vào
    Given Xe ô tô đặt trước tiến vào Cổng vào B1-IN
    When Staff chọn Chế độ "Đặt chỗ (Booking)"
    And Quét mã QR Đặt chỗ "RSV-CAR-001"
    And Tải ảnh xe vào ➔ Nhấn "Cho xe vào"
    Then Hệ thống ghi nhận phiên xe vào đúng ô đỗ B-C01 đã giữ trước.
```

---

### Feature: 07. Luồng Xe Vãng lai & Staff Override Vị trí đỗ

```gherkin
  Scenario: 7.1 Xe vãng lai vào bãi theo AI gợi ý
    Given Xe vãng lai đến Cổng vào B1-IN
    When Staff quét thẻ "C002" (Thẻ vãng lai)
    And Tải ảnh biển số "29A-12345" và ảnh xe vào
    And Nhấn "Lấy gợi ý vị trí" ➔ AI gợi ý ô "B-C02"
    And Nhấn "Cho xe vào"
    Then Tạo phiên vãng lai thành công với SuggestedSlotId = B-C02, các trường override_* là NULL.

  Scenario: 7.2 Staff Override vị trí đỗ do ô gợi ý bị vướng vật cản
    Given Xe vãng lai khác đến Cổng vào
    And Staff quét thẻ "C003", OCR đọc biển số "30F-88888"
    And AI gợi ý ô đỗ "B-C03"
    When Staff thấy ô B-C03 đang có vũng nước nên nhấp nút "⚡ Đổi vị trí (Override)"
    And Giao diện chuyển sang màu cam cảnh báo Staff Override
    And Staff chọn ô đỗ thay thế "B-C04"
    And Staff chọn lý do nhanh "Ô đỗ bị vướng vật cản / đang bảo trì"
    And Nhấn "Cho xe vào"
    Then Tạo phiên thành công. Trong CSDL lưu: SuggestedSlotId = B-C03, SlotId = B-C04, OverrideSlotId = B-C04, OverrideBy = staff01, OverrideReason = "Ô đỗ bị vướng vật cản / đang bảo trì".

  Scenario: 7.3 Xe vãng lai ra bãi, Kiểm tra Zoom ảnh, Sửa biển số 1-click & Thanh toán PayOS
    Given Xe "29A-12345" tiến ra Cổng ra B1-OUT
    And Staff ở trang Cổng ra (/staff/exit) và quét thẻ "C002"
    When OCR xe ra đọc nhầm biển số thành "29A-72345"
    Then Hệ thống hiển thị Banner cảnh báo lệch biển số ra/vào
    And Nút thanh toán bị DISABLE do chưa tải ảnh xe ra
    When Staff tải ảnh xe ra
    And Nhấp vào ảnh để xem Modal phóng to sắc nét (Lightbox Zoom)
    And Staff nhấp nút nhanh "[ 📋 Dùng biển số vào: 29A-12345 ]" ➔ Biển số tự sửa chuẩn
    And Staff chọn hình thức "Thanh toán PayOS QR" (Giá: 20.000đ)
    And Khách quét mã QR chuyển khoản thành công
    Then Phiên xe đỗ hoàn tất (Status = COMPLETED), Thẻ "C002" tự động trả về trạng thái "AVAILABLE".
```

---

### Feature: 08. Luồng Sự cố Mất thẻ & Kiểm toán Quản trị (Lost Card & Audit Trail)

```gherkin
  Scenario: 8.1 Khách làm mất thẻ xe và Staff xử lý lập hồ sơ phạt
    Given Khách hàng báo làm mất thẻ xe tại Cổng ra
    When Staff nhấp nút "Xử lý Mất thẻ"
    And Nhập biển số xe tìm kiếm "30F-88888"
    And Tải ảnh Giấy tờ xe / CCCD xác minh chủ xe
    And Hệ thống tự động tính: Tổng tiền = Phí gửi xe (20.000đ) + Phí phạt mất thẻ (200.000đ) = 220.000đ
    And Staff thực hiện thu tiền và bấm "Duyệt xe ra"
    Then Thẻ "C003" chuyển sang trạng thái "LOST" (Bị khóa)
    And Tạo hồ sơ mất thẻ thành công trong "lost_card_cases".

  Scenario: 8.2 Admin kiểm tra Lịch sử Phiên và Vết Kiểm toán (Audit Log)
    Given Admin "admin01" đăng nhập trang Quản trị Hệ thống
    When Admin truy cập trang Chi tiết Phiên đỗ (/admin/sessions)
    Then Xem lại phiên xe "30F-88888" hiển thị đầy đủ thông tin Override (Người đè: staff01, Lý do: Ô đỗ bị vướng vật cản)
    When Admin truy cập trang Nhật ký Kiểm toán (/admin/audit)
    Then Xem thấy bản ghi kiểm toán Action = "PARKING_SESSION_OVERRIDDEN" minh bạch 100%.
```

---

## 🎯 TÓM TẮT TIẾN TRÌNH KIỂM THỬ (TEST EXECUTION PROGRESS)

| Giai đoạn | Tính năng | Số kịch bản BDD | Kết quả mong đợi |
| :--- | :--- | :---: | :--- |
| **Giai đoạn 1** | CSDL rỗng Master Data | 4 Scenarios | Hiển thị thông báo lỗi rõ ràng tiếng Việt, chặn thao tác an toàn |
| **Giai đoạn 2** | Manager khởi tạo Master Data | 5 Scenarios | CRUD thành công Tầng, Cổng, Khu vực, Slot, Thẻ & Bảng giá |
| **Giai đoạn 3** | Vận hành toàn bộ luồng nghiệp vụ | 9 Scenarios | Khách vãng lai, Cư dân, Vé tháng, Booking, Override, Mất thẻ & Audit Log chạy mượt mà 100% |
