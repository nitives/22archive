import type { Song } from "@/songs/types";
import type { Track } from "./types";

export function toTrack(song: Song): Track {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    streamUrl: `/api/media/stream/${song.id}`,
    downloadUrl: `/api/media/download/${song.id}`,
  };
}
