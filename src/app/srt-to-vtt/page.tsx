import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import ToolsPage from "@/app/tools/page";

export const metadata = pageMetadata({
  title: "SRT to VTT Converter Online — Free Subtitle Format Converter",
  description:
    "Convert SubRip (.srt) subtitle files to WebVTT (.vtt) format online in your browser. Fast, private, and 100% free with zero file upload limits.",
  path: "/srt-to-vtt",
});

export default function SrtToVttPage() {
  return (
    <LandingPageShell
      slug="srt-to-vtt"
      h1="SRT to VTT Subtitle Converter"
      subtitle="Convert SubRip (.srt) subtitle files into WebVTT (.vtt) format for HTML5 video players and web streaming."
      aeoAnswer="Yes. Paste your .srt subtitle text or upload a subtitle file into MK VoiceKit and click Convert SRT to VTT. The tool adds the WEBVTT header and replaces comma decimal separators with dots (00:01:20,000 to 00:01:20.000) instantly in your browser."
      toolComponent={<ToolsPage />}
      steps={[
        { step: "1", title: "Paste SRT Subtitles", description: "Paste your raw SRT subtitle text into the converter box." },
        { step: "2", title: "Click Convert", description: "The converter formats timestamps into standard WebVTT format in milliseconds." },
        { step: "3", title: "Copy or Download", description: "Copy your clean WebVTT subtitle text to the clipboard." },
      ]}
      useCases={[
        { title: "HTML5 Web Video", description: "Prepare subtitles for modern HTML5 video tags requiring WebVTT format." },
        { title: "Video Streaming Platforms", description: "Format captions for video hosting services that require .vtt files." },
      ]}
      faqs={[
        { question: "What is the difference between SRT and VTT?", answer: "SRT uses comma decimal separators for milliseconds (00:00:01,500), while WebVTT uses periods (00:00:01.500) and begins with a 'WEBVTT' header." },
      ]}
      relatedTools={[
        { href: "/vtt-to-srt", title: "VTT to SRT Converter", description: "Convert WebVTT files back into standard SRT subtitles." },
        { href: "/transcript-cleaner", title: "Transcript Cleaner", description: "Strip timestamps to turn subtitles into continuous text." },
      ]}
    />
  );
}
