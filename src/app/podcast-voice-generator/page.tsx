import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import StudioPage from "@/app/studio/page";

export const metadata = pageMetadata({
  title: "AI Podcast Voice Generator — Multi-Speaker Podcast Creator",
  description:
    "Produce two-person podcasts, interviews, show intros, and audio episodes with AI voice synthesis and background music mixing.",
  path: "/podcast-voice-generator",
});

export default function PodcastVoiceGeneratorPage() {
  return (
    <LandingPageShell
      slug="podcast-voice-generator"
      h1="AI Podcast Voice Generator & Studio"
      subtitle="Create two-person podcast dialogues, episodic show intros, and interview audio with multi-character voice sequencing."
      aeoAnswer="Yes. MK VoiceKit includes a multi-speaker Podcast Voice Generator with pre-built templates for two-person podcasts and interviews. Users can sequence host and guest dialogue, control scene pauses, and mix background intro music with automatic speech ducking."
      toolComponent={<StudioPage />}
      steps={[
        { step: "1", title: "Select Podcast Template", description: "Choose the Two-Person Podcast or Interview starter template." },
        { step: "2", title: "Input Host & Guest Lines", description: "Type or paste dialogue and assign distinct voices to each speaker." },
        { step: "3", title: "Mix Music & Export", description: "Add background podcast intro music and export your episode or speaker-labelled script." },
      ]}
      useCases={[
        { title: "Solo Podcasters", description: "Create conversational banter and co-host segments without hiring a second speaker." },
        { title: "Show Intros & Outros", description: "Generate polished recurring audio segments with professional theme music." },
      ]}
      faqs={[
        { question: "Can I export speaker-labelled scripts?", answer: "Yes, you can export your project as JSON, plain text with speaker labels, or synchronized subtitles." },
      ]}
      relatedTools={[
        { href: "/audiobook-voice-generator", title: "Audiobook Generator", description: "Generate long-form narration with chapter markers." },
        { href: "/voiceover-generator", title: "Voiceover Generator", description: "Create voice narration for multimedia content." },
      ]}
    />
  );
}
