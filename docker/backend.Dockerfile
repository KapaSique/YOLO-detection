FROM python:3.11-slim

WORKDIR /app/backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y build-essential ffmpeg curl && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
COPY backend/requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend /app/backend
COPY configs /app/configs
COPY docker/backend-entrypoint.sh /app/backend-entrypoint.sh
RUN chmod +x /app/backend-entrypoint.sh

EXPOSE 8000

CMD ["/app/backend-entrypoint.sh"]
