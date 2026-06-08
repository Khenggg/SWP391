# Frontend MVP Page Task Breakdown

> Tài liệu chia task frontend theo 21 Must pages trong `Developer_Implementation_Specification_Dual_Backend_NET_SpringBoot.md`.
> Mỗi page được chia theo phase: UI/mock trước, sau đó tích hợp API thật khi backend sprint tương ứng hoàn thành.

## 1. Cách Chia Việc

### 1.1 Nguyên tắc dependency với backend

Frontend không nên làm page theo cảm tính. Mỗi page phải bám theo backend sprint:

| Backend sprint | Backend cung cấp | Frontend nên làm |
| --- | --- | --- |
| Sprint 1 | Auth, JWT, current user, common response, DB foundation | App shell, API clients, auth flow, route guard, layout, mock UI |
| Sprint 2 | Master data, cards, structure, pricing, monthly pass, public APIs | Public pages, user/card/structure/pricing/monthly pass management |
| Sprint 3 | Slot suggestion, entry transaction, QR active session lookup | Staff entry, public QR lookup |
| Sprint 4 | Exit, fee, payment, lost card, mismatch, cancel session | Staff exit, session search, lost card, approvals, admin session |
| Sprint 5 | Dashboard, reports, audit search | Dashboard, reports, audit pages |

### 1.2 Phase dùng cho mỗi page

Mỗi page chia thành 4 phase nhỏ:

| Phase | Mục tiêu | Được làm khi |
| --- | --- | --- |
| Phase A - Page shell | Route, layout, title, nav, empty/loading/error states, mock data | Làm ngay được |
| Phase B - Form/table UX | Form, table, filter, modal, validation frontend, confirm dialog | Làm ngay được với mock |
| Phase C - API integration | Gọi API thật, token, error mapping, pagination, refresh state | Backend API đã có hoặc contract ổn định |
| Phase D - Flow test | Test end-to-end theo user flow, role guard, edge case, demo data | Backend flow hoàn tất |

### 1.3 Foundation frontend bắt buộc trước 21 page

Phần này không nằm trong 21 pages nhưng phải làm trước, nếu không các page sau sẽ bị lặp code.

#### FE-FND-01 - App routing and layout

Scope:
- Cài hoặc thiết lập routing cho React app nếu chưa có.
- Tạo route groups: public, staff, manager, admin.
- Tạo `AppShell` cho authenticated pages.
- Tạo `PublicLayout` cho public pages.
- Tạo `NotFoundPage`, `UnauthorizedPage`, basic error boundary.

Acceptance:
- User mở được public route không cần login.
- Protected route redirect về login nếu chưa có token.
- Sidebar/menu hiển thị theo role.

#### FE-FND-02 - API clients and response handling

Scope:
- Tạo `coreAxiosClient`, `supportAxiosClient`, `publicAxiosClient`.
- Gắn token interceptor cho `coreApi` và `supportApi`.
- Chuẩn hóa handler cho response dạng `{ success, message, data, errors, timestamp }`.
- Chuẩn hóa handler cho `401`, `403`, validation error, network error.

Acceptance:
- Mỗi feature không tự viết lại axios config.
- Khi token hết hạn, app xóa session và redirect login.

#### FE-FND-03 - Auth state and role guard

Scope:
- Tạo auth store/context: `accessToken`, `currentUser`, `role`, `isAuthenticated`.
- Tạo `login`, `logout`, `loadCurrentUser`.
- Tạo `RequireAuth`, `RequireRole`.
- Tạo role constants: `ADMIN`, `MANAGER`, `STAFF`, `DRIVER`.

Acceptance:
- Role STAFF không vào admin pages.
- Role MANAGER vào manager pages và staff operation pages nếu spec cho phép.
- Role ADMIN vào admin pages.

#### FE-FND-04 - Shared UI primitives

Scope:
- Button, IconButton, Input, Select, Checkbox, Tabs, Modal, Drawer, Toast.
- DataTable có loading, empty, error, pagination.
- StatusBadge cho card/session/payment/slot/monthly pass.
- ConfirmDialog cho thao tác nguy hiểm.

Acceptance:
- Các page dùng chung component, không copy style lung tung.
- Loading/error/empty state nhất quán.

#### FE-FND-05 - LoginPage

Status:
- Không nằm trong Page Breakdown 21 pages, nhưng FR-01 yêu cầu `LoginPage`.

Backend dependency:
- Sprint 1: `F009 Login & JWT Generation`, `F010 Get Current User Profile`.

Scope:
- Form username/password.
- Gọi `POST /api/core/auth/login`.
- Lưu token.
- Gọi `GET /api/core/auth/me`.
- Redirect theo role:
  - ADMIN -> `/admin/users` hoặc `/manager/dashboard`
  - MANAGER -> `/manager/dashboard`
  - STAFF -> `/staff/entry`
  - DRIVER -> `/`

Flow:
1. User nhập username/password.
2. Frontend validate required fields.
3. Gọi login API.
4. Nếu thành công, lưu token.
5. Load current user.
6. Điều hướng theo role.
7. Nếu sai password/status locked, hiển thị lỗi từ backend.

Acceptance:
- Login thành công với seed `admin01`, `manager01`, `staff01`.
- Login sai không làm crash app.
- Refresh page vẫn giữ session nếu token còn hợp lệ.

## 2. Thứ Tự Làm 21 Must Pages

| Thứ tự | Page | Backend sprint | Lý do |
| ---: | --- | --- | --- |
| 1 | ParkingInfoPage | Sprint 2 | Public, ít phụ thuộc auth |
| 2 | RulesPage | Sprint 2 hoặc static | Có thể làm static/mock sớm |
| 3 | PublicPricingPage | Sprint 2 | Dùng public pricing |
| 4 | AvailableSlotsPage | Sprint 2 | Dùng structure/slot read model |
| 5 | UserManagementPage | Sprint 2 | Cần auth/admin, kiểm tra app shell |
| 6 | CardManagementPage | Sprint 2 | Master data quan trọng cho entry |
| 7 | StructureManagementPage | Sprint 2 | Foundation cho slots/gates |
| 8 | PricingManagementPage | Sprint 2 | Foundation cho fee calculation |
| 9 | MonthlyPassManagementPage | Sprint 2 | Foundation cho monthly flow |
| 10 | StaffEntryPage | Sprint 3 | Cần slot suggestion + entry |
| 11 | CardLookupPage | Sprint 3 | Public QR lookup |
| 12 | StaffSessionSearchPage | Sprint 4 | Chuẩn bị exit/admin |
| 13 | StaffExitPage | Sprint 4 | Phụ thuộc fee/payment/exit |
| 14 | StaffLostCardPage | Sprint 4 | Exception flow |
| 15 | LostCardApprovalPage | Sprint 4 | Manager approval |
| 16 | MismatchApprovalPage | Sprint 4 | Manager approval |
| 17 | SessionAdministrationPage | Sprint 4 | Admin cancel/move/search |
| 18 | ManagerDashboardPage | Sprint 5 | Cần dữ liệu entry/exit/payment |
| 19 | ReportsPage | Sprint 5 | Cần dữ liệu tích lũy |
| 20 | AuditLogPage | Sprint 5 | Cần audit writer trước |
| 21 | AdminAuditLogPage | Sprint 5 | Reuse AuditLogPage với role/admin scope |

## 3. Public Driver Pages

### 3.1 ParkingInfoPage

Route:
- `/`

Priority:
- Must

Backend dependency:
- Sprint 2, Spring: `F026 Parking Info API`.

APIs:
- `GET /api/public/parking-info`

Purpose:
- Trang public đầu tiên cho driver/visitor xem thông tin bãi xe.

Phase A - Page shell:
- Tạo route `/`.
- Tạo public header/navigation: Home, Available Slots, Pricing, Rules.
- Tạo layout thông tin bãi: tên bãi, trạng thái hoạt động, giờ mở cửa, địa chỉ, hotline.
- Tạo mock data trong `publicMockData`.
- Empty state: chưa có thông tin bãi.
- Error state: không tải được public info.

Phase B - UI details:
- Section tổng quan:
  - parking name
  - opening status
  - total floors/areas/slots nếu API trả
  - hotline/support note
- Section quick actions:
  - xem slot trống
  - xem bảng giá
  - xem nội quy
- Section operational status:
  - badge `OPEN`, `CLOSED`, `MAINTENANCE`
  - last updated time

Phase C - API integration:
- Tạo `publicApi.getParkingInfo()`.
- Map response từ backend sang view model.
- Gắn loading skeleton.
- Nếu backend trả thiếu field optional, UI vẫn render fallback.

Functional flow:
1. User mở `/`.
2. Frontend gọi public info API.
3. Nếu success, hiển thị thông tin bãi.
4. User bấm CTA để chuyển sang `/available-slots`, `/pricing`, `/rules`.

Acceptance:
- Page public không cần token.
- Load được bằng direct URL.
- Không hiển thị menu staff/manager/admin.
- Khi API lỗi, vẫn có thông báo lỗi rõ và nút retry.

### 3.2 AvailableSlotsPage

Route:
- `/available-slots`

Priority:
- Must

Backend dependency:
- Sprint 2, Spring: `F027 Available Slots API`.
- Backend data dependency: `.NET` đã có floors/areas/slots từ Sprint 2.

APIs:
- `GET /api/public/available-slots`

Purpose:
- Driver xem số slot trống theo loại xe/tầng/khu.

Phase A - Page shell:
- Tạo route `/available-slots`.
- Tạo filter panel mock:
  - vehicle type
  - floor
  - area
  - status default `AVAILABLE`
- Tạo result area dạng table hoặc grouped list.
- Mock slots theo floor/area.

Phase B - UI details:
- Filter controls:
  - `vehicleTypeId`
  - `floorId`
  - `areaId`
  - auto refresh toggle nếu muốn
- Summary cards:
  - total available
  - available by vehicle type
  - available by floor
- Result list:
  - floor code
  - area code/name
  - slot code
  - allowed vehicle type
  - status badge
- Empty state:
  - không có slot phù hợp filter.

Phase C - API integration:
- Tạo `publicApi.getAvailableSlots(params)`.
- Query params đề xuất:
  - `vehicleTypeId`
  - `floorId`
  - `areaId`
- Debounce filter hoặc nút Search.
- Khi filter đổi, reset pagination nếu có.

Functional flow:
1. User mở page.
2. Frontend load default available slots.
3. User chọn loại xe.
4. Frontend gọi API với filter.
5. UI cập nhật summary và danh sách.

Edge cases:
- Backend trả danh sách rỗng.
- Slot vừa hết khi user đang xem.
- Filter invalid hoặc API trả validation error.

Acceptance:
- Public không cần login.
- Filter không làm reload toàn app.
- Kết quả hiển thị dễ scan theo floor/area.

### 3.3 PublicPricingPage

Route:
- `/pricing`

Priority:
- Must

Backend dependency:
- Sprint 2, Spring: `F028 Public Pricing API`.
- Backend data dependency: `.NET` pricing rules từ Sprint 2.

APIs:
- `GET /api/public/pricing`

Purpose:
- Driver xem bảng giá đang active.

Phase A - Page shell:
- Tạo route `/pricing`.
- Tạo pricing table mock.
- Tạo loading/error/empty state.

Phase B - UI details:
- Table columns:
  - vehicle type
  - day price
  - night price
  - monthly price
  - lost card fee nếu MVP muốn public
  - effective from
- Format tiền VND.
- Highlight active pricing only.
- Note rõ giá có thể thay đổi theo chính sách bãi.

Phase C - API integration:
- Tạo `publicApi.getPricing()`.
- Map numeric fields sang formatter.
- Nếu backend trả nhiều rule, frontend chỉ hiển thị active/current rules theo contract.

Functional flow:
1. User mở `/pricing`.
2. Frontend gọi public pricing API.
3. User scan theo loại xe.
4. User có thể chuyển sang rules/available slots.

Acceptance:
- Không cần token.
- Không hiển thị chức năng edit pricing trên public page.
- Giá format nhất quán.

### 3.4 RulesPage

Route:
- `/rules`

Priority:
- Must

Backend dependency:
- Sprint 2, Spring: `F029 Public Rules API`, hoặc static frontend.

APIs:
- `GET /api/public/rules` nếu backend làm.
- Có thể dùng static config trong frontend nếu backend chưa làm.

Purpose:
- Driver xem nội quy gửi xe, điều kiện mất thẻ, sai biển số, thanh toán.

Phase A - Page shell:
- Tạo route `/rules`.
- Tạo static sections:
  - quy định vào bãi
  - quy định ra bãi
  - mất thẻ
  - sai biển số
  - vé tháng
  - liên hệ hỗ trợ

Phase B - UI details:
- Tabs hoặc accordion theo nhóm rule.
- Search text trong rules nếu nội dung dài.
- Last updated note nếu API có.

Phase C - API integration:
- Nếu backend có `GET /api/public/rules`, load dynamic rules.
- Nếu API lỗi, fallback static copy.

Functional flow:
1. User mở `/rules`.
2. Nếu API configured, frontend load rules.
3. User đọc theo accordion/tab.
4. User search rule keyword.

Acceptance:
- Page dùng được ngay cả khi backend public rules chưa sẵn sàng.
- Không có nội dung mâu thuẫn với fee/lost card flow.

### 3.5 CardLookupPage

Route:
- `/card/:qrToken`

Priority:
- Must

Backend dependency:
- Sprint 3, Spring: `F037 Public QR Active Session Lookup`.
- Security dependency: `F038 QR Privacy Tests`.

APIs:
- `GET /api/public/cards/{qrToken}/active-session`

Purpose:
- Driver quét QR trên card để xem session active đã được mask dữ liệu nhạy cảm.

Phase A - Page shell:
- Tạo dynamic route `/card/:qrToken`.
- Tạo mock states:
  - active session found
  - no active session
  - invalid QR token
  - expired/unavailable
- Tạo privacy-safe session view.

Phase B - UI details:
- Hiển thị:
  - card code masked nếu cần
  - vehicle plate masked nếu backend trả masked
  - vehicle type
  - entry time
  - floor/area/slot nếu public-safe
  - status
- Không hiển thị:
  - staff full info
  - phone/email
  - internal IDs nếu không cần
  - pricing sensitive snapshot nếu backend không cho public

Phase C - API integration:
- Tạo `publicApi.getActiveSessionByQrToken(qrToken)`.
- Validate route param tồn tại.
- Handle `404` no active session.
- Handle `403/400` invalid token.

Functional flow:
1. Driver quét QR.
2. Browser mở `/card/:qrToken`.
3. Frontend gọi lookup API.
4. Nếu có active session, hiển thị trạng thái gửi xe.
5. Nếu không có active session, hiển thị thông báo thẻ chưa có lượt gửi đang hoạt động.

Acceptance:
- Không cần login.
- Không lộ dữ liệu nhạy cảm.
- Direct URL hoạt động.

## 4. Staff Pages

### 4.1 StaffEntryPage

Route:
- `/staff/entry`

Priority:
- Must

Backend dependency:
- Sprint 3:
  - `F031 Slot Suggestion`
  - `F032 Entry Validation`
  - `F033 Create Entry Transaction`
  - `F034 Update Card/Slot State On Entry`
  - `F035 Save Pricing Snapshot`

APIs:
- `POST /api/core/parking-sessions/suggest-slot`
- `POST /api/core/parking-sessions/entry`
- Supporting:
  - `GET /api/core/cards/available`
  - `GET /api/core/vehicle-types`
  - `GET /api/core/gates`
  - `GET /api/core/floors`
  - `GET /api/core/areas`
  - `GET /api/core/slots`
  - `GET /api/core/monthly-passes/check`

Purpose:
- Staff tạo lượt xe vào.

Phase A - Page shell:
- Tạo protected route staff/manager/admin.
- Tạo entry form mock.
- Tạo panels:
  - CardPanel
  - VehicleInfoPanel
  - SlotSuggestionPanel
  - EntrySummaryPanel
- Tạo mock vehicle types, cards, gates, slots.

Phase B - Form UX:
- Fields:
  - card code/card id
  - plate number
  - no plate checkbox
  - vehicle description nếu no plate
  - vehicle type
  - entry gate
  - requested floor/area optional
  - selected slot
  - override reason nếu staff chọn slot khác suggestion
- Frontend validation:
  - card required
  - vehicle type required
  - entry gate required
  - plate required nếu `noPlate = false`
  - vehicle description required nếu `noPlate = true`
  - override reason required nếu override slot

Phase C - API integration:
- Load dropdown data.
- Suggest slot API:
  - call after vehicle type/gate/filter ready
  - show suggested area/slot
  - allow manual override if backend allows
- Entry API:
  - submit final payload
  - handle business errors:
    - `CARD_NOT_AVAILABLE`
    - `SLOT_NOT_AVAILABLE`
    - `DUPLICATE_ACTIVE_PLATE`
    - `INVALID_ENTRY_GATE`
    - `MONTHLY_PASS_INVALID`

Functional flow:
1. Staff mở `/staff/entry`.
2. Chọn/scan card.
3. Nhập biển số hoặc tick no plate.
4. Chọn loại xe và cổng vào.
5. Frontend gọi suggest slot.
6. Staff xác nhận slot hoặc chọn override kèm reason.
7. Staff bấm Create Entry.
8. Backend tạo session, đổi card IN_USE, đổi slot OCCUPIED.
9. Frontend hiển thị session created summary.
10. Form reset để tiếp nhận xe tiếp theo.

Acceptance:
- Không tạo entry nếu form invalid.
- Submit double-click không tạo duplicate request.
- Sau entry success, selected card/slot không còn hiển thị available trong local state hoặc được refetch.

### 4.2 StaffExitPage

Route:
- `/staff/exit`

Priority:
- Must

Backend dependency:
- Sprint 4:
  - `F039 Search Active Session By Card Code`
  - `F040 Calculate Parking Fee`
  - `F041 Cash Payment Processing`
  - `F042 Waive Payment`
  - `F045 Complete Casual Exit`
  - `F046 Complete Monthly Pass Exit`

APIs:
- `GET /api/core/parking-sessions/by-card-code/{cardCode}`
- `POST /api/core/parking-sessions/{id}/calculate-fee`
- `POST /api/core/payments/cash`
- `POST /api/core/payments/waive`
- `POST /api/core/parking-sessions/{id}/exit`
- `POST /api/core/parking-sessions/{id}/monthly-pass-exit`
- `GET /api/core/gates`

Purpose:
- Staff xử lý xe ra, tính phí, thu tiền, hoàn tất session.

Phase A - Page shell:
- Tạo protected staff route.
- Panels:
  - SessionLookupPanel
  - ActiveSessionDetailPanel
  - FeeSummaryPanel
  - CashPaymentPanel
  - ExitConfirmPanel
- Mock states:
  - no session found
  - session active
  - lost card pending
  - mismatch pending
  - monthly pass
  - casual paid/unpaid

Phase B - Form UX:
- Lookup by card code.
- Exit info:
  - exit gate
  - exit plate number
  - exit time default now
- Fee calculation:
  - include lost card fee if case approved
  - display amount breakdown
- Payment:
  - cash amount
  - total amount read-only
  - waive action only manager/admin

Phase C - API integration:
- Lookup active session by card code.
- Calculate fee after exit time/plate/gate ready.
- Create cash payment.
- Complete exit with paymentId.
- For monthly pass, complete monthly-pass-exit without cash.
- Handle errors:
  - `SESSION_NOT_ACTIVE`
  - `PAYMENT_REQUIRED_BEFORE_EXIT`
  - `LOST_CARD_NOT_APPROVED`
  - `PLATE_MISMATCH_REQUIRES_APPROVAL`
  - `INVALID_EXIT_GATE`
  - `PAYMENT_AMOUNT_MISMATCH`

Functional flow - casual exit:
1. Staff nhập/scan card code.
2. Frontend tìm active session.
3. Staff nhập exit plate/gate/time.
4. Frontend gọi calculate fee.
5. Staff xác nhận cash payment.
6. Frontend gọi payments/cash.
7. Staff bấm Complete Exit.
8. Frontend gọi exit API với paymentId.
9. UI hiển thị completed summary và reset lookup.

Functional flow - monthly pass exit:
1. Staff lookup active monthly session.
2. Staff nhập exit plate/gate/time.
3. Frontend nhận fee 0 hoặc not required.
4. Staff bấm Complete Monthly Pass Exit.
5. UI hiển thị completed summary.

Acceptance:
- Staff không thể complete casual exit trước khi payment PAID.
- Monthly pass valid không bắt cash payment.
- Nếu mismatch/lost card pending, UI hướng staff sang page/case phù hợp.

### 4.3 StaffLostCardPage

Route:
- `/staff/lost-card`

Priority:
- Must

Backend dependency:
- Sprint 4:
  - `F047 Create Lost Card Case`
  - `F040 Calculate Parking Fee`
  - `F039 Search Active Session By Card Code`

APIs:
- `GET /api/core/parking-sessions/by-card-code/{cardCode}`
- `POST /api/core/parking-sessions/{id}/calculate-fee`
- `POST /api/core/lost-card-cases`

Purpose:
- Staff tạo hồ sơ mất thẻ cho active session.

Phase A - Page shell:
- Search panel by card/plate/session code.
- Session summary panel.
- Lost card case form.
- Fee preview panel.

Phase B - Form UX:
- Fields:
  - reporter name
  - phone
  - verification note
  - reason
  - include lost card fee preview
- Validation:
  - reporter name required
  - verification note required
  - reason required

Phase C - API integration:
- Lookup session.
- Calculate fee including lost card fee if needed.
- Create lost-card case.
- Handle:
  - no active session
  - existing pending lost-card case
  - session not active

Functional flow:
1. Staff tìm active session.
2. UI hiển thị card/session/vehicle summary.
3. Staff nhập thông tin người báo mất.
4. Staff xem fee preview.
5. Staff submit lost card case.
6. Backend chuyển session sang `LOST_CARD_PENDING`.
7. UI hiển thị case created và hướng Manager approve.

Acceptance:
- Staff chỉ tạo case, không approve.
- Không tạo case nếu không có active session.
- UI thể hiện rõ cần Manager/Admin duyệt.

### 4.4 StaffSessionSearchPage

Route:
- `/staff/sessions`

Priority:
- Must

Backend dependency:
- Sprint 4:
  - `F039 Search Active Session By Card Code`
  - Session search endpoint from exit/session module.

APIs:
- `GET /api/core/parking-sessions/search`
- `GET /api/core/parking-sessions/{id}`
- `GET /api/core/parking-sessions/by-card-code/{cardCode}`

Purpose:
- Staff tra cứu session để hỗ trợ entry/exit/exception.

Phase A - Page shell:
- Search filters.
- Session result table.
- Session detail drawer.

Phase B - UI details:
- Filters:
  - card code
  - plate number
  - status
  - entry date range
  - vehicle type
  - floor/area/slot
- Table columns:
  - session code
  - card code
  - plate
  - vehicle type
  - entry time
  - status
  - payment status
  - slot
- Row actions:
  - view detail
  - go to exit
  - create lost card case

Phase C - API integration:
- Query search endpoint with filters.
- Implement pagination.
- Load detail drawer by id.
- Preserve filters in URL query if useful.

Functional flow:
1. Staff opens session search.
2. Enters filter criteria.
3. Frontend loads sessions.
4. Staff opens detail.
5. Staff routes to exit/lost-card flow with selected session context.

Acceptance:
- Search can handle empty result.
- Detail drawer does not lose current filters.
- Staff sees only actions allowed by session status.

## 5. Manager Pages

### 5.1 ManagerDashboardPage

Route:
- `/manager/dashboard`

Priority:
- Must

Backend dependency:
- Sprint 5, Spring: `F056 Operational Dashboard`.

APIs:
- `GET /api/support/dashboard/summary`

Purpose:
- Manager xem snapshot vận hành: occupancy, revenue, entry/exit count, card status, pending cases.

Phase A - Page shell:
- Dashboard layout with KPI grid.
- Mock charts using Recharts.
- Time range selector.
- Loading skeleton.

Phase B - UI details:
- KPI cards:
  - vehicles currently parked
  - available slots
  - occupied slots
  - today entries
  - today exits
  - today revenue
  - pending lost card cases
  - pending mismatch cases
- Charts:
  - traffic by hour/day
  - occupancy by area/floor
  - card status distribution
- Alert panel:
  - low available slots
  - high pending cases

Phase C - API integration:
- Tạo `supportApi.getDashboardSummary(params)`.
- Params:
  - date
  - dateRange
  - floorId optional
- Map response to KPI/chart view models.
- Auto-refresh optional after API stable.

Functional flow:
1. Manager opens dashboard.
2. Frontend loads summary.
3. Manager changes date/floor filter.
4. Dashboard refreshes KPIs/charts.
5. Manager clicks pending case count to go approval pages.

Acceptance:
- Dashboard is read-only.
- Does not compute official revenue in frontend beyond display.
- Charts handle zero data.

### 5.2 CardManagementPage

Route:
- `/manager/cards`

Priority:
- Must

Backend dependency:
- Sprint 2:
  - `F015 Parking Card CRUD + QR Token`
  - `F016 Update Card Status`

APIs:
- `GET /api/core/cards`
- `POST /api/core/cards`
- `GET /api/core/cards/available`
- `GET /api/core/cards/{id}`
- `PATCH /api/core/cards/{id}/status`
- `GET /api/core/cards/by-code/{cardCode}/active-session`

Purpose:
- Manager/Admin quản lý thẻ gửi xe và trạng thái thẻ.

Phase A - Page shell:
- Card table with mock data.
- Filter by status/card code.
- Create card modal.
- Status update modal.
- Detail drawer.

Phase B - UI details:
- Table columns:
  - card code
  - status
  - current session
  - QR token masked
  - note
  - updated at
- Actions:
  - create
  - view detail
  - mark lost
  - mark damaged
  - inactive/reactivate if allowed
  - check active session
- Status badges:
  - AVAILABLE
  - IN_USE
  - LOST
  - DAMAGED
  - INACTIVE

Phase C - API integration:
- Load card list with filters/pagination.
- Create card and refresh table.
- Update status with confirmation.
- Lookup active session by card code.
- Handle errors:
  - cannot update IN_USE card to invalid state
  - duplicate card code
  - card not found

Functional flow - create card:
1. Manager opens Create Card.
2. Enters card code/note if needed.
3. Backend generates static QR token.
4. Table refreshes and displays new card.

Functional flow - status update:
1. Manager selects card.
2. Chooses new status.
3. Frontend confirms destructive status changes.
4. Backend updates status.
5. UI refreshes row.

Acceptance:
- Cannot silently mark active card lost/damaged without confirmation.
- Card QR token is not shown as editable.
- In-use cards clearly show linked session.

### 5.3 StructureManagementPage

Route:
- `/manager/structure`

Priority:
- Must

Backend dependency:
- Sprint 2:
  - `F017 Manage Floors`
  - `F018 Manage Areas`
  - `F019 Manage Slots`
  - `F020 Manage Gates`
  - `F021 Lock/Unlock Area & Slot`

APIs:
- `GET /api/core/floors`
- `POST /api/core/floors`
- `PUT /api/core/floors/{id}`
- `GET /api/core/areas`
- `POST /api/core/areas`
- `PUT /api/core/areas/{id}`
- `GET /api/core/slots`
- `POST /api/core/slots`
- `PATCH /api/core/slots/{id}/status`
- `POST /api/core/parking-sessions/{id}/move-slot`
- `GET /api/core/gates`

Purpose:
- Manager/Admin quản lý cấu trúc bãi xe: tầng, khu, slot, cổng.

Phase A - Page shell:
- Tabs:
  - Floors
  - Areas
  - Slots
  - Gates
- Mock data for each tab.
- Create/edit modals.
- Slot status modal.

Phase B - UI details:
- Floors tab:
  - list floor code/name/status
  - create/edit floor
- Areas tab:
  - filter by floor
  - manage area vehicle types
  - priority order
  - status
- Slots tab:
  - filter by floor/area/vehicle type/status
  - create slot
  - lock/unlock/maintenance
  - show current session if occupied
- Gates tab:
  - list gate code/type/floor/status
  - entry/exit badge

Phase C - API integration:
- Load all needed master data.
- Use optimistic UI only for safe edits; otherwise refetch.
- Handle status constraints:
  - cannot set occupied slot available manually unless backend permits.
  - locked/maintenance area may affect slots depending backend rule.

Functional flow - manage slots:
1. Manager opens Slots tab.
2. Filters by floor/area.
3. Creates or updates slot status.
4. Backend validates current session/state.
5. UI refreshes slot table.

Functional flow - move session slot:
1. Manager finds occupied slot/session.
2. Opens move slot action.
3. Chooses target available slot.
4. Enters reason.
5. Backend updates old/new slot and audit.
6. UI refreshes.

Acceptance:
- Tabs do not lose filter state when switching.
- Status update requires confirmation and reason where needed.
- UI prevents obvious invalid transitions before API call.

### 5.4 PricingManagementPage

Route:
- `/manager/pricing`

Priority:
- Must

Backend dependency:
- Sprint 2: `F022 Manage Pricing Rules`.

APIs:
- `GET /api/core/pricing-rules`
- `POST /api/core/pricing-rules`
- `PUT /api/core/pricing-rules/{id}`
- Supporting:
  - `GET /api/core/vehicle-types`

Purpose:
- Manager/Admin quản lý bảng giá theo loại xe.

Phase A - Page shell:
- Pricing rules table.
- Create/edit modal.
- Vehicle type filter.
- Mock active/inactive rules.

Phase B - Form UX:
- Fields:
  - vehicle type
  - day price
  - night price
  - monthly price
  - lost card fee
  - effective from
  - status
- Frontend validation:
  - all money fields >= 0
  - vehicle type required
  - effective from required

Phase C - API integration:
- Load pricing rules.
- Create active pricing rule.
- Update existing rule.
- Handle:
  - duplicate active rule for vehicle type
  - invalid amount
  - pricing rule not found

Functional flow:
1. Manager opens pricing.
2. Frontend loads vehicle types and pricing rules.
3. Manager creates/updates pricing.
4. Backend validates active rule uniqueness.
5. UI refreshes table.

Acceptance:
- Money inputs prevent negative values.
- UI explains that active sessions use pricing snapshot from entry.
- Public pricing page remains read-only and separate.

### 5.5 MonthlyPassManagementPage

Route:
- `/manager/monthly-passes`

Priority:
- Must

Backend dependency:
- Sprint 2:
  - `F023 Monthly Pass CRUD`
  - `F024 Renew Monthly Pass`
  - `F025 Check Monthly Pass Validity`

APIs:
- `GET /api/core/monthly-passes`
- `POST /api/core/monthly-passes`
- `PUT /api/core/monthly-passes/{id}`
- `PATCH /api/core/monthly-passes/{id}/status`
- `POST /api/core/monthly-passes/{id}/renew`
- `GET /api/core/monthly-passes/check`
- Supporting:
  - `GET /api/core/vehicle-types`

Purpose:
- Manager/Admin quản lý vé tháng.

Phase A - Page shell:
- Monthly pass table.
- Create/edit modal.
- Renew modal.
- Status change modal.
- Validity check panel.

Phase B - Form UX:
- Fields:
  - owner name
  - phone
  - plate number
  - vehicle type
  - start date
  - end date
  - status
- Validation:
  - owner name required
  - plate required
  - normalized plate generated client-side for preview only
  - end date >= start date
  - vehicle type required

Phase C - API integration:
- Load monthly passes with filters.
- Create/update pass.
- Renew pass.
- Change status.
- Check validity by plate/vehicle type/time.
- Handle duplicate active pass.

Functional flow - create:
1. Manager opens create modal.
2. Enters owner/plate/type/dates.
3. Frontend validates date range.
4. Backend creates pass.
5. Table refreshes.

Functional flow - renew:
1. Manager selects existing pass.
2. Opens renew modal.
3. Enters new end date.
4. Backend extends pass.
5. UI updates status/dates.

Acceptance:
- Expired/locked/active statuses are visually distinct.
- Check validity panel returns clear valid/invalid result.
- Renew does not silently shorten pass unless backend allows.

### 5.6 LostCardApprovalPage

Route:
- `/manager/lost-card-cases`

Priority:
- Must

Backend dependency:
- Sprint 4:
  - `F048 Approve/Reject Lost Card`
  - `F047 Create Lost Card Case`

APIs:
- `GET /api/core/lost-card-cases`
- `GET /api/core/lost-card-cases/{id}`
- `POST /api/core/lost-card-cases/{id}/approve`
- `POST /api/core/lost-card-cases/{id}/reject`

Purpose:
- Manager/Admin duyệt hoặc từ chối hồ sơ mất thẻ.

Phase A - Page shell:
- Cases table.
- Detail drawer.
- Approve/reject modals.
- Mock pending/approved/rejected data.

Phase B - UI details:
- Filters:
  - status
  - created date range
  - staff
  - card/session
- Table columns:
  - case id
  - session code
  - card code
  - reporter
  - phone
  - lost card fee
  - status
  - created at
- Detail:
  - verification note
  - reason
  - session summary
  - payment/fee preview if available

Phase C - API integration:
- Load pending cases by default.
- Approve with confirmation.
- Reject with rejection reason.
- Handle stale case already resolved.

Functional flow - approve:
1. Manager opens pending case.
2. Reviews session/card/reporter info.
3. Confirms approval.
4. Backend applies lost card fee/state effect.
5. UI refreshes case and routes staff back to exit if needed.

Functional flow - reject:
1. Manager opens pending case.
2. Enters rejection reason.
3. Backend rejects case.
4. UI refreshes.

Acceptance:
- Staff role cannot access approval actions.
- Reject requires reason.
- Approved/rejected cases are not actionable again.

### 5.7 MismatchApprovalPage

Route:
- `/manager/mismatch`

Priority:
- Must

Backend dependency:
- Sprint 4:
  - `F049 Detect Plate Mismatch`
  - `F050 Resolve Plate Mismatch`

APIs:
- `POST /api/core/parking-sessions/{id}/mismatch/confirm`
- `POST /api/core/parking-sessions/{id}/mismatch/reject`
- Expected supporting search/list endpoint from mismatch/session module.

Purpose:
- Manager/Admin xử lý trường hợp biển số ra khác biển số vào.

Phase A - Page shell:
- Pending mismatch table.
- Detail panel showing entry/exit plate.
- Confirm/reject modals.

Phase B - UI details:
- Filters:
  - status
  - date range
  - plate
  - staff
- Table columns:
  - session code
  - entry plate
  - exit plate
  - reason
  - status
  - created by
  - created at
- Detail:
  - session summary
  - card/slot info
  - notes

Phase C - API integration:
- Load mismatch pending list when backend endpoint is available.
- Confirm mismatch.
- Reject mismatch with reason.
- Handle case already resolved.

Functional flow:
1. Manager opens mismatch page.
2. Selects pending case/session.
3. Compares entry/exit plate.
4. Confirms or rejects.
5. Backend updates session/case state.
6. Staff can continue exit after confirmation if needed.

Acceptance:
- Confirm/reject requires explicit user action.
- Reject requires reason.
- Page shows clear audit context.

### 5.8 ReportsPage

Route:
- `/manager/reports`

Priority:
- Must

Backend dependency:
- Sprint 5:
  - `F057 Revenue Report`
  - `F058 Traffic Report`
  - `F059 Occupancy Report`
  - `F060 Card/Session Report`
  - optional `F062 Excel Export`

APIs:
- `GET /api/support/reports/revenue`
- `GET /api/support/reports/traffic`
- `GET /api/support/reports/occupancy`
- `GET /api/support/reports/cards`
- `GET /api/support/reports/sessions`
- Optional: `GET /api/support/reports/export-excel`

Purpose:
- Manager xem báo cáo vận hành và doanh thu.

Phase A - Page shell:
- Report tabs:
  - Revenue
  - Traffic
  - Occupancy
  - Cards
  - Sessions
- Date range picker.
- Mock charts/tables.

Phase B - UI details:
- Revenue tab:
  - total revenue
  - revenue by day
  - revenue by vehicle type
- Traffic tab:
  - entries/exits by time
  - peak hours
- Occupancy tab:
  - occupancy by floor/area
  - available vs occupied
- Cards tab:
  - card status counts
  - card usage
- Sessions tab:
  - completed/active/cancelled counts
  - session list if provided

Phase C - API integration:
- Each tab lazy-loads its own API.
- Date range shared across tabs.
- Export button only visible if API available.
- Handle large result with pagination or server aggregation.

Functional flow:
1. Manager opens reports.
2. Selects date range.
3. Opens a report tab.
4. Frontend loads relevant report.
5. Manager exports if supported.

Acceptance:
- Switching tabs does not wipe date range.
- Charts handle empty/zero data.
- Reports are read-only.

### 5.9 AuditLogPage

Route:
- `/manager/audit-logs`

Priority:
- Must

Backend dependency:
- Sprint 5:
  - `F054 Search Audit Logs`
  - `F055 View Audit Log Detail`

APIs:
- `GET /api/support/audit-logs`
- `GET /api/support/audit-logs/{id}`

Purpose:
- Manager/Admin search audit logs.

Phase A - Page shell:
- Audit search filters.
- Audit table.
- Detail drawer.
- Mock audit rows.

Phase B - UI details:
- Filters:
  - actor user
  - action
  - target type
  - target id
  - source service
  - date range
- Table columns:
  - created at
  - actor
  - source service
  - action
  - target
  - reason
- Detail:
  - old value JSON
  - new value JSON
  - metadata

Phase C - API integration:
- Search audit with filters/pagination.
- View detail by id.
- Pretty-print JSON safely.
- Optional export hidden unless API exists.

Functional flow:
1. Manager opens audit page.
2. Enters filters.
3. Frontend loads audit logs.
4. Manager opens detail.
5. UI shows before/after values.

Acceptance:
- Audit page is read-only.
- Large JSON does not break layout.
- Empty result is clear.

## 6. Admin Pages

### 6.1 UserManagementPage

Route:
- `/admin/users`

Priority:
- Must

Backend dependency:
- Sprint 2: `F013 Manage Internal Users`.
- Auth dependency: Sprint 1 `F009`, `F010`.

APIs:
- `GET /api/core/users`
- `POST /api/core/users`
- `GET /api/core/users/{id}`
- `PUT /api/core/users/{id}`
- `PATCH /api/core/users/{id}/status`
- `PATCH /api/core/users/{id}/role`

Purpose:
- Admin quản lý tài khoản nội bộ.

Phase A - Page shell:
- Users table.
- Create/edit user modal.
- Change role/status modal.
- Mock users.

Phase B - Form UX:
- Fields:
  - full name
  - username
  - email
  - phone
  - role
  - status
  - password for create/reset if backend supports
- Validation:
  - username required
  - full name required
  - role required
  - valid email if provided
  - phone format if provided

Phase C - API integration:
- Load users with filters.
- Create user.
- Update profile fields.
- Change role.
- Lock/unlock/inactive status.
- Handle duplicate username/email/phone.

Functional flow - create user:
1. Admin opens create modal.
2. Enters user info.
3. Frontend validates.
4. Backend creates user.
5. Table refreshes.

Functional flow - lock user:
1. Admin selects user.
2. Chooses status LOCKED/INACTIVE.
3. Confirms action.
4. Backend updates status.
5. UI updates badge.

Acceptance:
- Only ADMIN can access.
- Admin cannot accidentally demote/lock self without explicit confirmation if backend allows.
- Role and status changes are separated from general edit.

### 6.2 SessionAdministrationPage

Route:
- `/admin/sessions`

Priority:
- Must

Backend dependency:
- Sprint 4:
  - `F051 Cancel Active Session`
  - `F052 Move Session Slot`
  - `F039 Search Active Session By Card Code`

APIs:
- `GET /api/core/parking-sessions/search`
- `GET /api/core/parking-sessions/{id}`
- `POST /api/core/parking-sessions/{id}/cancel`
- `POST /api/core/parking-sessions/{id}/move-slot`
- Supporting:
  - `GET /api/core/slots`

Purpose:
- Admin xử lý session lỗi/demo: tìm, hủy, chuyển slot.

Phase A - Page shell:
- Session search table.
- Detail drawer.
- Cancel modal.
- Move slot modal.

Phase B - UI details:
- Filters:
  - session code
  - card code
  - plate
  - status
  - payment status
  - entry date range
- Cancel modal:
  - reason required
  - show consequences: release card/slot, cancel pending payment
- Move slot modal:
  - current slot
  - target available slot
  - reason required

Phase C - API integration:
- Search sessions.
- Cancel active session.
- Move active session slot.
- Handle:
  - session not active
  - target slot not available
  - missing reason
  - concurrent state changed

Functional flow - cancel:
1. Admin searches session.
2. Opens detail.
3. Clicks Cancel.
4. Enters reason.
5. Backend cancels session and releases card/slot.
6. UI refreshes row/detail.

Functional flow - move slot:
1. Admin opens active session.
2. Clicks Move Slot.
3. Selects target slot.
4. Enters reason.
5. Backend moves session.
6. UI refreshes old/new slot info.

Acceptance:
- Cancel and move require reason.
- Destructive actions have confirmation.
- Only ADMIN can access page.

### 6.3 AdminAuditLogPage

Route:
- `/admin/audit-logs`

Priority:
- Must

Backend dependency:
- Sprint 5:
  - `F054 Search Audit Logs`
  - `F055 View Audit Log Detail`

APIs:
- `GET /api/support/audit-logs`
- `GET /api/support/audit-logs/{id}`

Purpose:
- Admin audit view. Reuse phần lớn `AuditLogPage`, nhưng admin có thể thấy đầy đủ hơn nếu backend phân quyền.

Phase A - Page shell:
- Reuse `AuditLogPage` component with `adminMode`.
- Add admin route guard.
- Mock full audit dataset.

Phase B - UI details:
- Same filters as manager audit.
- Additional admin-friendly filters if backend supports:
  - user role
  - service
  - severity/action group
- Detail drawer supports full JSON.

Phase C - API integration:
- Reuse `supportApi.searchAuditLogs`.
- Reuse `supportApi.getAuditLogDetail`.
- If backend returns extra fields for admin, render optional fields.

Functional flow:
1. Admin opens audit logs.
2. Filters by actor/action/date.
3. Opens detail.
4. Reviews old/new values.

Acceptance:
- Admin route protected by ADMIN only.
- No mutation actions are available.
- Reuse common audit components instead of duplicating Manager page.

## 7. Cross-Page Test Checklist

Use this checklist for every page before marking done:

- Route loads by direct URL.
- Role guard correct.
- Loading state exists.
- Empty state exists.
- API error state exists.
- Validation errors are visible near fields.
- Success toast or success state exists for mutations.
- Destructive actions require confirmation.
- Tables handle pagination/filter reset.
- No page calls the wrong backend owner:
  - write/core flow -> `.NET coreApi`
  - public/support read -> `Spring publicApi/supportApi`
- No frontend writes directly to database.

## 8. MVP Completion Definition

Frontend MVP is considered complete when:

- Foundation tasks `FE-FND-01` to `FE-FND-05` are done.
- 21 Must pages have Phase A and Phase B done.
- Pages whose backend APIs exist have Phase C done.
- Sprint 3/4/5 pages are not blocked by missing backend without a clear mock/integration note.
- Main demo flows pass:
  - login
  - public pricing/available slots
  - card management
  - structure/pricing setup
  - entry
  - exit with cash payment
  - lost card case and approval
  - mismatch approval
  - dashboard/report/audit read
