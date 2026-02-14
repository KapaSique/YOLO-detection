"use client";

import { Clock3 } from "lucide-react";

const demoEvents = [
  { ts: "10:14:03", source: "Dock-RTSP", label: "person", zone: "A", status: "presence_start", confidence: 0.92 },
  { ts: "10:13:50", source: "Dock-RTSP", label: "car", zone: "B", status: "threshold_exceeded", confidence: 0.81 },
  { ts: "10:12:10", source: "Yard-Cam", label: "person", zone: "Gate", status: "presence_end", confidence: 0.77 }
];

export function EventList() {
  return (
    <div className="surface-card overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
        <h3 className="text-sm font-semibold text-card-foreground">Live events</h3>
        <Clock3 size={14} className="text-muted-foreground" />
      </div>
      <div className="divide-y divide-border/70">
        {demoEvents.map((event) => (
          <div key={event.ts} className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-muted/35">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
              <div>
                <div className="text-sm font-medium text-card-foreground">{event.label}</div>
                <div className="text-xs text-muted-foreground">
                  {event.source} · zone {event.zone}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono-ui text-xs font-medium text-foreground">{event.status}</div>
              <div className="font-mono-ui text-[11px] text-muted-foreground">{event.ts}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
