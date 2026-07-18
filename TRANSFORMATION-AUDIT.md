# Transformation Audit: MK VoiceKit

## Current Architecture
* **Framework**: Next.js (App Router), React, Tailwind CSS, Lucide Icons.
* **Storage**: Local state hydrated from local storage preferences (e.g. volume, pitch, speed, last selected voice). Local history and playlist queue persisted locally.
* **Text Processing**: Standard client-side parser/replacement engine for abbreviations, numbers, and pause normalization.
* **Audio Engine**: Uses Web Speech API (`speechSynthesis`) for local voice outputs, with client-side sentence highlighting and paragraph segmentation.

## Existing Working Features
* Web Speech API integration with real-time text-to-speech rendering, highlighting active words/sentences, and visual progress tracking.
* Voice Picker with local service sorting.
* Speed, pitch, and volume customization sliders.
* Advanced text preparation/normalization rules.
* File dropzone imports for PDF, text, and subtitle files.
* Opt-in local audio playlist queue and preset voice profile savings.
* AI panel for styling/rewriting input text before speaking.

## Friction Points
1. **Tool Redundancy**: Users land on the homepage and have to click through to `/tool` to use the TTS reader.
2. **Layout Overload**: The default layout is divided into a busy two-column grid. Speed sliders, file dropzones, presets, queues, text processing, and AI configurations clutter the interface.
3. **Blank Load State**: The reader starts empty, forcing first-time visitors to type or find text before hearing any audio output.

## Features to Preserve
* Real-time sentence segmenting, highlighting, and playback.
* Web Speech Synthesis hooks and voice profiles.
* File dropzone formats (PDF, Markdown, Subtitles).
* Opt-in playlist queue database and local preset storage.
* Text normalization replacements and AI helper.

## Features to Simplify (Basic Mode)
* Initialize the textarea with a helpful welcome message (no blank state).
* Center the homepage `/` around the workspace.
* Render only the text input, voice picker, and play controls in the basic layout.
* Collapse advanced controls (File import, Speed/Pitch/Volume, Text Normalization, Presets, Queue, AI panel) inside an expandable Settings section.

## Proposed Implementation Plan
1. **Audit Check**: Baseline checked.
2. **Navigation Split**: Group sidebar navigation links into primary and secondary categories.
3. **Collapsible settings drawer**: Re-organize the layout in `Workspace.tsx` so secondary widgets are hidden inside a settings accordion.
4. **Homepage Embedding**: Replace `/` landing page to mount the workspace component directly.
5. **QA & E2E Validation**: Run types, builds, and E2E tests.
