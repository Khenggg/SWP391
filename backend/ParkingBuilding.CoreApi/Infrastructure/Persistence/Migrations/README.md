# Deprecated

This folder is intentionally not used.

The project database source of truth is:

```text
database/01_schema.sql
database/02_seed.sql
database/03_indexes_constraints.sql
```

Do not add EF Core migration files here. The .NET API may use `DbContext` for querying and writing data, but it must not create or update the database schema automatically.
