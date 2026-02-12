import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SongStatus } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/require-role";
import { adminUploadBodySchema } from "@/conf/schemas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const gate = await requireRole(req, ["ADMIN"]);
    if (!gate.ok) return gate.res;

    const json = await req.json();
    const parsed = adminUploadBodySchema.parse({
      ...json,
      // ensure optional fields are null when empty
      era: json.era ?? null,
      year: json.year ?? null,
      coverUrl: json.coverUrl ?? null,
      sourcePlatform: json.sourcePlatform ?? null,
      sourceDescription: json.sourceDescription ?? null,
    });

    const status: SongStatus = parsed.publish
      ? SongStatus.PUBLISHED
      : SongStatus.DRAFT;

    // Create song + connect producers (connectOrCreate by name)
    const created = await prisma.song.create({
      data: {
        title: parsed.title,
        artist: parsed.artist,
        era: parsed.era ?? undefined,
        year: parsed.year ?? undefined,
        coverUrl: parsed.coverUrl ?? undefined,

        audioPath: parsed.audioPath,
        status: status,

        sourceName: parsed.sourceName,
        sourceUrl: parsed.sourceUrl,
        sourcePlatform: parsed.sourcePlatform ?? undefined,
        sourceDescription: parsed.sourceDescription ?? undefined,

        createdByUserId: gate.userId,

        producers: {
          create: parsed.producers.map((name) => ({
            producer: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        },
      },
      select: { id: true },
    });

    return Response.json({ id: created.id }, { status: 201 });
  } catch (err: unknown) {
    console.error("[API] | Error creating song:", err);
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify(err.issues, null, 2), { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Server error";
    return new Response(message, { status: 500 });
  }
}
