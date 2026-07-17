import { pageMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getGuide("navigating-text-by-keyboard")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/guides/navigating-text-by-keyboard",
});

export default function Page() {
  return (
    <ArticleShell
      kind="guide"
      entry={entry}
      related={[
        {
          href: "/use-cases/accessible-reading",
          title: "Accessible reading",
          excerpt: "Keyboard-first reading for low vision and reading fatigue.",
        },
        {
          href: "/use-cases/proofreading-by-ear",
          title: "Proofreading by ear",
          excerpt: "Step sentence by sentence to fix errors as you hear them.",
        },
      ]}
    >
      <p>
        You can run MK VoiceKit without touching the mouse. Once the shortcuts are
        in your fingers, jumping around a document by ear is faster than clicking,
        and it&rsquo;s essential if using a mouse is difficult for you. This is
        the full map.
      </p>

      <h2>The core keys</h2>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>What it does</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>Space</code></td><td>Play, or pause if already playing</td></tr>
          <tr><td><code>Esc</code></td><td>Stop and reset to the start of the current item</td></tr>
          <tr><td><code>&larr;</code></td><td>Previous sentence</td></tr>
          <tr><td><code>&rarr;</code></td><td>Next sentence</td></tr>
          <tr><td><code>Shift</code> + <code>&larr;</code></td><td>Previous paragraph</td></tr>
          <tr><td><code>Shift</code> + <code>&rarr;</code></td><td>Next paragraph</td></tr>
          <tr><td><code>&uarr;</code></td><td>Speed up</td></tr>
          <tr><td><code>&darr;</code></td><td>Slow down</td></tr>
          <tr><td><code>?</code></td><td>Open the shortcuts dialog</td></tr>
        </tbody>
      </table>

      <h2>Space doesn&rsquo;t fight your typing</h2>
      <p>
        A common annoyance in reading tools is that pressing Space to play also
        inserts a space when you&rsquo;re editing text, or scrolls the page.
        MK VoiceKit only treats Space as play/pause when you&rsquo;re not focused
        on a text field or control. So you can paste and edit your text, then
        press Space to start reading, without the two getting in each other&rsquo;s
        way.
      </p>

      <h2>Move by sentence to find your place</h2>
      <p>
        The left and right arrows are the keys you&rsquo;ll use most. Each press
        moves the reading point one sentence back or forward and starts speaking
        from there, so if you drift off you can tap left a couple of times to
        rewind to the last thing you actually heard. This is the ear-equivalent of
        running your finger back up the page.
      </p>

      <h2>Move by paragraph to skim</h2>
      <p>
        Hold Shift with the arrows to jump a whole paragraph at a time. This is
        how you skip past a section you already know, or hunt for the part you
        care about. Combine the two: Shift+arrow to get to roughly the right
        paragraph, then plain arrows to home in on the sentence.
      </p>

      <h2>Jump straight to any sentence</h2>
      <p>
        In the transcript, every sentence is a button. Tab to the one you want and
        press Enter, or click it, and reading starts from there. This is faster
        than arrowing through a long document when you already know where you&rsquo;re
        headed &mdash; for example, re-reading the paragraph you just rewrote while
        <a href="/use-cases/proofreading-by-ear"> proofreading</a>.
      </p>

      <h2>Adjust speed on the fly</h2>
      <p>
        The up and down arrows nudge the speed while you listen, so you can speed
        through easy passages and slow down for dense ones without opening any
        menu. The sliders themselves are keyboard-friendly too: focus one and use
        the arrows to step by 0.1, or hold Shift for a bigger jump. Each slider
        announces its value (&ldquo;1.2 times speed&rdquo;) for screen readers.
      </p>

      <h2>The shortcuts dialog is honest</h2>
      <p>
        Press the question-mark key to open a dialog listing every shortcut. This
        matters because in a lot of apps such a list includes keys that don&rsquo;t
        actually work. In MK VoiceKit, every shortcut shown is real and wired up
        &mdash; if it&rsquo;s in the dialog, it works. The dialog traps focus while
        open, closes on Escape, and returns focus to where you were.
      </p>

      <h2>A quick way to build the habit</h2>
      <p>
        The shortcuts pay off fast once they&rsquo;re in your fingers. A simple
        way to get there: for your first few sessions, deliberately keep your
        hand off the mouse. Paste some text, press Space to start, and use only
        the arrows to move around. Tap left when you miss something, Shift+left to
        jump back a paragraph, and the up and down arrows to find a comfortable
        speed. Within a session or two the four core keys &mdash; Space, Escape,
        and the two arrows &mdash; become automatic, and everything else builds on
        those.
      </p>

      <h2>Why this matters beyond convenience</h2>
      <p>
        For a lot of people, keyboard operation isn&rsquo;t a preference &mdash;
        it&rsquo;s the only comfortable way to use a computer. Someone with a
        tremor, limited fine motor control, or a repetitive-strain injury may find
        precise clicking painful or impossible. Building every feature to work
        from the keyboard, and never hiding one behind a mouse-only gesture, is
        what makes the tool usable for them rather than almost-usable. It&rsquo;s
        also simply faster for anyone once the keys are learned, which is why the
        same design serves both groups. The{" "}
        <a href="/use-cases/accessible-reading">accessible reading</a> page covers
        the wider picture.
      </p>

      <h2>Everything is reachable and visible</h2>
      <p>
        Focus order follows the visual layout, so tabbing moves through the page
        the way you&rsquo;d expect. The focus ring is never hidden, so you can
        always see where you are. A skip link is the first thing you reach with
        Tab, letting you jump straight to the main content. And when you move
        between pages, focus is sent to the main region so a screen reader starts
        in the right place. If a mouse is hard for you to use, none of MK
        VoiceKit&rsquo;s features are locked behind one.
      </p>
    </ArticleShell>
  );
}
