# Database Support Files

The main database schema is owned by `.NET Core API` EF Core migrations:

```text
backend/ParkingBuilding.CoreApi/Infrastructure/Persistence/Migrations/
```

This folder is only for support material:

- `snapshots/`: optional exported schema or seed snapshots for review.
- `manual-scripts/`: helper SQL for debugging, checking demo state, or cleaning local test data.

Do not create the official migration history here.
