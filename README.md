# Balen Community Food Share (Sprint 1)

Sprint 1 scaffolding for the Food Share project using:
- Node.js + Express
- PUG templates
- MySQL
- Docker Compose (+ Adminer)

## Run
1) Install Docker Desktop
2) In the project root:

```bash
docker compose up --build
```

## Open
- App: http://localhost:3000
- Health check: http://localhost:3000/health
- Adminer: http://localhost:8080
  - System: MySQL
  - Server: db
  - Username: balen_user
  - Password: balen_pass
  - Database: balen_db

## Notes
- Database schema + seed are in `/db` and auto-run on first DB creation.
- Sprint 1 goal: system setup + repo scaffold + Kanban + commits from all members.
