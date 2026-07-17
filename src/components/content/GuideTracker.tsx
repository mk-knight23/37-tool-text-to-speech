"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Fires the consent-gated `guide_opened` analytics event once when an article
 * mounts (STANDARDS §6). The `slug` is a feature name, not user content, so it
 * is safe to send. `track` is a no-op unless analytics is enabled and consented.
 */
export function GuideTracker({ slug }: { slug: string }) {
  useEffect(() => {
    track("guide_opened", { slug });
  }, [slug]);
  return null;
}
