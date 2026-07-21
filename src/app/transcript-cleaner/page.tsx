import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import ToolsPage from "@/app/tools/page";

export const metadata = pageMetadata({
  title: "Transcript Cleaner Online — Remove Timestamps, HTML & Filler Words",
  description:
    "Clean messy transcripts, remove subtitle timestamps, strip HTML tags, and eliminate repeated spaces and broken line breaks in your browser.",
  path: "/transcript-cleaner",
});

export default function TranscriptCleanerPage() {
  return (
    <LandingPageShell
      slug="transcript-cleaner"
      h1="Free Transcript Cleaner & Subtitle Formatter"
      subtitle="Strip timestamps from SRT/VTT files, remove repeated line breaks, and turn messy transcripts into continuous, readable text."
      aeoAnswer="Yes. Paste your raw transcript or subtitle file into MK VoiceKit and click Strip Timestamps or Clean Line Breaks. The tool removes all cue numbers, timecodes (00:00:00,000), HTML tags, and extra spaces, leaving you with clean, continuous spoken text."
      toolComponent={<ToolsPage />}
      steps={[
        { step: "1", title: "Paste Raw Transcript", description: "Paste messy interview transcripts, subtitle files, or web copy." },
        { step: "2", title: "Click Clean", description: "Select Remove Timestamps, Fix Line Breaks, or Remove Repeated Spaces." },
        { step: "3", title: "Copy Clean Text", description: "Copy your formatted, readable text ready for voiceovers or reading." },
      ]}
      useCases={[
        { title: "Podcast Transcript Cleanup", description: "Turn raw automated transcription output into a readable blog post." },
        { title: "Subtitle Dialogue Extraction", description: "Extract clean spoken scripts from movie and YouTube subtitle files." },
      ]}
      faqs={[
        { question: "Can it remove filler words?", answer: "Yes. The AI writing tools can also detect and eliminate 'um', 'uh', and repetitive filler phrases automatically." },
      ]}
      relatedTools={[
        { href: "/srt-to-vtt", title: "SRT to VTT Converter", description: "Reformat subtitle timecodes." },
        { href: "/text-to-speech", title: "Text to Speech", description: "Listen to your clean transcript read aloud." },
      ]}
    />
  );
}
