# ParkingBuilding.CoreApi

ASP.NET Core Web API for core write flows.

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

## Local Setup

Set the Supabase PostgreSQL connection string outside Git:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=aws-1-ap-south-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.iqzkddymzmfhyqbfrnyu;Password=<your-password>;SSL Mode=Require;Trust Server Certificate=true;Include Error Detail=true"
```

Run the API:

```powershell
dotnet run --launch-profile http
```

URLs:

- API: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger`
- Database check: `http://localhost:5000/api/core/db-check`

Expected startup proof:

```text
Now listening on: http://localhost:5000
Supabase PostgreSQL connection successful.
```
