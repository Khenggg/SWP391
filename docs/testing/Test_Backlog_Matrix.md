# Test Backlog Matrix

## Mục tiêu

Tài liệu này dùng để chia backlog test cho toàn bộ hệ thống theo:

- module
- mức ưu tiên
- loại test cần có
- tiêu chí nghiệm thu
- khả năng giao việc cho AI

---

## Quy ước cột

- `Smoke`: kiểm tra hệ thống có đứng dậy được không
- `Contract`: khóa request/response/status/error
- `Integration`: khóa transaction, DB state, service orchestration
- `E2E`: nghiệm thu flow từ góc nhìn người dùng
- `Component`: khóa UI behavior của page/component phức tạp
- `Priority`: P1 / P2 / P3 theo mức độ cần thiết cho nghiệm thu

---

## Backlog toàn hệ thống

| Module | Smoke | Contract | Integration | E2E | Component | Priority | Giao AI | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| Auth / Login / Route Guard | Yes | Yes | Yes | Yes | No | P1 | Yes | Flow nền tảng, phải khóa sớm |
| Public Parking Info | Yes | Yes | No | Yes | No | P1 | Yes | Read-only, dễ làm nhanh |
| Public Rules | Yes | Yes | No | Yes | No | P1 | Yes | Read-only |
| Public Pricing | Yes | Yes | No | Yes | No | P1 | Yes | Read-only nhưng là nguồn nghiệp vụ |
| Available Slots | Yes | Yes | Yes | Yes | No | P1 | Yes | Có liên quan dữ liệu occupancy |
| User Management | No | Yes | Yes | Yes | Yes | P1 | Yes | CRUD quản trị cốt lõi |
| Pricing Management | No | Yes | Yes | Yes | Yes | P1 | Yes | Ảnh hưởng Entry/Exit/Reservation |
| Structure Management | No | Yes | Yes | Yes | Yes | P1 | Yes | floors/areas/slots/gates |
| Card Management | No | Yes | Yes | Yes | Yes | P1 | Yes | Ảnh hưởng entry/exit |
| Dashboard | No | Yes | Yes | Yes | Yes | P1 | Yes | Read-after-write cần khóa |
| Reports | No | Yes | Yes | Yes | Yes | P2 | Yes | Export/report correctness |
| Audit Log | No | Yes | Yes | Yes | Yes | P1 | Yes | Dùng nghiệm thu hậu quả hành vi |
| Notifications | No | Yes | No | No | No | P2 | Yes | Có thể làm sau |
| Feedback | No | Yes | No | No | No | P2 | Yes | Không phải blocker hệ thống |
| Driver Profile | No | Yes | Yes | Yes | Yes | P2 | Yes | CRUD nhẹ |
| Driver Vehicles | No | Yes | Yes | Yes | Yes | P2 | Yes | Liên quan monthly pass / reservation |
| Reservation Suggest | No | Yes | Yes | Yes | No | P2 | Yes | Gắn với slot/area/pricing |
| Reservation Create | No | Yes | Yes | Yes | No | P2 | Yes | Core flow cho driver |
| Reservation Cancel | No | Yes | Yes | Yes | No | P2 | Yes | Phải assert slot release |
| Reservation Check-in | No | Yes | Yes | Yes | No | P3 | Yes | Giao với Entry |
| Reservation Auto Expire | No | No | Yes | No | No | P3 | Yes | Background worker |
| Monthly Pass Management | No | Yes | Yes | Yes | Yes | P2 | Yes | Domain lớn nhưng có thể tách |
| Monthly Pass Application | No | Yes | Yes | Yes | Yes | P2 | Yes | Driver + manager |
| Session Administration | No | Yes | Yes | Yes | Yes | P2 | Yes | Search/filter/cancel/move slot |
| Staff Entry - Casual | No | Yes | Yes | Yes | Yes | P3 | Yes | Flow mutation rất nặng |
| Staff Entry - Monthly | No | Yes | Yes | Yes | Yes | P3 | Yes | Token + card + slot |
| Staff Entry - Reservation | No | Yes | Yes | Yes | Yes | P3 | Yes | Cross-flow với reservation |
| Staff Exit - Cash | No | Yes | Yes | Yes | Yes | P3 | Yes | Release slot/card + payment |
| Staff Exit - Online | No | Yes | Yes | Yes | Yes | P3 | Yes | PayOS + callback |
| Lost Card | No | Yes | Yes | Yes | Yes | P3 | Yes | Session active + storage |
| Plate Mismatch | No | Yes | Yes | Yes | Yes | P3 | Yes | Evidence + approval |
| PayOS Callback / Webhook | No | Yes | Yes | No | No | P3 | Yes | Ưu tiên contract/integration |
| Support API Public Read | Yes | Yes | Yes | Yes | No | P2 | Yes | Spring read-model |
| Support API Driver Read | No | Yes | Yes | No | No | P2 | Yes | Projection consistency |
| Support API Report Export | No | Yes | Yes | No | No | P2 | Yes | File export correctness |

---

## Backlog 2 ngày đầu

### Bắt buộc hoàn thành scaffold + testcase đầu vào

| Nhóm | Module |
|---|---|
| P1 E2E | Auth, Public Parking Info, Public Pricing, User Management, Pricing Management, Structure Management, Card Management, Dashboard, Audit Log |
| P1 Contract | Auth, Users, Pricing, Structures, Cards, Public APIs, Dashboard |
| P1 Integration | Auth smoke, Users CRUD, Pricing CRUD, Structure CRUD, Card status |
| Component | User modal, Pricing modal, Structure modal, Filter table |

### Chỉ cần scaffold trong 2 ngày

| Nhóm | Module |
|---|---|
| P2 E2E | Driver Profile, Driver Vehicles, Reservation Create/Cancel, Monthly Pass, Session Administration |
| P3 E2E | Entry, Exit, Lost Card, Mismatch, Payment |
| P3 Integration | Entry transaction, Exit transaction, Reservation check-in, Payment callback |

---

## Rule chia việc cho AI

### Dạng task giao tốt

- 1 module
- 1 flow
- 1 loại test

Ví dụ:

- Viết E2E P1 cho User Management create user success
- Viết component test cho PricingRuleModal validation
- Viết integration test cho Reservation cancel release slot

### Dạng task giao không tốt

- Viết toàn bộ test cho hệ thống
- Viết tất cả test backend
- Viết mọi test cho module sessions

### Checklist review output từ AI

- Tên file đúng convention chưa
- Test có bám acceptance criteria không
- Có assert state quan trọng không
- Có dùng selector quá mong manh không
- Có phụ thuộc dữ liệu ngẫu nhiên không
- Có đang “nương theo code” thay vì bám nghiệp vụ không

---

## Definition of Done cho từng test case

Một test case chỉ được xem là đạt khi:

- tên test mô tả đúng nghiệp vụ
- setup rõ ràng
- assertion bám expected behavior
- nếu là flow mutation thì có kiểm tra hậu quả trạng thái
- không phụ thuộc thứ tự chạy ngẫu nhiên
- có thể chạy lại ổn định
