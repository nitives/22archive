import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SongStatus } from "@/generated/prisma/enums";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const platformEnum = z.enum([
  "SoundCloud",
  "YouTube",
  "Bandcamp",
  "Spotify",
  "AppleMusic",
  "Other",
]);

const bodySchema = z.object({
  title: z.string().min(1),
  artist: z.string().min(1),
  era: z.string().nullable().optional(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),

  audioPath: z.string().min(1),

  sourceName: z.string().min(1),
  sourceUrl: z.string().url(),
  sourcePlatform: platformEnum.nullable().optional(),
  sourceDescription: z.string().nullable().optional(),

  producers: z.array(z.string().min(1)).default([]),

  publish: z.boolean().default(false),
});

function getSupabaseServer() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url)
    throw new Error("[API] | Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) throw new Error("[API] | Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.startsWith("Bearer ")
      ? auth.slice("Bearer ".length)
      : null;
    if (!token) return new Response("Missing auth token", { status: 401 });

    // Verify token with Supabase
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user)
      return new Response("Invalid session", { status: 401 });

    const userId = data.user.id; // UUID

    // Must be ADMIN
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile || profile.role !== "ADMIN") {
      return new Response("Forbidden (admin only)", { status: 403 });
    }

    const json = await req.json();
    const parsed = bodySchema.parse({
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

        createdByUserId: profile.userId,

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
