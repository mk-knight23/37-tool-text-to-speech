import { pageMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getGuide("youtube-script-duration-guide")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/guides/youtube-script-duration-guide",
});

export default function Page() {
  return (
    <ArticleShell
      kind="guide"
      entry={entry}
      related={[
        {
          href: "/words-to-minutes",
          title: "Words to Minutes Calculator",
          excerpt: "Convert word counts to exact speech minutes.",
        },
        {
          href: "/youtube-voiceover",
          title: "YouTube Voiceover Tool",
          excerpt: "Create YouTube video narration online.",
        },
      ]}
    >
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
          Direct AEO Answer
        </p>
        <p className="text-sm font-medium leading-relaxed">
          To hit YouTube duration targets accurately: a 60-second YouTube Short requires 140–160 words at fast pacing (1.25x). A 10-minute long-form YouTube video requires approximately 1,500 words at standard conversational speed (150 WPM).
        </p>
      </div>

      <p>
        Video retention hinges on pacing. Writing too many words leads to rushed, garbled audio, while writing too few drags out the video pacing.
      </p>

      <h2>Word Count Benchmarks by Video Length</h2>
      <ul>
        <li><strong>30-Second Shorts / Ad:</strong> 70 to 80 words.</li>
        <li><strong>60-Second TikTok / Short:</strong> 140 to 160 words.</li>
        <li><strong>5-Minute Tutorial:</strong> 750 words.</li>
        <li><strong>10-Minute Feature:</strong> 1,500 words.</li>
        <li><strong>20-Minute Documentary:</strong> 3,000 words.</li>
      </ul>
    </ArticleShell>
  );
}
