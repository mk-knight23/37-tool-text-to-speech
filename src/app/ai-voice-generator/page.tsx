import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import { Workspace } from "@/components/workspace/Workspace";

export const metadata = pageMetadata({
  title: "Free AI Voice Generator — Natural Text to Speech Online",
  description:
    "Generate natural AI voices and high-quality voiceovers from text. Supports browser TTS and optional premium AI providers with downloadable MP3 audio.",
  path: "/ai-voice-generator",
});

export default function AiVoiceGeneratorPage() {
  return (
    <LandingPageShell
      slug="ai-voice-generator"
      h1="Free AI Voice Generator Online"
      subtitle="Create natural voiceovers, narration, and spoken scripts using free browser voices or optional server AI models."
      aeoAnswer="MK VoiceKit is a free AI voice generator and text-to-speech workspace. It lets users convert text and documents into natural speech using free on-device browser voices or optional premium AI voice providers like OpenAI, ElevenLabs, and Google Cloud."
      toolComponent={<Workspace />}
      steps={[
        { step: "1", title: "Enter Your Script", description: "Type, paste, or import your script into the voice generator workspace." },
        { step: "2", title: "Select Voice Model", description: "Choose an on-device browser voice or configure an optional AI provider key." },
        { step: "3", title: "Listen & Export", description: "Preview speech with sentence highlighting or generate downloadable audio." },
      ]}
      useCases={[
        { title: "YouTube Voiceovers", description: "Produce clean, engaging narration for YouTube videos and shorts." },
        { title: "Podcast Narration", description: "Create multi-speaker dialogue and podcast intros with custom timing." },
        { title: "E-Learning & Tutorials", description: "Generate clear educational voiceovers for product demos and courses." },
        { title: "Commercial Audio", description: "Draft persuasive ad copy and listen to tone variations before publishing." },
      ]}
      faqs={[
        { question: "What AI voice providers are supported?", answer: "MK VoiceKit supports on-device browser synthesis for free offline playback, as well as OpenAI, ElevenLabs, Google Cloud TTS, Azure Speech, and Amazon Polly for premium server generation." },
        { question: "How much does it cost?", answer: "Browser voice generation is 100% free forever. If using premium server AI providers, you can bring your own API key to pay standard provider rates with zero markup." },
      ]}
      relatedTools={[
        { href: "/voiceover-generator", title: "Voiceover Generator", description: "Format scripts and generate natural video narration." },
        { href: "/podcast-voice-generator", title: "Podcast Voice Generator", description: "Create episodic podcast audio and interviews." },
        { href: "/studio", title: "Multi-Speaker Voice Studio", description: "Timeline sequencer for multi-character dialogue." },
      ]}
    />
  );
}
