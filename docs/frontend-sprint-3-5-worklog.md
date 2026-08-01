# Frontend Sprint 3-5 Worklog

Ngay cap nhat: 2026-06-16

Tai lieu nay tom tat cac phan frontend da thuc hien cho Sprint 3-5, bao gom cac page nghiep vu, tich hop API va cac cai tien UI. Tai lieu khong bao gom noi dung lien quan den viec khoi phuc code tu AI khac.

## 1. Bo sung page va route frontend

### Staff

- Them trang `/staff/exit` cho nhan vien xu ly cong ra:
  - Tim active parking session bang ma the hoac bien so.
  - Hien thi thong tin xe, the, slot, thoi diem vao va trang thai ve thang.
  - Tinh phi tam tinh dua tren thoi gian vao/ra va pricing snapshot.
  - Ho tro thanh toan tien mat.
  - Ho tro mien phi/waive neu xe co monthly pass con hieu luc.
  - Hien thi receipt modal sau khi hoan tat exit.
  - Sau exit thanh cong, backend cap nhat session thanh `COMPLETED`, the ve `AVAILABLE`, slot ve `AVAILABLE`.

- Them trang `/staff/lost-card`:
  - Tim active session.
  - Nhap nguoi bao mat the, thong tin xac minh va ly do.
  - Tao lost-card case cho Manager phe duyet.

- Them trang `/staff/sessions`:
  - Danh sach active sessions.
  - Loc theo ma the, bien so, trang thai thanh toan va loai xe.
  - Co shortcut sang cong ra va bao mat the.

### Manager

- Them trang `/manager/reports`:
  - KPI doanh thu, luot xe, occupancy.
  - Bieu do revenue, traffic va occupancy bang Recharts.
  - Loc khoang ngay.
  - Xuat bao cao CSV mo duoc bang Excel.

- Them trang `/manager/lost-card-approvals`:
  - Xem danh sach lost-card case dang cho duyet.
  - Mo detail dialog.
  - Approve/reject kem ly do.
  - Khi approve, backend khoa the bi mat va ghi audit log.

- Them trang `/manager/mismatch-approvals`:
  - Xu ly case bien so luc ra khong khop voi bien so/anh luc vao.
  - Detail dialog co thong tin session va bien so OCR.
  - Approve/reject kem ly do va ghi audit log.

- Them trang `/manager/audit-logs`:
  - Tra cuu audit log van hanh.
  - Loc theo thoi gian, action, actor, source va target.

### Admin

- Them trang `/admin/sessions-administration`:
  - Quan tri active sessions.
  - Force close session bi ket.
  - Cancel session bat thuong.
  - Move slot thu cong khi cam bien/slot bi sai.
  - Moi thao tac bat buoc co reason va ghi audit log.

- Them trang `/admin/audit-logs`:
  - Xem audit log cap he thong.
  - Hien thi day du hanh dong bao mat/admin.

### Public

- Them trang `/card/:qrToken`:
  - Public QR lookup khong can dang nhap.
  - Hien thi active session theo QR token.
  - Hien thi thoi gian do, phi tam tinh va trang thai thanh toan.
  - Co empty/error state neu QR token khong co active session.

## 2. Service layer va API production

- Them service modules cho cac nhom nghiep vu moi:
  - Staff session/exit.
  - Reports.
  - Lost-card approvals.
  - Plate-mismatch approvals.
  - Audit logs.
  - Admin session control.
  - Public QR lookup.

- Hoan thien tich hop API cho:
  - Active sessions.
  - Payments.
  - Receipts.
  - Lost-card cases.
  - Plate-mismatch cases.
  - Audit logs.
  - Report series.

- Cau hinh frontend goi truc tiep Core API va Support API theo tung nhom endpoint.

- Cac endpoint chinh da tich hop:
  - `GET /parking-sessions/active/search`
  - `POST /parking-sessions/:id/fee-preview`
  - `POST /payments/cash`
  - `POST /parking-sessions/:id/exit`
  - `POST /lost-card-cases`
  - `POST /plate-mismatch-cases`
  - `GET /staff/parking-sessions/active`
  - `GET /manager/lost-card-cases`
  - `PUT /manager/lost-card-cases/:id/decision`
  - `GET /manager/plate-mismatch-cases`
  - `PUT /manager/plate-mismatch-cases/:id/decision`
  - `GET /admin/parking-sessions/active`
  - `POST /admin/parking-sessions/:id/force-close`
  - `POST /admin/parking-sessions/:id/cancel`
  - `POST /admin/parking-sessions/:id/move-slot`
  - `GET /reports/summary`
  - `GET /reports/revenue`
  - `GET /reports/traffic`
  - `GET /reports/occupancy`
  - `GET /audit-logs`
  - `GET /cards/:qrToken/active-session`

## 3. Cai tien UI va layout

- Ap dung cac guideline UI/React/shadcn da cai dat de lam giao dien dong bo hon.

- Them/hoan thien `PageScaffold` va cac class app-level trong stylesheet:
  - `app-page`
  - `app-page-narrow`
  - `app-hero`
  - `app-card`
  - `app-table-card`
  - `app-kicker`
  - `app-title`
  - `app-copy`
  - `app-field-label`
  - `app-stat-value`

- Dieu chinh theme mau tong the:
  - Nen canvas sang hon.
  - Card/panel ro hon.
  - Mau primary theo huong teal/parking operations.
  - Bo sung chart colors va status styles.

- Thiet ke lai sidebar/nav:
  - Doi sidebar desktop tu style toi kho nhin sang style sang, sach va hop dashboard van hanh.
  - Active state ro bang mau teal.
  - Icon chip de scan hon.
  - User card o cuoi sidebar.
  - Mobile co bottom nav va drawer menu.

- Fix van de scroll/nav desktop:
  - Desktop app shell cao dung viewport bang `h-dvh`.
  - Sidebar cao dung viewport, khong bi keo dai theo content page.
  - Menu trong sidebar tu cuon rieng neu dai.
  - Header co dinh trong vung content.
  - Main content la vung scroll rieng tren desktop.
  - Mobile van giu body scroll tu nhien va bottom nav khong bi anh huong.

## 4. Kiem thu da chay

- Da chay `npm run build` trong `frontend`: build thanh cong.

- Da smoke test bang browser cac route chinh:
  - `/staff/exit`
  - `/staff/lost-card`
  - `/staff/sessions`
  - `/manager/reports`
  - `/manager/lost-card-approvals`
  - `/manager/mismatch-approvals`
  - `/manager/audit-logs`
  - `/admin/sessions-administration`
  - `/admin/audit-logs`
  - `/card/:qrToken`

- Da kiem tra UI:
  - Desktop nav/sidebar khong bi keo dai theo page content.
  - Desktop body khong scroll, main scroll rieng.
  - Mobile khong bi tran ngang.
  - Mobile bottom nav va drawer hien thi on.

## 5. Ghi chu ky thuat

- CSV duoc dung nhu dinh dang export Excel cho sprint nay, khong them dependency moi.
- Cac flow nhay cam nhu exit, lost-card, mismatch va admin intervention van yeu cau nguoi dung xac nhan tren man hinh nghiep vu.
