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

## Run

Update Supabase PostgreSQL credentials in `src/main/resources/application-local.yml`, then run:

```bash
mvn spring-boot:run
```

Quick check:

```text
GET http://localhost:8080/api/support/health
```

Business modules, JWT validation, read models, services, controllers, and tests still need to be implemented by students.
