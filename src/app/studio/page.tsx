"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Video, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Play, 
  Pause, 
  Square,
  Music, 
  Save, 
  Sliders, 
  FolderClosed, 
  FileAudio
} from "lucide-react";
import { 
  getLibraryItem, 
  saveLibraryItem, 
  listLibraryItems, 
  type LibraryItem 
} from "@/lib/storage";
import { useSpeechEngine } from "@/hooks/useSpeechEngine";
import { useVoices } from "@/hooks/useVoices";
import { Button } from "@/components/ui/Button";
import { segmentText } from "@/lib/speech/segment";
import { cn } from "@/lib/cn";

interface SceneBlock {
  id: string;
  text: string;
  voiceURI: string | null;
  rate: number;
  pitch: number;
  volume: number;
  pauseAfterSeconds: number;
}

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("id");

  const [project, setProject] = useState<LibraryItem | null>(null);
  const [title, setTitle] = useState("Untitled Voice Project");
  const [scenes, setScenes] = useState<SceneBlock[]>([
    {
      id: crypto.randomUUID(),
      text: "Welcome to Voice Studio. This is your first scene block.",
      voiceURI: null,
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      pauseAfterSeconds: 1.0,
    }
  ]);

  // Background Music States
  const [bgMusicFile, setBgMusicFile] = useState<File | null>(null);
  const [bgMusicName, setBgMusicName] = useState<string>("");
  const [bgMusicVolume, setBgMusicVolume] = useState<number>(0.3);
  const [bgMusicLoop, setBgMusicLoop] = useState<boolean>(true);
  const [bgMusicDuck, setBgMusicDuck] = useState<number>(60); // 60% ducking by default

  // Playback Sequencer States
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number | null>(null);
  
  // Library load list for dropdowns
  const [projectsList, setProjectsList] = useState<LibraryItem[]>([]);

  // References
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentSceneIndexRef = useRef<number | null>(null);
  const playingTimelineRef = useRef<boolean>(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { engine, snapshot } = useSpeechEngine();
  const { voices } = useVoices();

  // Keep references in sync for async callbacks
  useEffect(() => {
    currentSceneIndexRef.current = currentSceneIndex;
  }, [currentSceneIndex]);

  useEffect(() => {
    playingTimelineRef.current = isPlayingTimeline;
  }, [isPlayingTimeline]);

  // Load project details if specified
  useEffect(() => {
    async function loadProject() {
      try {
        const list = await listLibraryItems();
        setProjectsList(list.filter((x) => x.type === "project"));

        if (projectId) {
          const item = await getLibraryItem(projectId);
          if (item && item.type === "project") {
            setProject(item);
            setTitle(item.title);
            if (item.scenes && item.scenes.length > 0) {
              setScenes(item.scenes);
            }
            if (item.backgroundMusic) {
              setBgMusicName(item.backgroundMusic.fileName);
              setBgMusicVolume(item.backgroundMusic.volume);
              setBgMusicLoop(item.backgroundMusic.loop ?? true);
              setBgMusicDuck(item.backgroundMusic.duckPercent ?? 60);
              
              if (item.backgroundMusic.audioBlob) {
                // Reconstruct File from Blob
                const file = new File(
                  [item.backgroundMusic.audioBlob], 
                  item.backgroundMusic.fileName, 
                  { type: "audio/mpeg" }
                );
                setBgMusicFile(file);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load project details:", err);
      }
    }
    loadProject();
  }, [projectId]);

  // Build audio elements for background music
  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current = null;
    }

    if (bgMusicFile) {
      const url = URL.createObjectURL(bgMusicFile);
      const audio = new Audio(url);
      audio.loop = bgMusicLoop;
      audio.volume = bgMusicVolume;
      bgAudioRef.current = audio;

      return () => {
        audio.pause();
        URL.revokeObjectURL(url);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgMusicFile, bgMusicLoop]);

  // Dynamic background music volume ducking based on speech engine status
  useEffect(() => {
    if (!bgAudioRef.current) return;
    
    if (snapshot.status === "speaking" && isPlayingTimeline) {
      // Duck background music
      const duckFactor = (100 - bgMusicDuck) / 100;
      bgAudioRef.current.volume = bgMusicVolume * duckFactor;
    } else {
      // Restore normal background music volume
      bgAudioRef.current.volume = bgMusicVolume;
    }
  }, [snapshot.status, isPlayingTimeline, bgMusicVolume, bgMusicDuck]);

  // Timeline Sequential Speech Loop
  const playScene = (index: number) => {
    if (index >= scenes.length) {
      // Finished all scenes!
      handleStopTimeline();
      return;
    }

    setCurrentSceneIndex(index);
    const scene = scenes[index];
    const voice = voices.find((v) => v.voiceURI === scene.voiceURI) || null;
    
    // Segment scene text
    const segmented = segmentText(scene.text);
    engine.setSentences(segmented.sentences);
    engine.setSettings({
      voice,
      rate: scene.rate,
      pitch: scene.pitch,
      volume: scene.volume,
    });

    // Start playing the scene
    engine.playSentence(0);
  };

  // Connect engine completed callbacks to seq timeline player
  useEffect(() => {
    engine.setCallbacks({
      onComplete: () => {
        if (!playingTimelineRef.current) return;
        const currentIdx = currentSceneIndexRef.current;
        if (currentIdx === null) return;
        
        const scene = scenes[currentIdx];
        
        // Wait for pause duration before playing next scene
        if (scene.pauseAfterSeconds > 0) {
          pauseTimeoutRef.current = setTimeout(() => {
            playScene(currentIdx + 1);
          }, scene.pauseAfterSeconds * 1000);
        } else {
          playScene(currentIdx + 1);
        }
      },
      onStopped: () => {
        // If stopped externally (like by clicking pause button in floating bar or key binds)
        if (playingTimelineRef.current && snapshot.status === "idle") {
          handleStopTimeline();
        }
      }
    });

    return () => {
      engine.setCallbacks({});
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes, voices]);

  // Play Timeline
  function handlePlayTimeline() {
    if (scenes.length === 0) return;
    setIsPlayingTimeline(true);
    
    if (bgAudioRef.current) {
      bgAudioRef.current.play().catch(err => console.log("Audio play blocked:", err));
    }
    
    const startIndex = currentSceneIndex !== null ? currentSceneIndex : 0;
    playScene(startIndex);
  }

  // Pause Timeline
  function handlePauseTimeline() {
    setIsPlayingTimeline(false);
    engine.stop();
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
    }
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
  }

  // Stop Timeline
  function handleStopTimeline() {
    setIsPlayingTimeline(false);
    setCurrentSceneIndex(null);
    engine.stop();
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.currentTime = 0;
    }
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
  }

  // Timeline Operations
  const handleAddScene = () => {
    const newScene: SceneBlock = {
      id: crypto.randomUUID(),
      text: "",
      voiceURI: selectedVoiceForNewScene(),
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      pauseAfterSeconds: 1.0,
    };
    setScenes([...scenes, newScene]);
  };

  const selectedVoiceForNewScene = (): string | null => {
    // Default to the last configured voice in standard settings if possible
    if (scenes.length > 0) {
      return scenes[scenes.length - 1].voiceURI;
    }
    return null;
  };

  const handleDeleteScene = (id: string) => {
    if (scenes.length <= 1) return; // Keep at least 1 scene block
    setScenes(scenes.filter((x) => x.id !== id));
  };

  const handleDuplicateScene = (scene: SceneBlock) => {
    const idx = scenes.findIndex((x) => x.id === scene.id);
    const copy: SceneBlock = {
      ...scene,
      id: crypto.randomUUID(),
    };
    const updated = [...scenes];
    updated.splice(idx + 1, 0, copy);
    setScenes(updated);
  };

  const handleMoveScene = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === scenes.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...scenes];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setScenes(updated);
  };

  const updateSceneField = (id: string, field: keyof SceneBlock, value: string | number | null) => {
    setScenes(scenes.map((scene) => {
      if (scene.id === id) {
        return { ...scene, [field]: value };
      }
      return scene;
    }));
  };

  // Background Music handlers
  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert("Music file is larger than 15 MB limit. Please use a smaller track.");
        return;
      }
      setBgMusicFile(file);
      setBgMusicName(file.name);
    }
  };

  const handleRemoveMusic = () => {
    setBgMusicFile(null);
    setBgMusicName("");
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current = null;
    }
  };

  // Compile final text for document outline compatibility
  const compiledText = useMemo(() => {
    return scenes.map((s) => s.text).join("\n\n");
  }, [scenes]);

  const handleSaveProject = async () => {
    const item: LibraryItem = {
      id: projectId || crypto.randomUUID(),
      type: "project",
      title: title.trim() || "Untitled Voice Project",
      content: compiledText,
      scenes,
      backgroundMusic: bgMusicName ? {
        fileName: bgMusicName,
        volume: bgMusicVolume,
        duckPercent: bgMusicDuck,
        loop: bgMusicLoop,
        audioBlob: bgMusicFile || undefined,
      } : null,
      createdAt: project?.createdAt || Date.now(),
      updatedAt: Date.now(),
      archived: project?.archived || false,
      tags: project?.tags || [],
    };

    try {
      await saveLibraryItem(item);
      alert("Project saved successfully!");
      if (!projectId) {
        router.push(`/studio?id=${item.id}`);
      } else {
        setProject(item);
      }
    } catch (err) {
      console.error("Failed to save project:", err);
      alert("Failed to save project locally. Storage may be full.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* Studio Header */}
      <header className="border-b bg-surface py-5 px-6 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/library")} title="Back to Library">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-0.5">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-bold text-lg bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none w-64 md:w-96"
                placeholder="Enter Project Title"
              />
              <p className="text-[10px] text-text-muted flex items-center gap-1.5">
                <span>{scenes.length} scene blocks</span>
                <span>•</span>
                <span>Type: Timeline Audio Project</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSaveProject} size="sm" className="bg-primary hover:bg-primary-strong">
              <Save className="mr-1.5 h-4 w-4" /> Save Project
            </Button>
          </div>
        </div>
      </header>

      {/* Workspace Dashboard */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left Side: Timeline Blocks */}
        <section className="flex-1 flex flex-col min-h-0 overflow-y-auto space-y-4 pr-1">
          <div className="flex items-center justify-between border-b pb-2 shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Scenes Timeline</h3>
            <Button variant="ghost" size="sm" onClick={handleAddScene} className="text-primary hover:bg-primary/10 py-1 text-xs">
              <Plus className="mr-1 h-4 w-4" /> Add Scene Block
            </Button>
          </div>

          {scenes.map((scene, index) => {
            const isActive = currentSceneIndex === index && isPlayingTimeline;
            
            return (
              <div
                key={scene.id}
                className={cn(
                  "border rounded-xl p-4 bg-surface transition-all flex gap-3 relative",
                  isActive ? "border-primary shadow-lg ring-1 ring-primary" : "border-border"
                )}
              >
                {/* Timeline position badge */}
                <div className="flex flex-col items-center gap-2">
                  <span className={cn(
                    "flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold",
                    isActive ? "bg-primary text-on-primary" : "bg-surface-sunken text-text-muted"
                  )}>
                    {index + 1}
                  </span>
                  
                  {/* Reorder Up/Down */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMoveScene(index, "up")}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-surface-sunken disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleMoveScene(index, "down")}
                      disabled={index === scenes.length - 1}
                      className="p-1 rounded hover:bg-surface-sunken disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Block Fields */}
                <div className="flex-1 space-y-3">
                  <textarea
                    value={scene.text}
                    onChange={(e) => updateSceneField(scene.id, "text", e.target.value)}
                    placeholder="Enter script text for this scene..."
                    className="w-full bg-transparent border-none focus:outline-none text-sm placeholder:text-text-muted resize-y min-h-[60px]"
                  />

                  {/* Settings row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t pt-3 text-xs">
                    {/* Voice selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-muted uppercase">Speaker Voice</label>
                      <select
                        value={scene.voiceURI || ""}
                        onChange={(e) => updateSceneField(scene.id, "voiceURI", e.target.value || null)}
                        className="w-full rounded border bg-surface px-2 py-1 focus:border-primary text-xs"
                      >
                        <option value="">Default Local Voice</option>
                        {voices.map((v) => (
                          <option key={v.voiceURI} value={v.voiceURI}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Speed rate */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-muted uppercase flex justify-between">
                        <span>Speed</span>
                        <span className="font-mono font-bold text-primary">{scene.rate.toFixed(1)}x</span>
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="3.0"
                        step="0.1"
                        value={scene.rate}
                        onChange={(e) => updateSceneField(scene.id, "rate", parseFloat(e.target.value))}
                        className="w-full vk-slider"
                      />
                    </div>

                    {/* Pitch */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-muted uppercase flex justify-between">
                        <span>Pitch</span>
                        <span className="font-mono font-bold text-primary">{scene.pitch.toFixed(1)}</span>
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={scene.pitch}
                        onChange={(e) => updateSceneField(scene.id, "pitch", parseFloat(e.target.value))}
                        className="w-full vk-slider"
                      />
                    </div>

                    {/* Trail Pause seconds */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-muted uppercase">Pause After (s)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={scene.pauseAfterSeconds}
                        onChange={(e) => updateSceneField(scene.id, "pauseAfterSeconds", Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full rounded border bg-surface px-2 py-1 focus:border-primary font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Operations Ribbon */}
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateScene(scene)}
                    className="h-7 w-7 p-0 hover:bg-surface-sunken"
                    title="Duplicate block"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={scenes.length <= 1}
                    onClick={() => handleDeleteScene(scene.id)}
                    className="h-7 w-7 p-0 text-error hover:bg-error/10 disabled:opacity-35"
                    title="Delete block"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </section>

        {/* Right Side: Music & Project list */}
        <section className="w-full lg:w-80 space-y-6 shrink-0">
          {/* Background Music Mix */}
          <div className="bg-surface border rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Music className="h-4 w-4 text-primary" /> Background Music Overlay
            </h3>

            {bgMusicName ? (
              <div className="border rounded-lg p-3 bg-background space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate max-w-[180px]">
                    <FileAudio className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-semibold truncate font-mono">{bgMusicName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveMusic}
                    className="text-error hover:bg-error/10 h-7 w-7 p-0"
                    title="Remove music track"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Mix Volume slider */}
                <div className="space-y-1 border-t pt-2">
                  <div className="flex items-center justify-between text-[10px] text-text-muted font-bold">
                    <span>Music Volume</span>
                    <span className="font-mono">{Math.round(bgMusicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.05"
                    value={bgMusicVolume}
                    onChange={(e) => {
                      setBgMusicVolume(parseFloat(e.target.value));
                      if (bgAudioRef.current) {
                        bgAudioRef.current.volume = parseFloat(e.target.value);
                      }
                    }}
                    className="w-full vk-slider"
                  />
                </div>

                {/* Ducking settings */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-text-muted font-bold">
                    <span>Speech Ducking</span>
                    <span className="font-mono">{bgMusicDuck}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={bgMusicDuck}
                    onChange={(e) => setBgMusicDuck(parseInt(e.target.value, 10))}
                    className="w-full vk-slider"
                  />
                  <span className="text-[9px] text-text-muted block">Reduces music volume by {bgMusicDuck}% during speech.</span>
                </div>

                {/* Loop toggle */}
                <div className="flex items-center justify-between border-t pt-2 text-[10px]">
                  <span className="font-bold text-text-muted uppercase">Loop audio</span>
                  <input
                    type="checkbox"
                    checked={bgMusicLoop}
                    onChange={(e) => setBgMusicLoop(e.target.checked)}
                    className="h-3.5 w-3.5 rounded text-primary focus:ring-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="border border-dashed rounded-lg p-6 text-center space-y-3 bg-background">
                <Music className="h-8 w-8 mx-auto text-text-muted animate-pulse" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold">Upload Music Track</p>
                  <p className="text-[10px] text-text-muted">Supports MP3 / WAV (Max 15MB)</p>
                </div>
                <label className="inline-flex items-center justify-center rounded-md font-semibold text-xs border border-border bg-surface hover:bg-surface-sunken h-8 px-3 cursor-pointer select-none">
                  Select Audio
                  <input type="file" accept=".mp3,.wav" onChange={handleMusicUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>

          {/* Saved Projects list */}
          {projectsList.length > 0 && (
            <div className="bg-surface border rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <FolderClosed className="h-4 w-4 text-primary" /> Load Saved Project
              </h3>
              <div className="max-h-40 overflow-y-auto space-y-1 text-xs">
                {projectsList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => router.push(`/studio?id=${p.id}`)}
                    className={cn(
                      "w-full text-left rounded px-2.5 py-1.5 transition-colors truncate block font-medium",
                      p.id === projectId
                        ? "bg-primary/10 text-primary font-bold"
                        : "hover:bg-surface-sunken"
                    )}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Floating Timeline Control Bar */}
      <footer className="shrink-0 border-t bg-surface/85 backdrop-blur-md p-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 shadow-2xl">
        <div className="flex items-center gap-2">
          {isPlayingTimeline ? (
            <Button onClick={handlePauseTimeline} className="bg-primary hover:bg-primary-strong">
              <Pause className="mr-1.5 h-4 w-4" /> Pause Timeline
            </Button>
          ) : (
            <Button onClick={handlePlayTimeline} className="bg-primary hover:bg-primary-strong">
              <Play className="mr-1.5 h-4 w-4" /> Play Timeline
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleStopTimeline} className="border" title="Stop & Reset">
            <Square className="h-4 w-4" />
          </Button>
        </div>

        {/* Spoken timeline progress details */}
        {isPlayingTimeline && currentSceneIndex !== null && (
          <div className="text-xs text-primary font-semibold flex items-center gap-2 animate-pulse">
            <Sliders className="h-4 w-4" />
            <span>Speaking scene {currentSceneIndex + 1} of {scenes.length}...</span>
          </div>
        )}

        <div className="text-xs text-text-muted font-mono font-bold">
          {scenes.length} scene blocks • BGM: {bgMusicName ? "Loaded" : "None"}
        </div>
      </footer>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background text-text">
        <div className="text-center space-y-4">
          <Video className="h-10 w-10 animate-pulse mx-auto text-primary" />
          <p className="text-sm text-text-muted">Initializing Voice Studio...</p>
        </div>
      </div>
    }>
      <StudioContent />
    </Suspense>
  );
}
