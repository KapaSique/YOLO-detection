"use client";

import { Play, Square, Video, Zap } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function LivePreview() {
  const { t } = useTranslation();
  const [conf, setConf] = useState(0.25);
  const [iou, setIou] = useState(0.45);
  const [running, setRunning] = useState(false);

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Video size={18} /> Live stream
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
              running ? "bg-red-500/80 text-white" : "gradient-pill text-neutral-900"
            }`}
            onClick={() => setRunning((v) => !v)}
          >
            {running ? <Square size={14} /> : <Play size={14} />}
            {running ? t("stopStream") : t("startStream")}
          </button>
        </div>
      </div>

      <div className="relative h-[360px] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0f172a] to-[#020617]">
        <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #14f4c533, transparent 40%)" }} />
        <div className="absolute left-6 top-6 rounded-lg border border-emerald-400/60 px-3 py-2 text-xs text-emerald-300">
          person • 0.88
        </div>
        <div className="absolute left-1/2 top-1/3 h-32 w-48 -translate-x-1/2 rounded-xl border border-cyan-400/60" />
        <div className="absolute bottom-4 left-4 flex gap-2 text-xs">
          <span className="rounded-full bg-black/50 px-2 py-1 text-white/80">FPS 18.3</span>
          <span className="rounded-full bg-black/50 px-2 py-1 text-white/80">{t("latency")}: 41 ms</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="space-y-1 rounded-xl border border-white/10 bg-white/30 p-3 text-sm dark:bg-white/5">
          <div className="flex items-center justify-between">
            <span>{t("confThreshold")}</span>
            <span className="font-semibold">{Math.round(conf * 100)}%</span>
          </div>
          <input
            className="w-full accent-brand"
            type="range"
            min="0.05"
            max="0.9"
            step="0.01"
            value={conf}
            onChange={(e) => setConf(parseFloat(e.target.value))}
          />
        </div>
        <div className="space-y-1 rounded-xl border border-white/10 bg-white/30 p-3 text-sm dark:bg-white/5">
          <div className="flex items-center justify-between">
            <span>{t("iouThreshold")}</span>
            <span className="font-semibold">{Math.round(iou * 100)}%</span>
          </div>
          <input
            className="w-full accent-brand"
            type="range"
            min="0.1"
            max="0.95"
            step="0.01"
            value={iou}
            onChange={(e) => setIou(parseFloat(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/30 p-3 text-sm font-semibold dark:bg-white/5">
          <Zap size={16} className="text-amber-400" />
          Real-time first: 5 Hz WS stream placeholder
        </div>
      </div>
    </div>
  );
}
