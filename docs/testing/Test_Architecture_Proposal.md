# Test Architecture Proposal

## 1. Mục tiêu

Bộ test của dự án phải được xem là tiêu chí nghiệm thu kỹ thuật, không phải bộ test viết để chiều theo code hiện tại.

Nguyên tắc:

- Spec và nghiệp vụ là nguồn đúng để xác định expected behavior.
- Test dùng để khóa hành vi đúng của hệ thống.
- Code mới hoặc sửa code chỉ được merge khi vượt qua test gate bắt buộc.
- Mỗi bug nghiêm trọng đã xảy ra phải được đóng lại bằng regression test.

---

## 2. Định hướng chiến lược

Dự án này đã có sẵn code và flow nghiệp vụ, nhưng thiếu test. Vì vậy hướng đúng không phải là TDD thuần cho toàn repo, mà là:

- test retrofit có kiểm soát
- acceptance trước, unit sau
- integration là xương sống cho nghiệp vụ core
- E2E chỉ cover critical business journey

Hướng ưu tiên:

1. Smoke test
2. API contract test
3. Integration test
4. E2E acceptance test
5. Component/UI behavior test
6. Regression/maintenance test

---

## 3. Test policy cho team

### 3.1 Rule merge

Một PR chỉ được xem là đạt khi:

- build pass
- smoke test pass
- test liên quan module pass
- không làm fail critical E2E suite
- nếu là bug fix thì phải có regression test

### 3.2 Rule release/demo

Một milestone/demo/release chỉ được xem là đạt khi:

- frontend boot được
- .NET Core API boot được
- Spring Boot Support API boot được
- DB kết nối được
- toàn bộ smoke suite pass
- toàn bộ P1 E2E pass
- core integration suite pass

### 3.3 Rule viết test

- Không viết test để hợp lý hóa implementation sai.
- Không sửa expected result chỉ vì code hiện tại đang trả ra sai.
- Khi code và test mâu thuẫn, đối chiếu lại spec, flow và yêu cầu nghiệp vụ trước.

---

## 4. Test pyramid thực dụng cho SWP301

Không dùng test pyramid sách giáo khoa một cách máy móc. Dùng test pyramid thực dụng:

- Ít E2E nhưng đúng flow quan trọng nhất
- Vừa đủ integration để khóa transaction và DB state
- Component test cho UI phức tạp
- Unit test chọn lọc cho logic mới, logic phức tạp, bug fix

Tỉ lệ đề xuất:

- 10% Smoke
- 25% E2E Acceptance
- 35% Integration
- 20% Component/UI
- 10% Unit/Utility/Regression nhỏ

---

## 5. Loại test nên có

### 5.1 Smoke test

Mục tiêu: xác nhận hệ thống có thể khởi động và sống.

Bắt buộc có:

- Frontend load được `/login`
- Frontend load được route public
- .NET Core health/auth-check sống
- Spring Boot health/auth-check sống
- Kết nối DB hợp lệ

Tính chất:

- nhanh
- chạy trước tất cả suite khác
- fail sớm nếu hệ thống không đứng dậy được

### 5.2 API contract test

Mục tiêu: khóa request/response shape, status code, auth rule, error code.

Nên áp dụng cho:

- Auth
- Users
- Pricing
- Structures
- Cards
- Reservations
- Sessions
- Payments
- Public APIs
- Support report APIs

### 5.3 Integration test

Mục tiêu: khóa nghiệp vụ có transaction và DB mutation thật.

Nghiệp vụ core cần có:

- Entry transaction
- Exit transaction
- Reservation lifecycle
- Monthly pass lifecycle
- Lost card lifecycle
- Plate mismatch lifecycle
- Audit write/read consistency

### 5.4 E2E acceptance test

Mục tiêu: nghiệm thu flow từ góc nhìn người dùng.

Không dùng E2E để thay thế unit/integration.

E2E chỉ dùng cho:

- login và route guard
- role-based user flow
- reservation happy path
- entry happy path
- exit happy path
- dashboard/report read-after-write

### 5.5 Component/UI behavior test

Mục tiêu: khóa các thành phần UI phức tạp mà không cần boot full app.

Nên có cho:

- booking stepper
- pricing modal
- user modal
- structure modal
- staff entry panels
- exit payment section
- filter table

### 5.6 Regression / maintenance test

Mục tiêu: mỗi bug quan trọng từng xảy ra phải có test chống tái phát.

Ví dụ:

- active session bị duplicate
- slot không được release sau exit
- payment cash/online xung đột
- reservation auto-expire sai
- role không đúng vẫn vào được page
- dashboard không phản ánh dữ liệu mới

---

## 6. Vai trò của TDD, BDD, ATDD

### TDD

Không áp dụng cứng cho toàn repo ở giai đoạn này.

Chỉ dùng cho:

- module mới
- service/domain logic mới
- bug fix có logic phức tạp

### BDD

Rất hợp để mô tả acceptance flow.

Nên viết test theo cấu trúc dễ đọc:

- Given
- When
- Then

Không bắt buộc dùng Cucumber. Có thể dùng Playwright và đặt tên testcase theo phong cách BDD.

### ATDD

Nên áp dụng ở mức quy trình team.

Trước khi code flow mới:

- chốt acceptance criteria
- đổi acceptance criteria thành testcase
- sau đó mới implement hoặc sửa code

Kết luận:

- TDD: dùng chọn lọc
- BDD: dùng cho acceptance readability
- ATDD: dùng để chốt nghiệp vụ trước khi code

---

## 7. Công cụ đề xuất

### 7.1 Frontend

- Playwright cho smoke + E2E
- Vitest + Testing Library cho component test
- MSW cho mock trong component/local isolated test

### 7.2 .NET Core

- Tạo test project riêng cho integration test
- Ưu tiên integration API/service test hơn là unit test đại trà

### 7.3 Spring Boot

- JUnit 5
- MockMvc hoặc integration test theo service/controller
- Giữ test cho read/report/public projection nếu nó là contract quan trọng

### 7.4 CI

- Suite smoke chạy đầu
- Suite E2E P1 chạy sau
- Integration suite chạy bắt buộc trước merge

---

## 8. Danh sách test ưu tiên P1

Đây là nhóm nên dùng để khóa chặt acceptance sớm nhất:

### P1 - Nên có ngay

- Login theo role
- Route guard / unauthorized redirect
- Public Parking Info
- Public Rules
- Public Pricing
- Available Slots read
- User Management CRUD cơ bản
- Pricing Management CRUD cơ bản
- Structure Management CRUD cơ bản
- Card Management status/create/list
- Dashboard read có dữ liệu
- Audit log search/filter

### P2 - Sau P1

- Driver profile
- Driver vehicles
- Reservation suggest
- Reservation create
- Reservation cancel
- Monthly pass management
- Session administration list/search

### P3 - Sau cùng

- Entry flow
- Exit flow
- PayOS/payment callback
- Lost card
- Plate mismatch
- Dashboard cross-check sau write flow

---

## 9. Acceptance gate đề xuất

### Gate cho code mới

- có smoke liên quan
- có test cho behavior được thay đổi
- nếu có UI phức tạp thì có component test hoặc E2E thay thế
- nếu có thay đổi transaction/DB thì có integration test

### Gate cho flow nghiệp vụ lớn

- có testcase nghiệm thu
- có E2E happy path
- có negative case tối thiểu
- có role/permission check

---

## 10. Thứ tự triển khai thực tế

### Giai đoạn A - Dựng khung

- chốt test policy
- chốt framework
- chốt test folder structure
- chốt env strategy
- chốt seed/reset data strategy

### Giai đoạn B - Khóa acceptance tối thiểu

- login
- public pages
- user management
- pricing
- structure
- cards

### Giai đoạn C - Khóa nghiệp vụ core

- reservation
- entry
- exit
- dashboard read-after-write

### Giai đoạn D - Khóa flow khó

- monthly pass
- lost card
- plate mismatch
- payment callback
- regression suite

---

## 11. Quyết định kiến trúc test đề xuất

Nếu áp dụng ngay cho repo này, tôi đề xuất chốt:

- Playwright là chuẩn cho smoke + E2E acceptance
- Integration test là xương sống cho nghiệp vụ core
- Component test dùng cho UI phức tạp
- BDD-style testcase cho các flow nghiệp vụ
- TDD chỉ dùng chọn lọc cho code mới và bug fix
- Regression suite là bắt buộc cho lỗi đã từng gặp

---

## 12. Kết quả mong muốn

Khi bộ test hoàn chỉnh, team sẽ có:

- một hàng rào nghiệm thu rõ ràng
- một chuẩn merge code không phụ thuộc cảm tính
- một tập flow quan trọng được khóa bằng test
- một cơ chế ngăn bug tái phát
- một nền tảng để tiếp tục refactor và mở rộng an toàn
