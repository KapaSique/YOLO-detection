"use client";

import { Camera, Loader2, VideoOff } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

type Status = "idle" | "loading" | "active" | "error";

interface WebcamFeedProps {
  running: boolean;
  onError?: (message: string) => void;
}

export function WebcamFeed({ running, onError }: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>("idle");

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
      return;
    }

    let cancelled = false;
    setStatus("loading");

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            if (!cancelled) {
              video.play().then(() => {
                if (!cancelled) setStatus("active");
              }).catch(() => {
                if (!cancelled) {
                  setStatus("error");
                  onError?.("Failed to play video");
                }
              });
            }
          };
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          onError?.(err instanceof Error ? err.message : "Camera access denied");
        }
      }
    })();

    return () => {
      cancelled = true;
      stopStream();
    };
    // onError intentionally excluded — stable via useCallback in parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, stopStream]);

  return (
    <div className="relative h-full w-full bg-zinc-950">
      {/* Video — ALWAYS in DOM, NEVER display:none. Uses absolute so overlays sit on top */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlay: covers video when not active */}
      {status !== "active" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-zinc-950">
          {status === "idle" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
                <Camera size={28} className="text-zinc-500" />
              </div>
              <p className="text-sm text-zinc-500">Press Start to open camera</p>
            </>
          )}
          {status === "loading" && (
            <>
              <Loader2 size={28} className="animate-spin text-emerald-500" />
              <p className="text-sm text-zinc-500">Accessing camera...</p>
            </>
          )}
          {status === "error" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
                <VideoOff size={28} className="text-red-400" />
              </div>
              <p className="text-sm text-zinc-500">Camera unavailable</p>
            </>
          )}
        </div>
      )}

      {/* LIVE badge when active */}
      {status === "active" && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-white">LIVE</span>
        </div>
      )}
    </div>
  );
}
