import { env } from "@/conf/env";

export function getSiteUrl() {
  const manual = env.siteUrl.trim();
  if (manual) return manual.replace(/\/+$/, "");
  const prod = env.vercelProjectProductionUrl.trim();
  if (prod) return `https://${prod.replace(/\/+$/, "")}`;

  const vercel = env.vercelUrl.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}
