import { AiVoice } from "./aiVoices";

export type AppVoice = SpeechSynthesisVoice | AiVoice;

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
  voices: AppVoice[];
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
  voices: AppVoice[]
): VoiceGroup[] {
  const byCode = new Map<string, AppVoice[]>();
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
  voices: AppVoice[],
  voiceURI: string | null
): AppVoice | null {
  if (!voiceURI) return null;
  return voices.find((voice) => voice.voiceURI === voiceURI) ?? null;
}

export function detectLanguage(text: string): string {
  if (/[\u0900-\u097F]/.test(text)) return "hi"; // Hindi / Sanskrit
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text)) return "ja"; // Japanese
  if (/[\uAC00-\uD7AF]/.test(text)) return "ko"; // Korean
  if (/[\u0400-\u04FF]/.test(text)) return "ru"; // Russian
  if (/[\u0600-\u06FF]/.test(text)) return "ar"; // Arabic
  if (/[áéíóúñ¿¡]/.test(text)) return "es"; // Spanish
  if (/[éèàùçâêîôûëïü]/.test(text)) return "fr"; // French
  if (/[äöüß]/.test(text)) return "de"; // German
  if (/[àèìòù]/.test(text)) return "it"; // Italian
  return "en"; // Default
}

export function suggestVoiceForLanguage(
  voices: AppVoice[],
  langCode: string
): AppVoice | null {
  const matches = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(langCode.toLowerCase())
  );
  if (matches.length === 0) return null;
  return (
    matches.find((v) => v.localService) ??
    matches.find((v) => v.name.toLowerCase().includes("natural")) ??
    matches[0]
  );
}
