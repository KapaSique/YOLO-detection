"use client";

import { Camera, Loader2, VideoOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "loading" | "active" | "error";

export interface Detection {
  label: string;
  box: number[];
}

interface WebcamFeedProps {
  running: boolean;
  onError?: (message: string) => void;
  detections?: Detection[];
  onVideoReady?: (video: HTMLVideoElement) => void;
}

function getCameraErrorMessage(error: unknown): string {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "Camera works only on HTTPS or localhost.";
  }

  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "Camera permission denied. Allow camera access in browser settings.";
    }
    if (error.name === "NotReadableError") {
      return "Camera is already in use by another app.";
    }
    if (error.name === "NotFoundError") {
      return "No camera device found.";
    }
    if (error.name === "OverconstrainedError") {
      return "Requested camera settings are not supported.";
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Camera unavailable";
}

export function WebcamFeed({ running, onError, detections, onVideoReady }: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!running) {
      stopStream();
      setStatus("idle");
      setErrorMessage(null);
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setErrorMessage(null);

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("This browser does not support camera access.");
        }
        if (!window.isSecureContext) {
          throw new Error("Camera works only on HTTPS or localhost.");
        }

        const constraintsPool: MediaStreamConstraints[] = [
          {
            video: {
              facingMode: { ideal: "user" },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          },
          { video: true, audio: false }
        ];

        let stream: MediaStream | null = null;
        let lastError: unknown = null;

        for (const constraints of constraintsPool) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            break;
          } catch (error) {
            lastError = error;
          }
        }

        if (!stream) {
          throw lastError ?? new Error("Camera unavailable");
        }

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          throw new Error("Video element is not ready.");
        }

        video.srcObject = stream;
        await video.play();
        if (!cancelled) {
          setStatus("active");
          onVideoReady?.(video);
        }
      } catch (err) {
        if (!cancelled) {
          const message = getCameraErrorMessage(err);
          setStatus("error");
          setErrorMessage(message);
          onError?.(message);
        }
      }
    })();

    return () => {
      cancelled = true;
      stopStream();
    };
    // onError/onVideoReady intentionally excluded — stable via useCallback in parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, stopStream]);

  // Draw detections on canvas overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    canvas.width = vw;
    canvas.height = vh;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, vw, vh);

    if (!detections || detections.length === 0) return;

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    ctx.font = "bold 14px sans-serif";

    for (const det of detections) {
      const [x1, y1, x2, y2] = det.box;
      const w = x2 - x1;
      const h = y2 - y1;

      // Draw box
      ctx.strokeRect(x1, y1, w, h);

      // Draw label background
      const textMetrics = ctx.measureText(det.label);
      const textW = textMetrics.width + 8;
      const textH = 20;
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(x1, y1 - textH, textW, textH);

      // Draw label text
      ctx.fillStyle = "#ffffff";
      ctx.fillText(det.label, x1 + 4, y1 - 5);
    }
  }, [detections]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.05rem] bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      />

      {status !== "active" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_rgba(0,0,0,0.94)_58%)]">
          {status === "idle" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                <Camera size={28} className="text-zinc-200" />
              </div>
              <p className="text-sm text-zinc-300">Press Start to open camera</p>
            </>
          )}
          {status === "loading" && (
            <>
              <Loader2 size={28} className="animate-spin text-white" />
              <p className="text-sm text-zinc-300">Accessing camera...</p>
            </>
          )}
          {status === "error" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-300/30 bg-red-400/15">
                <VideoOff size={28} className="text-red-300" />
              </div>
              <p className="max-w-[78%] text-center text-sm text-zinc-300">{errorMessage ?? "Camera unavailable"}</p>
            </>
          )}
        </div>
      )}

      {status === "active" && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-65" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <span className="text-xs font-semibold text-white">LIVE</span>
        </div>
      )}
    </div>
  );
}
