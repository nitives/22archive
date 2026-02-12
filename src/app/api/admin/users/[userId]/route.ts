import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireRole } from "@/lib/require-role";
import { roleEnum, userIdParamsSchema } from "@/conf/schemas";

export const runtime = "nodejs";

const bodySchema = z.object({
  role: roleEnum,
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const gate = await requireRole(req, ["ADMIN"]);
  if (!gate.ok) return gate.res;

  const parsedParams = userIdParamsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return new Response(JSON.stringify(parsedParams.error.issues, null, 2), {
      status: 400,
    });
  }

  const { userId } = parsedParams.data;

  // Optional safety: prevent admin from demoting themselves by accident
  if (userId === gate.userId) {
    return new Response("You cannot change your own role here.", {
      status: 400,
    });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error.issues, null, 2), {
      status: 400,
    });
  }

  const updated = await prisma.profile.update({
    where: { userId },
    data: { role: parsed.data.role },
    select: { userId: true, email: true, role: true },
  });

  return Response.json({ user: updated }, { status: 200 });
}
