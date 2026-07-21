import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import StudioPage from "@/app/studio/page";

export const metadata = pageMetadata({
  title: "AI Voiceover Generator Online — Create Natural Video Narration",
  description:
    "Generate professional voiceovers for YouTube videos, commercials, presentations, and tutorials. Multi-speaker studio with background audio ducking.",
  path: "/voiceover-generator",
});

export default function VoiceoverGeneratorPage() {
  return (
    <LandingPageShell
      slug="voiceover-generator"
      h1="AI Voiceover Generator for Videos & Media"
      subtitle="Create natural voiceover audio with multi-scene sequencing, character voices, and background music ducking."
      aeoAnswer="MK VoiceKit is an AI voiceover generator designed for video creators. It features a multi-scene timeline where creators can assign distinct voices, speeds, and pitches to different characters, add background music with automatic ducking, and export audio or subtitles."
      toolComponent={<StudioPage />}
      steps={[
        { step: "1", title: "Build Your Scenes", description: "Break your video script into scenes or choose a pre-built template." },
        { step: "2", title: "Assign Voices & Tone", description: "Select individual voices for each scene or speaker." },
        { step: "3", title: "Preview & Export", description: "Listen to the complete timeline with background audio and export your voiceover." },
      ]}
      useCases={[
        { title: "Product Demos & SaaS Videos", description: "Deliver crisp, energetic explanations of software features." },
        { title: "YouTube Video Narration", description: "Narrate documentary-style videos and faceless channel content." },
      ]}
      faqs={[
        { question: "Can I assign multiple speakers?", answer: "Yes! The Voice Studio lets you assign different voices to every scene block in your project." },
        { question: "Can I add background music?", answer: "Yes, you can upload background audio and set custom volume ducking during speech." },
      ]}
      relatedTools={[
        { href: "/youtube-voiceover", title: "YouTube Voiceover Generator", description: "Format scripts specifically for YouTube videos." },
        { href: "/podcast-voice-generator", title: "Podcast Voice Generator", description: "Create multi-speaker podcast intros and episodes." },
      ]}
    />
  );
}
