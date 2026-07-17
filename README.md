# MK VoiceKit

A free, local-first browser text-to-speech workspace. Paste or import text,
pick a voice, tune speed, pitch and volume, and listen with live sentence
highlighting, full keyboard control, a listening queue, and local history.
The core runs entirely on your browser's own speech engine — no account, no
upload, no server-side storage.

- **Live:** https://voicekit.mkazi.live
- **Repository:** https://github.com/mk-knight23/37-tool-text-to-speech
- **License:** MIT

![MK VoiceKit workspace: text on the left segmented into sentences, voice picker and controls on the right](public/screenshots/workspace.png)

## What it does

- Reads pasted text, Markdown, PDFs (client-side text extraction) and subtitle
  files (`.srt` / `.vtt`, timestamps stripped) aloud.
- Highlights the current sentence while it plays — and the current word where
  the browser reports word timing — so you never lose your place.
- Full keyboard control: play/pause, move by sentence or paragraph, stop, and
  adjust speed, with a shortcuts dialog where every listed shortcut works.
- Groups voices by language, remembers your last voice per language, and shows
  an explanatory state (never a blank picker) when the browser exposes none.
- Keeps a local listening queue, named presets, and history with "Speak again"
  — all in IndexedDB, with export / import / clear-all in Settings.
- Deterministic, in-browser text-prep (number and abbreviation expansion,
  punctuation smoothing) — clearly labelled as local processing, not AI.
- Optional AI text tools (rewrite, simplify, summarize, translate and more)
  through the Vercel AI Gateway, with an honest "AI unavailable" state and a
  bring-your-own-key option.

### An honest limitation: no audio download

There is deliberately **no MP3/audio export**. The browser speech engine
(`speechSynthesis`) plays audio but hands back no file to capture, so there is
nothing to save. Rather than fake a download or grey out a teaser button, the
app says so plainly. See [`/docs`](https://voicekit.mkazi.live/docs) and the
[`why-no-mp3-export`](https://voicekit.mkazi.live/guides/why-no-mp3-export)
guide.

## Tech stack

- **Next.js 16** (App Router, `src/` dir) with **TypeScript** in strict mode.
- **Tailwind CSS v4**, `lucide-react` icons.
- **Zod** for all API input validation.
- **IndexedDB** via `idb` behind a typed storage module (`src/lib/storage.ts`).
- **Vercel AI SDK** (`ai`) with gateway model strings for the optional AI layer.
- **Vitest** (+ Testing Library, `fake-indexeddb`) for unit/integration tests;
  **Playwright** for the end-to-end smoke.

## Getting started

Requires Node 26 and pnpm 11.

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

The workspace is fully usable with no environment variables set — everything
except the optional AI tools runs offline after first load.

### Environment variables

Every variable is optional; see [`.env.example`](.env.example) for the full,
commented list. Summary:

| Variable | Purpose | Default |
|---|---|---|
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway credential (auto-provided by OIDC on Vercel). Absent ⇒ AI tools show an honest degraded state. | unset |
| `AI_MODEL` | Fast-tier gateway model string. | `anthropic/claude-haiku-4.5` |
| `AI_MODEL_QUALITY` | Quality-tier gateway model string. | `anthropic/claude-sonnet-4-5` |
| `NEXT_PUBLIC_SITE_URL` | Canonical base URL for metadata/sitemap/robots. | `https://voicekit.mkazi.live` |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager id. Unset ⇒ no analytics script ever loads. | unset |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | Ads load only when exactly `true`. | `false` |

## Architecture

- `src/app/**` — App Router routes: the workspace, dashboard, history, settings,
  the `/api/ai/[capability]` route, and all content/legal pages.
- `src/components/**` — UI, grouped by area (workspace, content, layout, theme).
- `src/hooks/**` — React hooks wrapping the speech engine, voices and prefs.
- `src/lib/**` — framework-free logic: the speech engine state machine, text
  segmentation, parsers, deterministic text-prep, storage, analytics, the AI
  catalog/quota/rate-limit, and SEO/content registries.

The speech engine, parsers and text-prep are pure and unit-tested; the browser
integrations (voices, hooks) are exercised by the Playwright smoke. See
[`ARCHITECTURE.md`](ARCHITECTURE.md), [`AI_ARCHITECTURE.md`](AI_ARCHITECTURE.md)
and [`DATABASE.md`](DATABASE.md).

## Testing

```bash
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint
pnpm test             # vitest run (unit + integration)
pnpm test:coverage    # vitest with v8 coverage
pnpm build            # next build
pnpm test:e2e         # playwright smoke (builds + serves on port 3103)
```

Current status: **218 unit/integration tests** across 33 files, plus a
**6-test Playwright smoke** (desktop + mobile + keyboard). Real command output
and coverage figures are in [`TEST_REPORT.md`](TEST_REPORT.md).

## Deployment

Deploys as a standard Next.js app on Vercel; the AI Gateway credential is
provided by OIDC on deploy. Full steps and the production checklist are in
[`DEPLOYMENT.md`](DEPLOYMENT.md).

## Privacy & security

Imported and pasted text never leaves your device except when you explicitly
invoke an AI tool, and the AI route processes and discards it (no retention).
Analytics are consent-gated and declined by default. See
[`PRIVACY.md`](PRIVACY.md) and [`SECURITY.md`](SECURITY.md).

## Roadmap

- Hosted/neural TTS voices with real downloadable audio (the honest path to an
  export feature) — not promised.
- DOCX/EPUB import; OCR for scanned PDFs.
- Per-word timing on more browsers as `boundary` support improves.

## Author

Built and maintained by **Kazi Musharraf** — AI Engineer, Full-Stack Developer,
Open-Source Builder.

- GitHub: https://github.com/mk-knight23
- Portfolio: https://www.mkazi.live

## License

[MIT](LICENSE) © 2026 Kazi Musharraf. Open source for everyone.
