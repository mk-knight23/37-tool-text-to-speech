import { Suspense } from "react";
import {
  FileText,
  Keyboard,
  Languages,
  ListMusic,
  Lock,
  Highlighter,
  SlidersHorizontal,
  CircleAlert,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { Waveform } from "@/components/ui/Waveform";
import { Workspace } from "@/components/workspace/Workspace";

export const metadata = pageMetadata({
  title: `${SITE.name} — read anything aloud in your browser`,
  description:
    "MK VoiceKit turns text, Markdown, PDFs and subtitle files into speech using your browser's own voices — with live highlighting, chapters, presets and full keyboard control. Free and open source.",
  path: "/",
});

const FEATURES = [
  {
    icon: FileText,
    title: "Bring your own text",
    body: "Paste plain text or Markdown, extract text from a PDF, or import .srt/.vtt subtitles — timestamps are stripped automatically. Files are read in your browser and never uploaded.",
  },
  {
    icon: SlidersHorizontal,
    title: "Voices and controls",
    body: "Every voice your browser offers, grouped by language and searchable. Adjust speed, pitch and volume with live readouts, and save combinations as named presets.",
  },
  {
    icon: Highlighter,
    title: "Follow along",
    body: "The current sentence is highlighted as it's read, with word-level highlighting where your browser reports it. Click any sentence to start from there.",
  },
  {
    icon: Keyboard,
    title: "Keyboard first",
    body: "Space to play or pause, arrows to move by sentence or paragraph, Escape to stop. Press ? to see every shortcut — and each one actually works.",
  },
  {
    icon: ListMusic,
    title: "Queue and history",
    body: "Line up several sections to listen back to back, and revisit anything you've played from a local history you can search, replay or clear.",
  },
  {
    icon: Languages,
    title: "Readability helpers",
    body: "Optional local processing expands numbers and abbreviations and normalizes pauses so speech sounds more natural. It runs on your device — not through any AI service.",
  },
];

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE.name,
    description: SITE.tagline,
    url: SITE.url,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (modern web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: {
      "@type": "Person",
      name: SITE.creator.name,
      url: SITE.creator.portfolio,
    },
    isAccessibleForFree: true,
  };
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />

      <section className="vk-hero-fade">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-20">
          <div className="mb-6 flex justify-center">
            <Waveform bars={7} className="h-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Read anything aloud, right in your browser.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-text-muted">
            {SITE.name} turns text, PDFs and subtitle files into speech using the
            voices already on your device. Works entirely offline, in your browser.
          </p>
        </div>
      </section>

      {/* Embedded Workspace */}
      <div id="reader" className="mx-auto max-w-5xl mb-16">
        <Suspense fallback={<div className="h-96 rounded-xl border border-border bg-surface-sunken animate-pulse" />}>
          <Workspace />
        </Suspense>
      </div>

      <section
        aria-labelledby="features-heading"
        className="mx-auto max-w-6xl px-4 py-12 border-t border-border"
      >
        <h2 id="features-heading" className="sr-only">
          What it does
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-1)] hover:shadow-md transition-all"
            >
              <feature.icon
                className="mb-3 size-6 text-primary"
                aria-hidden="true"
              />
              <h3 className="mb-1 text-base sm:text-lg font-bold">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 border-t border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <Lock className="mb-3 size-6 text-primary" aria-hidden="true" />
            <h2 className="mb-2 text-lg sm:text-xl font-bold">Your text stays with you</h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Speech is generated by your browser, so the text you paste or
              import is not sent to a server. Your history, presets and queue
              are stored locally on this device, and you can export or delete
              them any time from Settings.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <CircleAlert className="mb-3 size-6 text-accent" aria-hidden="true" />
            <h2 className="mb-2 text-lg sm:text-xl font-bold">What it can’t do (yet)</h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              The browser speech engine plays audio but gives no file to save,
              so there is no MP3 or audio download — we won’t pretend otherwise.
              Scanned PDFs with no text layer can’t be read (no OCR), and the
              available voices differ from one browser and operating system to
              the next.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
