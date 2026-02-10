import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const BUCKET = "tracks";

function safeFilename(name: string) {
  return name
    .replace(/[\/\\?%*:|"<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) return new Response("Missing id", { status: 400 });

  const song = await prisma.song.findUnique({
    where: { id },
    select: { title: true, artist: true, status: true, audioPath: true },
  });

  if (!song) return new Response("Not found", { status: 404 });
  if (song.status !== "PUBLISHED")
    return new Response("Not available", { status: 403 });

  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(song.audioPath, 60);

  if (signErr || !signed?.signedUrl)
    return new Response("Media error", { status: 500 });

  const upstream = await fetch(signed.signedUrl);
  if (!upstream.ok || !upstream.body)
    return new Response("Upstream error", { status: 502 });

  const headers = new Headers();
  headers.set(
    "content-type",
    upstream.headers.get("content-type") ?? "audio/mpeg",
  );

  const len = upstream.headers.get("content-length");
  if (len) headers.set("content-length", len);

  const base = safeFilename(`${song.artist} - ${song.title}`) || "song";
  headers.set("content-disposition", `attachment; filename="${base}.mp3"`);
  headers.set("cache-control", "private, no-store");

  return new Response(upstream.body, { status: 200, headers });
}
