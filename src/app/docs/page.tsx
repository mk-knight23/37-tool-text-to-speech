import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { StaticPage } from "@/components/content/StaticPage";
import { GUIDES } from "@/lib/content";

export const metadata = pageMetadata({
  title: "Docs",
  description:
    "MK VoiceKit documentation: getting started, supported inputs, playback controls, keyboard shortcuts, the browser support matrix, the AI tools, and the audio-export limitation.",
  path: "/docs",
});

const TOC = [
  { href: "#getting-started", label: "Getting started" },
  { href: "#inputs", label: "Supported inputs" },
  { href: "#controls", label: "Playback and controls" },
  { href: "#keyboard", label: "Keyboard shortcuts" },
  { href: "#text-prep", label: "Text preparation" },
  { href: "#ai-tools", label: "AI text tools" },
  { href: "#browser-support", label: "Browser support" },
  { href: "#no-export", label: "The audio-export limitation" },
  { href: "#privacy", label: "Privacy and data" },
];

export default function DocsPage() {
  return (
    <StaticPage
      title="Documentation"
      lede="Everything MK VoiceKit does, how to use it, and where its limits are — written plainly."
      path="/docs"
      crumbLabel="Docs"
    >
      <nav
        aria-label="On this page"
        className="mb-8 rounded-xl border border-border bg-surface-sunken p-5"
      >
        <h2 className="text-xs font-bold uppercase tracking-wide text-text-muted">
          On this page
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {TOC.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="text-primary hover:underline">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="vk-prose">
        <h2 id="getting-started">Getting started</h2>
        <p>
          Open the <Link href="/tool">workspace</Link>, paste some text into the
          editor (or import a file), pick a voice, and press play. That&rsquo;s
          the whole loop. There&rsquo;s no account, no install, and after the
          first load the reading features work offline. Your history, presets and
          queue are saved on your device so you can pick up where you left off.
        </p>

        <h2 id="inputs">Supported inputs</h2>
        <p>You can bring text into the workspace four ways:</p>
        <ul>
          <li>
            <strong>Plain text</strong> &mdash; type or paste directly. There&rsquo;s
            a soft ceiling of about 100,000 characters with a live count.
          </li>
          <li>
            <strong>Markdown</strong> &mdash; formatting is stripped to speakable
            text, and headings are treated as candidate chapter breaks.
          </li>
          <li>
            <strong>PDF</strong> &mdash; text is extracted in your browser. PDFs
            that are just scanned images have no text layer and can&rsquo;t be
            read (no OCR). See{" "}
            <Link href="/guides/pdf-to-speech">Listening to a PDF</Link>.
          </li>
          <li>
            <strong>Subtitles (.srt / .vtt)</strong> and{" "}
            <strong>.txt</strong> &mdash; timestamps, cue numbers and styling are
            stripped and the cues are joined into sentences. Files over 10&nbsp;MB
            are rejected with a clear message. See{" "}
            <Link href="/guides/importing-subtitles">Turning subtitles into speech</Link>.
          </li>
        </ul>
        <p>All parsing happens on your device; files are never uploaded.</p>

        <h2 id="controls">Playback and controls</h2>
        <p>
          Play, pause, resume and stop are all in the playback bar, along with
          controls to move to the previous or next sentence or paragraph. Three
          sliders set speed (0.5&ndash;3&times;), pitch (0.5&ndash;2) and volume,
          each with a numeric readout. As text is read, the current sentence is
          highlighted; where your browser reports word timing, the current word
          is highlighted too. Click any sentence to start reading from there.
        </p>

        <h2 id="keyboard">Keyboard shortcuts</h2>
        <p>
          MK VoiceKit is fully keyboard-operable. The essentials:
        </p>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>Space</code></td><td>Play or pause (ignored while typing in a field)</td></tr>
            <tr><td><code>Esc</code></td><td>Stop</td></tr>
            <tr><td><code>&larr;</code> / <code>&rarr;</code></td><td>Previous / next sentence</td></tr>
            <tr><td><code>Shift</code> + <code>&larr;</code> / <code>&rarr;</code></td><td>Previous / next paragraph</td></tr>
            <tr><td><code>&uarr;</code> / <code>&darr;</code></td><td>Increase / decrease speed</td></tr>
            <tr><td><code>?</code></td><td>Open the shortcuts dialog</td></tr>
          </tbody>
        </table>
        <p>
          Every shortcut in the in-app dialog actually works. For the full walk-through,
          read{" "}
          <Link href="/guides/navigating-text-by-keyboard">Navigating text by keyboard</Link>.
        </p>

        <h2 id="text-prep">Text preparation</h2>
        <p>
          Speech engines stumble over numbers, abbreviations and dense
          punctuation. The text-prep panel offers three toggles &mdash; number
          expansion, abbreviation expansion, and punctuation smoothing &mdash;
          each with a before/after preview. These transforms run entirely in your
          browser and are clearly labelled as local processing, not AI. Details
          are in{" "}
          <Link href="/guides/text-prep-for-natural-speech">
            Preparing text so it sounds natural
          </Link>
          .
        </p>

        <h2 id="ai-tools">AI text tools</h2>
        <p>
          The optional AI tools can rewrite, simplify, summarise, translate,
          change reading level, generate chapters, turn notes into narration,
          draft a podcast script, format multi-speaker dialogue, or suggest
          pronunciations. They are separate from the reading features and are
          never required. Without an AI service configured they show an honest
          &ldquo;AI unavailable&rdquo; state; they never fabricate output. There
          is a small daily free limit, and you can add your own key to lift it.
          See{" "}
          <Link href="/guides/using-the-ai-text-tools">Using the optional AI text tools</Link>.
        </p>

        <h2 id="browser-support">Browser support</h2>
        <p>
          MK VoiceKit relies on the Web Speech API. Support is broad, but the
          voices and some features depend on your browser and operating system.
        </p>
        <table>
          <thead>
            <tr>
              <th>Browser</th>
              <th>Speech</th>
              <th>Word highlighting</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Chrome / Edge</td><td>Yes</td><td>Usually</td><td>Voices load asynchronously; wide selection on Windows and macOS.</td></tr>
            <tr><td>Safari (macOS / iOS)</td><td>Yes</td><td>Sometimes</td><td>High-quality system voices; word boundary events are less consistent.</td></tr>
            <tr><td>Firefox</td><td>Yes</td><td>Rarely</td><td>Falls back to sentence-only highlighting where word timing isn&rsquo;t reported.</td></tr>
          </tbody>
        </table>
        <p>
          Why the differences exist is covered in{" "}
          <Link href="/guides/browser-voice-differences">Why voices differ between browsers</Link>.
        </p>

        <h2 id="no-export">The audio-export limitation</h2>
        <p>
          There is no MP3 or audio download, and there won&rsquo;t be one while
          the app depends solely on the browser speech engine. That engine plays
          audio to your speakers but exposes no captured stream or file to save.
          Rather than grey out a teaser button or route audio through fragile
          loopback hacks, MK VoiceKit simply doesn&rsquo;t offer it. The full
          reasoning is in{" "}
          <Link href="/guides/why-no-mp3-export">Why there&rsquo;s no MP3 download</Link>.
        </p>

        <h2 id="privacy">Privacy and data</h2>
        <p>
          Your text stays on your device except when you explicitly run an AI
          tool, in which case it is processed and not stored. History, presets
          and the queue live in your browser and can be exported or cleared in{" "}
          <Link href="/settings">Settings</Link>. Analytics are off by default.
          The full policy is on the{" "}
          <Link href="/privacy">privacy page</Link>.
        </p>
      </div>

      <section aria-labelledby="all-guides" className="mt-12">
        <h2 id="all-guides" className="text-xl font-bold">
          Guides
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {GUIDES.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guides/${guide.slug}`}
                className="block h-full rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary"
              >
                <span className="font-bold text-text">{guide.title}</span>
                <span className="mt-1 block text-sm text-text-muted">
                  {guide.excerpt}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </StaticPage>
  );
}
