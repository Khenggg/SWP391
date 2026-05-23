# Parking Building Management System

Monorepo skeleton for the dual-backend design in
`docs/specification/Developer_Implementation_Specification_Dual_Backend_NET_SpringBoot.md`.

The backend folders intentionally contain scaffold structure. Students should implement controllers, services, entities, repositories, mapping, and tests inside the prepared structure. Database schema and seed data are managed manually by SQL scripts in `database/`.

## Project Structure

```text
SWP301/
|-- .github/                              # Issue/PR templates and future workflows
|-- backend/
|   |-- ParkingBuilding.CoreApi/          # ASP.NET Core API skeleton
|   `-- parking-building-support-api/     # Spring Boot Support API skeleton
|-- frontend/                             # React frontend skeleton
|-- database/                             # Official PostgreSQL schema and seed scripts
|-- docs/                                 # Specifications and references
|-- postman/                              # Shared API collection and environment template
`-- README.md
```

## Backend Ownership

- `.NET Core API`: `/api/core/*`, auth, user/driver write, core parking transactions, payment, receipt, and state changes.
- `Spring Boot Support API`: `/api/support/*`, `/api/public/*`, public read, dashboard, reports, and audit search.
- `PostgreSQL`: shared database created from `database/*.sql`.
- `React`: source app is `frontend/`; it must call `.NET` for core write/auth/entry/exit/payment and Spring for public read/dashboard/report/audit.

## Database Rule

`database/*.sql` is the database source of truth.

- Run SQL scripts manually on Supabase PostgreSQL or pgAdmin.
- Do not use EF Core Migration for official schema changes.
- Do not call `Database.Migrate()` or `EnsureCreated()` from .NET startup.
- Do not use Hibernate `ddl-auto=create`, `create-drop`, or `update`.
- Do not use Flyway or Liquibase in the current scope.

## Current State

- Backend business features are not implemented yet; the Spring Boot Support API has a Maven bootstrap and health endpoint.
- Folder architecture is prepared with `.gitkeep` files so the structure is visible in Git.
- Frontend includes only a minimal Vite/React bootstrap; feature UI and API integration are for students to implement.
- `docs/Parking Building Management UI (1)/` is a UI reference package, not the source frontend app.

## Expected Local Ports

```text
PostgreSQL  : Supabase PostgreSQL configured in backend config files
.NET Core   : http://localhost:5000
Spring Boot : http://localhost:8080
React Vite  : http://localhost:5173
```

## Run Order

1. Create or select the Supabase/PostgreSQL database.
2. Run `database/01_schema.sql`.
3. Run `database/02_seed.sql`.
4. Run `database/03_indexes_constraints.sql`.
5. Run `.NET Core API`.
6. Run `Spring Boot Support API` with `ddl-auto=validate`.
7. Run React from `frontend/`.

## Student Implementation Start

Students should follow the scaffold commands and starter-code sections in the dual-backend specification, while keeping schema changes in `database/*.sql`.

## Vietnamese Version

- [README.vn.md](README.vn.md)
