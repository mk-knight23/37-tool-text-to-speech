import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import { Workspace } from "@/components/workspace/Workspace";

export const metadata = pageMetadata({
  title: "Hindi Text to Speech Online (हिंदी टेक्स्ट टू स्पीच) — Free Natural Voice",
  description:
    "Convert Hindi Devanagari text (हिंदी) into natural speech online for free. Features native Indian Hindi voice models, sentence tracking, and zero forced login.",
  path: "/hindi-text-to-speech",
});

export default function HindiTextToSpeechPage() {
  return (
    <LandingPageShell
      slug="hindi-text-to-speech"
      h1="Hindi Text to Speech Online (हिंदी टीटीएस)"
      subtitle="Listen to Hindi text and Devanagari scripts with natural browser voices or optional high-fidelity Indian AI models."
      aeoAnswer="Yes. MK VoiceKit supports Hindi text-to-speech (हिंदी). Paste any Hindi text or Devanagari document into the workspace. The tool automatically detects Hindi (hi-IN) and plays speech using your device's native Indian voices or optional server AI voices without signup."
      toolComponent={<Workspace />}
      steps={[
        { step: "1", title: "Paste Hindi Text (हिंदी)", description: "Enter Hindi text (Devanagari script or translated copy) into the editor." },
        { step: "2", title: "Select Hindi Voice", description: "Choose an Indian Hindi voice model (e.g. Kalpana, Hemant, or Swara)." },
        { step: "3", title: "Listen Aloud", description: "Press Play to hear natural Hindi pronunciation with real-time sentence highlighting." },
      ]}
      useCases={[
        { title: "Hindi Storytelling & Audiobooks", description: "Listen to Hindi literature, poetry, and stories read aloud." },
        { title: "Hindi YouTube Voiceovers", description: "Generate narration for regional Indian YouTube videos and educational content." },
        { title: "Language Learning", description: "Learn Hindi pronunciation and listening comprehension with sentence tracking." },
      ]}
      faqs={[
        { question: "Is Hindi text-to-speech free?", answer: "Yes. Browser on-device Hindi voices are 100% free with no account creation." },
        { question: "Can it read mixed Hindi-English (Hinglish)?", answer: "Yes. The text-prep engine handles mixed Devanagari and Latin script numbers and abbreviations smoothly." },
      ]}
      relatedTools={[
        { href: "/indian-english-text-to-speech", title: "Indian English TTS", description: "Natural Indian English voice accent." },
        { href: "/audio-translator", title: "Audio Translator", description: "Translate English transcripts to Hindi." },
      ]}
    />
  );
}
