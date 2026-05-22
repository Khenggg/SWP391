# Kế Hoạch Sprint 30 Ngày

Tài liệu này nén kế hoạch triển khai dual-backend thành 5 sprint, mỗi sprint 6 ngày. Mục tiêu là giúp team tạo GitHub Issues, Milestones và quản lý tiến độ trong GitHub Project.

Tài liệu nguồn cần đối chiếu:

- `../specification/Developer_Implementation_Specification_Dual_Backend_NET_SpringBoot.md`
- `../specification/API_Contract.md`
- `../testing/Test_Cases.md`

## Quy Tắc Delivery

- `.NET Core API` sở hữu nghiệp vụ ghi chính: auth, EF Core migrations, user management, parking cards, structure, sessions, entry, exit, fee, payment, receipt, monthly pass, lost card, mismatch, cancel session và slot adjustment.
- `Spring Boot Support API` sở hữu public reads, dashboard, reports, audit search và các support/export optional.
- PostgreSQL là single source of truth.
- Chỉ `.NET Core API` thay đổi schema chính thức bằng EF Core migrations.
- Spring Boot không được ghi core tables. Spring chỉ được append audit log cho action của chính nó.
- React gọi đúng backend owner: `/api/core/*` cho core write, `/api/public/*` và `/api/support/*` cho Spring read/support APIs.
- Mỗi sprint phải có test và integration, không dồn toàn bộ test sang S05.
- Excel export là `P2`, không được block demo-critical flow.

## Tổng Quan Sprint

| Sprint | Ngày | Mục tiêu | Output cuối sprint |
|---|---:|---|---|
| S01 - Foundation & Auth | 1-6 | Nền tảng thật cho backend/frontend, database, JWT và login | Login chạy được, JWT dùng chung, có schema baseline |
| S02 - Master Data & Public APIs | 7-12 | Dữ liệu quản lý cần trước khi xe vào | Có card, structure, pricing, monthly pass seed/CRUD và public read |
| S03 - Entry Flow | 13-18 | Hoàn tất transaction xe vào | Staff tạo được active parking session và public QR lookup chạy |
| S04 - Exit Payment & Exceptions | 19-24 | Xe ra, tính phí, thanh toán, receipt và exception flows | Xe ra được, state được giải phóng, exception có approval flow |
| S05 - Reports Testing & Demo | 25-30 | Dashboard, reports, audit, integration test và demo hardening | Bản demo ổn định, có docs, Postman flow và bug fix |

Nhịp 6 ngày đề xuất:

```text
Ngày 1: chốt issue, API contract, acceptance criteria và branch
Ngày 2-4: làm task chính
Ngày 5: viết test và integrate frontend/backend
Ngày 6: bug fix, review PR, merge và demo nội bộ
```

## S01 - Foundation & Auth

Mục tiêu: làm hệ thống thật sự chạy được và tránh việc mỗi người code theo một nền tảng khác nhau.

Output:

- `.NET Core API` có project setup thật, EF Core baseline, Swagger, JWT config và common response/error.
- PostgreSQL/Supabase có schema baseline và seed data.
- Spring Boot verify được JWT do `.NET` phát hành.
- React login được, lưu token, bảo vệ route và gọi được cả 2 backend qua API clients riêng.

Issue list:

```text
[.NET][Setup] Add real Core API project setup: csproj, Program, Swagger, config
[.NET][DB] Create ParkingDbContext, core entities, enums, and initial EF Core migration
[.NET][DB] Seed roles, admin, manager, staff, vehicle types, floors, areas, slots, gates
[.NET][Common] Standardize ApiResponse, ErrorResponse, Pagination
[.NET][Auth] Implement POST /api/core/auth/login with JWT
[.NET][Auth] Implement GET /api/core/auth/me
[Spring][Security] Verify JWT issued by .NET using shared issuer, audience, and secret
[Spring][Common] Standardize ApiResponse, ErrorResponse, Pagination
[React][Setup] Configure routing, app layout, auth state, and protected routes
[React][API] Add coreApi, supportApi, and publicApi clients
[Test][Auth] Test login success/fail/locked user and Spring JWT compatibility
[Docs] Confirm setup, environment variables, and local run notes
```

Priority:

- `P0`: `.NET` setup, DB baseline, seed users, login, JWT verify, React protected route.
- `P1`: common pagination và tài liệu setup.

## S02 - Master Data & Public APIs

Mục tiêu: tạo đủ dữ liệu nền trước khi làm xe vào. Không nên bắt đầu Entry nếu chưa có card, slot, vehicle type, gate, pricing và monthly pass cơ bản.

Output:

- Admin/Manager quản lý được user, card, vehicle type, parking structure, gate, pricing và monthly pass ở mức MVP.
- Public page đọc được thông tin bãi xe, slot trống, pricing và rules.
- Database có dữ liệu hợp lệ để test S03 entry.

Issue list:

```text
[.NET][User] Implement internal user management CRUD for Admin
[.NET][VehicleType] Implement vehicle type CRUD
[.NET][ParkingCard] Implement parking card CRUD with qr_token
[.NET][Structure] Implement floor CRUD
[.NET][Structure] Implement area CRUD and area_vehicle_types mapping
[.NET][Structure] Implement slot CRUD and status rules
[.NET][Structure] Implement gate CRUD
[.NET][Pricing] Implement pricing rule CRUD
[.NET][MonthlyPass] Implement minimal monthly pass CRUD needed by entry/exit
[Spring][Public] Implement GET /api/public/parking-info
[Spring][Public] Implement GET /api/public/available-slots
[Spring][Public] Implement GET /api/public/pricing
[Spring][Public] Implement GET /api/public/rules
[React][Manager] Build card management page
[React][Manager] Build structure management page
[React][Manager] Build pricing management page
[React][Manager] Build monthly pass MVP page
[React][Public] Build parking info, available slots, pricing, and rules pages
[Test][MasterData] Test CRUD for card, slot, pricing, vehicle type, and monthly pass basics
```

Priority:

- `P0`: vehicle types, cards, floors/areas/slots/gates, pricing, seed data, public available slots.
- `P1`: user management UI, monthly pass MVP, public rules.

## S03 - Entry Flow

Mục tiêu: hoàn tất luồng xe vào trong một transaction của `.NET` và expose lookup read-only qua Spring.

Output:

- Staff tạo được parking session.
- Session thành `ACTIVE`.
- Card thành `IN_USE`.
- Slot thành `OCCUPIED`.
- Pricing snapshot được lưu tại thời điểm entry.
- Audit log ghi nhận session creation.
- Public QR lookup đọc được active session nhưng không lộ dữ liệu nhạy cảm.

Issue list:

```text
[.NET][SlotSuggestion] Suggest slot by vehicle type and availability
[.NET][Entry] Validate card AVAILABLE
[.NET][Entry] Validate slot AVAILABLE and compatible with vehicle type
[.NET][Entry] Validate vehicle plate has no active session
[.NET][Entry] Detect valid monthly pass when available
[.NET][Entry] Save pricing snapshot at entry time
[.NET][Entry] Create parking session transaction
[.NET][Entry] Update card to IN_USE after entry
[.NET][Entry] Update slot to OCCUPIED after entry
[.NET][Audit] Write SESSION_CREATED audit log
[Spring][Public] Implement QR lookup active session by qrToken
[React][Staff] Build staff entry page
[React][Staff] Build slot suggestion panel
[React][Staff] Build entry result modal
[Test][Entry] Test casual entry success
[Test][Entry] Test duplicate card, plate, and slot are blocked
[Test][Entry] Test pricing snapshot and monthly pass detection
[Test][Public] Test QR lookup privacy
```

Priority:

- `P0`: entry transaction, state updates, duplicate prevention, pricing snapshot, staff entry UI.
- `P1`: QR lookup privacy details và UI polish.

## S04 - Exit Payment & Exceptions

Mục tiêu: hoàn tất xe ra, tính phí, thanh toán cash, receipt và xử lý exception.

Output:

- Staff tìm được active session bằng card code.
- Xe vãng lai exit được: tính phí, thanh toán cash, tạo receipt, complete session và release card/slot.
- Monthly pass exit hoàn tất với payment waived/not required.
- Lost card và plate mismatch có approval flow ở mức MVP.
- Admin/Manager cancel session và adjust/move occupied slot được.

Issue list:

```text
[.NET][Session] Search active session by card code
[.NET][Fee] Calculate parking fee from entry snapshot and current exit time
[.NET][Payment] Implement cash payment API
[.NET][Receipt] Generate receipt after payment
[.NET][Exit] Complete casual exit transaction
[.NET][Exit] Complete monthly pass exit without cash payment
[.NET][MonthlyPass] Harden monthly pass validation for exit
[.NET][LostCard] Staff creates lost card case
[.NET][LostCard] Manager approves or rejects lost card case
[.NET][Mismatch] Create plate mismatch pending case
[.NET][Mismatch] Manager confirms or rejects mismatch case
[.NET][SessionAdmin] Admin cancels session and releases state
[.NET][SlotAdjustment] Move or adjust occupied slot safely
[React][Staff] Build staff exit page
[React][Staff] Build payment panel
[React][Staff] Build receipt modal
[React][Manager] Build monthly pass page improvements
[React][Manager] Build lost card approval page
[React][Manager] Build mismatch approval page
[React][Admin] Build cancel session or slot adjustment screen if time allows
[Test][Exit] Test entry -> fee -> cash payment -> exit -> receipt
[Test][Exception] Test monthly pass exit, lost card, mismatch, cancel session, and slot adjustment
```

Nếu thiếu thời gian, ưu tiên theo thứ tự:

```text
Casual exit -> Fee -> Cash payment -> Receipt -> Monthly pass exit -> Cancel session -> Lost card -> Mismatch -> Slot adjustment
```

Priority:

- `P0`: session search, fee, cash payment, receipt, casual exit, state release.
- `P1`: monthly pass exit, cancel session, lost card, mismatch, slot adjustment.

## S05 - Reports Testing & Demo

Mục tiêu: ổn định demo và hoàn tất read-side quản lý.

Output:

- Manager xem được dashboard và basic reports.
- Admin/Manager search được audit logs.
- Full demo scenario có Postman/manual test.
- README và demo script sẵn sàng.
- Không nhận feature lớn mới nếu P0/P1 demo task chưa xong.

Issue list:

```text
[Spring][Dashboard] Implement dashboard summary API
[Spring][Report] Implement revenue report API
[Spring][Report] Implement traffic report API
[Spring][Report] Implement occupancy report API
[Spring][Audit] Implement audit log search API
[Spring][Export] Implement Excel export for report/audit only if P0/P1 are stable
[React][Manager] Build dashboard page
[React][Manager] Build reports page
[React][Admin] Build audit log page
[Test][Backend] Add focused unit tests for .NET services
[Test][Backend] Add focused unit tests for Spring services
[Test][API] Update Postman collection for full flow
[Test][E2E] Run manual full demo scenario
[Docs] Update README for full system run
[Docs] Update demo script
[Bugfix] Fix UI/API integration bugs
```

Priority:

- `P0`: full demo flow, integration bug fixes, README, demo script.
- `P1`: dashboard, reports, audit search, backend service tests.
- `P2`: Excel export và UI polish.

## Acceptance Criteria Cho Demo

Bản demo 30 ngày đạt khi các điểm sau pass:

- Staff login qua `.NET` và nhận JWT.
- React gọi được `.NET` và Spring bằng cùng JWT.
- Spring verify được JWT do `.NET` phát hành cho protected support APIs.
- Manager/Admin tạo hoặc seed được card, vehicle type, slot, gate và pricing data.
- Staff tạo được vehicle entry session.
- Entry cập nhật đúng session, card, slot, pricing snapshot và audit log.
- Public QR lookup trả active session data nhưng không trả sensitive fields.
- Staff tìm active session bằng card code.
- Casual exit tính phí, thanh toán cash, tạo receipt, complete session và release card/slot.
- Monthly pass exit hoàn tất không cần cash payment.
- Dashboard/report/audit page đọc được dữ liệu sinh ra từ core flow.
- Postman collection và demo script cover full scenario.

## Cut Line Khi Trễ

Nếu team bị trễ, cắt theo thứ tự:

```text
Excel export
Advanced charts
UI polish
Advanced public pages
Slot adjustment UI polish
Mismatch/lost-card advanced details
```

Không được cắt:

```text
Auth
Database baseline
JWT compatibility
Entry
Exit
Fee
Cash payment
Receipt
Core state transitions
```
