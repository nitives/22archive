import clsx from "clsx";
import { SongList } from "@/components/song-list";
import { getPublishedSongs } from "@/features/songs/queries";

export default async function Home() {
  const songs = await getPublishedSongs();
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-start",
        "min-h-[calc(100dvh-var(--titlebar-height))] mt-[var(--titlebar-height)] mb-[15dvh]",
      )}
    >
      <SongList songs={songs} />
    </div>
  );
}
