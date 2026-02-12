import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ["ADMIN"]);
  if (!gate.ok) return gate.res;

  const users = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      userId: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return Response.json({ users }, { status: 200 });
}
