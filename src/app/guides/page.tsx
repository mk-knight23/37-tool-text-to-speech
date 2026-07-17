import { pageMetadata } from "@/lib/seo";
import { GUIDES } from "@/lib/content";
import { StaticPage } from "@/components/content/StaticPage";
import { ContentGrid } from "@/components/content/ContentGrid";

export const metadata = pageMetadata({
  title: "Guides",
  description:
    "How-to and explainer guides for MK VoiceKit: choosing a voice, keyboard navigation, importing subtitles and PDFs, preparing text, and why there's no audio download.",
  path: "/guides",
});

export default function GuidesIndexPage() {
  return (
    <StaticPage
      title="Guides"
      lede="Practical, product-specific guides to getting the most out of MK VoiceKit."
      path="/guides"
      width="wide"
    >
      <ContentGrid base="/guides" entries={GUIDES} />
    </StaticPage>
  );
}
