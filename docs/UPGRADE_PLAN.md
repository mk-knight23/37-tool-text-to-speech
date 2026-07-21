# MK VoiceKit — Architecture & Upgrade Specification

This document details the completed transformation of MK VoiceKit from a basic text-to-speech utility into a comprehensive, privacy-first voice, reading, transcription, and AI content workspace.

---

## 1. Production Architecture & Feature Inventory

MK VoiceKit is a local-first Next.js (App Router) web application built with React 19, TypeScript strict mode, and Tailwind CSS.

```
Client (Browser Local Sandbox)
├─ React UI (App Router client workspaces)
├─ Speech Engine (window.speechSynthesis / OS voices with pitch/rate/volume controls)
├─ Local Parsers (TXT / MD / PDF / DOCX / EPUB / SRT / VTT)
├─ Deterministic Text Preparation (abbreviations, number expansion, pause normalization)
├─ IndexedDB v2 Database (library, history, presets, kv, generated_audio) via idb
└─ Web Audio API (silent audio generator, mic recording, waveform monitoring)

Serverless Edge / API Routes
├─ POST /api/extract (Server-side webpage article text extraction)
├─ POST /api/ai/tts (Multi-provider TTS backend for OpenAI, ElevenLabs, Google Cloud, Azure, and Amazon Polly)
├─ POST /api/ai/transcribe (Whisper AI audio transcription)
└─ POST /api/ai/[capability] (Zod schema validation → rate limiting → AI transformations)
```

---

## 2. Five Primary Workspaces

1. **Text to Speech (`/`)**:
   - Above-the-fold distraction-free speech workspace.
   - Real-time sentence, paragraph, word, character, and estimated duration counters.
   - Find & Replace toolbar with match count, Next/Previous controls, Replace Next, and Replace All.
   - Visual reading aids: Fullscreen Focus Mode, Dyslexia letter tracking font, and Reading Ruler overlay.

2. **Document Reader & Interactive Q&A (`/reader`)**:
   - Ingests PDF, Word (.docx), EPUB, Markdown, Subtitles, and Webpages locally.
   - **Document Q&A Panel**: Answers questions citing exact Page Number, Heading, and Sentence section.
   - **AI Document Extensions**: Executive Summary, Key Takeaways, Glossary, Flashcards, Quiz questions, and Podcast Script.
   - Sentence-level bookmarks, notes, and text selection exports.

3. **Multi-Speaker Voice Studio (`/studio`)**:
   - 10 starter project templates (Two-Person Podcast, Interview, Audiobook, YouTube Narration, etc.).
   - Multi-scene composition timeline with individual speaker/voice/pitch/rate settings and pause boundaries.
   - Scene reordering, duplication, rename, background audio ducking, and multi-format exports (JSON, Script, SRT, VTT).

4. **Transcription Workspace (`/transcribe`)**:
   - Live microphone dictation with waveform timer and audio/video file uploader (MP3, WAV, M4A, MP4, WebM).
   - Whisper AI integration, filler-word removal, search & replace, and AI meeting summaries.

5. **Enhanced Library (`/library`)**:
   - Centralized IndexedDB v2 hub for drafts, documents, projects, transcripts, and audio clips.
   - Multi-view modes (Grid, List, Compact table), multi-tagging, favorite toggles, and bulk operations.
   - Storage usage gauge with export/import backup validation.

---

## 3. SEO Landing Pages & Authoritative Guides

- **20 Dedicated SEO Tool Landing Pages** in `src/app/`:
  `/text-to-speech`, `/ai-voice-generator`, `/pdf-reader`, `/document-reader`, `/speech-to-text`, `/transcription`, `/voiceover-generator`, `/podcast-voice-generator`, `/youtube-voiceover`, `/audiobook-voice-generator`, `/audio-translator`, `/assisted-dubbing`, `/pronunciation-generator`, `/speech-timer`, `/words-to-minutes`, `/srt-to-vtt`, `/vtt-to-srt`, `/transcript-cleaner`, `/hindi-text-to-speech`, `/indian-english-text-to-speech`.
  *Each page includes an embedded functional tool, H1, 40–70 word AEO direct answer block, step-by-step HowTo guide, format specs, privacy notices, honest limitations, and JSON-LD structured data (`WebApplication`, `HowTo`, `FAQPage`).*

- **15 Deep Guides** in `src/app/guides/`:
  Comprehensive practical guides covering audio pacing, YouTube script timing, Whisper setup, dubbing workflows, pronunciation dictionaries, and text prep.

- **Dynamic Sitemap**:
  `src/app/sitemap.ts` automatically generates a structured XML sitemap covering all 68 production routes.

---

## 4. Verification & Quality Standards

- **TypeScript Compilation**: 100% clean with zero type errors (`pnpm typecheck`).
- **Test Suite**: 40 test files passing all 246 unit and integration tests (`pnpm test`).
- **Next.js Production Build**: 68 routes optimized and prerendered (`pnpm build`).
- **Zero Fake Features**: Every visible control is wired to local Web APIs, browser speech, or backend adapters.
- **Privacy Guarantee**: All core reading, document parsing, and speech playback operate locally in the browser sandbox.
