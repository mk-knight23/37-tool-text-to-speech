import { pageMetadata } from "@/lib/seo";
import { getUseCase } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getUseCase("accessible-reading")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/use-cases/accessible-reading",
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
          excerpt: "Operate everything without a mouse.",
        },
        {
          href: "/guides/text-prep-for-natural-speech",
          title: "Preparing text so it sounds natural",
          excerpt: "Expand numbers and abbreviations for clearer listening.",
        },
      ]}
    >
      <p>
        Reading with your eyes isn&rsquo;t equally easy for everyone. Low vision,
        dyslexia, migraines, concussion recovery, or plain reading fatigue can all
        make a wall of text hard work. Having text read aloud, with the current
        sentence clearly marked, turns reading into listening &mdash; and MK
        VoiceKit was built with that use in mind rather than as an afterthought.
      </p>

      <h2>Designed to be operated without a mouse</h2>
      <p>
        Every part of the workspace works from the keyboard: the voice picker, the
        sliders, the transcript, the queue. Space plays and pauses, the arrow keys
        move by sentence or paragraph, Escape stops, and pressing the question-mark
        key opens a dialog listing every shortcut &mdash; and each one actually
        does what it says. Focus order follows the visual order, the focus ring is
        never hidden, and there are no keyboard traps. The{" "}
        <a href="/guides/navigating-text-by-keyboard">keyboard guide</a> walks
        through it in full.
      </p>

      <h2>Highlighting that helps you keep your place</h2>
      <p>
        As text is read, the current sentence is filled with a soft colour and
        marked with a coloured left border, so the cue isn&rsquo;t colour alone.
        Where your browser reports word timing, the current word is underlined and
        highlighted too. If you glance away, the highlight tells you exactly where
        the voice is. The transcript can auto-scroll to keep the active sentence in
        view, and if you scroll manually it steps back so it doesn&rsquo;t fight
        you.
      </p>

      <h2>Built for readability</h2>
      <p>
        The interface uses Atkinson Hyperlegible, a typeface designed to make
        letters easier to tell apart for low-vision readers, and it&rsquo;s
        bundled with the app rather than fetched from a font service. Colour pairs
        were checked for contrast against accessibility standards, and you can bump
        the reading text up a size in Settings. The whole layout holds together
        when you zoom the browser to 200%, with no horizontal scrolling forced on
        you.
      </p>

      <h2>Respecting motion and contrast preferences</h2>
      <p>
        If your system is set to reduce motion, MK VoiceKit honours it: the
        animated waveform becomes a static indicator, auto-scroll jumps instead of
        gliding, and transitions collapse. If you prefer higher contrast, borders
        strengthen and the one translucent surface in the app switches to solid.
        Nothing important is ever communicated by motion or colour alone.
      </p>

      <h2>Works alongside a screen reader</h2>
      <p>
        MK VoiceKit is not a screen reader and doesn&rsquo;t try to replace one.
        It reads the content you give it, while your screen reader handles the
        interface. Speaking status is announced through a polite live region
        (&ldquo;Speaking &mdash; paragraph 2, sentence 3 of 14&rdquo;), debounced
        so it informs without chattering. When you pick a voice in a language
        other than the interface, the transcript content is marked with the right
        language so an assistive reader can handle it correctly.
      </p>

      <h2>Comfortable settings to start from</h2>
      <ul>
        <li>Slow the speed slightly &mdash; around 0.9&times; is easy to follow.</li>
        <li>
          Turn on number and abbreviation expansion so figures and shorthand are
          spoken in full. This runs locally and is labelled as not AI.
        </li>
        <li>Set the larger reading text size if you&rsquo;re following along on screen.</li>
        <li>Save your combination as a preset so it&rsquo;s one click next time.</li>
      </ul>

      <h2>A dyslexia-friendly setup</h2>
      <p>
        For dyslexia, the combination that tends to help is hearing and seeing the
        words at once. Turn the reading text up a size, keep the speed moderate,
        and let the sentence highlight track along so your eyes are guided rather
        than left to find their own way across the line. The Atkinson Hyperlegible
        typeface is chosen partly because its letters are hard to confuse with one
        another, which reduces the sort of misreads that slow you down. Following
        the highlighted line while you listen takes the pressure off decoding
        every word yourself, so more attention is left for the meaning.
      </p>

      <h2>Managing reading fatigue and eye strain</h2>
      <p>
        If reading tires you out or triggers headaches, listening lets you keep
        going after your eyes have had enough. A practical pattern is to read on
        screen while you&rsquo;re fresh and switch to listening &mdash; eyes closed
        if you like &mdash; when strain sets in, using the highlight only
        occasionally to check your place. The queue helps here too: line up what
        you need to get through, then work at it in comfortable stretches rather
        than one draining session. Dark mode and the reduced-motion behaviour both
        cut down on visual load if bright screens or movement bother you.
      </p>

      <p>
        And because the reading happens in your browser, none of the text you read
        &mdash; which might be personal &mdash; is sent anywhere. Accessibility and
        privacy don&rsquo;t have to be a trade-off.
      </p>
    </ArticleShell>
  );
}
