"use client";

import { Clock3, Dot } from "lucide-react";

const demoEvents = [
  { ts: "10:14:03", source: "Dock-RTSP", label: "person", zone: "A", status: "presence_start", confidence: 0.92 },
  { ts: "10:13:50", source: "Dock-RTSP", label: "car", zone: "B", status: "threshold_exceeded", confidence: 0.81 },
  { ts: "10:12:10", source: "Yard-Cam", label: "person", zone: "Gate", status: "presence_end", confidence: 0.77 }
];

export function EventList() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Live events</h3>
        <Clock3 size={16} className="text-muted-foreground" />
      </div>
      <div className="space-y-2">
        {demoEvents.map((event) => (
          <div key={event.ts} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
            <div className="flex items-center gap-2">
              <Dot className="text-foreground" />
              <div>
                <div className="font-semibold text-card-foreground">{event.label}</div>
                <div className="text-xs text-muted-foreground">
                  {event.source} · zone {event.zone}
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div className="font-semibold text-foreground">{event.status}</div>
              <div>{event.ts}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
