import { pageMetadata } from "@/lib/seo";
import { getUseCase } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getUseCase("podcast-script-drafting")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/use-cases/podcast-script-drafting",
});

export default function Page() {
  return (
    <ArticleShell
      kind="use-case"
      entry={entry}
      related={[
        {
          href: "/guides/using-the-ai-text-tools",
          title: "Using the optional AI text tools",
          excerpt: "Shape an article into a spoken, two-host format.",
        },
        {
          href: "/guides/why-no-mp3-export",
          title: "Why there's no MP3 download",
          excerpt: "MK VoiceKit drafts and previews; it doesn't record.",
        },
      ]}
    >
      <p>
        A script that reads well on the page can fall apart the moment you say it
        out loud. Sentences that looked fine turn out to be too long for one
        breath; a clever phrase becomes a tongue-twister; the pacing sags. The
        cheapest way to catch all of that is to hear the script before you sit
        down to record. MK VoiceKit is a good drafting companion for exactly that
        &mdash; with one honest caveat we&rsquo;ll get to.
      </p>

      <h2>Hear the draft, not just read it</h2>
      <p>
        Paste your working script into the <a href="/tool">workspace</a> and play
        it back. Follow the highlighted sentence and listen for the spots where
        the synthetic voice struggles &mdash; those are usually the same spots a
        human will stumble on. Run-on sentences, awkward clause order, and words
        that clash when spoken together all become obvious. Click any sentence to
        replay just that line after you rewrite it.
      </p>

      <h2>Shape an article into a spoken format</h2>
      <p>
        If you&rsquo;re adapting a written article into something conversational,
        the optional AI tools can give you a starting point. The
        &ldquo;article to podcast script&rdquo; tool turns prose into a two-host
        exchange, and &ldquo;notes to narration&rdquo; turns bullet points into
        flowing spoken text. The multi-speaker formatter lays dialogue out by
        speaker so you can assign different voices to each part and hear the
        back-and-forth.
      </p>
      <p>
        Treat the output as a draft, not a finished script. It&rsquo;s a way to
        get past the blank page, and you&rsquo;ll want to rewrite it in your own
        voice. Those tools send the text you select to a model to process it; if
        you&rsquo;d rather not, write the script yourself and just use the
        playback to test it, which needs nothing beyond your browser.
      </p>

      <h2>Test different voices for different parts</h2>
      <p>
        For a two-host or interview format, draft each speaker&rsquo;s lines and
        listen with different voices to get a rough feel for the rhythm of the
        exchange. It won&rsquo;t sound like your real co-host, but it tells you
        whether the turns are the right length and whether one person is
        monologuing. Save the voices you settle on as presets so you can switch
        between them quickly.
      </p>

      <h2>Read timing and pacing</h2>
      <p>
        Play the whole thing through at the speed you actually talk. If a segment
        drags to listen to, it&rsquo;ll drag to record. If a transition feels
        abrupt, you&rsquo;ll hear the gap. This is a far faster feedback loop than
        recording a take, listening back, and re-recording &mdash; you can fix the
        words while they&rsquo;re still just words.
      </p>

      <h2>The honest caveat</h2>
      <p>
        MK VoiceKit is for <em>drafting and previewing</em> a script, not for
        producing the final audio. The browser speech engine plays sound but
        doesn&rsquo;t hand back a file, so there&rsquo;s no way to export a
        narration track to drop into your editor &mdash; and we won&rsquo;t
        pretend otherwise. When you&rsquo;re happy with the script, you record it
        yourself, or with a proper text-to-speech service that produces real audio
        files. The reasoning behind that limit is in{" "}
        <a href="/guides/why-no-mp3-export">why there&rsquo;s no MP3 download</a>.
      </p>

      <h2>Getting a rough sense of length</h2>
      <p>
        Scripts are notoriously hard to judge for length on the page. Playing the
        whole thing through at the speed you actually talk gives you a rough
        runtime &mdash; not exact, since your real delivery has pauses and asides a
        synthetic voice skips, but close enough to know whether a segment is
        running long before you commit it to a take. If an intro that looked tight
        drags for two minutes when spoken, you&rsquo;ll hear it and can trim. This
        is far cheaper than discovering the problem after you&rsquo;ve recorded.
      </p>

      <h2>A quick pre-record pass</h2>
      <p>
        Before you sit down to record, one listen-through catches the things that
        trip up a take: the sentence that&rsquo;s too long to say in one breath,
        the phrase that&rsquo;s a tongue-twister, the transition that lands
        awkwardly, the name you&rsquo;re not sure how to pronounce. Fix them in the
        text while they&rsquo;re still just text. If a particular word keeps
        catching you, the pronunciation tool can suggest a respelling, and you can
        note it in the script. Walk in with a script you&rsquo;ve already heard,
        and the recording goes faster with fewer retakes.
      </p>

      <p>
        Used for what it&rsquo;s good at &mdash; catching the awkward lines and
        pacing problems before you hit record &mdash; it saves a lot of wasted
        takes.
      </p>
    </ArticleShell>
  );
}
