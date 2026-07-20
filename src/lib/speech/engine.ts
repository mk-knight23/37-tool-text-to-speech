/**
 * SpeechEngine — framework-agnostic speechSynthesis state machine.
 *
 * Ported from the legacy Vue HomeView (speak/pause/resume/stop wiring,
 * utterance event handling) and extended with:
 * - per-sentence utterances + clause chunking (survives Chrome's ~15s cap)
 * - a generation counter so events from cancelled utterances are ignored
 *   (Chrome fires `end`/`error` on cancel)
 * - word `boundary` events surfaced only where the browser actually fires
 *   them — never synthesized.
 *
 * State is exposed as an immutable snapshot for useSyncExternalStore.
 */

import { chunkSentence } from "./chunk";
import type { SentenceRef } from "./segment";
import type { AppVoice } from "./voices";

export type EngineStatus = "idle" | "speaking" | "paused";

export interface WordRange {
  /** Offset within the current sentence's text. */
  start: number;
  end: number;
}

export interface EngineSnapshot {
  status: EngineStatus;
  /** Flat sentence index currently being spoken, or -1 when idle. */
  sentenceIndex: number;
  wordRange: WordRange | null;
  /** True once the browser has fired a real word boundary event. */
  hasWordBoundaries: boolean;
  totalSentences: number;
  error: string | null;
}

export interface UtteranceSettings {
  voice: AppVoice | null;
  rate: number;
  pitch: number;
  volume: number;
}

export interface EngineCallbacks {
  /** Fired when the last sentence finishes naturally. */
  onComplete?: (spokenMs: number) => void;
  /** Fired when playback stops early with progress made. */
  onStopped?: (spokenMs: number) => void;
}

const IDLE_SNAPSHOT: EngineSnapshot = {
  status: "idle",
  sentenceIndex: -1,
  wordRange: null,
  hasWordBoundaries: false,
  totalSentences: 0,
  error: null,
};

export class SpeechEngine {
  private synth: SpeechSynthesis | null;
  private activeAudio: HTMLAudioElement | null = null;
  private sentences: SentenceRef[] = [];
  private settings: UtteranceSettings = {
    voice: null,
    rate: 1,
    pitch: 1,
    volume: 1,
  };
  private callbacks: EngineCallbacks = {};
  private snapshot: EngineSnapshot = IDLE_SNAPSHOT;
  private listeners = new Set<() => void>();
  private generation = 0;
  private utteranceStartedAt = 0;
  private spokenMs = 0;
  private spokeAnything = false;

  constructor(synth?: SpeechSynthesis) {
    this.synth =
      synth ??
      (typeof window !== "undefined" && "speechSynthesis" in window
        ? window.speechSynthesis
        : null);
  }

  get isSupported(): boolean {
    return this.synth !== null;
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): EngineSnapshot => this.snapshot;

  setCallbacks(callbacks: EngineCallbacks): void {
    this.callbacks = callbacks;
  }

  setSentences(sentences: SentenceRef[]): void {
    this.stopInternal(false);
    this.sentences = sentences;
    this.update({ ...IDLE_SNAPSHOT, totalSentences: sentences.length });
  }

  setSettings(settings: UtteranceSettings): void {
    this.settings = settings;
  }

  /** Live settings changes apply from the next sentence onward. */
  getSettings(): UtteranceSettings {
    return this.settings;
  }

  play(fromIndex?: number): void {
    const isAi = this.isAiActive();
    if (!this.synth && !isAi) return;
    if (this.snapshot.status === "paused" && fromIndex === undefined) {
      this.resume();
      return;
    }
    const start =
      fromIndex ??
      (this.snapshot.sentenceIndex >= 0 ? this.snapshot.sentenceIndex : 0);
    if (this.sentences.length === 0 || start >= this.sentences.length) return;

    this.cancelPending();
    this.spokenMs = 0;
    this.spokeAnything = false;
    this.speakSentence(start, ++this.generation);
  }

  /** Space-bar verb: speaking -> pause, paused -> resume, idle -> play. */
  toggle(): void {
    if (this.snapshot.status === "speaking") {
      this.pause();
    } else if (this.snapshot.status === "paused") {
      this.resume();
    } else {
      this.play();
    }
  }

  pause(): void {
    const isAi = this.isAiActive();
    if (!this.synth && !isAi) return;
    if (this.snapshot.status !== "speaking") return;
    this.accumulateSpokenTime();
    
    if (isAi && this.activeAudio) {
      this.activeAudio.pause();
    } else if (this.synth) {
      this.synth.pause();
    }
    
    this.update({ ...this.snapshot, status: "paused" });
  }

  resume(): void {
    const isAi = this.isAiActive();
    if (!this.synth && !isAi) return;
    if (this.snapshot.status !== "paused") return;
    this.utteranceStartedAt = Date.now();
    
    if (isAi && this.activeAudio) {
      this.activeAudio.play().catch(() => {});
    } else if (this.synth) {
      this.synth.resume();
    }
    
    this.update({ ...this.snapshot, status: "speaking" });
  }

  stop(): void {
    this.stopInternal(true);
  }

  nextSentence(): void {
    this.jumpBy(1);
  }

  prevSentence(): void {
    this.jumpBy(-1);
  }

  nextParagraph(): void {
    this.jumpToParagraph(1);
  }

  prevParagraph(): void {
    this.jumpToParagraph(-1);
  }

  playSentence(index: number): void {
    if (index < 0 || index >= this.sentences.length) return;
    this.play(index);
  }

  private jumpBy(delta: number): void {
    const current = Math.max(this.snapshot.sentenceIndex, 0);
    const target = current + delta;
    if (target < 0 || target >= this.sentences.length) return;
    this.play(target);
  }

  private jumpToParagraph(direction: 1 | -1): void {
    const current = this.sentences[Math.max(this.snapshot.sentenceIndex, 0)];
    if (!current) return;
    const targetParagraph = current.paragraphIndex + direction;
    const target = this.sentences.find(
      (sentence) => sentence.paragraphIndex === targetParagraph
    );
    if (target) this.play(target.index);
  }

  private speakSentence(index: number, generation: number): void {
    const isAi = this.isAiActive();
    if (!this.synth && !isAi) return;
    const sentence = this.sentences[index];
    if (!sentence) {
      this.finish(generation);
      return;
    }

    this.update({
      ...this.snapshot,
      status: "speaking",
      sentenceIndex: index,
      wordRange: null,
      error: null,
      totalSentences: this.sentences.length,
    });

    const chunks = chunkSentence(sentence.text);
    this.speakChunk(index, chunks, 0, generation);
  }

  private speakChunk(
    sentenceIndex: number,
    chunks: { text: string; offset: number }[],
    chunkIndex: number,
    generation: number
  ): void {
    const isAi = this.isAiActive();
    if ((!this.synth && !isAi) || generation !== this.generation) return;
    const chunk = chunks[chunkIndex];
    if (!chunk) {
      const next = sentenceIndex + 1;
      if (next < this.sentences.length) {
        this.speakSentence(next, generation);
      } else {
        this.finish(generation);
      }
      return;
    }

    if (isAi) {
      void this.speakChunkAi(sentenceIndex, chunks, chunkIndex, generation);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunk.text);
    if (this.settings.voice) {
      utterance.voice = this.settings.voice as SpeechSynthesisVoice;
      utterance.lang = this.settings.voice.lang;
    }
    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;
    utterance.volume = this.settings.volume;

    utterance.onstart = () => {
      if (generation !== this.generation) return;
      this.spokeAnything = true;
      this.utteranceStartedAt = Date.now();
    };

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (generation !== this.generation) return;
      if (event.name !== "word") return;
      const sentence = this.sentences[sentenceIndex];
      if (!sentence) return;
      const start = chunk.offset + event.charIndex;
      const length =
        event.charLength && event.charLength > 0
          ? event.charLength
          : wordLengthAt(sentence.text, start);
      if (length <= 0) return;
      this.update({
        ...this.snapshot,
        wordRange: { start, end: start + length },
        hasWordBoundaries: true,
      });
    };

    utterance.onend = () => {
      if (generation !== this.generation) return;
      this.accumulateSpokenTime();
      this.speakChunk(sentenceIndex, chunks, chunkIndex + 1, generation);
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      if (generation !== this.generation) return;
      // Cancellation surfaces as an error event in several browsers.
      if (event.error === "interrupted" || event.error === "canceled") return;
      this.accumulateSpokenTime();
      this.update({
        ...this.snapshot,
        status: "idle",
        sentenceIndex: -1,
        wordRange: null,
        error: `Speech failed (${event.error || "unknown error"}). Try another voice.`,
      });
    };

    if (this.synth) {
      this.synth.speak(utterance);
    }
  }

  private async speakChunkAi(
    sentenceIndex: number,
    chunks: { text: string; offset: number }[],
    chunkIndex: number,
    generation: number
  ): Promise<void> {
    if (generation !== this.generation) return;
    const chunk = chunks[chunkIndex];
    if (!chunk) return;

    const voice = this.settings.voice;
    if (!voice) return;

    const parts = voice.voiceURI.split(":");
    const provider = parts[1] as "openai" | "elevenlabs" | "google" | "azure" | "polly";
    const voiceId = parts[2] || "";

    try {
      const { getProviderByokKey } = await import("../storage");
      const key = await getProviderByokKey(provider);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (key) {
        headers["x-byok-key"] = key;
      }

      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: chunk.text,
          voiceId,
          provider,
          rate: this.settings.rate,
          pitch: this.settings.pitch,
          volume: this.settings.volume,
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Failed to synthesize speech.");
      }

      const blob = await res.blob();
      if (generation !== this.generation) return;

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = this.settings.volume;
      audio.playbackRate = this.settings.rate;
      
      this.activeAudio = audio;

      audio.onplay = () => {
        if (generation !== this.generation) return;
        this.spokeAnything = true;
        this.utteranceStartedAt = Date.now();
      };

      audio.onended = () => {
        if (generation !== this.generation) return;
        URL.revokeObjectURL(url);
        this.activeAudio = null;
        this.accumulateSpokenTime();
        this.speakChunk(sentenceIndex, chunks, chunkIndex + 1, generation);
      };

      audio.onerror = () => {
        if (generation !== this.generation) return;
        URL.revokeObjectURL(url);
        this.activeAudio = null;
        this.accumulateSpokenTime();
        this.update({
          ...this.snapshot,
          status: "idle",
          sentenceIndex: -1,
          wordRange: null,
          error: "Speech failed to play. Please verify your connection or API keys.",
        });
      };

      await audio.play();

    } catch (err) {
      if (generation !== this.generation) return;
      const msg = err instanceof Error ? err.message : String(err);
      this.update({
        ...this.snapshot,
        status: "idle",
        sentenceIndex: -1,
        wordRange: null,
        error: msg || "Failed to synthesize speech.",
      });
    }
  }

  private isAiActive(): boolean {
    const voice = this.settings.voice;
    return !!(voice && voice.voiceURI.startsWith("ai:"));
  }

  private finish(generation: number): void {
    if (generation !== this.generation) return;
    const spokenMs = this.spokenMs;
    this.update({
      ...this.snapshot,
      status: "idle",
      sentenceIndex: -1,
      wordRange: null,
    });
    if (this.spokeAnything) {
      this.callbacks.onComplete?.(spokenMs);
      this.spokeAnything = false;
    }
  }

  private stopInternal(reportProgress: boolean): void {
    const wasActive = this.snapshot.status !== "idle";
    if (this.snapshot.status === "speaking") this.accumulateSpokenTime();
    this.cancelPending();
    if (wasActive) {
      this.update({
        ...this.snapshot,
        status: "idle",
        sentenceIndex: -1,
        wordRange: null,
      });
      if (reportProgress && this.spokeAnything) {
        this.callbacks.onStopped?.(this.spokenMs);
        this.spokeAnything = false;
      }
    }
  }

  private cancelPending(): void {
    this.generation += 1;
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio = null;
      } catch {
        // ignore
      }
    }
    if (this.synth) {
      // resume() first: cancel() while paused wedges some Chromium builds.
      try {
        this.synth.resume();
        this.synth.cancel();
      } catch {
        // ignore — engine state is reset by the caller
      }
    }
  }

  private accumulateSpokenTime(): void {
    if (this.utteranceStartedAt > 0) {
      this.spokenMs += Date.now() - this.utteranceStartedAt;
      this.utteranceStartedAt = 0;
    }
  }

  private update(next: EngineSnapshot): void {
    this.snapshot = next;
    for (const listener of this.listeners) listener();
  }
}

/** Length of the word starting at `start` in `text` (boundary fallback). */
export function wordLengthAt(text: string, start: number): number {
  const rest = text.slice(start);
  const match = /^[^\s.,;:!?…]+/.exec(rest);
  return match ? match[0].length : 0;
}
