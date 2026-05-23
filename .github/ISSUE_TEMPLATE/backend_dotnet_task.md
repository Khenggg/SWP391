---
name: Backend .NET task
about: Core API task for auth, core write, mapping, or transaction flow
title: "[.NET] "
labels: backend-dotnet
---

## Goal

## API / Module

## Acceptance Criteria

- [ ] Uses `/api/core/*`
- [ ] Adds validation and role checks
- [ ] Maps entities to the existing PostgreSQL schema
- [ ] Updates `database/*.sql` first when schema changes
- [ ] Does not add EF Core migration, `Database.Migrate()`, or `EnsureCreated()`
- [ ] Updates docs/Postman when API changes
