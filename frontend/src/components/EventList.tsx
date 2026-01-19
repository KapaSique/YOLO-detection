"use client";

import { Clock3, Dot } from "lucide-react";

const demoEvents = [
  { ts: "10:14:03", source: "Dock-RTSP", label: "person", zone: "A", status: "presence_start", confidence: 0.92 },
  { ts: "10:13:50", source: "Dock-RTSP", label: "car", zone: "B", status: "threshold_exceeded", confidence: 0.81 },
  { ts: "10:12:10", source: "Yard-Cam", label: "person", zone: "Gate", status: "presence_end", confidence: 0.77 }
];

export function EventList() {
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Live events</h3>
        <Clock3 size={16} />
      </div>
      <div className="space-y-2">
        {demoEvents.map((event) => (
          <div key={event.ts} className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm">
            <div className="flex items-center gap-2">
              <Dot className="text-emerald-400" />
              <div>
                <div className="font-semibold">{event.label}</div>
                <div className="text-xs text-neutral-500">
                  {event.source} • zone {event.zone}
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-neutral-500">
              <div className="font-semibold text-neutral-900 dark:text-white">{event.status}</div>
              <div className="text-neutral-500">{event.ts}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
