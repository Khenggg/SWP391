## Summary

- 

## Scope

- [ ] .NET Core API
- [ ] Spring Boot Support API
- [ ] Frontend
- [ ] Database/docs

## Checks

- [ ] API paths keep `/api/core`, `/api/support`, or `/api/public`
- [ ] Schema changes are reflected in `database/*.sql`
- [ ] No EF Core migration, `Database.Migrate()`, or `EnsureCreated()` added
- [ ] Spring Boot keeps `ddl-auto=validate` or `none`
- [ ] No Hibernate `ddl-auto=create`, `create-drop`, or `update`
- [ ] No Flyway or Liquibase added
- [ ] No new unrelated secrets committed
- [ ] Docs/Postman updated if API or schema changed
