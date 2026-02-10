import { getSiteUrl } from "@/conf/site-url";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin"],
    },
    sitemap: `${site}/sitemap.xml`,
  };
}
