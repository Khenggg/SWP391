# Danh muc module va tinh nang he thong

## Phan loai uu tien test E2E

### P1 - Uu tien test truoc, it chong cheo

- `[TRANG CONG KHAI]` - Ly do uu tien: read-only, it ghi DB, it phu thuoc cross-flow.
- `[XAC THUC VA PHAN QUYEN]` - Ly do uu tien: flow nen tang, gon, it side effect.
- `[QUAN LY NGUOI DUNG]` - Ly do uu tien: CRUD tuong doi tach biet, it dung session/slot/payment.
- `[QUAN LY BANG GIA]` - Ly do uu tien: CRUD doc lap, de seed data, chua keo full parking flow.
- `[QUAN LY CAU TRUC BAI XE]` - Ly do uu tien: du lieu nen, it transaction lien hoan.
- `[QUAN LY THE]` - Ly do uu tien: de test rieng, chua can chay full parking session.
- `[DASHBOARD VA BAO CAO]` - Ly do uu tien: uu tien phan read/filter/export nhe sau khi co seed on dinh.
- `[AUDIT LOG, THONG BAO VA FEEDBACK]` - Ly do uu tien: uu tien phan audit search, notification read, feedback CRUD co pham vi hep.

### P2 - Test sau P1, co transaction nhung van kiem soat duoc

- `[HO SO VA PHUONG TIEN TAI XE]` - Ly do uu tien: ghi DB trong pham vi hep, de co lap.
- `[DAT CHO TAI XE]` - Ly do uu tien: suggest/create/cancel reservation co nhieu phu thuoc hon nhung van chua cham flow exit phuc tap.
- `[VE THANG VA DON DANG KY VE THANG]` - Ly do uu tien: lien quan user/vehicle/card/payment nhung van nam trong 1 domain.
- `[QUAN TRI PHIEN GUI XE]` - Ly do uu tien: uu tien phan list/search/filter truoc mutate flow nang.
- `[API CONG KHAI VA SUPPORT API]` - Ly do uu tien: cac read projection cho driver/reservation/report nen test sau khi P1 on dinh.

### P3 - Test sau cung, chong cheo cao

- `[LUONG NHAN VIEN CHO XE VAO]` - Ly do uu tien: dung card + slot + pricing + session + audit + anh + gate.
- `[LUONG NHAN VIEN CHO XE RA]` - Ly do uu tien: flow chong cheo nhat, phu thuoc trang thai do Entry tao ra.
- `[THE VANG LAI VA THANH TOAN PAYOS]` - Ly do uu tien: them phu thuoc callback/webhook va he thong ngoai.
- `[MAT THE]` - Ly do uu tien: can session active + storage + manager approval.
- `[SAI LECH BIEN SO]` - Ly do uu tien: phu thuoc exit evidence, anh, session state.
- `[LUU TRU ANH VA TAI LIEU]` - Ly do uu tien: phu tro cho cac flow P3, de loi theo he thong luu tru ngoai.

### Thu tu chay de xuat

- P1: Public + Auth + Admin/Manager CRUD nen
- P2: Driver/Reservation/Monthly Pass + cac flow list/search domain
- P3: Entry -> Exit -> Lost Card / Mismatch -> Payment -> Dashboard cross-check

---

---
[KIEN TRUC HE THONG]
- Uu tien E2E: P2
- Duong dan file/component chinh: `frontend/`, `backend/ParkingBuilding.CoreApi/`, `backend/parking-building-support-api/`, `database/`.
- Chuc nang chi tiet: Monorepo quan ly bai do xe; React/Vite la giao dien, ASP.NET Core xu ly nghiep vu ghi/thay doi trang thai, Spring Boot cung cap du lieu doc/cong khai/bao cao, PostgreSQL luu tru du lieu dung chung.
- Muc do phu thuoc: Frontend goi `/api/core`, `/api/support`, `/api/public`; hai backend dung schema trong `database/`.
---
[XAC THUC VA PHAN QUYEN]
- Uu tien E2E: P1
- Duong dan file/component chinh: `frontend/src/services/authService.js`, `frontend/src/app/App.jsx`, `frontend/src/app/AppRoutes.jsx`, `frontend/src/pages/public/LoginPage.jsx`, `backend/ParkingBuilding.CoreApi/Controllers/AuthController.cs`, `Application/Auth/`, `Application/Authentication/`.
- Chuc nang chi tiet: Dang nhap, dang ky tai xe, kiem tra tai khoan hien tai, JWT/session/refresh token, logout, gioi han thu dang nhap/dang ky; dieu huong theo ADMIN, MANAGER, STAFF, DRIVER.
- Muc do phu thuoc: `AppRoutes.jsx` dung `RequireAuth` va `RequireRole`; API Core dung `JwtTokenGenerator`, middleware, bang `users`, `auth_sessions`, `refresh_tokens`, `revoked_access_tokens`.
---
[DIEU HUONG VA KHUNG GIAO DIEN]
- Uu tien E2E: P1
- Duong dan file/component chinh: `frontend/src/app/AppRoutes.jsx`, `frontend/src/components/layout/AppShell.jsx`, `PublicLayout.jsx`, `AuthSplitLayout.jsx`, `PageScaffold.jsx`, `NotificationBell.jsx`.
- Chuc nang chi tiet: Route public, route yeu cau dang nhap, kiem soat role, menu/sidebar theo vai tro, header/footer, chuong thong bao, trang 401/404.
- Muc do phu thuoc: Tat ca trang nghiep vu render trong `AppShell`; `AppRoutes.jsx` phu thuoc trang thai xac thuc tu `App.jsx` va `authService.js`.
---
[TRANG CONG KHAI]
- Uu tien E2E: P1
- Duong dan file/component chinh: `frontend/src/pages/public/ParkingInfoPage.jsx`, `RulesPage.jsx`, `PublicPricingPage.jsx`, `AvailableSlotsPage.jsx`, `QRLookupPage.jsx`, `RegisterPage.jsx`, `ForgotPasswordPage.jsx`, `PaymentCallbackPage.jsx`.
- Chuc nang chi tiet: Hien thi thong tin bai xe, quy dinh, bang gia, cho trong, tra cuu QR/card, dang ky, quen mat khau va nhan callback thanh toan.
- Muc do phu thuoc: Goi `publicLookupService.js`, `pricingService.js`, `parkingService.js`; nhan du lieu tu Spring Support/Public API va Core API.
---
[HO SO VA PHUONG TIEN TAI XE]
- Uu tien E2E: P2
- Duong dan file/component chinh: `frontend/src/pages/driver/DriverProfilePage.jsx`, `DriverVehiclesPage.jsx`, `DriverHistoryPage.jsx`, `frontend/src/services/driverService.js`, `vehicleService.js`, `backend/ParkingBuilding.CoreApi/Controllers/VehiclesController.cs`, `Application/Drivers/`, `Application/Vehicles/`.
- Chuc nang chi tiet: Xem/sua ho so, quan ly xe, xem lich su gui xe va lich su ra/vao xe.
- Muc do phu thuoc: Dung JWT user hien tai; phu thuoc `driver_profiles`, `vehicles`, `parking_sessions`, `vehicle_types`; Support API cung cap cac projection lich su doc.
---
[DAT CHO TAI XE]
- Uu tien E2E: P2
- Duong dan file/component chinh: `frontend/src/pages/driver/DriverBookingPage.jsx`, `DriverBookingDetailPage.jsx`, `frontend/src/components/driver/booking/`, `frontend/src/services/bookingService.js`, `reservationService.js`, `backend/ParkingBuilding.CoreApi/Controllers/ReservationsController.cs`, `Application/Reservations/`.
- Chuc nang chi tiet: Chon xe, thoi gian, vi tri; tao dat cho, thanh toan, xem chi tiet/lich su, gia han, huy, kiem tra trang thai thanh toan va check-in reservation.
- Muc do phu thuoc: Dung `reservations`, `reservation_extensions`, `payments`, `payment_attempts`, `slots`, `vehicles`; `ReservationExpiryWorker` tu dong het han; Support API cung cap active/history reservation.
---
[THE VANG LAI VA THANH TOAN PAYOS]
- Uu tien E2E: P3
- Duong dan file/component chinh: `frontend/src/pages/driver/DriverCasualCardPage.jsx`, `frontend/src/components/driver/casual/PayOSCasualPaymentModal.jsx`, `frontend/src/services/cardService.js`, `backend/ParkingBuilding.CoreApi/Controllers/CardsController.cs`, `PaymentsController.cs`, `Application/Payments/`.
- Chuc nang chi tiet: Tra cuu/quan ly the, tao lien ket thanh toan PayOS cho the/phien gui xe, nhan callback/webhook va cap nhat trang thai thanh toan.
- Muc do phu thuoc: Dung `parking_cards`, `payments`, `payment_attempts`; goi PayOS; duoc dung lai boi luong vao/ra, manager quan ly the va public QR lookup.
---
[LUONG NHAN VIEN CHO XE VAO]
- Uu tien E2E: P3
- Duong dan file/component chinh: `frontend/src/pages/staff/StaffEntryPage.jsx`, `frontend/src/components/staff/entry/`, `frontend/src/services/entryService.js`, `parkingService.js`, `backend/ParkingBuilding.CoreApi/Controllers/ParkingSessionsController.cs`, `Application/ParkingSessions/Entry/`.
- Chuc nang chi tiet: Nhap/quet RFID hoac bien so, kiem tra the/reservation, nhan anh xe/bien so, chon cong, goi y vi tri, tao phien gui xe theo MONTHLY/CASUAL/RESERVATION.
- Muc do phu thuoc: Goi `LocationSuggestionService`, `EntryService`, token thang/reservation; tao `parking_sessions` va `parking_session_images`, cap nhat `slots`/the/reservation.
---
[LUONG NHAN VIEN CHO XE RA]
- Uu tien E2E: P3
- Duong dan file/component chinh: `frontend/src/pages/staff/StaffExitPage.jsx`, `frontend/src/pages/staff/components/exit/`, `frontend/src/components/staff/exit/StaffPayOSPaymentModal.jsx`, `frontend/src/services/sessionService.js`, `backend/ParkingBuilding.CoreApi/Controllers/ExitController.cs`, `Application/ParkingSessions/`, `Application/FeeCalculation/`, `Application/Payments/`.
- Chuc nang chi tiet: Tim phien theo the/bien so, tinh phi, kiem tra bien so, thu tien mat/thanh toan online, xac nhan xe ra, xu ly monthly-pass exit.
- Muc do phu thuoc: Dung `ParkingSession`, `FeeCalculationService`, `ExitService`, `PaymentService`, `PayOsPaymentService`; cap nhat session/slot/payment/receipt/audit log.
---
[SAI LECH BIEN SO]
- Uu tien E2E: P3
- Duong dan file/component chinh: `frontend/src/pages/staff/LicensePlateMismatchPage.jsx`, `frontend/src/pages/staff/components/LicensePlateInfo.jsx`, `LicensePlateMismatchForm.jsx`, `frontend/src/pages/manager/MismatchApprovalsPage.jsx`, `MismatchCaseDetailPage.jsx`, `frontend/src/components/manager/mismatch/`, `frontend/src/services/licensePlateMismatchService.js`, `backend/ParkingBuilding.CoreApi/Controllers/PlateMismatchController.cs`, `Application/Mismatch/`.
- Chuc nang chi tiet: Tao case lech bien so khi xe ra, cung cap bang chung/ghi chu, manager duyet hoac tu choi case.
- Muc do phu thuoc: Phu thuoc `parking_sessions`, anh phien gui xe va `plate_mismatch_cases`; duoc goi tu Staff Exit va Manager Approval.
---
[MAT THE]
- Uu tien E2E: P3
- Duong dan file/component chinh: `frontend/src/pages/staff/StaffLostCardPage.jsx`, `frontend/src/components/staff/lost-card/StaffLostCardTrackingTable.jsx`, `frontend/src/pages/manager/LostCardApprovalsPage.jsx`, `frontend/src/components/manager/lost-card/`, `frontend/src/services/staffSessionService.js`, `approvalService.js`, `backend/ParkingBuilding.CoreApi/Controllers/LostCardController.cs`, `LostCardDocumentsController.cs`, `Application/LostCards/`.
- Chuc nang chi tiet: Tim session dang hoat dong, tao ho so mat the, upload tai lieu, theo doi va manager duyet/tu choi/xu ly hoan tien.
- Muc do phu thuoc: Dung `lost_card_cases`, `lost_card_case_documents`, `lost_card_refunds`, `parking_sessions`, Storage Supabase, audit log.
---
[QUAN LY THE]
- Uu tien E2E: P1
- Duong dan file/component chinh: `frontend/src/pages/manager/CardManagementPage.jsx`, `frontend/src/components/manager/card/`, `frontend/src/services/cardService.js`, `backend/ParkingBuilding.CoreApi/Controllers/CardsController.cs`, `Application/Cards/`.
- Chuc nang chi tiet: Danh sach, tao the, xem chi tiet, thay doi trang thai the, tra cuu the va session gan voi the.
- Muc do phu thuoc: Dung `parking_cards`, `parking_sessions`, `users`; Staff Entry/Exit va Public QR lookup cung su dung du lieu nay.
---
[QUAN LY CAU TRUC BAI XE]
- Uu tien E2E: P1
- Duong dan file/component chinh: `frontend/src/pages/manager/StructureManagementPage.jsx`, `frontend/src/components/manager/structure/`, `frontend/src/services/parkingService.js`, `backend/ParkingBuilding.CoreApi/Controllers/FloorsController.cs`, `AreasController.cs`, `SlotsController.cs`, `GatesController.cs`, `Application/ParkingStructure/`.
- Chuc nang chi tiet: CRUD tang, khu vuc, slot, trang thai slot, loai xe duoc phep theo khu vuc va cong vao/ra.
- Muc do phu thuoc: Dung `floors`, `areas`, `slots`, `gates`, `area_vehicle_types`, `vehicle_types`; duoc Entry, Reservation, Dashboard va Available Slots su dung.
---
[QUAN LY BANG GIA]
- Uu tien E2E: P1
- Duong dan file/component chinh: `frontend/src/pages/manager/PricingManagementPage.jsx`, `frontend/src/components/manager/pricing/`, `frontend/src/services/pricingService.js`, `backend/ParkingBuilding.CoreApi/Controllers/PricingRulesController.cs`, `Application/Pricing/`, `Application/FeeCalculation/`.
- Chuc nang chi tiet: Tao/sua/xoa/kich hoat bang gia theo loai xe va thoi gian; hien thi bang gia public; dung de tinh phi xe ra.
- Muc do phu thuoc: Dung `pricing_rules`, `vehicle_types`; bi `FeeCalculationService`, Reports va Public Pricing goi.
---
[VE THANG VA DON DANG KY VE THANG]
- Uu tien E2E: P2
- Duong dan file/component chinh: `frontend/src/pages/manager/MonthlyPassManagementPage.jsx`, `frontend/src/components/manager/monthly-pass/`, `frontend/src/components/driver/vehicles/`, `frontend/src/services/vehicleService.js`, `backend/ParkingBuilding.CoreApi/Controllers/MonthlyPassesController.cs`, `MonthlyPassApplicationsController.cs`, `Application/MonthlyPasses/`.
- Chuc nang chi tiet: Tao/sua/gia han/chuyen trang thai ve thang; nop don, duyet don, gan RFID, thanh toan online cho don ve thang.
- Muc do phu thuoc: Dung `monthly_passes`, `monthly_pass_applications`, `vehicles`, `parking_cards`, `payments`; cap token cho Entry monthly va kiem tra Monthly Exit.
---
[QUAN TRI PHIEN GUI XE]
- Uu tien E2E: P2
- Duong dan file/component chinh: `frontend/src/pages/admin/SessionsAdministrationPage.jsx`, `frontend/src/pages/staff/StaffSessionsPage.jsx`, `frontend/src/services/adminSessionService.js`, `staffSessionService.js`, `backend/ParkingBuilding.CoreApi/Controllers/SessionAdminController.cs`, `ParkingSessionsController.cs`, `Application/ParkingSessions/`.
- Chuc nang chi tiet: Tim/loc session, xem session active, huy session, chuyen slot, truy van session theo the, kiem tra session hien tai theo QR token.
- Muc do phu thuoc: Dung `parking_sessions`, `slots`, `vehicles`, `parking_cards`, payments va audit log; Staff Exit va cac approval flow doc session nay.
---
[QUAN LY NGUOI DUNG]
- Uu tien E2E: P1
- Duong dan file/component chinh: `frontend/src/pages/admin/UserManagementPage.jsx`, `frontend/src/services/userService.js`, `backend/ParkingBuilding.CoreApi/Controllers/UsersController.cs`, `Application/Users/`, `Application/Drivers/`.
- Chuc nang chi tiet: Danh sach, tao/sua user, doi role, doi trang thai, truy van hoat dong gan day; quan ly thong tin driver.
- Muc do phu thuoc: Dung `users`, `driver_profiles`; bi Authentication, Vehicles, Reservations, Monthly Passes va Audit dung.
---
[DASHBOARD VA BAO CAO]
- Uu tien E2E: P1
- Duong dan file/component chinh: `frontend/src/pages/manager/ManagerDashboardPage.jsx`, `ReportsPage.jsx`, `frontend/src/components/manager/dashboard/`, `frontend/src/components/manager/reports/`, `frontend/src/services/dashboardService.js`, `reportService.js`, `backend/parking-building-support-api/src/main/java/com/parkingbuilding/support/controller/`.
- Chuc nang chi tiet: Dashboard occupancy/revenue/traffic, bao cao doanh thu/luu luong/cong suat/the-session, bieu do va export file.
- Muc do phu thuoc: Frontend goi Support API; Spring Boot doc projection tu PostgreSQL, dung cac service report va bang session/payment/slot/card.
---
[AUDIT LOG, THONG BAO VA FEEDBACK]
- Uu tien E2E: P1
- Duong dan file/component chinh: `frontend/src/pages/manager/AuditLogsPage.jsx`, `frontend/src/pages/admin/AdminAuditLogPage.jsx`, `frontend/src/components/audit/`, `frontend/src/services/auditService.js`, `notificationService.js`, `backend/ParkingBuilding.CoreApi/Application/Audit/`, `backend/parking-building-support-api/src/main/java/com/parkingbuilding/support/controller/`.
- Chuc nang chi tiet: Ghi audit append-only cho thao tac core; tim/loc/export audit; thong bao user/chua doc; tao va quan ly feedback.
- Muc do phu thuoc: Core API goi `AuditWriterService`; Support API doc `audit_logs`, `notifications`, `feedbacks`; UI Manager/Admin dung chung `AuditLogView`.
---
[API CONG KHAI VA SUPPORT API]
- Uu tien E2E: P2
- Duong dan file/component chinh: `backend/parking-building-support-api/src/main/java/com/parkingbuilding/support/controller/`.
- Chuc nang chi tiet: Cung cap cho trong, thong tin bai, gia, quy dinh, tra cuu card/QR, du lieu driver va reservation o che do doc.
- Muc do phu thuoc: Doc PostgreSQL bang repository/shared read model; duoc Public pages, Driver pages, Staff va Manager UI goi qua `supportAxiosClient.js`/`publicAxiosClient.js`.
---
[CLIENT API PRODUCTION]
- Uu tien E2E: P2
- Duong dan file/component chinh: `frontend/src/api/`, `frontend/src/services/`.
- Chuc nang chi tiet: Chuan hoa HTTP client, timeout, token/interceptor va contract goi Core API, Public API, Support API.
- Muc do phu thuoc: Toan bo page/component nghiep vu goi backend that thong qua service va axios client tuong ung.
---
[THANH PHAN UI TAI SU DUNG]
- Uu tien E2E: P2
- Duong dan file/component chinh: `frontend/src/components/ui/`.
- Chuc nang chi tiet: Component giao dien nen tang: form, modal, toast, bang, badge, hien thi bien so va empty state.
- Muc do phu thuoc: Duoc tat ca layout, page va component nghiep vu import.
---
[HA TANG ASP.NET CORE]
- Uu tien E2E: P2
- Duong dan file/component chinh: `backend/ParkingBuilding.CoreApi/Program.cs`, `Infrastructure/Persistence/ParkingDbContext.cs`, `Infrastructure/Middleware/`, `Infrastructure/Security/`, `Contracts/Common/`.
- Chuc nang chi tiet: Dang ky DI, EF Core, JWT, CORS, Swagger, serialization enum, exception/request logging middleware, kiem tra ket noi Supabase/PostgreSQL, chuan response/error/paging.
- Muc do phu thuoc: Tat ca controller/service Core API phu thuoc DI va `ParkingDbContext`; frontend Core client goi cac endpoint duoc map qua `MapControllers()`.
---
[LUU TRU ANH VA TAI LIEU]
- Uu tien E2E: P3
- Duong dan file/component chinh: `backend/ParkingBuilding.CoreApi/Application/Storage/`, `Application/ParkingSessions/ParkingSessionImageStorageService.cs`, `Application/LostCards/Documents/`.
- Chuc nang chi tiet: Upload anh phuong tien/bien so va tai lieu mat the, tao URL ky so, upload batch tai lieu.
- Muc do phu thuoc: Dung Supabase Storage; duoc Entry, Exit, Lost Card va Mismatch flow goi.
---
[CO SO DU LIEU VA SEED]
- Uu tien E2E: P2
- Duong dan file/component chinh: `database/01_schema.sql`, `02_seed.sql`, `03_indexes_constraints.sql`, `erd.dbml`, `erd.mmd`.
- Chuc nang chi tiet: Schema/seed/index cho user-auth, driver/vehicle, card, tang-khu-slot-cong, pricing, ve thang, reservation, session, payment, receipt, lost card, mismatch, audit, notification, feedback.
- Muc do phu thuoc: La nguon du lieu cho ca hai backend; EF Core mapping cau hinh trong `Infrastructure/Persistence/Configurations/`; Spring Boot dung read model/repository.
---
[TIEN ICH FRONTEND]
- Uu tien E2E: P2
- Duong dan file/component chinh: `frontend/src/lib/format.js`, `frontend/src/lib/utils.js`, `frontend/src/utils/`, `frontend/src/constants/index.js`, `frontend/src/hooks/`, `frontend/src/styles/index.css`.
- Chuc nang chi tiet: Dinh dang tien/ngay gio, utility CSS/classname, constants role/trang thai, custom hooks va style toan cuc.
- Muc do phu thuoc: Duoc pages/components/services su dung xuyen suot.
