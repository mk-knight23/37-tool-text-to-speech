"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  X,
  Copy,
  Check,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  SlidersHorizontal,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";
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
  const [openId, setOpenId] = useState<CapabilityId | null>("rewrite-for-natural-speech");
  const [params, setParams] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [output, setOutput] = useState("");
  const [objectResult, setObjectResult] = useState<unknown>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [editableOutput, setEditableOutput] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    void getByokKey().then(setByok);
    setQuota(getClientQuota());
  }, []);

  const groups = capabilityGroups();
  const openMeta = openId ? getCapabilityMeta(openId) : null;

  const trimmedLen = sourceText.trim().length;
  const overLimit = sourceText.length > MAX_INPUT_CHARS;
  const missingRequired = openMeta
    ? openMeta.params.some((spec) => spec.required && !(params[spec.name] ?? "").trim())
    : false;
  const canRun =
    trimmedLen > 0 && !overLimit && !missingRequired && status !== "running" && openMeta !== null;

  const selectCapability = (id: CapabilityId) => {
    if (status === "running") return;
    const meta = getCapabilityMeta(id);
    setOpenId(id);
    setParams(defaultParams(meta));
    setStatus("idle");
    setOutput("");
    setEditableOutput("");
    setObjectResult(null);
    setError(null);
  };

  const handleRun = async () => {
    if (!openMeta || !canRun) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("running");
    setOutput("");
    setEditableOutput("");
    setObjectResult(null);
    setError(null);

    try {
      if (openMeta.mode === "text") {
        const result = await runTextCapability({
          id: openMeta.id,
          text: sourceText,
          params,
          byok,
          signal: controller.signal,
          onChunk: (chunk) => {
            setOutput((prev) => prev + chunk);
            setEditableOutput((prev) => prev + chunk);
          },
        });
        setOutput(result.text);
        setEditableOutput(result.text);
        setStatus("done");
      } else {
        const result = await runObjectCapability({
          id: openMeta.id,
          text: sourceText,
          params,
          byok,
          signal: controller.signal,
        });
        setObjectResult(result.result);
        setStatus("done");
      }

      recordClientUsage();
      setQuota(getClientQuota());
      track("ai_completed");
    } catch (err) {
      if (isAbortError(err)) {
        setStatus("idle");
        return;
      }
      if (err instanceof AiClientError) {
        setError({ code: err.code, message: err.message });
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        setError({ code: "unknown", message: msg || "Generation failed." });
      }
      setStatus("error");
    }
  };

  const handleAccept = () => {
    if (!editableOutput && !output) return;
    onUseText(editableOutput || output);
    setStatus("idle");
  };

  const handleReject = () => {
    setStatus("idle");
    setOutput("");
    setEditableOutput("");
    setObjectResult(null);
  };

  const handleCopy = () => {
    const textToCopy = editableOutput || output;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Capability Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
        {groups.map((grp) => (
          <div key={grp.group} className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2 py-1">
              {grp.group}:
            </span>
            {grp.items.map((cap) => (
              <button
                key={cap.id}
                onClick={() => selectCapability(cap.id)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                  openId === cap.id
                    ? "bg-accent text-white shadow-sm font-bold"
                    : "text-text-muted hover:text-text hover:bg-surface-sunken border border-transparent"
                )}
              >
                {cap.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Selected Capability Description & Action Bar */}
      {openMeta && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border border-border p-3.5 rounded-xl">
          <div>
            <h4 className="font-bold text-sm text-text flex items-center gap-1.5">
              <Sparkles size={14} className="text-accent" />
              <span>{openMeta.label}</span>
            </h4>
            <p className="text-xs text-text-muted mt-0.5">{openMeta.description}</p>
          </div>

          <div className="flex items-center gap-3">
            {openMeta.params.map((spec) => (
              <div key={spec.name} className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-text-muted">{spec.label}:</label>
                {spec.kind === "select" ? (
                  <select
                    value={params[spec.name] ?? spec.defaultValue}
                    onChange={(e) => setParams({ ...params, [spec.name]: e.target.value })}
                    className="rounded border border-border bg-surface-sunken px-2 py-1 text-xs font-medium"
                  >
                    {spec.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={params[spec.name] ?? spec.defaultValue}
                    onChange={(e) => setParams({ ...params, [spec.name]: e.target.value })}
                    placeholder={spec.placeholder}
                    className="rounded border border-border bg-surface-sunken px-2 py-1 text-xs"
                  />
                )}
              </div>
            ))}

            <Button
              size="sm"
              disabled={!canRun}
              onClick={handleRun}
              className="bg-accent text-white hover:opacity-90 font-bold"
            >
              {status === "running" ? "Transforming…" : "Run Transformation"}
            </Button>
          </div>
        </div>
      )}

      {/* Error Message if any */}
      {error && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-xs text-danger font-medium flex items-center justify-between">
          <span>{error.message}</span>
          <button onClick={() => setError(null)} className="p-1 hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      )}

      {/* SIDE-BY-SIDE DIFF COMPARISON VIEW */}
      {status === "done" && output && (
        <div className="rounded-xl border border-accent/40 bg-surface p-4 shadow-md space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">
                ✓
              </span>
              <h4 className="font-bold text-sm text-text">Review Transformation Diff</h4>
            </div>

            {/* Accept / Reject / Copy / Undo Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={handleAccept}
                className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold"
              >
                <CheckCircle2 size={14} className="mr-1" /> Accept & Apply
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleReject}
                className="text-danger hover:bg-danger/10"
              >
                <XCircle size={14} className="mr-1" /> Reject
              </Button>
              <Button size="sm" variant="secondary" onClick={handleCopy}>
                {copied ? <Check size={14} className="text-emerald-500 mr-1" /> : <Copy size={14} className="mr-1" />}
                <span>{copied ? "Copied" : "Copy Result"}</span>
              </Button>
            </div>
          </div>

          {/* Side-by-Side Diff Container */}
          <div className="grid gap-4 md:grid-cols-2 text-xs">
            {/* Left: Original Version */}
            <div className="space-y-1.5 p-3 rounded-lg bg-surface-sunken border border-border">
              <span className="font-bold text-text-muted block uppercase text-[10px]">
                Original Version
              </span>
              <div className="whitespace-pre-wrap text-text-muted leading-relaxed font-mono">
                {sourceText}
              </div>
            </div>

            {/* Right: Suggested Version with Inline Edit */}
            <div className="space-y-1.5 p-3 rounded-lg bg-accent/5 border border-accent/30">
              <div className="flex items-center justify-between">
                <span className="font-bold text-accent block uppercase text-[10px]">
                  Suggested AI Transformation
                </span>
                <span className="text-[10px] text-text-muted">Editable below</span>
              </div>
              <textarea
                rows={8}
                value={editableOutput}
                onChange={(e) => setEditableOutput(e.target.value)}
                className="w-full bg-surface border border-accent/40 rounded p-2.5 text-xs text-text font-mono focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Structured Object Output (Chapters, Pronunciations, Dialogue) */}
      {status === "done" && objectResult !== null && (
        <div className="rounded-xl border border-accent/40 bg-surface p-4 shadow-md space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h4 className="font-bold text-sm text-accent">Structured Output Result</h4>
            <Button size="sm" variant="secondary" onClick={handleReject}>
              Close
            </Button>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-xs text-text bg-surface-sunken p-3 rounded-lg overflow-x-auto">
            {JSON.stringify(objectResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
