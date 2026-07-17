import { pageMetadata } from "@/lib/seo";
import { getUseCase } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getUseCase("language-learning-with-subtitles")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/use-cases/language-learning-with-subtitles",
});

export default function Page() {
  return (
    <ArticleShell
      kind="use-case"
      entry={entry}
      related={[
        {
          href: "/guides/importing-subtitles",
          title: "Turning subtitles into speech",
          excerpt: "How .srt and .vtt files are cleaned up and read aloud.",
        },
        {
          href: "/guides/choosing-a-voice",
          title: "Choosing a voice",
          excerpt: "Find a native voice for the language you're learning.",
        },
      ]}
    >
      <p>
        Subtitle files are an underrated language-learning resource. They&rsquo;re
        real dialogue, written the way people actually speak, and you probably
        already have some from shows or talks you like. MK VoiceKit lets you turn
        an <code>.srt</code> or <code>.vtt</code> file into speech you can slow
        down, repeat, and listen to as many times as it takes &mdash; without a
        subscription and without uploading the file anywhere.
      </p>

      <h2>Why subtitles make good practice material</h2>
      <p>
        Textbook audio is careful and clear, which is useful at first but
        doesn&rsquo;t sound like real life. Subtitles capture natural phrasing:
        contractions, filler words, the way sentences actually run together.
        Because a subtitle file is just text with timestamps, MK VoiceKit can
        strip the timing information and read the dialogue as continuous speech,
        so you focus on the words rather than the clock.
      </p>

      <h2>Setting it up</h2>
      <ol>
        <li>
          In the <a href="/tool">workspace</a>, import your <code>.srt</code> or{" "}
          <code>.vtt</code> file. The cue numbers, timestamps and any styling are
          removed automatically, and the lines are joined into sentences.
        </li>
        <li>
          Open the voice picker and find a voice in your target language. Voices
          are grouped by language, so if you have, say, a Spanish or Japanese
          voice installed on your system, it&rsquo;ll be in its own group with a
          count. If nothing shows for your language, you can add voices through
          your operating system &mdash; see{" "}
          <a href="/guides/browser-voice-differences">why voices differ between browsers</a>.
        </li>
        <li>
          Set the speed low. For a language you&rsquo;re still building an ear for,
          0.7&ndash;0.8&times; gives you time to catch each word. As you improve,
          nudge it up toward natural pace.
        </li>
      </ol>

      <h2>Listen, repeat, shadow</h2>
      <p>
        The sentence highlighting is what makes this work for study. As each line
        is read, it&rsquo;s highlighted, so you can see exactly which words map to
        the sounds you&rsquo;re hearing. Three techniques pair well with it:
      </p>
      <ul>
        <li>
          <strong>Repeat a line.</strong> Click a sentence to start from it, then
          use the left arrow to jump back and replay it until you can hear every
          word.
        </li>
        <li>
          <strong>Shadow.</strong> Play at a slow speed and speak along a beat
          behind the voice, matching its rhythm. This trains pronunciation and
          pacing at the same time.
        </li>
        <li>
          <strong>Chunk it.</strong> Don&rsquo;t try to do a whole episode at
          once. Work through a few minutes of dialogue, then move on. Anything you
          replay is available again from your local history the next day.
        </li>
      </ul>

      <h2>Reading level and translation, if you want them</h2>
      <p>
        For advanced material that&rsquo;s a bit beyond you, the optional AI tools
        can simplify a passage to an easier reading level, or translate it so you
        can check your understanding. These are optional and send the selected
        text to a model to process it; if you&rsquo;d rather keep everything on
        your device, skip them and just use the reading and repetition features,
        which don&rsquo;t need any of that.
      </p>

      <h2>A realistic caveat</h2>
      <p>
        Synthetic voices are good, but they&rsquo;re not a substitute for native
        speakers for the finest points of accent and intonation. Use MK VoiceKit
        for comprehension, vocabulary and pacing practice, and treat real
        recordings and conversations as the reference for exactly how something
        should sound. The synthetic voice is patient and endlessly repeatable,
        which is precisely what you want for the reps &mdash; just not the last
        word on pronunciation.
      </p>

      <p>
        Because the file is parsed in your browser and never uploaded, you can
        practise with whatever material you have to hand, privately.
      </p>
    </ArticleShell>
  );
}
