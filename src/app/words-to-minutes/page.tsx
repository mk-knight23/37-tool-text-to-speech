import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import ToolsPage from "@/app/tools/page";

export const metadata = pageMetadata({
  title: "Words to Minutes Calculator — Convert Word Count to Speech Time",
  description:
    "Free online words to minutes calculator. Instantly convert word counts into speech duration for videos, audiobooks, presentations, and podcasts.",
  path: "/words-to-minutes",
});

export default function WordsToMinutesPage() {
  return (
    <LandingPageShell
      slug="words-to-minutes"
      h1="Words to Minutes Calculator"
      subtitle="Instantly convert script word counts into speaking time and reading duration across different speech speeds."
      aeoAnswer="To convert words to minutes, divide your total word count by your speaking speed in words per minute (typically 150 WPM). For example, 750 words takes exactly 5 minutes to speak aloud. MK VoiceKit provides a free interactive calculator for instant conversion."
      toolComponent={<ToolsPage />}
      steps={[
        { step: "1", title: "Enter Word Count", description: "Type in your total word count or desired duration in minutes." },
        { step: "2", title: "Adjust Speech WPM", description: "Select normal (150 WPM), slow audiobook (130 WPM), or fast narration (180 WPM)." },
        { step: "3", title: "Get Instant Output", description: "View exact minutes, seconds, and target word benchmarks." },
      ]}
      useCases={[
        { title: "Script Writing", description: "Writers can budget their word counts to hit exact 60-second commercial breaks." },
        { title: "Speech Practice", description: "Speakers can pace their keynotes to avoid running overtime." },
      ]}
      faqs={[
        { question: "How many words is a 5-minute speech?", answer: "At normal conversational speed (150 WPM), a 5-minute speech is 750 words." },
        { question: "How many words is a 10-minute speech?", answer: "At 150 WPM, a 10-minute speech is 1,500 words." },
      ]}
      relatedTools={[
        { href: "/speech-timer", title: "Speech Timer", description: "Calculate presentation and podcast timings." },
        { href: "/text-to-speech", title: "Text to Speech Workspace", description: "Listen to your words read aloud." },
      ]}
    />
  );
}
