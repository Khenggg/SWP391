# Parking Building Management System

Monorepo skeleton for the dual-backend design in
`docs/specification/Developer_Implementation_Specification_Dual_Backend_NET_SpringBoot.md`.

The backend folders intentionally contain no implementation code. Students should create controllers, services, entities, repositories, migrations, and tests inside the prepared structure. The frontend has only a minimal Vite/React bootstrap.

## Project Structure

```text
SWP301/
|-- .github/                              # Issue/PR templates and future workflows
|-- backend/
|   |-- ParkingBuilding.CoreApi/          # ASP.NET Core API skeleton
|   `-- parking-building-support-api/     # Spring Boot Support API skeleton
|-- frontend/                             # React frontend skeleton
|-- database/                             # Support SQL scripts and snapshots only
|-- docs/                                 # Specifications and references
|-- postman/                              # Shared API collection and environment template
`-- README.md
```

## Backend Ownership

- `.NET Core API`: `/api/core/*`, auth, user/driver write, core parking transactions, EF Core migrations.
- `Spring Boot Support API`: `/api/support/*`, `/api/public/*`, public read, dashboard, reports, audit search.
- `PostgreSQL`: shared database, schema owned by `.NET Core API`.
- `React`: source app is `frontend/`; it must call the correct backend through `coreApi`, `supportApi`, and `publicApi` when students implement API integration.

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

1. Configure Supabase PostgreSQL credentials directly in the backend config files.
2. Run `.NET Core API` and apply EF Core migrations.
3. Run `Spring Boot Support API` with `ddl-auto=validate`.
4. Run React from `frontend/`.

## Student Implementation Start

Students should follow the scaffold commands and starter-code sections in the dual-backend specification, especially:

- Section 10: ASP.NET Core Architecture
- Section 11: Spring Boot Architecture
- Section 14: Frontend Architecture
- Section 19.6: Scaffold Project Commands
- Section 19.7 and 19.8: Starter Code

## Vietnamese Version

- [README.vn.md](README.vn.md)
