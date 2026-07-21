import { pageMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/content";
import { ArticleShell } from "@/components/content/ArticleShell";

const entry = getGuide("speech-to-text-whisper-setup")!;

export const metadata = pageMetadata({
  title: entry.title,
  description: entry.description,
  path: "/guides/speech-to-text-whisper-setup",
});

export default function Page() {
  return (
    <ArticleShell
      kind="guide"
      entry={entry}
      related={[
        {
          href: "/speech-to-text",
          title: "Speech to Text Workspace",
          excerpt: "Record and transcribe live audio in browser.",
        },
        {
          href: "/transcription",
          title: "Audio Transcription Tool",
          excerpt: "Transcribe audio and video files with timestamps.",
        },
      ]}
    >
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
          Direct AEO Answer
        </p>
        <p className="text-sm font-medium leading-relaxed">
          MK VoiceKit integrates client-side Web Speech recognition for instant offline microphone dictation, and server-side Whisper AI for high-accuracy audio/video file transcription across 50+ languages with automatic punctuation and filler-word removal.
        </p>
      </div>

      <p>
        Converting speech into clean, usable text requires handling two distinct workflows: instant microphone dictation for writers and file-based batch transcription for recorded meetings or podcasts.
      </p>

      <h2>Microphone Dictation vs File Upload</h2>
      <p>
        Live microphone dictation runs in your browser with zero latency. File uploads support MP3, WAV, M4A, and MP4 video containers up to 25 MB.
      </p>
    </ArticleShell>
  );
}
