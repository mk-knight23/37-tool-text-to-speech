"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pause,
  Play,
  ScrollText,
  Square,
  RotateCcw,
} from "lucide-react";
import type { EngineStatus } from "@/lib/speech/engine";
import { cn } from "@/lib/cn";
import { Waveform } from "@/components/ui/Waveform";

interface PlaybackBarProps {
  status: EngineStatus;
  sentenceIndex: number;
  totalSentences: number;
  disabled: boolean;
  autoScroll: boolean;
  onToggle: () => void;
  onStop: () => void;
  onPrevSentence: () => void;
  onNextSentence: () => void;
  onPrevParagraph: () => void;
  onNextParagraph: () => void;
  onToggleAutoScroll: () => void;
  onReplay: () => void;
}

export function PlaybackBar({
  status,
  sentenceIndex,
  totalSentences,
  disabled,
  autoScroll,
  onToggle,
  onStop,
  onPrevSentence,
  onNextSentence,
  onPrevParagraph,
  onNextParagraph,
  onToggleAutoScroll,
  onReplay,
}: PlaybackBarProps) {
  const playing = status === "speaking";
  const paused = status === "paused";
  const position = sentenceIndex >= 0 ? sentenceIndex + 1 : 0;
  const progress =
    totalSentences > 0 ? Math.round((position / totalSentences) * 100) : 0;

  return (
    <div className="sticky bottom-0 z-20 mt-6">
      <div className="vk-playbar rounded-xl border border-border p-3 shadow-[var(--shadow-3)]">
        <div
          className="mb-2 h-1 w-full overflow-hidden rounded-full bg-surface-sunken"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalSentences}
          aria-valuenow={position}
          aria-label="Reading position"
        >
          <div
            className="h-full bg-primary transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <IconButton
              label="Previous paragraph"
              onClick={onPrevParagraph}
              disabled={disabled}
              className="hidden sm:inline-flex"
            >
              <ChevronsLeft className="size-5" aria-hidden="true" />
            </IconButton>
            <IconButton
              label="Previous sentence"
              onClick={onPrevSentence}
              disabled={disabled}
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </IconButton>

            <button
              type="button"
              onClick={onToggle}
              disabled={disabled}
              aria-pressed={playing}
              aria-label={playing ? "Pause" : paused ? "Resume" : "Play"}
              className="inline-flex size-14 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed"
            >
              {playing ? (
                <Pause className="size-6" aria-hidden="true" />
              ) : (
                <Play className="size-6 translate-x-0.5" aria-hidden="true" />
              )}
            </button>

            <IconButton
              label="Replay sentence"
              onClick={onReplay}
              disabled={disabled}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </IconButton>

            <IconButton
              label="Next sentence"
              onClick={onNextSentence}
              disabled={disabled}
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </IconButton>
            <IconButton
              label="Next paragraph"
              onClick={onNextParagraph}
              disabled={disabled}
              className="hidden sm:inline-flex"
            >
              <ChevronsRight className="size-5" aria-hidden="true" />
            </IconButton>
            <IconButton
              label="Stop"
              onClick={onStop}
              disabled={disabled || status === "idle"}
            >
              <Square className="size-4" aria-hidden="true" />
            </IconButton>
          </div>

          <div className="flex items-center gap-3">
            <Waveform
              playing={playing}
              paused={paused}
              className="hidden h-5 sm:inline-flex"
            />
            <span className="vk-tabular text-sm text-text-muted">
              {position} / {totalSentences}
            </span>
            <IconButton
              label={autoScroll ? "Auto-scroll on" : "Auto-scroll off"}
              onClick={onToggleAutoScroll}
              pressed={autoScroll}
            >
              <ScrollText className="size-5" aria-hidden="true" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  pressed,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-md text-text transition-colors hover:bg-surface-sunken disabled:opacity-40 disabled:cursor-not-allowed",
        pressed && "text-primary",
        className
      )}
    >
      {children}
    </button>
  );
}
