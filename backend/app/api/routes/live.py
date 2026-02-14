from __future__ import annotations

import asyncio

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from ...live_events import live_event_hub

router = APIRouter(prefix="/api/live", tags=["live"])


@router.get("/events")
async def live_events(request: Request) -> StreamingResponse:
    queue = await live_event_hub.subscribe()

    async def event_stream():
        try:
            yield "retry: 2500\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    payload = await asyncio.wait_for(queue.get(), timeout=15)
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
                    continue

                yield f"data: {payload}\n\n"
        finally:
            await live_event_hub.unsubscribe(queue)

    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }
    return StreamingResponse(event_stream(), media_type="text/event-stream", headers=headers)
