import { pageMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getGuide("reading-long-articles-aloud")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/guides/reading-long-articles-aloud",
});

export default function Page() {
  return (
    <ArticleShell
      kind="guide"
      entry={entry}
      related={[
        {
          href: "/guides/building-a-listening-queue",
          title: "Building a listening queue",
          excerpt: "Line up several articles to play back to back.",
        },
        {
          href: "/guides/choosing-a-voice",
          title: "Choosing a voice",
          excerpt: "The right voice makes long listening comfortable.",
        },
      ]}
    >
      <p>
        Long reads pile up faster than anyone gets through them &mdash; the
        newsletter you saved, the report you meant to finish, the article three
        tabs deep. Listening instead of reading is a good way to clear the backlog
        while your eyes and hands are busy with something else. This guide is a
        practical routine for doing that without losing your place.
      </p>

      <h2>Get the article in cleanly</h2>
      <p>
        Paste the article text into the <a href="/tool">workspace</a>. If you copy
        from a web page you&rsquo;ll often pick up navigation labels, share
        buttons and captions along with the body &mdash; take a few seconds to
        delete those from the top and bottom so the reading doesn&rsquo;t open
        with &ldquo;Skip to content, Menu, Subscribe&rdquo;. If your source is
        Markdown, the formatting is stripped automatically. There&rsquo;s a soft
        ceiling around 100,000 characters with a live count, which is plenty for
        even a very long feature.
      </p>

      <h2>Set up for comfort, not speed</h2>
      <p>
        For long listening, comfort beats raw pace. A clear voice you don&rsquo;t
        find grating matters more over thirty minutes than shaving a few minutes
        off with a higher rate &mdash; <a href="/guides/choosing-a-voice">choosing a voice</a>{" "}
        covers how to pick one. Start slightly slower than conversational and let
        your ear adjust; you can nudge the speed up with the up arrow once
        you&rsquo;re settled. If the piece is full of figures, turning on number
        expansion keeps them from becoming a wall of digits.
      </p>

      <h2>Follow the highlight to stay oriented</h2>
      <p>
        The current sentence is highlighted as it&rsquo;s read, and the transcript
        can auto-scroll to keep it in view. This is what lets you glance over,
        find exactly where the voice is, and glance away again &mdash; the mental
        thread you lose when audio plays with nothing to look at. If you scroll up
        to re-read something, auto-scroll steps aside so it doesn&rsquo;t yank you
        back; it resumes when you&rsquo;re ready.
      </p>

      <h2>Rewind by ear</h2>
      <p>
        Attention drifts, especially with something in the background. When you
        realise you&rsquo;ve missed a bit, tap the left arrow to jump back a
        sentence or two and replay it &mdash; no scrubbing, no hunting. For a
        bigger jump back to the start of a section, use Shift with the arrows to
        move by paragraph. The <a href="/guides/navigating-text-by-keyboard">keyboard guide</a>{" "}
        has the full set.
      </p>

      <h2>Break a very long piece into a queue</h2>
      <p>
        For something book-length, don&rsquo;t rely on one giant block. Split it
        at section boundaries and add the parts to the{" "}
        <a href="/guides/building-a-listening-queue">listening queue</a>. That
        gives you clear checkpoints, makes it easy to jump between sections, and
        means each part is a manageable chunk rather than an intimidating whole.
      </p>

      <h2>Stop and resume tomorrow</h2>
      <p>
        You won&rsquo;t always finish in one go, and that&rsquo;s fine. Everything
        you play is recorded in your local history &mdash; a short excerpt, the
        voice, the settings and the time &mdash; each with a speak-again button.
        When you come back, you replay the piece and pick up roughly where you
        stopped, instead of scrolling a web page trying to remember which
        paragraph you&rsquo;d reached. History lives on your device and can be
        turned off or cleared in Settings if you&rsquo;d rather not keep it.
      </p>

      <h2>Listening while you do something else</h2>
      <p>
        The whole appeal of listening is that it frees your eyes and hands, so it
        pairs naturally with chores, a walk, or a commute. A couple of things make
        that work better. Set the speed a little lower than you would for focused
        reading, because divided attention needs more slack. And accept that
        you&rsquo;ll drift occasionally &mdash; that&rsquo;s what the left arrow is
        for. Rather than fighting to catch every word first time, let it play and
        rewind the bits that matter. For anything you need to absorb precisely, do
        a second pass sitting down and following the highlight.
      </p>

      <h2>Working through a backlog</h2>
      <p>
        If saved articles pile up faster than you read them, the queue turns the
        pile into a plan. Add several at the start of a session and let them play
        through while you get on with something else; the ones you finish land in
        your history, so you can see what you&rsquo;ve cleared and what&rsquo;s
        left. It won&rsquo;t make the backlog shorter by magic, but listening
        reclaims time you couldn&rsquo;t have spent reading &mdash; the minutes
        where your eyes were busy but your ears were free.
      </p>

      <h2>Keep it private</h2>
      <p>
        Because the reading is done by your browser, the articles you listen to
        aren&rsquo;t sent anywhere. That&rsquo;s worth knowing if some of what you
        read is behind a login or otherwise private &mdash; it stays on your
        device. The only exception is if you deliberately reach for an AI tool to,
        say, summarise a piece first, which sends just that selected text to be
        processed.
      </p>
    </ArticleShell>
  );
}
