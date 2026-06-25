# Frontend Sprint 3-5 Worklog

Ngay cap nhat: 2026-06-16

Tai lieu nay tom tat cac phan frontend da thuc hien cho Sprint 3-5, bao gom cac page nghiep vu con thieu, mock API, simulator cong vao/ra va cac cai tien UI. Tai lieu khong bao gom noi dung lien quan den viec khoi phuc code tu AI khac.

## 1. Bo sung page va route frontend

### Staff

- Them trang `/staff/exit` cho nhan vien xu ly cong ra:
  - Tim active parking session bang ma the hoac bien so.
  - Hien thi thong tin xe, the, slot, thoi diem vao va trang thai ve thang.
  - Tinh phi tam tinh dua tren thoi gian vao/ra va pricing snapshot.
  - Ho tro thanh toan tien mat.
  - Ho tro mien phi/waive neu xe co monthly pass con hieu luc.
  - Hien thi receipt modal sau khi hoan tat exit.
  - Sau exit thanh cong, mock flow cap nhat session thanh `COMPLETED`, the ve `AVAILABLE`, slot ve `AVAILABLE`.

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
  - Khi approve, mock flow khoa the bi mat va ghi audit log.

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

## 2. Service layer va mock API

- Them service modules cho cac nhom nghiep vu moi:
  - Staff session/exit.
  - Reports.
  - Lost-card approvals.
  - Plate-mismatch approvals.
  - Audit logs.
  - Admin session control.
  - Public QR lookup.
  - Gate simulator bus.

- Mo rong MSW/localStorage mock:
  - Active sessions.
  - Payments.
  - Receipts.
  - Lost-card cases.
  - Plate-mismatch cases.
  - Audit logs.
  - Report series.

- Them mock flags trong `.env` va `.env.local` de demo frontend khi backend chua co du endpoint.

- Cac endpoint mock chinh da them:
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

## 3. Gate simulator cho Entry/Exit

- Them trang noi bo `/simulator/gate`, chay cung frontend/Vite port hien tai.

- Them event bus noi bo:
  - `sendGateScanEvent(event)`
  - `subscribeGateScanEvents(handler)`
  - `getLastGateScanEvent()`
  - `clearLastGateScanEvent()`

- Simulator phat du lieu sang Staff Entry/Exit bang `BroadcastChannel`, kem fallback `localStorage` de reload van doc duoc event moi nhat.

- Schema su kien ho tro:
  - `gateType`: `ENTRY` hoac `EXIT`
  - `scanType`: `CARD`, `BOOKING_QR`, `PLATE_ONLY`
  - `cardCode`, `bookingId`, `qrToken`, `detectedPlate`, `vehicleTypeName`
  - `plateConfidence`, `gateCode`, `capturedAt`, `source`
  - `plateImageDataUrl`, `vehicleImageDataUrl`, `driverImageDataUrl`

- UI simulator gom:
  - Chon cong Entry/Exit.
  - Chon kieu quet the NFC, QR booking hoac bien so.
  - Form nhap ma the, booking/QR, bien so OCR, loai xe, do tin cay OCR, ma lan.
  - Upload va preview anh bien so, anh toan xe, anh nguoi lai.
  - Preset demo nhu `CARD-0002`, `BK-100001`, `qr-card-0002`.
  - Panel raw JSON truoc khi gui.

- Bo sung logic resize anh input cho simulator:
  - Anh upload duoc resize ve kich thuoc demo hop ly truoc khi luu/send.
  - Giam nguy co localStorage payload qua lon.
  - Han che loi giao dien khi import anh kich thuoc lon.

## 4. Tich hop simulator voi Staff Entry va Staff Exit

### Staff Entry

- Lang nghe event `gateType=ENTRY`.
- Neu `scanType=CARD`:
  - Chuyen sang tab quet the.
  - Dien ma the, bien so, loai xe va anh OCR.
- Neu `scanType=BOOKING_QR`:
  - Chuyen sang tab QR booking.
  - Tu chon booking neu tim thay trong danh sach paid bookings.
  - Bao warning neu khong tim thay booking phu hop.
- Hien thi banner du lieu tu simulator.
- Staff van phai xac nhan tao phien vao bai, simulator khong bypass nghiep vu.

### Staff Exit

- Lang nghe event `gateType=EXIT`.
- Prefill ma the/bien so va tu tim active session khi co ma the.
- Hien thi anh thiet bi gui len cung thong tin phien.
- Neu bien so OCR khac bien so cua active session, hien thi canh bao mismatch.
- Staff co the chuyen sang flow tao plate-mismatch case.
- Simulator khong goi truc tiep API exit/thanh toan.

## 5. Cai tien UI va layout

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

## 6. Kiem thu da chay

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
  - `/simulator/gate`

- Da kiem tra flow simulator:
  - Entry card prefill sang Staff Entry.
  - Entry booking QR prefill/chon booking.
  - Exit card prefill va tim active session.
  - Exit mismatch hien canh bao.
  - Reload Staff page van doc duoc event gan nhat tu localStorage fallback.

- Da kiem tra UI:
  - Desktop nav/sidebar khong bi keo dai theo page content.
  - Desktop body khong scroll, main scroll rieng.
  - Mobile khong bi tran ngang.
  - Mobile bottom nav va drawer hien thi on.

## 7. Ghi chu ky thuat

- Day la frontend-only/demo work; backend that co the can implement endpoint tuong ung sau.
- CSV duoc dung nhu dinh dang export Excel cho sprint nay, khong them dependency moi.
- Simulator la cong cu noi bo, khong public cho khach.
- Cac flow nhay cam nhu exit, lost-card, mismatch va admin intervention van yeu cau nguoi dung xac nhan tren man hinh nghiep vu.
