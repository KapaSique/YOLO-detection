"use client";

import { AlertCircle, Play, Square, Video } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import { WebcamFeed } from "../../components/WebcamFeed";

export default function LivePage() {
  const { t } = useTranslation();
  const [running, setRunning] = useState(false);
  const [conf, setConf] = useState(0.25);
  const [iou, setIou] = useState(0.45);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((msg: string) => {
    setError(msg);
    setRunning(false);
  }, []);

  const handleToggle = () => {
    setError(null);
    setRunning((v) => !v);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6">
        <Sidebar />

        <main className="flex-1 space-y-4">
          <Header />

          <div className="space-y-4">
            {/* Video card */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-card-foreground">
                  <Video size={18} className="text-primary" />
                  {t("live")}
                </div>
                <button
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    running
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/25 hover:bg-red-600"
                      : "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110"
                  }`}
                  onClick={handleToggle}
                >
                  {running ? <Square size={14} /> : <Play size={14} />}
                  {running ? t("stopStream") : t("startStream")}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 border-b border-border bg-red-500/10 px-5 py-2.5 text-sm text-red-500">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="aspect-video max-h-[540px] w-full">
                <WebcamFeed running={running} onError={handleError} />
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-muted-foreground">{t("confThreshold")}</span>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-bold tabular-nums">
                    {Math.round(conf * 100)}%
                  </span>
                </div>
                <input
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                  type="range"
                  min="0.05"
                  max="0.9"
                  step="0.01"
                  value={conf}
                  onChange={(e) => setConf(parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-muted-foreground">{t("iouThreshold")}</span>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-bold tabular-nums">
                    {Math.round(iou * 100)}%
                  </span>
                </div>
                <input
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
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
        </main>
      </div>
    </div>
  );
}
