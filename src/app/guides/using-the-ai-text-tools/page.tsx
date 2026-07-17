import { pageMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getGuide("using-the-ai-text-tools")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/guides/using-the-ai-text-tools",
});

export default function Page() {
  return (
    <ArticleShell
      kind="guide"
      entry={entry}
      related={[
        {
          href: "/guides/text-prep-for-natural-speech",
          title: "Preparing text so it sounds natural",
          excerpt: "The local, non-AI alternative for mechanical clean-up.",
        },
        {
          href: "/privacy",
          title: "Privacy",
          excerpt: "Exactly what an AI request does and doesn't send.",
        },
      ]}
    >
      <p>
        Most of MK VoiceKit runs on your device and never sends your text
        anywhere. The AI text tools are the deliberate exception: they can rewrite
        or restructure your text before you listen, and to do that they send the
        text you select to an AI model. They&rsquo;re optional, clearly separated
        from the reading features, and this guide explains what they do, what
        happens to your text, and when they&rsquo;re worth using.
      </p>

      <h2>What the tools can do</h2>
      <p>The line-up covers the common &ldquo;reshape this text&rdquo; jobs:</p>
      <ul>
        <li><strong>Rewrite for natural speech</strong> &mdash; reword text so it flows when spoken aloud rather than read.</li>
        <li><strong>Simplify</strong> &mdash; make wording plainer while keeping the meaning.</li>
        <li><strong>Change reading level</strong> &mdash; rewrite to an easier or more advanced level.</li>
        <li><strong>Translate</strong> &mdash; render the text in another language before you listen.</li>
        <li><strong>Summarise</strong> &mdash; produce a short, spoken-style summary.</li>
        <li><strong>Generate chapters</strong> &mdash; propose chapter titles and breaks for a long text.</li>
        <li><strong>Article to podcast script</strong> and <strong>notes to narration</strong> &mdash; turn prose or bullets into spoken formats.</li>
        <li><strong>Multi-speaker formatting</strong> &mdash; lay dialogue out by speaker.</li>
        <li><strong>Pronunciation suggestions</strong> &mdash; propose respellings for tricky words.</li>
      </ul>
      <p>
        When a result comes back, you can send it straight into the workspace to
        listen, or copy it out. The tools never overwrite your original text
        without you choosing to use the result.
      </p>

      <h2>What happens to your text</h2>
      <p>
        This is the important part. When you press Run &mdash; and only then
        &mdash; the text you selected is sent through a serverless route to an AI
        model, which processes it and returns a result. The request isn&rsquo;t
        logged with its contents, and your text isn&rsquo;t stored on any server;
        it&rsquo;s used to generate the response and then discarded. If you never
        press Run, nothing is sent. The full detail is on the{" "}
        <a href="/privacy">privacy page</a>.
      </p>

      <h2>The free limit, and using your own key</h2>
      <p>
        The tools work out of the box up to a small daily limit, tracked so the
        shared free tier stays available to everyone. A usage indicator shows how
        many actions you have left, and when you hit the limit MK VoiceKit tells
        you plainly rather than failing silently. To go further, you can add your
        own Vercel AI Gateway key in <a href="/settings">Settings</a>: it&rsquo;s
        stored on your device, sent only with requests you start yourself, and
        never logged or saved on a server. With your own key, the daily limit
        doesn&rsquo;t apply.
      </p>

      <h2>When AI is unavailable</h2>
      <p>
        If no AI service is configured and you haven&rsquo;t added a key, the tools
        show an honest &ldquo;AI unavailable&rdquo; state. They do not invent a
        result or fall back to something that pretends to be AI. Where a genuine
        non-AI alternative exists &mdash; heading-based chapter detection, or the
        number and abbreviation expansion that stands in for pronunciation help
        &mdash; the panel points you to it and labels it clearly as local, non-AI
        processing.
      </p>

      <h2>When to use them &mdash; and when not to</h2>
      <ul>
        <li>
          <strong>Reach for AI</strong> when you genuinely need to reword: a dense
          paragraph you want simplified, a text you want in another language, or
          notes you want turned into flowing narration.
        </li>
        <li>
          <strong>Use local text prep instead</strong> for mechanical fixes like
          expanding &ldquo;etc.&rdquo; or reading numbers properly &mdash; that
          runs on your device and doesn&rsquo;t need a model. See{" "}
          <a href="/guides/text-prep-for-natural-speech">preparing text so it sounds natural</a>.
        </li>
        <li>
          <strong>Skip AI entirely</strong> if you&rsquo;d rather nothing leave
          your device. Every reading feature works without it.
        </li>
      </ul>

      <h2>A worked example</h2>
      <p>
        Suppose you&rsquo;ve got a dense, jargon-heavy paragraph you want to
        listen to on a walk. You paste it in, open the AI panel, and run
        &ldquo;simplify&rdquo; to get plainer wording, or &ldquo;change reading
        level&rdquo; set to something easier. The result appears in the panel;
        you read it over, and if it&rsquo;s good you send it straight to the
        workspace and press play. If you&rsquo;d rather keep the original phrasing
        but just hear it more clearly, you skip the AI entirely and reach for the
        local text-prep toggles instead. The two approaches solve different
        problems &mdash; rewriting versus mechanical clean-up &mdash; and
        it&rsquo;s worth being clear which one you actually need before you send
        anything to a model.
      </p>

      <h2>Limits and cost, plainly</h2>
      <p>
        The free daily allowance exists so the shared tier stays available and
        isn&rsquo;t run up by heavy automated use. It resets each day, and the
        usage indicator shows what&rsquo;s left. If you regularly need more, your
        own key removes the limit and bills to your own gateway account rather
        than the shared one &mdash; a fair trade, and the honest way to scale up.
        None of the reading, importing, or local text-prep features count against
        the limit or need a key at all; only the AI tools do, because only they
        call a model.
      </p>

      <h2>Check the output</h2>
      <p>
        AI can be wrong, and it can be confidently wrong. Treat a rewrite,
        translation or summary as a draft to check, not a finished fact &mdash;
        especially for anything important. Read (or listen to) the result before
        you rely on it. The tools are there to save you effort, not to be trusted
        blindly.
      </p>
    </ArticleShell>
  );
}
