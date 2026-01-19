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
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BarChart3 size={16} />
          Detections timeline
        </div>
        <span className="rounded-full bg-brand/10 px-2 py-1 text-xs font-semibold text-brand">Realtime</span>
      </div>
      <div className="flex h-40 items-end gap-3">
        {samples.map((item) => (
          <div key={item.label} className="flex-1">
            <div
              className="gradient-pill relative w-full rounded-xl"
              style={{ height: `${(item.value / max) * 100}%`, minHeight: 12 }}
              title={`${item.value} detections`}
            />
            <div className="mt-2 text-center text-xs text-neutral-500">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
