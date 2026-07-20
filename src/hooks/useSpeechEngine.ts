"use client";

import { useSpeech, type UseSpeechEngine } from "@/context/SpeechContext";

export type { UseSpeechEngine };

/**
 * Re-routes the speech engine query to use the shared app-wide SpeechContext
 * instead of creating local isolated SpeechEngine instances.
 */
export function useSpeechEngine(): UseSpeechEngine {
  return useSpeech();
}
