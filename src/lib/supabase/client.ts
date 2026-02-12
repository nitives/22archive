import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/conf/env/public";

export function supabaseBrowser() {
  return createBrowserClient(
    publicEnv.supabaseUrl,
    publicEnv.supabasePublishableKey,
  );
}
