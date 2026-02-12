import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { serverEnv, requireServerEnv } from "@/conf/env/server";

export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    requireServerEnv(serverEnv.supabaseUrl, "SUPABASE_URL"),
    requireServerEnv(
      serverEnv.supabaseServiceRoleKey,
      "SUPABASE_SERVICE_ROLE_KEY",
    ),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll can be called from Server Components; ignore if proxy refresh exists
          }
        },
      },
    },
  );
}
