import Link from "next/link";
import { SITE, ISSUES_URL } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata = pageMetadata({
  title: "Open source",
  description:
    "MK VoiceKit is open source under the MIT license. How to read the code, report issues, contribute, and what the project does and doesn't collect.",
  path: "/open-source",
});

export default function OpenSourcePage() {
  return (
    <StaticPage
      title="Open source"
      lede="MK VoiceKit is free and open source under the MIT license. Nothing is hidden — the whole app is on GitHub."
      path="/open-source"
      prose
    >
      <h2>The license</h2>
      <p>
        MK VoiceKit is released under the MIT license, copyright 2026 Kazi
        Musharraf. In short: you can use, copy, modify and redistribute it,
        including commercially, as long as the license and copyright notice come
        along for the ride. The full text is in the{" "}
        <a href={`${SITE.repo}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">
          LICENSE file
        </a>
        .
      </p>

      <h2>The code</h2>
      <p>
        The source lives at{" "}
        <a href={SITE.repo} target="_blank" rel="noopener noreferrer">
          github.com/mk-knight23/37-tool-text-to-speech
        </a>
        . It&rsquo;s a Next.js App Router project written in TypeScript, styled
        with Tailwind CSS v4, and tested with Vitest. The core speech features
        use the browser&rsquo;s Web Speech API; PDF text extraction uses pdf.js;
        local data is stored with IndexedDB. There is no database and no backend
        beyond a couple of optional serverless routes for the AI text tools.
      </p>

      <h2>Reporting a problem</h2>
      <p>
        If something is broken or behaves oddly, please open an issue. A useful
        report includes your browser and operating system, what you did, what
        you expected, and what happened instead. Because voices come from your
        system, mentioning which voice you used often matters.
      </p>
      <p>
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
          Open a new issue on GitHub
        </a>
        .
      </p>

      <h2>Contributing</h2>
      <p>
        Pull requests are welcome. For anything larger than a small fix, it helps
        to open an issue first so we can agree on the approach before you spend
        time on it. Please keep changes focused, add or update tests where it
        makes sense, and match the existing code style. The design system and
        product decisions are documented in the repository so contributions can
        stay consistent with them.
      </p>

      <h2>What the project collects</h2>
      <p>
        By default, nothing leaves your browser. Analytics are off unless you
        explicitly turn them on, and even then only anonymous usage counts are
        sent &mdash; never the text you paste, your file names, or any key. The{" "}
        <Link href="/privacy">privacy page</Link> spells this out in detail.
      </p>
    </StaticPage>
  );
}
