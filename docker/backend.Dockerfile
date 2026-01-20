FROM python:3.11-slim

WORKDIR /app/backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y build-essential ffmpeg && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
COPY backend/requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend /app/backend
COPY configs /app/configs

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
