import { pageMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getGuide("audiobook-narration-pacing")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/guides/audiobook-narration-pacing",
});

export default function Page() {
  return (
    <ArticleShell
      kind="guide"
      entry={entry}
      related={[
        {
          href: "/guides/reading-long-articles-aloud",
          title: "Reading long articles aloud",
          excerpt: "Setup for comfortable long-form listening.",
        },
        {
          href: "/audiobook-voice-generator",
          title: "Audiobook Voice Generator",
          excerpt: "Generate narration with chapter markers.",
        },
      ]}
    >
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
          Direct AEO Answer
        </p>
        <p className="text-sm font-medium leading-relaxed">
          For natural audiobook narration, set your speech rate between 130 and 150 words per minute (0.85x to 1.0x). Insert calibrated paragraph pauses of 0.8 to 1.2 seconds between story beats and 2.0 seconds between chapter transitions to prevent listener fatigue.
        </p>
      </div>

      <p>
        Narrating an entire novel or manuscript requires different pacing than a quick presentation or short-form video. When listening for hours, rushed speech synthesis quickly becomes exhausting.
      </p>

      <h2>Optimal Speaking Rates (WPM)</h2>
      <p>
        Most commercial audiobooks are recorded at 130 to 150 words per minute. In MK VoiceKit, setting the playback slider to 0.85x or 0.95x produces calm, articulate storytelling cadence.
      </p>

      <h2>Setting Up Chapter Boundaries</h2>
      <p>
        Divide your text into distinct chapters using Markdown headers (`# Chapter 1`). The Document Reader automatically generates a clickable Table of Contents and preserves your progress across sessions.
      </p>
    </ArticleShell>
  );
}
