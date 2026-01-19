# API Overview

- OpenAPI docs: http://localhost:8000/docs
- Health: `GET /api/health`, `GET /api/ready`
- Auth: `POST /api/auth/login` (OAuth2 form), `POST /api/auth/register`, `GET /api/auth/me`
- Sources: `GET/POST /api/sources`, `GET/PUT/DELETE /api/sources/{id}`, `POST /api/sources/{id}/start|stop|test`
- Zones: `GET /api/zones?source_id=`, `POST /api/zones`, `PUT /api/zones/{id}`, `DELETE /api/zones/{id}`
- Settings: `GET/PUT /api/settings`

Planned additions:
- Events/Detections queries, analytics endpoints, alert rules/logs, export endpoints, websocket feeds for live detections and metrics.
