"use client";

import { usePathname, useRouter } from "next/navigation";
import { Pause, Play, Square, Maximize2 } from "lucide-react";
import { useSpeechEngine } from "@/hooks/useSpeechEngine";

export function MiniPlayer() {
  const pathname = usePathname();
  const router = useRouter();
  const { engine, snapshot } = useSpeechEngine();

  // If on the workspace page, don't show the mini-player (it would conflict with the main player)
  const isWorkspace = pathname === "/" || pathname === "/tool";
  const isActive = snapshot.status === "speaking" || snapshot.status === "paused";

  if (isWorkspace || !isActive) return null;

  const playing = snapshot.status === "speaking";
  const position = snapshot.sentenceIndex >= 0 ? snapshot.sentenceIndex + 1 : 0;
  const progress =
    snapshot.totalSentences > 0
      ? Math.round((position / snapshot.totalSentences) * 100)
      : 0;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 animate-fade-in rounded-xl border border-border bg-surface/90 p-3 shadow-lg backdrop-blur-md">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-text truncate">
              Speaking Audio
            </p>
            <p className="text-[10px] text-text-muted">
              Sentence {position} of {snapshot.totalSentences} ({progress}%)
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            title="Expand to Workspace"
            className="rounded p-1 text-text-muted hover:bg-surface-sunken hover:text-text"
          >
            <Maximize2 size={14} />
          </button>
        </div>

        {/* Small progress line */}
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-sunken">
          <div
            className="h-full bg-primary transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => engine.toggle()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary hover:bg-primary-hover"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={14} /> : <Play size={14} className="translate-x-0.5" />}
            </button>
            <button
              onClick={() => engine.stop()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-muted hover:bg-surface-sunken hover:text-text"
              aria-label="Stop"
            >
              <Square size={12} />
            </button>
          </div>
          <span className="text-[10px] text-text-muted">
            {snapshot.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
