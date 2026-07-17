# Architecture — MK VoiceKit

This document describes how MK VoiceKit is put together and why. For the AI
layer specifically see [`AI_ARCHITECTURE.md`](AI_ARCHITECTURE.md); for storage
see [`DATABASE.md`](DATABASE.md).

## 1. Shape of the app

MK VoiceKit is a **local-first Next.js (App Router) application**. The core
product — turning text into speech — runs entirely in the browser on the Web
Speech API (`speechSynthesis`). There is no server-side persistence and no
required backend; the only server code is the optional AI route.

```
Browser
├─ React UI (App Router client components)
├─ Speech engine state machine  ── speechSynthesis (OS voices)
├─ Parsers (txt / md / pdf / srt / vtt)  ── all client-side
├─ Deterministic text-prep (numbers, abbreviations, pauses)
└─ IndexedDB (history, presets, queue, prefs, stats) via idb

Server (Vercel, optional)
└─ POST /api/ai/[capability]  ── zod → rate-limit → quota → AI Gateway
```

## 2. Directory layout

| Path | Responsibility |
|---|---|
| `src/app/**` | Routes. Workspace (`/tool`), `/dashboard`, `/history`, `/settings`, content (`/guides/*`, `/use-cases/*`, `/docs`, `/faq`), legal/project pages, `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, `not-found.tsx`, `error.tsx`, and `api/ai/[capability]/route.ts`. |
| `src/components/**` | UI grouped by area: `workspace/`, `content/`, `layout/`, `theme/`, `ui/`, `pages/`, `analytics/`. |
| `src/hooks/**` | React hooks: `useSpeechEngine`, `useVoices`, `usePrefs`, `useGlobalShortcuts`. Thin adapters between React and the framework-free `lib` logic. |
| `src/lib/**` | Framework-free logic (see §3). Unit-testable in isolation. |
| `e2e/**` | Playwright smoke specs. |

The guiding rule: **keep logic out of components**. Anything with rules —
the speech state machine, segmentation, parsing, text-prep, storage, analytics
gating, AI catalog/quota — lives in `src/lib` as pure functions or small
classes, so it can be unit-tested without a DOM or a browser.

## 3. The logic layer (`src/lib`)

| Module | What it owns |
|---|---|
| `speech/engine.ts` | The playback **state machine** (idle → speaking → paused → idle) over chunked utterances. Guards the four verbs (play/pause/resume/stop) so UI state never desyncs, and survives Chrome's ~15s utterance cap via chunking. |
| `speech/segment.ts` | Deterministic paragraph → sentence segmentation (`Intl.Segmenter` with a fallback). |
| `speech/chunk.ts` | Splits long sentences into engine-sized utterances. |
| `speech/voices.ts` | Voice loading (incl. the async `voiceschanged` path), grouping by language, and lookup by URI. |
| `parsers/{file,markdown,subtitles,pdf}.ts` | Import dispatch, type/size validation, and per-format text extraction. All client-side. |
| `textprep/{index,numbers,abbreviations,pauses}.ts` | Pure, previewable, opt-in text transforms. Labelled "local processing, not AI". |
| `storage.ts` | Typed IndexedDB access (via `idb`), zod-validated reads, export/import/clear, and one-time legacy migration. |
| `analytics.ts` | Consent-gated typed `track()` (no-op unless production + GTM id + granted consent). |
| `ai/*` | Capability catalog, zod schemas, model resolution, server rate-limit, and client/server quota. |
| `content.ts`, `seo.ts`, `site.ts` | Content registry (single source of truth for guides/use-cases), per-page metadata helper, and site/creator constants. |

## 4. Key data flows

### Listening flow (deterministic, no AI)

1. Text enters via the textarea or `importFile()` (parsers validate and extract).
2. `prepareText()` applies any enabled text-prep transforms (pure).
3. `segmentText()` produces paragraph/sentence refs.
4. The React `Workspace` pushes sentences + settings into the `useSpeechEngine`
   state machine, which drives `speechSynthesis` chunk by chunk.
5. `boundary` events update the active word range where the browser supports it;
   otherwise highlighting stays at sentence granularity (never faked).
6. On completion/stop, a history entry and usage stats are written to IndexedDB.

### AI flow (optional)

`AiPanel` → `POST /api/ai/[capability]` → zod validation → per-IP rate limit →
daily quota → model resolved from a gateway string → streamed/structured
response. No credential (and no BYOK key) ⇒ a typed `ai_unavailable` error the
UI renders honestly. Details in [`AI_ARCHITECTURE.md`](AI_ARCHITECTURE.md).

## 5. Rendering & state

- Content, legal and marketing pages are **static** (prerendered at build).
- The workspace and other stateful surfaces are **client components**; there is
  no user data on the server to render.
- Local state is React `useState`; durable state is IndexedDB, hydrated
  asynchronously (defaults render first, then persisted values are adopted).
- Theme (light/dark/system) is applied pre-paint by an inline script to avoid a
  flash of the wrong theme.

## 6. Cross-cutting decisions

- **No database / no server storage in v1** — the product is genuinely
  local-first; adding a DB would be speculative. Rationale in
  [`DATABASE.md`](DATABASE.md).
- **Security headers** (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy)
  are set in `next.config.ts`; see [`SECURITY.md`](SECURITY.md).
- **Config over code**: models, site URL, analytics id and the ads flag are all
  environment-driven so operational changes need no code edit.
- **Honesty**: capabilities the browser cannot provide (audio export, universal
  word timing, OCR) are stated as limitations, never mocked.

## 7. Testing strategy

- **Unit / integration (Vitest, jsdom):** the whole `src/lib` layer, including
  the storage module against an in-memory `fake-indexeddb`.
- **End-to-end (Playwright):** the deterministic primary flow on port 3103, in a
  desktop and a mobile viewport, including a keyboard pass.
- Browser-only modules (`hooks/*`, `speech/voices.ts`) are covered by the smoke
  rather than jsdom units. Real figures: [`TEST_REPORT.md`](TEST_REPORT.md).
