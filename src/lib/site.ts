/**
 * Central site configuration: product identity, creator identity (STANDARDS
 * §3, verbatim), canonical URL, and the primary navigation used by the header
 * and footer. Nothing here is fabricated — the creator sentence and links are
 * the binding contract values.
 */

export const SITE = {
  name: "MK VoiceKit",
  tagline: "A free, local-first browser text-to-speech workspace.",
  /** Canonical base URL; overridable per environment. */
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://voicekit.mkazi.live",
  repo: "https://github.com/mk-knight23/37-tool-text-to-speech",
  creator: {
    name: "Kazi Musharraf",
    role: "AI Engineer · Full-Stack Developer · Open-Source Builder",
    github: "https://github.com/mk-knight23",
    portfolio: "https://www.mkazi.live",
  },
  /** Exact footer sentence — non-negotiable (STANDARDS §3). */
  footerSentence:
    "Built and maintained by Kazi Musharraf. Open source for everyone.",
} as const;

export interface NavLink {
  href: string;
  label: string;
}

/** Primary navigation — links only to routes that exist in this build. */
export const PRIMARY_NAV: NavLink[] = [
  { href: "/tool", label: "Workspace" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];
