# YOLO Guard

Real-time object detection platform built on **Ultralytics YOLO26**.
Captures video from webcams, RTSP streams or files, runs inference, streams detections over WebSocket, stores events in PostgreSQL and exposes dashboards via a Next.js frontend.

## Architecture

```
Camera / RTSP / File
        |
   [ CV Worker ]  ── YOLO26 inference ── detections ──► PostgreSQL
        |                                                    ▲
        ├── WebSocket live stream ──► Frontend (Next.js)     │
        |                                                    │
   [ Backend ]  ── FastAPI REST + WS ── auth, CRUD, alerts ──┘
        ▲
   [ Frontend ] ── HTTP / WS ── dashboards, settings, users
```

| Service    | Tech stack                                          | Port |
|------------|-----------------------------------------------------|------|
| **backend**  | FastAPI, SQLAlchemy, Alembic, Pydantic v2, JWT    | 8000 |
| **cv**       | Ultralytics YOLO26, OpenCV, Loguru                | ---  |
| **frontend** | Next.js 14 (App Router), Tailwind, React Query, i18next | 3000 |
| **postgres** | PostgreSQL 15                                     | 5432 |

## Repository layout

```
backend/            FastAPI app, models, migrations, tests
  app/
    api/routes/     auth, sources, zones, settings, health
    scripts/        seed_admin.py
    models.py       SQLAlchemy models (users, sources, zones, detections, events, alerts, audit)
    config.py       Pydantic settings from .env
    security.py     JWT + bcrypt
  alembic/          Migration configuration
  tests/

cv/                 CV worker package
  yolo_guard/
    detector.py     YOLO26 wrapper
    pipeline.py     Capture + inference pipeline (synthetic fallback)
    worker.py       Main loop with SIGTERM handling
    config.py       Worker settings from .env
  tests/

frontend/           Next.js UI
  src/app/          App Router pages (dashboard, live, history, analytics, alerts, sources, settings, users, models)
  src/components/   Header, Sidebar, LivePreview, StatCard, EventList, etc.
  src/lib/          i18n configuration (EN/RU)

configs/            default.yaml — runtime defaults
artifacts/weights/  Model weights (yolo26n.pt)
docker/             Dockerfiles + entrypoint scripts
docs/               API and event engine docs
```

## Quick start (Docker)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) (v2+)

### 1. Clone and configure

```bash
git clone <repo-url> && cd YOLO-detection
cp .env.example .env
```

Edit `.env` if needed — defaults work out of the box:

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg2://yolo:yolo@postgres:5432/yolo_guard` | PostgreSQL connection string |
| `JWT_SECRET` | `change_me` | **Change in production!** Secret for JWT tokens |
| `ADMIN_SEED_EMAIL` | `admin@example.com` | Default admin email (created on first start) |
| `ADMIN_SEED_PASSWORD` | `admin123` | Default admin password |
| `SOURCE` | `0` | Video source (webcam index, RTSP URL, or file path) |
| `SOURCE_TYPE` | `webcam` | `webcam` / `rtsp` / `file` / `synthetic` |
| `WEIGHTS` | `artifacts/weights/yolo26n.pt` | Path to YOLO weights |
| `CAPTURE_RETRY_SEC` | `5` | Seconds between capture retries |
| `STORAGE_PATH` | `/app/storage` | Path for snapshots and exports |
| `WEBHOOK_RETRY_COUNT` | `3` | Alert webhook retry count |
| `SMTP_HOST/PORT/USER/PASSWORD` | (empty) | Optional SMTP for email alerts |

### 2. Build and start

```bash
docker compose up --build
```

Or use Make:

```bash
make dev
```

Docker Compose will:
1. Start **PostgreSQL** and wait until it's healthy (`pg_isready`)
2. Start **backend** — waits for DB, seeds admin user, runs FastAPI on `:8000`
3. Start **cv** worker — connects to DB, runs YOLO26 inference loop
4. Start **frontend** — Next.js dev server on `:3000` (waits for backend health)

### 3. Verify

```bash
# Backend health
curl http://localhost:8000/api/health
# → {"status":"ok"}

# OpenAPI docs
open http://localhost:8000/docs

# Frontend
open http://localhost:3000
```

### 4. Login

Use the seeded admin credentials:
- **Email:** `admin@example.com` (or your `ADMIN_SEED_EMAIL`)
- **Password:** `admin123` (or your `ADMIN_SEED_PASSWORD`)

```bash
# Get JWT token
curl -X POST http://localhost:8000/api/auth/login \
  -d "username=admin@example.com&password=admin123"
```

## Webcam passthrough (Linux)

To pass a host webcam into the CV container:

```bash
docker compose -f docker-compose.yml -f docker-compose.camera.yml up --build
```

This mounts `/dev/video0` into the cv container.

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/health` | --- | Health check |
| `GET` | `/api/ready` | --- | Readiness check |
| `POST` | `/api/auth/register` | --- | Register new user (role: operator) |
| `POST` | `/api/auth/login` | --- | Login, returns JWT |
| `GET` | `/api/auth/me` | JWT | Current user info |
| `GET` | `/api/sources` | JWT | List video sources |
| `POST` | `/api/sources` | admin/operator | Create source |
| `GET` | `/api/sources/{id}` | JWT | Get source |
| `PUT` | `/api/sources/{id}` | admin/operator | Update source |
| `DELETE` | `/api/sources/{id}` | admin | Delete source |
| `POST` | `/api/sources/{id}/start` | operator/admin | Start source capture |
| `POST` | `/api/sources/{id}/stop` | operator/admin | Stop source capture |
| `POST` | `/api/sources/{id}/test` | operator/admin | Test source connectivity |
| `GET` | `/api/zones` | JWT | List zones (optional `?source_id=`) |
| `POST` | `/api/zones` | admin/operator | Create zone |
| `PUT` | `/api/zones/{id}` | admin/operator | Update zone |
| `DELETE` | `/api/zones/{id}` | admin | Delete zone |
| `GET` | `/api/settings` | --- | Get runtime YOLO settings |
| `PUT` | `/api/settings` | admin/operator | Update runtime settings |

Full OpenAPI spec: [http://localhost:8000/docs](http://localhost:8000/docs)

## Database schema

```
users              sources            zones
 ├─ id              ├─ id              ├─ id
 ├─ email           ├─ name            ├─ source_id → sources.id
 ├─ password_hash   ├─ type            ├─ name
 ├─ role            ├─ url_or_index    ├─ type (rect/poly)
 ├─ created_at      ├─ enabled         ├─ points_json
 └─ last_login      └─ created_at      ├─ color
                                        └─ created_at

detections         events             alert_rules
 ├─ id              ├─ id              ├─ id
 ├─ source_id       ├─ source_id       ├─ name
 ├─ ts              ├─ zone_id         ├─ enabled
 ├─ detections_json ├─ class_name      ├─ conditions_json
 ├─ latency_ms      ├─ type            ├─ actions_json
 ├─ frame_w         ├─ start_ts        ├─ cooldown_sec
 └─ frame_h         ├─ end_ts          └─ created_at
                    ├─ max_count
                    ├─ avg_conf        alert_logs
                    ├─ snapshot_path    ├─ id
                    └─ meta_json        ├─ rule_id → alert_rules.id
                                        ├─ event_id → events.id
audit_logs                              ├─ ts
 ├─ id                                  ├─ status
 ├─ user_id → users.id                 └─ response_json
 ├─ action
 ├─ entity_type
 ├─ entity_id
 ├─ ts
 └─ diff_json
```

## Common commands

```bash
# Docker
docker compose up --build          # Build and start everything
docker compose up -d               # Start in background
docker compose down                # Stop all services
docker compose logs -f backend     # Follow backend logs
docker compose logs -f cv          # Follow CV worker logs
docker compose exec backend sh     # Shell into backend container

# Make shortcuts
make dev                           # docker compose up --build
make up                            # docker compose up
make down                          # docker compose down
make test                          # Run backend + CV tests
make lint                          # Run linters
make format                        # Apply formatters
make migrate                       # Alembic upgrade head
make seed-admin                    # Seed admin user
make backend-shell                 # Shell into backend container
make help                          # Show all targets
```

## Local development (without Docker)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
# Set DATABASE_URL to a local Postgres or SQLite
pytest                             # Run tests
uvicorn app.main:app --reload      # Start dev server on :8000

# CV worker
cd cv
pip install -r requirements.txt -r requirements-dev.txt
pytest                             # Run tests (uses synthetic frames)
python -m yolo_guard.worker        # Start worker

# Frontend
cd frontend
npm ci
npm run dev                        # Start Next.js on :3000
```

## YOLO weights

By default the platform expects `yolo26n.pt` in `artifacts/weights/`.
If the file is missing, Ultralytics will auto-download it on first run.

To use a custom model:
1. Place weights in `artifacts/weights/your_model.pt`
2. Set `WEIGHTS=artifacts/weights/your_model.pt` in `.env`
3. Or update at runtime: `PUT /api/settings {"weights": "/app/artifacts/weights/your_model.pt"}`

## Runtime settings

YOLO inference parameters can be changed at runtime via API without restarting:

```bash
curl -X PUT http://localhost:8000/api/settings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"conf": 0.3, "iou": 0.5, "imgsz": 1280}'
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `conf` | 0.25 | Confidence threshold |
| `iou` | 0.45 | IoU threshold for NMS |
| `imgsz` | 640 | Inference image size |
| `weights` | `/app/artifacts/weights/yolo26n.pt` | Model weights path |
| `ws_hz` | 10 | WebSocket broadcast frequency |
| `jpeg_quality` | 85 | JPEG quality for streamed frames |

## Testing

```bash
# All tests
make test

# Backend only
cd backend && pytest -v

# CV only
cd cv && pytest -v
```

## Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full access: CRUD sources/zones, delete, manage users, settings |
| **operator** | Create/update sources/zones, change settings, start/stop sources |
| **viewer** | Read-only access to sources, zones, events |

New users registered via `/api/auth/register` always get the **operator** role.
Admin users are created via the seed script (`ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`).

## License

Private project.
