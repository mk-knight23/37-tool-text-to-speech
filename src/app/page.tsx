import { Suspense } from "react";
import Link from "next/link";
import {
  FileText,
  Keyboard,
  Languages,
  ListMusic,
  Lock,
  Highlighter,
  SlidersHorizontal,
  CircleAlert,
  Sparkles,
  Upload,
  Mic,
  Headphones,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { Waveform } from "@/components/ui/Waveform";
import { Workspace } from "@/components/workspace/Workspace";

export const metadata = pageMetadata({
  title: "MK VoiceKit — Free AI Voice, Document Reader and Speech Workspace",
  description:
    "Turn text, documents, audio and ideas into natural speech, transcripts and polished voice content. Free browser-based text-to-speech with privacy-first local processing.",
  path: "/",
});

const CORE_AREAS = [
  {
    href: "/#workspace",
    title: "1. Text to Speech",
    desc: "Free browser-based TTS with live sentence & word highlighting, keyboard controls, and customizable pitch/speed.",
    icon: Headphones,
  },
  {
    href: "/reader",
    title: "2. Document Reader",
    desc: "Upload PDFs, Word DOCX, EPUB, or Markdown with Table of Contents navigation, bookmarks, and AI document Q&A.",
    icon: FileText,
  },
  {
    href: "/studio",
    title: "3. AI Voice Studio",
    desc: "Multi-speaker timeline editor with 10 starter templates, background music ducking, and audio/subtitle exports.",
    icon: Sparkles,
  },
  {
    href: "/transcribe",
    title: "4. Speech to Text",
    desc: "Microphone recording, audio/video upload, Whisper AI transcription, filler-word removal, and meeting notes.",
    icon: Mic,
  },
  {
    href: "/tools",
    title: "5. Daily Audio & Script Utilities",
    desc: "Free text cleaners, speaking & reading time calculators, words-to-minutes timers, and SRT/VTT converters.",
    icon: SlidersHorizontal,
  },
  {
    href: "/library",
    title: "6. Saved Local Library",
    desc: "Local-first IndexedDB storage for drafts, documents, voice presets, and transcripts with zero cloud lock-in.",
    icon: ListMusic,
  },
];

const FEATURES = [
  {
    icon: FileText,
    title: "Bring Any Text or Document",
    body: "Paste plain text or Markdown, drop a PDF or DOCX, or import .srt/.vtt subtitles. All documents are processed locally in your browser and never uploaded to third parties.",
  },
  {
    icon: SlidersHorizontal,
    title: "On-Device & AI Voices",
    body: "Use all voices available on your operating system for free, or connect optional premium providers (OpenAI, ElevenLabs, Google Cloud, Azure, Amazon Polly).",
  },
  {
    icon: Highlighter,
    title: "Follow-Along Sentence Tracking",
    body: "Active sentences highlight as speech plays, with word-level boundary highlighting where your browser supports it. Click any sentence to jump directly to it.",
  },
  {
    icon: Keyboard,
    title: "Complete Keyboard Control",
    body: "Space to play/pause, arrows to skip by sentence or paragraph, Escape to stop. Press ? anywhere to view the complete keyboard shortcut cheatsheet.",
  },
  {
    icon: ListMusic,
    title: "Local Queue & Storage",
    body: "Queue several chapters or articles to listen back to back. Your listening history, presets, and documents are saved safely on your device via IndexedDB.",
  },
  {
    icon: Languages,
    title: "Assisted Dubbing & Translation",
    body: "Translate transcripts and generate multilingual speech tracks side-by-side with duration matching and subtitle synchronization.",
  },
];

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "MK VoiceKit",
    alternateName: "MK VoiceKit — AI Voice, Document Reader and Speech Workspace",
    description:
      "Turn text, documents, audio and ideas into natural speech, transcripts and polished voice content. Free browser-based text-to-speech with privacy-first local processing.",
    url: SITE.url,
    applicationCategory: "MultimediaApplication",
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

      {/* Above-the-fold Hero & Immediate Tool Access */}
      <section className="vk-hero-fade border-b border-border/60 pb-6 pt-8 sm:pt-12">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Waveform bars={5} className="h-8 text-primary" />
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              100% Free Browser TTS · Privacy First
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-balance">
            Turn Any Text or Document Into Speech
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base sm:text-lg text-text-muted leading-relaxed">
            Listen, rewrite, translate, transcribe and create voice content with free browser voices or optional premium AI voices.
          </p>

          {/* Primary Quick CTAs */}
          <div className="mt-6 mb-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#workspace"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-sm hover:opacity-90 transition-all cursor-pointer"
            >
              <Headphones className="size-4" />
              <span>Listen Now</span>
            </a>
            <Link
              href="/reader"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text hover:bg-surface-sunken shadow-sm transition-all"
            >
              <Upload className="size-4 text-primary" />
              <span>Upload Document</span>
            </Link>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text hover:bg-surface-sunken shadow-sm transition-all"
            >
              <Sparkles className="size-4 text-accent" />
              <span>Open Voice Studio</span>
            </Link>
          </div>
        </div>

        {/* Functional Workspace directly above the fold */}
        <div id="workspace" className="mx-auto max-w-5xl px-2 sm:px-4">
          <Suspense
            fallback={
              <div className="h-96 rounded-xl border border-border bg-surface-sunken animate-pulse flex items-center justify-center">
                <p className="text-sm text-text-muted">Loading MK VoiceKit workspace…</p>
              </div>
            }
          >
            <Workspace />
          </Suspense>
        </div>
      </section>

      {/* 6 Core Product Areas Navigation */}
      <section aria-labelledby="core-areas-heading" className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 text-center">
          <h2 id="core-areas-heading" className="text-2xl font-bold sm:text-3xl">
            Complete Voice & Reading Workspace
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Explore dedicated workspaces built for students, creators, educators, and professionals.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_AREAS.map((area) => (
            <Link
              key={area.title}
              href={area.href}
              className="group rounded-xl border border-border bg-surface p-5 shadow-sm hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <area.icon className="size-5" />
                </div>
                <h3 className="mb-1 text-base font-bold text-text group-hover:text-primary transition-colors">
                  {area.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  {area.desc}
                </p>
              </div>
              <span className="mt-4 text-xs font-semibold text-primary flex items-center gap-1">
                Open workspace →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section
        aria-labelledby="features-heading"
        className="mx-auto max-w-6xl px-4 py-12 border-t border-border"
      >
        <div className="mb-8 text-center">
          <h2 id="features-heading" className="text-2xl font-bold sm:text-3xl">
            Why Use MK VoiceKit
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Engineered for high performance, zero telemetry, and maximum accessibility.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <feature.icon
                className="mb-3 size-6 text-primary"
                aria-hidden="true"
              />
              <h3 className="mb-1 text-base font-bold">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy and Honest Limitations */}
      <section className="mx-auto max-w-6xl px-4 py-8 border-t border-border mb-12">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="size-6 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-bold">100% Privacy-First & Local Storage</h2>
            </div>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Basic text-to-speech runs directly on your device using browser APIs. The text you paste or documents you import are never uploaded or logged on any server. Your listening history, presets, and documents are stored locally in your browser’s IndexedDB.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CircleAlert className="size-6 text-accent" aria-hidden="true" />
              <h2 className="text-lg font-bold">Honest Browser Limitations</h2>
            </div>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Browser speech synthesis (<code className="text-xs">speechSynthesis</code>) plays audio through your speakers but does not return an exportable audio file. Downloadable MP3/WAV files are generated via optional server AI providers. Voices vary depending on your OS and browser.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
