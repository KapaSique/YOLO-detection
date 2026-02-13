<div align="center">

# 🛡️ YOLO Guard

### Платформа детекции объектов в реальном времени

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![YOLO](https://img.shields.io/badge/YOLO26-Ultralytics-FF6F00?style=for-the-badge&logo=yolo&logoColor=white)](https://docs.ultralytics.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

<br>

Захватывает видео с веб-камер, RTSP-потоков и файлов, прогоняет через **YOLO26**,
стримит детекции по WebSocket, сохраняет события в PostgreSQL
и показывает всё через дашборды на Next.js.

<br>

[Быстрый старт](#-быстрый-старт) •
[API](#-api-эндпоинты) •
[Команды](#-полезные-команды) •
[Тесты](#-тестирование)

</div>

---

## 🏗️ Архитектура

```
┌──────────────────┐
│ Камера / RTSP /  │
│      Файл        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     детекции     ┌──────────────────┐
│    CV Worker     ├─────────────────►│   PostgreSQL 15  │
│  (YOLO26 + OCV) │                   └────────▲─────────┘
└────────┬─────────┘                           │
         │ WebSocket                           │
         ▼                                     │
┌──────────────────┐   REST / WS    ┌──────────┴─────────┐
│    Frontend      │◄──────────────►│     Backend        │
│  (Next.js 14)    │                │    (FastAPI)       │
└──────────────────┘                └────────────────────┘
```

| Сервис | Технологии | Порт |
|--------|-----------|------|
| **backend** | FastAPI, SQLAlchemy, Alembic, Pydantic v2, JWT + bcrypt | `8000` |
| **cv** | Ultralytics YOLO26, OpenCV, Loguru | — |
| **frontend** | Next.js 14 (App Router), Tailwind CSS, React Query, i18next | `3000` |
| **postgres** | PostgreSQL 15 Alpine | `5432` |

---

## 📁 Структура проекта

```
├── backend/                 FastAPI-приложение
│   ├── app/
│   │   ├── api/routes/      auth, sources, zones, settings, health
│   │   ├── scripts/         seed_admin.py — создание админа
│   │   ├── models.py        SQLAlchemy-модели (8 таблиц)
│   │   ├── config.py        Настройки из .env (Pydantic Settings)
│   │   ├── security.py      JWT-токены + bcrypt-хеширование
│   │   └── schemas.py       Pydantic-схемы запросов/ответов
│   ├── alembic/             Миграции БД
│   └── tests/               Тесты backend
│
├── cv/                      CV-воркер
│   ├── yolo_guard/
│   │   ├── detector.py      Обёртка над YOLO26
│   │   ├── pipeline.py      Захват + инференс (synthetic fallback)
│   │   ├── worker.py        Основной цикл + graceful shutdown
│   │   └── config.py        Настройки воркера из .env
│   └── tests/               Тесты CV
│
├── frontend/                Next.js UI
│   ├── src/app/             Страницы: dashboard, live, history и др.
│   ├── src/components/      Header, Sidebar, LivePreview, StatCard...
│   └── src/lib/             i18n (EN/RU)
│
├── configs/                 default.yaml — дефолтные настройки
├── artifacts/weights/       Веса модели (yolo26n.pt)
├── docker/                  Dockerfile'ы + entrypoint-скрипты
├── docs/                    Документация (API, event engine)
├── docker-compose.yml       Основной compose-файл
├── docker-compose.camera.yml Оверлей для проброса веб-камеры
├── Makefile                 Make-команды
└── .env.example             Шаблон переменных окружения
```

---

## 🚀 Быстрый старт

### Требования

- [Docker](https://docs.docker.com/get-docker/) и [Docker Compose](https://docs.docker.com/compose/install/) v2+

### 1. Клонировать и настроить

```bash
git clone <repo-url> && cd YOLO-detection
cp .env.example .env
```

### 2. Собрать и запустить

```bash
docker compose up --build
```

Или через Make:

```bash
make dev
```

> **Что происходит при запуске:**
> 1. Поднимается **PostgreSQL** — ждём пока `pg_isready` вернёт OK
> 2. Стартует **backend** — ждёт БД, создаёт админа из `.env`, запускает FastAPI на `:8000`
> 3. Стартует **cv** воркер — подключается к БД, гоняет YOLO26-инференс
> 4. Стартует **frontend** — Next.js на `:3000` (ждёт пока backend будет healthy)

### 3. Проверить

```bash
# Здоровье backend
curl http://localhost:8000/api/health
# → {"status":"ok"}

# OpenAPI документация
open http://localhost:8000/docs

# Фронтенд
open http://localhost:3000
```

### 4. Войти

Используйте данные админа, созданного при первом запуске:

| | Значение |
|---|---|
| **Email** | `admin@example.com` |
| **Пароль** | `admin123` |

```bash
# Получить JWT-токен
curl -X POST http://localhost:8000/api/auth/login \
  -d "username=admin@example.com&password=admin123"
```

---

## ⚙️ Переменные окружения

Настраиваются в файле `.env` (скопируйте из `.env.example`):

| Переменная | По умолчанию | Описание |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg2://yolo:yolo@postgres:5432/yolo_guard` | Строка подключения к PostgreSQL |
| `JWT_SECRET` | `change_me` | **Сменить в продакшене!** Секрет для JWT |
| `ADMIN_SEED_EMAIL` | `admin@example.com` | Email админа (создаётся при первом запуске) |
| `ADMIN_SEED_PASSWORD` | `admin123` | Пароль админа |
| `SOURCE` | `0` | Источник видео (индекс камеры / RTSP URL / путь к файлу) |
| `SOURCE_TYPE` | `webcam` | Тип: `webcam` / `rtsp` / `file` / `synthetic` |
| `WEIGHTS` | `artifacts/weights/yolo26n.pt` | Путь к весам YOLO |
| `CAPTURE_RETRY_SEC` | `5` | Секунд между попытками захвата |
| `STORAGE_PATH` | `/app/storage` | Путь для снапшотов и экспорта |
| `WEBHOOK_RETRY_COUNT` | `3` | Количество повторов вебхука алертов |
| `SMTP_HOST` / `PORT` / `USER` / `PASSWORD` | (пусто) | SMTP для email-алертов (опционально) |

---

## 🎥 Проброс веб-камеры (Linux)

Для проброса `/dev/video0` в контейнер CV-воркера:

```bash
docker compose -f docker-compose.yml -f docker-compose.camera.yml up --build
```

---

## 📡 API-эндпоинты

### Авторизация

| Метод | Путь | Доступ | Описание |
|-------|------|--------|----------|
| `POST` | `/api/auth/register` | — | Регистрация (роль: operator) |
| `POST` | `/api/auth/login` | — | Вход, возвращает JWT |
| `GET` | `/api/auth/me` | JWT | Текущий пользователь |

### Источники видео

| Метод | Путь | Доступ | Описание |
|-------|------|--------|----------|
| `GET` | `/api/sources` | JWT | Список источников |
| `POST` | `/api/sources` | admin / operator | Создать источник |
| `GET` | `/api/sources/{id}` | JWT | Получить источник |
| `PUT` | `/api/sources/{id}` | admin / operator | Обновить источник |
| `DELETE` | `/api/sources/{id}` | admin | Удалить источник |
| `POST` | `/api/sources/{id}/start` | admin / operator | Запустить захват |
| `POST` | `/api/sources/{id}/stop` | admin / operator | Остановить захват |
| `POST` | `/api/sources/{id}/test` | admin / operator | Тест подключения |

### Зоны

| Метод | Путь | Доступ | Описание |
|-------|------|--------|----------|
| `GET` | `/api/zones` | JWT | Список зон (`?source_id=` для фильтра) |
| `POST` | `/api/zones` | admin / operator | Создать зону |
| `PUT` | `/api/zones/{id}` | admin / operator | Обновить зону |
| `DELETE` | `/api/zones/{id}` | admin | Удалить зону |

### Настройки и мониторинг

| Метод | Путь | Доступ | Описание |
|-------|------|--------|----------|
| `GET` | `/api/settings` | — | Текущие настройки YOLO |
| `PUT` | `/api/settings` | admin / operator | Изменить настройки |
| `GET` | `/api/health` | — | Проверка здоровья |
| `GET` | `/api/ready` | — | Проверка готовности |

> Полная OpenAPI-спецификация: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🗄️ Схема базы данных

```
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│     users      │    │    sources     │    │     zones      │
├────────────────┤    ├────────────────┤    ├────────────────┤
│ id             │    │ id             │    │ id             │
│ email          │    │ name           │◄───│ source_id (FK) │
│ password_hash  │    │ type           │    │ name           │
│ role           │    │ url_or_index   │    │ type           │
│ created_at     │    │ enabled        │    │ points_json    │
│ last_login     │    │ created_at     │    │ color          │
└───────┬────────┘    └───────┬────────┘    │ created_at     │
        │                     │             └────────────────┘
        │                     │
        │                     ▼
        │             ┌────────────────┐    ┌────────────────┐
        │             │  detections    │    │    events      │
        │             ├────────────────┤    ├────────────────┤
        │             │ id             │    │ id             │
        │             │ source_id (FK) │    │ source_id (FK) │
        │             │ ts             │    │ zone_id (FK)   │
        │             │ detections_json│    │ class_name     │
        │             │ latency_ms     │    │ type           │
        │             │ frame_w        │    │ start_ts       │
        │             │ frame_h        │    │ end_ts         │
        │             └────────────────┘    │ max_count      │
        │                                   │ avg_conf       │
        ▼                                   │ snapshot_path  │
┌────────────────┐                          │ meta_json      │
│  audit_logs    │                          └────────────────┘
├────────────────┤
│ id             │    ┌────────────────┐    ┌────────────────┐
│ user_id (FK)   │    │  alert_rules   │    │  alert_logs    │
│ action         │    ├────────────────┤    ├────────────────┤
│ entity_type    │    │ id             │◄───│ rule_id (FK)   │
│ entity_id      │    │ name           │    │ event_id (FK)  │
│ ts             │    │ enabled        │    │ ts             │
│ diff_json      │    │ conditions_json│    │ status         │
└────────────────┘    │ actions_json   │    │ response_json  │
                      │ cooldown_sec   │    └────────────────┘
                      │ created_at     │
                      └────────────────┘
```

---

## 🎯 Настройки YOLO в рантайме

Параметры инференса можно менять на лету через API — без перезапуска:

```bash
curl -X PUT http://localhost:8000/api/settings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"conf": 0.3, "iou": 0.5, "imgsz": 1280}'
```

| Параметр | По умолчанию | Описание |
|----------|-------------|----------|
| `conf` | `0.25` | Порог уверенности |
| `iou` | `0.45` | Порог IoU для NMS |
| `imgsz` | `640` | Размер изображения для инференса |
| `weights` | `/app/artifacts/weights/yolo26n.pt` | Путь к весам модели |
| `ws_hz` | `10` | Частота отправки по WebSocket (Гц) |
| `jpeg_quality` | `85` | Качество JPEG для стрима |

---

## 🏋️ Веса YOLO

По умолчанию платформа ищет `yolo26n.pt` в `artifacts/weights/`.
Если файл отсутствует — Ultralytics скачает его автоматически при первом запуске.

**Использование своей модели:**

1. Положите веса в `artifacts/weights/your_model.pt`
2. Укажите путь в `.env`: `WEIGHTS=artifacts/weights/your_model.pt`
3. Или обновите на лету: `PUT /api/settings {"weights": "/app/artifacts/weights/your_model.pt"}`

---

## 🧰 Полезные команды

### Docker

```bash
docker compose up --build          # Собрать и запустить всё
docker compose up -d               # Запустить в фоне
docker compose down                # Остановить все сервисы
docker compose logs -f backend     # Логи backend
docker compose logs -f cv          # Логи CV-воркера
docker compose exec backend sh     # Шелл в контейнере backend
```

### Make

```bash
make dev              # docker compose up --build
make up               # docker compose up
make down             # docker compose down
make test             # Тесты backend + CV
make lint             # Линтеры
make format           # Форматирование кода
make migrate          # Alembic upgrade head
make seed-admin       # Создать админа
make backend-shell    # Шелл в backend-контейнере
make help             # Показать все команды
```

---

## 🧪 Тестирование

```bash
# Все тесты
make test

# Только backend
cd backend && pytest -v

# Только CV
cd cv && pytest -v
```

Backend-тесты используют SQLite in-memory, CV-тесты — синтетические фреймы. GPU не требуется.

---

## 🔐 Роли и доступ

| Роль | Права |
|------|-------|
| **admin** | Полный доступ: CRUD источников/зон, удаление, управление пользователями, настройки |
| **operator** | Создание/обновление источников и зон, изменение настроек, старт/стоп захвата |
| **viewer** | Только чтение: просмотр источников, зон, событий |

> Новые пользователи через `/api/auth/register` всегда получают роль **operator**.
> Админ создаётся автоматически при первом запуске из переменных `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`.

---

## 💻 Локальная разработка (без Docker)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
pytest                             # Тесты
uvicorn app.main:app --reload      # Dev-сервер на :8000

# CV-воркер
cd cv
pip install -r requirements.txt -r requirements-dev.txt
pytest                             # Тесты (синтетические фреймы)
python -m yolo_guard.worker        # Запуск воркера

# Frontend
cd frontend
npm ci
npm run dev                        # Next.js на :3000
```

---

<div align="center">

**YOLO Guard** — детекция объектов в реальном времени на базе YOLO26

FastAPI • Next.js • PostgreSQL • Docker

</div>
