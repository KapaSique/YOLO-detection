"use client";

import { AlertCircle, Play, Square, Video, Activity } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import { WebcamFeed, Detection } from "../../components/WebcamFeed";

interface LiveEvent {
  label: string;
  ts: string;
}

export default function LivePage() {
  const { t } = useTranslation();
  const [running, setRunning] = useState(false);
  const [conf, setConf] = useState(0.25);
  const [iou, setIou] = useState(0.45);
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  const handleError = useCallback((msg: string) => {
    setError(msg);
    setRunning(false);
  }, []);

  const handleToggle = () => {
    setError(null);
    if (running) {
      setDetections([]);
    }
    setRunning((v) => !v);
  };

  const handleVideoReady = useCallback((video: HTMLVideoElement) => {
    videoElRef.current = video;
  }, []);

  // Detection loop
  useEffect(() => {
    if (!running) {
      videoElRef.current = null;
      return;
    }

    let stopped = false;

    async function loop() {
      while (!stopped) {
        const video = videoElRef.current;
        if (!video || video.readyState < 2) {
          await new Promise((r) => setTimeout(r, 300));
          continue;
        }

        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) break;
          ctx.drawImage(video, 0, 0);

          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", 0.7)
          );
          if (!blob || stopped) break;

          const form = new FormData();
          form.append("file", blob, "frame.jpg");

          const res = await fetch("/api/detect", { method: "POST", body: form });
          if (!res.ok) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }

          const data = await res.json();
          if (stopped) break;

          const dets: Detection[] = data.detections ?? [];
          setDetections(dets);

          if (dets.length > 0) {
            const ts = new Date().toLocaleTimeString();
            const newEvents = dets.map((d) => ({ label: d.label, ts }));
            setEvents((prev) => [...newEvents, ...prev].slice(0, 30));
          }
        } catch {
          // Backend unavailable — silently continue
        }

        await new Promise((r) => setTimeout(r, 300));
      }
    }

    loop();
    return () => {
      stopped = true;
    };
  }, [running]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 lg:px-8">
        <Sidebar />

        <main className="flex-1 space-y-4">
          <Header />

          <div className="space-y-4">
            <div className="surface-card overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-card-foreground">
                  <Video size={18} className="text-accent" />
                  {t("live")}
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

              <div className="aspect-video max-h-[540px] w-full p-3">
                <WebcamFeed
                  running={running}
                  onError={handleError}
                  detections={detections}
                  onVideoReady={handleVideoReady}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="surface-card space-y-3 rounded-2xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-muted-foreground">{t("confThreshold")}</span>
                  <span className="font-mono-ui rounded-md bg-secondary px-2 py-0.5 text-xs font-bold tabular-nums">
                    {Math.round(conf * 100)}%
                  </span>
                </div>
                <input
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-accent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-md"
                  type="range"
                  min="0.05"
                  max="0.9"
                  step="0.01"
                  value={conf}
                  onChange={(e) => setConf(parseFloat(e.target.value))}
                />
              </div>
              <div className="surface-card space-y-3 rounded-2xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-muted-foreground">{t("iouThreshold")}</span>
                  <span className="font-mono-ui rounded-md bg-secondary px-2 py-0.5 text-xs font-bold tabular-nums">
                    {Math.round(iou * 100)}%
                  </span>
                </div>
                <input
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-accent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-md"
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.01"
                  value={iou}
                  onChange={(e) => setIou(parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Live Events */}
            <div className="surface-card overflow-hidden rounded-2xl">
              <div className="flex items-center gap-2.5 border-b border-border/70 px-5 py-3 text-sm font-semibold text-card-foreground">
                <Activity size={18} className="text-accent" />
                Live Events
              </div>
              <div className="max-h-[260px] overflow-y-auto">
                {events.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-muted-foreground">
                    No detections yet. Start the camera to begin.
                  </p>
                ) : (
                  <ul className="divide-y divide-border/50">
                    {events.map((ev, i) => (
                      <li key={i} className="flex items-center justify-between px-5 py-2.5 text-sm">
                        <span className="font-medium text-card-foreground">{ev.label}</span>
                        <span className="text-xs text-muted-foreground">{ev.ts}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
