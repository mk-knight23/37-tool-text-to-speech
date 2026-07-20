import { describe, it, expect } from "vitest";
import { groupVoicesByLanguage, findVoiceByURI, detectLanguage, suggestVoiceForLanguage } from "./voices";

function voice(
  name: string,
  lang: string,
  localService: boolean,
  voiceURI = `${name}-${lang}`
): SpeechSynthesisVoice {
  return {
    name,
    lang,
    localService,
    voiceURI,
    default: false,
  } as unknown as SpeechSynthesisVoice;
}

describe("groupVoicesByLanguage", () => {
  it("groups by the primary language subtag", () => {
    const groups = groupVoicesByLanguage([
      voice("Alice", "en-US", true),
      voice("Bob", "en-GB", true),
      voice("Cléa", "fr-FR", true),
    ]);
    const en = groups.find((g) => g.code === "en");
    expect(en?.voices).toHaveLength(2);
    expect(groups.find((g) => g.code === "fr")?.voices).toHaveLength(1);
  });

  it("sorts on-device voices before network voices", () => {
    const groups = groupVoicesByLanguage([
      voice("Network", "en-US", false),
      voice("Local", "en-US", true),
    ]);
    expect(groups[0].voices[0].name).toBe("Local");
  });

  it("produces a human-readable label", () => {
    const groups = groupVoicesByLanguage([voice("Alice", "en-US", true)]);
    expect(groups[0].label.toLowerCase()).toContain("english");
  });
});

describe("findVoiceByURI", () => {
  const voices = [voice("Alice", "en-US", true, "uri-1")];

  it("finds a voice by its URI", () => {
    expect(findVoiceByURI(voices, "uri-1")?.name).toBe("Alice");
  });

  it("returns null for a missing or null URI", () => {
    expect(findVoiceByURI(voices, "nope")).toBeNull();
    expect(findVoiceByURI(voices, null)).toBeNull();
  });
});

describe("detectLanguage", () => {
  it("detects Hindi Devanagari script", () => {
    expect(detectLanguage("नमस्ते, आप कैसे हैं?")).toBe("hi");
  });

  it("detects Japanese script", () => {
    expect(detectLanguage("こんにちは、お元気ですか？")).toBe("ja");
  });

  it("detects Cyrillic Russian script", () => {
    expect(detectLanguage("Привет, как дела?")).toBe("ru");
  });

  it("detects Spanish script with special chars", () => {
    expect(detectLanguage("¿Cómo estás?")).toBe("es");
  });

  it("defaults to English", () => {
    expect(detectLanguage("Hello world, this is a test.")).toBe("en");
  });
});

describe("suggestVoiceForLanguage", () => {
  it("suggests the best voice for a language", () => {
    const list = [
      voice("Cloudy", "en-US", false),
      voice("Locally", "en-US", true),
      voice("Frenchy", "fr-FR", true),
    ];
    expect(suggestVoiceForLanguage(list, "en")?.name).toBe("Locally");
    expect(suggestVoiceForLanguage(list, "fr")?.name).toBe("Frenchy");
    expect(suggestVoiceForLanguage(list, "ja")).toBeNull();
  });
});
