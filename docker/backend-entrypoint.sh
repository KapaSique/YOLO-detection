#!/usr/bin/env bash
set -e

echo "Waiting for PostgreSQL..."
until python -c "
import sqlalchemy, os
engine = sqlalchemy.create_engine(os.environ['DATABASE_URL'])
engine.connect().close()
" 2>/dev/null; do
  echo "  Postgres not ready, retrying in 2s..."
  sleep 2
done
echo "PostgreSQL is ready."

echo "Seeding admin user..."
python -m app.scripts.seed_admin || true

BACKEND_RELOAD="${BACKEND_RELOAD:-true}"
RELOAD_ARGS=()
if [ "$BACKEND_RELOAD" = "true" ] || [ "$BACKEND_RELOAD" = "1" ]; then
  echo "Backend autoreload is enabled."
  RELOAD_ARGS=(--reload --reload-dir /app/backend/app)
fi

echo "Starting backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 "${RELOAD_ARGS[@]}"
