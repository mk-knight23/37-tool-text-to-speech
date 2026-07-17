import { pageMetadata } from "@/lib/seo";
import { getUseCase } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getUseCase("proofreading-by-ear")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/use-cases/proofreading-by-ear",
});

export default function Page() {
  return (
    <ArticleShell
      kind="use-case"
      entry={entry}
      related={[
        {
          href: "/guides/navigating-text-by-keyboard",
          title: "Navigating text by keyboard",
          excerpt: "Move sentence by sentence to fix errors as you hear them.",
        },
        {
          href: "/guides/choosing-a-voice",
          title: "Choosing a voice",
          excerpt: "Save a clear, neutral voice as your proofing preset.",
        },
      ]}
    >
      <p>
        You&rsquo;ve read the same paragraph six times and it looks fine. Then
        someone else glances at it and spots the word you typed twice, or the
        &ldquo;form&rdquo; that should have been &ldquo;from&rdquo;. This happens
        because once you know what a sentence is supposed to say, your eyes stop
        reading it and start recognising it. Your ear doesn&rsquo;t do that.
        Hearing your writing read back, at a steady pace you can&rsquo;t skim,
        surfaces the mistakes you&rsquo;ve been reading straight past.
      </p>

      <h2>Why listening catches what reading misses</h2>
      <p>
        A synthetic voice reads exactly what&rsquo;s on the page, not what you
        meant to write. It doesn&rsquo;t silently correct a missing word or
        smooth over a doubled &ldquo;the&rdquo;. When a sentence runs too long,
        you&rsquo;ll hear yourself run out of breath. When a clause is tangled,
        it&rsquo;ll sound tangled. Clumsy rhythm, accidental repetition, and
        homophone slips &mdash; &ldquo;their&rdquo; for &ldquo;there&rdquo;,
        &ldquo;its&rdquo; for &ldquo;it&rsquo;s&rdquo; &mdash; all jump out when
        the words become sound.
      </p>

      <h2>A workflow that works</h2>
      <p>Here&rsquo;s a routine that makes ear-proofreading efficient:</p>
      <ol>
        <li>
          Paste your draft into the <a href="/tool">workspace</a>. If it&rsquo;s
          Markdown, the formatting is stripped so you hear the words, not the
          syntax.
        </li>
        <li>
          Pick a clear, neutral voice and set the speed a little slower than
          conversational &mdash; around 0.9&times; is a good starting point. Fast
          enough not to drag, slow enough to notice a wrong word.
        </li>
        <li>
          Turn <em>off</em> the text-prep helpers for this task. When you&rsquo;re
          proofreading you want to hear exactly what&rsquo;s written, including
          the awkward &ldquo;approx.&rdquo; you meant to spell out, not a tidied
          version.
        </li>
        <li>
          Press play and follow the highlighted sentence. When you hear
          something wrong, stop, fix it in the editor, then use the arrow keys to
          step back a sentence and replay just that line.
        </li>
      </ol>

      <h2>Save a proofing preset</h2>
      <p>
        Once you&rsquo;ve found a voice and speed that work for this, save them as
        a preset called something like &ldquo;Proofing&rdquo;. Next time you sit
        down to check a draft, one click puts you back in the same setup instead
        of fiddling with sliders. Presets are stored on your device, so
        they&rsquo;re there whenever you come back.
      </p>

      <h2>Read from anywhere in the text</h2>
      <p>
        You rarely proofread front to back. Click any sentence to start reading
        from there, which is perfect for re-checking the one paragraph you just
        rewrote. The left and right arrow keys move you sentence by sentence
        without reaching for the mouse, so you can keep one hand on the keyboard
        to edit and the other free.
      </p>

      <h2>Proofread longer pieces in passes</h2>
      <p>
        For anything longer than a page, split the work. Do one pass listening for
        sense &mdash; does each sentence say what you want? &mdash; and a second
        pass at a slightly higher speed listening only for rhythm and repeated
        words. Trying to catch everything at once is how things slip through. If
        the piece is broken into sections, add them to the{" "}
        <a href="/guides/building-a-listening-queue">listening queue</a> so they
        play through in order while you follow along.
      </p>

      <h2>What it won&rsquo;t do</h2>
      <p>
        Listening is brilliant for catching wrong words, doubled words, run-on
        sentences and clumsy phrasing. It is weaker for things that are invisible
        to the ear: a comma that should be a semicolon, inconsistent
        capitalisation, or a misspelling that happens to sound identical to the
        right word. Use ear-proofreading as one layer, not the only one &mdash;
        it pairs well with a normal visual read and a spell checker rather than
        replacing them.
      </p>

      <h2>What to listen for, specifically</h2>
      <p>
        It helps to know what your ear is good at catching, so you can listen for
        it deliberately:
      </p>
      <ul>
        <li>
          <strong>Doubled words</strong> &mdash; &ldquo;the the&rdquo;,
          &ldquo;and and&rdquo; &mdash; which the eye merges but the ear hears
          twice.
        </li>
        <li>
          <strong>Wrong small words</strong> &mdash; &ldquo;from&rdquo; for
          &ldquo;form&rdquo;, &ldquo;of&rdquo; for &ldquo;or&rdquo;. They look
          close enough to skim past but sound clearly wrong.
        </li>
        <li>
          <strong>Homophones</strong> &mdash; their/there, its/it&rsquo;s,
          your/you&rsquo;re. The voice reads what&rsquo;s written, so a wrong one
          often lands oddly in context.
        </li>
        <li>
          <strong>Sentences with no breathing room</strong> &mdash; if the voice
          barrels on without a natural pause, the sentence is probably too long or
          missing punctuation.
        </li>
      </ul>

      <h2>Fitting it into your editing process</h2>
      <p>
        Ear-proofreading works best as a distinct stage, not something you do
        while still writing. Finish your draft, do a normal visual edit, then run
        a listening pass to catch what the first two missed. Because you can click
        any sentence to start from it and step through with the arrows, you can
        fix as you go without losing your place. Keep it as the last check before
        you send or publish &mdash; it&rsquo;s the pass that catches the
        embarrassing small mistakes that survive everything else.
      </p>

      <p>
        None of this sends your draft anywhere. The reading happens in your
        browser, so you can proofread confidential writing without it leaving
        your device.
      </p>
    </ArticleShell>
  );
}
