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
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <Sidebar />

        <main className="flex-1 space-y-4">
          <Header />

          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                <Video size={18} /> {t("live")}
              </div>
              <button
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  running
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
                onClick={handleToggle}
              >
                {running ? <Square size={14} /> : <Play size={14} />}
                {running ? t("stopStream") : t("startStream")}
              </button>
            </div>

            {error && (
              <div className="mb-3 flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="mx-auto h-[480px] max-w-[640px] overflow-hidden rounded-md border border-border">
              <WebcamFeed running={running} onError={handleError} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
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
        </main>
      </div>
    </div>
  );
}
