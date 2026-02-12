import { supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export type AppRole = "ADMIN" | "TRUSTED" | "PENDING";

function getBearerToken(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length) : null;
}

export async function requireRole(req: NextRequest, allowed: AppRole[]) {
  const token = getBearerToken(req);
  if (!token) {
    return {
      ok: false as const,
      res: new Response("Missing auth token", { status: 401 }),
    };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return {
      ok: false as const,
      res: new Response("Invalid session", { status: 401 }),
    };
  }

  const userId = data.user.id;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { role: true, email: true },
  });

  // If they have no profile yet, treat as PENDING (or create one elsewhere)
  const role = (profile?.role ?? "PENDING") as AppRole;

  if (!allowed.includes(role)) {
    return {
      ok: false as const,
      res: new Response("Forbidden", { status: 403 }),
    };
  }

  return {
    ok: true as const,
    userId,
    role,
    email: profile?.email ?? data.user.email ?? null,
  };
}

export function requireAdmin(req: NextRequest) {
  return requireRole(req, ["ADMIN"]);
}

export function requireTrusted(req: NextRequest) {
  return requireRole(req, ["ADMIN", "TRUSTED"]);
}
