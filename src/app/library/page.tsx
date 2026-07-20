"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Search, 
  Trash2, 
  Archive, 
  Copy, 
  Edit3, 
  FileText, 
  Tag, 
  Download, 
  Upload,
  ArrowRight,
  Database,
  CheckSquare,
  Square,
  AlertTriangle
} from "lucide-react";
import { 
  listLibraryItems, 
  saveLibraryItem, 
  deleteLibraryItem, 
  exportAllData, 
  importAllData, 
  clearAllData,
  getStorageUsage,
  type LibraryItem 
} from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export default function LibraryPage() {
  const router = useRouter();
  
  // Data list states
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "document" | "draft" | "archived">("all");

  // Selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Storage usage states
  const [storageUsed, setStorageUsed] = useState<number | null>(null);
  const [storageQuota, setStorageQuota] = useState<number | null>(null);

  // Edit / Action states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const allItems = await listLibraryItems();
      setItems(allItems);
      
      const usage = await getStorageUsage();
      setStorageUsed(usage.usedBytes);
      setStorageQuota(usage.quotaBytes);
    } catch (err) {
      console.error("Failed to load library data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadData();
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === "archived") {
        if (!item.archived) return false;
      } else {
        if (item.archived) return false;
        if (activeTab !== "all" && item.type !== activeTab) return false;
      }

      // Tag filter
      if (selectedTag && (!item.tags || !item.tags.includes(selectedTag))) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesContent = item.content.toLowerCase().includes(query);
        return matchesTitle || matchesContent;
      }

      return true;
    });
  }, [items, activeTab, selectedTag, searchQuery]);

  // Aggregate all unique tags from active items
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    items.forEach((item) => {
      if (!item.archived && item.tags) {
        item.tags.forEach((t) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [items]);

  // Open item in workspace/reader
  const handleOpenItem = (item: LibraryItem) => {
    if (item.type === "draft") {
      // Handoff draft back to editor by writing to stashed text in local storage
      if (typeof window !== "undefined") {
        localStorage.setItem("vk-stash", item.content);
        router.push("/tool");
      }
    } else {
      router.push(`/reader?id=${item.id}`);
    }
  };

  // Archive / Unarchive
  const handleToggleArchive = async (item: LibraryItem) => {
    const updated: LibraryItem = {
      ...item,
      archived: !item.archived,
      updatedAt: Date.now(),
    };
    await saveLibraryItem(updated);
    loadData();
  };

  // Delete Item
  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document? This action is irreversible.")) return;
    await deleteLibraryItem(id);
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });
    loadData();
  };

  // Duplicate Item
  const handleDuplicateItem = async (item: LibraryItem) => {
    const duplicate: LibraryItem = {
      ...item,
      id: crypto.randomUUID(),
      title: `${item.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveLibraryItem(duplicate);
    loadData();
  };

  // Start renaming
  const startRename = (item: LibraryItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  // Save rename
  const handleSaveRename = async (item: LibraryItem) => {
    if (!editTitle.trim()) return;
    const updated: LibraryItem = {
      ...item,
      title: editTitle.trim(),
      updatedAt: Date.now(),
    };
    await saveLibraryItem(updated);
    setEditingId(null);
    loadData();
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
      }
      return copy;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((item) => item.id)));
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedIds.size} selected documents?`)) return;
    
    for (const id of Array.from(selectedIds)) {
      await deleteLibraryItem(id);
    }
    setSelectedIds(new Set());
    loadData();
  };

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0) return;
    for (const id of Array.from(selectedIds)) {
      const item = items.find((x) => x.id === id);
      if (item) {
        await saveLibraryItem({
          ...item,
          archived: true,
          updatedAt: Date.now(),
        });
      }
    }
    setSelectedIds(new Set());
    loadData();
  };

  const handleBulkUnarchive = async () => {
    if (selectedIds.size === 0) return;
    for (const id of Array.from(selectedIds)) {
      const item = items.find((x) => x.id === id);
      if (item) {
        await saveLibraryItem({
          ...item,
          archived: false,
          updatedAt: Date.now(),
        });
      }
    }
    setSelectedIds(new Set());
    loadData();
  };

  // Export data
  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `voicekit-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  // Import data
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        await importAllData(text);
        alert("Backup imported successfully!");
        loadData();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        alert(`Backup import failed: ${msg}`);
      }
    };
    reader.readAsText(file);
  };

  // Clear Database
  const handleClearAll = async () => {
    await clearAllData();
    setShowClearConfirm(false);
    loadData();
  };

  // Helper formatting for bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* Library Header */}
      <header className="border-b bg-surface py-6 px-6 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" /> Workspace Library
            </h1>
            <p className="text-xs text-text-muted">Manage your documents, local speech drafts, and audio clips.</p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Export */}
            <Button variant="ghost" size="sm" onClick={handleExportData} title="Export backup file">
              <Download className="mr-1 h-4 w-4" /> Export Backup
            </Button>
            
            {/* Import */}
            <label className="inline-flex items-center justify-center rounded-md font-semibold text-xs border border-border bg-surface hover:bg-surface-sunken h-9 px-3 cursor-pointer select-none">
              <Upload className="mr-1.5 h-4 w-4" /> Import Backup
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>

            {/* Clear All */}
            <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(true)} className="text-error hover:bg-error/10 border border-error/20">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Library Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Left Side: Filter Options */}
        <section className="w-full md:w-60 space-y-6 shrink-0">
          {/* Quick Tabs */}
          <div className="bg-surface border rounded-xl p-3 space-y-1">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2 mb-2">Filters</h3>
            {[
              { id: "all", label: "All Items", icon: BookOpen },
              { id: "document", label: "Documents", icon: FileText },
              { id: "draft", label: "Speech Drafts", icon: Edit3 },
              { id: "archived", label: "Archived", icon: Archive },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as "all" | "document" | "draft" | "archived");
                    setSelectedTag(null); // clear tag filter on tab switch
                  }}
                  className={cn(
                    "w-full text-left rounded-md px-3 py-2 text-xs font-semibold flex items-center gap-2 transition-colors",
                    activeTab === tab.id
                      ? "bg-primary text-on-primary font-bold"
                      : "text-text hover:bg-surface-sunken"
                  )}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tags cloud */}
          {allTags.length > 0 && (
            <div className="bg-surface border rounded-xl p-4 space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Filter by Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-semibold border transition-all",
                      selectedTag === tag
                        ? "bg-primary border-primary text-on-primary font-bold"
                        : "border-border text-text hover:bg-surface-sunken"
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Local Storage details */}
          <div className="bg-surface border rounded-xl p-4 space-y-2 text-xs text-text-muted">
            <h3 className="font-bold flex items-center gap-1.5 text-text">
              <Database className="h-4 w-4 text-primary" /> Local Storage Estimate
            </h3>
            {storageUsed !== null && storageQuota !== null ? (
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span className="font-mono">{formatBytes(storageUsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Quota:</span>
                  <span className="font-mono">{formatBytes(storageQuota)}</span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-primary h-1.5 rounded-full" 
                    style={{ width: `${Math.min(100, (storageUsed / storageQuota) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="italic text-[10px]">Calculating storage quota...</p>
            )}
          </div>
        </section>

        {/* Right Side: Documents List */}
        <section className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Search bar & selection toggle */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by title or text content..."
                className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-xs focus:border-primary focus:outline-none"
              />
            </div>
            {filteredItems.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleToggleSelectAll}
                className="border shrink-0 text-xs"
              >
                {selectedIds.size === filteredItems.length ? "Deselect All" : "Select All"}
              </Button>
            )}
          </div>

          {/* Bulk actions ribbon */}
          {selectedIds.size > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between z-10 shrink-0">
              <span className="text-xs text-primary font-semibold">
                {selectedIds.size} items selected
              </span>
              <div className="flex items-center gap-2">
                {activeTab !== "archived" ? (
                  <Button variant="ghost" size="sm" onClick={handleBulkArchive} className="text-primary hover:bg-primary/10 py-1 px-2.5 text-xs">
                    <Archive className="mr-1 h-3.5 w-3.5" /> Archive
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={handleBulkUnarchive} className="text-primary hover:bg-primary/10 py-1 px-2.5 text-xs">
                    <Archive className="mr-1 h-3.5 w-3.5" /> Unarchive
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleBulkDelete} className="text-error hover:bg-error/10 py-1 px-2.5 text-xs">
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          )}

          {/* Library Cards Canvas */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
            {loading ? (
              <div className="text-center py-20 text-text-muted space-y-2">
                <BookOpen className="h-8 w-8 animate-pulse mx-auto text-primary" />
                <p className="text-xs">Loading items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="border border-dashed rounded-xl p-16 text-center text-text-muted space-y-4">
                <BookOpen className="h-12 w-12 mx-auto text-border-strong" />
                <h3 className="font-bold text-sm text-text">No library items found</h3>
                <p className="text-xs max-w-sm mx-auto">
                  {searchQuery.trim() || selectedTag
                    ? "Adjust your filters or query search keywords."
                    : "Upload files (.txt, .md, .pdf, .docx, .epub) in the main Workspace dropzone to add them here."}
                </p>
                <Button onClick={() => router.push("/tool")} size="sm">
                  Go to Workspace
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const isEditing = editingId === item.id;
                  
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "border rounded-xl p-4 bg-surface flex flex-col justify-between transition-all hover:shadow-md",
                        isSelected ? "border-primary ring-1 ring-primary" : "border-border"
                      )}
                    >
                      {/* Card Header */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <button
                            onClick={() => handleToggleSelect(item.id)}
                            className="text-text-muted hover:text-primary shrink-0"
                            title={isSelected ? "Deselect" : "Select"}
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4.5 w-4.5 text-primary" />
                            ) : (
                              <Square className="h-4.5 w-4.5" />
                            )}
                          </button>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                              item.type === "document" && "bg-blue-500/10 text-blue-500",
                              item.type === "draft" && "bg-green-500/10 text-green-500",
                              item.type === "project" && "bg-purple-500/10 text-purple-500"
                            )}>
                              {item.type}
                            </span>
                            {item.archived && (
                              <span className="bg-yellow-500/10 text-yellow-600 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                                Archived
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title inline rename */}
                        {isEditing ? (
                          <div className="flex gap-1 items-center mb-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 bg-surface-sunken border border-primary px-2 py-1 rounded text-sm focus:outline-none"
                              autoFocus
                            />
                            <Button size="sm" onClick={() => handleSaveRename(item)}>Save</Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <h4 
                            onClick={() => handleOpenItem(item)}
                            className="font-bold text-sm cursor-pointer hover:text-primary transition-colors line-clamp-1 flex-1"
                          >
                            {item.title}
                          </h4>
                        )}

                        {/* Excerpt */}
                        <p className="text-[11px] text-text-muted line-clamp-2 mt-1 mb-3 select-none">
                          {item.content}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="border-t pt-3 flex items-center justify-between mt-auto">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {item.tags && item.tags.slice(0, 2).map((t) => (
                            <span key={t} className="text-[9px] font-semibold text-text-muted bg-surface-sunken border px-1.5 py-0.5 rounded-full">
                              #{t}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenItem(item)} className="h-7 px-2 text-xs" title="Open and read">
                            Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => startRename(item)} className="h-7 w-7 p-0" title="Rename inline">
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDuplicateItem(item)} className="h-7 w-7 p-0" title="Duplicate copy">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleArchive(item)} className="h-7 w-7 p-0 text-text-muted" title={item.archived ? "Restore from Archive" : "Archive"}>
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)} className="h-7 w-7 p-0 text-error hover:bg-error/10" title="Delete forever">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Confirmation Modals */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-surface border rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-error">
              <AlertTriangle className="h-8 w-8" />
              <h3 className="font-bold text-lg text-text">Clear All Database?</h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              This will erase all documents, tags, custom presets, speech history, and settings from this browser permanently. This action cannot be undone.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
              <Button onClick={handleClearAll} className="bg-error hover:bg-error-strong text-white border-error">
                Delete Everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
