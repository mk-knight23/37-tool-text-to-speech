# Privacy — MK VoiceKit

This is the engineering privacy document. The user-facing page lives at
[`/privacy`](https://voicekit.mkazi.live/privacy). Both describe the same
behaviour; this file is the technical reference.

## Principle: local-first

MK VoiceKit has no accounts and stores **no user content on any server**.
Text-to-speech runs on your browser's own `speechSynthesis` engine. The text
you paste or import is turned into speech on your device and is never uploaded —
with one explicit, opt-in exception: the AI text tools (below).

## What is processed, and where

| Data | Where it lives | Leaves the device? |
|---|---|---|
| Pasted/imported text, PDFs, subtitles | In-browser (memory + IndexedDB) | No — parsing and playback are entirely client-side. |
| History, presets, listening queue, preferences, usage stats | IndexedDB on your device | No. Export/import/clear in Settings. |
| Theme & analytics-consent choices | `localStorage` on your device | No. |
| Text sent to an AI tool (only when you click one) | `POST /api/ai/*`, in-flight only | Yes, to the AI provider via the Vercel AI Gateway — processed then discarded. |
| BYOK key (if you provide one) | IndexedDB on your device | Sent per-request as an `x-byok-key` header; never logged or stored server-side. |

## AI text tools (optional)

- Text is sent to `/api/ai/[capability]` **only when you invoke a tool**. The
  route processes the request and returns a result; it **retains nothing** —
  there is no database and no logging of request content.
- The request body is size-capped and zod-validated. On failure the route
  returns a typed error the UI shows as "AI unavailable" — it never fabricates
  output.
- Bring-your-own-key: your key is kept locally, sent only as the `x-byok-key`
  header for that single request, and is never logged or persisted. BYOK
  requests bypass the shared quota (they use your own credit).

## Analytics

- Analytics are **off by default**. No Google Tag Manager script loads unless
  **all** of: a `NEXT_PUBLIC_GTM_ID` is configured, `NODE_ENV=production`, and
  you have explicitly granted consent on the cookie banner (default: declined).
- Consent is stored locally (`vk-consent`) and can be changed any time at
  `/cookies` or `/settings`.
- Analytics events carry only counts, bucketed sizes, feature names and
  durations. They **never** include document/narration text, file names, voices
  you type, keys, or any credential (`src/lib/analytics.ts`).

## Network & third parties

- The Content-Security-Policy allows same-origin requests only by default.
  Google Tag Manager / Analytics hosts are permitted **but nothing is requested
  from them until you consent** and a GTM id is configured.
- Fonts are self-hosted; there are no font-CDN or other third-party requests in
  the default state, so the "works entirely in your browser" claim is literally
  true.
- The pdf.js text-extraction worker is served same-origin (`/pdf.worker.min.mjs`).

## Your controls

- **Export** a JSON copy of all local data, **import** it back, or **clear**
  everything (history, presets, queue, prefs, theme, consent) from Settings.
- Turn off history recording entirely in Settings.
- Decline or withdraw analytics consent at any time.

## Data retention

- On the device: until you clear it (history is capped at the 200 newest items).
- On the server: none. The AI route holds request text only for the duration of
  the request.

## Contact

Privacy questions: kazi@reprime.com (see also `public/.well-known/security.txt`).
