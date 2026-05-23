# ParkingBuilding.CoreApi

ASP.NET Core API skeleton.

Ownership:

- Auth/JWT
- User and driver write APIs
- Parking card, structure, entry/exit, payment, receipt, monthly pass, exception flows
- `/api/core/*`

Database rule:

- Keep `DbContext` only for mapping/query/insert/update against the existing PostgreSQL schema.
- Do not use EF Core Migration as the schema source of truth.
- Do not call `Database.Migrate()` or `EnsureCreated()` in `Program.cs`.
- Seed baseline data from `../../database/02_seed.sql`; use C# seeders only for explicit runtime needs.

Code is intentionally not implemented yet. Students should add `.csproj`, `Program.cs`, controllers, services, entities, `ParkingDbContext`, repositories, and tests. Schema changes must start in `../../database/*.sql`.
