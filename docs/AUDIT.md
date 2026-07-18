# MK VoiceKit — Rebuild Audit (v2)

Source: Agent A automated + manual audit of this repository, 2026-07-17
(`_shared/audits/37-tool-text-to-speech.json`). Key claims spot-checked against
the code on `rebuild/v2` before writing this document.

## 1. What the legacy product is

A ~2,400-LOC client-side text-to-speech tool built on Vue 3.5 + Vite 7 +
TypeScript (strict) + Tailwind 3.4, wrapping the browser Web Speech API
(`speechSynthesis`). Voice selection, rate/pitch/volume sliders, .txt/.md
upload, localStorage history/stats, light/dark/system theme, keyboard
shortcuts, Web Audio sound effects, and genuinely good accessibility CSS.
No backend, no AI calls, no tests, no analytics.

Branding is split three ways: in-app **"VoiceFlow"**, `index.html`
**"StudioVoice | High-Fidelity Synthesis"**, package name **"tts-app"**.
v2 is **MK VoiceKit** everywhere.

## 2. Verified build status (legacy)

- `npm run build` (vue-tsc + vite): **PASS**, zero type errors, ~2s. Bundle 128.6 kB JS (48.3 kB gzip).
- `npm test`: **does not exist** — yet `.github/workflows/ci.yml` runs it, so CI is permanently red.
- Tests: **zero** test files anywhere. `docs/FEATURES.md` claims per-feature tests — false.

## 3. Broken things (confirmed)

| # | Finding | Evidence |
|---|---------|----------|
| 1 | **Nested deploy path 404** (the reported bug): router base hardcoded to `/37-tool-text-to-speech/` (GitHub Pages base) while Vercel serves at root. `https://37-tool-text-to-speech.vercel.app/37-tool-text-to-speech/` returns HTTP 404; at `/` the router base mismatches so views fail to mount. Product effectively unusable on Vercel at both URL forms. | `src/router/index.ts:5` (spot-checked: confirmed), live fetch 2026-07-17 |
| 2 | History page permanently empty: `HistoryView` reads `userStore.history` but nothing ever calls `userStore.addToHistory`; real history is written to the separate `ttsStore`. Two parallel state systems, never connected. | grep confirmed: only `ttsStore.addToHistory` is called (HomeView.vue:136) |
| 3 | Favorites is a facade: `addToFavorites`/`toggleFavorite` defined in `user.ts`, invoked nowhere; state not persisted either. | grep confirmed |
| 4 | "Convert Again" no-op: HistoryView pushes `/?text=...`; HomeView never reads `route.query`. | audit grep |
| 5 | Settings dark-mode toggle dead: flips class `theme-dark` which no CSS rule matches; real theme lives in a different store. | audit |
| 6 | Duplicate app chrome: `App.vue` renders header/footer AND HomeView renders its own second header/footer. | audit |
| 7 | Slider string-coercion bug: range inputs use `v-model` without `.number`, so rate/pitch/volume become strings; `.toFixed(1)` in the template then throws, and strings are assigned to utterance props. | spot-checked HomeView.vue:447/470/493 — no `.number` modifier |
| 8 | CI fake (see §2). Six workflows including "autonomous-evolution" that can push automated commits. | `.github/workflows/` |
| 9 | `deployment/` dir ships broken configs: Dockerfile copies raw source (no build) into nginx; `deployment/vercel.json` serves un-built `index.html`; `deployment/netlify.toml` publishes `.`. Root also has 4 competing deploy configs. | audit |
| 10 | README/docs largely fabricated: "Score 100/100", nonexistent `marketing/` dir, nonexistent tests/API docs, "Vue Router guards" that don't exist. 35+ marketing "evolution" markdown files with fabricated claims. | audit; reputational risk |
| 11 | Keydown listener leak (`onMounted` return value ignored by Vue) + Space handler hijacks focused buttons. | audit |
| 12 | Privacy claim mismatch: footer says "No data is sent to any server" while `index.html` loads Google Fonts from a CDN. | audit |
| 13 | Dead code: `SettingsPanel.vue` (192 lines, never imported), 3 React `.jsx` components in a Vue app, `public/css/premium-design.css`, unused deps `@motionone/vue`, `pinia-plugin-persistedstate`. | audit |

## 4. Security posture (legacy)

- No hardcoded secrets, keys, or tokens found. No `v-html`/`innerHTML` (no injection vector).
- `Math.random()` used for history IDs (low severity; v2 uses `crypto.randomUUID()`).
- Untyped localStorage ingestion (`as any[]`, unvalidated `JSON.parse` merges) — low risk, fixed in v2 by schema-validated storage.
- Google Fonts CDN contradicts the "no external requests" promise — v2 uses system/self-hosted fonts only.

## 5. Worth preserving (ported, not copied)

Copied to local `_legacy_reference/` (gitignored) for the implementation stage:

- **HomeView.vue TTS core (lines ~38–145)** — the speechSynthesis state machine (speak/pause/resume/stop), voice loading with the async `voiceschanged` event, 5000-char guard, utterance event wiring. This logic is sound; v2 ports it to typed modules under `src/lib/speech/`.
- **File-upload handler** with type/size validation (lines ~179–206).
- **settings.ts / stats.ts stores** — clean defensive-load + deep-watch persistence patterns (the surviving store system; `user.ts` dies).
- **useAudio.ts** — complete Web Audio SFX synthesizer, gated on a user setting.
- **style.css** — accessible design-system CSS: skip link, 48px touch targets, 32px slider thumbs, `prefers-contrast`/`prefers-reduced-motion`/print support. Mined for patterns; superseded by DESIGN_SYSTEM.md tokens.
- **Copy**: 4 speech-quality tips, shortcut descriptions, "works entirely in your browser" positioning (true in v2 once fonts are local).
- **firebase.json security headers** as a reference for `next.config.ts` headers.

## 6. Key risks carried into the rebuild

- **Web Speech API voice availability varies wildly** by browser/OS (zero voices on some Linux/Chromium builds). v2 must ship an explicit empty-voices state.
- **localStorage keys are `tts-*`**: renaming without migration silently wipes existing users' history/settings. v2 storage module reads legacy keys once and migrates.
- The `voiceschanged` event is async and fires inconsistently across browsers — port the legacy retry/refresh behavior, don't reinvent it.
- Dual deploy targets (GH Pages vs Vercel) conflicted; v2 targets **root-path serving only** (`https://voicekit.mkazi.live`), killing the nested base path for good.

## 7. Migration decision (ADR-001)

### Audit recommendation (dissenting — recorded honestly)

Agent A recommended **keeping Vite 7 + Vue 3** (`migration.migrate: false`):
the legacy app is a small pure-client tool that type-checks and builds clean
in 2s; the deployment breakage is a 2-line config bug, not an architectural
limit; Vercel serverless functions could sit beside the SPA for future AI
routes; a Next.js rewrite "would discard working Vue code … and deliver zero
new capability." Revisit Next.js only if the product becomes a multi-page SEO
content product with server-rendered docs.

### Orchestrator decision (binding)

**Rebuild on Next.js App Router anyway.** The v2 product spec makes this
exactly the multi-page SEO content product the audit said would justify it:

- Server-rendered public content hubs (≥8 guides, ≥5 use-cases, docs, FAQ, changelog, legal pages) with per-page metadata, sitemap, JSON-LD — a client-only SPA cannot satisfy this SEO requirement.
- Serverless AI routes (`/api/ai/*` via Vercel AI Gateway) as a first-class product surface, not a future maybe.
- One pinned stack across all five MK products (STANDARDS §1) for shared review, CI, and maintenance.

**Consequences**: the working Vue speech logic is not discarded — its behavior
is ported to framework-agnostic TypeScript modules (`src/lib/speech/*`), which
the audit itself suggested ("extract into a composable"). The Vue views,
duplicate stores, and dead code are not ported.

Status: accepted 2026-07-17. Owner: parent orchestrator. This ADR is
repeated in ARCHITECTURE.md by the implementation stage.

## 8. Tool availability note (STANDARDS §0)

- Available and used: **Superpowers**, **UI UX Pro Max** (`ui-ux-pro-max` skill — used to seed DESIGN_SYSTEM.md), **gstack**.
- **Graphify ❌, Humanizer ❌, RALPH ❌** — not installed. Fallbacks per STANDARDS §0: direct repository inspection instead of graph queries; manual copy-voice audit (STANDARDS §9) plus independent QA re-check instead of Humanizer; iterative verify loops instead of RALPH.
