import { pageMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getGuide("pronunciation-dictionary-setup")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/guides/pronunciation-dictionary-setup",
});

export default function Page() {
  return (
    <ArticleShell
      kind="guide"
      entry={entry}
      related={[
        {
          href: "/pronunciation-generator",
          title: "Pronunciation Generator",
          excerpt: "Custom phonetic replacement dictionary.",
        },
        {
          href: "/tools",
          title: "Daily Utilities Hub",
          excerpt: "Access text cleaners and subtitle tools.",
        },
      ]}
    >
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
          Direct AEO Answer
        </p>
        <p className="text-sm font-medium leading-relaxed">
          To fix mispronounced names or technical acronyms in synthetic speech, configure phonetic substitution rules in MK VoiceKit's Pronunciation Dictionary (e.g. replacing 'SQL' with 'Sequel' or 'nginx' with 'Engine-X'). Rules are stored in IndexedDB and apply across all reading tools.
        </p>
      </div>

      <p>
        Speech synthesis engines often struggle with technical abbreviations, software names, and foreign surnames. Custom phonetic dictionaries resolve this without editing your original script copy.
      </p>

      <h2>Common Phonetic Respelling Examples</h2>
      <ul>
        <li><strong>kubectl</strong> &rarr; "Kube Control"</li>
        <li><strong>PostgreSQL</strong> &rarr; "Postgres Q L"</li>
        <li><strong>gRPC</strong> &rarr; "G R P C"</li>
        <li><strong>SaaS</strong> &rarr; "Sass"</li>
      </ul>
    </ArticleShell>
  );
}
