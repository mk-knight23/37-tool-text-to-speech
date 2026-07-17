import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { GUIDES, USE_CASES } from "@/lib/content";

/**
 * Sitemap for every public route. Static routes are listed explicitly; guide
 * and use-case entries are derived from the content registry so a new article
 * appears here automatically (STANDARDS §5).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/tool", priority: 0.9 },
    { path: "/docs", priority: 0.8 },
    { path: "/guides", priority: 0.8 },
    { path: "/use-cases", priority: 0.8 },
    { path: "/faq", priority: 0.7 },
    { path: "/dashboard", priority: 0.5 },
    { path: "/history", priority: 0.5 },
    { path: "/settings", priority: 0.5 },
    { path: "/about", priority: 0.5 },
    { path: "/creator", priority: 0.5 },
    { path: "/open-source", priority: 0.5 },
    { path: "/changelog", priority: 0.4 },
    { path: "/contact", priority: 0.4 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
    { path: "/cookies", priority: 0.3 },
  ];

  const toUrl = (path: string) => `${SITE.url}${path === "/" ? "" : path}`;

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: toUrl(route.path),
    lastModified: now,
    changeFrequency: "monthly",
    priority: route.priority,
  }));

  const guideEntries: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: toUrl(`/guides/${guide.slug}`),
    lastModified: new Date(`${guide.date}T00:00:00Z`),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const useCaseEntries: MetadataRoute.Sitemap = USE_CASES.map((useCase) => ({
    url: toUrl(`/use-cases/${useCase.slug}`),
    lastModified: new Date(`${useCase.date}T00:00:00Z`),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticEntries, ...guideEntries, ...useCaseEntries];
}
