# parking-building-support-api

Spring Boot Support API built with Maven.

Ownership:

- Public parking information
- Public QR lookup
- Dashboard
- Reports and Excel export
- Audit log search
- Optional feedback/notification/mock device modules
- `/api/public/*` and `/api/support/*`

Database rule:

- PostgreSQL schema and seed data come from `../../database/*.sql`.
- Keep `spring.jpa.hibernate.ddl-auto=validate` or `none`.
- Never use `ddl-auto=create`, `create-drop`, or `update`.
- Do not add Flyway or Liquibase in the current scope.
- Support API reads core tables; it must not write core transaction tables.

The current local Supabase connection is kept in `src/main/resources/application-local.yml` by team decision.

## Run

First run the database scripts from the repo root:

```text
database/01_schema.sql
database/02_seed.sql
database/03_indexes_constraints.sql
```

Then run:

```bash
mvn spring-boot:run
```

Quick check:

```text
GET http://localhost:8080/api/support/health
```

Business modules, JWT validation, read models, services, controllers, and tests still need to be implemented by students.
