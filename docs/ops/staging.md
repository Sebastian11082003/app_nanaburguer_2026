# Staging deployment — RestoOS / NanaBurguer

## Goal

Run the full stack (Postgres + Nest API + Next frontend) in Docker with
**secrets outside git**, migrations applied on boot, and a checklist before
pointing real testers at the environment.

Printer / print-agent is **out of scope** until explicitly requested.

## Prerequisites

1. Docker Desktop running.
2. Free host ports for API (`3000` by default) and frontend (`3001`).
3. Stop other Postgres containers that bind `5432` if you also expose DB
   locally (staging compose does **not** publish DB by default — only
   API/frontend).

## One-time setup

```bash
cd docker
cp .env.staging.example .env.staging
```

Edit `.env.staging`:

- Strong `POSTGRES_PASSWORD` and `JWT_SECRET`
- `NEXT_PUBLIC_API_URL` = URL browsers will use to call the API
  (e.g. `http://YOUR_LAN_IP:3000` or a staging domain)

## Start

```bash
docker compose -f docker/docker-compose.staging.yml --env-file docker/.env.staging up --build -d
```

API entrypoint runs `prisma migrate deploy` then starts Nest.

## Smoke checklist

| Step | Expected |
|------|----------|
| `GET http://localhost:3000` (or health route) | API up |
| Open frontend on `FRONTEND_PORT` | Login screens load |
| Platform login → create/open restaurant | 200 |
| Admin login (re-login after permission JWT changes) | Dashboard + Reportes show numbers |
| Mesas → orden → cocina → cobro | Sale + invoice |
| Delivery hub → Mi perfil | Session + restaurant brand |
| Role without `REPORTS_VIEW` | Reportes hidden / 403 |

## Tear down

```bash
docker compose -f docker/docker-compose.staging.yml --env-file docker/.env.staging down
# add -v to wipe staging DB volume
```

## Notes

- Do not commit `docker/.env.staging`.
- Production AWS/ECS remains the long-term target (`docs/architecture/deployment-aws.md`);
  this staging compose is the practical next step for QA.
- Rebuild frontend whenever `NEXT_PUBLIC_API_URL` changes (build-time env).
