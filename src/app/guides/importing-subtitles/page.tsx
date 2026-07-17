import { pageMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getGuide("importing-subtitles")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/guides/importing-subtitles",
});

export default function Page() {
  return (
    <ArticleShell
      kind="guide"
      entry={entry}
      related={[
        {
          href: "/use-cases/language-learning-with-subtitles",
          title: "Language learning with subtitles",
          excerpt: "Turn a subtitle file into slow listening practice.",
        },
        {
          href: "/guides/building-a-listening-queue",
          title: "Building a listening queue",
          excerpt: "Queue several files to play in order.",
        },
      ]}
    >
      <p>
        Subtitle files are just text with timing information attached, which makes
        them easy to read aloud once the timing is stripped out. MK VoiceKit
        imports the two common formats &mdash; <code>.srt</code> (SubRip) and{" "}
        <code>.vtt</code> (WebVTT) &mdash; and turns them into clean, continuous
        speech. This guide explains what happens to the file and how to get a good
        result.
      </p>

      <h2>What a subtitle file contains</h2>
      <p>
        Open an <code>.srt</code> file in a text editor and you&rsquo;ll see
        repeating blocks: a cue number, a line of timestamps like{" "}
        <code>00:01:15,000 --&gt; 00:01:18,200</code>, and then the text that
        appears on screen during that window. <code>.vtt</code> is similar but
        starts with a <code>WEBVTT</code> header and can carry styling and
        positioning hints. None of that scaffolding is worth listening to &mdash;
        you want the words.
      </p>

      <h2>What MK VoiceKit strips out</h2>
      <p>When you import a subtitle file, it removes:</p>
      <ul>
        <li>Cue numbers and the <code>WEBVTT</code> header.</li>
        <li>Timestamp lines and any timing metadata.</li>
        <li>Positioning and styling hints, and stray formatting tags.</li>
      </ul>
      <p>
        What&rsquo;s left is the spoken text, with the separate cues joined into
        sentences so the reading flows instead of stopping dead at every line
        break. A caption that was split across two on-screen lines becomes one
        continuous sentence.
      </p>

      <h2>Importing a file</h2>
      <ol>
        <li>
          Open the <a href="/tool">workspace</a> and drag your subtitle file onto
          the dropzone, or click it to open a file picker.
        </li>
        <li>
          The file type and size are checked. Files larger than 10&nbsp;MB are
          rejected with a clear message &mdash; a subtitle file that big almost
          certainly isn&rsquo;t really subtitles.
        </li>
        <li>
          The cleaned text appears in the editor. Skim it before playing, because
          subtitles have a couple of quirks worth a quick fix (below).
        </li>
      </ol>
      <p>
        This all happens in your browser. The file is never uploaded, so you can
        use subtitles for anything, including private recordings.
      </p>

      <h2>Quirks to check before you play</h2>
      <ul>
        <li>
          <strong>Speaker labels.</strong> Some subtitles prefix lines with a name
          or a dash for each speaker. Those get read out too (&ldquo;dash&rdquo;,
          &ldquo;NARRATOR colon&rdquo;). If they bother you, a quick find-and-tidy
          in the editor removes them.
        </li>
        <li>
          <strong>Sound descriptions.</strong> Captions for the deaf and hard of
          hearing include things like <code>[music playing]</code> or{" "}
          <code>(laughs)</code>. Decide whether you want those spoken and delete
          them if not.
        </li>
        <li>
          <strong>Sentences split across cues.</strong> The join step handles most
          of this, but occasionally a sentence broken oddly across cues needs a
          nudge. Reading a paragraph before committing catches it.
        </li>
      </ul>

      <h2>Getting the best result</h2>
      <p>
        Pick a voice in the language of the subtitles &mdash; the picker groups
        voices by language to make this easy. For dialogue-heavy material, a
        slightly slower speed helps, since real speech in subtitles is denser than
        prose. If the file uses a lot of numbers or abbreviations, turning on the
        local text-prep helpers makes them read properly; see{" "}
        <a href="/guides/text-prep-for-natural-speech">preparing text so it sounds natural</a>.
      </p>

      <h2>Beyond one file</h2>
      <p>
        If you&rsquo;ve got a series of episodes, import them one at a time and add
        each to the <a href="/guides/building-a-listening-queue">listening queue</a>{" "}
        so they play back to back. For study, slowing the rate right down and
        replaying individual lines turns a subtitle file into proper practice
        material &mdash; that&rsquo;s covered in{" "}
        <a href="/use-cases/language-learning-with-subtitles">language learning with subtitles</a>.
      </p>

      <h2>Does the format matter: .srt or .vtt?</h2>
      <p>
        For listening, the difference between SubRip (<code>.srt</code>) and
        WebVTT (<code>.vtt</code>) barely matters &mdash; both carry the same
        dialogue, and MK VoiceKit strips the scaffolding from each. WebVTT is the
        format browsers use natively for web video, so it can include styling and
        positioning cues that SubRip doesn&rsquo;t; those are removed along with
        everything else. If you have a choice, either works. If a file
        won&rsquo;t import, check that it&rsquo;s genuinely a subtitle file and
        not, say, a renamed document &mdash; the parser expects the cue-and-timing
        structure these formats use.
      </p>

      <h2>Where subtitle files come from</h2>
      <p>
        You often already have subtitle files without realising. Many talks and
        lectures offer a transcript or caption download; language-course videos
        frequently ship with subtitle files; and plenty of open educational
        material includes them. Anywhere you can legitimately obtain the caption
        file, you can turn it into listening practice or a read-through. Because
        the file is parsed on your device and never uploaded, you can use whatever
        you have the right to use, privately &mdash; a point worth remembering for
        anything sensitive.
      </p>

      <h2>What it doesn&rsquo;t do</h2>
      <p>
        MK VoiceKit reads the dialogue; it doesn&rsquo;t sync speech back to the
        original video timings, and it can&rsquo;t save the result as an audio
        file. It&rsquo;s for listening to the words, not for producing a dubbed
        soundtrack. For most reading and study purposes that&rsquo;s exactly what
        you want.
      </p>
    </ArticleShell>
  );
}
