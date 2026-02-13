"use client";

import { Play, Square, Video } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function LivePreview() {
  const { t } = useTranslation();
  const [conf, setConf] = useState(0.25);
  const [iou, setIou] = useState(0.45);
  const [running, setRunning] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-card-foreground">
          <Video size={18} className="text-primary" />
          Live stream
        </div>
        <button
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            running
              ? "bg-red-500 text-white shadow-lg shadow-red-500/25 hover:bg-red-600"
              : "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110"
          }`}
          onClick={() => setRunning((v) => !v)}
        >
          {running ? <Square size={14} /> : <Play size={14} />}
          {running ? t("stopStream") : t("startStream")}
        </button>
      </div>

      <div className="flex h-[320px] items-center justify-center bg-black/90">
        <p className="text-sm text-zinc-500">
          {running ? "Stream active" : "Press Start to begin"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-border bg-border">
        <div className="space-y-2 bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("confThreshold")}</span>
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-bold tabular-nums">
              {Math.round(conf * 100)}%
            </span>
          </div>
          <input
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            type="range"
            min="0.05"
            max="0.9"
            step="0.01"
            value={conf}
            onChange={(e) => setConf(parseFloat(e.target.value))}
          />
        </div>
        <div className="space-y-2 bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("iouThreshold")}</span>
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-bold tabular-nums">
              {Math.round(iou * 100)}%
            </span>
          </div>
          <input
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            type="range"
            min="0.1"
            max="0.95"
            step="0.01"
            value={iou}
            onChange={(e) => setIou(parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
