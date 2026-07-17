import { pageMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getGuide("building-a-listening-queue")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/guides/building-a-listening-queue",
});

export default function Page() {
  return (
    <ArticleShell
      kind="guide"
      entry={entry}
      related={[
        {
          href: "/use-cases/studying-from-pdfs",
          title: "Studying from PDFs",
          excerpt: "Queue chapters of a reading to get through it all.",
        },
        {
          href: "/guides/reading-long-articles-aloud",
          title: "Reading long articles aloud",
          excerpt: "Keep your place across a long listening session.",
        },
      ]}
    >
      <p>
        The queue is what turns MK VoiceKit from &ldquo;read this one thing&rdquo;
        into &ldquo;work through all of this&rdquo;. Instead of pasting text,
        listening, then pasting the next piece, you line up several sections and
        let them play in order, the way a playlist works. This guide covers how to
        build one and get the most out of it.
      </p>

      <h2>What can go in the queue</h2>
      <p>
        Anything you can read can be a queue item: chapters of a document,
        separate articles, sections you split out of a PDF, or individual pieces
        of text you add one after another. Each item keeps its own text, so a
        queue can mix sources &mdash; a couple of newsletter articles followed by
        a chapter of notes, for instance.
      </p>

      <h2>Building one</h2>
      <ol>
        <li>
          Add your first piece of text in the <a href="/tool">workspace</a> and
          add it to the queue.
        </li>
        <li>
          Bring in the next section &mdash; paste it, or import another file &mdash;
          and add it too. Repeat for as many as you want.
        </li>
        <li>
          The queue shows each item in order, with the current one clearly marked
          as &ldquo;Now playing&rdquo;. When one finishes, the next starts
          automatically.
        </li>
      </ol>
      <p>
        If you&rsquo;re working from a long document, splitting it into chapters
        first &mdash; by heading, or with the chapter tools &mdash; gives you
        natural queue items. That&rsquo;s the backbone of the{" "}
        <a href="/use-cases/studying-from-pdfs">studying from PDFs</a> workflow.
      </p>

      <h2>Reordering and removing</h2>
      <p>
        Plans change, so the queue is editable. You can reorder items with a drag
        handle, and &mdash; crucially &mdash; also with the keyboard, using the
        up and down keys with a modifier. Reordering is never drag-only, so it
        works whether or not a mouse suits you. Remove a single item with its
        clearly labelled remove button, or clear the whole queue at once when
        you&rsquo;re done.
      </p>

      <h2>It survives a reload</h2>
      <p>
        The queue is stored on your device, so it doesn&rsquo;t vanish if you
        close the tab or your browser restarts. Come back later and your line-up
        is still there, ready to continue. This is what makes it practical for
        something you&rsquo;ll work through over more than one sitting &mdash; you
        build the queue once and chip away at it.
      </p>

      <h2>Queue versus history</h2>
      <p>
        These two are easy to confuse but do different jobs. The <em>queue</em> is
        what&rsquo;s lined up to play <em>next</em>. Your <em>history</em> is a
        record of what you&rsquo;ve <em>already</em> played, with a speak-again
        button on each entry. Use the queue to plan a session and history to
        revisit or resume something afterwards. Both live locally and both can be
        cleared whenever you like.
      </p>

      <h2>Tips for a good session</h2>
      <ul>
        <li>
          Keep items a sensible length. Very long single items are harder to
          navigate by ear than a few shorter ones.
        </li>
        <li>
          Put the thing you most want to get through first, in case you don&rsquo;t
          finish the whole queue.
        </li>
        <li>
          Set your voice and speed before you start &mdash; they carry across
          items, so a <a href="/guides/choosing-a-voice">saved preset</a> gets the
          whole session sounding right in one click.
        </li>
        <li>
          Turn on auto-scroll if you&rsquo;re following along on screen, so the
          active sentence stays in view as items advance.
        </li>
      </ul>

      <h2>A session, start to finish</h2>
      <p>
        Here&rsquo;s what a real queue session looks like. Say you&rsquo;ve got a
        long report to get through. You split it into its five sections, add each
        one, and end up with a queue of five items in reading order. You pick a
        clear voice, set the speed a touch below conversational, and save that as
        a preset so the whole session sounds consistent. You press play on the
        first item and follow the highlighted sentence while it reads; when it
        finishes, the second item starts on its own. Halfway through you get
        interrupted, so you stop &mdash; and because the queue is stored on your
        device, it&rsquo;s waiting exactly as you left it when you come back an
        hour later. You reload the item you were on from history, and carry on
        down the queue. No re-pasting, no losing your place.
      </p>

      <h2>Reordering without a mouse</h2>
      <p>
        The keyboard reordering deserves a closer look, because it&rsquo;s what
        makes the queue usable for everyone. Focus an item&rsquo;s move control
        and use the up and down keys with the modifier to shift it through the
        list; the order updates and is saved immediately. This isn&rsquo;t a
        second-class fallback bolted on after the drag handles &mdash; it&rsquo;s
        a first-class way to reorder, so the queue never depends on precise mouse
        dragging. That matters if a mouse is awkward for you, or if you simply
        prefer to keep your hands on the keyboard while you work.
      </p>

      <h2>The one boundary</h2>
      <p>
        The queue plays your sections in sequence within MK VoiceKit; it
        doesn&rsquo;t bundle them into a single downloadable audio file, because
        the browser speech engine doesn&rsquo;t produce files at all. You listen
        with the app open. For working through reading, that&rsquo;s exactly the
        point &mdash; you press play once and let the whole line-up run.
      </p>
    </ArticleShell>
  );
}
