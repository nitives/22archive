import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://YOUR_DOMAIN.com";

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site}/`, changeFrequency: "daily", priority: 1 },
    { url: `${site}/attribution`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Published songs
  const songs = await prisma.song.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const songRoutes: MetadataRoute.Sitemap = songs.map((s) => ({
    url: `${site}/?song=${s.id}`, // <- use for playing song from url
    lastModified: s.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...songRoutes];
}
