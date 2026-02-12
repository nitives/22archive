const nextPublicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const nextPublicSupabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const nextPublicSupabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const nextPublicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export const env = {
  supabaseUrl: nextPublicSupabaseUrl || process.env.SUPABASE_URL || "",
  supabasePublishableKey:
    nextPublicSupabasePublishableKey ||
    nextPublicSupabaseAnonKey ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    "",
  siteUrl: nextPublicSiteUrl || process.env.SITE_URL || "",
  vercelProjectProductionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "",
  vercelUrl: process.env.VERCEL_URL ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  directUrl: process.env.DIRECT_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  nodeEnv: process.env.NODE_ENV ?? "",
} as const;

export function requireEnv(value: string, name: string): string {
  if (!value) {
    throw new Error(
      `Missing env: ${name}. Set NEXT_PUBLIC_${name} (client) or ${name} (server).`,
    );
  }
  return value;
}
