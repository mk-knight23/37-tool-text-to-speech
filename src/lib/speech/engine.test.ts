import { describe, it, expect, vi, beforeEach } from "vitest";
import { SpeechEngine } from "./engine";
import { segmentText } from "./segment";

class FakeUtterance {
  text: string;
  voice: SpeechSynthesisVoice | null = null;
  lang = "";
  rate = 1;
  pitch = 1;
  volume = 1;
  onstart: (() => void) | null = null;
  onboundary: ((event: SpeechSynthesisEvent) => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

class FakeSynth {
  spoken: FakeUtterance[] = [];
  current: FakeUtterance | null = null;
  paused = false;
  cancelled = 0;
  speak(utterance: FakeUtterance) {
    this.current = utterance;
    this.spoken.push(utterance);
    utterance.onstart?.();
  }
  cancel() {
    this.cancelled += 1;
  }
  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
  }
  getVoices(): SpeechSynthesisVoice[] {
    return [];
  }
}

function makeEngine() {
  const synth = new FakeSynth();
  const engine = new SpeechEngine(synth as unknown as SpeechSynthesis);
  return { synth, engine };
}

function boundary(charIndex: number, charLength: number): SpeechSynthesisEvent {
  return {
    name: "word",
    charIndex,
    charLength,
  } as unknown as SpeechSynthesisEvent;
}

beforeEach(() => {
  (
    globalThis as unknown as { SpeechSynthesisUtterance: unknown }
  ).SpeechSynthesisUtterance = FakeUtterance;
});

describe("SpeechEngine", () => {
  it("starts idle and reports total sentences after setSentences", () => {
    const { engine } = makeEngine();
    engine.setSentences(segmentText("One. Two.").sentences);
    const snap = engine.getSnapshot();
    expect(snap.status).toBe("idle");
    expect(snap.totalSentences).toBe(2);
    expect(snap.sentenceIndex).toBe(-1);
  });

  it("speaks the first sentence on play", () => {
    const { engine, synth } = makeEngine();
    engine.setSentences(segmentText("Hello world.").sentences);
    engine.play();
    expect(engine.getSnapshot().status).toBe("speaking");
    expect(engine.getSnapshot().sentenceIndex).toBe(0);
    expect(synth.spoken).toHaveLength(1);
    expect(synth.spoken[0].text).toBe("Hello world.");
  });

  it("pauses and resumes without desyncing state", () => {
    const { engine, synth } = makeEngine();
    engine.setSentences(segmentText("Hello world.").sentences);
    engine.play();
    engine.pause();
    expect(engine.getSnapshot().status).toBe("paused");
    expect(synth.paused).toBe(true);
    engine.resume();
    expect(engine.getSnapshot().status).toBe("speaking");
    expect(synth.paused).toBe(false);
  });

  it("advances to the next sentence when an utterance ends", () => {
    const { engine, synth } = makeEngine();
    engine.setSentences(segmentText("First one. Second one.").sentences);
    engine.play();
    expect(engine.getSnapshot().sentenceIndex).toBe(0);
    synth.current?.onend?.();
    expect(engine.getSnapshot().sentenceIndex).toBe(1);
  });

  it("fires onComplete after the final sentence ends", () => {
    const { engine, synth } = makeEngine();
    const onComplete = vi.fn();
    engine.setCallbacks({ onComplete });
    engine.setSentences(segmentText("Only one.").sentences);
    engine.play();
    synth.current?.onend?.();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(engine.getSnapshot().status).toBe("idle");
  });

  it("ignores end events from a cancelled generation", () => {
    const { engine, synth } = makeEngine();
    const onComplete = vi.fn();
    engine.setCallbacks({ onComplete });
    engine.setSentences(segmentText("First one. Second one.").sentences);
    engine.play();
    const stale = synth.current;
    engine.stop();
    expect(engine.getSnapshot().status).toBe("idle");
    // A late event from the cancelled utterance must not advance or complete.
    stale?.onend?.();
    expect(engine.getSnapshot().sentenceIndex).toBe(-1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("surfaces word boundaries only when the browser fires them", () => {
    const { engine, synth } = makeEngine();
    engine.setSentences(segmentText("Hello world.").sentences);
    engine.play();
    expect(engine.getSnapshot().hasWordBoundaries).toBe(false);
    synth.current?.onboundary?.(boundary(0, 5));
    const snap = engine.getSnapshot();
    expect(snap.hasWordBoundaries).toBe(true);
    expect(snap.wordRange).toEqual({ start: 0, end: 5 });
  });

  it("jumps to an arbitrary sentence with playSentence", () => {
    const { engine } = makeEngine();
    engine.setSentences(segmentText("A one. B two. C three.").sentences);
    engine.playSentence(2);
    expect(engine.getSnapshot().sentenceIndex).toBe(2);
  });

  it("reports an error and returns to idle on a real speech error", () => {
    const { engine, synth } = makeEngine();
    engine.setSentences(segmentText("Hello world.").sentences);
    engine.play();
    synth.current?.onerror?.({
      error: "synthesis-failed",
    } as unknown as SpeechSynthesisErrorEvent);
    const snap = engine.getSnapshot();
    expect(snap.status).toBe("idle");
    expect(snap.error).toContain("Speech failed");
  });
});
