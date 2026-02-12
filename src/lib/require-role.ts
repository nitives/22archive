import { supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { Role as RoleEnum, type Role } from "@/generated/prisma/enums";

export type AppRole = Role;

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
  const email = data.user.email ?? null;

  // Ensure the user always has a profile row in DB.
  // NOTE: DB enum "Role" must include PENDING (see Supabase SQL fix).
  const profile = await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      email,
      role: RoleEnum.PENDING,
    },
    update: {
      // keep email synced; do NOT mutate role here
      email,
    },
    select: { role: true, email: true },
  });

  const role: AppRole = profile.role;

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
    email: profile.email ?? email,
  };
}

export function requireAdmin(req: NextRequest) {
  return requireRole(req, [RoleEnum.ADMIN]);
}

export function requireTrusted(req: NextRequest) {
  return requireRole(req, [RoleEnum.ADMIN, RoleEnum.TRUSTED]);
}
