import { pageMetadata } from "@/lib/seo";
import { LandingPageShell } from "@/components/content/LandingPageShell";
import ToolsPage from "@/app/tools/page";

export const metadata = pageMetadata({
  title: "AI Pronunciation Generator — Custom Phonetic Speech Dictionary",
  description:
    "Fix mispronounced names, acronyms, and technical terms in text-to-speech engines with custom phonetic spelling replacements.",
  path: "/pronunciation-generator",
});

export default function PronunciationGeneratorPage() {
  return (
    <LandingPageShell
      slug="pronunciation-generator"
      h1="AI Pronunciation Generator & Phonetics Helper"
      subtitle="Define custom phonetic spellings and substitution rules so speech engines pronounce names and technical acronyms correctly."
      aeoAnswer="MK VoiceKit includes a Pronunciation Generator and custom phonetic dictionary. It allows users to define custom replacement rules (such as replacing 'SQL' with 'Sequel' or phonetic spellings for names) to guarantee 100% accurate pronunciation across all browser and AI voices."
      toolComponent={<ToolsPage />}
      steps={[
        { step: "1", title: "Identify Mispronounced Word", description: "Find any technical jargon, brand name, or foreign term the voice mispronounces." },
        { step: "2", title: "Add Phonetic Replacement", description: "Enter the word and its phonetic respelling into your local dictionary." },
        { step: "3", title: "Test & Save Rule", description: "Listen to the updated pronunciation immediately. Rules are saved automatically to your device." },
      ]}
      useCases={[
        { title: "Technical Documentation", description: "Ensure terms like 'kubectl', 'PostgreSQL', and 'CLI' are read naturally." },
        { title: "Medical & Legal Terms", description: "Spell complex Latin terminology phonetically for flawless narration." },
      ]}
      faqs={[
        { question: "Are my pronunciation rules saved?", answer: "Yes! Your custom phonetic dictionary is stored locally in your browser's IndexedDB and applies across all workspaces." },
      ]}
      relatedTools={[
        { href: "/transcript-cleaner", title: "Transcript Cleaner", description: "Clean and normalize raw text before speech synthesis." },
        { href: "/tools", title: "Daily Utilities Hub", description: "Access calculators and subtitle converters." },
      ]}
    />
  );
}
