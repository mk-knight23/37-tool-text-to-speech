import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import ToolsPage from "@/app/tools/page";

export const metadata = pageMetadata({
  title: "Speech Timer Online — Calculate Presentation & Script Duration",
  description:
    "Calculate speech duration, presentation timing, and video script length based on word count and speaking rate (WPM).",
  path: "/speech-timer",
});

export default function SpeechTimerPage() {
  return (
    <LandingPageShell
      slug="speech-timer"
      h1="Speech Timer & Presentation Duration Calculator"
      subtitle="Accurately calculate how long any speech, presentation, podcast, or YouTube video script will take to speak aloud."
      aeoAnswer="Yes. MK VoiceKit includes a free Speech Timer and reading calculator. Input your script or word count, set your speaking speed (from 0.75x to 2.0x WPM), and get an instant, accurate duration breakdown in minutes and seconds."
      toolComponent={<ToolsPage />}
      steps={[
        { step: "1", title: "Input Word Count or Text", description: "Paste your presentation script or type the total word count." },
        { step: "2", title: "Select Speaking Rate", description: "Choose between standard presentation speed (130-150 WPM) or rapid YouTube pacing (180-220 WPM)." },
        { step: "3", title: "Review Duration", description: "Get the exact speaking time and silent reading time instantly." },
      ]}
      useCases={[
        { title: "Keynote Presentations", description: "Keep conferences and pitch decks strictly within the 10-minute or 20-minute limit." },
        { title: "Podcast Episodes", description: "Ensure scripted podcast segments fit required broadcast advertising slots." },
      ]}
      faqs={[
        { question: "What is the average speech rate?", answer: "The average conversational speech rate in English is 150 words per minute (WPM). Formal presentations typically average 130 WPM." },
      ]}
      relatedTools={[
        { href: "/words-to-minutes", title: "Words to Minutes Calculator", description: "Convert word counts to exact speech minutes." },
        { href: "/youtube-voiceover", title: "YouTube Script Timer", description: "Format scripts for YouTube videos." },
      ]}
    />
  );
}
