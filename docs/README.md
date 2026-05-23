# Project Documentation

This folder contains project management, specification, API, test, and workflow documents for the Parking Building Management System.

## Directory Structure

```text
docs/
  README.md
  specification/   Requirements, API, ERD, and implementation spec
  planning/        Sprint plan, GitHub Project guide, and meeting notes
  git/             Git, branch, and Pull Request workflow
  testing/         Test cases, demo script, and Postman guide
  references/      Reference PDF/DOCX files
  Parking Building Management UI (1)/  UI reference package
```

## Specification

- `specification/SRS.md`: entry point for requirements.
- `specification/Developer_Implementation_Specification_Dual_Backend_NET_SpringBoot.md`: main implementation guide for the dual-backend architecture.
- `specification/API_Contract.md`: base URLs, API prefixes, and priority endpoints.
- `specification/ERD.md`: table relationship notes. Official schema changes must be made in `../database/*.sql`.

## Database Rule

`database/*.sql` is the source of truth for database schema and seed data.

- Change SQL scripts first when schema changes.
- .NET must not create schema through EF Core Migration.
- Spring Boot must not create or update schema through Hibernate.
- Flyway and Liquibase are out of scope for now.

## Planning

- `planning/Sprint_30_Day_Plan.md`: 5-sprint plan for 30 days.
- `planning/GitHub_Project_Guide.md`: GitHub Project fields, milestones, priority, and issues.
- `planning/Meeting_Notes.md`: meeting notes template.

## Testing

- `testing/Test_Cases.md`: required MVP/demo test groups.
- `testing/Demo_Script.md`: minimum demo flow.
- `testing/Postman_Guide.md`: how to use the collection and environment in `postman/`.

## References

- `references/bo_sung_kien_thuc_github_hoan_chinh_1.pdf`: Git/GitHub reference.
- `references/huong_dan_git_branch_github_1.docx`: branch/GitHub reference.
- `Parking Building Management UI (1)/`: UI reference package, not the current source frontend.
