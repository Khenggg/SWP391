# Database Scripts

`database/*.sql` is the source of truth for the PostgreSQL/Supabase schema and MVP seed data.

Backends must not create or mutate schema automatically:

- Do not use EF Core Migration for official schema changes.
- Do not call `Database.Migrate()` or `EnsureCreated()` from .NET startup.
- Do not use Hibernate `ddl-auto=create`, `create-drop`, or `update`.
- Do not add Flyway or Liquibase in the current scope.

## Files

```text
database/
|-- 01_schema.sql                 # Core MVP tables
|-- 02_seed.sql                   # Demo users and master data
|-- 03_indexes_constraints.sql    # Indexes, unique constraints, late FKs
|-- manual-scripts/               # Optional local/debug helper SQL
`-- snapshots/                    # Optional exported schema snapshots
```

## Run Order

Use Supabase SQL Editor or pgAdmin on a clean PostgreSQL database:

1. Run `database/01_schema.sql`.
2. Run `database/02_seed.sql`.
3. Run `database/03_indexes_constraints.sql`.
4. Start the .NET Core API.
5. Start the Spring Boot Support API.
6. Start the React frontend.

## Supabase SQL Editor

1. Open the Supabase project.
2. Go to SQL Editor.
3. Paste and run each script in the order above.
4. Check that tables such as `users`, `vehicle_types`, `floors`, `areas`, `slots`, `gates`, and `pricing_rules` contain seed data.

## pgAdmin

1. Connect to the PostgreSQL database.
2. Open Query Tool.
3. Open each script file and execute it in the order above.
4. Refresh the `public` schema and verify the tables and indexes.

## Change Rule

When the schema changes, update `database/01_schema.sql` and, when needed, `database/03_indexes_constraints.sql` first. When baseline demo data changes, update `database/02_seed.sql`.

.NET `DbContext` and Spring JPA entities must map to this schema, not define a competing source of truth.
