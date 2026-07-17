"use client";

import { useCallback, useEffect, useState } from "react";
import { loadVoices, readVoices } from "@/lib/speech/voices";

export interface UseVoices {
  voices: SpeechSynthesisVoice[];
  loading: boolean;
  /** False when the browser has no speechSynthesis at all. */
  supported: boolean;
  reload: () => void;
}

/**
 * Loads the browser's voices, handling the async `voiceschanged` quirk (voices
 * can be empty on first read and arrive later, inconsistently across
 * browsers). Keeps listening after the initial settle so voices added later
 * still appear, and exposes a manual reload for the empty-voices state.
 */
export function useVoices(): UseVoices {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(true);

  const reload = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    loadVoices(window.speechSynthesis).then((loaded) => {
      setVoices(loaded);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      // Feature detection is only reliable on the client, so this runs here.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only feature detection
      setSupported(false);
      setLoading(false);
      return;
    }
    const synth = window.speechSynthesis;
    let active = true;

    loadVoices(synth).then((loaded) => {
      if (active) {
        setVoices(loaded);
        setLoading(false);
      }
    });

    // Late arrivals (some browsers populate voices after the first settle).
    const onChange = () => {
      if (active) setVoices(readVoices(synth));
    };
    synth.addEventListener("voiceschanged", onChange);
    return () => {
      active = false;
      synth.removeEventListener("voiceschanged", onChange);
    };
  }, []);

  return { voices, loading, supported, reload };
}
