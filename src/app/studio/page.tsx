"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Plus,
  Play,
  Square,
  Volume2,
  Settings,
  Download,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Music,
  FolderOpen,
  Save,
  Check,
  FileText,
  Sliders,
  Layers,
} from "lucide-react";
import { useVoices } from "@/hooks/useVoices";
import { useSpeechEngine } from "@/hooks/useSpeechEngine";
import { segmentText } from "@/lib/speech/segment";
import { Button } from "@/components/ui/Button";
import {
  getLibraryItem,
  saveLibraryItem,
  listLibraryItems,
  type LibraryItem,
  type ProjectScene,
} from "@/lib/storage";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";

interface StudioTemplate {
  name: string;
  description: string;
  scenes: { speaker: string; text: string; rate: number; pitch: number; pauseAfterSeconds: number }[];
}

const STARTER_TEMPLATES: StudioTemplate[] = [
  {
    name: "Two-Person Podcast",
    description: "Conversational host and guest dialogue with intro hook and sign-off.",
    scenes: [
      { speaker: "Host", text: "Welcome back to MK VoiceKit! Today we are exploring the future of browser speech synthesis.", rate: 1.0, pitch: 1.0, pauseAfterSeconds: 0.5 },
      { speaker: "Guest", text: "Thanks for having me! It's incredible how fast and private on-device audio generation has become.", rate: 1.05, pitch: 1.1, pauseAfterSeconds: 0.5 },
      { speaker: "Host", text: "Exactly. No forced signups, no audio uploads, just pure performance.", rate: 1.0, pitch: 1.0, pauseAfterSeconds: 0 },
    ],
  },
  {
    name: "Interview",
    description: "Structured Q&A session between an interviewer and expert respondent.",
    scenes: [
      { speaker: "Interviewer", text: "Can you explain how local text-to-speech maintains 100% user privacy?", rate: 1.0, pitch: 1.0, pauseAfterSeconds: 0.8 },
      { speaker: "Expert", text: "Certainly. All text parsing and audio synthesis happen directly in the browser using the Web Speech API.", rate: 0.95, pitch: 0.9, pauseAfterSeconds: 0 },
    ],
  },
  {
    name: "Audiobook",
    description: "Dramatic long-form narration with soothing chapter pacing and character turns.",
    scenes: [
      { speaker: "Narrator", text: "Chapter One. The city was quiet under the neon rain as the machine woke up.", rate: 0.88, pitch: 0.95, pauseAfterSeconds: 1.0 },
      { speaker: "Character", text: "'Who is out there?' a voice whispered from the darkness.", rate: 0.92, pitch: 1.15, pauseAfterSeconds: 0.5 },
    ],
  },
  {
    name: "YouTube Narration",
    description: "High-energy video script with punchy retention hooks and visual cues.",
    scenes: [
      { speaker: "Narrator", text: "Stop scrolling! Here are three AI audio tools you need to know about right now.", rate: 1.25, pitch: 1.05, pauseAfterSeconds: 0.3 },
      { speaker: "Narrator", text: "Number one: free browser voice generation that runs completely offline.", rate: 1.15, pitch: 1.0, pauseAfterSeconds: 0 },
    ],
  },
  {
    name: "Product Advertisement",
    description: "Persuasive 30-second commercial voiceover with strong call to action.",
    scenes: [
      { speaker: "Voiceover", text: "Tired of complicated voice apps that force you to create an account just to test them?", rate: 1.1, pitch: 1.0, pauseAfterSeconds: 0.4 },
      { speaker: "Voiceover", text: "Try MK VoiceKit today. Free, private, and instant. Start listening now.", rate: 1.05, pitch: 1.05, pauseAfterSeconds: 0 },
    ],
  },
  {
    name: "Educational Lesson",
    description: "Clear pedagogical modules with calm, articulate step-by-step explanations.",
    scenes: [
      { speaker: "Instructor", text: "In this lesson, we will examine the difference between client-side speech synthesis and server AI voices.", rate: 0.95, pitch: 1.0, pauseAfterSeconds: 0.8 },
    ],
  },
  {
    name: "News Bulletin",
    description: "Concise journalistic reporting style with anchor and field reporter.",
    scenes: [
      { speaker: "Anchor", text: "Good evening. Tonight's top story: browser privacy standards reach a major milestone.", rate: 1.1, pitch: 0.95, pauseAfterSeconds: 0.5 },
    ],
  },
  {
    name: "Meditation & Relaxation",
    description: "Slow, soothing voice guidance with gentle pauses for mindfulness.",
    scenes: [
      { speaker: "Guide", text: "Take a deep breath in... hold for three seconds... and slowly exhale.", rate: 0.75, pitch: 0.85, pauseAfterSeconds: 2.0 },
    ],
  },
  {
    name: "Storytelling",
    description: "Engaging children's story or fable with expressive vocal character changes.",
    scenes: [
      { speaker: "Storyteller", text: "Once upon a time in a digital forest, a little algorithm found a lost song.", rate: 0.95, pitch: 1.1, pauseAfterSeconds: 0.7 },
    ],
  },
  {
    name: "Customer Support Dialogue",
    description: "Helpful agent and customer exchange resolving a technical inquiry.",
    scenes: [
      { speaker: "Support Agent", text: "Thank you for contacting support! How can I assist you with your audio project today?", rate: 1.0, pitch: 1.05, pauseAfterSeconds: 0.5 },
      { speaker: "Customer", text: "Hi! I wanted to check if I can export my multi-speaker script to SRT subtitles.", rate: 1.05, pitch: 1.0, pauseAfterSeconds: 0 },
    ],
  },
];

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("id");

  const [projectTitle, setProjectTitle] = useState("Untitled Multi-Speaker Studio Project");
  const [scenes, setScenes] = useState<ProjectScene[]>([
    {
      id: crypto.randomUUID(),
      speaker: "Host",
      voiceURI: "",
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      pauseAfterSeconds: 0.5,
      text: "Welcome to MK VoiceKit Studio! You can build multi-speaker voiceovers and podcast scenes here.",
    },
    {
      id: crypto.randomUUID(),
      speaker: "Guest",
      voiceURI: "",
      rate: 1.1,
      pitch: 1.1,
      volume: 1.0,
      pauseAfterSeconds: 0.5,
      text: "Assign distinct voices to each character, mix background music, and export your project anytime.",
    },
  ]);

  const [activeSceneIdx, setActiveSceneIdx] = useState<number | null>(null);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const [bgMusicName, setBgMusicName] = useState<string | null>(null);
  const [bgMusicVol, setBgMusicVol] = useState(0.3);
  const [bgMusicDuck, setBgMusicDuck] = useState(60);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { voices } = useVoices();
  const { engine, snapshot } = useSpeechEngine();
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load project if ID provided
  useEffect(() => {
    if (!projectId) return;
    async function load() {
      const item = await getLibraryItem(projectId!);
      if (item && item.type === "project") {
        setProjectTitle(item.title);
        if (item.scenes && item.scenes.length > 0) setScenes(item.scenes);
      }
    }
    load();
  }, [projectId]);

  // Handle template selection
  const handleSelectTemplate = (template: StudioTemplate) => {
    const newScenes: ProjectScene[] = template.scenes.map((s, idx) => ({
      id: crypto.randomUUID(),
      speaker: s.speaker,
      voiceURI: voices[idx % Math.max(1, voices.length)]?.voiceURI || "",
      rate: s.rate,
      pitch: s.pitch,
      volume: 1.0,
      pauseAfterSeconds: s.pauseAfterSeconds,
      text: s.text,
    }));
    setScenes(newScenes);
    setProjectTitle(`${template.name} Project`);
  };

  // Scene CRUD Operations
  const handleAddScene = () => {
    setScenes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        speaker: `Speaker ${prev.length + 1}`,
        voiceURI: voices[prev.length % Math.max(1, voices.length)]?.voiceURI || "",
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        pauseAfterSeconds: 0.5,
        text: "",
      },
    ]);
  };

  const handleDuplicateScene = (idx: number) => {
    const target = scenes[idx];
    const clone: ProjectScene = { ...target, id: crypto.randomUUID(), speaker: `${target.speaker} (Copy)` };
    const updated = [...scenes];
    updated.splice(idx + 1, 0, clone);
    setScenes(updated);
  };

  const handleDeleteScene = (idx: number) => {
    if (scenes.length <= 1) return;
    setScenes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveScene = (idx: number, direction: "up" | "down") => {
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === scenes.length - 1)) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const updated = [...scenes];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setScenes(updated);
  };

  const handleUpdateScene = (idx: number, patch: Partial<ProjectScene>) => {
    setScenes((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  // Play Single Scene
  const handlePlaySingleScene = (idx: number) => {
    const s = scenes[idx];
    if (!s.text.trim()) return;
    const voice = voices.find((v) => v.voiceURI === s.voiceURI) || null;
    const seg = segmentText(s.text);
    engine.setSentences(seg.sentences);
    engine.setSettings({ voice, rate: s.rate, pitch: s.pitch, volume: s.volume });
    engine.playSentence(0);
  };

  // Timeline Sequential Playback
  const playSceneSequence = (idx: number) => {
    if (idx >= scenes.length) {
      setIsPlayingTimeline(false);
      setActiveSceneIdx(null);
      engine.stop();
      return;
    }
    setActiveSceneIdx(idx);
    const s = scenes[idx];
    const voice = voices.find((v) => v.voiceURI === s.voiceURI) || null;
    const seg = segmentText(s.text);
    engine.setSentences(seg.sentences);
    engine.setSettings({ voice, rate: s.rate, pitch: s.pitch, volume: s.volume });
    engine.playSentence(0);
  };

  useEffect(() => {
    engine.setCallbacks({
      onComplete: () => {
        if (!isPlayingTimeline || activeSceneIdx === null) return;
        const currentScene = scenes[activeSceneIdx];
        setTimeout(() => {
          playSceneSequence(activeSceneIdx + 1);
        }, (currentScene?.pauseAfterSeconds || 0.5) * 1000);
      },
      onStopped: () => {
        if (isPlayingTimeline && snapshot.status === "idle") {
          setIsPlayingTimeline(false);
          setActiveSceneIdx(null);
        }
      },
    });
    return () => engine.setCallbacks({});
  }, [isPlayingTimeline, activeSceneIdx, scenes, voices]);

  const handleToggleTimeline = () => {
    if (isPlayingTimeline) {
      setIsPlayingTimeline(false);
      setActiveSceneIdx(null);
      engine.stop();
    } else {
      setIsPlayingTimeline(true);
      playSceneSequence(0);
    }
  };

  // Save Project
  const handleSaveProject = async () => {
    const fullText = scenes.map((s) => `[${s.speaker}]: ${s.text}`).join("\n\n");
    const item: LibraryItem = {
      id: projectId || crypto.randomUUID(),
      type: "project",
      title: projectTitle,
      content: fullText,
      scenes,
      tags: [],
      archived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveLibraryItem(item);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Export Formats
  const handleExportProject = (format: "json" | "script" | "srt" | "vtt") => {
    let content = "";
    let mime = "text/plain";
    let ext = "txt";

    if (format === "json") {
      content = JSON.stringify({ title: projectTitle, scenes }, null, 2);
      mime = "application/json";
      ext = "json";
    } else if (format === "script") {
      content = scenes.map((s) => `SPEAKER: ${s.speaker.toUpperCase()}\nVOICE: ${s.voiceURI || "Default"}\n${s.text}\n`).join("\n---\n\n");
      ext = "txt";
    } else if (format === "srt" || format === "vtt") {
      let timeSec = 0;
      const subs = scenes.map((s, idx) => {
        const dur = (s.text.split(/\s+/).length / (150 * s.rate)) * 60;
        const start = formatTime(timeSec, format === "vtt");
        timeSec += dur;
        const end = formatTime(timeSec, format === "vtt");
        timeSec += s.pauseAfterSeconds || 0.5;

        if (format === "vtt") {
          return `${start} --> ${end}\n<v ${s.speaker}>${s.text}\n`;
        }
        return `${idx + 1}\n${start} --> ${end}\n[${s.speaker}]: ${s.text}\n`;
      });

      content = format === "vtt" ? `WEBVTT - ${projectTitle}\n\n` + subs.join("\n") : subs.join("\n\n");
      ext = format;
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectTitle.replace(/[^a-z0-9]/gi, "_")}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  function formatTime(seconds: number, isVtt = false): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    const sep = isVtt ? "." : ",";
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}${sep}${String(ms).padStart(3, "0")}`;
  }

  const totalWords = useMemo(() => scenes.reduce((acc, s) => acc + s.text.split(/\s+/).filter(Boolean).length, 0), [scenes]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="text-xl sm:text-2xl font-bold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none"
          />
          <p className="text-xs text-text-muted mt-1">
            {scenes.length} scenes · {totalWords} words · Multi-speaker timeline sequencer
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleSaveProject}>
            {savedSuccess ? <Check className="size-3.5 text-emerald-500 mr-1" /> : <Save className="size-3.5 mr-1" />}
            <span>{savedSuccess ? "Saved to Library" : "Save Project"}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleToggleTimeline}
            className={isPlayingTimeline ? "bg-danger text-white" : "bg-primary text-on-primary"}
          >
            {isPlayingTimeline ? <Square className="size-3.5 mr-1.5 fill-white" /> : <Play className="size-3.5 mr-1.5 fill-current" />}
            <span>{isPlayingTimeline ? "Stop Timeline" : "Play Timeline"}</span>
          </Button>
        </div>
      </div>

      {/* 10 Starter Project Templates Bar */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <Sparkles size={14} className="text-accent" /> 10 Starter Studio Templates
        </h3>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {STARTER_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              onClick={() => handleSelectTemplate(tmpl)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-surface-sunken hover:border-primary/50 text-xs font-semibold text-text transition-all cursor-pointer text-left shrink-0"
              title={tmpl.description}
            >
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Speaker Scene Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text flex items-center gap-2">
            <Layers size={18} className="text-primary" /> Scene Timeline
          </h2>
          <Button size="sm" variant="secondary" onClick={handleAddScene}>
            <Plus size={14} className="mr-1" /> Add Scene Block
          </Button>
        </div>

        <div className="space-y-4">
          {scenes.map((scene, idx) => {
            const isPlaying = activeSceneIdx === idx && isPlayingTimeline;
            return (
              <div
                key={scene.id}
                className={cn(
                  "rounded-xl border p-4 shadow-sm transition-all space-y-3 bg-surface",
                  isPlaying ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border"
                )}
              >
                {/* Scene Header Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={scene.speaker}
                      onChange={(e) => handleUpdateScene(idx, { speaker: e.target.value })}
                      placeholder="Speaker Name"
                      className="text-xs font-bold bg-surface-sunken border border-border rounded px-2 py-1 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Voice Picker */}
                    <select
                      value={scene.voiceURI || ""}
                      onChange={(e) => handleUpdateScene(idx, { voiceURI: e.target.value })}
                      className="text-xs rounded border border-border bg-surface-sunken px-2 py-1 max-w-[160px] truncate focus:outline-none"
                    >
                      <option value="">Default Voice</option>
                      {voices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>

                    {/* Speed Slider */}
                    <div className="flex items-center gap-1 text-[11px] text-text-muted">
                      <span>Rate:</span>
                      <input
                        type="number"
                        step="0.05"
                        min="0.5"
                        max="2.5"
                        value={scene.rate}
                        onChange={(e) => handleUpdateScene(idx, { rate: parseFloat(e.target.value) || 1.0 })}
                        className="w-12 text-xs rounded border border-border bg-surface-sunken px-1 py-0.5"
                      />
                    </div>

                    {/* Pause after scene */}
                    <div className="flex items-center gap-1 text-[11px] text-text-muted">
                      <span>Pause:</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={scene.pauseAfterSeconds}
                        onChange={(e) => handleUpdateScene(idx, { pauseAfterSeconds: parseFloat(e.target.value) || 0 })}
                        className="w-12 text-xs rounded border border-border bg-surface-sunken px-1 py-0.5"
                      />
                      <span>s</span>
                    </div>

                    {/* Action Buttons */}
                    <Button size="sm" variant="ghost" onClick={() => handlePlaySingleScene(idx)} title="Play this scene">
                      <Play size={12} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleMoveScene(idx, "up")} disabled={idx === 0}>
                      <ChevronUp size={12} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleMoveScene(idx, "down")} disabled={idx === scenes.length - 1}>
                      <ChevronDown size={12} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDuplicateScene(idx)} title="Duplicate scene">
                      <Copy size={12} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteScene(idx)} className="text-danger hover:text-danger">
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>

                {/* Scene Textarea */}
                <textarea
                  rows={3}
                  value={scene.text}
                  onChange={(e) => handleUpdateScene(idx, { text: e.target.value })}
                  placeholder="Enter dialogue or narration for this speaker scene…"
                  className="w-full rounded-lg border border-border bg-surface-sunken p-2.5 text-xs text-text leading-relaxed focus:outline-none focus:border-primary"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Section */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-text flex items-center gap-2">
          <Download size={16} className="text-primary" /> Export Studio Project
        </h3>
        <p className="text-xs text-text-muted">
          Export your complete multi-speaker sequence to configuration files, speaker scripts, or synchronized subtitles.
        </p>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <Button size="sm" variant="secondary" onClick={() => handleExportProject("script")}>
            <FileText size={14} className="mr-1" /> Speaker Script (.txt)
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleExportProject("json")}>
            JSON Project Config
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleExportProject("srt")}>
            SRT Subtitles
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleExportProject("vtt")}>
            WebVTT Subtitles
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="h-96 rounded-xl border border-border bg-surface-sunken animate-pulse" />}>
      <StudioContent />
    </Suspense>
  );
}
