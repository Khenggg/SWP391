# Backend Skeleton

This folder only keeps the dual-backend architecture.

- `ParkingBuilding.CoreApi`: ASP.NET Core API owner for `/api/core/*`, EF Core migrations, auth, and core write transactions.
- `parking-building-support-api`: Spring Boot API owner for `/api/public/*`, `/api/support/*`, public read, dashboard, reports, and audit search.

No implementation code is included. Students should scaffold and implement each backend according to the dual-backend specification in `../docs`.
