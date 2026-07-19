# API Contract

## Base URLs

```text
Core API    : http://localhost:5000
Support API : http://localhost:8080
Public API  : http://localhost:8080
```

## Prefix Rules

```text
.NET Core API      /api/core/*
Spring Support API /api/support/*
Spring Public API  /api/public/*
```

## Priority Endpoints

```text
POST /api/core/auth/login
POST /api/core/auth/register
POST /api/core/auth/refresh-token
POST /api/core/auth/logout
GET  /api/core/auth/me
POST /api/core/parking-sessions/entry
POST /api/core/parking-sessions/{id}/exit
POST /api/core/payments/cash
GET  /api/core/parking-sessions/by-card-code/{cardCode}

GET  /api/support/dashboard/summary
GET  /api/support/reports/revenue
GET  /api/support/audit-logs

GET  /api/public/parking-info
GET  /api/public/available-slots
GET  /api/public/pricing
GET  /api/public/cards/{qrToken}/active-session
```

Update this file whenever endpoint paths, payloads, response fields, or ownership rules change.

## Authentication Session Rules

- Driver registration is public and creates a `DRIVER` user plus an `ACTIVE` visitor driver profile in one transaction.
- Registration accepts only full name, username, email, Vietnamese phone, password, and confirm password; username is case-insensitive and normalized to lowercase, while role and status are server-controlled.
- Registration returns `201 Created` and never returns a password or password hash.
- Login returns a 60-minute JWT access token and a rotating refresh token.
- Refresh tokens are single-use and stored only as SHA-256 hashes in PostgreSQL.
- Logout revokes the current token family and blacklists the current access-token `jti`.
- Both .NET Core and Spring Boot reject tokens for inactive, locked, or soft-deleted users.
