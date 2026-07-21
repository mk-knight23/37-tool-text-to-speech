import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import TranscribePage from "@/app/transcribe/page";

export const metadata = pageMetadata({
  title: "Free Audio Transcription Tool — Transcribe Audio & Video to Text",
  description:
    "Transcribe audio and video files into clean text online. Features timestamps, speaker labels, filler-word removal, and AI meeting summaries.",
  path: "/transcription",
});

export default function TranscriptionLandingPage() {
  return (
    <LandingPageShell
      slug="transcription"
      h1="Free Audio & Video Transcription Tool"
      subtitle="Turn audio recordings, podcast episodes, interviews, and videos into structured text, summaries, and action items."
      aeoAnswer="MK VoiceKit is a free audio transcription tool that converts audio and video files into editable text. It supports microphone recording, MP3/WAV/MP4 file uploads, Whisper AI transcription, automatic punctuation, filler-word removal, and SRT/VTT subtitle export."
      toolComponent={<TranscribePage />}
      steps={[
        { step: "1", title: "Upload Audio or Video", description: "Select any recorded audio or video file from your device." },
        { step: "2", title: "Generate Transcript", description: "Receive a timestamped transcript with optional speaker labels." },
        { step: "3", title: "Summarize & Export", description: "Extract meeting summaries, decisions, action items, or export to PDF/SRT/VTT." },
      ]}
      useCases={[
        { title: "Podcast Transcripts", description: "Publish accessible, SEO-friendly transcripts for every podcast episode." },
        { title: "Journalism & Interviews", description: "Transcribe recorded interviews and search for quotes in seconds." },
      ]}
      faqs={[
        { question: "How accurate is the transcription?", answer: "When using the Whisper AI engine, transcription accuracy exceeds 95% across 50+ languages." },
        { question: "Is there a file upload limit?", answer: "Standard browser uploads handle audio and video files up to 25 MB smoothly." },
      ]}
      relatedTools={[
        { href: "/speech-to-text", title: "Speech to Text", description: "Live microphone dictation in your browser." },
        { href: "/assisted-dubbing", title: "Assisted Dubbing", description: "Translate audio transcripts into foreign language voice tracks." },
      ]}
    />
  );
}
