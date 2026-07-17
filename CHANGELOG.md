# Changelog

All notable changes to MK VoiceKit. This project is pre-1.0; expect the
workspace to keep evolving. The user-facing version of this log lives at
`/changelog`.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased] — v2 rebuild (in development)

### Added

- Rebuilt on Next.js (App Router) with TypeScript (strict) and Tailwind CSS v4,
  replacing the earlier prototype.
- Workspace: voice picker grouped by language, speed/pitch/volume controls with
  live readouts, and a transcript that highlights the current sentence (and the
  current word where the browser reports word timing).
- Full keyboard control (play/pause, sentence and paragraph navigation, stop,
  speed) and a shortcuts dialog where every listed shortcut works.
- Input support: plain text, Markdown, PDF (client-side text extraction), and
  subtitle files (`.srt`/`.vtt`) with timestamps stripped.
- Local-first storage for history, presets, and the listening queue, with
  export / import / clear-all in Settings.
- Deterministic, in-browser text-prep (number and abbreviation expansion,
  punctuation smoothing), clearly labelled as non-AI.
- Optional AI text tools through the Vercel AI Gateway with an honest
  "AI unavailable" state and a bring-your-own-key option.
- Content and documentation: `/docs`, ten guides, five use-cases, a 12-question
  FAQ, and the standard project and legal pages.
- SEO: per-page metadata and canonicals, registry-driven sitemap, robots,
  JSON-LD (WebApplication, FAQPage, Article, BreadcrumbList, Person), a static
  Open Graph image, and `llms.txt` / `humans.txt` / `security.txt`.
- Consent-gated analytics that are declined by default and load GTM only after
  explicit consent in production.

### Notes

- There is deliberately **no audio/MP3 export**: the browser speech engine
  provides no saveable audio file, and this is stated plainly rather than faked.
- Analytics and ads are off by default; ads are prepared but disabled (see
  `MONETIZATION_PLAN.md`).
