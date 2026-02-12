import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env, requireEnv } from "@/conf/env";

const url = requireEnv(env.supabaseUrl, "SUPABASE_URL");
const serviceKey = requireEnv(
  env.supabaseServiceRoleKey,
  "SUPABASE_SERVICE_ROLE_KEY",
);

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
