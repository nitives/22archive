import { prisma } from "@/lib/prisma";

export async function getPublishedSongs() {
  const rows = await prisma.song.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      artist: true,
      era: true,
      year: true,
      coverUrl: true,

      sourceName: true,
      sourceUrl: true,
      sourcePlatform: true,
      sourceDescription: true,

      producers: {
        select: {
          producer: {
            select: {
              name: true,
              twitter: true,
              instagram: true,
              soundcloud: true,
            },
          },
        },
      },
    },
  });

  // map to UI type shape (no Dates, no Prisma objects)
  return rows.map((s) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    era: s.era ?? undefined,
    year: s.year ?? undefined,
    coverUrl: s.coverUrl ?? "",
    status: "published" as const,
    source: {
      name: s.sourceName,
      url: s.sourceUrl,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      platform: (s.sourcePlatform ?? undefined) as any, // you can tighten later
      description: s.sourceDescription ?? undefined,
    },
    producer: s.producers.map((p) => ({
      name: p.producer.name,
      socials: {
        twitter: p.producer.twitter ?? undefined,
        instagram: p.producer.instagram ?? undefined,
        soundcloud: p.producer.soundcloud ?? undefined,
      },
    })),
  }));
}
