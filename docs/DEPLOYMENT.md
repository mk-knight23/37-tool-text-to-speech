# Deployment — MK VoiceKit

**Target:** Vercel · **Production domain:** https://voicekit.mkazi.live

> **Ownership.** Deployment and production verification are orchestrator-owned.
> This development branch (`rebuild/v2`) was verified **locally only** — the
> squad does not deploy. Per the shared standards, the first deploy goes to a
> `*.vercel.app` URL and the custom domain is attached by the orchestrator.

## Prerequisites

- Node 26, pnpm 11.
- A Vercel project linked to `mk-knight23/37-tool-text-to-speech`.
- Framework preset: **Next.js** (auto-detected). No custom build settings needed.

| Setting | Value |
|---|---|
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm build` (`next build`) |
| Output | `.next` (managed by Vercel) |
| Node version | 26.x |

## Environment variables (Vercel project settings)

All are optional; the app builds and the deterministic workspace works with none
set. See [`.env.example`](.env.example) for full descriptions.

| Variable | Set on Vercel? | Notes |
|---|---|---|
| `AI_GATEWAY_API_KEY` | Usually **no** | Provided automatically via Vercel OIDC on deploy. Set only on non-Vercel hosts. |
| `AI_MODEL` / `AI_MODEL_QUALITY` | Optional | Override the default gateway model strings without a code change. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | `https://voicekit.mkazi.live` — drives canonicals, sitemap, robots, OG image URL. |
| `NEXT_PUBLIC_GTM_ID` | Optional | Unset ⇒ analytics never load. Set to enable (still consent-gated + production-only). |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | Optional | Leave unset/`false`; ads are prepared but disabled. |

## Deploy steps

1. Merge/land `rebuild/v2` per the repo's process (this squad never pushes to
   any remote).
2. Trigger a Vercel deployment (Git integration or `vercel deploy`). First
   release goes to the preview/`*.vercel.app` URL.
3. Confirm the AI Gateway is reachable via OIDC (or set `AI_GATEWAY_API_KEY`),
   or leave AI unconfigured — the UI degrades honestly.
4. Attach the `voicekit.mkazi.live` domain (orchestrator step) and set
   `NEXT_PUBLIC_SITE_URL` to match.
5. Promote to production.

## Pre-deploy checklist (all green locally)

- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 errors
- [ ] `pnpm test` — all unit/integration tests pass
- [ ] `pnpm build` — succeeds
- [ ] `pnpm test:e2e` — Playwright smoke passes (port 3103)

See [`TEST_REPORT.md`](TEST_REPORT.md) for the latest real results.

## Post-deploy verification

- [ ] Key routes return 200: `/`, `/tool`, `/dashboard`, `/history`,
      `/settings`, `/docs`, `/faq`, guides and use-cases.
- [ ] `/sitemap.xml`, `/robots.txt`, `/opengraph-image` and
      `/.well-known/security.txt` resolve.
- [ ] Footer sentence present on every public route:
      "Built and maintained by Kazi Musharraf. Open source for everyone."
- [ ] Security headers present (CSP, HSTS, nosniff, Referrer-Policy,
      Permissions-Policy) — check response headers on `/`.
- [ ] JSON-LD renders (WebApplication on `/`, FAQPage on `/faq`, Article on a
      guide, Person on `/creator`).
- [ ] Canonicals use the production domain (verify `NEXT_PUBLIC_SITE_URL`).
- [ ] With no AI credentials, an AI tool shows the honest "AI unavailable"
      state (never a blank success).
- [ ] No analytics/network calls to third parties before consent.
- [ ] Workspace works on mobile and desktop; keyboard control works.

## Rollback

Use Vercel's instant rollback to re-promote the previous production deployment.
Because there is no server-side user data or database, rollback carries no data
migration risk. Local user data is unaffected (it lives in the browser).
