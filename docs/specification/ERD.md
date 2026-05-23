# ERD

This file records table relationships and schema notes. It is not an executable migration tool.

## Main Rules

- PostgreSQL is shared by `.NET Core API` and `Spring Boot Support API`.
- Official schema and seed data live in `../../database/*.sql`.
- When relationships or columns change, update SQL scripts first.
- .NET may use EF Core `DbContext` to map/query/write data, but EF Core Migration is not used to create or update schema.
- Spring Boot maps existing tables and must keep Hibernate schema generation disabled (`ddl-auto=validate` or `none`).
- Database enums are stored as uppercase strings so C# and Java can read the same values.

## Main Table Groups

- Auth/User: `users`, plus driver profile/vehicle tables when driver features are implemented.
- Master data: `vehicle_types`, `parking_cards`, `floors`, `areas`, `area_vehicle_types`, `slots`, `gates`, `pricing_rules`.
- Core transaction: `parking_sessions`, `payments`, `receipts`.
- Exception/MVP: `monthly_passes`, `lost_card_cases`, `plate_mismatch_cases`.
- Support/read: `audit_logs` and future read queries/views for dashboard/report.

## Update Notes

- Schema source of truth: `../../database/01_schema.sql`.
- Seed source of truth: `../../database/02_seed.sql`.
- Index/constraint source of truth: `../../database/03_indexes_constraints.sql`.
- Do not add EF schema commands, Hibernate auto-update/create modes, Flyway, or Liquibase steps to this project.
