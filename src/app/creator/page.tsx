import { GitBranch, Globe } from "lucide-react";
import { SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { StaticPage } from "@/components/content/StaticPage";
import { JsonLd } from "@/components/content/JsonLd";

export const metadata = pageMetadata({
  title: "Creator",
  description:
    "MK VoiceKit is built and maintained by Kazi Musharraf — AI Engineer, Full-Stack Developer and open-source builder. Links to GitHub and portfolio.",
  path: "/creator",
});

function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.creator.name,
    jobTitle: "AI Engineer, Full-Stack Developer, Open-Source Builder",
    url: SITE.creator.portfolio,
    sameAs: [SITE.creator.github, SITE.creator.portfolio],
  };
}

export default function CreatorPage() {
  return (
    <>
      <JsonLd data={personJsonLd()} />
      <StaticPage
        title="Kazi Musharraf"
        lede={SITE.creator.role}
        path="/creator"
        crumbLabel="Creator"
        prose
      >
        <p>
          I&rsquo;m Kazi Musharraf, an AI engineer and full-stack developer who
          builds and ships small, useful tools in the open. MK VoiceKit is one
          of them: a browser text-to-speech workspace designed to be genuinely
          local-first and honest about its limits.
        </p>

        <p>
          I care about software that respects the person using it &mdash; tools
          that don&rsquo;t demand an account for basic features, don&rsquo;t send
          your data somewhere by default, and don&rsquo;t oversell what they can
          do. MK VoiceKit reflects that: the core reading features run entirely
          in your browser, and the one thing browsers can&rsquo;t do (hand back a
          saved audio file) is stated plainly rather than faked.
        </p>

        <h2>Elsewhere</h2>
        <ul className="flex list-none flex-col gap-2 pl-0">
          <li>
            <a
              href={SITE.creator.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <GitBranch className="size-4" aria-hidden="true" />
              github.com/mk-knight23
            </a>
          </li>
          <li>
            <a
              href={SITE.creator.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Globe className="size-4" aria-hidden="true" />
              www.mkazi.live
            </a>
          </li>
        </ul>

        <h2>This project</h2>
        <p>
          MK VoiceKit is free and open source under the MIT license. If you find
          a bug or have an idea, the best place to reach me about it is the{" "}
          <a href={`${SITE.repo}/issues`} target="_blank" rel="noopener noreferrer">
            issue tracker
          </a>
          . The full source is in the{" "}
          <a href={SITE.repo} target="_blank" rel="noopener noreferrer">
            repository
          </a>
          .
        </p>
      </StaticPage>
    </>
  );
}
