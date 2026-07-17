/**
 * Server-side capability specs: zod input schemas, prompt builders, and (for
 * object mode) output schemas. Keyed by the ids declared in `catalog.ts`.
 *
 * Prompts instruct the model to return ONLY the transformed content (no
 * preamble) and never to invent facts — honesty is a product constraint.
 */

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

/* ------------------------------------------------------------------ */
/* Shared fields + factories                                            */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Output schemas (object mode)                                         */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Reading-level system prompts                                         */
/* ------------------------------------------------------------------ */

const READING_LEVEL_INSTRUCTIONS: Record<string, string> = {
  child:
    "Rewrite the text for a young child. Use very simple, common words and short sentences.",
  teen: "Rewrite the text for a teenage reader. Use clear, everyday language.",
  general:
    "Rewrite the text for a general adult audience. Use clear, plain language.",
  expert:
    "Rewrite the text for an expert audience. Precise, technical language is fine, but keep it readable when spoken.",
};

const RETURN_ONLY_TEXT =
  "Keep the meaning and all facts. Do not add commentary, titles, or notes. Return only the resulting text.";

/* ------------------------------------------------------------------ */
/* Registry                                                             */
/* ------------------------------------------------------------------ */

export const SPECS: Record<CapabilityId, CapabilitySpec> = {
  "rewrite-for-natural-speech": textCapability(textOnly, ({ text }) => ({
    system: `You rewrite text so it sounds natural when read aloud by a text-to-speech voice. Prefer shorter sentences, a natural rhythm, and clear phrasing. Expand symbols and abbreviations into spoken words where it helps. ${RETURN_ONLY_TEXT}`,
    prompt: text,
  })),

  simplify: textCapability(textOnly, ({ text }) => ({
    system: `You simplify text so it is easy to understand when heard. Use plain words and short sentences. Keep all key information and add nothing new. ${RETURN_ONLY_TEXT}`,
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

  translate: textCapability(
    z.object({
      text: textField,
      targetLanguage: z
        .string()
        .trim()
        .min(1, "Choose a language to translate into.")
        .max(40),
    }),
    ({ text, targetLanguage }) => ({
      system: `Translate the user's text into ${targetLanguage}. Preserve meaning, tone, and line breaks. Leave any text that is already in ${targetLanguage} unchanged. Return only the translation, with no notes.`,
      prompt: text,
    })
  ),

  summarize: textCapability(textOnly, ({ text }) => ({
    system:
      "You write concise summaries meant to be read aloud. Capture the main points in a few short sentences or a short paragraph. Do not add information that is not in the text. Return only the summary.",
    prompt: text,
  })),

  "article-to-podcast-script": textCapability(textOnly, ({ text }) => ({
    system:
      "You turn an article into a script for a single podcast host to read aloud. Write in a warm, spoken style with a brief intro and a short outro. Keep the facts from the article; do not invent quotes, names, or statistics. Do not include stage directions, speaker labels, or music cues — only the words the host will say. Return only the script.",
    prompt: text,
  })),

  "notes-to-narration": textCapability(textOnly, ({ text }) => ({
    system:
      "You expand rough notes or bullet points into smooth, connected narration suitable for reading aloud. Keep to the ideas in the notes and do not invent new facts. Return only the narration.",
    prompt: text,
  })),

  "chapter-generation": objectCapability(
    textOnly,
    chaptersOutput,
    ({ text }) => ({
      system:
        "You break text into a short, ordered list of chapters. Each chapter has a short title and a one-sentence summary of what it covers. Base the chapters only on the provided text.",
      prompt: text,
    })
  ),

  "pronunciation-suggestions": objectCapability(
    textOnly,
    pronunciationsOutput,
    ({ text }) => ({
      system:
        "You find words in the text that a text-to-speech voice is likely to mispronounce — names, places, technical terms, acronyms, or unusual spellings. For each, give a simple phonetic respelling using plain letters and hyphens, capitalising the stressed syllable, plus a short note on why. Only include words that actually appear in the text. If none are likely to be mispronounced, return an empty list.",
      prompt: text,
    })
  ),

  "multi-speaker-formatting": objectCapability(
    textOnly,
    dialogueOutput,
    ({ text }) => ({
      system:
        "You reformat text into alternating speaker turns for a two-person read (for example Host and Guest). Give each turn a speaker label and the exact words to speak. Preserve the meaning; you may lightly adjust wording so the exchange sounds natural, but do not invent new facts. Use at most two distinct speakers.",
      prompt: text,
    })
  ),
};

export function getSpec(id: CapabilityId): CapabilitySpec {
  return SPECS[id];
}
