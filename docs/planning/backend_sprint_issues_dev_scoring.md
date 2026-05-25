# Backend Sprint Issues & Dev Scoring

> Bản issue plan dạng Markdown, nhóm theo sprint, có Dev phụ trách, Size, Score gốc và Sprint Score theo block.

## Quy tắc tính điểm

- `Score` là điểm gốc theo độ lớn issue.
- `Sprint Score = Score x Block`.
- Block theo sprint:
  - S01: 15 blocks / 1 score
  - S02: 30 blocks / 1 score
  - S03: 30 blocks / 1 score
  - S04: 20 blocks / 1 score
  - S05: 20 blocks / 1 score
  - Future: 20 blocks / 1 score
  - Out of MVP: 0

## Tổng điểm sau khi chia Dev

- **Dev 1**: 1525 điểm — OK
- **Dev 2**: 1520 điểm — OK
- **Dev 3**: 1525 điểm — OK
- **Unassigned**: 0 điểm — OUT

## Tổng điểm theo sprint

- **S01**: 420 điểm (Dev 1: 195; Dev 3: 225)
- **S02**: 1320 điểm (Dev 1: 390; Dev 2: 630; Dev 3: 300)
- **S03**: 690 điểm (Dev 1: 240; Dev 2: 330; Dev 3: 120)
- **S04**: 980 điểm (Dev 1: 460; Dev 2: 520)
- **S05**: 720 điểm (Dev 1: 40; Dev 2: 40; Dev 3: 640)
- **Future**: 440 điểm (Dev 1: 200; Dev 3: 240)
- **Out of MVP**: 0 điểm ()

---

## Sprint 1 - Foundation & Auth

**Block:** 15 | **Tổng Sprint Score:** 420

- **Dev 1:** 195 điểm
- **Dev 3:** 225 điểm

### F001 — .NET Core API Setup

**Module:** Foundation  
**Backend Owner:** .NET Core  
**Actor:** Internal  
**Priority:** P0  
**Dev phụ trách:** Dev 1  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 15 = **30**  
**Depends On:** None  
**Scope Note:** MVP bắt buộc  

**Description:**

Khởi tạo project .NET Core API, Swagger, config môi trường, health check

### F002 — Spring Boot API Setup

**Module:** Foundation  
**Backend Owner:** Spring Boot  
**Actor:** Internal  
**Priority:** P0  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 15 = **30**  
**Depends On:** None  
**Scope Note:** MVP bắt buộc  

**Description:**

Khởi tạo Spring Boot Support API, Swagger/OpenAPI, CORS, base config

### F003 — PostgreSQL Schema Baseline

**Module:** Database  
**Backend Owner:** Shared DB  
**Actor:** Internal  
**Priority:** P0  
**Dev phụ trách:** Dev 3  
**Size:** XL  
**Score gốc:** 5  
**Sprint Score:** 5 x 15 = **75**  
**Depends On:** None  
**Scope Note:** MVP bắt buộc  

**Description:**

Tạo schema PostgreSQL chính thức cho hệ thống

### F004 — Seed Baseline Data

**Module:** Database  
**Backend Owner:** Shared DB  
**Actor:** Internal  
**Priority:** P0  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 15 = **30**  
**Depends On:** F003  
**Scope Note:** MVP bắt buộc  

**Description:**

Seed admin, manager, staff, vehicle type, floor, area, slot, gate, pricing mẫu

### F005 — .NET Common Response Format

**Module:** Common  
**Backend Owner:** .NET Core  
**Actor:** Internal  
**Priority:** P0  
**Dev phụ trách:** Dev 1  
**Size:** S  
**Score gốc:** 1  
**Sprint Score:** 1 x 15 = **15**  
**Depends On:** F001  
**Scope Note:** MVP bắt buộc  

**Description:**

Chuẩn hóa ApiResponse, ErrorResponse, Pagination cho .NET

### F006 — Spring Common Response Format

**Module:** Common  
**Backend Owner:** Spring Boot  
**Actor:** Internal  
**Priority:** P0  
**Dev phụ trách:** Dev 3  
**Size:** S  
**Score gốc:** 1  
**Sprint Score:** 1 x 15 = **15**  
**Depends On:** F002  
**Scope Note:** MVP bắt buộc  

**Description:**

Chuẩn hóa ApiResponse, ErrorResponse, Pagination cho Spring

### F007 — .NET DbContext Mapping

**Module:** Persistence  
**Backend Owner:** .NET Core  
**Actor:** Internal  
**Priority:** P0  
**Dev phụ trách:** Dev 1  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 15 = **45**  
**Depends On:** F003, F004  
**Scope Note:** MVP bắt buộc  

**Description:**

Map entity, enum, table/column PostgreSQL cho .NET

### F008 — Spring JPA Read-only Mapping

**Module:** Persistence  
**Backend Owner:** Spring Boot  
**Actor:** Internal  
**Priority:** P0  
**Dev phụ trách:** Dev 3  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 15 = **45**  
**Depends On:** F003, F004  
**Scope Note:** MVP bắt buộc  

**Description:**

Map read model JPA và cấu hình ddl-auto=validate

### F009 — Login & JWT Generation

**Module:** Auth & Security  
**Backend Owner:** .NET Core  
**Actor:** Public/All  
**Priority:** P0  
**Dev phụ trách:** Dev 1  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 15 = **45**  
**Depends On:** F005, F007  
**Scope Note:** MVP bắt buộc  

**Description:**

Đăng nhập user nội bộ và cấp JWT

### F010 — Get Current User Profile

**Module:** Auth & Security  
**Backend Owner:** .NET Core  
**Actor:** Authenticated  
**Priority:** P0  
**Dev phụ trách:** Dev 1  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 15 = **30**  
**Depends On:** F009  
**Scope Note:** MVP bắt buộc  

**Description:**

Lấy thông tin user hiện tại từ JWT

### F011 — Spring JWT Verification

**Module:** Auth & Security  
**Backend Owner:** Spring Boot  
**Actor:** Authenticated  
**Priority:** P0  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 15 = **30**  
**Depends On:** F009  
**Scope Note:** MVP bắt buộc  

**Description:**

Spring verify JWT do .NET phát hành

### F012 — AuditWriterService Base

**Module:** Audit  
**Backend Owner:** .NET Core  
**Actor:** Internal  
**Priority:** P1  
**Dev phụ trách:** Dev 1  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 15 = **30**  
**Depends On:** F007  
**Scope Note:** Nên làm sớm để các flow sau dùng lại  

**Description:**

Tạo service nền để ghi audit log core .NET

---

## Sprint 2 - Master Data & Public APIs

**Block:** 30 | **Tổng Sprint Score:** 1320

- **Dev 1:** 390 điểm
- **Dev 2:** 630 điểm
- **Dev 3:** 300 điểm

### F013 — Manage Internal Users

**Module:** User Management  
**Backend Owner:** .NET Core  
**Actor:** Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 1  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 30 = **90**  
**Depends On:** F009, F010  
**Scope Note:** MVP quản trị, có thể scope nhẹ nếu trễ  

**Description:**

Admin tạo, sửa, khóa/mở user nội bộ, đổi role

### F014 — Manage Vehicle Types

**Module:** Vehicle Management  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 1  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 30 = **60**  
**Depends On:** F007, F009  
**Scope Note:** MVP bắt buộc vì slot/pricing/entry phụ thuộc  

**Description:**

Quản lý danh mục loại phương tiện

### F015 — Parking Card CRUD + QR Token

**Module:** Card Management  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 1  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 30 = **90**  
**Depends On:** F007, F009  
**Scope Note:** MVP bắt buộc  

**Description:**

Tạo và quản lý thẻ gửi xe, sinh qr_token tĩnh

### F016 — Update Card Status

**Module:** Card Management  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 1  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 30 = **60**  
**Depends On:** F015  
**Scope Note:** MVP bắt buộc  

**Description:**

Đổi trạng thái card AVAILABLE, LOST, DAMAGED, INACTIVE

### F017 — Manage Floors

**Module:** Facility Management  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 2  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 30 = **60**  
**Depends On:** F007, F009  
**Scope Note:** MVP bắt buộc  

**Description:**

Quản lý tầng gửi xe

### F018 — Manage Areas

**Module:** Facility Management  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 2  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 30 = **90**  
**Depends On:** F014, F017  
**Scope Note:** MVP bắt buộc  

**Description:**

Quản lý khu vực gửi xe và mapping loại xe được phép

### F019 — Manage Slots

**Module:** Facility Management  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 2  
**Size:** XL  
**Score gốc:** 5  
**Sprint Score:** 5 x 30 = **150**  
**Depends On:** F014, F018  
**Scope Note:** MVP bắt buộc  

**Description:**

Quản lý slot đậu xe, loại xe được phép, trạng thái slot

### F020 — Manage Gates

**Module:** Facility Management  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 2  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 30 = **60**  
**Depends On:** F017  
**Scope Note:** MVP bắt buộc  

**Description:**

Quản lý cổng vào/ra ENTRY/EXIT

### F021 — Lock/Unlock Area & Slot

**Module:** Facility Management  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 2  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 30 = **60**  
**Depends On:** F018, F019  
**Scope Note:** Nên có cho quản trị trạng thái  

**Description:**

Khóa/mở/bảo trì area hoặc slot theo rule trạng thái

### F022 — Manage Pricing Rules

**Module:** Pricing Management  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 1  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 30 = **90**  
**Depends On:** F014  
**Scope Note:** MVP bắt buộc  

**Description:**

Quản lý bảng giá theo loại xe, giá ngày/đêm/tháng/phí mất thẻ

### F023 — Monthly Pass CRUD

**Module:** Monthly Pass  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 2  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 30 = **90**  
**Depends On:** F014, F022  
**Scope Note:** Nên có cho monthly pass flow  

**Description:**

Tạo, cập nhật, đổi trạng thái vé tháng

### F024 — Renew Monthly Pass

**Module:** Monthly Pass  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 2  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 30 = **60**  
**Depends On:** F023  
**Scope Note:** Nên có, có thể scope nhẹ  

**Description:**

Gia hạn vé tháng

### F025 — Check Monthly Pass Validity

**Module:** Monthly Pass  
**Backend Owner:** .NET Core  
**Actor:** Staff/System  
**Priority:** P0  
**Dev phụ trách:** Dev 2  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 30 = **60**  
**Depends On:** F023  
**Scope Note:** MVP cần nếu demo monthly pass  

**Description:**

Kiểm tra vé tháng hợp lệ khi entry/exit

### F026 — Parking Info API

**Module:** Public Read  
**Backend Owner:** Spring Boot  
**Actor:** Public  
**Priority:** P1  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 30 = **60**  
**Depends On:** F008, F011  
**Scope Note:** Có thể làm đơn giản/static  

**Description:**

API public xem thông tin bãi xe

### F027 — Available Slots API

**Module:** Public Read  
**Backend Owner:** Spring Boot  
**Actor:** Public  
**Priority:** P0  
**Dev phụ trách:** Dev 3  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 30 = **90**  
**Depends On:** F008, F019  
**Scope Note:** MVP read-side quan trọng  

**Description:**

API public xem slot trống theo loại xe/tầng/khu

### F028 — Public Pricing API

**Module:** Public Read  
**Backend Owner:** Spring Boot  
**Actor:** Public  
**Priority:** P0  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 30 = **60**  
**Depends On:** F008, F022  
**Scope Note:** MVP read-side quan trọng  

**Description:**

API public xem bảng giá

### F029 — Public Rules API

**Module:** Public Read  
**Backend Owner:** Spring Boot  
**Actor:** Public  
**Priority:** P1  
**Dev phụ trách:** Dev 3  
**Size:** S  
**Score gốc:** 1  
**Sprint Score:** 1 x 30 = **30**  
**Depends On:** F008  
**Scope Note:** Có thể static/config  

**Description:**

API public xem quy định bãi xe

### F030 — Read Repository Validation

**Module:** Spring Read Model  
**Backend Owner:** Spring Boot  
**Actor:** Internal  
**Priority:** P1  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 30 = **60**  
**Depends On:** F008, F027, F028  
**Scope Note:** Technical guard để tránh ghi nhầm  

**Description:**

Kiểm tra repository Spring chỉ đọc core tables, không save/delete

---

## Sprint 3 - Entry Flow

**Block:** 30 | **Tổng Sprint Score:** 690

- **Dev 1:** 240 điểm
- **Dev 2:** 330 điểm
- **Dev 3:** 120 điểm

### F031 — Slot Suggestion

**Module:** Entry  
**Backend Owner:** .NET Core  
**Actor:** Staff/Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 2  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 30 = **90**  
**Depends On:** F019, F020  
**Scope Note:** MVP bắt buộc cho entry flow  

**Description:**

Gợi ý area/slot phù hợp theo loại xe, availability, priority

### F032 — Entry Validation

**Module:** Entry  
**Backend Owner:** .NET Core  
**Actor:** Staff/Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 1  
**Size:** XL  
**Score gốc:** 5  
**Sprint Score:** 5 x 30 = **150**  
**Depends On:** F015, F019, F022, F025  
**Scope Note:** MVP bắt buộc  

**Description:**

Validate card available, slot available, duplicate plate, monthly pass, pricing snapshot

### F033 — Create Entry Transaction

**Module:** Entry  
**Backend Owner:** .NET Core  
**Actor:** Staff/Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 2  
**Size:** XXL  
**Score gốc:** 6  
**Sprint Score:** 6 x 30 = **180**  
**Depends On:** F031, F032  
**Scope Note:** MVP bắt buộc  

**Description:**

Tạo parking_session trong transaction .NET

### F034 — Update Card/Slot State On Entry

**Module:** Entry  
**Backend Owner:** .NET Core  
**Actor:** Staff/Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 2  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 30 = **60**  
**Depends On:** F033  
**Scope Note:** MVP bắt buộc  

**Description:**

Đổi card sang IN_USE, slot sang OCCUPIED sau khi entry thành công

### F035 — Save Pricing Snapshot

**Module:** Entry  
**Backend Owner:** .NET Core  
**Actor:** System  
**Priority:** P0  
**Dev phụ trách:** Dev 1  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 30 = **60**  
**Depends On:** F022, F033  
**Scope Note:** MVP bắt buộc để tính phí đúng  

**Description:**

Lưu snapshot giá vào parking_session tại thời điểm entry

### F036 — Entry Audit Log

**Module:** Audit  
**Backend Owner:** .NET Core  
**Actor:** System  
**Priority:** P1  
**Dev phụ trách:** Dev 1  
**Size:** S  
**Score gốc:** 1  
**Sprint Score:** 1 x 30 = **30**  
**Depends On:** F012, F033  
**Scope Note:** Nên có  

**Description:**

Ghi SESSION_CREATED audit log khi entry thành công

### F037 — Public QR Active Session Lookup

**Module:** Public QR Lookup  
**Backend Owner:** Spring Boot  
**Actor:** Public/Driver  
**Priority:** P1  
**Dev phụ trách:** Dev 3  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 30 = **90**  
**Depends On:** F015, F033  
**Scope Note:** MVP nên có cho demo QR  

**Description:**

Tra cứu session active bằng qrToken, mask dữ liệu nhạy cảm

### F038 — QR Privacy Tests

**Module:** Public QR Lookup  
**Backend Owner:** Spring Boot  
**Actor:** Internal  
**Priority:** P1  
**Dev phụ trách:** Dev 3  
**Size:** S  
**Score gốc:** 1  
**Sprint Score:** 1 x 30 = **30**  
**Depends On:** F037  
**Scope Note:** Test/security  

**Description:**

Test QR lookup không lộ phone/email/staff/full sensitive data

---

## Sprint 4 - Exit Payment & Exceptions

**Block:** 20 | **Tổng Sprint Score:** 980

- **Dev 1:** 460 điểm
- **Dev 2:** 520 điểm

### F039 — Search Active Session By Card Code

**Module:** Session  
**Backend Owner:** .NET Core  
**Actor:** Staff/Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 2  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F033  
**Scope Note:** MVP bắt buộc cho exit  

**Description:**

Staff tìm session active bằng mã thẻ khi xe ra

### F040 — Calculate Parking Fee

**Module:** Fee Calculation  
**Backend Owner:** .NET Core  
**Actor:** Staff/System  
**Priority:** P0  
**Dev phụ trách:** Dev 1  
**Size:** XL  
**Score gốc:** 5  
**Sprint Score:** 5 x 20 = **100**  
**Depends On:** F035, F039  
**Scope Note:** MVP bắt buộc  

**Description:**

Tính phí gửi xe theo snapshot giá và exit time

### F041 — Cash Payment Processing

**Module:** Payment  
**Backend Owner:** .NET Core  
**Actor:** Staff/Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 1  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 20 = **60**  
**Depends On:** F040  
**Scope Note:** MVP bắt buộc  

**Description:**

Staff thu tiền mặt và ghi nhận payment PAID

### F042 — Waive Payment

**Module:** Payment  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 1  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F040  
**Scope Note:** Có thể cần cho monthly pass/exception  

**Description:**

Manager/Admin miễn payment khi hợp lệ, ví dụ monthly pass

### F043 — Generate Receipt

**Module:** Receipt  
**Backend Owner:** .NET Core  
**Actor:** Staff/Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 1  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 20 = **60**  
**Depends On:** F041  
**Scope Note:** MVP bắt buộc  

**Description:**

Tạo hóa đơn sau payment hoặc receipt 0đ cho monthly pass

### F044 — Reprint Receipt

**Module:** Receipt  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 1  
**Size:** S  
**Score gốc:** 1  
**Sprint Score:** 1 x 20 = **20**  
**Depends On:** F043  
**Scope Note:** Nên có, không chặn demo core  

**Description:**

In lại receipt, có reason và audit

### F045 — Complete Casual Exit

**Module:** Exit  
**Backend Owner:** .NET Core  
**Actor:** Staff/Manager/Admin  
**Priority:** P0  
**Dev phụ trách:** Dev 2  
**Size:** XXL  
**Score gốc:** 6  
**Sprint Score:** 6 x 20 = **120**  
**Depends On:** F039, F041, F043  
**Scope Note:** MVP bắt buộc  

**Description:**

Complete session, release card/slot, tạo receipt, ghi audit

### F046 — Complete Monthly Pass Exit

**Module:** Exit  
**Backend Owner:** .NET Core  
**Actor:** Staff/Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 1  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 20 = **60**  
**Depends On:** F025, F039, F043  
**Scope Note:** Nên có nếu demo monthly pass  

**Description:**

Xe vé tháng ra, không cần cash payment, tạo receipt 0đ

### F047 — Create Lost Card Case

**Module:** Incident - Lost Card  
**Backend Owner:** .NET Core  
**Actor:** Staff  
**Priority:** P1  
**Dev phụ trách:** Dev 1  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 20 = **60**  
**Depends On:** F039, F040  
**Scope Note:** Nên có sau core exit  

**Description:**

Staff tạo hồ sơ mất thẻ, session chuyển LOST_CARD_PENDING

### F048 — Approve/Reject Lost Card

**Module:** Incident - Lost Card  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 2  
**Size:** XL  
**Score gốc:** 5  
**Sprint Score:** 5 x 20 = **100**  
**Depends On:** F047  
**Scope Note:** Nên có sau create case  

**Description:**

Manager/Admin duyệt hoặc từ chối mất thẻ, áp phí nếu duyệt

### F049 — Detect Plate Mismatch

**Module:** Incident - Plate Mismatch  
**Backend Owner:** .NET Core  
**Actor:** Staff/System  
**Priority:** P1  
**Dev phụ trách:** Dev 1  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 20 = **60**  
**Depends On:** F039, F045  
**Scope Note:** Nên có sau core exit  

**Description:**

Phát hiện biển số ra khác biển số vào và tạo pending case

### F050 — Resolve Plate Mismatch

**Module:** Incident - Plate Mismatch  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 2  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 20 = **60**  
**Depends On:** F049  
**Scope Note:** Nên có  

**Description:**

Manager/Admin confirm hoặc reject mismatch

### F051 — Cancel Active Session

**Module:** Session Admin  
**Backend Owner:** .NET Core  
**Actor:** Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 2  
**Size:** XL  
**Score gốc:** 5  
**Sprint Score:** 5 x 20 = **100**  
**Depends On:** F033, F039  
**Scope Note:** Nên có cho xử lý lỗi demo  

**Description:**

Admin hủy session lỗi và giải phóng card/slot

### F052 — Move Session Slot

**Module:** Session Admin  
**Backend Owner:** .NET Core  
**Actor:** Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 2  
**Size:** XL  
**Score gốc:** 5  
**Sprint Score:** 5 x 20 = **100**  
**Depends On:** F019, F033  
**Scope Note:** Nên có nhưng không chặn core exit  

**Description:**

Chuyển session đang active sang slot khác, update slot cũ/mới, audit

---

## Sprint 5 - Reports, Testing & Demo

**Block:** 20 | **Tổng Sprint Score:** 720

- **Dev 1:** 40 điểm
- **Dev 2:** 40 điểm
- **Dev 3:** 640 điểm

### F053 — Write Required Core Audit Actions

**Module:** Audit  
**Backend Owner:** .NET Core  
**Actor:** System  
**Priority:** P1  
**Dev phụ trách:** Dev 2  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F012, F036, F045, F047, F049  
**Scope Note:** Internal task, không phải API riêng  

**Description:**

Gắn audit action cho user, card, session, payment, receipt, monthly pass, lost card, mismatch, pricing

### F054 — Search Audit Logs

**Module:** Audit  
**Backend Owner:** Spring Boot  
**Actor:** Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F053  
**Scope Note:** MVP quản trị/read-side  

**Description:**

Search audit log theo actor, action, target, date range

### F055 — View Audit Log Detail

**Module:** Audit  
**Backend Owner:** Spring Boot  
**Actor:** Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 3  
**Size:** S  
**Score gốc:** 1  
**Sprint Score:** 1 x 20 = **20**  
**Depends On:** F054  
**Scope Note:** MVP quản trị/read-side  

**Description:**

Xem chi tiết audit log

### F056 — Operational Dashboard

**Module:** Dashboard  
**Backend Owner:** Spring Boot  
**Actor:** Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 3  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 20 = **60**  
**Depends On:** F033, F045, F047, F049  
**Scope Note:** MVP read-side  

**Description:**

Thống kê slot, xe vào/ra, revenue, card status, pending cases

### F057 — Revenue Report

**Module:** Reports  
**Backend Owner:** Spring Boot  
**Actor:** Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 3  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 20 = **60**  
**Depends On:** F041, F045  
**Scope Note:** MVP read-side  

**Description:**

Báo cáo doanh thu theo khoảng thời gian

### F058 — Traffic Report

**Module:** Reports  
**Backend Owner:** Spring Boot  
**Actor:** Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 3  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 20 = **60**  
**Depends On:** F033, F045  
**Scope Note:** MVP read-side  

**Description:**

Báo cáo lượt xe vào/ra theo thời gian

### F059 — Occupancy Report

**Module:** Reports  
**Backend Owner:** Spring Boot  
**Actor:** Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 3  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 20 = **60**  
**Depends On:** F019, F033, F045  
**Scope Note:** MVP read-side  

**Description:**

Báo cáo tỷ lệ lấp đầy theo area/slot

### F060 — Card/Session Report

**Module:** Reports  
**Backend Owner:** Spring Boot  
**Actor:** Manager/Admin  
**Priority:** P1  
**Dev phụ trách:** Dev 3  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 20 = **60**  
**Depends On:** F015, F033, F045  
**Scope Note:** MVP read-side  

**Description:**

Báo cáo trạng thái card và danh sách session

### F061 — Public API Hardening After Exit

**Module:** Public Read  
**Backend Owner:** Spring Boot  
**Actor:** Public  
**Priority:** P1  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F037, F045  
**Scope Note:** Nên làm để demo ổn định  

**Description:**

Cập nhật public available slots/QR lookup khi session completed/no active

### F062 — Excel Export

**Module:** Export Report  
**Backend Owner:** Spring Boot  
**Actor:** Manager/Admin  
**Priority:** P2  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F057, F058, F059, F060  
**Scope Note:** Optional, cắt nếu trễ  

**Description:**

Xuất report Excel bằng Spring Boot

### F063 — Excel Export

**Module:** Export Audit  
**Backend Owner:** Spring Boot  
**Actor:** Admin  
**Priority:** P2  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F054, F055  
**Scope Note:** Optional, cắt nếu trễ  

**Description:**

Xuất audit log Excel

### F064 — Postman Full Backend Flow

**Module:** Testing  
**Backend Owner:** Shared Backend  
**Actor:** Internal  
**Priority:** P0  
**Dev phụ trách:** Dev 3  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 20 = **60**  
**Depends On:** F009, F033, F045  
**Scope Note:** MVP bắt buộc cho demo/test  

**Description:**

Tạo/update Postman collection cho auth -> entry -> fee -> payment -> exit -> receipt

### F065 — .NET Master Data Tests

**Module:** Testing  
**Backend Owner:** .NET Core  
**Actor:** Internal  
**Priority:** P1  
**Dev phụ trách:** Dev 1  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F013, F015, F022, F023  
**Scope Note:** Backend quality  

**Description:**

Test auth, user, card, pricing, monthly pass

### F066 — .NET Transaction Tests

**Module:** Testing  
**Backend Owner:** .NET Core  
**Actor:** Internal  
**Priority:** P1  
**Dev phụ trách:** Dev 3  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 20 = **60**  
**Depends On:** F033, F045, F047, F049, F051  
**Scope Note:** Backend quality  

**Description:**

Test entry, exit, payment, receipt, lost card, mismatch, cancel

### F067 — Spring Read/Report Tests

**Module:** Testing  
**Backend Owner:** Spring Boot  
**Actor:** Internal  
**Priority:** P1  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F054, F056, F057  
**Scope Note:** Backend quality  

**Description:**

Test public API, audit search, dashboard, reports

---

## Future / Should Have / Could Have

**Block:** 20 | **Tổng Sprint Score:** 440

- **Dev 1:** 200 điểm
- **Dev 3:** 240 điểm

### F068 — Driver Registration

**Module:** Driver Account  
**Backend Owner:** .NET Core  
**Actor:** Driver  
**Priority:** P2  
**Dev phụ trách:** Dev 1  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 20 = **60**  
**Depends On:** F009  
**Scope Note:** Should Have, không chặn MVP  

**Description:**

Driver tự đăng ký tài khoản

### F069 — Driver Profile

**Module:** Driver Account  
**Backend Owner:** .NET Core  
**Actor:** Driver  
**Priority:** P2  
**Dev phụ trách:** Dev 1  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F068  
**Scope Note:** Should Have  

**Description:**

Driver xem/cập nhật profile

### F070 — Driver Vehicle Management

**Module:** Driver Vehicle  
**Backend Owner:** .NET Core  
**Actor:** Driver  
**Priority:** P2  
**Dev phụ trách:** Dev 1  
**Size:** L  
**Score gốc:** 3  
**Sprint Score:** 3 x 20 = **60**  
**Depends On:** F068, F014  
**Scope Note:** Should Have  

**Description:**

Driver thêm/sửa/xem xe cá nhân

### F071 — Driver Parking History

**Module:** Driver History  
**Backend Owner:** .NET Core  
**Actor:** Driver  
**Priority:** P2  
**Dev phụ trách:** Dev 1  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F068, F033, F045  
**Scope Note:** Should Have  

**Description:**

Driver xem lịch sử gửi xe

### F072 — Submit Feedback

**Module:** Feedback  
**Backend Owner:** Spring Boot  
**Actor:** Driver/Public  
**Priority:** P2  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F011  
**Scope Note:** Could Have  

**Description:**

Driver/public gửi phản hồi

### F073 — Manage Feedback

**Module:** Feedback  
**Backend Owner:** Spring Boot  
**Actor:** Manager/Admin  
**Priority:** P2  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F072  
**Scope Note:** Could Have  

**Description:**

Manager xử lý feedback

### F074 — Send System Notifications

**Module:** Notification  
**Backend Owner:** Spring Boot  
**Actor:** System  
**Priority:** P2  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F023  
**Scope Note:** Could Have  

**Description:**

Gửi thông báo nhắc nhở sắp hết hạn vé tháng hoặc cảnh báo vận hành

### F075 — Mock Camera Event

**Module:** Mock Device  
**Backend Owner:** Spring Boot  
**Actor:** System  
**Priority:** P2  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F002  
**Scope Note:** Optional demo support  

**Description:**

Giả lập camera scan biển số

### F076 — Mock RFID Event

**Module:** Mock Device  
**Backend Owner:** Spring Boot  
**Actor:** System  
**Priority:** P2  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F015  
**Scope Note:** Optional demo support  

**Description:**

Giả lập RFID/card scan

### F077 — Mock Barrier Control

**Module:** Mock Device  
**Backend Owner:** Spring Boot  
**Actor:** System  
**Priority:** P2  
**Dev phụ trách:** Dev 3  
**Size:** M  
**Score gốc:** 2  
**Sprint Score:** 2 x 20 = **40**  
**Depends On:** F033, F045  
**Scope Note:** Optional demo support  

**Description:**

Giả lập mở/đóng barrier

---

## Out of MVP / Not Planned

**Block:** 0 | **Tổng Sprint Score:** 0


### F078 — Search & Suggest Reservation Slot

**Module:** Reservation  
**Backend Owner:** .NET Core  
**Actor:** Driver  
**Priority:** OUT  
**Dev phụ trách:** Unassigned  
**Size:** L  
**Score gốc:** 0  
**Sprint Score:** 0 x 0 = **0**  
**Depends On:** None  
**Scope Note:** Không làm trong MVP 30 ngày  

**Description:**

Tìm/gợi ý slot đặt trước

### F079 — Create Reservation

**Module:** Reservation  
**Backend Owner:** .NET Core  
**Actor:** Driver  
**Priority:** OUT  
**Dev phụ trách:** Unassigned  
**Size:** L  
**Score gốc:** 0  
**Sprint Score:** 0 x 0 = **0**  
**Depends On:** F078  
**Scope Note:** Không làm trong MVP 30 ngày  

**Description:**

Driver đặt chỗ trước

### F080 — Pay Reservation Fee

**Module:** Reservation  
**Backend Owner:** .NET Core  
**Actor:** Driver  
**Priority:** OUT  
**Dev phụ trách:** Unassigned  
**Size:** L  
**Score gốc:** 0  
**Sprint Score:** 0 x 0 = **0**  
**Depends On:** F079  
**Scope Note:** Không làm trong MVP 30 ngày  

**Description:**

Thanh toán phí đặt chỗ

### F081 — Extend Reservation

**Module:** Reservation  
**Backend Owner:** .NET Core  
**Actor:** Driver  
**Priority:** OUT  
**Dev phụ trách:** Unassigned  
**Size:** M  
**Score gốc:** 0  
**Sprint Score:** 0 x 0 = **0**  
**Depends On:** F079  
**Scope Note:** Không làm trong MVP 30 ngày  

**Description:**

Gia hạn thời gian đặt chỗ

### F082 — Cancel/Expire Reservation

**Module:** Reservation  
**Backend Owner:** .NET Core  
**Actor:** Driver/System  
**Priority:** OUT  
**Dev phụ trách:** Unassigned  
**Size:** M  
**Score gốc:** 0  
**Sprint Score:** 0 x 0 = **0**  
**Depends On:** F079  
**Scope Note:** Không làm trong MVP 30 ngày  

**Description:**

Hủy hoặc tự động hết hạn đặt chỗ

### F083 — Process Reservation Entry

**Module:** Reservation  
**Backend Owner:** .NET Core  
**Actor:** Staff  
**Priority:** OUT  
**Dev phụ trách:** Unassigned  
**Size:** L  
**Score gốc:** 0  
**Sprint Score:** 0 x 0 = **0**  
**Depends On:** F079  
**Scope Note:** Không làm trong MVP 30 ngày  

**Description:**

Check-in cho xe đã đặt chỗ

### F084 — VietQR Payment Processing

**Module:** Payment  
**Backend Owner:** .NET Core  
**Actor:** Driver  
**Priority:** OUT  
**Dev phụ trách:** Unassigned  
**Size:** XL  
**Score gốc:** 0  
**Sprint Score:** 0 x 0 = **0**  
**Depends On:** F040  
**Scope Note:** Không làm thanh toán online thật trong MVP  

**Description:**

Thanh toán qua VietQR/online payment

### F085 — Manual Online Payment Confirmation

**Module:** Payment  
**Backend Owner:** .NET Core  
**Actor:** Staff/Manager  
**Priority:** OUT  
**Dev phụ trách:** Unassigned  
**Size:** M  
**Score gốc:** 0  
**Sprint Score:** 0 x 0 = **0**  
**Depends On:** F084  
**Scope Note:** Chỉ làm nếu có VietQR/mock online payment  

**Description:**

Xác nhận thủ công thanh toán online khi lỗi đối soát

### F086 — Verify Resident Profile

**Module:** Resident  
**Backend Owner:** .NET Core  
**Actor:** Manager  
**Priority:** OUT  
**Dev phụ trách:** Unassigned  
**Size:** L  
**Score gốc:** 0  
**Sprint Score:** 0 x 0 = **0**  
**Depends On:** None  
**Scope Note:** Không thấy là core MVP, nếu cần thì gộp vào Monthly Pass future  

**Description:**

Xác minh CCCD/căn hộ cư dân

### F087 — Wrong Slot/Area Violation

**Module:** Violation  
**Backend Owner:** .NET Core  
**Actor:** Staff/Manager  
**Priority:** OUT  
**Dev phụ trách:** Unassigned  
**Size:** L  
**Score gốc:** 0  
**Sprint Score:** 0 x 0 = **0**  
**Depends On:** F033  
**Scope Note:** P2/Future, không chặn MVP  

**Description:**

Ghi nhận đỗ sai vị trí và tính phạt
