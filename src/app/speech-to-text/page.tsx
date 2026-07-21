import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import TranscribePage from "@/app/transcribe/page";

export const metadata = pageMetadata({
  title: "Free Speech to Text Online — Microphone Recording & Transcription",
  description:
    "Convert speech and audio into editable text with live microphone dictation, Whisper AI transcription, timestamps, speaker labels, and clean exports.",
  path: "/speech-to-text",
});

export default function SpeechToTextPage() {
  return (
    <LandingPageShell
      slug="speech-to-text"
      h1="Free Speech to Text & Voice Dictation Online"
      subtitle="Record with your microphone or upload audio/video files to generate clean, editable transcripts with timestamps and AI summaries."
      aeoAnswer="Yes. MK VoiceKit provides free speech-to-text online. You can record live speech through your microphone with Web Audio visualizers or upload audio/video files for fast Whisper AI transcription. Features include filler-word removal, timestamps, and multi-format exports."
      toolComponent={<TranscribePage />}
      steps={[
        { step: "1", title: "Record or Upload", description: "Click Start Recording to dictate live or upload an MP3, WAV, M4A, or MP4 file." },
        { step: "2", title: "Transcribe Speech", description: "Generate text using client-side Web Speech recognition or accurate server Whisper AI." },
        { step: "3", title: "Edit & Export", description: "Search, remove filler words, format timestamps, and export to TXT, Markdown, SRT, or PDF." },
      ]}
      useCases={[
        { title: "Meeting & Interview Notes", description: "Transcribe client calls and team meetings into structured action items." },
        { title: "Content Dictation", description: "Writers can speak ideas aloud and turn rambling voice memos into polished articles." },
        { title: "Subtitle & Caption Creation", description: "Generate synchronized SRT/VTT subtitle files for YouTube and video platforms." },
      ]}
      faqs={[
        { question: "What audio formats can I upload?", answer: "MP3, WAV, M4A, WebM, OGG, and MP4 video files are all supported." },
        { question: "Can I transcribe without an API key?", answer: "Yes! Live microphone dictation uses your browser's built-in Web Speech API for 100% free offline dictation." },
      ]}
      relatedTools={[
        { href: "/transcription", title: "Audio Transcription Tool", description: "Transcribe long audio files with speaker diarization." },
        { href: "/transcript-cleaner", title: "Transcript Cleaner", description: "Remove filler words and timestamps automatically." },
        { href: "/srt-to-vtt", title: "Subtitle Converter", description: "Convert SRT subtitles to VTT format." },
      ]}
    />
  );
}
