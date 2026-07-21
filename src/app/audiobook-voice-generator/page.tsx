import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import StudioPage from "@/app/studio/page";

export const metadata = pageMetadata({
  title: "Audiobook Voice Generator — Convert Books & Stories into Speech",
  description:
    "Turn ebooks, novels, and long-form stories into spoken audiobooks. Chapter markers, custom narration pauses, and natural speech pacing.",
  path: "/audiobook-voice-generator",
});

export default function AudiobookVoiceGeneratorPage() {
  return (
    <LandingPageShell
      slug="audiobook-voice-generator"
      h1="Audiobook Voice Generator & Story Studio"
      subtitle="Transform long-form text, ebooks, and novels into spoken audiobooks with chapter navigation and natural pauses."
      aeoAnswer="Yes. MK VoiceKit includes an Audiobook Voice Generator template. It handles long-form manuscripts, allows pacing adjustments for dramatic or calm storytelling, divides text into chapters, and calculates total listening time."
      toolComponent={<StudioPage />}
      steps={[
        { step: "1", title: "Load Book Chapter", description: "Import a chapter from PDF, Word DOCX, EPUB, or Markdown." },
        { step: "2", title: "Set Narration Tone", description: "Choose a soothing or dramatic voice model and set comfortable paragraph pauses." },
        { step: "3", title: "Listen & Export", description: "Review chapter playback or export the audiobook configuration." },
      ]}
      useCases={[
        { title: "Indie Authors & Writers", description: "Listen to your manuscript aloud to catch dialogue rhythm and pacing flaws." },
        { title: "Audiobook Creation", description: "Produce digital audiobooks from public domain literature or personal stories." },
      ]}
      faqs={[
        { question: "What is the best speaking speed for audiobooks?", answer: "Most audiobooks are narrated between 130 and 150 words per minute (0.85x to 1.0x rate) for clear comprehension." },
      ]}
      relatedTools={[
        { href: "/podcast-voice-generator", title: "Podcast Voice Studio", description: "Multi-speaker dialogue editor." },
        { href: "/document-reader", title: "Document Reader", description: "Read ebooks with Table of Contents navigation." },
      ]}
    />
  );
}
