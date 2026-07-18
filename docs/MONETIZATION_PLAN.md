# MK VoiceKit — Monetization Plan

Status: **Ads prepared but DISABLED.** No ad script loads, no ad network is
contacted, and no publisher account exists yet. This document records the plan
so activation is a deliberate, auditable step (STANDARDS §7).

## Current state

- `NEXT_PUBLIC_ADSENSE_ENABLED` defaults to `false` (see `.env.example`). While
  it is not exactly `"true"`, the reserved slot component renders **nothing** —
  no markup, no script, no network request, no reserved space, and therefore no
  cumulative layout shift.
- There is **no `public/ads.txt`** and there will not be one until a real
  publisher id exists. Shipping an `ads.txt` without a verified publisher would
  be dishonest and useless.
- The reserved slot lives in one place: `src/components/content/AdSlot.tsx`.
  Enabling ads later is a single, reviewable change rather than edits scattered
  across pages.

## Why ads are off for now

The product's promise is that it works entirely in your browser with no
third-party requests in the default state (see PRIVACY.md and the CSP in
`next.config.ts`). Loading an ad network would break that promise, so ads stay
off until there is a deliberate decision to change the trade-off, and even then
only on long-form content pages — never in the workspace.

## Intended placements (when/if enabled)

Ads would appear **only** on long-form, low-interaction pages, never in the
workspace, dashboard, history, or settings, and never near a control:

| Placement key   | Where                                   | Reserved size |
| --------------- | --------------------------------------- | ------------- |
| `guide-inline`  | After the body of a guide / use-case    | ~280px tall   |
| `docs-sidebar`  | Docs sidebar on wide viewports (future) | ~600px tall   |

The `guide-inline` slot is already wired into `ArticleShell` (guides and
use-cases) via `<AdSlot />`; it is invisible while disabled.

## Activation checklist (not done)

1. Obtain a real AdSense (or equivalent) publisher id.
2. Add the publisher id to environment configuration and emit the ad markup in
   `AdSlot.tsx` (currently it only reserves fixed dimensions even when enabled).
3. Add `public/ads.txt` with the verified publisher line.
4. Extend the CSP in `next.config.ts` to allow the ad network's hosts, and
   document the exception in SECURITY.md.
5. Make ad loading consent-gated alongside analytics (declined by default), and
   update PRIVACY.md and the cookies page to describe the ad cookies.
6. Verify no layout shift and no impact on Core Web Vitals before shipping.

## Alternative / preferred revenue directions

Because ads conflict with the privacy promise, the more likely paths are:

- **Bring-your-own-key already supported** for the AI tools — no margin, but no
  cost either.
- A possible future **hosted neural-voice tier** (real downloadable audio),
  which would be a paid add-on precisely because it changes the cost and privacy
  model. Clearly a roadmap idea, not promised (see the FAQ and the
  "why no MP3 export" guide).
