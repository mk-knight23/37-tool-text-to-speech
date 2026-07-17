import { pageMetadata } from "@/lib/seo";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata = pageMetadata({
  title: "Changelog",
  description:
    "What has changed in MK VoiceKit. An honest log of the current v2 rebuild — the workspace, the optional AI tools, and the content and SEO work.",
  path: "/changelog",
});

interface Release {
  version: string;
  date: string;
  status: string;
  changes: string[];
}

const RELEASES: Release[] = [
  {
    version: "v2 rebuild",
    date: "2026-07-17",
    status: "In development",
    changes: [
      "Rebuilt from the ground up on Next.js (App Router) with TypeScript and Tailwind CSS v4, replacing the earlier prototype.",
      "New workspace: voice picker grouped by language, speed/pitch/volume controls with live readouts, and a transcript that highlights the current sentence.",
      "Full keyboard control — play/pause, move by sentence or paragraph, stop, and a shortcuts dialog where every listed shortcut actually works.",
      "Import from plain text, Markdown, PDF (client-side text extraction) and subtitle files (.srt/.vtt), with timestamps stripped automatically.",
      "Local-first storage for history, presets and the listening queue, with export, import and clear-all in Settings.",
      "Deterministic text-prep (number and abbreviation expansion, punctuation smoothing) that runs in the browser and is clearly labelled as non-AI.",
      "Optional AI text tools (rewrite, simplify, summarise, translate and more) through the Vercel AI Gateway, with an honest 'AI unavailable' state and a bring-your-own-key option.",
      "Content and documentation: docs, guides, use cases, FAQ, and the standard project and legal pages.",
      "SEO groundwork: per-page metadata and canonicals, sitemap, robots, structured data, and static llms.txt / humans.txt / security.txt files.",
      "Privacy-respecting analytics that are off by default and load only after you explicitly consent.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <StaticPage
      title="Changelog"
      lede="An honest record of what has changed. MK VoiceKit is pre-1.0, so expect the workspace to keep evolving."
      path="/changelog"
    >
      <div className="flex flex-col gap-8">
        {RELEASES.map((release) => (
          <section
            key={release.version}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-xl font-bold">{release.version}</h2>
              <span className="text-sm text-text-muted">
                {new Date(`${release.date}T00:00:00Z`).toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
                )}
              </span>
            </div>
            <p className="mt-1">
              <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-text">
                {release.status}
              </span>
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {release.changes.map((change) => (
                <li key={change} className="flex gap-2 text-text">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary"
                  />
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </StaticPage>
  );
}
