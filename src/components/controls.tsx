"use client";
import { useAudio } from "@/features/audio/audio-provider";
import clsx from "clsx";
// import { useMemo } from "react";
import { ImPause2, ImPlay3 } from "react-icons/im";

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
  // const progress = useMemo(() => {
  //   if (!duration) return 0;
  //   return Math.min(1, Math.max(0, currentTime / duration));
  // }, [currentTime, duration]);

  const disabled = !current;

  const value = Math.min(currentTime, duration || 0);
  const max = duration || 0;
  const pct = max > 0 ? (value / max) * 100 : 0;

  // Only show Controls on main page
  if (typeof window !== "undefined" && window.location.pathname !== "/") {
    return null;
  }

  return (
    <div
      className={clsx(
        "w-full max-sm:pb-[calc(env(safe-area-inset-top)+40px)]",
        "fixed bottom-0 left-0 z-50",
        "flex items-center justify-between",
        "border-t border-black/15 dark:border-white/10",
        "px-2.5 py-2 g-red-500 dark:bg-black",
      )}
    >
      {/* Left: track info */}
      <div className="min-w-0 flex gap-2">
        <div className="min-w-0 flex flex-col">
          <div className="truncate text-sm">
            {current ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="opacity-80">{current.title}</span>
                  <span className="opacity-50"> — {current.artist}</span>
                </div>
                {/* <div>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => audio.toggle()}
                    className={clsx(
                      "px-1",
                      "cursor-pointer",
                      "sm:hidden block",
                      "border border-black/25 dark:border-white/25",
                      "disabled:opacity-50",
                    )}
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                </div> */}
              </div>
            ) : (
              <span className="opacity-60">--</span>
            )}
          </div>

          {/* progress bar */}
          <input
            className={clsx(
              "range range--progress",
              "max-sm:w-[180px] w-[240px] max-w-[60vw]",
              disabled && "opacity-40",
            )}
            type="range"
            min={0}
            max={duration || 0}
            step={0.25}
            value={Math.min(currentTime, duration || 0)}
            disabled={disabled || !duration}
            onChange={(e) => audio.seek(Number(e.target.value))}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style={{ ["--range-pct" as any]: `${pct}%` }}
          />
        </div>
        <div className="sm:hidden flex justify-center size-[44px] ">
          <button
            type="button"
            disabled={disabled}
            onClick={() => audio.toggle()}
            className={clsx(
              "p-1",
              "text-[#4c4c4c]",
              "cursor-pointer",
              "touch-hitbox",
              "disabled:opacity-25",
            )}
          >
            {isPlaying ? <ImPause2 size={24} /> : <ImPlay3 size={24} />}
          </button>
        </div>
      </div>

      {/* Desktop: Play/Pause*/}
      <button
        type="button"
        disabled={disabled}
        onClick={() => audio.toggle()}
        className={clsx(
          "p-1",
          "touch-hitbox",
          "text-[#4c4c4c]",
          "cursor-pointer",
          "max-sm:hidden block",
          "disabled:opacity-25",
        )}
      >
        {isPlaying ? <ImPause2 size={24} /> : <ImPlay3 size={24} />}
      </button>

      {/* Right: controls + time */}
      <div className="flex items-center gap-3">
        <div className="text-xs tabular-nums opacity-70 select-none">
          {fmtTime(currentTime)} / {fmtTime(duration)}
        </div>
      </div>
    </div>
  );
};
