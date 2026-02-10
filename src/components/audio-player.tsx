import { Song } from "@/songs/types";

export const AudioPlayer = ({ song }: { song: Song }) => {
  return (
    <div>
      <audio
        controls
        preload="none"
        src={`/api/media/stream/${song.id}`}
        className="w-full"
      />
    </div>
  );
};
