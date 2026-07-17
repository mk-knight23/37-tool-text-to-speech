/**
 * Shared AI capability catalog (STANDARDS §10).
 *
 * Pure data — NO zod, NO prompts, NO server imports — so it is safe to import
 * from client components. It is the single source of truth for capability ids,
 * labels, modes, tiers, parameters, and result shapes. The server-side
 * `capabilities.ts` attaches the zod schemas and prompt builders to these ids.
 */

export const CAPABILITY_IDS = [
  "rewrite-for-natural-speech",
  "simplify",
  "summarize",
  "translate",
  "change-reading-level",
  "article-to-podcast-script",
  "notes-to-narration",
  "chapter-generation",
  "pronunciation-suggestions",
  "multi-speaker-formatting",
] as const;

export type CapabilityId = (typeof CAPABILITY_IDS)[number];

export function isCapabilityId(value: string): value is CapabilityId {
  return (CAPABILITY_IDS as readonly string[]).includes(value);
}

/** text = streamed plain text; object = structured JSON result. */
export type CapabilityMode = "text" | "object";

/** Structured result kinds (object mode). */
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

/** A parameter the user supplies beyond the source text. */
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
  /** Plain, honest one-liner shown in the UI. */
  description: string;
  group: string;
  mode: CapabilityMode;
  /** Only set when mode === "object". */
  objectKind?: ObjectResultKind;
  /** Model tier — quality for longer/creative rewrites, fast otherwise. */
  tier: "fast" | "quality";
  params: readonly ParamSpec[];
}

/** Maximum source-text length accepted by every capability. */
export const MAX_INPUT_CHARS = 20_000;

/** Anonymous free daily AI actions (shared by client indicator + server). */
export const DAILY_AI_LIMIT = 40;

const READING_LEVELS: readonly { value: string; label: string }[] = [
  { value: "child", label: "Child (simple words)" },
  { value: "teen", label: "Teen" },
  { value: "general", label: "General adult" },
  { value: "expert", label: "Expert / technical" },
];

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
  {
    id: "rewrite-for-natural-speech",
    label: "Rewrite for natural speech",
    description:
      "Rephrase text so it sounds smooth when read aloud, keeping the meaning.",
    group: "Rewrite",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "simplify",
    label: "Simplify",
    description: "Make dense or jargon-heavy text easier to follow.",
    group: "Rewrite",
    mode: "text",
    tier: "fast",
    params: [],
  },
  {
    id: "change-reading-level",
    label: "Change reading level",
    description: "Rewrite the text for a specific audience.",
    group: "Rewrite",
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
    id: "translate",
    label: "Translate",
    description: "Translate the text into another language before listening.",
    group: "Rewrite",
    mode: "text",
    tier: "fast",
    params: [
      {
        name: "targetLanguage",
        label: "Target language",
        kind: "text",
        required: true,
        placeholder: "e.g. Spanish",
        defaultValue: "",
        suggestions: LANGUAGE_SUGGESTIONS,
        maxLength: 40,
      },
    ],
  },
  {
    id: "summarize",
    label: "Summarize",
    description: "Condense long text into a short spoken summary.",
    group: "Summarize & structure",
    mode: "text",
    tier: "fast",
    params: [],
  },
  {
    id: "chapter-generation",
    label: "Generate chapters",
    description: "Outline the text as titled chapters for easier navigation.",
    group: "Summarize & structure",
    mode: "object",
    objectKind: "chapters",
    tier: "fast",
    params: [],
  },
  {
    id: "article-to-podcast-script",
    label: "Article to podcast script",
    description:
      "Turn an article into a single-host script written to be spoken.",
    group: "Produce scripts",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "notes-to-narration",
    label: "Notes to narration",
    description: "Expand rough notes or bullet points into flowing narration.",
    group: "Produce scripts",
    mode: "text",
    tier: "quality",
    params: [],
  },
  {
    id: "multi-speaker-formatting",
    label: "Format as multi-speaker",
    description:
      "Split the text into labelled speaker turns for a two-voice read.",
    group: "Produce scripts",
    mode: "object",
    objectKind: "dialogue",
    tier: "quality",
    params: [],
  },
  {
    id: "pronunciation-suggestions",
    label: "Pronunciation suggestions",
    description:
      "Find likely-mispronounced words and suggest phonetic respellings.",
    group: "Pronunciation",
    mode: "object",
    objectKind: "pronunciations",
    tier: "fast",
    params: [],
  },
];

export function getCapabilityMeta(id: CapabilityId): CapabilityMeta {
  const meta = CAPABILITIES.find((capability) => capability.id === id);
  if (!meta) {
    throw new Error(`Unknown capability: ${id}`);
  }
  return meta;
}

/** Groups preserving catalog order, for rendering. */
export function capabilityGroups(): { group: string; items: CapabilityMeta[] }[] {
  const order: string[] = [];
  const byGroup = new Map<string, CapabilityMeta[]>();
  for (const capability of CAPABILITIES) {
    if (!byGroup.has(capability.group)) {
      byGroup.set(capability.group, []);
      order.push(capability.group);
    }
    byGroup.get(capability.group)!.push(capability);
  }
  return order.map((group) => ({ group, items: byGroup.get(group)! }));
}
