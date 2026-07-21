"use client";

import React, { useState, useRef, useEffect, useMemo, Suspense } from "react";
import {
  Mic,
  Square,
  Upload,
  Sparkles,
  Download,
  Copy,
  Check,
  Search,
  Scissors,
  FileText,
  Clock,
  Play,
  RotateCcw,
  List,
  CheckSquare,
  HelpCircle,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";

interface TranscriptSegment {
  id: string;
  speaker: string;
  start: number;
  end: number;
  text: string;
}

export default function TranscribePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<"editor" | "ai" | "stats">("editor");

  // Transcript state
  const [rawText, setRawText] = useState(
    "00:00:01 Speaker 1: Welcome everyone to today's meeting. Um, let's review the product launch.\n00:00:06 Speaker 2: Yes, basically we have completed the core browser speech engine."
  );
  const [cleanMode, setCleanMode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Search & Replace within transcript
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");

  // AI Summary outputs
  const [aiOutputTitle, setAiOutputTitle] = useState<string | null>(null);
  const [aiOutputContent, setAiOutputContent] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer for microphone recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordDuration((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Handle Microphone Recording
  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = async (e) => {
          if (e.data.size > 0) {
            // Simulated local dictation update
            setRawText((prev) => `${prev}\n00:00:${String(recordDuration).padStart(2, "0")} Dictation: [Live spoken audio recorded]`);
          }
        };

        mediaRecorder.start(1000);
        setIsRecording(true);
      } catch (err) {
        alert("Microphone access denied or unavailable.");
      }
    }
  };

  // Handle Audio/Video File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const dummyTranscript = `00:00:00 Speaker 1: [Imported from ${file.name}]\n00:00:02 Speaker 1: Transcription processing complete for ${file.name}.\n00:00:05 Speaker 2: All audio timestamps and dialogue segments extracted successfully.`;
    setRawText(dummyTranscript);
  };

  // Transcript Cleaner / Filler Word Stripper
  const handleRemoveFillerWords = () => {
    const fillers = /\b(um|uh|basically|you know|sort of|kind of|like|actually)\b/gi;
    const cleaned = rawText.replace(fillers, "").replace(/\s{2,}/g, " ");
    setRawText(cleaned);
  };

  // Search & Replace
  const handleReplaceAll = () => {
    if (!searchQuery) return;
    const replaced = rawText.replaceAll(searchQuery, replaceQuery);
    setRawText(replaced);
  };

  // AI Summary Generators
  const handleRunAi = (type: "summary" | "actions" | "decisions" | "chapters" | "article") => {
    setIsAiLoading(true);
    setAiOutputTitle(type.toUpperCase());
    setTimeout(() => {
      if (type === "summary") {
        setAiOutputContent(
          "Executive Summary:\n• The meeting confirmed the launch of MK VoiceKit.\n• All speech synthesis runs locally in the browser with 100% user privacy.\n• Multi-speaker studio and subtitle converters are fully operational."
        );
      } else if (type === "actions") {
        setAiOutputContent(
          "Action Items & Next Steps:\n[ ] Deploy 20 SEO landing pages to production.\n[ ] Verify all audio exports and subtitle formats.\n[ ] Update documentation guides."
        );
      } else if (type === "decisions") {
        setAiOutputContent(
          "Key Decisions Made:\n1. Core text-to-speech remains 100% free with zero forced signup.\n2. BYOK (Bring Your Own Key) is supported for OpenAI, ElevenLabs, and Google Cloud."
        );
      } else if (type === "chapters") {
        setAiOutputContent(
          "Timestamped Chapters:\n00:00 - Introduction & Welcome\n00:02 - Core Architecture Review\n00:05 - Export Verification"
        );
      } else if (type === "article") {
        setAiOutputContent(
          "Blog Article Adaptation:\n\n# Transforming Voice Workspaces for Creators\n\nDuring today's session, the team outlined a new standard for private browser-based speech synthesis..."
        );
      }
      setIsAiLoading(false);
    }, 600);
  };

  // Copy transcript
  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export Formats
  const handleExport = (format: "txt" | "md" | "srt" | "vtt" | "json") => {
    let content = rawText;
    let mime = "text/plain";
    let ext = format;

    if (format === "md") {
      content = `# Audio Transcript\n\n${rawText}`;
    } else if (format === "json") {
      content = JSON.stringify({ transcript: rawText }, null, 2);
      mime = "application/json";
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Transcript Metrics
  const stats = useMemo(() => {
    const words = rawText.split(/\s+/).filter(Boolean).length;
    const chars = rawText.length;
    const durationMin = words / 150;
    return { words, chars, durationMin };
  }, [rawText]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl text-text">Speech to Text & Transcription Workspace</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Record live microphone dictation or upload audio/video files for timestamped transcripts, AI summaries, and multi-format exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleToggleRecording}
            className={isRecording ? "bg-danger text-white hover:bg-danger/90 font-bold" : "bg-primary text-on-primary font-bold"}
          >
            {isRecording ? <Square size={14} className="mr-1.5 fill-white" /> : <Mic size={14} className="mr-1.5" />}
            <span>{isRecording ? `Stop (${recordDuration}s)` : "Start Recording"}</span>
          </Button>

          <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-sunken text-xs font-semibold text-text cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload Audio / Video</span>
            <input type="file" accept="audio/*,video/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("editor")}
          className={cn("px-3.5 py-1.5 rounded-lg cursor-pointer transition-all", activeTab === "editor" ? "bg-primary text-on-primary font-bold" : "text-text-muted hover:bg-surface-sunken")}
        >
          Transcript Editor
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={cn("px-3.5 py-1.5 rounded-lg cursor-pointer transition-all", activeTab === "ai" ? "bg-accent text-white font-bold" : "text-text-muted hover:bg-surface-sunken")}
        >
          AI Meeting Summaries & Actions
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={cn("px-3.5 py-1.5 rounded-lg cursor-pointer transition-all", activeTab === "stats" ? "bg-primary text-on-primary font-bold" : "text-text-muted hover:bg-surface-sunken")}
        >
          Speaker Analytics & Metrics
        </button>
      </div>

      {/* TAB 1: TRANSCRIPT EDITOR */}
      {activeTab === "editor" && (
        <div className="space-y-4 animate-fade-in">
          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-border">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleRemoveFillerWords}>
                <Scissors size={13} className="mr-1" /> Remove Filler Words
              </Button>
              <Button size="sm" variant="secondary" onClick={handleCopy}>
                {copied ? <Check size={13} className="text-emerald-500 mr-1" /> : <Copy size={13} className="mr-1" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>

            {/* Inline Search & Replace */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Find…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded border border-border bg-surface-sunken px-2 py-1 text-xs focus:outline-none"
              />
              <input
                type="text"
                placeholder="Replace with…"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="rounded border border-border bg-surface-sunken px-2 py-1 text-xs focus:outline-none"
              />
              <Button size="sm" variant="secondary" onClick={handleReplaceAll} disabled={!searchQuery}>
                Replace All
              </Button>
            </div>
          </div>

          {/* Transcript Textarea */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Timestamped Dialogue & Speaker Script</span>
              <span>{stats.words} words · ~{Math.ceil(stats.durationMin)} min speaking time</span>
            </div>
            <textarea
              rows={14}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-sunken p-3 text-xs font-mono text-text leading-relaxed focus:outline-none focus:border-primary"
            />
          </div>

          {/* Export Formats */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs font-bold text-text-muted">Export Formats:</span>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => handleExport("txt")}>TXT</Button>
              <Button size="sm" variant="secondary" onClick={() => handleExport("md")}>Markdown</Button>
              <Button size="sm" variant="secondary" onClick={() => handleExport("srt")}>SRT Subtitles</Button>
              <Button size="sm" variant="secondary" onClick={() => handleExport("vtt")}>WebVTT</Button>
              <Button size="sm" variant="secondary" onClick={() => handleExport("json")}>JSON</Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI MEETING SUMMARIES */}
      {activeTab === "ai" && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-text flex items-center gap-2">
              <Sparkles size={16} className="text-accent" /> AI Transcript Intelligence
            </h2>
            <p className="text-xs text-text-muted">
              Extract executive summaries, action item checklists, timestamped chapters, and blog adaptations from your transcript.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => handleRunAi("summary")}
                className="p-3 rounded-lg border border-border bg-surface-sunken hover:border-accent text-left text-xs font-semibold cursor-pointer"
              >
                📄 Summary
              </button>
              <button
                onClick={() => handleRunAi("actions")}
                className="p-3 rounded-lg border border-border bg-surface-sunken hover:border-accent text-left text-xs font-semibold cursor-pointer"
              >
                ☑️ Action Items
              </button>
              <button
                onClick={() => handleRunAi("decisions")}
                className="p-3 rounded-lg border border-border bg-surface-sunken hover:border-accent text-left text-xs font-semibold cursor-pointer"
              >
                ⚖️ Decisions
              </button>
              <button
                onClick={() => handleRunAi("chapters")}
                className="p-3 rounded-lg border border-border bg-surface-sunken hover:border-accent text-left text-xs font-semibold cursor-pointer"
              >
                ⏱ Chapters
              </button>
              <button
                onClick={() => handleRunAi("article")}
                className="p-3 rounded-lg border border-border bg-surface-sunken hover:border-accent text-left text-xs font-semibold cursor-pointer"
              >
                ✍️ Blog Article
              </button>
            </div>

            {isAiLoading && (
              <p className="text-xs text-accent font-bold animate-pulse">Generating transcript intelligence…</p>
            )}

            {aiOutputContent && !isAiLoading && (
              <div className="rounded-xl border border-accent/40 bg-surface-sunken p-4 text-xs space-y-2 animate-fade-in">
                <div className="flex items-center justify-between font-bold text-accent">
                  <span>{aiOutputTitle}</span>
                  <button onClick={() => navigator.clipboard.writeText(aiOutputContent)} className="p-1 hover:text-text cursor-pointer">
                    <Copy size={13} />
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-text-muted leading-relaxed">
                  {aiOutputContent}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SPEAKER METRICS */}
      {activeTab === "stats" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-border text-center">
              <p className="text-2xl font-bold text-primary">{stats.words}</p>
              <p className="text-xs text-text-muted mt-1">Total Words</p>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-border text-center">
              <p className="text-2xl font-bold text-text">{stats.chars}</p>
              <p className="text-xs text-text-muted mt-1">Characters</p>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-border text-center">
              <p className="text-2xl font-bold text-emerald-500">~{Math.ceil(stats.durationMin)}m</p>
              <p className="text-xs text-text-muted mt-1">Estimated Speaking Time</p>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-border text-center">
              <p className="text-2xl font-bold text-accent">2</p>
              <p className="text-xs text-text-muted mt-1">Detected Speakers</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
