import { pageMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getGuide("assisted-dubbing-workflow")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/guides/assisted-dubbing-workflow",
});

export default function Page() {
  return (
    <ArticleShell
      kind="guide"
      entry={entry}
      related={[
        {
          href: "/assisted-dubbing",
          title: "Assisted Dubbing Workspace",
          excerpt: "10-step guided video dubbing workflow.",
        },
        {
          href: "/audio-translator",
          title: "Audio Translator",
          excerpt: "Translate transcripts into 50+ languages.",
        },
      ]}
    >
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
          Direct AEO Answer
        </p>
        <p className="text-sm font-medium leading-relaxed">
          The 10-step assisted dubbing pipeline converts original video audio into foreign languages by transcribing speech, translating text with glossary preservation, matching target sentence duration, and synthesizing localized voice tracks with synchronized subtitles.
        </p>
      </div>

      <p>
        Video localization has historically required expensive dubbing studios and voice talent agencies. Assisted dubbing bridges this gap by giving content creators a structured 10-step pipeline.
      </p>

      <h2>Step 1 to 5: Ingestion, Transcription, and Glossary Locking</h2>
      <p>
        Locking brand names (like "MK VoiceKit") guarantees the translation model does not inadvertently translate proprietary product titles.
      </p>

      <h2>Step 6 to 10: Duration Matching & Synthesis</h2>
      <p>
        Different languages require different syllable lengths. Matching pause timings ensures the dubbed voice matches original on-screen mouth movements.
      </p>
    </ArticleShell>
  );
}
