import { NextRequest } from "next/server";
import { requireRole } from "@/lib/require-role";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ["ADMIN", "TRUSTED", "PENDING"]);
  if (!gate.ok) return gate.res;

  return Response.json(
    { userId: gate.userId, role: gate.role, email: gate.email },
    { status: 200 },
  );
}
