# Backend Skeleton

This folder keeps the dual-backend architecture.

- `ParkingBuilding.CoreApi`: ASP.NET Core API owner for `/api/core/*`, auth, and core write transactions.
- `parking-building-support-api`: Spring Boot API owner for `/api/public/*`, `/api/support/*`, public read, dashboard, reports, and audit search.

Database schema is not owned by either backend runtime. The official schema and seed data are managed manually in:

```text
../database/01_schema.sql
../database/02_seed.sql
../database/03_indexes_constraints.sql
```

Rules:

- Do not add EF Core migrations for official schema changes.
- Do not call `Database.Migrate()` or `EnsureCreated()` from .NET startup.
- Keep Spring Boot `ddl-auto=validate` or `none`; never use `create`, `create-drop`, or `update`.
- Do not add Flyway or Liquibase in the current scope.

Students should scaffold and implement each backend according to the dual-backend specification in `../docs`, while mapping entities to the existing PostgreSQL schema.
