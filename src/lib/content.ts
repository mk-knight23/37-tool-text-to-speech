/**
 * Content registry — the single source of truth for guides and use-case articles.
 */

export interface ContentEntry {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string;
  minutes: number;
}

/** 15 Long-form how-to and explainer guides. */
export const GUIDES: ContentEntry[] = [
  {
    slug: "choosing-a-voice",
    title: "Choosing a voice that's easy to listen to",
    description:
      "How to pick a browser voice for long listening: what the local badge means, why some voices sound clearer, and how to save a favourite per language in MK VoiceKit.",
    excerpt:
      "What the local badge means, why voices sound different, and how to settle on one you can listen to for an hour.",
    date: "2026-07-21",
    minutes: 6,
  },
  {
    slug: "navigating-text-by-keyboard",
    title: "Navigating text by keyboard",
    description:
      "A complete keyboard guide to MK VoiceKit: play and pause with Space, move by sentence or paragraph, stop with Escape, and jump to any sentence — without touching the mouse.",
    excerpt:
      "Play, pause, move by sentence or paragraph, and jump around a document using only the keyboard.",
    date: "2026-07-21",
    minutes: 7,
  },
  {
    slug: "importing-subtitles",
    title: "Turning subtitles into speech",
    description:
      "Import .srt and .vtt subtitle files into MK VoiceKit. How timestamps and cue numbers are stripped, how cues become sentences, and what to check before you press play.",
    excerpt:
      "Load an .srt or .vtt file, drop the timestamps automatically, and listen to the dialogue as continuous speech.",
    date: "2026-07-21",
    minutes: 6,
  },
  {
    slug: "pdf-to-speech",
    title: "Listening to a PDF",
    description:
      "Extract text from a PDF in your browser and listen to it. How the text layer works, why scanned documents can't be read without OCR, and how to get the cleanest result.",
    excerpt:
      "Pull the text layer out of a PDF on your own device and read it aloud — and know when a PDF simply can't be read.",
    date: "2026-07-21",
    minutes: 7,
  },
  {
    slug: "text-prep-for-natural-speech",
    title: "Preparing text so it sounds natural",
    description:
      "Numbers, abbreviations and punctuation trip up speech engines. How MK VoiceKit's local text-prep expands them, why it runs on your device, and when to leave it off.",
    excerpt:
      "Expand numbers and abbreviations and smooth out punctuation so a synthetic voice reads the way you'd say it.",
    date: "2026-07-21",
    minutes: 8,
  },
  {
    slug: "why-no-mp3-export",
    title: "Why browser TTS has no direct MP3 download",
    description:
      "The browser speech engine plays audio but hands back no file to save. An honest explanation of the limitation and how optional server AI providers support MP3 export.",
    excerpt:
      "A straight answer to the most common request: why the browser gives sound but no downloadable audio file.",
    date: "2026-07-21",
    minutes: 6,
  },
  {
    slug: "browser-voice-differences",
    title: "Why voices differ between browsers",
    description:
      "The same text sounds different in Chrome, Safari, Edge and Firefox because each borrows voices from the operating system. What to expect on each platform.",
    excerpt:
      "The voices you see come from your operating system, not from us. Here's what each browser and OS offers.",
    date: "2026-07-21",
    minutes: 7,
  },
  {
    slug: "building-a-listening-queue",
    title: "Building a listening queue",
    description:
      "Line up several sections and listen back to back. How the queue works in MK VoiceKit, how it survives a reload, and how to reorder items with the keyboard.",
    excerpt:
      "Queue chapters or separate pieces of text and let them play through in order — the way a playlist works.",
    date: "2026-07-21",
    minutes: 6,
  },
  {
    slug: "reading-long-articles-aloud",
    title: "Reading long articles aloud without losing your place",
    description:
      "Turn a long article into comfortable listening: paste or import it, follow the highlighted sentence, and resume tomorrow from your local history in MK VoiceKit.",
    excerpt:
      "A practical routine for getting through newsletters and long reads by ear, and picking up where you left off.",
    date: "2026-07-21",
    minutes: 7,
  },
  {
    slug: "using-the-ai-text-tools",
    title: "Using the optional AI text tools",
    description:
      "MK VoiceKit's AI tools can rewrite, simplify, summarise or translate text before you listen. How they work, what stays private, the daily limit, and using your own key.",
    excerpt:
      "When it helps to rewrite or simplify text before listening — and exactly what happens to that text.",
    date: "2026-07-21",
    minutes: 7,
  },
  {
    slug: "audiobook-narration-pacing",
    title: "Mastering Audiobook Narration Pacing & Pauses",
    description:
      "A complete guide to pacing long-form stories and novels for audiobook synthesis: ideal WPM speeds, paragraph pause boundaries, and chapter markers.",
    excerpt:
      "How to set soothing 130-150 WPM narration speeds and calibrated scene pauses for comfortable audiobook listening.",
    date: "2026-07-21",
    minutes: 7,
  },
  {
    slug: "youtube-script-duration-guide",
    title: "How to Hit Exact YouTube Video Durations",
    description:
      "Budgeting script word counts for 60-second YouTube shorts and 10-minute feature videos. Speaking rates, retention hooks, and subtitle formatting.",
    excerpt:
      "Calculate exact script word counts to hit 60-second shorts or 10-minute YouTube video limits perfectly.",
    date: "2026-07-21",
    minutes: 6,
  },
  {
    slug: "speech-to-text-whisper-setup",
    title: "Speech to Text & Whisper AI Integration Guide",
    description:
      "How to transcribe microphone dictation and audio/video files with zero data loss. Timestamp syncing, speaker diarization, and meeting summaries.",
    excerpt:
      "Step-by-step setup for microphone dictation and AI Whisper transcription with timestamped exports.",
    date: "2026-07-21",
    minutes: 8,
  },
  {
    slug: "assisted-dubbing-workflow",
    title: "The 10-Step Assisted Dubbing Pipeline",
    description:
      "How to translate video voiceovers and audio tracks into foreign languages while preserving brand glossaries, sentence timing, and emotional tone.",
    excerpt:
      "Translate and re-voice foreign audio step-by-step with glossary locking and subtitle synchronization.",
    date: "2026-07-21",
    minutes: 9,
  },
  {
    slug: "pronunciation-dictionary-setup",
    title: "Setting Up a Custom Pronunciation Dictionary",
    description:
      "How to fix mispronounced names, acronyms, and technical jargon in speech synthesis engines using phonetic respellings and substitution rules.",
    excerpt:
      "Ensure speech synthesis engines pronounce acronyms and brand names flawlessly with custom phonetic rules.",
    date: "2026-07-21",
    minutes: 6,
  },
];

/** Concrete scenario walkthroughs. */
export const USE_CASES: ContentEntry[] = [
  {
    slug: "proofreading-by-ear",
    title: "Proofreading by ear",
    description:
      "Catch typos, clumsy sentences and missing words by listening to your own draft. A workflow for proofreading with MK VoiceKit using sentence navigation.",
    excerpt:
      "Your ear catches what your eye skips. Listen to a draft to find the mistakes you've read past ten times.",
    date: "2026-07-21",
    minutes: 6,
  },
  {
    slug: "language-learning-with-subtitles",
    title: "Language learning with subtitles",
    description:
      "Use subtitle files and slow playback to practise listening in a new language. Import an .srt, group voices by language, and slow the rate down.",
    excerpt:
      "Turn a subtitle file into slow, repeatable listening practice in the language you're learning.",
    date: "2026-07-21",
    minutes: 6,
  },
  {
    slug: "studying-from-pdfs",
    title: "Studying from PDFs",
    description:
      "Revise lecture notes and readings by ear. Extract text from course PDFs, split them into chapters, queue the sections, and resume from history.",
    excerpt:
      "Turn readings and lecture notes into audio revision you can listen to on a walk, then resume the next day.",
    date: "2026-07-21",
    minutes: 7,
  },
  {
    slug: "accessible-reading",
    title: "Accessible reading",
    description:
      "For low vision, dyslexia or reading fatigue: a keyboard-first, high-contrast, screen-reader-friendly way to have text read aloud with sentence highlighting.",
    excerpt:
      "A reading tool built for low vision, dyslexia and reading fatigue — keyboard-first and high contrast.",
    date: "2026-07-21",
    minutes: 6,
  },
  {
    slug: "podcast-script-drafting",
    title: "Drafting a podcast script",
    description:
      "Hear a script before you record it. Draft in MK VoiceKit, shape dialogue into a two-host format, and listen back to catch what reads badly.",
    excerpt:
      "Hear how a script sounds before you sit down to record, and shape an article into a spoken format.",
    date: "2026-07-21",
    minutes: 6,
  },
];

export function getGuide(slug: string): ContentEntry | undefined {
  return GUIDES.find((entry) => entry.slug === slug);
}

export function getUseCase(slug: string): ContentEntry | undefined {
  return USE_CASES.find((entry) => entry.slug === slug);
}
