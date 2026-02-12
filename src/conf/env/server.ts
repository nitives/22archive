import "server-only";

export const serverEnv = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  directUrl: process.env.DIRECT_URL ?? "",
  maintenanceMode: process.env.MAINTENANCE_MODE === "1",
  supabaseUrl:
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  siteUrl: process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "",
  vercelUrl: process.env.VERCEL_URL ?? "",
  vercelProjectProductionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "",
  nodeEnv: process.env.NODE_ENV ?? "",
} as const;

export function requireServerEnv(value: string, name: string) {
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}
