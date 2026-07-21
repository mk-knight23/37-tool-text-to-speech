import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import StudioPage from "@/app/studio/page";

export const metadata = pageMetadata({
  title: "YouTube Voiceover Generator — AI Narration for Videos & Shorts",
  description:
    "Generate engaging, energetic AI voiceovers for YouTube videos, shorts, tutorials, and faceless channels with duration estimation.",
  path: "/youtube-voiceover",
});

export default function YouTubeVoiceoverPage() {
  return (
    <LandingPageShell
      slug="youtube-voiceover"
      h1="YouTube Voiceover Generator Online"
      subtitle="Craft engaging narration for YouTube videos, shorts, and explainer channels with accurate script duration timers."
      aeoAnswer="MK VoiceKit is a YouTube voiceover generator that helps video creators turn scripts into spoken narration. It includes script timing calculators to ensure videos hit target YouTube durations, scene-by-scene voice assignment, and subtitle generation."
      toolComponent={<StudioPage />}
      steps={[
        { step: "1", title: "Paste YouTube Script", description: "Input your video script or paste bullet points to convert into spoken dialogue." },
        { step: "2", title: "Verify Duration", description: "Use the built-in script duration calculator to target exact 60-second shorts or 10-minute videos." },
        { step: "3", title: "Generate & Export", description: "Preview your audio with background music and export audio or synchronized SRT subtitles." },
      ]}
      useCases={[
        { title: "Faceless YouTube Channels", description: "Produce high-volume documentary and listicle video narration efficiently." },
        { title: "YouTube Shorts & TikToks", description: "Generate fast-paced, punchy voice tracks for vertical short-form video." },
      ]}
      faqs={[
        { question: "How many words are in a 10-minute YouTube video?", answer: "At a standard speaking rate of 150 words per minute, a 10-minute YouTube script requires approximately 1,500 words." },
      ]}
      relatedTools={[
        { href: "/speech-timer", title: "Speech Timer", description: "Calculate exact duration for video and presentation scripts." },
        { href: "/voiceover-generator", title: "Voiceover Studio", description: "Full multi-scene voiceover timeline editor." },
      ]}
    />
  );
}
