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
