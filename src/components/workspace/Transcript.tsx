"use client";

import { useEffect, useRef } from "react";
import type { SentenceRef } from "@/lib/speech/segment";
import type { WordRange } from "@/lib/speech/engine";
import { cn } from "@/lib/cn";

interface TranscriptProps {
  sentences: SentenceRef[];
  activeIndex: number;
  wordRange: WordRange | null;
  hasWordBoundaries: boolean;
  autoScroll: boolean;
  textScale: "base" | "large";
  /** BCP-47 of the selected voice, for screen-reader pronunciation. */
  lang?: string;
  onPlaySentence: (index: number) => void;
}

const SCROLL_PAUSE_MS = 1500;

export function Transcript({
  sentences,
  activeIndex,
  wordRange,
  hasWordBoundaries,
  autoScroll,
  textScale,
  lang,
  onPlaySentence,
}: TranscriptProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null);
  const userScrolledAt = useRef(0);

  useEffect(() => {
    if (!autoScroll || activeIndex < 0 || !activeRef.current) return;
    if (Date.now() - userScrolledAt.current < SCROLL_PAUSE_MS) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    activeRef.current.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "nearest",
    });
  }, [activeIndex, autoScroll]);

  if (sentences.length === 0) {
    return (
      <p className="text-text-muted">
        Nothing to read yet. Type or import text above to see it here.
      </p>
    );
  }

  return (
    <div
      lang={lang}
      onWheel={() => (userScrolledAt.current = Date.now())}
      onTouchMove={() => (userScrolledAt.current = Date.now())}
      className={cn(
        "max-w-[68ch] leading-relaxed",
        textScale === "large" ? "text-xl" : "text-lg"
      )}
    >
      {sentences.map((sentence) => {
        const active = sentence.index === activeIndex;
        return (
          <button
            key={sentence.index}
            ref={active ? activeRef : undefined}
            type="button"
            data-sentence-index={sentence.index}
            onClick={() => onPlaySentence(sentence.index)}
            aria-current={active ? "true" : undefined}
            aria-label={`Speak from: ${sentence.text}`}
            className={cn(
              "vk-sentence mb-0.5 mr-1 inline rounded-sm px-1 text-left hover:bg-surface-sunken",
              active && "vk-sentence"
            )}
          >
            {active && wordRange && hasWordBoundaries
              ? renderWithWord(sentence.text, wordRange)
              : sentence.text}{" "}
          </button>
        );
      })}
    </div>
  );
}

function renderWithWord(text: string, range: WordRange) {
  const start = Math.max(0, Math.min(range.start, text.length));
  const end = Math.max(start, Math.min(range.end, text.length));
  return (
    <>
      {text.slice(0, start)}
      <span className="vk-word-live">{text.slice(start, end)}</span>
      {text.slice(end)}
    </>
  );
}
