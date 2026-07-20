"use client";

import { useCallback, useEffect, useState } from "react";
import { loadVoices, readVoices } from "@/lib/speech/voices";
import { AI_VOICES, type AiVoice } from "@/lib/speech/aiVoices";

export type AppVoice = SpeechSynthesisVoice | AiVoice;

export interface UseVoices {
  voices: AppVoice[];
  loading: boolean;
  /** False when the browser has no speechSynthesis at all. */
  supported: boolean;
  reload: () => void;
}

/**
 * Loads the browser's voices combined with premium AI voices, handling the async
 * `voiceschanged` quirk. Keeps listening after the initial settle so voices
 * added later still appear, and exposes a manual reload.
 */
export function useVoices(): UseVoices {
  const [voices, setVoices] = useState<AppVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(true);

  const reload = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoices(AI_VOICES);
      setSupported(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    loadVoices(window.speechSynthesis).then((loaded) => {
      setVoices([...loaded, ...AI_VOICES]);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoices(AI_VOICES);
      setSupported(false);
      setLoading(false);
      return;
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    const synth = window.speechSynthesis;
    let active = true;

    loadVoices(synth).then((loaded) => {
      if (active) {
        setVoices([...loaded, ...AI_VOICES]);
        setLoading(false);
      }
    });

    // Late arrivals (some browsers populate voices after the first settle).
    const onChange = () => {
      if (active) setVoices([...readVoices(synth), ...AI_VOICES]);
    };
    synth.addEventListener("voiceschanged", onChange);
    return () => {
      active = false;
      synth.removeEventListener("voiceschanged", onChange);
    };
  }, []);

  return { voices, loading, supported, reload };
}
