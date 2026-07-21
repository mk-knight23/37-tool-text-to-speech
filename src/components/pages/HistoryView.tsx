"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { History, Play, Trash2 } from "lucide-react";
import {
  clearHistory,
  deleteHistoryEntry,
  listHistory,
  restoreHistoryEntry,
  type HistoryEntry,
} from "@/lib/storage";
import { formatDuration, formatRelativeTime } from "@/lib/format";
import { stashTextForWorkspace } from "@/lib/handoff";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";

const UNDO_MS = 6000;

export function HistoryView() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [deleted, setDeleted] = useState<HistoryEntry | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void listHistory().then(setEntries);
    track("history_opened");
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    };
  }, []);

  const speakAgain = (entry: HistoryEntry) => {
    stashTextForWorkspace(entry.text);
    router.push("/tool");
  };

  const remove = async (entry: HistoryEntry) => {
    await deleteHistoryEntry(entry.id);
    setEntries((current) => current?.filter((e) => e.id !== entry.id) ?? null);
    setDeleted(entry);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setDeleted(null), UNDO_MS);
  };

  const undo = async () => {
    if (!deleted) return;
    await restoreHistoryEntry(deleted.id);
    setEntries(await listHistory());
    setDeleted(null);
  };

  const clearAll = async () => {
    await clearHistory();
    setEntries([]);
    setConfirmClear(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">History</h1>
          <p className="mt-1 text-text-muted">
            Recently played text, stored only on this device.
          </p>
        </div>
        {entries && entries.length > 0 ? (
          confirmClear ? (
            <div className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={clearAll}>
                Clear everything
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmClear(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmClear(true)}
            >
              Clear all
            </Button>
          )
        ) : null}
      </div>

      {!entries ? (
        <p className="mt-8 text-text-muted" role="status">
          Loading…
        </p>
      ) : entries.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-surface p-8 text-center">
          <History
            className="mx-auto mb-3 size-8 text-text-muted"
            aria-hidden="true"
          />
          <p className="font-bold">Nothing here yet</p>
          <p className="mt-1 text-text-muted">
            Text you play will show up here so you can replay it later.
          </p>
          <div className="mt-4">
            <Link href="/tool">
              <Button>Open the workspace</Button>
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <p className="text-text">{entry.excerpt}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
                <span>{entry.voiceName}</span>
                <span aria-hidden="true">·</span>
                <span className="vk-tabular">
                  {entry.rate.toFixed(1)}× speed
                </span>
                <span aria-hidden="true">·</span>
                <span>{entry.chars.toLocaleString()} chars</span>
                {entry.durationMs > 0 ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{formatDuration(entry.durationMs)}</span>
                  </>
                ) : null}
                <span aria-hidden="true">·</span>
                <span>{formatRelativeTime(entry.completedAt)}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => speakAgain(entry)}>
                  <Play className="size-4" aria-hidden="true" />
                  Speak again
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(entry)}
                  aria-label="Delete entry"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {deleted ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 z-60 flex items-center gap-3 rounded-lg border border-border bg-surface-raised px-4 py-3 shadow-[var(--shadow-3)]"
        >
          <span className="text-sm">Entry deleted.</span>
          <button
            type="button"
            onClick={undo}
            className="text-sm font-bold text-primary hover:underline"
          >
            Undo
          </button>
        </div>
      ) : null}
    </div>
  );
}
