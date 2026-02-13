"use client";

import { Camera, Loader2, VideoOff } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

type Status = "idle" | "loading" | "active" | "error";

interface WebcamFeedProps {
  running: boolean;
  onError?: (message: string) => void;
  onStatusChange?: (status: Status) => void;
}

export function WebcamFeed({ running, onError, onStatusChange }: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const updateStatus = useCallback(
    (s: Status) => {
      setStatus(s);
      onStatusChange?.(s);
    },
    [onStatusChange]
  );

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
      updateStatus("idle");
      return;
    }

    let cancelled = false;
    updateStatus("loading");

    async function startStream() {
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

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (!cancelled) {
              videoRef.current?.play();
              updateStatus("active");
            }
          };
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Camera access denied";
          updateStatus("error");
          onError?.(msg);
        }
      }
    }

    startStream();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [running, onError, stopStream, updateStatus]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Video element always in DOM */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`h-full w-full object-cover ${status === "active" ? "block" : "hidden"}`}
      />

      {/* Idle state */}
      {status === "idle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="rounded-full bg-muted/20 p-4">
            <Camera size={32} className="text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-500">Press Start to open camera</p>
        </div>
      )}

      {/* Loading state */}
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm text-zinc-400">Accessing camera...</p>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="rounded-full bg-destructive/20 p-4">
            <VideoOff size={32} className="text-destructive" />
          </div>
          <p className="text-sm text-zinc-400">Camera unavailable</p>
        </div>
      )}

      {/* Active overlay — green dot indicator */}
      {status === "active" && (
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-white">LIVE</span>
        </div>
      )}
    </div>
  );
}
