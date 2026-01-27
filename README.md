# YOLO Guard — Real-time Object Detection Platform

YOLO Guard is a modular stack that captures video from webcams/RTSP/files, runs Ultralytics YOLO, streams detections to the browser, stores events, and exposes dashboards/analytics with localization and theming.

> Status: scaffolded foundation (backend FastAPI skeleton, CV worker shell, Next.js UI shell, Docker wiring). Core loops and UI flows are intentionally minimal so you can extend quickly.

## Features (MVP target)
- FastAPI backend with auth (JWT) + RBAC, sources/zones CRUD, runtime settings, health checks.
- CV worker package prepared for Ultralytics YOLO inference with synthetic-frame fallback.
- Next.js (App Router) frontend with theme + i18n (EN/RU), dashboard layout, live preview controls, placeholder pages for Live/History/Analytics/Alerts/Sources/Settings/Users/Models.
- Docker Compose stack (Postgres + backend + cv + frontend), Makefile helpers, `.env.example`, typed configs.
- Docs stubs for API/event engine, analytics-ready schema (detections/events/alerts/audit).

## Repository Layout
```
backend/          FastAPI app, SQLAlchemy models, Alembic config, tests
cv/               YOLO worker package, pipeline and detector wrappers, tests
frontend/         Next.js App Router UI with Tailwind/i18n/theme shell
configs/          default.yaml with runtime defaults
artifacts/weights placeholder for model weights (yolov8n.pt etc.)
docker/           Dockerfiles for backend, cv worker, frontend
docs/             Documentation stubs (API, event engine)
```

## Quickstart (Docker)
```bash
cp .env.example .env
# drop your weights into artifacts/weights/yolov8n.pt or adjust configs/default.yaml
docker-compose up --build
```
- Backend: http://localhost:8000 (OpenAPI at `/docs`)
- Frontend: http://localhost:3000
- Postgres: `postgresql://yolo:yolo@localhost:5432/yolo_guard`

Make targets:
- `make dev` (docker-compose up --build)
- `make lint` / `make test` / `make format`
- `make migrate` (alembic upgrade head)
- `make seed-admin` (creates admin from env vars)

## Environment
Set in `.env` (see `.env.example`):
- `DATABASE_URL=postgresql+psycopg2://yolo:yolo@postgres:5432/yolo_guard`
- `JWT_SECRET`, `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`
- `STORAGE_PATH`, `WEBHOOK_RETRY_COUNT`
- Optional SMTP_* for email alerts

## Backend (FastAPI)
- Core app in `backend/app`: settings (`config.py`), DB (`db.py`), models (`models.py`), security (JWT + bcrypt), routers (`/api/auth`, `/api/sources`, `/api/zones`, `/api/settings`, `/api/health`).
- Tables aligned to spec: users, sources, zones, detections, events, alert_rules, alert_logs, audit_logs.
- Alembic scaffold at `backend/alembic`.
- Tests: `backend/tests` (health check sample); add more for event engine, alerts, auth flow.

## CV Worker
- Package `cv/yolo_guard`: settings, YOLO detector wrapper (`detector.py`), detection pipeline with synthetic-frame fallback (`pipeline.py`), worker loop (`worker.py`).
- Requirements include `ultralytics`, `opencv-python-headless`, `loguru`.
- Entry: `python -m yolo_guard.worker` (used by Dockerfile).

## Frontend
- Next.js 14 App Router, Tailwind, React Query, i18next (EN/RU), next-themes.
- Dashboard shell at `frontend/src/app/page.tsx` with live preview controls, metrics cards, event list, analytics placeholder.
- Sidebar nav + placeholder pages for Live/History/Analytics/Alerts/Sources/Settings/Users/Models.
- Theming + language toggles in header; global styling in `src/styles/globals.css`.

## Adding RTSP & Weights
- Place YOLO weights into `artifacts/weights` (default `yolov8n.pt` path in configs/default.yaml).
- Create a source via `/api/sources` (type `rtsp`, `url_or_index` your RTSP URL).
- Start/stop/test endpoints provided (`/api/sources/{id}/start|stop|test`); hook CV worker to these in the next iteration.

## Architecture (draft)
```
[Camera/RTSP/File] -> [cv-worker: capture + YOLO -> detections]
    -> WS/HTTP live stream -> Frontend (Next.js)
    -> DB (events, detections) <- Backend (FastAPI API/WS, auth, alerts, exports)
Frontend -> HTTP/WS -> Backend -> DB
```

## Docs
- `docs/api.md`: API surface + OpenAPI link.
- `docs/event-engine.md`: outlines presence/threshold logic and alert hooks.

## Testing
- Backend: `cd backend && pytest` (uses SQLite by default). Install deps via `pip install -r backend/requirements-dev.txt`.
- CV: `cd cv && pytest` (uses synthetic frames; no GPU required).
- Frontend lint/format: `cd frontend && npm run lint`.

## Roadmap (next steps)
- Wire CV worker to API/DB and WebSocket stream, implement alert engine + exports.
- Flesh out frontend pages with real data (React Query), shadcn/ui components, forms with zod, charts (Recharts).
- Add migrations, Prometheus metrics, health/readiness endpoints, audit log UI, CI workflows.
petmek