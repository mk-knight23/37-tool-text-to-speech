import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import { Workspace } from "@/components/workspace/Workspace";

export const metadata = pageMetadata({
  title: "Indian English Text to Speech Online — Natural Indian Accent Voices",
  description:
    "Convert text into natural Indian English speech online for free. Features en-IN accent voice models, sentence tracking, and zero forced signup.",
  path: "/indian-english-text-to-speech",
});

export default function IndianEnglishTextToSpeechPage() {
  return (
    <LandingPageShell
      slug="indian-english-text-to-speech"
      h1="Indian English Text to Speech Online (en-IN)"
      subtitle="Listen to text and documents with natural Indian English accents, authentic rhythm, and complete privacy."
      aeoAnswer="Yes. MK VoiceKit supports Indian English text-to-speech (en-IN). Paste your script, choose an available Indian English voice from your browser or optional AI models, and listen aloud with sentence highlighting. No registration or credit card required."
      toolComponent={<Workspace />}
      steps={[
        { step: "1", title: "Paste Your Script", description: "Input English text, documents, or presentation notes." },
        { step: "2", title: "Select Indian English Voice", description: "Filter the voice picker by language to select Indian English (en-IN) voices like Ravi, Neerja, or Prabhat." },
        { step: "3", title: "Listen & Adjust Rate", description: "Press Play to hear clear Indian English speech with customized speed." },
      ]}
      useCases={[
        { title: "Indian Corporate Presentations", description: "Create natural, professional voiceovers for Indian business audiences." },
        { title: "E-Learning & Tech Tutorials", description: "Deliver engineering and software walk-throughs in familiar regional accents." },
      ]}
      faqs={[
        { question: "How do I find Indian English voices?", answer: "In the voice selector, filter by 'en-IN' or type 'India' to see all available on-device and AI Indian English voice models." },
      ]}
      relatedTools={[
        { href: "/hindi-text-to-speech", title: "Hindi Text to Speech", description: "Native Hindi voice synthesis." },
        { href: "/text-to-speech", title: "Global TTS Workspace", description: "Access all 40+ supported languages." },
      ]}
    />
  );
}
