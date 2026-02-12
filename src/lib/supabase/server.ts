import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, requireEnv } from "@/conf/env";

export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv(env.supabaseUrl, "SUPABASE_URL"),
    requireEnv(env.supabasePublishableKey, "SUPABASE_PUBLISHABLE_KEY"),
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
