import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import { Workspace } from "@/components/workspace/Workspace";

export const metadata = pageMetadata({
  title: "Online Document Reader — Read Word DOCX, PDF & Markdown Aloud",
  description:
    "Listen to PDF, Word DOCX, EPUB, TXT, and Markdown files in your browser. Features bookmarking, note-taking, AI document Q&A, and full offline privacy.",
  path: "/document-reader",
});

export default function DocumentReaderLandingPage() {
  return (
    <LandingPageShell
      slug="document-reader"
      h1="Online Document Reader & Voice Assistant"
      subtitle="Transform documents into spoken audio with table of contents navigation, bookmarks, and AI-powered document citations."
      aeoAnswer="MK VoiceKit is a free document reader that converts PDF, Word DOCX, Markdown, EPUB, and text files into spoken audio. It runs locally in the browser with sentence highlighting, bookmarking, and interactive document Q&A that cites specific page numbers and headings."
      toolComponent={<Workspace />}
      steps={[
        { step: "1", title: "Import Document", description: "Select any PDF, Word (.docx), EPUB, Markdown, or subtitle file from your computer." },
        { step: "2", title: "Navigate Headings", description: "Use the Table of Contents sidebar to jump directly to any chapter or section." },
        { step: "3", title: "Listen & Ask Questions", description: "Listen to the text or use Document Q&A to ask questions with cited page references." },
      ]}
      useCases={[
        { title: "Long-Form Study", description: "Students can listen to course materials and textbooks while highlighting key takeaways." },
        { title: "Report Review", description: "Business analysts can listen to market research and draft documents hands-free." },
      ]}
      faqs={[
        { question: "What document formats are supported?", answer: "PDF, Word DOCX, Markdown (.md), Plain Text (.txt), EPUB, Subtitles (.srt, .vtt), and public webpage URLs." },
        { question: "Do documents leave my computer?", answer: "No. Document parsing and speech synthesis happen entirely within your local browser sandbox." },
      ]}
      relatedTools={[
        { href: "/pdf-reader", title: "PDF Reader", description: "Extract and read PDF text aloud." },
        { href: "/reader", title: "Full Reader Workspace", description: "Dedicated side-by-side document reading workspace." },
      ]}
    />
  );
}
