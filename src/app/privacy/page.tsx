import Link from "next/link";
import { SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata = pageMetadata({
  title: "Privacy",
  description:
    "What MK VoiceKit does and doesn't do with your data. Your text stays in your browser; the only time it leaves is when you explicitly use an AI tool.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy"
      lede="The short version: your text stays on your device. The only time it leaves is when you deliberately run an AI tool, and even then it isn't stored."
      path="/privacy"
      prose
    >
      <p className="text-sm text-text-muted">Last updated: 17 July 2026.</p>

      <h2>What stays on your device</h2>
      <p>
        The core of MK VoiceKit runs entirely in your browser. When you paste or
        import text, it is read aloud by the speech engine built into your
        browser and operating system &mdash; nothing is uploaded to do that. The
        text you type, the files you open, and your history, presets and listening
        queue are all stored locally using your browser&rsquo;s IndexedDB and,
        for small preferences, localStorage. None of it is sent to a server, and
        you can export or erase all of it from{" "}
        <Link href="/settings">Settings</Link> at any time.
      </p>

      <h2>Files you import</h2>
      <p>
        PDF text extraction and subtitle parsing happen on your device using
        code that runs in your browser. The file itself is never uploaded. Once
        you close or refresh the page, imported file contents exist only in
        whatever you chose to save to local history.
      </p>

      <h2>When text does leave: the AI tools</h2>
      <p>
        The optional AI tools (rewrite, simplify, summarise, translate and the
        rest) are the one exception. When &mdash; and only when &mdash; you press
        Run on one of them, the text you selected is sent to an AI model through a
        serverless route so it can be processed. That request is not logged with
        its contents and the text is not stored on any server: it is used to
        generate the response and then discarded. If you would rather not send
        text anywhere, simply don&rsquo;t use the AI tools; everything else keeps
        working.
      </p>
      <p>
        If you supply your own AI key (&ldquo;bring your own key&rdquo;), that key
        is kept on your device, sent only with a request you start yourself via a
        request header, and never logged or saved on a server.
      </p>

      <h2>Analytics</h2>
      <p>
        MK VoiceKit uses no analytics unless a measurement container is
        configured for the deployment <em>and</em> you explicitly opt in on the
        cookie banner (the default is declined). If you never opt in, no
        third-party analytics script is loaded at all. When analytics are on,
        only anonymous, non-identifying signals are sent &mdash; event names,
        counts, bucketed sizes and durations. We never send the text you paste,
        your file names, the names of voices, or any key or credential. You can
        change your choice any time on the <Link href="/cookies">cookies page</Link>{" "}
        or in <Link href="/settings">Settings</Link>.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        MK VoiceKit does not set tracking cookies. It uses your browser&rsquo;s
        local storage to remember your preferences, history and consent choice.
        If analytics are enabled and you opt in, the analytics provider may set
        its own cookies; declining prevents that. See the{" "}
        <Link href="/cookies">cookies page</Link> for detail.
      </p>

      <h2>No accounts</h2>
      <p>
        There are no accounts, so there is no email list, no profile, and no
        password to look after. There is nothing for us to lose because we
        don&rsquo;t hold it.
      </p>

      <h2>Children</h2>
      <p>
        MK VoiceKit is a general-purpose reading tool and is not directed at
        children. Because it collects no personal information by default, it does
        not knowingly gather data from anyone, including children.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes, the date at the top will change with it and the
        update will be noted in the <Link href="/changelog">changelog</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy can go to{" "}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> or the{" "}
        <a href={`${SITE.repo}/issues`} target="_blank" rel="noopener noreferrer">
          issue tracker
        </a>
        .
      </p>
    </StaticPage>
  );
}
