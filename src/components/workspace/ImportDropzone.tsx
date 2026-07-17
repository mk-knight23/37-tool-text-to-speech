"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import {
  ACCEPTED_EXTENSIONS,
  importFile,
  ImportError,
  type ImportResult,
} from "@/lib/parsers/file";
import { cn } from "@/lib/cn";

interface ImportDropzoneProps {
  onImported: (result: ImportResult) => void;
}

export function ImportDropzone({ onImported }: ImportDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const result = await importFile(file);
      onImported(result);
    } catch (err) {
      setError(
        err instanceof ImportError
          ? err.message
          : "Could not import that file. Try a different one."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void handleFile(event.dataTransfer.files[0]);
        }}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragOver
            ? "border-primary bg-primary-soft/40"
            : "border-border-strong hover:bg-surface-sunken"
        )}
      >
        {busy ? (
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        ) : (
          <FileUp className="size-6 text-text-muted" aria-hidden="true" />
        )}
        <span className="font-medium text-text">
          {busy ? "Reading file…" : "Import a file"}
        </span>
        <span className="text-sm text-text-muted">
          Drag & drop or click — .txt, .md, .pdf, .srt, .vtt (max 10 MB).
          Everything is processed in your browser.
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="sr-only"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {error ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
