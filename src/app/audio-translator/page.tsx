import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import TranscribePage from "@/app/transcribe/page";

export const metadata = pageMetadata({
  title: "Audio Translator Online — Translate Speech, Transcripts & Audio",
  description:
    "Translate audio transcripts and speech into 50+ languages with side-by-side verification, duration matching, and multilingual voice generation.",
  path: "/audio-translator",
});

export default function AudioTranslatorPage() {
  return (
    <LandingPageShell
      slug="audio-translator"
      h1="Free Audio Translator & Multilingual Voice Studio"
      subtitle="Transcribe recorded audio, translate transcripts into target languages with tone preservation, and generate translated voice tracks."
      aeoAnswer="MK VoiceKit is a free audio translator that transcribes spoken audio into text, translates the transcript into over 50 languages preserving tone and brand names, and generates synchronized voice tracks with duration matching."
      toolComponent={<TranscribePage />}
      steps={[
        { step: "1", title: "Upload Audio", description: "Upload your foreign or native audio recording or dictate live." },
        { step: "2", title: "Transcribe & Select Language", description: "Generate a transcript and choose your desired target translation language." },
        { step: "3", title: "Review Translation & Listen", description: "Inspect side-by-side translations and generate translated voiceover audio." },
      ]}
      useCases={[
        { title: "Multilingual Content Creators", description: "Translate English YouTube voiceovers into Spanish, Hindi, French, and Japanese." },
        { title: "Global Business Meetings", description: "Translate international client meetings and generate translated summaries." },
      ]}
      faqs={[
        { question: "How many languages are supported?", answer: "Over 50 languages including Spanish, French, German, Hindi, Japanese, Chinese, Arabic, and Portuguese." },
      ]}
      relatedTools={[
        { href: "/assisted-dubbing", title: "Assisted Dubbing", description: "10-step guided voice and video dubbing workflow." },
        { href: "/speech-to-text", title: "Speech to Text", description: "Microphone recording and transcription." },
      ]}
    />
  );
}
