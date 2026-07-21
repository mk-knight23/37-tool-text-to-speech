/**
 * Shared AI capability catalog.
 *
 * Pure data — NO zod, NO prompts, NO server imports — so it is safe to import
 * from client components.
 */

export const CAPABILITY_IDS = [
  "rewrite-for-natural-speech",
  "fix-grammar",
  "improve-clarity",
  "simplify",
  "shorten",
  "expand",
  "make-conversational",
  "make-professional",
  "make-persuasive",
  "make-educational",
  "make-energetic",
  "make-calm",
  "make-dramatic",
  "narration",
  "youtube-script",
  "podcast-script",
  "audiobook-narration",
  "advertisement",
  "product-demo",
  "social-voiceover",
  "news-narration",
  "elearning",
  "bullet-points-to-spoken-script",
  "add-natural-pauses",
  "add-emphasis",
  "divide-into-scenes",
  "generate-intro",
  "generate-outro",
  "generate-cta",
  "remove-filler-words",
  "localize-content",
  "translate-preserving-tone",
  "formal-to-informal",
  "tone-variations",
  "show-notes",
  "chapter-generation",
  "pronunciation-suggestions",
  "multi-speaker-formatting",
  "change-reading-level",
  "summarize",
  "translate",
] as const;

export type CapabilityId = (typeof CAPABILITY_IDS)[number];

export function isCapabilityId(value: string): value is CapabilityId {
  return (CAPABILITY_IDS as readonly string[]).includes(value);
}

export type CapabilityMode = "text" | "object";

export type ObjectResultKind = "chapters" | "pronunciations" | "dialogue";

export interface Chapter {
  title: string;
  summary: string;
}

export interface Pronunciation {
  term: string;
  respelling: string;
  note: string;
}

export interface DialogueTurn {
  speaker: string;
  text: string;
}

export type ParamSpec =
  | {
      name: string;
      label: string;
      kind: "select";
      required: boolean;
      options: readonly { value: string; label: string }[];
      defaultValue: string;
    }
  | {
      name: string;
      label: string;
      kind: "text";
      required: boolean;
      placeholder: string;
      defaultValue: string;
      suggestions?: readonly string[];
      maxLength: number;
    };

export interface CapabilityMeta {
  id: CapabilityId;
  label: string;
  description: string;
  group: "Grammar & Clarity" | "Tone & Style" | "Format Conversions" | "Audio & Script Polish" | "Structured";
  mode: CapabilityMode;
  objectKind?: ObjectResultKind;
  tier: "fast" | "quality";
  params: readonly ParamSpec[];
}

export const MAX_INPUT_CHARS = 20_000;
export const DAILY_AI_LIMIT = 40;

const READING_LEVELS = [
  { value: "child", label: "Child (simple words)" },
  { value: "teen", label: "Teen" },
  { value: "general", label: "General adult" },
  { value: "expert", label: "Expert / technical" },
] as const;

const LANGUAGE_SUGGESTIONS = [
  "Spanish",
  "French",
  "German",
  "Hindi",
  "Arabic",
  "Mandarin Chinese",
  "Japanese",
  "Portuguese",
] as const;

export const CAPABILITIES: readonly CapabilityMeta[] = [
  // 1. Grammar & Clarity
  {
    id: "fix-grammar",
    label: "Fix Grammar & Typos",
    description: "Correct spelling, syntax, and punctuation without altering meaning.",
    group: "Grammar & Clarity",
    mode: "text",
    tier: "fast",
    params: [],
  },
  {
    id: "improve-clarity",
    label: "Improve Clarity",
    description: "Make awkward sentences flow smoothly and eliminate ambiguity.",
    group: "Grammar & Clarity",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "simplify",
    label: "Simplify Text",
    description: "Make dense or jargon-heavy text easier to understand.",
    group: "Grammar & Clarity",
    mode: "text",
    tier: "fast",
    params: [],
  },
  {
    id: "shorten",
    label: "Shorten Text",
    description: "Trim unnecessary fluff while keeping all essential points.",
    group: "Grammar & Clarity",
    mode: "text",
    tier: "fast",
    params: [],
  },
  {
    id: "expand",
    label: "Expand Details",
    description: "Elaborate on bullet points with descriptive explanations.",
    group: "Grammar & Clarity",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "remove-filler-words",
    label: "Remove Filler Words",
    description: "Eliminate 'um', 'uh', repetitive phrases, and verbal clutter.",
    group: "Grammar & Clarity",
    mode: "text",
    tier: "fast",
    params: [],
  },

  // 2. Tone & Style
  {
    id: "rewrite-for-natural-speech",
    label: "Rewrite for Natural Speech",
    description: "Rephrase written text so it sounds conversational when spoken.",
    group: "Tone & Style",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "make-conversational",
    label: "Make Conversational",
    description: "Adopt a friendly, warm, and approachable speaking tone.",
    group: "Tone & Style",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "make-professional",
    label: "Make Professional",
    description: "Format script in a crisp, authoritative corporate tone.",
    group: "Tone & Style",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "make-persuasive",
    label: "Make Persuasive",
    description: "Enhance marketing appeal and rhetorical impact.",
    group: "Tone & Style",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "make-educational",
    label: "Make Educational",
    description: "Structure concepts clearly with step-by-step guidance.",
    group: "Tone & Style",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "make-energetic",
    label: "Make Energetic & Upbeat",
    description: "Inject enthusiasm, punchy phrasing, and momentum.",
    group: "Tone & Style",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "make-calm",
    label: "Make Calm & Soothing",
    description: "Pace text gently for meditation, sleep, or relaxation audio.",
    group: "Tone & Style",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "make-dramatic",
    label: "Make Dramatic",
    description: "Build suspense and narrative tension for storytelling.",
    group: "Tone & Style",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "change-reading-level",
    label: "Change Reading Level",
    description: "Adapt vocabulary for a specific age or expertise group.",
    group: "Tone & Style",
    mode: "text",
    tier: "quality",
    params: [
      {
        name: "level",
        label: "Reading level",
        kind: "select",
        required: true,
        options: READING_LEVELS,
        defaultValue: "general",
      },
    ],
  },
  {
    id: "formal-to-informal",
    label: "Formal to Informal",
    description: "Switch between rigid formal text and relaxed casual phrasing.",
    group: "Tone & Style",
    mode: "text",
    tier: "fast",
    params: [],
  },

  // 3. Format Conversions
  {
    id: "youtube-script",
    label: "Convert to YouTube Script",
    description: "Format with video hooks, visual cues, and engagement prompts.",
    group: "Format Conversions",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "podcast-script",
    label: "Convert to Podcast Script",
    description: "Structure as an audio broadcast with conversational transitions.",
    group: "Format Conversions",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "audiobook-narration",
    label: "Convert to Audiobook Narration",
    description: "Format dialogue and prose for smooth single-narrator flow.",
    group: "Format Conversions",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "narration",
    label: "Documentary Narration",
    description: "Craft authoritative voiceover copy for documentaries.",
    group: "Format Conversions",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "advertisement",
    label: "Convert to Commercial Ad",
    description: "Produce high-impact 30-second or 60-second commercial copy.",
    group: "Format Conversions",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "product-demo",
    label: "Product Demo Script",
    description: "Create walk-through voiceover for software and products.",
    group: "Format Conversions",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "social-voiceover",
    label: "Social Media Voiceover",
    description: "Fast-paced punchy voice script for TikToks, Reels, and Shorts.",
    group: "Format Conversions",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "news-narration",
    label: "News Bulletin Narration",
    description: "Concise journalistic reporting style.",
    group: "Format Conversions",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "elearning",
    label: "E-Learning Lesson",
    description: "Structure text as instructional audio modules.",
    group: "Format Conversions",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "bullet-points-to-spoken-script",
    label: "Bullet Points to Spoken Script",
    description: "Turn raw outline bullets into fluid spoken paragraphs.",
    group: "Format Conversions",
    mode: "text",
    tier: "quality",
    params: [],
  },

  // 4. Audio & Script Polish
  {
    id: "add-natural-pauses",
    label: "Add Natural Pauses",
    description: "Insert punctuation commas and ellipses for rhythmic pacing.",
    group: "Audio & Script Polish",
    mode: "text",
    tier: "fast",
    params: [],
  },
  {
    id: "add-emphasis",
    label: "Add Spoken Emphasis",
    description: "Capitalize or highlight key words that require vocal stress.",
    group: "Audio & Script Polish",
    mode: "text",
    tier: "fast",
    params: [],
  },
  {
    id: "generate-intro",
    label: "Generate Intro",
    description: "Write an attention-grabbing opening hook.",
    group: "Audio & Script Polish",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "generate-outro",
    label: "Generate Outro",
    description: "Write a polished wrap-up and sign-off.",
    group: "Audio & Script Polish",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "generate-cta",
    label: "Generate Call to Action",
    description: "Craft a compelling action prompt.",
    group: "Audio & Script Polish",
    mode: "text",
    tier: "fast",
    params: [],
  },
  {
    id: "localize-content",
    label: "Localize for Audience",
    description: "Adapt idioms, units, and references for a specific country.",
    group: "Audio & Script Polish",
    mode: "text",
    tier: "quality",
    params: [
      {
        name: "target",
        label: "Target Country / Audience",
        kind: "text",
        required: true,
        placeholder: "e.g. India, United Kingdom, Australia",
        defaultValue: "United States",
        maxLength: 50,
      },
    ],
  },
  {
    id: "translate-preserving-tone",
    label: "Translate Preserving Tone",
    description: "Translate text accurately while matching original voice tone.",
    group: "Audio & Script Polish",
    mode: "text",
    tier: "quality",
    params: [
      {
        name: "language",
        label: "Target Language",
        kind: "text",
        required: true,
        placeholder: "e.g. Spanish, Hindi, French",
        defaultValue: "Spanish",
        suggestions: LANGUAGE_SUGGESTIONS,
        maxLength: 40,
      },
    ],
  },
  {
    id: "translate",
    label: "Translate Text",
    description: "Translate text directly into another language.",
    group: "Audio & Script Polish",
    mode: "text",
    tier: "quality",
    params: [
      {
        name: "language",
        label: "Language",
        kind: "text",
        required: true,
        placeholder: "Language",
        defaultValue: "Spanish",
        suggestions: LANGUAGE_SUGGESTIONS,
        maxLength: 40,
      },
    ],
  },
  {
    id: "summarize",
    label: "Summarize",
    description: "Condense long text into key takeaways.",
    group: "Audio & Script Polish",
    mode: "text",
    tier: "fast",
    params: [],
  },
  {
    id: "show-notes",
    label: "Generate Show Notes",
    description: "Create episode summaries and timestamp markers.",
    group: "Audio & Script Polish",
    mode: "text",
    tier: "quality",
    params: [],
  },

  // 5. Structured Outputs
  {
    id: "chapter-generation",
    label: "Generate Chapters",
    description: "Divide text into structured titled chapters with summaries.",
    group: "Structured",
    mode: "object",
    objectKind: "chapters",
    tier: "quality",
    params: [],
  },
  {
    id: "pronunciation-suggestions",
    label: "Pronunciation Suggestions",
    description: "Detect tricky acronyms and output phonetic respellings.",
    group: "Structured",
    mode: "object",
    objectKind: "pronunciations",
    tier: "fast",
    params: [],
  },
  {
    id: "multi-speaker-formatting",
    label: "Format Multi-Speaker Dialogue",
    description: "Divide text into distinct speaker dialogue blocks.",
    group: "Structured",
    mode: "object",
    objectKind: "dialogue",
    tier: "quality",
    params: [],
  },
  {
    id: "divide-into-scenes",
    label: "Divide Into Scenes",
    description: "Structure script into discrete narrative scenes.",
    group: "Structured",
    mode: "object",
    objectKind: "chapters",
    tier: "quality",
    params: [],
  },
  {
    id: "tone-variations",
    label: "Generate Tone Variations",
    description: "Output 3 distinct tone versions of the script.",
    group: "Tone & Style",
    mode: "text",
    tier: "quality",
    params: [],
  },
];

export function getCapabilityMeta(id: CapabilityId): CapabilityMeta {
  const found = CAPABILITIES.find((c) => c.id === id);
  if (!found) {
    throw new Error(`Unknown capability: ${id}`);
  }
  return found;
}

export function capabilityGroups(): { group: string; items: CapabilityMeta[] }[] {
  const map = new Map<string, CapabilityMeta[]>();
  for (const item of CAPABILITIES) {
    const list = map.get(item.group) ?? [];
    list.push(item);
    map.set(item.group, list);
  }
  return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
}
