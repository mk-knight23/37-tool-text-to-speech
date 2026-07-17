/**
 * Per-page metadata helper (STANDARDS §5). Produces a Next.js Metadata object
 * with a unique title/description, a canonical URL derived from the site base,
 * and matching Open Graph + Twitter cards.
 */

import type { Metadata } from "next";
import { SITE } from "./site";

interface PageMetaInput {
  title: string;
  description: string;
  /** Route path beginning with "/", e.g. "/tool". Omit for the home page. */
  path?: string;
}

export function pageMetadata({
  title,
  description,
  path = "/",
}: PageMetaInput): Metadata {
  const canonical = path === "/" ? "/" : path;
  const fullTitle = path === "/" ? title : `${title} · ${SITE.name}`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
