# Changelog

All notable changes to MK VoiceKit. The user-facing version of this log lives
at `/changelog`.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [2.2.0] — 2026-07-21

### Added
- **Voice Studio Workspace** (`/studio`): Bento-style vertical scene timeline editor, custom pause configuration, voice settings per scene, local IndexedDB project saving, and background music loops/volume controls with automatic speech volume ducking.
- **AI BYOK Provider Relay Architecture**: Added a credentials settings manager in `/settings` to save OpenAI, ElevenLabs, Google Cloud TTS, Azure Speech, and Amazon Polly keys client-side; built dynamic server-side endpoint relays at `/api/ai/tts` matching a unified provider-neutral interface.
- **Transcription & Dubbing Workspace** (`/transcribe`): Microphone recorder with visualizer waveforms, dual-path transcribing (native dictation + Whisper files relay at `/api/ai/transcribe`), dialogue segment editor (tags/timestamps/clean-ups), subtitles export, and translations dubbing scripts compiler.
- **Document Reader Workspace** (`/reader`): Advanced EPUB, DOCX, and PDF text/layout parsing, Table of Contents drawer navigation, line height/margins/dyslexia-friendly settings, and reading progress preservation.
- **Library Tagging & Central Hub** (`/library`): Centralized list directory for drafts, documents, and projects, tag search archives, and binary audio blobs storage.

## [2.1.0] — 2026-07-18

### Focused Product Transformation
- **Homepage Integration**: Embedded the client-side `Workspace` directly on the homepage.
- **Immediate Outcome Text**: Auto-filled the textarea with a welcome sentence to guide first-time visitors.
- **Basic Mode Layout**: Simplified default view displaying only text input, voice picker, sentence highlights, and play controls.
- **Collapsible Settings accordion**: Grouped secondary widgets (Import Dropzone, voice controls, Text Prep replacements, presets, queue, AI optimizing) inside a collapsible advanced section.
- **Split navigation menu**: Separated header nav links into primary and secondary segments with a divider and included a link to the GitHub repository.

## [2.0.0] — 2026-07-18

Full rebuild of MK VoiceKit. The v1 prototype is replaced by a local-first
Next.js workspace with a real test suite, CI, and complete documentation.

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
  `docs/MONETIZATION_PLAN.md`).
