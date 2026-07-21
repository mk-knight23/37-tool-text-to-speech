import { z } from "zod";
import {
  MAX_INPUT_CHARS,
  type CapabilityId,
  type Chapter,
  type DialogueTurn,
  type Pronunciation,
} from "./catalog";

export interface BuiltPrompt {
  system: string;
  prompt: string;
}

interface TextCapabilitySpec {
  mode: "text";
  inputSchema: z.ZodTypeAny;
  build: (input: unknown) => BuiltPrompt;
}

interface ObjectCapabilitySpec {
  mode: "object";
  inputSchema: z.ZodTypeAny;
  outputSchema: z.ZodTypeAny;
  build: (input: unknown) => BuiltPrompt;
}

export type CapabilitySpec = TextCapabilitySpec | ObjectCapabilitySpec;

const textField = z
  .string()
  .min(1, "Add some text first.")
  .max(MAX_INPUT_CHARS, "That text is too long for the AI tools.")
  .refine((value) => value.trim().length > 0, "Add some text first.");

function textCapability<S extends z.ZodTypeAny>(
  inputSchema: S,
  build: (input: z.infer<S>) => BuiltPrompt
): TextCapabilitySpec {
  return {
    mode: "text",
    inputSchema,
    build: (raw) => build(raw as z.infer<S>),
  };
}

function objectCapability<S extends z.ZodTypeAny, O extends z.ZodTypeAny>(
  inputSchema: S,
  outputSchema: O,
  build: (input: z.infer<S>) => BuiltPrompt
): ObjectCapabilitySpec {
  return {
    mode: "object",
    inputSchema,
    outputSchema,
    build: (raw) => build(raw as z.infer<S>),
  };
}

const textOnly = z.object({ text: textField });

const chaptersOutput = z.object({
  chapters: z
    .array(
      z.object({
        title: z.string(),
        summary: z.string(),
      })
    )
    .min(1)
    .max(30),
}) satisfies z.ZodType<{ chapters: Chapter[] }>;

const pronunciationsOutput = z.object({
  items: z
    .array(
      z.object({
        term: z.string(),
        respelling: z.string(),
        note: z.string(),
      })
    )
    .max(50),
}) satisfies z.ZodType<{ items: Pronunciation[] }>;

const dialogueOutput = z.object({
  turns: z
    .array(
      z.object({
        speaker: z.string(),
        text: z.string(),
      })
    )
    .min(1)
    .max(200),
}) satisfies z.ZodType<{ turns: DialogueTurn[] }>;

const READING_LEVEL_INSTRUCTIONS: Record<string, string> = {
  child: "Rewrite the text for a young child. Use very simple, common words and short sentences.",
  teen: "Rewrite the text for a teenage reader. Use clear, everyday language.",
  general: "Rewrite the text for a general adult audience. Use clear, plain language.",
  expert: "Rewrite the text for an expert audience. Precise, technical language is fine, but keep it readable when spoken.",
};

const RETURN_ONLY_TEXT =
  "Keep the meaning and all facts. Do not add commentary, titles, or notes. Return only the resulting text.";

export const SPECS: Record<CapabilityId, CapabilitySpec> = {
  "fix-grammar": textCapability(textOnly, ({ text }) => ({
    system: `You correct all grammar, spelling, punctuation, and typos. Do not change vocabulary or tone unless necessary to fix an error. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "improve-clarity": textCapability(textOnly, ({ text }) => ({
    system: `You improve sentence flow and clarity, removing awkward phrasing while keeping the exact meaning. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  simplify: textCapability(textOnly, ({ text }) => ({
    system: `You simplify text so it is easy to understand when heard. Use plain words and short sentences. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  shorten: textCapability(textOnly, ({ text }) => ({
    system: `You condense text by 30-50%, cutting filler and redundancy while keeping all core facts. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  expand: textCapability(textOnly, ({ text }) => ({
    system: `You elaborate on bullet points and brief text into rich, descriptive prose without inventing fake statistics or facts. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "remove-filler-words": textCapability(textOnly, ({ text }) => ({
    system: `You remove all filler words ('um', 'uh', 'you know', 'basically', 'like', 'sort of') and repetitive verbal crutches. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "rewrite-for-natural-speech": textCapability(textOnly, ({ text }) => ({
    system: `You rewrite text so it sounds natural when read aloud by a text-to-speech voice. Prefer shorter sentences, a natural rhythm, and clear phrasing. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "make-conversational": textCapability(textOnly, ({ text }) => ({
    system: `You adopt a warm, friendly, conversational tone as if speaking directly to a friend. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "make-professional": textCapability(textOnly, ({ text }) => ({
    system: `You format the script in a polished, authoritative corporate voice. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "make-persuasive": textCapability(textOnly, ({ text }) => ({
    system: `You enhance rhetorical impact and persuasive power for marketing or presentations. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "make-educational": textCapability(textOnly, ({ text }) => ({
    system: `You structure concepts into clear educational steps with logical pacing. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "make-energetic": textCapability(textOnly, ({ text }) => ({
    system: `You inject high enthusiasm, punchy phrasing, and dynamic momentum into the script. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "make-calm": textCapability(textOnly, ({ text }) => ({
    system: `You pace words gently and soothingly for relaxation, meditation, or sleep audio. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "make-dramatic": textCapability(textOnly, ({ text }) => ({
    system: `You build narrative suspense and vivid emotional tension for storytelling. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "change-reading-level": textCapability(
    z.object({
      text: textField,
      level: z.enum(["child", "teen", "general", "expert"]),
    }),
    ({ text, level }) => ({
      system: `${READING_LEVEL_INSTRUCTIONS[level]} ${RETURN_ONLY_TEXT}`,
      prompt: text,
    })
  ),

  "formal-to-informal": textCapability(textOnly, ({ text }) => ({
    system: `You convert stiff or formal language into relaxed casual phrasing. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "youtube-script": textCapability(textOnly, ({ text }) => ({
    system: `You format text as a YouTube video script with an engaging opening hook, clear sections, and viewer retention cues. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "podcast-script": textCapability(textOnly, ({ text }) => ({
    system: `You turn an article or outline into a broadcast script for a podcast host with warm intro and outro remarks. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "audiobook-narration": textCapability(textOnly, ({ text }) => ({
    system: `You format text for smooth single-narrator audiobook reading with natural prose rhythm. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  narration: textCapability(textOnly, ({ text }) => ({
    system: `You craft authoritative voiceover copy suitable for documentary films and video essays. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  advertisement: textCapability(textOnly, ({ text }) => ({
    system: `You create high-converting 30-second or 60-second commercial voiceover ad copy. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "product-demo": textCapability(textOnly, ({ text }) => ({
    system: `You create a step-by-step product walkthrough voiceover script. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "social-voiceover": textCapability(textOnly, ({ text }) => ({
    system: `You create a punchy, fast-paced voice script tailored for TikTok, Reels, and Shorts. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "news-narration": textCapability(textOnly, ({ text }) => ({
    system: `You write in a concise, balanced journalistic news broadcast style. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  elearning: textCapability(textOnly, ({ text }) => ({
    system: `You structure text as instructional audio modules with clear learning objectives. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "bullet-points-to-spoken-script": textCapability(textOnly, ({ text }) => ({
    system: `You turn raw outline bullet points into fluid, interconnected spoken paragraphs. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "add-natural-pauses": textCapability(textOnly, ({ text }) => ({
    system: `You insert punctuation commas, em-dashes, and ellipses to force natural breath pauses for speech synthesis engines. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "add-emphasis": textCapability(textOnly, ({ text }) => ({
    system: `You format key words that require vocal stress with ALL-CAPS or phonetic cues. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "generate-intro": textCapability(textOnly, ({ text }) => ({
    system: `You write an attention-grabbing 2-sentence opening hook for this topic. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "generate-outro": textCapability(textOnly, ({ text }) => ({
    system: `You write a polished 2-sentence wrap-up and sign-off for this topic. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "generate-cta": textCapability(textOnly, ({ text }) => ({
    system: `You write a single compelling Call to Action prompt for this content. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "localize-content": textCapability(
    z.object({
      text: textField,
      target: z.string().trim().min(1).max(50),
    }),
    ({ text, target }) => ({
      system: `Adapt idioms, currency, spelling, and cultural references in the text for an audience in ${target}. ${RETURN_ONLY_TEXT}`,
      prompt: text,
    })
  ),

  "translate-preserving-tone": textCapability(
    z.object({
      text: textField,
      language: z.string().trim().min(1).max(40),
    }),
    ({ text, language }) => ({
      system: `Translate the text into ${language}, strictly preserving the original emotional tone, brand names, and speaking style. ${RETURN_ONLY_TEXT}`,
      prompt: text,
    })
  ),

  translate: textCapability(
    z
      .object({
        text: textField,
        targetLanguage: z
          .string()
          .trim()
          .min(1, "Choose a language to translate into.")
          .max(40)
          .optional(),
        language: z.string().trim().min(1).max(40).optional(),
      })
      .refine(
        (data) => Boolean((data.targetLanguage ?? data.language)?.trim()),
        "Choose a language to translate into."
      ),
    (input: { text: string; targetLanguage?: string; language?: string }) => {
      const lang = input.targetLanguage || input.language || "Spanish";
      return {
        system: `Translate the user's text into ${lang}. Preserve line breaks and meaning. ${RETURN_ONLY_TEXT}`,
        prompt: input.text,
      };
    }
  ),

  summarize: textCapability(textOnly, ({ text }) => ({
    system: `You write concise summaries meant to be read aloud. Return only the summary.`,
    prompt: text,
  })),

  "show-notes": textCapability(textOnly, ({ text }) => ({
    system: `You generate structured show notes with key topics and bulleted highlights. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  "tone-variations": textCapability(textOnly, ({ text }) => ({
    system: `Provide 3 distinct tone versions of the script (Conversational, Professional, Energetic), labelled clearly.`,
    prompt: text,
  })),

  "chapter-generation": objectCapability(
    textOnly,
    chaptersOutput,
    ({ text }) => ({
      system: `You break text into a short, ordered list of chapters with title and summary.`,
      prompt: text,
    })
  ),

  "divide-into-scenes": objectCapability(
    textOnly,
    chaptersOutput,
    ({ text }) => ({
      system: `Divide this script into numbered narrative scenes with title and short summary.`,
      prompt: text,
    })
  ),

  "pronunciation-suggestions": objectCapability(
    textOnly,
    pronunciationsOutput,
    ({ text }) => ({
      system: `Find words or acronyms likely to be mispronounced and output simple phonetic respellings.`,
      prompt: text,
    })
  ),

  "multi-speaker-formatting": objectCapability(
    textOnly,
    dialogueOutput,
    ({ text }) => ({
      system: `Reformat text into alternating speaker turns for a two-person dialogue.`,
      prompt: text,
    })
  ),
};

export function getSpec(id: CapabilityId): CapabilitySpec {
  return SPECS[id];
}
