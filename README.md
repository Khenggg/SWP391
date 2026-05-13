# SWP391

Repository for the SWP391 project.

## Project Structure

```text
SWP391/
|-- backend/      # Backend source code and API services
|-- frontend/     # Frontend source code and UI application
|-- docs/         # Project documents, diagrams, and notes
`-- README.md
```

## Branches

- `main`: stable source for demo/release.
- `dev`: active development branch.
- `docs`: documentation updates, diagrams, reports, and planning notes.

Recommended workflow:

1. Create feature branches from `dev`.
2. Open Pull Requests back into `dev`.
3. Merge `dev` into `main` only when the build is ready for demo/release.
4. Keep documents in `docs/` and use the `docs` branch for larger documentation changes.

## Environment Files

Real environment files must stay local and should not be committed:

- `backend/.env`
- `frontend/.env`

Use these templates when setting up a new machine:

- `backend/.env.example`
- `frontend/.env.example`

## Local Setup

Backend and frontend commands should be updated after the team finalizes the tech stack.

```bash
cd backend
# install dependencies
# run backend server
```

```bash
cd frontend
# install dependencies
# run frontend app
```

## Documentation

Project documents should be placed under `docs/`, for example:

- requirements
- database design
- API specification
- UI wireframes
- sprint notes
- meeting notes
