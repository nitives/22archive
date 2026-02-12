import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireServerEnv, serverEnv } from "@/conf/env/server";

const url = requireServerEnv(serverEnv.supabaseUrl, "SUPABASE_URL");
const serviceKey = requireServerEnv(
  serverEnv.supabaseServiceRoleKey,
  "SUPABASE_SERVICE_ROLE_KEY",
);

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
