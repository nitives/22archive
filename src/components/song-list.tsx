"use client";
import { LayoutGroup } from "motion/react";
import { Song } from "@/components/song";
import type { Song as SongType } from "@/songs/types";

export function SongList({ songs }: { songs: SongType[] }) {
  return (
    <LayoutGroup>
      {songs.map((song) => (
        <Song key={song.id} song={song} />
      ))}
    </LayoutGroup>
  );
}
