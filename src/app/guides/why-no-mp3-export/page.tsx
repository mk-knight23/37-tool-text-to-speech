import { pageMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getGuide("why-no-mp3-export")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/guides/why-no-mp3-export",
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
          excerpt: "The same system that limits export also sets your voices.",
        },
        {
          href: "/use-cases/podcast-script-drafting",
          title: "Drafting a podcast script",
          excerpt: "How to use MK VoiceKit for a job that doesn't need export.",
        },
      ]}
    >
      <p>
        &ldquo;Can I download the audio?&rdquo; is the most common question about
        MK VoiceKit, so it deserves a straight, complete answer. No, you
        can&rsquo;t, and this guide explains exactly why &mdash; because the
        reason is a real technical limit, not a feature we&rsquo;re holding back
        to sell you.
      </p>

      <h2>How the reading actually happens</h2>
      <p>
        MK VoiceKit&rsquo;s core doesn&rsquo;t generate audio itself. It asks your
        browser&rsquo;s built-in speech engine &mdash; part of the Web Speech API
        &mdash; to say some text. The browser hands that request to your operating
        system, which produces the sound and sends it straight to your speakers.
        That&rsquo;s what makes the app free, private and able to work offline:
        the hard part is done by software you already have.
      </p>

      <h2>Why that means no file</h2>
      <p>
        The catch is that this pathway gives back <em>sound</em>, not{" "}
        <em>data</em>. The Web Speech API has no method that says &ldquo;render
        this to an audio buffer&rdquo; or &ldquo;save this as a file&rdquo;. It
        only has &ldquo;speak&rdquo;, &ldquo;pause&rdquo;, &ldquo;resume&rdquo;
        and &ldquo;stop&rdquo;. The audio never passes through a form the web page
        can capture, so there is simply nothing for a download button to save. You
        can hear it, but the app can&rsquo;t reach it.
      </p>

      <h2>The workarounds people ask about</h2>
      <p>
        A few clever-sounding ideas come up. They don&rsquo;t hold up:
      </p>
      <ul>
        <li>
          <strong>&ldquo;Just record the tab audio.&rdquo;</strong> Browsers
          deliberately don&rsquo;t let a page silently capture its own or the
          system&rsquo;s audio output &mdash; that would be a privacy problem. The
          workarounds are fragile, need explicit screen-capture permission, and
          produce a recording of whatever your speakers are doing, not a clean
          track.
        </li>
        <li>
          <strong>&ldquo;Route it through a virtual audio device.&rdquo;</strong>
          That&rsquo;s an operating-system-level hack that most people can&rsquo;t
          and shouldn&rsquo;t have to set up, and it still just records the
          speaker output.
        </li>
        <li>
          <strong>&ldquo;Grey out a download button until I upgrade.&rdquo;</strong>
          We won&rsquo;t do this. A disabled button implies the feature exists and
          is being withheld. It doesn&rsquo;t exist on this pathway, so pretending
          otherwise would be dishonest.
        </li>
      </ul>

      <h2>What we do instead</h2>
      <p>
        We say so plainly. There is no export button, no teaser, and no loophole
        dressed up as a feature. The <a href="/faq">FAQ</a> and the{" "}
        <a href="/docs">docs</a> state the limitation clearly so nobody arrives
        expecting something the technology can&rsquo;t deliver. Being honest about
        the boundary is more useful than a broken promise.
      </p>

      <h2>What would make export possible</h2>
      <p>
        Real downloadable audio needs a different engine: a server-side or neural
        text-to-speech service that synthesises the speech into an actual audio
        file, which can then be saved. Those services produce excellent results,
        but they change the shape of the product &mdash; they cost money to run,
        they mean sending your text to a server to be synthesised, and they end
        the &ldquo;works entirely in your browser&rdquo; promise. Adding a hosted
        voice option is on the list of possibilities for a future version, clearly
        as an option and clearly not promised.
      </p>

      <h2>How to work with the limit today</h2>
      <p>
        For the things most people actually want &mdash; listening to an article,
        studying from notes, proofreading a draft, previewing a script &mdash; you
        don&rsquo;t need a file. You keep the tab open and listen, and the{" "}
        <a href="/guides/building-a-listening-queue">queue</a> plays your sections
        through in order. If your real goal is a finished audio file, MK VoiceKit
        isn&rsquo;t the tool for that step, and it&rsquo;ll tell you so rather than
        waste your time.
      </p>
    </ArticleShell>
  );
}
