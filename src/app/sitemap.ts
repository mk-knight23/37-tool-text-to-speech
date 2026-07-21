import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { GUIDES, USE_CASES } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: { path: string; priority: number }[] = [
    { path: "/", priority: 1.0 },
    { path: "/text-to-speech", priority: 0.95 },
    { path: "/ai-voice-generator", priority: 0.95 },
    { path: "/pdf-reader", priority: 0.9 },
    { path: "/document-reader", priority: 0.9 },
    { path: "/speech-to-text", priority: 0.9 },
    { path: "/transcription", priority: 0.9 },
    { path: "/voiceover-generator", priority: 0.85 },
    { path: "/podcast-voice-generator", priority: 0.85 },
    { path: "/youtube-voiceover", priority: 0.85 },
    { path: "/audiobook-voice-generator", priority: 0.85 },
    { path: "/audio-translator", priority: 0.85 },
    { path: "/assisted-dubbing", priority: 0.85 },
    { path: "/pronunciation-generator", priority: 0.8 },
    { path: "/speech-timer", priority: 0.8 },
    { path: "/words-to-minutes", priority: 0.8 },
    { path: "/srt-to-vtt", priority: 0.8 },
    { path: "/vtt-to-srt", priority: 0.8 },
    { path: "/transcript-cleaner", priority: 0.8 },
    { path: "/hindi-text-to-speech", priority: 0.8 },
    { path: "/indian-english-text-to-speech", priority: 0.8 },
    { path: "/reader", priority: 0.8 },
    { path: "/studio", priority: 0.8 },
    { path: "/transcribe", priority: 0.8 },
    { path: "/library", priority: 0.8 },
    { path: "/tools", priority: 0.8 },
    { path: "/guides", priority: 0.8 },
    { path: "/use-cases", priority: 0.8 },
    { path: "/faq", priority: 0.7 },
    { path: "/settings", priority: 0.5 },
    { path: "/about", priority: 0.5 },
    { path: "/creator", priority: 0.5 },
    { path: "/open-source", priority: 0.5 },
    { path: "/changelog", priority: 0.4 },
    { path: "/contact", priority: 0.4 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
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
    priority: 0.7,
  }));

  const useCaseEntries: MetadataRoute.Sitemap = USE_CASES.map((useCase) => ({
    url: toUrl(`/use-cases/${useCase.slug}`),
    lastModified: new Date(`${useCase.date}T00:00:00Z`),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticEntries, ...guideEntries, ...useCaseEntries];
}
