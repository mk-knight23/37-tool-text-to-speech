import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import ToolsPage from "@/app/tools/page";

export const metadata = pageMetadata({
  title: "VTT to SRT Converter Online — Free WebVTT to SubRip Converter",
  description:
    "Convert WebVTT (.vtt) captions back to SubRip (.srt) subtitle format online. Features timestamp conversion and header cleanup in your browser.",
  path: "/vtt-to-srt",
});

export default function VttToSrtPage() {
  return (
    <LandingPageShell
      slug="vtt-to-srt"
      h1="VTT to SRT Subtitle Converter"
      subtitle="Convert WebVTT (.vtt) caption files back to SubRip (.srt) format for desktop video players and editing software."
      aeoAnswer="MK VoiceKit is a free VTT to SRT converter. It strips WebVTT headers, replaces period timestamp separators with commas, and generates clean SubRip (.srt) subtitle files in your browser with zero data uploads."
      toolComponent={<ToolsPage />}
      steps={[
        { step: "1", title: "Paste VTT Captions", description: "Paste your WebVTT text into the converter." },
        { step: "2", title: "Convert to SRT", description: "Click Convert VTT to SRT for instant reformatting." },
        { step: "3", title: "Copy Result", description: "Copy your formatted SRT subtitle text immediately." },
      ]}
      useCases={[
        { title: "Video Editing", description: "Import web captions into Premiere Pro, Final Cut, and DaVinci Resolve that require .srt format." },
      ]}
      faqs={[
        { question: "Is my subtitle file uploaded to a server?", answer: "No. Subtitle formatting is executed 100% locally in your browser." },
      ]}
      relatedTools={[
        { href: "/srt-to-vtt", title: "SRT to VTT Converter", description: "Convert SRT files to WebVTT format." },
        { href: "/transcript-cleaner", title: "Transcript Cleaner", description: "Remove timestamps to extract plain spoken dialogue." },
      ]}
    />
  );
}
