import { createBrowserClient } from "@supabase/ssr";
import { env, requireEnv } from "@/conf/env";

export function supabaseBrowser() {
  return createBrowserClient(
    requireEnv(env.supabaseUrl, "SUPABASE_URL"),
    requireEnv(env.supabasePublishableKey, "SUPABASE_PUBLISHABLE_KEY"),
  );
}
