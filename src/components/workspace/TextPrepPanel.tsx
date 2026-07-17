"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  isPrepActive,
  prepareText,
  type PrepOptions,
} from "@/lib/textprep";
import { cn } from "@/lib/cn";

interface TextPrepPanelProps {
  prep: PrepOptions;
  onChange: (patch: Partial<PrepOptions>) => void;
  sampleText: string;
}

const TOGGLES: { key: keyof PrepOptions; label: string; hint: string }[] = [
  {
    key: "expandNumbers",
    label: "Expand numbers",
    hint: "“1999” → “nineteen ninety-nine”, “$5.50” → “five dollars and fifty cents”",
  },
  {
    key: "expandAbbreviations",
    label: "Expand abbreviations",
    hint: "“Dr.”, “e.g.”, “etc.” read as full words",
  },
  {
    key: "normalizePauses",
    label: "Normalize pauses",
    hint: "Rewrites dashes, ellipses and semicolons into reliable pauses",
  },
];

const PREVIEW_LIMIT = 400;

export function TextPrepPanel({ prep, onChange, sampleText }: TextPrepPanelProps) {
  const [showPreview, setShowPreview] = useState(false);

  const preview = useMemo(() => {
    const before = sampleText.slice(0, PREVIEW_LIMIT);
    return { before, after: prepareText(before, prep) };
  }, [sampleText, prep]);

  const active = isPrepActive(prep);
  const changed = active && preview.before !== preview.after;

  return (
    <section aria-labelledby="prep-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 id="prep-heading" className="font-bold">
          Text preparation
        </h3>
        <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-xs text-text-muted">
          Local processing — not AI
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {TOGGLES.map((toggle) => (
          <li key={toggle.key}>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={prep[toggle.key]}
                onChange={(event) =>
                  onChange({ [toggle.key]: event.target.checked })
                }
                className="mt-1 size-4 accent-[var(--color-primary)]"
              />
              <span>
                <span className="font-medium text-text">{toggle.label}</span>
                <span className="block text-sm text-text-muted">
                  {toggle.hint}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      {sampleText.length > 0 ? (
        <div>
          <button
            type="button"
            onClick={() => setShowPreview((value) => !value)}
            aria-expanded={showPreview}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                showPreview && "rotate-180"
              )}
              aria-hidden="true"
            />
            Before / after preview
          </button>
          {showPreview ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <PreviewBox title="Before" text={preview.before} />
              <PreviewBox
                title={changed ? "After" : "After (no change)"}
                text={preview.after}
                highlight={changed}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function PreviewBox({
  title,
  text,
  highlight,
}: {
  title: string;
  text: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-2 text-sm",
        highlight ? "border-primary bg-primary-soft/40" : "border-border"
      )}
    >
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-text-muted">
        {title}
      </p>
      <p className="whitespace-pre-wrap text-text">{text || "—"}</p>
    </div>
  );
}
