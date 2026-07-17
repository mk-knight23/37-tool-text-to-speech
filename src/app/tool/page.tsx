import { pageMetadata } from "@/lib/seo";
import { Workspace } from "@/components/workspace/Workspace";

export const metadata = pageMetadata({
  title: "Text-to-speech workspace",
  description:
    "Paste or import text, PDFs and subtitles, pick a voice, and listen with live sentence highlighting, chapters and full keyboard control. Runs entirely in your browser.",
  path: "/tool",
});

export default function ToolPage() {
  return <Workspace />;
}
