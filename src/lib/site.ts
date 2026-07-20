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
  repo: "https://github.com/mk-knight23/MK-VoiceKit",
  /** Public contact address (also used in .well-known/security.txt). */
  contactEmail: "kazi@reprime.com",
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

/** New GitHub issue link for bug reports / requests. */
export const ISSUES_URL = `${SITE.repo}/issues/new`;

export interface NavLink {
  href: string;
  label: string;
}

/** Header navigation — the core app surfaces plus the content hubs. */
export const PRIMARY_NAV: NavLink[] = [
  { href: "/", label: "Workspace" },
  { href: "/library", label: "Library" },
  { href: "/studio", label: "Studio" },
  { href: "/transcribe", label: "Transcribe" },
  { href: "/tools", label: "Utilities" },
  { href: "/guides", label: "Guides" },
  { href: "/docs", label: "Docs" },
];

export const SECONDARY_NAV: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

export interface FooterSection {
  heading: string;
  links: NavLink[];
}

/** Grouped footer navigation covering every public route (STANDARDS §4/§5). */
export const FOOTER_SECTIONS: FooterSection[] = [
  {
    heading: "Product",
    links: [
      { href: "/tool", label: "Workspace" },
      { href: "/library", label: "Library" },
      { href: "/studio", label: "Studio" },
      { href: "/transcribe", label: "Transcribe" },
      { href: "/tools", label: "Utilities" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/history", label: "History" },
      { href: "/settings", label: "Settings" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { href: "/docs", label: "Docs" },
      { href: "/guides", label: "Guides" },
      { href: "/use-cases", label: "Use cases" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    heading: "Project",
    links: [
      { href: "/about", label: "About" },
      { href: "/creator", label: "Creator" },
      { href: "/open-source", label: "Open source" },
      { href: "/changelog", label: "Changelog" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
];
