# Parking Building Management System

Repo monorepo skeleton theo tai lieu
`docs/specification/Developer_Implementation_Specification_Dual_Backend_NET_SpringBoot.md`.

Thu muc backend dang la scaffold. Sinh vien se tu viet controller, service, entity, repository, mapping va test trong cau truc da chuan bi. Database schema va seed data duoc quan ly thu cong bang SQL script trong `database/`.

## Cau Truc

```text
SWP301/
|-- .github/                              # Issue/PR template va workflow sau nay
|-- backend/
|   |-- ParkingBuilding.CoreApi/          # Khung ASP.NET Core API
|   `-- parking-building-support-api/     # Khung Spring Boot Support API
|-- frontend/                             # Source frontend React
|-- database/                             # SQL schema va seed chinh thuc
|-- docs/                                 # Tai lieu dac ta va tham khao
|-- postman/                              # Collection va environment template
`-- README.md
```

## Ownership Backend

- `.NET Core API`: `/api/core/*`, auth, user/driver write, core transaction, entry, exit, payment, receipt.
- `Spring Boot Support API`: `/api/support/*`, `/api/public/*`, public read, dashboard, report, audit search.
- `PostgreSQL`: database dung chung, tao bang tu `database/*.sql`.
- `React`: goi `.NET` cho core write/auth/entry/exit/payment; goi Spring cho public read/dashboard/report/audit.

## Quy Tac Database

`database/*.sql` la database source of truth.

- Chay SQL script thu cong tren Supabase PostgreSQL hoac pgAdmin.
- Khong dung EF Core Migration de tao/sua schema chinh thuc.
- Khong goi `Database.Migrate()` hoac `EnsureCreated()` trong .NET startup.
- Khong dung Hibernate `ddl-auto=create`, `create-drop`, hoac `update`.
- Khong dung Flyway hoac Liquibase trong scope hien tai.

## Trang Thai Hien Tai

- Backend chua co tinh nang nghiep vu; Spring Boot Support API da co Maven bootstrap va health endpoint.
- Cau truc thu muc duoc giu bang `.gitkeep`.
- Frontend chi co bootstrap Vite/React toi thieu.
- `docs/Parking Building Management UI (1)/` chi la UI reference, khong phai source frontend that.

## Port Du Kien

```text
PostgreSQL  : Supabase PostgreSQL cau hinh trong backend config files
.NET Core   : http://localhost:5000
Spring Boot : http://localhost:8080
React Vite  : http://localhost:5173
```

## Thu Tu Chay

1. Tao hoac chon database Supabase/PostgreSQL.
2. Chay `database/01_schema.sql`.
3. Chay `database/02_seed.sql`.
4. Chay `database/03_indexes_constraints.sql`.
5. Chay `.NET Core API`.
6. Chay `Spring Boot Support API` voi `ddl-auto=validate`.
7. Chay React tu `frontend/`.

## Sinh Vien Bat Dau Code

Lam theo scaffold/starter-code trong spec dual-backend, nhung moi thay doi schema phai cap nhat `database/*.sql` truoc.
