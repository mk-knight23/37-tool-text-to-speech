import { pageMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getGuide("choosing-a-voice")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/guides/choosing-a-voice",
});

export default function Page() {
  return (
    <ArticleShell
      kind="guide"
      entry={entry}
      related={[
        {
          href: "/guides/browser-voice-differences",
          title: "Why voices differ between browsers",
          excerpt: "Where the list of voices actually comes from.",
        },
        {
          href: "/guides/reading-long-articles-aloud",
          title: "Reading long articles aloud",
          excerpt: "The setup for comfortable long-form listening.",
        },
      ]}
    >
      <p>
        The voice you pick matters more than any other setting, because
        you&rsquo;ll be listening to it for as long as your text takes to read.
        A voice that sounds fine for a sentence can grate over twenty minutes.
        This guide covers how to find one you can live with, what the badges in
        the picker mean, and how to stop re-choosing it every time.
      </p>

      <h2>Where the voices come from</h2>
      <p>
        MK VoiceKit doesn&rsquo;t ship its own voices. It offers whatever voices
        your browser and operating system already have. That&rsquo;s why the list
        looks different on a Mac than on a Windows PC, and different again on your
        phone. It also means the quality is set by your system, not by us &mdash;
        if you want better voices, the place to add them is your operating
        system&rsquo;s settings. There&rsquo;s more on that in{" "}
        <a href="/guides/browser-voice-differences">why voices differ between browsers</a>.
      </p>

      <h2>Reading the voice picker</h2>
      <p>
        The picker groups voices by language, with a count for each group, so you
        can jump straight to the language you need instead of scrolling past
        dozens you&rsquo;ll never use. A few things to look for:
      </p>
      <ul>
        <li>
          <strong>The local badge.</strong> Some voices run entirely on your
          device; others are provided by the browser and may rely on a network
          connection or sound noticeably different. A voice marked local will keep
          working offline, which matters if you listen on the move.
        </li>
        <li>
          <strong>The language tag.</strong> Voices are labelled with their
          language and region &mdash; English (United Kingdom) sounds different
          from English (United States), and picking the right region gets you the
          accent and pronunciation you expect.
        </li>
        <li>
          <strong>Search.</strong> If you know the name of a voice you like, type
          it into the search box rather than hunting. The picker is a proper
          combobox, so you can drive it entirely from the keyboard.
        </li>
      </ul>

      <h2>How to actually choose</h2>
      <p>
        Don&rsquo;t judge a voice on &ldquo;hello&rdquo;. Paste a real paragraph
        of the kind of text you&rsquo;ll be listening to &mdash; an article, some
        notes, a chapter &mdash; and play thirty seconds of it with each
        candidate. You&rsquo;re listening for three things:
      </p>
      <ol>
        <li>
          <strong>Clarity.</strong> Can you follow it without leaning in? Some
          voices are crisp; others mumble through the ends of words.
        </li>
        <li>
          <strong>Naturalness.</strong> Does the rhythm sound roughly human, or
          is it flat and robotic? Flatter voices are more tiring over time.
        </li>
        <li>
          <strong>Pronunciation.</strong> Feed it a sentence with a couple of
          hard words, numbers or names from your material. If it mangles them,
          the local text-prep tools can help &mdash; see{" "}
          <a href="/guides/text-prep-for-natural-speech">preparing text so it sounds natural</a>.
        </li>
      </ol>

      <h2>Tune speed and pitch to the voice</h2>
      <p>
        Every voice has a natural pace. A voice that&rsquo;s pleasant at normal
        speed might turn shrill or muddy when you push the rate up. Once
        you&rsquo;ve chosen a voice, spend a moment on the speed slider &mdash;
        for focused listening, slightly slower than conversational usually wins;
        for skimming familiar material, a little faster is fine. Pitch is best
        left near the middle unless a voice sounds too high or too low for
        comfort.
      </p>

      <h2>Save it as a preset</h2>
      <p>
        When you find a voice, speed and pitch that work, save the combination as
        a named preset. Next time, one click restores it instead of you
        re-tuning three sliders. MK VoiceKit also remembers the last voice you
        used per language, so switching between, say, English and French keeps a
        sensible voice for each. Presets are stored on your device.
      </p>

      <h2>If a saved voice goes missing</h2>
      <p>
        Voices belong to the system, so a preset made on one computer might
        reference a voice that isn&rsquo;t installed on another. When that
        happens, MK VoiceKit tells you the voice is missing and keeps the rest of
        the preset&rsquo;s settings, rather than silently swapping in something
        random. Pick a replacement voice and re-save, and you&rsquo;re set.
      </p>

      <h2>Local versus network voices in practice</h2>
      <p>
        The local badge is worth understanding, because it affects both how a
        voice sounds and whether it works at all offline. Local voices are
        installed on your device and run there; they&rsquo;re instant, they keep
        working with no connection, and they sound the same every time. Some
        browsers also expose higher-quality voices that are synthesised on a
        remote server &mdash; these can sound noticeably more natural, but they
        need a connection and send the text to that provider to be spoken. For
        long, uninterrupted listening &mdash; a commute, a flight, anywhere your
        connection is patchy &mdash; a local voice is the safer choice. For a
        short passage where you want the best possible quality and don&rsquo;t
        mind the trade-off, a network voice can be worth it. MK VoiceKit shows the
        badge so the decision is yours rather than a surprise.
      </p>

      <h2>Matching the voice to the material</h2>
      <p>
        The best voice depends on what you&rsquo;re listening to. For dense,
        technical text you want maximum clarity, even if the voice is a little
        plain. For a long article you&rsquo;ll listen to end to end, naturalness
        matters more, since a flat voice becomes tiring. For proofreading your own
        writing, a neutral, unremarkable voice is ideal &mdash; you want to notice
        the words, not the delivery. It&rsquo;s perfectly reasonable to keep two
        or three presets for different jobs rather than hunting for one voice that
        does everything.
      </p>

      <h2>What to do with an empty list</h2>
      <p>
        If the picker is empty, give it a moment &mdash; some browsers load voices
        a beat after the page &mdash; then use the reload-voices control. If it
        stays empty, your system may have no speech voices installed; the
        workspace shows hints for adding them per operating system. You&rsquo;re
        never left staring at a blank picker with no explanation.
      </p>
    </ArticleShell>
  );
}
