# Hướng Dẫn GitHub Project

Sử dụng GitHub Issues để chia task và Pull Request để tích hợp code/tài liệu.

## Field Cần Tạo Trong Project

Tạo các field sau trong GitHub Project:

```text
Sprint      Single select
Status      Single select
Priority    Single select
Size        Single select
Estimate    Number
Area        Single select
Blocked by  Text
```

`Status` nên dùng:

```text
Backlog
Ready
In Progress
Review
QA
Done
Blocked
```

`Priority` nên dùng:

```text
P0 - Critical path
P1 - Required for MVP/demo
P2 - Nice to have or polish
```

Quy tắc priority:

- `P0`: schema, auth, JWT compatibility, entry, exit, payment, receipt và tính đúng trạng thái dữ liệu.
- `P1`: exception flows, dashboard, reports, audit search, cancel session và slot adjustment.
- `P2`: Excel export, UI polish, biểu đồ nâng cao và tài liệu không chặn demo.

`Size` nên dùng:

```text
S
M
L
XL
```

Hạn chế issue `XL`. Nếu issue quá lớn, nên tách nhỏ trước khi làm.

`Area` nên dùng:

```text
backend-dotnet
backend-spring
frontend
database
test
docs
integration
```

## Milestone Và Sprint

Tên GitHub Milestone và field `Sprint` nên giống nhau để tránh rối.

```text
S00 - Project Setup
S01 - Foundation & Auth
S02 - Master Data & Public APIs
S03 - Entry Flow
S04 - Exit Payment & Exceptions
S05 - Reports Testing & Demo
```

`S00 - Project Setup` chỉ dùng để track phần setup đã xong hoặc gần xong. Nếu deadline 30 ngày đã bắt đầu, không tính `S00` vào kế hoạch 30 ngày.

Lịch 30 ngày chính:

```text
S01 - Foundation & Auth              Ngày 1-6
S02 - Master Data & Public APIs      Ngày 7-12
S03 - Entry Flow                     Ngày 13-18
S04 - Exit Payment & Exceptions      Ngày 19-24
S05 - Reports Testing & Demo         Ngày 25-30
```

Kế hoạch chi tiết nằm ở `Sprint_30_Day_Plan.md`.

## Label Nên Dùng

```text
backend-dotnet
backend-spring
frontend
database
docs
test
integration
bug
```

Khi tạo issue, dùng template trong `.github/ISSUE_TEMPLATE`.

## Quy Tắc Tạo Issue

Mỗi issue nên có:

- Area rõ ràng.
- Một sprint.
- Một priority.
- Acceptance criteria.
- Ghi chú test/verification.
- Ghi chú cập nhật API/docs/Postman nếu hành vi thay đổi.

Ví dụ issue:

```text
Title: [.NET][Entry] Create parking session transaction
Sprint: S03 - Entry Flow
Status: Ready
Priority: P0 - Critical path
Size: M
Estimate: 3
Area: backend-dotnet
Labels: backend-dotnet, integration
```

Ví dụ bug:

```text
Title: [Bug][Entry] Card remains AVAILABLE after entry
Sprint: S03 - Entry Flow
Status: Ready
Priority: P0 - Critical path
Area: backend-dotnet
Labels: bug, backend-dotnet
```

## Ownership Bắt Buộc

- `.NET Core API` sở hữu `/api/core/*`, EF Core migrations, auth, core write transactions, thay đổi trạng thái card/slot/session/payment/receipt, monthly pass, lost card, mismatch, cancel session và slot adjustment.
- `Spring Boot Support API` sở hữu `/api/public/*`, `/api/support/*`, public read, dashboard, reports, audit search và các support module optional.
- PostgreSQL là single source of truth.
- Chỉ `.NET Core API` tạo schema change chính thức bằng EF Core migrations.
- Spring Boot phải giữ schema validation và không được ghi core tables. Audit log chỉ được append-only.
- React phải gọi đúng backend owner thay vì tự duplicate business logic.
