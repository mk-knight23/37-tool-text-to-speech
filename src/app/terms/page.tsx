import Link from "next/link";
import { SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata = pageMetadata({
  title: "Terms",
  description:
    "The plain-language terms for using MK VoiceKit: it's free and open source under the MIT license, provided as-is, and you're responsible for the content you process.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms of use"
      lede="MK VoiceKit is free and open source, provided as-is. These terms are short on purpose."
      path="/terms"
      prose
    >
      <p className="text-sm text-text-muted">Last updated: 17 July 2026.</p>

      <h2>The software</h2>
      <p>
        MK VoiceKit is open-source software released under the MIT license. Your
        rights to use, copy and modify the code are governed by that license,
        which you can read in the{" "}
        <a href={`${SITE.repo}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">
          repository
        </a>
        . These terms cover your use of the hosted website; the MIT license
        covers the code itself.
      </p>

      <h2>Provided as-is</h2>
      <p>
        The software is provided &ldquo;as is&rdquo;, without warranty of any
        kind, express or implied. It relies on the speech engine and voices built
        into your browser and operating system, which vary and are outside our
        control. To the maximum extent permitted by law, the author is not liable
        for any damages arising from your use of MK VoiceKit.
      </p>

      <h2>Your content</h2>
      <p>
        You are responsible for the text and files you process with MK VoiceKit
        and for having the right to use them. As explained in the{" "}
        <Link href="/privacy">privacy policy</Link>, your content stays on your
        device except when you choose to use an AI tool, in which case it is sent
        for processing and not stored. Don&rsquo;t use the tool for content you
        are not permitted to process.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Please don&rsquo;t attempt to disrupt the service, abuse the optional AI
        routes (for example by trying to circumvent rate limits), or use MK
        VoiceKit for anything unlawful. The AI tools carry small usage limits so
        the free tier stays available to everyone.
      </p>

      <h2>Availability</h2>
      <p>
        This is an independent open-source project offered free of charge. There
        is no uptime guarantee, and features may change or be removed. Because the
        core features run in your browser, you can always run your own copy from
        the source.
      </p>

      <h2>Changes</h2>
      <p>
        If these terms change, the date above will change too. Continuing to use
        the site after a change means you accept the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions can go to{" "}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> or the{" "}
        <a href={`${SITE.repo}/issues`} target="_blank" rel="noopener noreferrer">
          issue tracker
        </a>
        .
      </p>
    </StaticPage>
  );
}
