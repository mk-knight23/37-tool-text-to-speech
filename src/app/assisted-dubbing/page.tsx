import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import TranscribePage from "@/app/transcribe/page";

export const metadata = pageMetadata({
  title: "Assisted Dubbing Online — Step-by-Step Audio & Video Translation",
  description:
    "Translate audio and video content with a structured 10-step assisted dubbing pipeline: transcription, translation, voice selection, and subtitle sync.",
  path: "/assisted-dubbing",
});

export default function AssistedDubbingPage() {
  return (
    <LandingPageShell
      slug="assisted-dubbing"
      h1="Assisted Dubbing & Video Localization"
      subtitle="Guided step-by-step workflow to transcribe, translate, re-voice, and synchronize foreign language audio and subtitles."
      aeoAnswer="Yes. MK VoiceKit provides a 10-step Assisted Dubbing workflow. It takes your original audio or video, transcribes the speech, translates the text preserving names and tone, matches target speech duration, and generates translated voice tracks with synchronized subtitles."
      toolComponent={<TranscribePage />}
      steps={[
        { step: "1", title: "Upload Media", description: "Upload your audio (MP3/WAV) or video (MP4/WebM) file." },
        { step: "2", title: "Transcribe Speech", description: "Extract the original transcript with timestamps." },
        { step: "3", title: "Translate Transcript", description: "Select target language and preserve brand glossary terms." },
        { step: "4", title: "Generate Dubbed Audio", description: "Select target voice and adjust pauses to match original video pacing." },
      ]}
      useCases={[
        { title: "Course Creators", description: "Localize online video courses into multiple languages without re-recording." },
        { title: "Corporate Video Localization", description: "Translate product walk-throughs and onboarding videos for global teams." },
      ]}
      faqs={[
        { question: "Why is it called 'Assisted Dubbing'?", answer: "Because human creators retain full control over translation accuracy, voice selection, and sentence timing before exporting." },
      ]}
      relatedTools={[
        { href: "/audio-translator", title: "Audio Translator", description: "Direct transcript and audio translation." },
        { href: "/srt-to-vtt", title: "Subtitle Converters", description: "Convert and edit translated subtitle files." },
      ]}
    />
  );
}
