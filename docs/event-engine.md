# Event Engine (draft)

Goal: turn raw detections into higher-level events and alert triggers.

Concepts:
- **Presence**: track if a class is inside a zone/source; emit `presence_start` / `presence_end`.
- **Threshold**: emit `threshold_exceeded` when count > K for configured duration.
- **Loitering** (later): emit when the same track stays beyond N seconds.
- **Alerts**: evaluate rules (sources/zones/classes/min_count/min_duration/active window) and dispatch webhooks/email/telegram with retry/backoff + cooldown.

Data flow:
1) CV worker ingests frame -> YOLO detections (bbox, class_id/name, confidence, track_id?, latency, timestamp).
2) Zone intersection (polygon/rect) to mark detections per zone.
3) Presence tracker per (source, zone, class) with timers for duration thresholds.
4) Persist detections/events to DB, capture snapshot path, publish over WebSocket to frontend.
5) Alert evaluator consumes events, handles deduplication + cooldown, logs results to `alert_logs`.

Metrics to expose:
- fps per source, inference latency, queue size, WS clients count, alert success/fail counts.
