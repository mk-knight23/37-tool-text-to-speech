import { pageMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getGuide("browser-voice-differences")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/guides/browser-voice-differences",
});

export default function Page() {
  return (
    <ArticleShell
      kind="guide"
      entry={entry}
      related={[
        {
          href: "/guides/choosing-a-voice",
          title: "Choosing a voice",
          excerpt: "Once you know where voices come from, pick a good one.",
        },
        {
          href: "/guides/why-no-mp3-export",
          title: "Why there's no MP3 download",
          excerpt: "The same browser engine explains the export limit.",
        },
      ]}
    >
      <p>
        Open MK VoiceKit on your laptop and your phone and you&rsquo;ll likely see
        two different lists of voices, and the same sentence will sound different
        on each. That&rsquo;s expected. The voices don&rsquo;t come from MK
        VoiceKit &mdash; they come from your browser and operating system &mdash;
        and this guide explains what that means for you.
      </p>

      <h2>Voices belong to your system, not the app</h2>
      <p>
        MK VoiceKit uses the Web Speech API, a browser feature that exposes
        whatever text-to-speech voices are available on the device. Those voices
        are installed and managed by your operating system. So the list you see is
        really your system&rsquo;s voice list, surfaced through the browser. Two
        consequences follow: the app can&rsquo;t add or improve voices on its own,
        and what you get depends entirely on your setup.
      </p>

      <h2>What each platform tends to offer</h2>
      <table>
        <thead>
          <tr>
            <th>Platform</th>
            <th>What to expect</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Windows</td>
            <td>A handful of built-in voices, with more available to download in the language and speech settings. Chrome and Edge also add their own.</td>
          </tr>
          <tr>
            <td>macOS</td>
            <td>A large set of system voices, including high-quality ones you can add in the Spoken Content settings. Safari surfaces these well.</td>
          </tr>
          <tr>
            <td>iOS / iPadOS</td>
            <td>Good system voices, with extra and enhanced-quality voices downloadable in Accessibility settings.</td>
          </tr>
          <tr>
            <td>Android</td>
            <td>Depends on the text-to-speech engine installed; Google&rsquo;s engine offers many languages you can add.</td>
          </tr>
          <tr>
            <td>Linux</td>
            <td>Varies most; depends on which speech packages are installed. Sometimes sparse out of the box.</td>
          </tr>
        </tbody>
      </table>

      <h2>Why the same voice can sound different</h2>
      <p>
        Even a voice with the same name can differ between browsers, because some
        browsers ship their own voice implementations alongside the system ones.
        Chrome, for instance, includes network-backed voices in addition to the
        local ones. That&rsquo;s why the voice picker flags which voices are local
        to your device: local voices keep working offline and sound consistent,
        while others may depend on a connection.
      </p>

      <h2>Word highlighting varies too</h2>
      <p>
        MK VoiceKit highlights the current sentence everywhere, and the current
        word where the browser reports word timing through &ldquo;boundary&rdquo;
        events. Whether those events fire, and how accurately, depends on the
        browser and voice. Chrome and Edge usually report them; Safari is
        inconsistent; Firefox often doesn&rsquo;t. When word timing isn&rsquo;t
        available, MK VoiceKit falls back to sentence-only highlighting rather
        than guessing &mdash; it never fakes word timing it doesn&rsquo;t have.
      </p>

      <h2>The Chrome long-utterance quirk</h2>
      <p>
        Chrome has a long-standing habit of cutting speech off after roughly
        fifteen seconds if a single utterance runs too long. MK VoiceKit works
        around it by chunking your text into sentence-sized pieces and feeding them
        to the engine in sequence, so long documents keep playing and pause and
        stop stay responsive. You don&rsquo;t have to do anything; it&rsquo;s
        handled for you.
      </p>

      <h2>How to get more or better voices</h2>
      <p>
        Because voices are a system feature, you add them through your operating
        system, not the app:
      </p>
      <ul>
        <li><strong>Windows:</strong> Settings &rarr; Time &amp; language &rarr; Language &amp; region, and the Speech settings.</li>
        <li><strong>macOS:</strong> System Settings &rarr; Accessibility &rarr; Spoken Content &rarr; System Voice &rarr; Manage Voices.</li>
        <li><strong>iOS / iPadOS:</strong> Settings &rarr; Accessibility &rarr; Spoken Content &rarr; Voices.</li>
        <li><strong>Android:</strong> Settings &rarr; Accessibility &rarr; Text-to-speech output.</li>
      </ul>
      <p>
        After adding a voice, reload MK VoiceKit (or use the reload-voices control)
        and it&rsquo;ll appear in the picker. Once you&rsquo;ve got voices you
        like, <a href="/guides/choosing-a-voice">choosing a voice</a> covers how to
        settle on one and save it as a preset.
      </p>
    </ArticleShell>
  );
}
