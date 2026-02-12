import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "1";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow the maintenance page itself (prevents loops)
  if (pathname === "/maintenance" || pathname.startsWith("/maintenance/")) {
    return updateSession(request);
  }

  // Do not break API routes
  if (pathname.startsWith("/api")) {
    return updateSession(request);
  }

  if (MAINTENANCE_MODE) {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    url.search = "";
    return NextResponse.rewrite(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    // Keep your existing static exclusions
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
