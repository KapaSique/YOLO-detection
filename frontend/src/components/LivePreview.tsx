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
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
          <Video size={18} /> Live stream
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
              running
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground"
            }`}
            onClick={() => setRunning((v) => !v)}
          >
            {running ? <Square size={14} /> : <Play size={14} />}
            {running ? t("stopStream") : t("startStream")}
          </button>
        </div>
      </div>

      <div className="flex h-[360px] items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
        <p className="text-sm text-muted-foreground">
          {running ? "Stream active — no video source connected" : "Press Start to begin streaming"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1 rounded-md border border-border bg-muted/50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("confThreshold")}</span>
            <span className="font-semibold">{Math.round(conf * 100)}%</span>
          </div>
          <input
            className="w-full accent-foreground"
            type="range"
            min="0.05"
            max="0.9"
            step="0.01"
            value={conf}
            onChange={(e) => setConf(parseFloat(e.target.value))}
          />
        </div>
        <div className="space-y-1 rounded-md border border-border bg-muted/50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("iouThreshold")}</span>
            <span className="font-semibold">{Math.round(iou * 100)}%</span>
          </div>
          <input
            className="w-full accent-foreground"
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
