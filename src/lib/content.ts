/**
 * Content registry — the single source of truth for guides and use-case
 * articles. Index pages, the sitemap, JSON-LD, and internal linking all read
 * from these arrays so a new article is added in exactly one place and every
 * derived surface stays consistent.
 *
 * The article body lives in each route's own `page.tsx`; this file holds only
 * the metadata needed to list, link, and describe it.
 */

export interface ContentEntry {
  slug: string;
  title: string;
  /** Meta description + OG/Twitter description (unique per article). */
  description: string;
  /** One-line summary shown on index cards. */
  excerpt: string;
  /** ISO date (YYYY-MM-DD) the article was published or last revised. */
  date: string;
  /** Estimated reading time in minutes (rounded), for the article meta line. */
  minutes: number;
}

/** Long-form how-to and explainer guides (STANDARDS §4: ≥8 substantial). */
export const GUIDES: ContentEntry[] = [
  {
    slug: "choosing-a-voice",
    title: "Choosing a voice that's easy to listen to",
    description:
      "How to pick a browser voice for long listening: what the local badge means, why some voices sound clearer, and how to save a favourite per language in MK VoiceKit.",
    excerpt:
      "What the local badge means, why voices sound different, and how to settle on one you can listen to for an hour.",
    date: "2026-07-17",
    minutes: 6,
  },
  {
    slug: "navigating-text-by-keyboard",
    title: "Navigating text by keyboard",
    description:
      "A complete keyboard guide to MK VoiceKit: play and pause with Space, move by sentence or paragraph, stop with Escape, and jump to any sentence — without touching the mouse.",
    excerpt:
      "Play, pause, move by sentence or paragraph, and jump around a document using only the keyboard.",
    date: "2026-07-17",
    minutes: 7,
  },
  {
    slug: "importing-subtitles",
    title: "Turning subtitles into speech",
    description:
      "Import .srt and .vtt subtitle files into MK VoiceKit. How timestamps and cue numbers are stripped, how cues become sentences, and what to check before you press play.",
    excerpt:
      "Load an .srt or .vtt file, drop the timestamps automatically, and listen to the dialogue as continuous speech.",
    date: "2026-07-17",
    minutes: 6,
  },
  {
    slug: "pdf-to-speech",
    title: "Listening to a PDF",
    description:
      "Extract text from a PDF in your browser and listen to it. How the text layer works, why scanned documents can't be read without OCR, and how to get the cleanest result.",
    excerpt:
      "Pull the text layer out of a PDF on your own device and read it aloud — and know when a PDF simply can't be read.",
    date: "2026-07-17",
    minutes: 7,
  },
  {
    slug: "text-prep-for-natural-speech",
    title: "Preparing text so it sounds natural",
    description:
      "Numbers, abbreviations and punctuation trip up speech engines. How MK VoiceKit's local text-prep expands them, why it runs on your device, and when to leave it off.",
    excerpt:
      "Expand numbers and abbreviations and smooth out punctuation so a synthetic voice reads the way you'd say it.",
    date: "2026-07-17",
    minutes: 8,
  },
  {
    slug: "why-no-mp3-export",
    title: "Why there's no MP3 download",
    description:
      "The browser speech engine plays audio but hands back no file to save. An honest explanation of the limitation, the workarounds people ask about, and what a v2 might do.",
    excerpt:
      "A straight answer to the most common request: why the browser gives us sound but no downloadable audio file.",
    date: "2026-07-17",
    minutes: 6,
  },
  {
    slug: "browser-voice-differences",
    title: "Why voices differ between browsers",
    description:
      "The same text sounds different in Chrome, Safari, Edge and Firefox because each borrows voices from the operating system. What to expect on each platform and how to add more.",
    excerpt:
      "The voices you see come from your operating system, not from us. Here's what each browser and OS offers.",
    date: "2026-07-17",
    minutes: 7,
  },
  {
    slug: "building-a-listening-queue",
    title: "Building a listening queue",
    description:
      "Line up several sections and listen back to back. How the queue works in MK VoiceKit, how it survives a reload, and how to reorder items with the keyboard.",
    excerpt:
      "Queue chapters or separate pieces of text and let them play through in order — the way a playlist works.",
    date: "2026-07-17",
    minutes: 6,
  },
  {
    slug: "reading-long-articles-aloud",
    title: "Reading long articles aloud without losing your place",
    description:
      "Turn a long article into comfortable listening: paste or import it, follow the highlighted sentence, and resume tomorrow from your local history in MK VoiceKit.",
    excerpt:
      "A practical routine for getting through newsletters and long reads by ear, and picking up where you left off.",
    date: "2026-07-17",
    minutes: 7,
  },
  {
    slug: "using-the-ai-text-tools",
    title: "Using the optional AI text tools",
    description:
      "MK VoiceKit's AI tools can rewrite, simplify, summarise or translate text before you listen. How they work, what stays private, the daily limit, and using your own key.",
    excerpt:
      "When it helps to rewrite or simplify text before listening — and exactly what happens to that text.",
    date: "2026-07-17",
    minutes: 7,
  },
];

/** Concrete scenario walkthroughs (STANDARDS §4: ≥5). */
export const USE_CASES: ContentEntry[] = [
  {
    slug: "proofreading-by-ear",
    title: "Proofreading by ear",
    description:
      "Catch typos, clumsy sentences and missing words by listening to your own draft. A workflow for proofreading with MK VoiceKit using sentence navigation and a proofing preset.",
    excerpt:
      "Your ear catches what your eye skips. Listen to a draft to find the mistakes you've read past ten times.",
    date: "2026-07-17",
    minutes: 6,
  },
  {
    slug: "language-learning-with-subtitles",
    title: "Language learning with subtitles",
    description:
      "Use subtitle files and slow playback to practise listening in a new language. Import an .srt, group voices by language, and slow the rate down in MK VoiceKit.",
    excerpt:
      "Turn a subtitle file into slow, repeatable listening practice in the language you're learning.",
    date: "2026-07-17",
    minutes: 6,
  },
  {
    slug: "studying-from-pdfs",
    title: "Studying from PDFs",
    description:
      "Revise lecture notes and readings by ear. Extract text from course PDFs, split them into chapters, queue the sections, and resume from history — all in your browser.",
    excerpt:
      "Turn readings and lecture notes into audio revision you can listen to on a walk, then resume the next day.",
    date: "2026-07-17",
    minutes: 7,
  },
  {
    slug: "accessible-reading",
    title: "Accessible reading",
    description:
      "For low vision, dyslexia or reading fatigue: a keyboard-first, high-contrast, screen-reader-friendly way to have text read aloud with sentence highlighting in MK VoiceKit.",
    excerpt:
      "A reading tool built for low vision, dyslexia and reading fatigue — keyboard-first and high contrast.",
    date: "2026-07-17",
    minutes: 6,
  },
  {
    slug: "podcast-script-drafting",
    title: "Drafting a podcast script",
    description:
      "Hear a script before you record it. Draft in MK VoiceKit, use the optional AI tools to shape an article into a two-host format, and listen back to catch what reads badly.",
    excerpt:
      "Hear how a script sounds before you sit down to record, and shape an article into a spoken format.",
    date: "2026-07-17",
    minutes: 6,
  },
];

export function getGuide(slug: string): ContentEntry | undefined {
  return GUIDES.find((entry) => entry.slug === slug);
}

export function getUseCase(slug: string): ContentEntry | undefined {
  return USE_CASES.find((entry) => entry.slug === slug);
}
