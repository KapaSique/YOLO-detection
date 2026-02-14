"use client";

import { BarChart3 } from "lucide-react";

const samples = [
  { label: "09:10", value: 12 },
  { label: "09:20", value: 18 },
  { label: "09:30", value: 25 },
  { label: "09:40", value: 17 },
  { label: "09:50", value: 30 }
];

export function AnalyticsPreview() {
  const max = Math.max(...samples.map((s) => s.value));
  return (
    <div className="surface-card overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-card-foreground">
          <BarChart3 size={16} className="text-accent" />
          Detections timeline
        </div>
        <span className="rounded-full border border-accent/35 bg-accent/12 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
          Realtime
        </span>
      </div>
      <div className="flex h-36 items-end gap-2 px-5 pb-4 pt-4">
        {samples.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-sm bg-accent/80 transition-all hover:bg-accent"
              style={{ height: `${(item.value / max) * 100}%`, minHeight: 8 }}
              title={`${item.value} detections`}
            />
            <div className="font-mono-ui text-[10px] text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
