"use client";
import { useAudio } from "@/features/audio/audio-provider";
import clsx from "clsx";
import { useMemo } from "react";

function fmtTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "--:--";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export const Controls = () => {
  const audio = useAudio();
  const { current, isPlaying, currentTime, duration } = audio.state;
  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(1, Math.max(0, currentTime / duration));
  }, [currentTime, duration]);

  const disabled = !current;

  return (
    <div
      className={clsx(
        "w-full",
        "fixed bottom-0 left-0 z-50",
        "flex items-center justify-between",
        "border-t border-black/15 dark:border-white/10",
        "px-2.5 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm",
      )}
    >
      {/* Left: track info */}
      <div className="min-w-0 flex flex-col">
        <div className="truncate text-sm">
          {current ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="opacity-80">{current.title}</span>
                <span className="opacity-50"> — {current.artist}</span>
              </div>
              <div>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => audio.toggle()}
                  className={clsx(
                    "px-1",
                    "sm:hidden block",
                    "border border-black/25 dark:border-white/25",
                    "disabled:opacity-50",
                  )}
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
              </div>
            </div>
          ) : (
            <span className="opacity-60">--</span>
          )}
        </div>

        {/* progress bar */}
        <input
          className={clsx("w-[240px] max-w-[60vw]", disabled && "opacity-40")}
          type="range"
          min={0}
          max={duration || 0}
          step={0.25}
          value={Math.min(currentTime, duration || 0)}
          disabled={disabled || !duration}
          onChange={(e) => audio.seek(Number(e.target.value))}
        />
      </div>

      {/* Right: controls + time */}
      <div className="flex items-center gap-3">
        <div className="text-xs tabular-nums opacity-70 select-none">
          {fmtTime(currentTime)} / {fmtTime(duration)}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => audio.toggle()}
          className={clsx(
            "px-3 py-1",
            "max-sm:hidden block",
            "border border-black/25 dark:border-white/25",
            "disabled:opacity-50",
          )}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
};
