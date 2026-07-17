/**
 * Voice loading and grouping.
 *
 * Ported behavior from the legacy Vue app: `getVoices()` can legitimately
 * return an empty list on first call because Chromium populates voices
 * asynchronously and announces them via the `voiceschanged` event — which
 * itself fires inconsistently across browsers. We therefore combine an
 * immediate read, the event, and short polling before settling.
 */

export function readVoices(synth: SpeechSynthesis): SpeechSynthesisVoice[] {
  return synth
    .getVoices()
    .slice()
    .sort((a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name));
}

export function loadVoices(
  synth: SpeechSynthesis,
  timeoutMs: number = 2500
): Promise<SpeechSynthesisVoice[]> {
  const immediate = readVoices(synth);
  if (immediate.length > 0) return Promise.resolve(immediate);

  return new Promise((resolve) => {
    let settled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let deadline: ReturnType<typeof setTimeout> | null = null;

    const settle = () => {
      if (settled) return;
      settled = true;
      synth.removeEventListener("voiceschanged", onChange);
      if (pollTimer !== null) clearInterval(pollTimer);
      if (deadline !== null) clearTimeout(deadline);
      resolve(readVoices(synth));
    };

    const onChange = () => {
      if (readVoices(synth).length > 0) settle();
    };

    synth.addEventListener("voiceschanged", onChange);
    pollTimer = setInterval(onChange, 200);
    deadline = setTimeout(settle, timeoutMs);
  });
}

export interface VoiceGroup {
  /** Primary language subtag, e.g. "en". */
  code: string;
  /** Human-readable label, e.g. "English". */
  label: string;
  voices: SpeechSynthesisVoice[];
}

function languageLabel(code: string): string {
  if (typeof Intl !== "undefined" && "DisplayNames" in Intl) {
    try {
      const names = new Intl.DisplayNames(["en"], { type: "language" });
      return names.of(code) ?? code;
    } catch {
      return code;
    }
  }
  return code;
}

export function groupVoicesByLanguage(
  voices: SpeechSynthesisVoice[]
): VoiceGroup[] {
  const byCode = new Map<string, SpeechSynthesisVoice[]>();
  for (const voice of voices) {
    const code = (voice.lang.split(/[-_]/)[0] || "und").toLowerCase();
    const bucket = byCode.get(code);
    if (bucket) {
      byCode.set(code, [...bucket, voice]);
    } else {
      byCode.set(code, [voice]);
    }
  }
  return [...byCode.entries()]
    .map(([code, groupVoices]) => ({
      code,
      label: languageLabel(code),
      voices: groupVoices
        .slice()
        .sort(
          (a, b) =>
            Number(b.localService) - Number(a.localService) ||
            a.name.localeCompare(b.name)
        ),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function findVoiceByURI(
  voices: SpeechSynthesisVoice[],
  voiceURI: string | null
): SpeechSynthesisVoice | null {
  if (!voiceURI) return null;
  return voices.find((voice) => voice.voiceURI === voiceURI) ?? null;
}
