import { serverEnv } from "@/conf/env/server";

export function getSiteUrl() {
  const manual = serverEnv.siteUrl.trim();
  if (manual) return manual.replace(/\/+$/, "");
  const prod = serverEnv.vercelProjectProductionUrl.trim();
  if (prod) return `https://${prod.replace(/\/+$/, "")}`;

  const vercel = serverEnv.vercelUrl.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}
