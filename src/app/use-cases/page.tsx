import { pageMetadata } from "@/lib/seo";
import { USE_CASES } from "@/lib/content";
import { StaticPage } from "@/components/content/StaticPage";
import { ContentGrid } from "@/components/content/ContentGrid";

export const metadata = pageMetadata({
  title: "Use cases",
  description:
    "Concrete ways people use MK VoiceKit: proofreading by ear, language learning with subtitles, studying from PDFs, accessible reading, and drafting a podcast script.",
  path: "/use-cases",
});

export default function UseCasesIndexPage() {
  return (
    <StaticPage
      title="Use cases"
      lede="Real scenarios and the workflow for each — from proofreading a draft to studying from a stack of PDFs."
      path="/use-cases"
      crumbLabel="Use cases"
      width="wide"
    >
      <ContentGrid base="/use-cases" entries={USE_CASES} />
    </StaticPage>
  );
}
