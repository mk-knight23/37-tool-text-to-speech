"use client";

import { ArrowDown, ArrowUp, ListPlus, Play, Trash2 } from "lucide-react";
import type { QueueItem } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface QueuePanelProps {
  items: QueueItem[];
  activeId: string | null;
  canAdd: boolean;
  onAddCurrent: () => void;
  onLoad: (item: QueueItem) => void;
  onRemove: (id: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onClear: () => void;
}

export function QueuePanel({
  items,
  activeId,
  canAdd,
  onAddCurrent,
  onLoad,
  onRemove,
  onMove,
  onClear,
}: QueuePanelProps) {
  return (
    <section aria-labelledby="queue-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 id="queue-heading" className="font-bold">
          Queue
        </h3>
        {items.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-text-muted hover:text-danger"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-text-muted">
          Add sections to build a listening queue. Each item keeps its own text.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {items.map((item, index) => {
            const active = item.id === activeId;
            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-2 rounded-md border p-2",
                  active
                    ? "border-primary bg-primary-soft/40"
                    : "border-border"
                )}
              >
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => onMove(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${item.title} up`}
                    className="inline-flex size-6 items-center justify-center rounded-sm text-text-muted hover:bg-surface-sunken disabled:opacity-30"
                  >
                    <ArrowUp className="size-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, 1)}
                    disabled={index === items.length - 1}
                    aria-label={`Move ${item.title} down`}
                    className="inline-flex size-6 items-center justify-center rounded-sm text-text-muted hover:bg-surface-sunken disabled:opacity-30"
                  >
                    <ArrowDown className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.title}</p>
                  {active ? (
                    <p className="text-xs text-primary">Now loaded</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => onLoad(item)}
                  aria-label={`Load ${item.title}`}
                  className="inline-flex size-9 items-center justify-center rounded-md text-primary hover:bg-surface-sunken"
                >
                  <Play className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.title}`}
                  className="inline-flex size-9 items-center justify-center rounded-md text-text-muted hover:bg-surface-sunken hover:text-danger"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <Button variant="secondary" size="sm" onClick={onAddCurrent} disabled={!canAdd}>
        <ListPlus className="size-4" aria-hidden="true" />
        Add current text to queue
      </Button>
    </section>
  );
}
