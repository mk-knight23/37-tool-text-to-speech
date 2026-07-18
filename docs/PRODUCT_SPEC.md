# MK VoiceKit — Product Spec (v2)

Product: **MK VoiceKit** · Domain: **https://voicekit.mkazi.live** ·
Repo: https://github.com/mk-knight23/37-tool-text-to-speech ·
Author: Kazi Musharraf. Open source (MIT).

## 1. Objective

A free, local-first, browser text-to-speech workspace. Paste or import text,
pick a voice, tune pitch/rate/volume, and listen with live sentence and word
highlighting, chapter navigation, and full keyboard control. Everything core
runs on the browser's own `speechSynthesis` engine — no account, no upload,
no server-side storage. Optional AI text-preparation features run through
serverless routes and degrade honestly when unavailable.

Success for v1: a person with a long article, study notes, or a subtitle file
can turn it into comfortable listening in under 30 seconds, entirely offline
after first load, keyboard-only if they want.

## 2. Personas

1. **The long-form listener** — reads newsletters/articles, wants them read aloud while doing chores. Cares about: natural pacing, sentence highlighting to re-find their place, resume after interruption.
2. **The proofreader/writer** — listens to their own drafts to catch errors. Cares about: precise sentence navigation, re-speak-from-here, rate control, favorites for a "proofing voice" preset.
3. **The accessibility-first user** — low vision, dyslexia, or reading fatigue; may use a screen reader alongside. Cares about: WCAG-compliant UI, large targets, full keyboard control, high-contrast highlighting, no motion surprises.
4. **The language learner** — imports subtitles (.srt/.vtt) or pasted text in a target language. Cares about: voices grouped by language, slow playback rate, word-level highlighting.
5. **The student** — turns lecture notes and PDFs into audio revision. Cares about: PDF text extraction, chapters, queue of multiple sections, history to resume tomorrow.

## 3. Feature acceptance criteria (V1 core — no AI keys required)

### 3.1 Speech engine (browser `speechSynthesis`)

- [ ] Play, pause, resume, stop — all four verbs work and the UI state machine never desyncs (port legacy state machine behavior).
- [ ] Voice list loads including the async `voiceschanged` path; a manual "reload voices" affordance exists.
- [ ] **Empty-voices state**: when the browser exposes zero voices, the workspace shows an explanatory state (with per-OS hints), never a blank picker.
- [ ] Long texts are chunked into utterances at sentence boundaries so pause/stop stay responsive; queue advances automatically.
- [ ] Engine survives the Chrome ~15s utterance timeout via chunking (known platform quirk — document it).

### 3.2 Voice picker

- [ ] Voices grouped by language (BCP-47 → human-readable, local voices flagged), searchable, keyboard-navigable (combobox pattern).
- [ ] Shows voice count per language group; remembers last-used voice per language.

### 3.3 Controls

- [ ] Pitch (0.5–2.0), rate (0.5–3.0), volume (0–1) sliders with numeric readouts, keyboard steppable (arrow = 0.1, shift+arrow = larger step), double-click/reset-to-default affordance.
- [ ] Values are numbers end-to-end (regression guard for the legacy string-coercion bug — unit test required).

### 3.4 Navigation & highlighting

- [ ] Text is segmented into paragraphs → sentences deterministically (`Intl.Segmenter` with fallback).
- [ ] During playback the current sentence is highlighted; word-level highlight from `boundary` events where the browser fires them, with graceful sentence-only fallback (boundary support varies — never fake word timing).
- [ ] Prev/next sentence and prev/next paragraph controls; clicking any sentence starts speech from it; auto-scroll keeps the active sentence in view (disabled under reduced motion; manual scroll pauses auto-scroll).

### 3.5 Speech queue

- [ ] Multiple text sections (chapters or added items) form a visible queue; reorder, remove, clear; current item indicated; queue persists across reload (IndexedDB).

### 3.6 Favorites (presets)

- [ ] Save current voice + pitch/rate/volume as a named preset; apply, rename, delete; presets persist locally; applying a preset whose voice is missing on this device says so and keeps the rest of the settings.

### 3.7 History

- [ ] Every completed/spoken item is recorded locally (text excerpt, voice, settings, duration, timestamp) with **Speak again** (working, unlike legacy), delete-one, clear-all.
- [ ] One-time migration reads legacy `tts-*` localStorage keys into the new store so existing users keep their history/settings.

### 3.8 Keyboard controls

- [ ] Space play/pause (never when a control is focused — fixes legacy hijack), Esc stop, ←/→ sentence, Shift+←/→ paragraph, ↑/↓ rate, ? opens the shortcuts dialog. All shortcuts listed in the dialog actually work (legacy listed unimplemented ones).
- [ ] Listener cleanup verified (legacy leaked its keydown listener).

### 3.9 Inputs

- [ ] Plain text: paste/type, 100k-char soft ceiling with count indicator.
- [ ] Markdown: stripped to speakable text (headings become chapter candidates).
- [ ] PDF: client-side text extraction via `pdfjs-dist` (worker); scanned/no-text PDFs get an honest "no extractable text" state — no OCR in v1.
- [ ] .txt/.srt/.vtt import: subtitle timestamps/cue numbers/settings stripped, cues joined into sentences; file type/size validated (reject >10 MB with a clear error).
- [ ] All parsing is client-side; files never leave the browser (stated in PRIVACY.md).

### 3.10 Deterministic text prep (local, no AI)

- [ ] Number expansion: cardinals, ordinals, common currency/percent/years into speakable words (locale: English v1).
- [ ] Abbreviation expansion from a curated dictionary (Dr., e.g., etc., St., approx., …) with user toggle.
- [ ] Pause insertion via punctuation normalization (em-dash/ellipsis/semicolon → comma/period pauses) — tunable off.
- [ ] Every transform is pure, unit-tested, and previewable (before/after diff view) — labeled "local processing, not AI".

### 3.11 Honesty rule — no fake export

- [ ] There is **no MP3/audio export button**. `speechSynthesis` provides no audio stream to capture; we do not fake one, route audio through loopback hacks, or grey-out a teaser button.
- [ ] `/docs` and FAQ explain the limitation plainly and describe the roadmap: hosted TTS providers (server-side synthesis with real audio files) as a possible v2, clearly not promised.

## 4. AI features (`/api/ai/*` — optional layer)

All follow STANDARDS §10: zod-validated `POST`, rate limit, quota, Vercel AI
Gateway model strings, honest "AI unavailable" state with BYOK option, and a
deterministic local fallback where one exists. Never store submitted text
server-side. Capabilities:

| Route | Purpose | Local fallback |
|---|---|---|
| `rewrite-natural-speech` | Rewrite text to flow when spoken aloud | none (feature hidden when AI off) |
| `simplify` | Simplify wording, keep meaning | none |
| `summarize` | Short spoken-style summary | none |
| `translate` | Translate before listening | none |
| `reading-level` | Rewrite to a target reading level | none |
| `podcast-script` | Article → two-host podcast script | none |
| `notes-to-narration` | Bullet notes → flowing narration | none |
| `chapters` | Generate chapter titles/breaks | heading-based chapter detection (local, labeled non-AI) |
| `pronunciation` | Suggest respellings for hard words | abbreviation/number expansion (local, labeled non-AI) |
| `multi-speaker` | Format dialogue for alternating voices | none |

Acceptance per route: zod schema rejects oversized/invalid input; failure
returns a typed error the UI renders as "AI unavailable" (never fake output);
`ai_started/ai_completed/ai_failed` analytics events fire (consent-gated).

## 5. Non-goals (v1)

- No MP3/WAV/OGG export (see 3.11). No audio recording of any kind.
- No hosted/neural TTS voices (ElevenLabs etc.) — roadmap only.
- No accounts, no cloud sync, no server-side persistence of user content.
- No OCR for scanned PDFs. No DOCX/EPUB import (roadmap).
- No mobile app; responsive web only.
- No SSML editing UI (the Web Speech API's SSML support is too inconsistent to expose honestly).

## 6. Page map (STANDARDS §4)

| Route | Content |
|---|---|
| `/` | Landing: what it does, honest capability list (incl. the no-export limitation), waveform hero (static/CSS, calm), links into workspace + guides |
| `/tool` | The workspace (voice picker, transcript, playback bar, queue, prep panel, AI panel) |
| `/dashboard` | Real local stats only (characters spoken, sessions, top voices) — honest empty state |
| `/history` | Local history with speak-again |
| `/settings` | Theme, defaults, sound effects toggle, data clear/export/import, consent, BYOK |
| `/docs` | Product docs incl. browser support matrix + the export limitation |
| `/use-cases/*` (≥5) | proofreading-by-ear, language-learning-with-subtitles, studying-from-pdfs, accessible-reading, podcast-script-drafting |
| `/guides/*` (≥8) | e.g. choosing-a-voice, sentence-navigation-keyboard-guide, importing-subtitles, pdf-to-speech, text-prep-for-natural-speech, why-no-mp3-export, browser-voice-differences, building-a-listening-queue |
| `/faq` | incl. "Can I download the audio?" answered honestly |
| `/changelog`, `/about`, `/creator`, `/open-source`, `/privacy`, `/terms`, `/cookies`, `/contact` | per STANDARDS |
| `not-found.tsx`, root `error.tsx` | custom, branded |

All public routes carry the exact footer sentence: "Built and maintained by
Kazi Musharraf. Open source for everyone." + GitHub/portfolio/repo links.

## 7. Privacy constraints

- Spoken/imported text never leaves the device except when the user explicitly invokes an AI feature; the AI route processes and discards it (no retention) — stated in PRIVACY.md.
- Analytics (GTM, consent-gated, default declined) never receives document text, file names, voice names typed by users, or BYOK keys — only counts, bucketed sizes, feature names, durations.
- BYOK key: kept client-side (memory/IndexedDB), sent per-request via `x-byok-key` header, never logged or stored server-side (single documented pattern for this product).
- Local data (history, presets, queue, stats) lives in IndexedDB via `src/lib/storage.ts`; `/settings` offers export/import/clear-all.
- CSP allows self (+ GTM/GA only after consent); no font CDNs, no third-party requests in the default state — making the legacy "works entirely in your browser" claim actually true.

## 8. Definition of done (this rebuild phase)

Per STANDARDS §14: zero TS errors, vitest green (incl. speech-engine state
machine, text segmentation, prep transforms, subtitle/markdown parsers),
Playwright smoke green locally, all §6 pages real, core tool works end-to-end
with no AI keys, honest dashboards, docs complete, clean conventional commits
on `rebuild/v2`. Deployment is orchestrator-owned.
