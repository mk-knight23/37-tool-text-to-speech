# MK VoiceKit — SEO Plan

Covers the on-page and technical SEO implemented in this phase (STANDARDS §5).

## Canonical domain and base URL

- Production domain: `https://voicekit.mkazi.live`.
- `NEXT_PUBLIC_SITE_URL` drives every canonical, the sitemap, robots, and
  structured-data URLs. It defaults to the production domain when unset
  (`src/lib/site.ts`), so previews on `*.vercel.app` can override it without
  code changes.
- `metadataBase` is set in the root layout so all relative canonicals resolve to
  absolute URLs.

## Per-page metadata

- Every route exports `metadata`. Static content pages use the `pageMetadata`
  helper (`src/lib/seo.ts`), which produces a unique title, description,
  canonical (`alternates.canonical`), and matching Open Graph + Twitter cards.
- Titles are unique per page and suffixed with the product name (except the home
  page, which leads with the product name).

## Structured data (JSON-LD)

Rendered via `src/components/content/JsonLd.tsx`:

| Type              | Where                                              |
| ----------------- | -------------------------------------------------- |
| `WebApplication`  | Home (`/`)                                         |
| `FAQPage`         | `/faq` (all 12 Q&As)                               |
| `Article`         | Every guide and use-case (via `ArticleShell`)      |
| `BreadcrumbList`  | Every guide, use-case, and static content page     |
| `Person`          | `/creator`                                         |

`HowTo` is intentionally not emitted: the guides are explainer/how-to prose but
are not step-list recipes, so `Article` is the honest type. It can be added to
genuinely step-by-step guides later.

## Sitemap and robots

- `app/sitemap.ts` lists every public route. Guide and use-case entries are
  derived from the content registry (`src/lib/content.ts`) so new articles are
  included automatically.
- `app/robots.ts` allows all crawlers and points to the sitemap.

## Static SEO / agent files

- `public/llms.txt` — a plain-language summary for language models, including the
  honest "no audio export" and "no OCR" limitations.
- `public/humans.txt` — creator and tech-stack credits.
- `public/.well-known/security.txt` — RFC 9116 security contact.

## Open Graph image

- `app/opengraph-image.tsx` generates a 1200×630 PNG at build time with
  `next/og` (Satori). No external service is called; the typeface is the app's
  own self-hosted Atkinson Hyperlegible, read from `node_modules`. Next wires it
  into OG + Twitter metadata for every route.

## Internal linking

- A grouped footer links to every public route on every page.
- Guides and use-cases cross-link via a "Read next" block and inline links; the
  docs page lists all guides; hubs (`/guides`, `/use-cases`) card-link to each
  article. Tool ↔ guides ↔ use-cases are interlinked per STANDARDS §5.

## Semantics and accessibility (SEO-adjacent)

- Semantic landmarks (`header`/`nav`/`main`/`footer`), a single `h1` per page,
  sequential headings, descriptive URLs, and breadcrumbs on nested pages.

## Not in scope this phase

- Real-world ranking depends on deployment and backlinks (orchestrator-owned).
- No hreflang/i18n — the product UI is English-only in v1.
