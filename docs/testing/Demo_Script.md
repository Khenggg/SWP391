# Demo Script

Minimum MVP demo flow proving the frontend, both backends, and shared database work together.

## Main Flow

1. Run `database/01_schema.sql`, `database/02_seed.sql`, and `database/03_indexes_constraints.sql`.
2. Staff logs in through `.NET Core API`.
3. Staff creates vehicle entry through `.NET Core API`.
4. Public QR lookup reads the active session through Spring Public API.
5. Staff finds the active session by card code.
6. `.NET Core API` calculates fee, accepts cash payment, creates receipt, and completes exit.
7. Spring Support API displays dashboard summary.
8. Spring Support API searches audit logs for the actions just performed.

## Pass Conditions

- JWT works for both `.NET` and Spring.
- Entry creates an `ACTIVE` session.
- Card changes to `IN_USE`.
- Slot changes to `OCCUPIED`.
- Exit releases card and slot.
- Receipt has payment data.
- Dashboard/report/audit reads newly generated data.

## Do Not Demo Before Stable

- Excel export.
- Advanced charts.
- UI polish that does not affect the core flow.
