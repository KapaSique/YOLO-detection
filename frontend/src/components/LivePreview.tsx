"use client";

import { AlertCircle, Play, Square, Video } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { WebcamFeed } from "./WebcamFeed";

export function LivePreview() {
  const { t } = useTranslation();
  const [conf, setConf] = useState(0.25);
  const [iou, setIou] = useState(0.45);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((message: string) => {
    setError(message);
    setRunning(false);
  }, []);

  const handleToggle = () => {
    setError(null);
    setRunning((current) => !current);
  };

  return (
    <div className="surface-card overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-card-foreground">
          <Video size={18} className="text-accent" />
          Live stream
        </div>
        <button
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            running
              ? "border border-red-300/20 bg-red-500/90 text-white hover:bg-red-500"
              : "border border-primary/20 bg-primary text-primary-foreground hover:opacity-95"
          }`}
          onClick={handleToggle}
        >
          {running ? <Square size={14} /> : <Play size={14} />}
          {running ? t("stopStream") : t("startStream")}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 border-b border-red-500/20 bg-red-500/10 px-5 py-2.5 text-sm text-red-400">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="relative h-[360px] bg-black p-3">
        <WebcamFeed running={running} onError={handleError} />
        <div className="font-mono-ui absolute bottom-7 left-7 z-20 rounded-md border border-white/15 bg-black/60 px-2.5 py-1 text-xs text-zinc-100">
          FPS 18.3
        </div>
        <div className="font-mono-ui absolute bottom-7 left-28 z-20 rounded-md border border-white/15 bg-black/60 px-2.5 py-1 text-xs text-zinc-100">
          41 ms
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-border/70 bg-border/70">
        <div className="space-y-2 bg-card/85 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("confThreshold")}</span>
            <span className="font-mono-ui rounded-md bg-secondary px-2 py-0.5 text-xs font-bold tabular-nums">
              {Math.round(conf * 100)}%
            </span>
          </div>
          <input
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-accent [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
            type="range"
            min="0.05"
            max="0.9"
            step="0.01"
            value={conf}
            onChange={(e) => setConf(parseFloat(e.target.value))}
          />
        </div>
        <div className="space-y-2 bg-card/85 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("iouThreshold")}</span>
            <span className="font-mono-ui rounded-md bg-secondary px-2 py-0.5 text-xs font-bold tabular-nums">
              {Math.round(iou * 100)}%
            </span>
          </div>
          <input
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-accent [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
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
