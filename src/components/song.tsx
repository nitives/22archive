"use client";

import { useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { DropdownIcon } from "./icons/dropdown-icon";
import type { Song as SongType } from "@/songs/types";
import { AudioPlayer } from "./audio-player";

export function Song({ song }: { song: SongType }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full border-t border-black/15 dark:border-white/10">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "w-full",
          "select-none",
          "p-1 px-2 gap-2",
          "flex items-center justify-between",
          "text-left",
        )}
      >
        <div className="flex items-center gap-2">
          <DropdownIcon active={open} />
          <span>{song.title}</span>
          <span className="opacity-60">— {song.artist}</span>
        </div>

        <div className="text-xs opacity-60 flex items-center gap-2">
          {song.year ? <span>{song.year}</span> : null}
          {song.era ? <span>{song.era}</span> : null}
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="dropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-3 pt-2 flex flex-col gap-3">
              {/* Audio */}
              <div className="flex flex-col gap-2">
                <AudioPlayer song={song} />
                <div className="flex items-center gap-3 text-sm">
                  <a
                    className="underline opacity-80 hover:opacity-100"
                    href={`/api/media/download/${song.id}`}
                  >
                    Download
                  </a>
                </div>
              </div>

              {/* Metadata */}
              <div className="text-sm flex flex-col gap-1">
                <div className="opacity-80">
                  <span className="opacity-60">Producers:</span>{" "}
                  {song.producer?.length
                    ? song.producer.map((p) => p.name).join(", ")
                    : "—"}
                </div>

                <div className="opacity-80">
                  <span className="opacity-60">Source:</span>{" "}
                  <a
                    className="underline"
                    href={song.source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {song.source.name}
                  </a>
                  {song.source.platform ? (
                    <span className="opacity-60"> ({song.source.platform})</span>
                  ) : null}
                </div>

                {song.source.description ? (
                  <div className="opacity-70">{song.source.description}</div>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
