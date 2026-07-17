import Link from "next/link";
import { SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata = pageMetadata({
  title: "About",
  description:
    "What MK VoiceKit is, why it was built, and the principles behind it: local-first, honest about its limits, accessible, and open source.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <StaticPage
      title="About MK VoiceKit"
      lede="A text-to-speech workspace that runs in your browser, tells the truth about what it can and can't do, and keeps your text on your device."
      path="/about"
      prose
    >
      <h2>What it is</h2>
      <p>
        MK VoiceKit reads text aloud. You paste an article, drop in a PDF, or
        load a subtitle file; you pick a voice and adjust the speed; and the
        text is read back to you with the current sentence highlighted so you
        can follow along or find your place again. The reading itself is done by
        the speech engine already built into your browser, which is why there is
        no sign-up and nothing to install.
      </p>

      <h2>Why it exists</h2>
      <p>
        Plenty of tools will read text aloud, but many of them push you toward an
        account, upload your document to a server, or dangle a &ldquo;download
        the audio&rdquo; button that quietly needs a subscription. MK VoiceKit
        takes the opposite position. The core features work offline after the
        first load, your text never leaves the browser unless you explicitly use
        an AI tool, and where the browser can&rsquo;t do something we say so
        plainly instead of hiding it behind a disabled button.
      </p>

      <h2>The principles</h2>
      <ul>
        <li>
          <strong>Local-first.</strong> Speech is generated on your device.
          History, presets and the queue live in your browser&rsquo;s storage,
          and you can export or delete them whenever you like.
        </li>
        <li>
          <strong>Honest about limits.</strong> The browser speech engine gives
          us sound but no file, so there is no audio download &mdash; and we
          won&rsquo;t pretend otherwise. Scanned PDFs with no text layer
          can&rsquo;t be read either. Both are explained in the{" "}
          <Link href="/docs">docs</Link> and the <Link href="/faq">FAQ</Link>.
        </li>
        <li>
          <strong>Accessible by default.</strong> Full keyboard control,
          high-contrast highlighting, respect for reduced-motion settings, and a
          typeface chosen for readability.
        </li>
        <li>
          <strong>Open source.</strong> The whole thing is on{" "}
          <a href={SITE.repo} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>{" "}
          under the MIT license. Read it, fork it, or file an issue.
        </li>
      </ul>

      <h2>Who makes it</h2>
      <p>
        MK VoiceKit is built and maintained by{" "}
        <Link href="/creator">Kazi Musharraf</Link>. It&rsquo;s an independent
        open-source project, not a company product &mdash; there is no team page
        to pad out and no customer count to quote.
      </p>

      <h2>Where to go next</h2>
      <p>
        The quickest way to understand it is to{" "}
        <Link href="/tool">open the workspace</Link> and paste something in. If
        you&rsquo;d rather read first, the <Link href="/guides">guides</Link>{" "}
        cover the practical details and the{" "}
        <Link href="/use-cases">use cases</Link> show how people actually use it.
      </p>
    </StaticPage>
  );
}
