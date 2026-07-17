import { pageMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getGuide("text-prep-for-natural-speech")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/guides/text-prep-for-natural-speech",
});

export default function Page() {
  return (
    <ArticleShell
      kind="guide"
      entry={entry}
      related={[
        {
          href: "/guides/using-the-ai-text-tools",
          title: "Using the optional AI text tools",
          excerpt: "When to reach for AI rewriting instead of local prep.",
        },
        {
          href: "/guides/pdf-to-speech",
          title: "Listening to a PDF",
          excerpt: "Extracted PDF text often needs a prep pass.",
        },
      ]}
    >
      <p>
        Speech engines read what&rsquo;s written literally, and written text is
        full of shorthand that only works for the eye. &ldquo;Dr.&rdquo;,
        &ldquo;e.g.&rdquo;, &ldquo;1994&rdquo;, &ldquo;$3.50&rdquo;, a dash where
        you&rsquo;d pause &mdash; a human reader fills these in without thinking,
        but a synthetic voice can stumble. MK VoiceKit&rsquo;s text-prep panel
        smooths them out, and importantly, it does so on your device with plain
        rules, not AI.
      </p>

      <h2>What &ldquo;local processing, not AI&rdquo; means here</h2>
      <p>
        Every transform in the text-prep panel is a pure, predictable function
        that runs in your browser. It doesn&rsquo;t call a model, doesn&rsquo;t
        send your text anywhere, and produces the same output every time for the
        same input. That&rsquo;s deliberate: for something as routine as expanding
        &ldquo;etc.&rdquo;, you want a rule you can trust and preview, not a
        network round-trip. The panel is labelled to make the distinction clear,
        so you always know whether text is leaving your device (with the AI tools)
        or staying put (with these).
      </p>

      <h2>Number expansion</h2>
      <p>
        This turns figures into words the way you&rsquo;d say them: cardinals
        (&ldquo;42&rdquo; becomes &ldquo;forty-two&rdquo;), ordinals
        (&ldquo;3rd&rdquo; becomes &ldquo;third&rdquo;), and common cases like
        currency, percentages and years. It&rsquo;s the difference between a voice
        reading &ldquo;approx. 3.5kg&rdquo; as a jumble of characters and it
        saying &ldquo;approximately three point five kilograms&rdquo;. This is
        English-focused in the current version.
      </p>

      <h2>Abbreviation expansion</h2>
      <p>
        A curated dictionary expands the abbreviations that trip up speech &mdash;
        &ldquo;Dr.&rdquo; to &ldquo;Doctor&rdquo;, &ldquo;St.&rdquo; to
        &ldquo;Street&rdquo; or &ldquo;Saint&rdquo; as context suggests,
        &ldquo;e.g.&rdquo; to &ldquo;for example&rdquo;, &ldquo;approx.&rdquo; to
        &ldquo;approximately&rdquo;, and so on. It&rsquo;s a toggle, so if
        you&rsquo;re proofreading and want to hear exactly what&rsquo;s written,
        you can leave it off.
      </p>

      <h2>Pause insertion</h2>
      <p>
        Dense punctuation confuses pacing. This transform normalises things like
        em-dash chains, ellipses and semicolons into the commas and full stops
        that speech engines handle predictably, so the voice pauses where a reader
        would. It&rsquo;s tunable and can be switched off entirely if you prefer
        the original phrasing.
      </p>

      <h2>Preview before you commit</h2>
      <p>
        Each transform has a before-and-after preview, so you can see exactly what
        it will change before applying it. This matters because no rule is perfect
        &mdash; an abbreviation might have a meaning the dictionary didn&rsquo;t
        expect, or a number might be a product code you&rsquo;d rather leave
        alone. The preview lets you catch that instead of being surprised
        mid-listen. Because the transforms are pure and unit-tested, what you see
        in the preview is exactly what you&rsquo;ll hear.
      </p>

      <h2>When to use it, and when not to</h2>
      <ul>
        <li>
          <strong>Use it</strong> for material heavy with numbers and shorthand:
          extracted PDFs, technical notes, financial or scientific text.
        </li>
        <li>
          <strong>Turn it off</strong> when proofreading, since you want to hear
          the text warts and all &mdash; see{" "}
          <a href="/use-cases/proofreading-by-ear">proofreading by ear</a>.
        </li>
        <li>
          <strong>Leave it off</strong> for clean prose that already reads well;
          there&rsquo;s no need to process what isn&rsquo;t causing trouble.
        </li>
      </ul>

      <h2>A worked example</h2>
      <p>
        Take a sentence like: &ldquo;Dr. Alba met approx. 1,200 patients from
        1998&ndash;2004, e.g. 3rd-year cases.&rdquo; Read literally, a voice makes
        a mess of nearly every token &mdash; &ldquo;Dr dot&rdquo;, the raw comma
        in the number, the year range as a dash, &ldquo;e g&rdquo;. With
        abbreviation expansion it becomes &ldquo;Doctor Alba met
        approximately&hellip;&rdquo;; with number expansion, &ldquo;one thousand
        two hundred patients from nineteen ninety-eight to two thousand
        four&hellip; for example, third-year cases.&rdquo; That&rsquo;s the whole
        point of the panel: the same words, made speakable, with nothing invented.
        The before/after preview shows you exactly this transformation before you
        commit to it.
      </p>

      <h2>Combining the toggles</h2>
      <p>
        The three transforms are independent, so you can mix them to taste. A
        common combination is numbers plus abbreviations on, pause-smoothing off,
        which fixes the mechanical stumbles while leaving your phrasing intact.
        For text that leans heavily on dashes and ellipses for effect, adding the
        pause-smoothing evens out the rhythm. Because each is a toggle with its
        own preview, there&rsquo;s no guesswork &mdash; turn one on, glance at the
        preview, and keep it if it helps. And since it all runs locally, trying
        combinations costs nothing and sends nothing anywhere.
      </p>

      <h2>Where AI comes in instead</h2>
      <p>
        Text prep fixes mechanical issues; it doesn&rsquo;t rewrite. If you want
        to actually reword something &mdash; simplify a dense paragraph, change
        the reading level, or rephrase text so it flows better when spoken &mdash;
        that&rsquo;s a job for the optional AI tools, which do send your text to a
        model. The two are complementary: prep for predictable clean-up on your
        device, AI for genuine rewriting when you choose to. More on that in{" "}
        <a href="/guides/using-the-ai-text-tools">using the optional AI text tools</a>.
      </p>
    </ArticleShell>
  );
}
