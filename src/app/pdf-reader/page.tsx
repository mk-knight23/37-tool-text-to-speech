import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import { Workspace } from "@/components/workspace/Workspace";

export const metadata = pageMetadata({
  title: "Read PDF Aloud Online — Free PDF Text-to-Speech Reader",
  description:
    "Upload any PDF document and listen to it read aloud in your browser. Features client-side text extraction, table of contents navigation, and zero server uploads.",
  path: "/pdf-reader",
});

export default function PdfReaderPage() {
  return (
    <LandingPageShell
      slug="pdf-reader"
      h1="Read PDF Aloud Online for Free"
      subtitle="Extract text from PDF documents client-side and listen with on-device voices, table of contents navigation, and progress tracking."
      aeoAnswer="Yes. Upload any digital PDF into MK VoiceKit. The application extracts the readable text layer client-side using pdfjs-dist and reads it aloud with your choice of browser voice. Your PDF is processed locally on your device and is never uploaded to external servers."
      toolComponent={<Workspace />}
      steps={[
        { step: "1", title: "Drop Your PDF", description: "Drag and drop your PDF file into the upload zone or click Import Documents." },
        { step: "2", title: "Text Extraction", description: "Readable text is extracted in milliseconds in your browser with heading detection." },
        { step: "3", title: "Listen & Follow Along", description: "Press Play to listen with sentence highlighting and adjustable reading speeds." },
      ]}
      useCases={[
        { title: "Academic Research & Study", description: "Listen to scientific papers, journal articles, and textbooks while taking notes." },
        { title: "Legal & Business Review", description: "Review lengthy PDF contracts and corporate reports hands-free." },
        { title: "Accessibility Reading", description: "Empower dyslexic and visually impaired readers with customizable line spacing and focus rulers." },
      ]}
      faqs={[
        { question: "Can MK VoiceKit read scanned PDFs?", answer: "MK VoiceKit extracts digital text layers. Scanned PDFs containing only images without embedded text require OCR before they can be read aloud." },
        { question: "Is there a PDF file size limit?", answer: "Because parsing runs in your browser, files up to 50 MB with thousands of pages are processed smoothly without server upload timeouts." },
      ]}
      relatedTools={[
        { href: "/document-reader", title: "Document Reader", description: "Read Word DOCX, EPUB, and Markdown documents aloud." },
        { href: "/reader", title: "Full Document Viewer", description: "Open documents with Table of Contents and Q&A citations." },
        { href: "/words-to-minutes", title: "Speech Duration Timer", description: "Estimate reading and listening time for your PDF." },
      ]}
    />
  );
}
