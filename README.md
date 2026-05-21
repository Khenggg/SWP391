# Parking Building Management System

Architecture-only repository skeleton for the dual-backend design in
`docs/Developer_Implementation_Specification_Dual_Backend_NET_SpringBoot.md`.

The backend folders intentionally contain no implementation code. Students should create controllers, services, entities, repositories, migrations, and tests inside the prepared structure.

## Project Structure

```text
SWP301/
|-- backend/
|   |-- ParkingBuilding.CoreApi/          # ASP.NET Core API skeleton
|   `-- parking-building-support-api/     # Spring Boot Support API skeleton
|-- frontend/                             # React frontend skeleton
|-- docs/                                 # Specifications and references
`-- README.md
```

## Backend Ownership

- `.NET Core API`: `/api/core/*`, auth, user/driver write, core parking transactions, EF Core migrations.
- `Spring Boot Support API`: `/api/support/*`, `/api/public/*`, public read, dashboard, reports, audit search.
- `PostgreSQL`: shared database, schema owned by `.NET Core API`.
- `React`: must call the correct backend through `coreApi`, `supportApi`, and `publicApi` when students implement API integration.

## Current State

- Backend source files are not implemented.
- Folder architecture is prepared with `.gitkeep` files so the structure is visible in Git.
- Frontend implementation files are not included; only the folder architecture is kept.
- Environment examples keep the expected dual-backend ports and base URLs.

## Expected Local Ports

```text
PostgreSQL  : localhost:5432
.NET Core   : http://localhost:5000
Spring Boot : http://localhost:8080
React Vite  : http://localhost:5173
```

## Student Implementation Start

Students should follow the scaffold commands and starter-code sections in the dual-backend specification, especially:

- Section 10: ASP.NET Core Architecture
- Section 11: Spring Boot Architecture
- Section 14: Frontend Architecture
- Section 19.6: Scaffold Project Commands
- Section 19.7 and 19.8: Starter Code

## Vietnamese Version

- [README.vn.md](README.vn.md)
