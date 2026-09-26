"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Settings, RotateCcw, CheckCircle, Loader2,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  title: string;
  courseId?: string;
  resourceId?: string;
  onProgress?: (watchedSeconds: number, totalSeconds: number) => void;
  onComplete?: () => void;
  /** Initial watched seconds to restore playback position */
  initialWatchedSeconds?: number;
  autoSyncInterval?: number; // ms between progress syncs (default 10000 = 10s)
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function VideoPlayer({
  src,
  title,
  courseId,
  resourceId,
  onProgress,
  onComplete,
  initialWatchedSeconds = 0,
  autoSyncInterval = 10000,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSyncedRef = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore playback position
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !initialWatchedSeconds) return;
    const onLoaded = () => {
      if (initialWatchedSeconds < video.duration - 5) {
        video.currentTime = initialWatchedSeconds;
      }
    };
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [initialWatchedSeconds]);

  // Auto-sync progress to backend
  const syncProgress = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !courseId || video.currentTime === lastSyncedRef.current) return;
    lastSyncedRef.current = video.currentTime;
    setSyncing(true);
    try {
      await fetch("/api/trainee/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          resourceId,
          watchedSeconds: Math.floor(video.currentTime),
          totalDurationSeconds: Math.floor(video.duration),
        }),
      });
    } catch {
      // Silent fail — will retry on next interval
    } finally {
      setSyncing(false);
    }
    onProgress?.(video.currentTime, video.duration);
  }, [courseId, resourceId, onProgress]);

  // Set up sync interval
  useEffect(() => {
    syncTimerRef.current = setInterval(syncProgress, autoSyncInterval);
    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    };
  }, [syncProgress, autoSyncInterval]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (playing) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setPlaying(true); }
    else { video.pause(); setPlaying(false); }
    resetControlsTimer();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    // Update buffer
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }
  };

  const handleVideoEnd = async () => {
    setPlaying(false);
    setCompleted(true);
    setShowControls(true);
    await syncProgress();
    if (courseId) {
      try {
        await fetch("/api/trainee/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        });
      } catch {}
    }
    onComplete?.();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    const video = videoRef.current;
    if (!bar || !video || isNaN(video.duration) || !isFinite(video.duration)) return;
    const rect = bar.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = fraction * video.duration;
    resetControlsTimer();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    setMuted(v === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const setPlaybackSpeed = (s: number) => {
    if (videoRef.current) videoRef.current.playbackRate = s;
    setSpeed(s);
    setShowSpeedMenu(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      style={{
        position: "relative",
        background: "#000",
        borderRadius: fullscreen ? 0 : 14,
        overflow: "hidden",
        aspectRatio: "16/9",
        cursor: showControls ? "default" : "none",
        userSelect: "none",
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => { setDuration(e.currentTarget.duration); setLoading(false); }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onEnded={handleVideoEnd}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
        preload="metadata"
      />

      {/* Loading spinner */}
      {loading && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)" }}>
          <Loader2 size={40} color="white" style={{ animation: "spin 1s linear infinite" }} />
        </div>
      )}

      {/* Completed overlay */}
      {completed && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", color: "white", gap: 12 }}>
          <CheckCircle size={56} color="hsl(145 63% 55%)" />
          <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>Lesson Complete!</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.75 }}>Your progress has been saved.</div>
          <button
            onClick={() => { const v = videoRef.current; if (v) { v.currentTime = 0; v.play(); setCompleted(false); } }}
            className="btn btn-outline"
            style={{ color: "white", borderColor: "rgba(255,255,255,0.4)", marginTop: 8 }}
          >
            <RotateCcw size={15} /> Replay
          </button>
        </div>
      )}

      {/* Controls overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
          padding: "32px 16px 14px",
          transition: "opacity 0.25s ease",
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? "auto" : "none",
        }}
      >
        {/* Seekbar */}
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.25)", borderRadius: 99, cursor: "pointer", marginBottom: 12 }}
        >
          {/* Buffered */}
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${bufferedPercent}%`, background: "rgba(255,255,255,0.3)", borderRadius: 99 }} />
          {/* Watched */}
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${progress}%`, background: "hsl(178 68% 55%)", borderRadius: 99, transition: "width 0.25s" }} />
          {/* Thumb */}
          <div style={{ position: "absolute", top: "50%", left: `${progress}%`, transform: "translate(-50%, -50%)", width: 14, height: 14, background: "hsl(178 68% 55%)", borderRadius: "50%", boxShadow: "0 0 6px rgba(0,0,0,0.6)" }} />
        </div>

        {/* Control row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "white" }}>
          {/* Play/Pause */}
          <button onClick={togglePlay} style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex" }}>
            {playing ? <Pause size={22} /> : <Play size={22} />}
          </button>

          {/* Volume */}
          <button onClick={toggleMute} style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex" }}>
            {muted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}
          </button>
          <input
            type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{ width: 70, accentColor: "hsl(178 68% 55%)" }}
          />

          {/* Time */}
          <span style={{ fontSize: "0.78rem", opacity: 0.85, marginLeft: 2 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Sync indicator */}
          {syncing && <Loader2 size={14} style={{ opacity: 0.6, animation: "spin 1s linear infinite" }} />}

          {/* Speed */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowSpeedMenu((v) => !v)}
              style={{ background: "none", border: "1px solid rgba(255,255,255,0.3)", color: "white", cursor: "pointer", padding: "2px 8px", borderRadius: 4, fontSize: "0.75rem" }}
            >
              {speed}x
            </button>
            {showSpeedMenu && (
              <div style={{ position: "absolute", bottom: "100%", right: 0, background: "rgba(15,20,35,0.95)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 0", marginBottom: 6, minWidth: 80 }}>
                {SPEEDS.map((s) => (
                  <button key={s} onClick={() => setPlaybackSpeed(s)}
                    style={{ display: "block", width: "100%", textAlign: "center", padding: "5px 16px", background: "none", border: "none", color: s === speed ? "hsl(178 68% 55%)" : "white", cursor: "pointer", fontSize: "0.8rem", fontWeight: s === speed ? 700 : 400 }}>
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex" }}>
            {fullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
          </button>
        </div>
      </div>
    </div>
  );
}
