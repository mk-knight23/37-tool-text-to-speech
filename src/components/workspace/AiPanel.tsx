"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, X, Copy, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";
import { bucketChars } from "@/lib/format";
import {
  capabilityGroups,
  getCapabilityMeta,
  MAX_INPUT_CHARS,
  type CapabilityId,
  type CapabilityMeta,
  type Chapter,
  type DialogueTurn,
  type Pronunciation,
} from "@/lib/ai/catalog";
import {
  AiClientError,
  runObjectCapability,
  runTextCapability,
} from "@/lib/ai/client";
import {
  getClientQuota,
  recordClientUsage,
  type ClientQuota,
} from "@/lib/ai/quota-client";
import { getByokKey } from "@/lib/storage";

interface AiPanelProps {
  sourceText: string;
  onUseText: (text: string) => void;
}

type Status = "idle" | "running" | "done" | "error";

function defaultParams(meta: CapabilityMeta): Record<string, string> {
  const params: Record<string, string> = {};
  for (const spec of meta.params) {
    params[spec.name] = spec.defaultValue;
  }
  return params;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function AiPanel({ sourceText, onUseText }: AiPanelProps) {
  const [byok, setByok] = useState<string | null>(null);
  const [quota, setQuota] = useState<ClientQuota | null>(null);
  const [openId, setOpenId] = useState<CapabilityId | null>(null);
  const [params, setParams] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [output, setOutput] = useState("");
  const [objectResult, setObjectResult] = useState<unknown>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);
  const [resultMeta, setResultMeta] = useState<CapabilityMeta | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    void getByokKey().then(setByok);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only read
    setQuota(getClientQuota());
  }, []);

  const groups = capabilityGroups();
  const openMeta = openId ? getCapabilityMeta(openId) : null;

  const trimmedLen = sourceText.trim().length;
  const overLimit = sourceText.length > MAX_INPUT_CHARS;
  const missingRequired = openMeta
    ? openMeta.params.some(
        (spec) => spec.required && !(params[spec.name] ?? "").trim()
      )
    : false;
  const canRun =
    trimmedLen > 0 &&
    !overLimit &&
    !missingRequired &&
    status !== "running" &&
    openMeta !== null;

  const selectCapability = (id: CapabilityId) => {
    if (status === "running") return;
    const meta = getCapabilityMeta(id);
    setOpenId(id);
    setParams(defaultParams(meta));
    setStatus("idle");
    setOutput("");
    setObjectResult(null);
    setError(null);
    setSentNotice(false);
  };

  const run = async () => {
    if (!openMeta || !canRun) return;

    if (!byok && quota && quota.remaining <= 0) {
      setError({
        code: "quota_reached",
        message:
          "You've reached today's free AI limit. Add your own key in Settings to keep going.",
      });
      setStatus("error");
      track("quota_reached", { capability: openMeta.id });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setResultMeta(openMeta);
    setStatus("running");
    setOutput("");
    setObjectResult(null);
    setError(null);
    setSentNotice(false);
    track("ai_started", {
      capability: openMeta.id,
      chars: bucketChars(sourceText.length),
    });

    try {
      if (openMeta.mode === "text") {
        await runTextCapability({
          id: openMeta.id,
          text: sourceText,
          params,
          byok,
          signal: controller.signal,
          onChunk: (delta) => setOutput((prev) => prev + delta),
        });
      } else {
        const { result } = await runObjectCapability({
          id: openMeta.id,
          text: sourceText,
          params,
          byok,
          signal: controller.signal,
        });
        setObjectResult(result);
      }
      setStatus("done");
      track("ai_completed", { capability: openMeta.id });
      if (!byok) setQuota(recordClientUsage());
    } catch (caught) {
      if (isAbortError(caught)) {
        setStatus("idle");
        return;
      }
      const info =
        caught instanceof AiClientError
          ? { code: caught.code, message: caught.message }
          : {
              code: "network",
              message:
                "Could not reach the AI service. Check your connection and try again.",
            };
      setError(info);
      setStatus("error");
      track("ai_failed", { capability: openMeta.id, code: info.code });
      if (info.code === "quota_reached") {
        track("quota_reached", { capability: openMeta.id });
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const cancel = () => abortRef.current?.abort();

  const handleUseText = (text: string) => {
    onUseText(text);
    setSentNotice(true);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      track("result_copied", { capability: resultMeta?.id ?? "unknown" });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked — no-op; the text is still visible to select.
    }
  };

  return (
    <section
      aria-labelledby="ai-heading"
      className="mt-6 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-accent-soft text-accent">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <h2 id="ai-heading" className="text-lg font-bold">
            AI tools
          </h2>
        </div>
        <QuotaBadge byok={byok} quota={quota} />
      </div>
      <p className="mt-1 text-sm text-text-muted">
        Optional. These send your text to an AI model to rewrite, summarise, or
        restructure it, then you can send the result back to the workspace to
        listen. Everything else in MK VoiceKit runs without AI.
      </p>

      {/* Capability chooser */}
      <div className="mt-4 flex flex-col gap-3">
        {groups.map((group) => (
          <div key={group.group}>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
              {group.group}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.items.map((meta) => (
                <button
                  key={meta.id}
                  type="button"
                  aria-pressed={openId === meta.id}
                  onClick={() => selectCapability(meta.id)}
                  className={cn(
                    "min-h-9 rounded-md border px-3 text-sm font-medium transition-colors",
                    openId === meta.id
                      ? "border-primary bg-primary-soft text-text"
                      : "border-border-strong bg-surface text-text hover:bg-surface-sunken"
                  )}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected capability */}
      {openMeta ? (
        <div className="mt-4 rounded-lg border border-border bg-surface-sunken p-4">
          <p className="text-sm text-text-muted">{openMeta.description}</p>

          {openMeta.params.length > 0 ? (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {openMeta.params.map((spec) => (
                <label key={spec.name} className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">{spec.label}</span>
                  {spec.kind === "select" ? (
                    <select
                      value={params[spec.name] ?? spec.defaultValue}
                      onChange={(event) =>
                        setParams((prev) => ({
                          ...prev,
                          [spec.name]: event.target.value,
                        }))
                      }
                      className="min-h-9 rounded-md border border-border-strong bg-surface px-2"
                    >
                      {spec.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <input
                        type="text"
                        list={`ai-${spec.name}-list`}
                        value={params[spec.name] ?? ""}
                        maxLength={spec.maxLength}
                        placeholder={spec.placeholder}
                        onChange={(event) =>
                          setParams((prev) => ({
                            ...prev,
                            [spec.name]: event.target.value,
                          }))
                        }
                        className="min-h-9 rounded-md border border-border-strong bg-surface px-2"
                      />
                      {spec.suggestions ? (
                        <datalist id={`ai-${spec.name}-list`}>
                          {spec.suggestions.map((value) => (
                            <option key={value} value={value} />
                          ))}
                        </datalist>
                      ) : null}
                    </>
                  )}
                </label>
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {status === "running" ? (
              <Button variant="secondary" onClick={cancel}>
                <X className="size-4" aria-hidden="true" />
                Cancel
              </Button>
            ) : (
              <Button onClick={run} disabled={!canRun} loading={false}>
                <Sparkles className="size-4" aria-hidden="true" />
                Run
              </Button>
            )}
            {trimmedLen === 0 ? (
              <span className="text-sm text-text-muted">
                Add some text above first.
              </span>
            ) : overLimit ? (
              <span className="text-sm text-danger">
                Text is over the {MAX_INPUT_CHARS.toLocaleString()}-character
                limit for AI tools.
              </span>
            ) : status === "running" ? (
              <span
                role="status"
                aria-live="polite"
                className="text-sm text-text-muted"
              >
                Working…
              </span>
            ) : null}
          </div>

          {/* Error / degraded states */}
          {status === "error" && error ? (
            <div
              role="alert"
              className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              <p>{error.message}</p>
              {error.code === "ai_unavailable" ? (
                <p className="mt-1 text-text-muted">
                  You can add your own AI Gateway key in{" "}
                  <Link href="/settings" className="underline">
                    Settings
                  </Link>
                  , or use the deterministic Text prep tools (number and
                  abbreviation expansion) — those run in your browser without
                  AI.
                </p>
              ) : null}
            </div>
          ) : null}

          {/* Text output */}
          {openMeta.mode === "text" && (status === "running" || output) ? (
            <TextResult
              text={output}
              streaming={status === "running"}
              copied={copied}
              sent={sentNotice}
              onUse={() => handleUseText(output)}
              onCopy={() => copy(output)}
            />
          ) : null}

          {/* Object output */}
          {openMeta.mode === "object" &&
          status === "done" &&
          objectResult !== null &&
          resultMeta ? (
            <ObjectResult
              meta={resultMeta}
              result={objectResult}
              copied={copied}
              sent={sentNotice}
              onUse={handleUseText}
              onCopy={copy}
            />
          ) : null}
        </div>
      ) : null}

      <p className="mt-3 text-xs text-text-muted">
        AI can make mistakes. Check important text before you rely on it. Your
        key and text are sent only when you press Run, and are never stored on a
        server.
      </p>
    </section>
  );
}

function QuotaBadge({
  byok,
  quota,
}: {
  byok: string | null;
  quota: ClientQuota | null;
}) {
  if (byok) {
    return (
      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
        Using your own key
      </span>
    );
  }
  if (!quota) return null;
  return (
    <span className="rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-medium text-text-muted">
      {quota.remaining} of {quota.limit} free AI actions left today
    </span>
  );
}

function ResultActions({
  onUse,
  onCopy,
  copied,
  sent,
  useLabel,
}: {
  onUse: () => void;
  onCopy: () => void;
  copied: boolean;
  sent: boolean;
  useLabel: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Button size="sm" onClick={onUse}>
        <ArrowRight className="size-4" aria-hidden="true" />
        {useLabel}
      </Button>
      <Button size="sm" variant="secondary" onClick={onCopy}>
        {copied ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Copy className="size-4" aria-hidden="true" />
        )}
        {copied ? "Copied" : "Copy"}
      </Button>
      {sent ? (
        <span role="status" className="text-sm text-success">
          Sent to the workspace.
        </span>
      ) : null}
    </div>
  );
}

function TextResult({
  text,
  streaming,
  copied,
  sent,
  onUse,
  onCopy,
}: {
  text: string;
  streaming: boolean;
  copied: boolean;
  sent: boolean;
  onUse: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        <span className="rounded bg-accent-soft px-1.5 py-0.5 text-xs font-bold text-accent">
          AI
        </span>
        <span className="text-xs text-text-muted">
          {streaming ? "Generating…" : "Result"}
        </span>
      </div>
      <div className="mt-1.5 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-surface p-3 text-sm">
        {text}
        {streaming ? <span className="animate-pulse">▍</span> : null}
      </div>
      {!streaming && text ? (
        <ResultActions
          onUse={onUse}
          onCopy={onCopy}
          copied={copied}
          sent={sent}
          useLabel="Use this text"
        />
      ) : null}
    </div>
  );
}

function ObjectResult({
  meta,
  result,
  copied,
  sent,
  onUse,
  onCopy,
}: {
  meta: CapabilityMeta;
  result: unknown;
  copied: boolean;
  sent: boolean;
  onUse: (text: string) => void;
  onCopy: (text: string) => void;
}) {
  if (meta.objectKind === "chapters") {
    const chapters = (result as { chapters: Chapter[] }).chapters ?? [];
    const asText = chapters
      .map((c, i) => `${i + 1}. ${c.title} — ${c.summary}`)
      .join("\n");
    return (
      <div className="mt-3">
        <ResultLabel text="Chapters" />
        <ol className="mt-1.5 flex flex-col gap-2 rounded-md border border-border bg-surface p-3 text-sm">
          {chapters.map((chapter, index) => (
            <li key={index}>
              <span className="font-bold">
                {index + 1}. {chapter.title}
              </span>
              <span className="block text-text-muted">{chapter.summary}</span>
            </li>
          ))}
        </ol>
        <ResultActions
          onUse={() => onUse(asText)}
          onCopy={() => onCopy(asText)}
          copied={copied}
          sent={sent}
          useLabel="Use as text"
        />
      </div>
    );
  }

  if (meta.objectKind === "pronunciations") {
    const items = (result as { items: Pronunciation[] }).items ?? [];
    if (items.length === 0) {
      return (
        <div className="mt-3">
          <ResultLabel text="Pronunciation" />
          <p className="mt-1.5 rounded-md border border-border bg-surface p-3 text-sm text-text-muted">
            No likely-mispronounced words were found in this text.
          </p>
        </div>
      );
    }
    const asText = items
      .map((item) => `${item.term}: ${item.respelling} (${item.note})`)
      .join("\n");
    return (
      <div className="mt-3">
        <ResultLabel text="Pronunciation suggestions" />
        <ul className="mt-1.5 flex flex-col gap-2 rounded-md border border-border bg-surface p-3 text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-bold">{item.term}</span>
              <span className="font-mono text-primary">{item.respelling}</span>
              <span className="block w-full text-text-muted">{item.note}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <Button size="sm" variant="secondary" onClick={() => onCopy(asText)}>
            {copied ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy list"}
          </Button>
        </div>
      </div>
    );
  }

  // dialogue
  const turns = (result as { turns: DialogueTurn[] }).turns ?? [];
  const asText = turns.map((turn) => `${turn.speaker}: ${turn.text}`).join("\n\n");
  return (
    <div className="mt-3">
      <ResultLabel text="Multi-speaker script" />
      <div className="mt-1.5 flex flex-col gap-2 rounded-md border border-border bg-surface p-3 text-sm">
        {turns.map((turn, index) => (
          <p key={index}>
            <span className="font-bold text-primary">{turn.speaker}: </span>
            {turn.text}
          </p>
        ))}
      </div>
      <ResultActions
        onUse={() => onUse(asText)}
        onCopy={() => onCopy(asText)}
        copied={copied}
        sent={sent}
        useLabel="Use as text"
      />
    </div>
  );
}

function ResultLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="rounded bg-accent-soft px-1.5 py-0.5 text-xs font-bold text-accent">
        AI
      </span>
      <span className="text-xs text-text-muted">{text}</span>
    </div>
  );
}
