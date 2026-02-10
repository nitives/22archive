import type { Song } from "@/songs/types";
import type { Track } from "./types";

export function toTrack(song: Song): Track {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    era: song.era || undefined,
    coverUrl: song.coverUrl || undefined,
    streamUrl: `/api/media/stream/${song.id}`,
    downloadUrl: `/api/media/download/${song.id}`,
  };
}
