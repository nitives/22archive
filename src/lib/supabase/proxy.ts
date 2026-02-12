import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env, requireEnv } from "@/conf/env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    requireEnv(env.supabaseUrl, "SUPABASE_URL"),
    requireEnv(env.supabasePublishableKey, "SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update request cookies
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          // Recreate response so Next.js sees updated request cookies
          response = NextResponse.next({ request });

          // Update response cookies
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.getClaims();

  return response;
}
