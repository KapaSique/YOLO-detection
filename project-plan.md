 Plan to implement                                                                                                    │
│                                                                                                                      │
│ Plan: Fix Backend + Upgrade to YOLO26 + Project Improvements                                                         │
│                                                                                                                      │
│ Context                                                                                                              │
│                                                                                                                      │
│ Backend постоянно падает в Docker из-за ряда критических багов (deprecated datetime.utcnow(), отсутствующие импорты, │
│  нет ожидания готовности Postgres). Также нужно обновить YOLO с v8 на YOLO26 (ultralytics 8.4+), и провести общее    │
│ улучшение проекта.                                                                                                   │
│                                                                                                                      │
│ ---                                                                                                                  │
│ 1. Fix critical backend bugs                                                                                         │
│                                                                                                                      │
│ 1.1 datetime.utcnow() — deprecated в Python 3.12+, крашит на старте                                                  │
│                                                                                                                      │
│ Files: backend/app/models.py, backend/app/api/routes/auth.py                                                         │
│ - Заменить все datetime.utcnow → lambda: datetime.now(timezone.utc) в default= полях моделей (8 мест в models.py)    │
│ - Добавить from datetime import datetime, timezone в models.py                                                       │
│ - Исправить user.last_login = datetime.utcnow() → datetime.now(timezone.utc) в auth.py                               │
│ - Добавить from datetime import datetime, timezone в auth.py, убрать дублирующий import timedelta                    │
│                                                                                                                      │
│ 1.2 Security: регистрация позволяет любому стать admin                                                               │
│                                                                                                                      │
│ File: backend/app/api/routes/auth.py                                                                                 │
│ - Убрать role из UserCreate — новые пользователи всегда получают Role.operator                                       │
│ - User(email=..., password_hash=..., role=Role.operator) вместо role=payload.role                                    │
│                                                                                                                      │
│ File: backend/app/schemas.py                                                                                         │
│ - Убрать role из UserCreate, оставить только в UserBase/UserRead                                                     │
│                                                                                                                      │
│ 1.3 Missing datetime import в auth.py                                                                                │
│                                                                                                                      │
│ - datetime не импортирован, но используется на line 44 — крашит при логине                                           │
│                                                                                                                      │
│ ---                                                                                                                  │
│ 2. Fix Docker infrastructure                                                                                         │
│                                                                                                                      │
│ 2.1 Postgres healthcheck + depends_on condition                                                                      │
│                                                                                                                      │
│ File: docker-compose.yml                                                                                             │
│ - Добавить healthcheck для postgres: pg_isready -U yolo                                                              │
│ - Backend и CV: depends_on: postgres: condition: service_healthy                                                     │
│                                                                                                                      │
│ 2.2 Backend entrypoint script — ждёт БД, сидит admin, стартует                                                       │
│                                                                                                                      │
│ New file: docker/backend-entrypoint.sh                                                                               │
│ - Wait for DB ready (loop pg_isready или python-скрипт)                                                              │
│ - Run python -m app.scripts.seed_admin                                                                               │
│ - Exec uvicorn app.main:app --host 0.0.0.0 --port 8000                                                               │
│                                                                                                                      │
│ File: docker/backend.Dockerfile                                                                                      │
│ - COPY entrypoint, CMD → entrypoint                                                                                  │
│                                                                                                                      │
│ 2.3 Healthcheck для backend service                                                                                  │
│                                                                                                                      │
│ File: docker-compose.yml                                                                                             │
│ - healthcheck: curl -f http://localhost:8000/api/health                                                              │
│                                                                                                                      │
│ 2.4 Frontend: npm ci вместо npm install                                                                              │
│                                                                                                                      │
│ File: docker/frontend.Dockerfile                                                                                     │
│ - RUN npm ci для детерминированных билдов                                                                            │
│                                                                                                                      │
│ ---                                                                                                                  │
│ 3. Upgrade to YOLO26                                                                                                 │
│                                                                                                                      │
│ 3.1 Update ultralytics version                                                                                       │
│                                                                                                                      │
│ Files:                                                                                                               │
│ - cv/requirements.txt: ultralytics==8.1.24 → ultralytics>=8.4.0                                                      │
│ - configs/default.yaml: weights yolov8n.pt → yolo26n.pt                                                              │
│ - cv/yolo_guard/config.py: default weights → yolo26n.pt                                                              │
│ - backend/app/api/routes/settings.py: weights path → yolo26n.pt                                                      │
│ - .env.example: WEIGHTS=artifacts/weights/yolo26n.pt                                                                 │
│ - README.md: обновить все упоминания YOLOv8 → YOLO26                                                                 │
│                                                                                                                      │
│ 3.2 Fix weights path issue                                                                                           │
│                                                                                                                      │
│ CV worker WORKDIR = /app/cv, но weights volume монтируется в /app/artifacts/weights.                                 │
│ - Изменить default weights path в cv/yolo_guard/config.py на /app/artifacts/weights/yolo26n.pt (абсолютный путь для  │
│ Docker)                                                                                                              │
│ - Или: использовать просто yolo26n.pt и позволить ultralytics auto-download                                          │
│                                                                                                                      │
│ ---                                                                                                                  │
│ 4. Fix CV worker                                                                                                     │
│                                                                                                                      │
│ 4.1 SIGTERM handling                                                                                                 │
│                                                                                                                      │
│ File: cv/yolo_guard/worker.py                                                                                        │
│ - Добавить signal.signal(signal.SIGTERM, ...) для graceful shutdown в Docker                                         │
│                                                                                                                      │
│ 4.2 Fix test                                                                                                         │
│                                                                                                                      │
│ File: cv/tests/test_pipeline.py                                                                                      │
│ - source_type="file" → source_type="synthetic" (соответствие source="synthetic")                                     │
│                                                                                                                      │
│ ---                                                                                                                  │
│ 5. Sync .env с .env.example                                                                                          │
│                                                                                                                      │
│ File: .env                                                                                                           │
│ - Добавить отсутствующие CV переменные: SOURCE, SOURCE_TYPE, WEIGHTS, CAPTURE_RETRY_SEC                              │
│                                                                                                                      │
│ ---                                                                                                                  │
│ 6. Minor frontend fix                                                                                                │
│                                                                                                                      │
│ File: frontend/next.config.js                                                                                        │
│ - Убрать i18n секцию (не работает с App Router, используется react-i18next)                                          │
│                                                                                                                      │
│ ---                                                                                                                  │
│ Files to modify (summary)                                                                                            │
│                                                                                                                      │
│ 1. backend/app/models.py — datetime fix (8 мест)                                                                     │
│ 2. backend/app/api/routes/auth.py — datetime fix, duplicate import, role fix                                         │
│ 3. backend/app/schemas.py — remove role from UserCreate                                                              │
│ 4. backend/app/security.py — (ok, уже правильный)                                                                    │
│ 5. backend/app/api/routes/settings.py — weights path                                                                 │
│ 6. docker-compose.yml — healthchecks, depends_on conditions                                                          │
│ 7. docker/backend.Dockerfile — entrypoint                                                                            │
│ 8. docker/backend-entrypoint.sh — NEW entrypoint script                                                              │
│ 9. docker/frontend.Dockerfile — npm ci                                                                               │
│ 10. cv/requirements.txt — ultralytics version                                                                        │
│ 11. cv/yolo_guard/config.py — weights path + default                                                                 │
│ 12. cv/yolo_guard/worker.py — SIGTERM handling                                                                       │
│ 13. cv/tests/test_pipeline.py — fix source_type                                                                      │
│ 14. configs/default.yaml — yolo26n.pt                                                                                │
│ 15. .env.example — YOLO26 weights                                                                                    │
│ 16. .env — sync with example                                                                                         │
│ 17. frontend/next.config.js — remove i18n                                                                            │
│ 18. README.md — update YOLO version references                                                                       │
│                                                                                                                      │
│ Verification                                                                                                         │
│                                                                                                                      │
│ 1. cd backend && python -c "from app.main import app; print('OK')" — backend imports OK                              │
│ 2. cd backend && pytest — tests pass                                                                                 │
│ 3. cd cv && pytest — CV tests pass                                                                                   │
│ 4. docker-compose up --build — all services start without crashes                                                    │
│ 5. curl http://localhost:8000/api/health — backend responds                                                          │
╰──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
