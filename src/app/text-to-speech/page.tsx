import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import { Workspace } from "@/components/workspace/Workspace";

export const metadata = pageMetadata({
  title: "Free Text to Speech Online — Natural AI & Browser Voice Reader",
  description:
    "Convert any text, PDF or document into speech online for free. Features live sentence tracking, speed control, keyboard shortcuts, and zero forced signup.",
  path: "/text-to-speech",
});

export default function TextToSpeechPage() {
  return (
    <LandingPageShell
      slug="text-to-speech"
      h1="Free Text to Speech Online"
      subtitle="Listen to plain text, PDFs, Markdown, and subtitles with free on-device browser voices or optional AI speech."
      aeoAnswer="Yes. Paste or type any text into MK VoiceKit, select your preferred voice, and click Listen. The application reads text aloud immediately using your browser's on-device voices without requiring an account, upload, or server processing."
      toolComponent={<Workspace />}
      steps={[
        { step: "1", title: "Paste or Type Text", description: "Enter any text or drag and drop a PDF, Word DOCX, or subtitle file into the workspace." },
        { step: "2", title: "Select Voice & Speed", description: "Choose from dozens of available operating system voices and adjust the speech rate and pitch." },
        { step: "3", title: "Listen with Live Highlighting", description: "Press Space or click Listen. Sentences highlight in real time as the audio plays." },
      ]}
      useCases={[
        { title: "Proofreading & Editing", description: "Catch grammatical mistakes, awkward phrasing, and repeated words by listening to your drafts read aloud." },
        { title: "Accessibility & Dyslexia", description: "Read comfortably with wide dyslexia letter spacing, follow-along focus rulers, and high-contrast themes." },
        { title: "Language Learning", description: "Listen to natural pronunciation in over 40 languages with adjustable playback speeds." },
        { title: "Long Article Reading", description: "Turn long blog posts, essays, and reports into continuous spoken audio while multitasking." },
      ]}
      faqs={[
        { question: "Is MK VoiceKit text-to-speech really free?", answer: "Yes. The core browser text-to-speech engine runs 100% free with no account creation or credit card required." },
        { question: "Can I download MP3 files from browser TTS?", answer: "Browser speech synthesis plays audio directly through your speakers without generating a downloadable file. Optional server AI voices support MP3 export." },
        { question: "Is my text private?", answer: "Yes. All text and uploaded documents are processed locally on your device and are never sent to external servers for basic reading." },
      ]}
      relatedTools={[
        { href: "/pdf-reader", title: "PDF Reader Aloud", description: "Extract readable text from PDF documents and listen aloud." },
        { href: "/ai-voice-generator", title: "AI Voice Generator", description: "Generate natural AI voiceovers with downloadable MP3 audio." },
        { href: "/words-to-minutes", title: "Words to Minutes Calculator", description: "Calculate speech duration based on word count." },
      ]}
    />
  );
}
