# Branching Workflow

## Branch Purpose

- `main`: stable code for demo/release.
- `dev`: active development.
- `docs`: documentation-focused work.

## Development Flow

1. Pull the latest `dev`.
2. Create a feature branch from `dev`.
3. Commit using clear messages such as `feat:`, `fix:`, `docs:`, or `refactor:`.
4. Open a Pull Request into `dev`.
5. Merge `dev` into `main` when the team is ready for demo/release.

## GitHub Recommendation

Enable branch protection for `main` in GitHub:

- require Pull Request before merge
- block force pushes
- block branch deletion
- require status checks after CI is added

