# Parking Building Management System

Repo hiện chỉ giữ **khung kiến trúc project** theo tài liệu
`docs/Developer_Implementation_Specification_Dual_Backend_NET_SpringBoot.md`.

Các thư mục backend cố ý không có code triển khai. Sinh viên sẽ tự viết controller, service, entity, repository, migration và test trong cấu trúc đã chuẩn bị.

## Cấu Trúc

```text
SWP301/
|-- backend/
|   |-- ParkingBuilding.CoreApi/          # Khung ASP.NET Core API
|   `-- parking-building-support-api/     # Khung Spring Boot Support API
|-- frontend/                             # Khung frontend React
|-- docs/                                 # Tài liệu đặc tả
`-- README.md
```

## Ownership Backend

- `.NET Core API`: `/api/core/*`, auth, user/driver write, transaction nghiệp vụ core, EF Core migration.
- `Spring Boot Support API`: `/api/support/*`, `/api/public/*`, public read, dashboard, report, audit search.
- `PostgreSQL`: database dùng chung, schema do `.NET Core API` sở hữu.
- `React`: khi sinh viên nối API thật, phải tách đúng `coreApi`, `supportApi`, `publicApi`.

## Trạng Thái Hiện Tại

- Backend chưa có source code triển khai.
- Các thư mục kiến trúc được giữ bằng `.gitkeep` để Git thấy được folder.
- Frontend cũng không còn code UI triển khai; chỉ giữ kiến trúc thư mục.
- File env example vẫn giữ port/base URL dự kiến cho mô hình dual-backend.

## Port Dự Kiến

```text
PostgreSQL  : localhost:5432
.NET Core   : http://localhost:5000
Spring Boot : http://localhost:8080
React Vite  : http://localhost:5173
```

## Sinh Viên Bắt Đầu Code

Sinh viên làm theo các phần scaffold và starter code trong spec dual-backend:

- Section 10: ASP.NET Core Architecture
- Section 11: Spring Boot Architecture
- Section 14: Frontend Architecture
- Section 19.6: Scaffold Project Commands
- Section 19.7 và 19.8: Starter Code
