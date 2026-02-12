import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { STORAGE } from "@/conf/storage";
import { songIdParamsSchema } from "@/conf/schemas";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsedParams = songIdParamsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return new Response(JSON.stringify(parsedParams.error.issues, null, 2), {
      status: 400,
    });
  }

  const { id } = parsedParams.data;

  const song = await prisma.song.findUnique({
    where: { id },
    select: { status: true, audioPath: true },
  });

  if (!song) return new Response("Not found", { status: 404 });
  if (song.status !== "PUBLISHED")
    return new Response("Not available", { status: 403 });

  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from(STORAGE.TRACKS_BUCKET)
    .createSignedUrl(song.audioPath, 60);

  if (signErr || !signed?.signedUrl)
    return new Response("Media error", { status: 500 });

  const range = req.headers.get("range") ?? undefined;

  const upstream = await fetch(signed.signedUrl, {
    headers: range ? { Range: range } : undefined,
  });

  if (!upstream.body) return new Response("Upstream error", { status: 502 });

  const headers = new Headers();
  for (const h of [
    "content-type",
    "content-length",
    "accept-ranges",
    "content-range",
    "etag",
    "last-modified",
  ]) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }

  headers.set("cache-control", "private, no-store");

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
