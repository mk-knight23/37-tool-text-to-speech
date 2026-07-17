import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Sitemap for the routes that exist in this build. Later content routes
 * (guides, use-cases, docs, legal) will extend this list.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["/", "/tool", "/dashboard", "/history", "/settings"];
  return routes.map((route) => ({
    url: `${SITE.url}${route === "/" ? "" : route}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
