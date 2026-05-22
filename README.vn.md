# Parking Building Management System

Repo monorepo skeleton theo tài liệu
`docs/Developer_Implementation_Specification_Dual_Backend_NET_SpringBoot.md`.

Các thư mục backend cố ý không có code triển khai. Sinh viên sẽ tự viết controller, service, entity, repository, migration và test trong cấu trúc đã chuẩn bị. Frontend chỉ có bootstrap Vite/React tối thiểu.

## Cấu Trúc

```text
SWP301/
|-- .github/                              # Issue/PR template và workflow sau này
|-- backend/
|   |-- ParkingBuilding.CoreApi/          # Khung ASP.NET Core API
|   `-- parking-building-support-api/     # Khung Spring Boot Support API
|-- frontend/                             # Source frontend React thật
|-- database/                             # Script phụ và snapshot, không phải migration chính
|-- docs/                                 # Tài liệu đặc tả và tham khảo
|-- postman/                              # Collection và environment template
`-- README.md
```

## Ownership Backend

- `.NET Core API`: `/api/core/*`, auth, user/driver write, transaction nghiệp vụ core, EF Core migration.
- `Spring Boot Support API`: `/api/support/*`, `/api/public/*`, public read, dashboard, report, audit search.
- `PostgreSQL`: database dùng chung, schema do `.NET Core API` sở hữu.
- `React`: source app nằm ở `frontend/`; khi sinh viên nối API thật, phải tách đúng `coreApi`, `supportApi`, `publicApi`.

## Trạng Thái Hiện Tại

- Backend chưa có tính năng nghiệp vụ; Spring Boot Support API đã có Maven bootstrap và health endpoint.
- Các thư mục kiến trúc được giữ bằng `.gitkeep` để Git thấy được folder.
- Frontend chỉ có bootstrap Vite/React tối thiểu; UI chức năng và API integration để sinh viên triển khai.
- `docs/Parking Building Management UI (1)/` chỉ là gói UI tham khảo, không phải source frontend thật.

## Port Dự Kiến

```text
PostgreSQL  : Supabase PostgreSQL cấu hình trực tiếp trong file config backend
.NET Core   : http://localhost:5000
Spring Boot : http://localhost:8080
React Vite  : http://localhost:5173
```

## Thứ Tự Chạy

1. Cấu hình thông tin Supabase PostgreSQL trực tiếp trong file config backend.
2. Chạy `.NET Core API` và apply EF Core migration.
3. Chạy `Spring Boot Support API` với `ddl-auto=validate`.
4. Chạy React từ `frontend/`.

## Sinh Viên Bắt Đầu Code

Sinh viên làm theo các phần scaffold và starter code trong spec dual-backend:

- Section 10: ASP.NET Core Architecture
- Section 11: Spring Boot Architecture
- Section 14: Frontend Architecture
- Section 19.6: Scaffold Project Commands
- Section 19.7 và 19.8: Starter Code
