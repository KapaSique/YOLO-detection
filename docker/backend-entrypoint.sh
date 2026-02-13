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

echo "Starting backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
