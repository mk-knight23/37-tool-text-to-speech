"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { SHORTCUTS } from "@/lib/shortcuts";

interface ShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Uses the native <dialog> element for a real focus trap and Esc handling.
 * Every shortcut listed here is implemented in the workspace (unlike legacy).
 */
export function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        // Close when the backdrop (the dialog element itself) is clicked.
        if (event.target === ref.current) onClose();
      }}
      className="m-auto w-[min(28rem,92vw)] rounded-xl border border-border bg-surface p-0 text-text shadow-[var(--shadow-3)] backdrop:bg-[rgb(11_21_25/0.5)]"
      aria-labelledby="shortcuts-title"
    >
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 id="shortcuts-title" className="text-lg font-bold">
          Keyboard shortcuts
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex size-9 items-center justify-center rounded-md text-text-muted hover:bg-surface-sunken"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <ul className="flex flex-col gap-2 p-4">
        {SHORTCUTS.map((shortcut) => (
          <li
            key={shortcut.keys}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-sm text-text">{shortcut.action}</span>
            <kbd className="vk-tabular rounded-sm border border-border-strong bg-surface-sunken px-2 py-0.5 text-xs">
              {shortcut.keys}
            </kbd>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
