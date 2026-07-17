import { describe, it, expect } from "vitest";
import { groupVoicesByLanguage, findVoiceByURI } from "./voices";

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
