FROM python:3.11-slim

WORKDIR /app/cv

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y build-essential ffmpeg libgl1 && rm -rf /var/lib/apt/lists/*

COPY cv/requirements.txt .
COPY cv/requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY cv /app/cv
COPY configs /app/configs

CMD ["python", "-m", "yolo_guard.worker"]
