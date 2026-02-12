import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTrusted } from "@/lib/require-role";
import { SongStatus } from "@/generated/prisma/enums";
import { trustedUploadBodySchema } from "@/conf/schemas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const gate = await requireTrusted(req);
  if (!gate.ok) return gate.res;

  try {
    const json = await req.json();
    const parsed = trustedUploadBodySchema.parse({
      ...json,
      era: json.era ?? null,
      year: json.year ?? null,
      coverUrl: json.coverUrl ?? null,
      sourcePlatform: json.sourcePlatform ?? null,
      sourceDescription: json.sourceDescription ?? null,
    });

    const created = await prisma.song.create({
      data: {
        title: parsed.title,
        artist: parsed.artist,
        era: parsed.era ?? undefined,
        year: parsed.year ?? undefined,
        coverUrl: parsed.coverUrl ?? undefined,

        audioPath: parsed.audioPath,
        status: SongStatus.DRAFT, // forced

        sourceName: parsed.sourceName,
        sourceUrl: parsed.sourceUrl,
        sourcePlatform: parsed.sourcePlatform ?? undefined,
        sourceDescription: parsed.sourceDescription ?? undefined,

        createdByUserId: gate.userId,

        producers: {
          create: parsed.producers.map((name) => ({
            producer: {
              connectOrCreate: { where: { name }, create: { name } },
            },
          })),
        },
      },
      select: { id: true },
    });

    return Response.json({ id: created.id }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify(err.issues, null, 2), { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "Server error";
    return new Response(msg, { status: 500 });
  }
}
